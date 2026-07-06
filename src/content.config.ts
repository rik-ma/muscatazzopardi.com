import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entrySchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
});

// Content lives in the top-level ./content folder so it's easy to edit
// directly. Essays and playbooks below are the LIVE source — edit the .md,
// tell Claude, and a rebuild+deploy ships the change. (Page prose in
// ./content/pages is edit-then-sync; see content/README.md.)
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/essays' }),
  schema: entrySchema,
});

const playbooks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/playbooks' }),
  schema: entrySchema,
});

export const collections = { writing, playbooks };
