import { OGImageRoute } from 'astro-og-canvas';
import { getDocsById, ogFonts } from '../../og';

/*
  A social card per page, drawn at build time from the title and description.

  Only pages without a `cover` are here: `src/og.ts` sends those with one to the
  cover instead, so generating a card for them would be work nobody links to.
  Drafts are left out too — they aren't built for production, and their titles
  shouldn't be reachable at a guessable URL.
*/
const pages = Object.fromEntries(
	[...(await getDocsById()).values()]
		.filter((entry) => !entry.data.cover && !(import.meta.env.PROD && entry.data.draft))
		.map((entry) => [entry.id, entry.data]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
	pages,
	// The default turns a `src/pages/...` path into a slug; our keys are already
	// collection ids (`blog/redis-java`), so they only need the extension.
	getSlug: (id) => `${id}.png`,
	getImageOptions: (_id, page) => ({
		title: page.title,
		// `description` is the SEO line and always reads as a summary; `excerpt`
		// is the fallback because it's written for the same job on the list page.
		description: page.description ?? page.excerpt ?? '',
		// The same dark blue the site's accent sits on, so a shared link and the
		// page it opens look like the same place.
		bgGradient: [
			[17, 21, 33],
			[28, 38, 66],
		],
		border: { color: [47, 111, 208], width: 24, side: 'inline-start' },
		padding: 72,
		font: {
			title: {
				size: 62,
				lineHeight: 1.35,
				weight: 'Bold',
				families: ['Pretendard'],
				color: [255, 255, 255],
			},
			description: {
				size: 30,
				lineHeight: 1.55,
				families: ['Pretendard'],
				color: [160, 170, 190],
			},
		},
		// Korean titles render as empty boxes without this; the bundled default
		// only covers Latin.
		fonts: ogFonts,
	}),
});
