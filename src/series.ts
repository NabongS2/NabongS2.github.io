import { getDocsById } from './og';

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
	ko: { label: '시리즈', prev: '이전 편', next: '다음 편' },
	en: { label: 'Series', prev: 'Previous part', next: 'Next part' },
} as const;

export interface SeriesPart {
	id: string;
	title: string;
	href: string;
	current: boolean;
}

/**
 * The series a page belongs to and the parts a reader can actually open, in
 * reading order. Shared by the contents box at the top of a post and the
 * previous/next-part box at the bottom, so the two can never disagree.
 *
 * Returns undefined for a page outside any series.
 */
export async function getSeriesParts(
	id: string,
	locale: string | undefined,
): Promise<{ series: Series; parts: SeriesPart[] } | undefined> {
	const prefix = locale ? `${locale}/` : '';

	// `en/blog/redis-basics` and `blog/redis-basics` are the same post to a series.
	const baseId = locale ? id.slice(prefix.length) : id;

	const series = seriesList.find((candidate) => candidate.posts.includes(baseId));
	if (!series) return undefined;

	const docs = await getDocsById();

	const parts = series.posts.flatMap((postId) => {
		const entry = docs.get(postId);
		if (!entry) {
			throw new Error(`시리즈에 적힌 ${postId} 가 없다. src/series.ts 를 고칠 것.`);
		}

		/*
		  A draft has no page in a production build, so linking to one would be a
		  dead link — the link validator fails the build on those, which is the
		  behaviour we want. In dev the drafts are there, so they're listed.
		*/
		if (import.meta.env.PROD && entry.data.draft) return [];

		return [
			{
				id: postId,
				// The translation if there is one, the original otherwise — which is
				// what the page at that URL will show.
				title: (docs.get(`${prefix}${postId}`) ?? entry).data.title,
				href: `/${prefix}${postId}/`,
				current: postId === baseId,
			},
		];
	});

	return { series, parts };
}
