import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entrySchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: entrySchema,
});

const playbooks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/playbooks' }),
  schema: entrySchema,
});

export const collections = { writing, playbooks };
