import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { defineCollection, z } from 'astro:content';
import { blogSchema } from 'starlight-blog/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// Starlight's page schema, widened with the blog plugin's fields
		// (date, tags, authors, excerpt, draft).
		schema: docsSchema({ extend: (context) => blogSchema(context) }),
	}),
	// Starlight ships Korean UI strings of its own; this collection supplies the
	// ones it can't — the blog plugin only ships en, fr, de and it.
	i18n: defineCollection({
		loader: i18nLoader(),
		schema: i18nSchema({
			extend: z.record(z.string().startsWith('starlightBlog.'), z.string()),
		}),
	}),
};
