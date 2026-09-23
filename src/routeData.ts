import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { categoryTree, uiStrings } from './categories';
import { getDocsById, openGraphImage } from './og';

/**
 * Whether this page is showing default-language content because its own
 * translation is missing.
 *
 * Neither `isFallback` nor the locale fields can tell us: the blog plugin hands
 * Starlight a synthetic id (`en/blog/docker-basics`) and locale for a file that
 * only exists as `blog/docker-basics`, so the route data looks translated.
 * Checking the id against the real files is the only honest signal.
 */
async function isUntranslated(id: string): Promise<boolean> {
	const docs = await getDocsById();
	if (docs.has(id)) return false;

	// Only a page whose default-language original exists is a fallback; anything
	// else (listings, tag pages) has no file behind it either way.
	const withoutLocale = id.split('/').slice(1).join('/');
	return withoutLocale.length > 0 && docs.has(withoutLocale);
}

type SidebarEntry = StarlightRouteData['sidebar'][number];

/**
 * Runs after every page is resolved, for two jobs: finishing the `<head>` (the
 * noindex on untranslated pages, the social card) and reshaping the sidebar.
 *
 * starlight-blog builds the blog sidebar in its own route middleware and lists
 * every tag in one flat "태그" group. This runs after it (`await next()`) and
 * swaps that group for a two-level "카테고리" tree, leaving the rest of the
 * sidebar — 전체 글, 최근 글, RSS — exactly as the plugin made it.
 *
 * Reshaping the data the plugin already produced keeps every link, count and
 * current-page highlight it computed, which overriding the Sidebar component
 * would have meant rebuilding by hand.
 */
export const onRequest = defineRouteMiddleware(async (context, next) => {
	await next();

	const { starlightRoute } = context.locals;

	/*
	  When a page has no translation, Starlight still builds it in the other
	  locale using the default-language content. There is no setting to turn that
	  off, so the page exists and search engines would otherwise index Korean
	  text as an English page — duplicate content in the wrong language.
	  Keeping it out of the index is the part we can control; the page itself
	  disappears once a real translation is added.
	*/
	if (starlightRoute.isFallback === true || (await isUntranslated(starlightRoute.id))) {
		starlightRoute.head.push({
			tag: 'meta',
			attrs: { name: 'robots', content: 'noindex, follow' },
		});
	}

	/*
	  Starlight writes og:title, og:description and twitter:card but never an
	  image, so every shared link rendered as an empty card — the twitter:card
	  value it does write, `summary_large_image`, promises one. Adding it here
	  rather than in `head` config is what lets the value depend on the page.
	*/
	const ogImage = await openGraphImage(starlightRoute.id, starlightRoute.locale, context.site);
	if (ogImage) {
		starlightRoute.head.push(
			{ tag: 'meta', attrs: { property: 'og:image', content: ogImage.url } },
			{ tag: 'meta', attrs: { name: 'twitter:image', content: ogImage.url } },
		);
		if (ogImage.alt) {
			starlightRoute.head.push({
				tag: 'meta',
				attrs: { property: 'og:image:alt', content: ogImage.alt },
			});
		}
		// Optional, but a crawler that has them can lay the card out before it
		// has finished downloading the image.
		if (ogImage.width && ogImage.height) {
			starlightRoute.head.push(
				{ tag: 'meta', attrs: { property: 'og:image:width', content: String(ogImage.width) } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: String(ogImage.height) } },
			);
		}
	}

	const lang = starlightRoute.locale === 'en' ? 'en' : 'ko';
	const strings = uiStrings[lang];

	const tagGroupIndex = starlightRoute.sidebar.findIndex(
		(entry) => entry.type === 'group' && isTagGroup(entry),
	);
	if (tagGroupIndex === -1) return;

	const tagGroup = starlightRoute.sidebar[tagGroupIndex];
	if (tagGroup?.type !== 'group') return;

	// Tag links look like "인프라 (1)"; match on the label before the count.
	const remaining = new Map<string, SidebarEntry>();
	for (const entry of tagGroup.entries) {
		if (entry.type === 'link') remaining.set(stripCount(entry.label), entry);
	}

	const groups: SidebarEntry[] = [];

	for (const node of categoryTree) {
		const parent = remaining.get(node.label[lang]);
		const children: SidebarEntry[] = [];

		for (const child of node.children ?? []) {
			const entry = remaining.get(child.label[lang]);
			if (entry) {
				children.push(entry);
				remaining.delete(child.label[lang]);
			}
		}

		// A category with no posts of its own and no populated children would
		// only be an empty row, so it isn't rendered at all.
		if (!parent && children.length === 0) continue;
		if (parent) remaining.delete(node.label[lang]);

		groups.push({
			type: 'group',
			label: parent ? parent.label : node.label[lang],
			entries: children,
			collapsed: !containsCurrentPage(parent, children),
			badge: undefined,
		});
	}

	// Anything tagged outside the tree still needs somewhere to live.
	if (remaining.size > 0) {
		const leftovers = [...remaining.values()];
		groups.push({
			type: 'group',
			label: strings.other,
			entries: leftovers,
			collapsed: !containsCurrentPage(undefined, leftovers),
			badge: undefined,
		});
	}

	starlightRoute.sidebar[tagGroupIndex] = {
		type: 'group',
		label: strings.categories,
		entries: groups,
		collapsed: false,
		badge: undefined,
	};
});

/** The plugin's tag group is the one whose links all point at `/tags/`. */
function isTagGroup(entry: SidebarEntry): boolean {
	if (entry.type !== 'group' || entry.entries.length === 0) return false;
	return entry.entries.every((child) => child.type === 'link' && child.href.includes('/tags/'));
}

/** `"인프라 (1)"` -> `"인프라"` */
function stripCount(label: string): string {
	return label.replace(/\s*\(\d+\)\s*$/, '');
}

/** Keeps the branch you're looking at open. */
function containsCurrentPage(parent: SidebarEntry | undefined, children: SidebarEntry[]): boolean {
	const isCurrent = (entry: SidebarEntry | undefined) =>
		entry?.type === 'link' && entry.isCurrent === true;
	return isCurrent(parent) || children.some(isCurrent);
}
