import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { categoryTree, uiStrings } from './categories';

type SidebarEntry = StarlightRouteData['sidebar'][number];

/**
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
