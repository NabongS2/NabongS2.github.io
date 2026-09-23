/**
 * Posts that are written to be read in order.
 *
 * Declared here rather than in each post's frontmatter, for the same reason
 * the category tree is: the thing being described — an order — belongs in one
 * place, not spread across the files it orders. Adding a part means adding one
 * line here and nothing to the post.
 *
 * Ids are the default-language ones (`blog/redis-basics`). The English pages
 * are found by prefixing the locale, and a part with no translation yet falls
 * back to the Korean title, which is what the page itself does.
 */
export interface Series {
	/** Shown next to the word 시리즈 at the top of every part. */
	label: { ko: string; en: string };
	/** Post ids in reading order. */
	posts: string[];
}

export const seriesList: Series[] = [
	{
		label: { ko: 'Redis', en: 'Redis' },
		posts: ['blog/redis-basics', 'blog/redis-docker', 'blog/redis-java'],
	},
];

export const seriesStrings = {
	ko: { label: '시리즈' },
	en: { label: 'Series' },
} as const;
