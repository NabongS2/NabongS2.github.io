// @ts-check

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
	// Change this if you rename the repository. For a repo named
	// `<user>.github.io` this is all you need; for any other repo name you must
	// also set `base: '/<repo-name>/'`.
	site: 'https://nabongs2.github.io',
	integrations: [
		starlight({
			title: {
				ko: '나봉 개발 블로그',
				en: "Nabong's Dev Blog",
			},
			description: '풀스택 웹개발자의 개발 기록과 삽질 노트.',
			// Korean is served from `/`, English from `/en/`.
			defaultLocale: 'root',
			locales: {
				root: { label: '한국어', lang: 'ko' },
				en: { label: 'English', lang: 'en' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/NabongS2' }],
			plugins: [
				starlightBlog({
					title: {
						ko: '블로그',
						en: 'Blog',
					},
					authors: {
						nabong: {
							name: 'nabong',
							url: 'https://github.com/NabongS2',
						},
					},
				}),
			],
			// Our own overrides on top of Starlight's defaults.
			customCss: ['./src/styles/custom.css'],
			// Starlight ships Korean UI strings; this only covers what it doesn't.
			editLink: undefined,
			lastUpdated: true,
			pagination: true,
		}),
	],
});
