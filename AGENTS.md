# muscatazzopardi.com — repo instructions

Personal, purely educational site of Richard Muscat Azzopardi. Astro 5,
static output, deployed to Cloudflare Pages. This file travels with every
Claude Code (and AGENTS.md-reading) session that touches this repo.

## Design law — in priority order

1. `C:/Claude/RMA/Site/design-constitution-web.md` — the web-specific
   addendum (themes, tokens, chrome, layout, motion, accessibility).
2. `C:/claude/design-system.md` — the parent personal design system
   (Direction C/CL: Inter Tight + JetBrains Mono, two themes, the grammar
   rules) that the addendum translates to the web.

Where the addendum is silent, the design system governs. Where the two
conflict on web-specific matters, the addendum wins.

**Match the shipped design. Do not invent.** The approved mocks —
`C:/Claude/RMA/Site/mock-v3-home.html` and
`C:/Claude/RMA/Site/mock-v3-essay.html` — are the ground truth for markup,
class names, and pixel-level layout. If a new page or component isn't
covered by a mock, extend the existing grammar (tokens, spacing scale,
type scale, the artboard vocabulary) rather than introducing a new visual
idea. When in doubt, re-read the constitution before shipping a new
pattern.

Grammar absolutes, restated because they get violated first under
deadline pressure: no border-radius, no box-shadow, no gradients, no
icons, no emoji, JetBrains Mono for chrome (nav/dates/captions/labels),
Inter Tight for content, exactly one `--acid` accent moment per page,
`--acid2` is structural only, `--seal` (`#C0341D`) wordmark box is
constant across both themes, hairlines never box content, square ends
everywhere. Fonts load from `src/styles/fonts.css` against local files in
`public/fonts/` — never a font CDN in production.

## Writing law

Every piece of public-facing prose on this site — essay bodies, playbook
copy, page copy, meta descriptions, OG titles, the llms.txt summary — must
pass `C:/claude/writing-guide-no-llm-tells.md` before it ships. This is
not optional and does not need to be asked for. In short: no em-dash
overuse, no "it's not X, it's Y" contrast pairs, no neat rule-of-three
padding, no dramatic one-sentence paragraphs, none of the banned words
(navigate, landscape, leverage, holistic, robust, seamless, delve,
nuanced, bespoke, and the rest of the list in the guide), vary sentence
length inside paragraphs, and prefer specifics — names, numbers, dates —
over abstractions. Run the guide's mechanical checklist before treating a
draft as final.

## The thesis word

**Kindness.** The site's spine is "growth and kindness are not a
trade-off" (Home thesis line, set in display type with "kindness" as the
page's one `--acid` moment). Every piece of writing should be consistent
with that thesis, or at least not contradict it. Don't reach for a
synonym in copy that's meant to echo the thesis — the word is kindness,
not decency, niceness, or compassion.

## The never-showcase rule

This site never names a client and never showcases client work. No case
studies, no logos, no "results we got for X." **No client name, past or
present, may appear anywhere in this repo** — not in copy, not in code
comments, not in commit messages, not in filenames. (Richard knows which
engagement prompted this rule; this file deliberately does not record
it.) Richard's expertise is demonstrated through
open-sourced methodology instead: essays that explain how he thinks, and
Playbooks — practical frameworks (like the 20-Point Commercial Analysis)
that readers can run on their own businesses with zero reference to who
they were built for. If a draft essay or playbook edges toward describing
a real, identifiable engagement, generalize it before it ships.

## How to add an essay

1. Create `src/content/writing/<slug>.md` with frontmatter:
   ```yaml
   ---
   title: "Sentence-case title"
   description: "One or two sentences, used as the meta description and RSS summary."
   date: 2026-07-05
   draft: true
   ---
   ```
2. Write the body in Markdown, first person, Rik's voice. Run it against
   the writing guide before flipping `draft` to `false`.
3. Set `draft: false` when it's ready to publish. Draft entries are
   excluded from the writing index, the RSS feed, and OG generation.
4. Run `python scripts/generate-og.py` to render its OG card to
   `public/og/<slug>.png` (skips anything still marked `draft: true`).
5. `npm run build` and spot-check the rendered page and its social card
   before deploying.

Playbooks follow the identical process in `src/content/playbooks/`
instead — same schema, same script, same draft gate.

## Voice

First person throughout. He signs off as **Rik** in prose, but appears as
**Richard Muscat Azzopardi** in page titles, bylines, and schema/meta
tags. Warm, direct, specific — see the writing guide's section 6 for what
his voice sounds like in practice (self-correction in parentheses, naming
what he's against concretely, earning short sentences after longer
build-up, no hedging).

## Stack notes

- Astro 5, static output (`astro build` → `dist/`), Cloudflare Pages
  target.
- Content collections: `writing` and `playbooks`, both glob-loaded
  Markdown with the shared schema in `src/content.config.ts`
  (`title`, `description`, `date`, `draft`).
- `BaseLayout.astro` handles theme (dark/light via `data-theme`, default
  `prefers-color-scheme`), nav, flag bar, footer, and OG/meta tags. Pass
  it `ogImage="/og/<slug>.png"` from any page with its own social card;
  it falls back to `/og/default.png` otherwise.
- See `README-DEPLOY.md` for the full deploy runbook.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
