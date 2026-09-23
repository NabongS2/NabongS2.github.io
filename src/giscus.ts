/**
 * giscus — comments backed by GitHub Discussions.
 *
 * No server of our own: the comments live as discussions in this repository,
 * and readers post with their GitHub account. That also means a comment can be
 * moderated from GitHub like any other discussion.
 *
 * 저장소 쪽은 Discussions 를 켜고 giscus 앱을 설치하면 끝이다. 둘 중 하나라도
 * 빠지면 댓글창 자리에 giscus 가 오류를 띄운다.
 *
 * `category` 와 `categoryId` 를 비우면 아무것도 그리지 않는다. 댓글을 잠시
 * 내리고 싶을 때 컴포넌트를 떼지 않고 그 두 줄만 비우면 된다.
 *
 * `repoId` 와 `categoryId` 는 공개 식별자다. 비밀이 아니고, 그래서 저장소에
 * 그대로 적는다.
 */
export const giscus = {
	repo: 'NabongS2/NabongS2.github.io',
	repoId: 'R_kgDOUjEosw',
	/**
	 * Announcements — the category GitHub creates when Discussions is turned
	 * on. Its format is Announcement, which is the one that matters here: only
	 * the repository owner can open a discussion, so the only threads that
	 * exist are the ones giscus opens for a real post. Anyone can still reply.
	 */
	category: 'Announcements',
	categoryId: 'DIC_kwDOUjEos84DGMfG',
	/**
	 * One discussion per URL. Korean and English pages have different URLs and
	 * so get their own threads, which is what we want — the comments under a
	 * post are in the language the post was read in.
	 */
	mapping: 'pathname',
	/** Only match a discussion giscus itself created for this page. */
	strict: '1',
	reactionsEnabled: '1',
	emitMetadata: '0',
	inputPosition: 'top',
	loading: 'lazy',
} as const;

/** Whether the GitHub side has been set up. Until then nothing is rendered. */
export const giscusReady = giscus.category !== '' && giscus.categoryId !== '';
