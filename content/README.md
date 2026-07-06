# Editing the site content

Everything you might want to reword lives in this one folder. Plain Markdown,
edit in any text editor. When you've changed something, just tell Claude what
you touched and it gets built and deployed.

## The three folders

### `essays/` — your writing (LIVE source)
The real essays. Each is one `.md` file. Editing here changes the actual site
(after a rebuild+deploy). Publishing is controlled by one line in each file's
header:

```
draft: true    → hidden from the site, the writing list, RSS, and search
draft: false   → published and live
```

Right now only `kindness.md` is `draft: false`. The other three are `draft: true`
so you can make them your own first. When one is ready, change its line to
`draft: false` (or just tell Claude "publish the four-day-week essay").

To add a new essay: copy any existing file, rename it (the filename becomes the
web address, e.g. `buy-it-for-life.md` → `/writing/buy-it-for-life`), and write.

### `playbooks/` — your open-source methods (LIVE source)
Same rules as essays. Both current playbooks are published (`draft: false`).

### `pages/` — the fixed pages and shared text (EDIT-THEN-SYNC)
`home`, `about`, `now`, `contact`, plus `site.md`. These pages have design and
layout that plain Markdown can't fully carry (the big name, your portrait, the
form, the thesis line), so editing these files does **not** change the live site
by itself. Edit the prose, tell Claude, and it copies your words into the built
page and redeploys. Think of these as the readable master copy of the words.

`site.md` holds the text that appears across the whole site rather than on one
page: the **newsletter box** (now in the footer of every page), the footer
byline, the contact-form labels and messages, and the 404 page. This is where
you edit the subscription-box wording.

`contact.md` has two lines marked `[DEVIATION]` — small changes from your
original wording, explained inline, for you to keep or undo.

## The header block

The lines between the `---` fences at the top of each file are settings, not
body text. In essays and playbooks:

```
title:        the headline
description:  one or two sentences (used under the title, in search, and RSS)
date:         YYYY-MM-DD (controls ordering; newest first)
draft:        true or false
```

Leave the fences and keys in place; change the values.

## What Claude does when you say "I changed X"

1. Reads your edited file(s).
2. For essays/playbooks: rebuilds and deploys — your Markdown is the source.
3. For pages: ports the prose into the page layout, then rebuilds and deploys.
4. Runs everything past the writing guide and the design rules before it ships.
