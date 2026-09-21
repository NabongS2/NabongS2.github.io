/**
 * The category tree shown in the blog sidebar.
 *
 * These are ordinary tags — the tree only decides how they're grouped in the
 * sidebar. A post carries its category and subcategory as tags:
 *
 *     tags:
 *       - 인프라
 *       - CI/CD
 *
 * A tag that isn't in this tree still gets its own page; it just lands in the
 * "기타" group at the bottom, which is the cue to file it properly here.
 */
export interface CategoryNode {
	/** Tag label as written in frontmatter, per language. */
	label: { ko: string; en: string };
	children?: { label: { ko: string; en: string } }[];
}

export const categoryTree: CategoryNode[] = [
	{
		label: { ko: '프론트엔드', en: 'Frontend' },
		children: [
			{ label: { ko: 'React', en: 'React' } },
			{ label: { ko: '상태 관리', en: 'State management' } },
			{ label: { ko: '스타일링', en: 'Styling' } },
		],
	},
	{
		label: { ko: '백엔드', en: 'Backend' },
		children: [
			{ label: { ko: 'Spring', en: 'Spring' } },
			{ label: { ko: 'API 설계', en: 'API design' } },
			{ label: { ko: 'Java', en: 'Java' } },
		],
	},
	{
		label: { ko: '데이터 설계', en: 'Data design' },
		children: [
			{ label: { ko: '스키마 설계', en: 'Schema design' } },
			{ label: { ko: '쿼리 튜닝', en: 'Query tuning' } },
			{ label: { ko: '트랜잭션', en: 'Transactions' } },
		],
	},
	{
		label: { ko: '인프라', en: 'Infrastructure' },
		children: [
			{ label: { ko: 'Docker', en: 'Docker' } },
			{ label: { ko: 'Linux', en: 'Linux' } },
			{ label: { ko: 'CI/CD', en: 'CI/CD' } },
		],
	},
	{
		label: { ko: '생각', en: 'Thoughts' },
		children: [
			{ label: { ko: '회고', en: 'Retrospective' } },
			{ label: { ko: '일하는 방식', en: 'How I work' } },
		],
	},
];

export const uiStrings = {
	ko: { categories: '카테고리', other: '기타' },
	en: { categories: 'Categories', other: 'Other' },
} as const;
