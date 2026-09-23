// @ts-check

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightBlog from 'starlight-blog';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	// Change this if you rename the repository. For a repo named
	// `<user>.github.io` this is all you need; for any other repo name you must
	// also set `base: '/<repo-name>/'`.
	site: 'https://nabongs2.github.io',
	// The floating bar at the bottom of the dev server. Dev-only either way —
	// it never shipped to the built site — but it gets in the way while
	// checking layouts.
	devToolbar: { enabled: false },
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
				// Diagrams in the posts are wider than the content column; this
				// lets a reader open one full size instead of squinting.
				starlightImageZoom(),
				// Fails the build on a broken internal link. Only runs on `astro
				// build`, so it never gets in the way while writing.
				starlightLinksValidator({
					// The validator only knows about pages that exist as files, and
					// the blog plugin generates its listings at build time. These
					// paths are real; everything under them is still checked.
					exclude: ['/blog/', '/en/blog/'],
				}),
			],
			// Both starlight-blog and starlight-image-zoom want to override
			// MarkdownContent, and each backs off if the slot is taken — so one
			// silently loses. This override takes the slot and layers both.
			components: {
				MarkdownContent: './src/components/MarkdownContent.astro',
				// Nothing else claims the slot below the article, so wrapping
				// Starlight's own footer is all the comment box needs.
				Footer: './src/components/Footer.astro',
			},
			// Reshapes the blog plugin's flat tag list into a category tree.
			routeMiddleware: './src/routeData.ts',
			// Our own overrides on top of Starlight's defaults.
			customCss: ['./src/styles/custom.css'],
			// Starlight ships Korean UI strings; this only covers what it doesn't.
			editLink: undefined,
			lastUpdated: true,
			pagination: true,
		}),
	],
});
