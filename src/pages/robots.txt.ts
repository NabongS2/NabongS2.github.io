import type { APIContext } from 'astro';

// Generated rather than kept in `public/` so the sitemap URL follows whatever
// `site` is set to in astro.config.mjs.
export function GET({ site }: APIContext) {
	const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site)}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
