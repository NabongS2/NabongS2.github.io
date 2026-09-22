// concept/<주제>/src/**/*.svg 를 읽어 라이트·다크 SVG 와 PNG 를 만든다.
//
//   node concept/build-images.mjs            # 전부
//   node concept/build-images.mjs docker     # 주제 하나만
//
// 소스는 CSS 변수로 색을 쓰고 @media (prefers-color-scheme: dark) 로 다크값을 덮는다.
// 브라우저는 그대로 읽지만 PNG 를 뽑는 librsvg 는 변수를 못 읽어 전부 검게 나온다.
// 그래서 변수를 실제 색으로 바꾼 두 벌을 미리 만들어 둔다.
//
// SVG 는 주제 폴더에 남겨 index.html 로 훑어보고, PNG 는 글이 쓰는 자리로 바로 뱉는다.
// 사본을 두 벌 두면 그림을 고쳤을 때 한쪽만 옛것으로 남는다.
//
//   concept/docker/src/en/cover.svg
//     → concept/docker/en/cover-{light,dark}.svg
//     → src/assets/blog/docker/en/cover-{light,dark}.png

import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const conceptDir = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(conceptDir, '..', 'src', 'assets', 'blog');

/** `svg { --a:#111; --b:#222; }` 같은 블록에서 변수만 뽑는다. */
function readVars(block) {
	const out = {};
	for (const [, name, value] of block.matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)) {
		out[name] = value.trim();
	}
	return out;
}

function split(svg, where) {
	const media = svg.match(/@media \(prefers-color-scheme: dark\) \{\s*svg \{[^}]*\}\s*\}/);
	const base = svg.match(/svg \{[^}]*--[^}]*\}/);
	if (!media || !base) throw new Error(`${where}: 색 변수 블록을 찾지 못했다`);
	return {
		light: readVars(base[0]),
		dark: { ...readVars(base[0]), ...readVars(media[0]) },
		stripped: svg.replace(media[0], ''),
	};
}

function apply(svg, vars) {
	return svg.replace(/var\(--([\w-]+)\)/g, (whole, name) => vars[name] ?? whole);
}

/** 하위 폴더까지 훑는다. 폴더 구조는 생성물에도 그대로 이어진다. */
function svgFiles(dir, base = '') {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? svgFiles(join(dir, entry.name), join(base, entry.name))
			: entry.name.endsWith('.svg')
				? [join(base, entry.name)]
				: []
	);
}

const asked = process.argv.slice(2);
const topics = readdirSync(conceptDir, { withFileTypes: true })
	.filter((e) => e.isDirectory() && existsSync(join(conceptDir, e.name, 'src')))
	.map((e) => e.name)
	.filter((name) => asked.length === 0 || asked.includes(name));

if (topics.length === 0) {
	console.error(asked.length ? `주제를 찾지 못했다: ${asked.join(', ')}` : 'src/ 가 있는 주제 폴더가 없다');
	process.exit(1);
}

for (const topic of topics) {
	const srcDir = join(conceptDir, topic, 'src');

	for (const file of svgFiles(srcDir)) {
		const name = file.replace(/\.svg$/, '');
		const sub = dirname(file);
		const { light, dark, stripped } = split(readFileSync(join(srcDir, file), 'utf-8'), `${topic}/${file}`);

		mkdirSync(join(conceptDir, topic, sub), { recursive: true });
		mkdirSync(join(assetsDir, topic, sub), { recursive: true });

		for (const [theme, vars] of [['light', light], ['dark', dark]]) {
			const svg = apply(stripped, vars);
			writeFileSync(join(conceptDir, topic, `${name}-${theme}.svg`), svg, 'utf-8');
			await sharp(Buffer.from(svg), { density: 144 })
				.png()
				.toFile(join(assetsDir, topic, `${name}-${theme}.png`));
			console.log(`${topic}/${name}-${theme}`);
		}
	}
}
