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

**Models check other models.** A single model researching the web gets roughly a third of its findings wrong, and it sounds just as sure about the wrong ones. The fix is structural: one cheap model discovers wide, a second model from a different family independently re-searches every candidate with instructions to assume it's wrong until proven, and a hard rule sorts the survivors. Models built differently tend to fail differently, so their errors don't overlap much.

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
    <div><span class="pbd-tag">Uncertain · low value</span><p class="pbd-note">dropped rather than risked</p></div>
  </div>
</div>

One thing took me a while to understand: the second model catches hallucinations, but it cannot catch staleness, because two models reading the same three-year-old press release will both believe it. The dated-evidence rule catches staleness. On a measured comparison the two-model version came out at 78% verified-correct against 67% for one model alone, and found dozens of real buyers the single pass had missed, while the expensive frontier model only ever saw the contested fifth of the list.

## Scoring: deciding who gets your time

A verified list still doesn't tell you who to call first, who to invite to dinner, or who to leave alone. That's a scoring job, and it's the layer most bought-in databases skip entirely.

It starts with an ideal customer profile written as something a machine can score, not a feeling. Take the profile you already carry in your head and turn it into a rubric: a short ladder of fit (no fit, possible, good) with the characteristics spelled out, and a 0 to 100 score behind it. The distinctions that matter most are the ones that need writing down, because they're the ones a model gets wrong when left to its own judgment. In one market the line that mattered was whether a company buys production work repeatedly or buys once through project intermediaries; two companies that looked identical on paper sat on opposite sides of it, and only one was worth a visit.

A cheap model scores every company against the rubric. The thresholds that turn scores into grades live in code, not in the model, so the labels mean the same thing on row 600 as on row 6. And fit alone still isn't priority, because a perfect-fit company you can't reach is worth less than a decent-fit company you can. So the fit score gets blended with two more ingredients before anything is ranked.

<div class="pbd">
  <div class="pbd-3col">
    <div>
      <span class="pbd-tag">Fit · 0&ndash;100</span>
      <p class="pbd-note">scored against the written rubric; grade thresholds applied in code, not left to the model's mood</p>
    </div>
    <div>
      <span class="pbd-tag">Route in</span>
      <p class="pbd-note">direct, gated behind an accreditation, buying through intermediaries, or controlled by an overseas parent</p>
    </div>
    <div>
      <span class="pbd-tag">Timing</span>
      <p class="pbd-note">live buying signals, plus geography where delivery is physical</p>
    </div>
  </div>
  <p class="pbd-blend">blended in code into one working priority</p>
  <ul class="pbd-buckets">
    <li>Work now</li>
    <li>Work next</li>
    <li>Qualify</li>
    <li>Background-track</li>
    <li>Leave alone</li>
  </ul>
</div>

Scoring is also where a model's systematic bias does the most damage, which is why the stratified audit sits here: a stronger model checks a sample before anything ships, and if it finds a slant, you fix the rubric and re-run rather than correcting rows by hand.

The useful part is that one scored list answers several different questions, each with its own weighting. Who gets a call this quarter weights fit and route. Who gets an invitation when you're in a city for one week weights geography and seniority; on the market-entry project below, a universe of 542 ranked targets produced a dinner shortlist of 28, and the scoring made the guest list rather than anyone's memory of who seemed important. Who gets the expensive deep-research treatment weights priority, so the model spend lands on accounts that can pay it back. The weights change with the question. The scored list underneath stays the same.

## The same setup, four other jobs

**A competitor certification map.** For a manufacturer deciding which accreditations to invest in: which certifications does every competitor hold, and which ones actually gate the contracts worth winning? The certifiers publish public registers, so the discipline is registries before claims, claims before inference. Every cell in the finished matrix carries a source, a date, and one of four evidence tiers, from registry-confirmed down to not-found. This used to be a month of consultant time. It ran in the background over a few days, for a few euros of model spend.

**Buying signals from public databases.** Static fit tells you who could buy; public data tells you when. Government planning databases record who just got consent to build, which for anyone supplying construction is a dated announcement of imminent spending. Public procurement portals record contract awards, and a fresh award means a winner standing up a supply chain. Filtering those feeds against a prospect list turned a database of 624 companies into a ranked call list of accounts with a live, sourced reason to talk this quarter.

**Mapping a market you're entering.** For a push into one US metro area, models enumerated the candidate universe and then every single name was verified against the company's own website and the person's own public profile before it counted. The starting material claimed hundreds of contacts; 66 turned out to be fabrications and were removed, and the number of people who were verifiably real, in role, and reachable went from 62 to 221. The unverified version of that list looked much healthier. Most of it would have bounced.

**Checking AI's homework.** The inverse job: when a model generates a plausible list of lookalike companies, treat it as raw ore. One batch of 42 AI-suggested firms survived verification as 27, once duplicates, private-equity acquisitions, offshore operations, and size-band violations were caught against live sources. Another batch of 43 came out as 22. Roughly a third evaporated when checked, the same third as everywhere else in this piece, and the reason nothing ships unverified.

And when there's no official registry to anchor on, the pattern still holds; you just swap the spine. For a market of US nonprofits, public IRS filings played the registry's role, and the same pipeline produced 3,351 verified organisations and around 2,500 named contacts with barely a frontier-model token spent.

## What it costs

The recurring bill for all of the above is about $20 a month in model subscriptions, a couple of dollars of search-API credit per full run, and frontier-model tokens only for the contested judgment calls, which the routing keeps to a small fraction. The real cost is the discipline: sources with dates, verification before shipping, an audit before delivery.

## Where to start

Pick the smallest version of your own question. Twenty-five companies from your CRM, checked against the company registry and the open web, every name tagged with a source, a date, and a confidence level. That's one afternoon, most of it running while you do something else, and it will tell you what percentage of your database is still true. Mine was 58%. Then ask what else you've been treating as unknowable. A lot of it is just sitting in public data.

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
  .pbd p.pbd-blend {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fgSoft);
    border-top: 1px solid color-mix(in srgb, var(--fgSoft) 20%, transparent);
    padding-top: 1.25rem;
    margin: 1.75rem 0 1.1rem 0;
  }
  .pbd-buckets {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 2rem;
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 1.0625rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--fg);
  }
  .pbd-buckets li:nth-child(n+3) { color: var(--fgSoft); font-weight: 400; }
  @media (max-width: 640px) {
    .pbd-3col, .pbd-2col { grid-template-columns: 1fr; }
  }
</style>
