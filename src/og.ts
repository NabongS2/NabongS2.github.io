import { getImage } from 'astro:assets';
import { getCollection, type CollectionEntry } from 'astro:content';

type DocsEntry = CollectionEntry<'docs'>;

/**
 * Every page that exists as a file, keyed by id. Built once and reused —
 * `getCollection` is cheap after the first call, but the map isn't.
 */
let byId: Map<string, DocsEntry> | undefined;
export async function getDocsById(): Promise<Map<string, DocsEntry>> {
	byId ??= new Map((await getCollection('docs')).map((entry) => [entry.id, entry]));
	return byId;
}

/**
 * Pretendard, for drawing Korean into the social cards. astro-og-canvas takes
 * a URL here too, but a CDN in the build path means a deploy can fail on a
 * timeout that has nothing to do with the site — which is how this started.
 * The files are in the repo instead. Only the build reads them; they are never
 * served. SIL Open Font License, a copy of which sits beside them.
 */
export const ogFonts = ['./src/fonts/Pretendard-Bold.otf', './src/fonts/Pretendard-Regular.otf'];

/** The size astro-og-canvas draws at, and what crawlers expect. */
const OG_SIZE = { width: 1200, height: 630 };

export interface OpenGraphImage {
	/** Absolute URL, which is what crawlers require. */
	url: string;
	alt?: string;
	width?: number;
	height?: number;
}

/**
 * The image to advertise for a page, in three tiers:
 *
 *  1. the post's own `cover` — a real screenshot beats a generated card
 *  2. a generated card with the title on it, for pages that have no cover
 *  3. the locale's home card, for listing and tag pages that aren't files
 *
 * Tier 2 is built by `src/pages/og/[...route].ts`, which generates a card for
 * exactly the entries that reach this branch: the ones without a cover.
 */
export async function openGraphImage(
	id: string,
	locale: string | undefined,
	site: URL | undefined,
): Promise<OpenGraphImage | undefined> {
	if (!site) return undefined;

	const docs = await getDocsById();

	/*
	  A page with no translation is still built in the other locale from the
	  default-language file, under an id no file has (`en/blog/docker-basics`).
	  Falling back to the original's id gives those pages the right image.
	*/
	const entry = docs.get(id) ?? docs.get(id.split('/').slice(1).join('/'));

	const cover = entry?.data.cover;
	if (cover) {
		// One image or a light/dark pair; social cards are always the light one.
		const source = 'image' in cover ? cover.image : cover.light;

		// A remote cover is a plain string and Astro can't touch it, so it goes
		// out as written.
		if (typeof source === 'string') return { url: source, alt: cover.alt };

		/*
		  Covers are screenshots at whatever size they were taken. Capping the
		  width keeps the file inside what crawlers will download, and PNG is
		  used over WebP because Kakao and some other scrapers still ignore it.
		*/
		const image = await getImage({ src: source, format: 'png', width: 1200 });
		return {
			url: new URL(image.src, site).href,
			alt: cover.alt,
			width: typeof image.options.width === 'number' ? image.options.width : undefined,
			height: typeof image.options.height === 'number' ? image.options.height : undefined,
		};
	}

	/*
	  A home page is an ordinary entry, so listing and tag pages — which are no
	  file at all — can borrow the card generated for their locale's home.

	  Its id is the locale directory (`en/index.mdx` loads as `en`) because Astro
	  strips a trailing `/index`; the root `index.mdx` has no directory in front
	  of it and so keeps its name.
	*/
	const home = locale && docs.has(locale) ? locale : 'index';
	const target = entry?.id ?? home;

	return {
		url: new URL(`/og/${target}.png`, site).href,
		alt: (entry ?? docs.get(target))?.data.title,
		...OG_SIZE,
	};
}
