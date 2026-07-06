---
title: "The one-person data team"
description: "How an AI agent plus public data does the research you used to need analysts for: verified contact lists, competitor capability maps, and buying signals, built in the background while you work."
date: 2026-07-06
draft: false
---

There is a category of work every B2B business wants done and almost none can afford: research at scale. Which of the two thousand companies in your market are worth calling. Whether the contacts in your CRM still exist. Which certifications your competitors hold and which ones actually gate the work you want. Which prospects just got the planning consent or the contract award that means they're about to spend. Five years ago each of those was a data-team project with a data-team invoice. I now run all of them myself, in the background, while I do other work.

The setup is one tool and a habit. The tool is an AI agent that can write and run code on your machine (I use Claude Code; any serious equivalent works). The habit is pointing it at public data instead of asking it to know things. Everything in this playbook runs on that combination, and most of it runs on free tiers.

<div class="pbd">
  <div class="pbd-3col">
    <div>
      <span class="pbd-tag">Public sources</span>
      <ul class="pbd-list">
        <li>Company registries</li>
        <li>Certification registers</li>
        <li>Planning &amp; tender databases</li>
        <li>Nonprofit filings</li>
        <li>The open web</li>
        <li>Your own spreadsheets</li>
      </ul>
    </div>
    <div class="pbd-center">
      <span class="pbd-tag">The engine</span>
      <p class="pbd-node">An agent that writes and runs code</p>
      <p class="pbd-note">directing cheaper models for volume work, escalating judgment calls to better ones</p>
    </div>
    <div>
      <span class="pbd-tag">What comes out</span>
      <ul class="pbd-list">
        <li>Verified contact lists</li>
        <li>Competitor capability maps</li>
        <li>Buying-signal call lists</li>
        <li>Scored, sourced workbooks</li>
      </ul>
    </div>
  </div>
</div>

Two ideas make it work, and they matter more than any tool name.

**Code first, models for judgment only.** Most of this work is deterministic: fetching registry records, de-duplicating company names, filling spreadsheet columns, applying scoring thresholds. The agent writes ordinary scripts for all of that, which cost nothing to run at any scale. The language models get spent only where judgment is needed: is this person still in the role, does this company fit the profile, are these two records the same firm. On a recent run across 624 companies, the deterministic layer did most of the cell-filling before a model touched anything.

**Models check other models.** A single model researching the web gets roughly a third of its findings wrong, and confidently so. The fix is structural: one cheap model discovers wide, a second model from a different family independently re-searches every candidate with instructions to assume it's wrong until proven, and a hard rule sorts the survivors. Different architectures fail differently, which is the point. I'll come back to this, because it's the most reusable idea in here.

## Worked example: the contact list that was 42% dead

The project that turned this from experiment into habit: a manufacturing business with 190 named contacts in its CRM. We rebuilt the list and found only 110 still in their jobs. Nobody had lied; people had simply moved, and a CRM never admits it's out of date. The rebuild ran as a five-stage pipeline, and every stage generalises.

<div class="pbd">
  <ol class="pbd-stages">
    <li><span class="pbd-tag">01 · Registry</span><strong>Pull the official record.</strong><span>Legal status and current directors from the national company registry. Free, authoritative, kills dead companies on day one.</span></li>
    <li><span class="pbd-tag">02 · Read</span><strong>Fetch their websites.</strong><span>Team and contact pages, scraped by script, names extracted by a cheap model. Treated as unverified input, never as results.</span></li>
    <li><span class="pbd-tag">03 · Discover</span><strong>Search wide with cheap models.</strong><span>A few targeted web searches per company. Volume stage, so it runs on free tiers, paced to survive hourly rate caps.</span></li>
    <li><span class="pbd-tag">04 · Verify</span><strong>Cross-check with a different model.</strong><span>Fresh, adversarial re-search per candidate, then the recency rule. Only contested, high-value names reach an expensive model.</span></li>
    <li><span class="pbd-tag">05 · Deliver</span><strong>Make it usable.</strong><span>A working list a human can act on: named buyer, source, date, confidence, and one current reason to call this month.</span></li>
  </ol>
</div>

The output was 624 verified companies, 2,750 named people each carrying a source, a date, and a confidence level, and a 41-account call-ready list. Every rule in the pipeline exists because something went wrong without it: the pilot run of 25 companies caught a team page that produced 98 phantom employees; a sample audit caught the scoring model systematically over-grading one whole category of business, which we fixed in the rubric rather than row by row.

## The cross-check pattern

This is the piece I now use for anything AI researches on my behalf, not just contacts.

<div class="pbd">
  <div class="pbd-2col">
    <div>
      <span class="pbd-tag">Model A · Discoverer</span>
      <p class="pbd-node">Casts the widest possible net</p>
      <p class="pbd-note">cheap, high recall, wrong about a third of the time</p>
    </div>
    <div>
      <span class="pbd-tag">Model B · Verifier, different family</span>
      <p class="pbd-node">Re-searches every candidate from scratch</p>
      <p class="pbd-note">instructed to assume wrong until proven, reports the newest evidence date it found</p>
    </div>
  </div>
  <p class="pbd-gate">The recency gate: no dated evidence from the last twelve months means not confirmed</p>
  <div class="pbd-3col pbd-outcomes">
    <div><span class="pbd-tag">Confirmed</span><p class="pbd-note">ships, with source and date attached</p></div>
    <div><span class="pbd-tag">Uncertain · high value</span><p class="pbd-note">escalated to a frontier model for a tie-break</p></div>
    <div><span class="pbd-tag">Uncertain · low value</span><p class="pbd-note">dropped. Silence beats a wrong name</p></div>
  </div>
</div>

The subtlety worth stealing: the second model catches hallucinations, but it cannot catch staleness, because two models reading the same three-year-old press release will both believe it. The dated-evidence rule catches staleness. On a measured comparison the two-model version came out at 78% verified-correct against 67% for one model alone, and found dozens of real buyers the single pass had missed, while the expensive frontier model only ever saw the contested fifth of the list.

## The same setup, four other jobs

**A competitor certification map.** For a manufacturer deciding which accreditations to invest in: which certifications does every competitor hold, and which ones actually gate the contracts worth winning? The certifiers publish public registers, so the discipline is registries before claims, claims before inference. Every cell in the finished matrix carries a source, a date, and one of four evidence tiers, from registry-confirmed down to not-found. What used to be a consultant's month is a background run with a token budget smaller than a night out.

**Buying signals from public databases.** Static fit tells you who could buy; public data tells you when. Government planning databases record who just got consent to build, which for anyone supplying construction is a dated announcement of imminent spending. Public procurement portals record contract awards, and a fresh award means a winner standing up a supply chain. Filtering those feeds against a prospect list turned a database of 624 companies into a ranked call list of accounts with a live, sourced reason to talk this quarter.

**Mapping a market you're entering.** For a push into one US metro area, models enumerated the candidate universe and then every single name was verified against the company's own website and the person's own public profile before it counted. The starting material claimed hundreds of contacts; 66 turned out to be fabrications and were removed, and the number of people who were verifiably real, in role, and reachable went from 62 to 221. An unverified list would have looked three times better and performed three times worse.

**Checking AI's homework.** The inverse job: when a model generates a plausible list of lookalike companies, treat it as raw ore. One batch of 42 AI-suggested firms survived verification as 27, once duplicates, private-equity acquisitions, offshore operations, and size-band violations were caught against live sources. Another batch of 43 came out as 22. Roughly a third evaporates on contact with reality, which is exactly the discovery error rate again, and exactly why nothing ships unverified.

And when there's no official registry to anchor on, the pattern still holds; you just swap the spine. For a market of US nonprofits, public IRS filings played the registry's role, and the same pipeline produced 3,351 verified organisations and around 2,500 named contacts with barely a frontier-model token spent.

## What it costs

The recurring bill for all of the above is about $20 a month in model subscriptions, a couple of dollars of search-API credit per full run, and frontier-model tokens only for the contested judgment calls, which the routing keeps to a small fraction. The real cost is the discipline: sources with dates, verification before shipping, audits before delivery. That part doesn't come with the subscription.

## Where to start

Pick the smallest version of your own question. Twenty-five companies from your CRM, checked against the company registry and the open web, every name tagged with a source, a date, and a confidence level. That's one afternoon, most of it running while you do something else, and it will tell you what percentage of your database is still true. Mine was 58%. Then ask what else you've been treating as unknowable that is actually just sitting in public data, waiting for someone with an agent and an afternoon.

<style>
  /* Playbook diagrams — type, hairlines, and whitespace, per the design system.
     Colors ride the theme tokens, so one diagram serves dark and light. */
  .pbd {
    margin: 2.5rem 0;
    padding: 1.75rem 0;
    border-top: 1px solid color-mix(in srgb, var(--fgSoft) 20%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--fgSoft) 20%, transparent);
  }
  .pbd-tag {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--acid2);
    margin-bottom: 0.6rem;
  }
  .pbd p.pbd-node {
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 1.1875rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.015em;
    color: var(--fg);
    margin: 0 0 0.4rem 0;
  }
  .pbd p.pbd-note {
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--fgSoft);
    margin: 0;
  }
  .pbd-list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: var(--fg);
  }
  .pbd-list li { margin: 0 0 0.45rem 0; }
  .pbd-3col, .pbd-2col {
    display: grid;
    gap: 1.75rem 2.25rem;
  }
  .pbd-3col { grid-template-columns: 1fr 1.2fr 1fr; }
  .pbd-2col { grid-template-columns: 1fr 1fr; }
  .pbd-center { text-align: left; }
  .pbd-stages {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1.5rem;
  }
  .pbd-stages li {
    display: grid;
    gap: 0.15rem;
    padding-left: 1.25rem;
    border-left: 1px solid color-mix(in srgb, var(--fgSoft) 20%, transparent);
  }
  .pbd-stages .pbd-tag { margin-bottom: 0.25rem; }
  .pbd-stages strong {
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 1.1875rem;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--fg);
  }
  .pbd-stages span:not(.pbd-tag) {
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--fgSoft);
  }
  .pbd p.pbd-gate {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--paper);
    background: var(--acid);
    padding: 0.8em 1.1em;
    margin: 1.75rem 0;
  }
  .pbd-outcomes { margin-top: 0; }
  @media (max-width: 640px) {
    .pbd-3col, .pbd-2col { grid-template-columns: 1fr; }
  }
</style>
