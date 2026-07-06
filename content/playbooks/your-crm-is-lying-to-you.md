---
title: "Your CRM is lying to you"
description: "The AI pipeline I use to rebuild a B2B contact list that's actually true: official registries first, cheap models to discover, a different model to verify, and a hard recency rule that does the real work."
date: 2026-07-06
draft: false
---

Last year I rebuilt a prospect database for a manufacturing business. Of the 190 named contacts they were holding, 110 were still in their jobs. The rest had moved on, retired, or never held the role in the first place. Nobody knew, because a CRM never admits it's wrong. It just sits there, confidently out of date, until a salesperson opens a call with the name of someone who left in 2023.

That project turned into a repeatable process, and I've since run versions of it for two different businesses in different markets. This is the whole thing, written up so you can run it yourself. You'll need an AI assistant that can write and run code (I use Claude), a free API key from your national company registry, and a weekend the first time. After that, refreshes take an afternoon.

## The principles before the pipeline

The tools will change within a year. These won't.

**The official registry is your source of truth.** In the UK that's Companies House; most countries have an equivalent. It tells you two things no scraped website can: whether the company still legally exists, and who its current directors are. It's free, it's authoritative, and almost nobody selling "data enrichment" starts there. Start there.

**Every name carries three tags: a source, a date, and a confidence level.** A contact without a source URL and an "as of" date is a rumour. This one rule is most of the value of the whole exercise, because it turns "we have 2,000 contacts" into "we have 1,400 contacts we can defend and 600 we know to distrust."

**AI discovers, a different AI verifies.** When I let one model search the web for buyers and decision-makers, roughly a third of what came back was wrong. Not useless, but wrong in instructive ways: job titles from press releases three years old, and people with the same name at different companies. The fix that worked was a second, unrelated model doing its own fresh search on every candidate, with instructions to reject anyone it can't confirm.

**A hard recency rule does the real work.** Here's the failure mode that surprised me: two different models reading the same stale article will both happily believe it, so the second opinion alone can't catch staleness. A rule can. Mine is simple. A contact is only "confirmed" if the verifying model found evidence dated within the last twelve months. Anything older gets marked uncertain, no matter how confident the models feel.

**Pilot before you scale.** I ran the first 25 companies end to end, audited every record by hand, and only then ran the remaining six hundred. The pilot caught problems (one website's team page produced 98 phantom "employees") that would have been very expensive to discover at full scale.

## The pipeline, in five stages

**Stage one: pull the registry baseline.** For every company on your list, fetch its registry record: legal status and current directors. This immediately kills the dead companies (you will find some; we found dissolved companies sitting in an active prospect list) and gives you a spine of verified, current humans. Directors aren't always the buyer, but they're real, and for owner-led businesses they often are the buyer.

**Stage two: read their websites.** Have your assistant fetch each company's site and pull the team, about, and contact pages. A cheap model extracts names, roles, phone numbers, and general email addresses from the text. Expect over-extraction; cap how many people you take per company and treat all of it as unverified input for the next stage, not as results.

**Stage three: discover wide with cheap models.** For each company, run a handful of targeted web searches (who runs procurement, who runs engineering or operations, any recent news) and let an inexpensive model synthesise candidates from the results. Cheap matters here because this stage is volume: hundreds of companies, several searches each. I used free-tier open models for all of it. One warning from experience: free search tiers have hourly caps, so build the runner to pause and resume rather than assuming it can sprint through six hundred companies in one go.

**Stage four: verify with a different model, then apply the recency rule.** Every candidate who isn't a registry-confirmed director gets independently re-searched by a model from a different family, which must find its own current evidence for the person in the role. Then the twelve-month rule sorts everyone into confirmed or uncertain. On my last run this two-model approach came out measurably cleaner than single-model discovery (78% verified-correct against 67%) and found dozens of real buyers the more expensive single-model pass had missed. Only the uncertain names at high-value accounts go to a stronger model for a tie-break, which keeps the expensive tokens down to a fifth of the list.

**Stage five: make it usable, or nobody will use it.** The deliverable is a short working list a human can act on, not the database behind it. For the accounts worth calling this quarter, generate a card per account: the named buyer with source and date, a likely direct email inferred from the company's address pattern (and marked as inferred, never presented as fact), and one recent, sourced reason to be in touch this month rather than someday. On the project that started all this, that final list was 41 accounts out of 624 companies. The other 583 aren't wasted; they're scored, tagged, and waiting their turn.

## What this produced

From one messy export and a pile of PDFs: 624 verified companies, 2,750 named people every one of which carries a source, a date, and a confidence level, and a 41-account call-ready list with a named buyer and a fresh opening line each. The sales team's first reaction was relief that someone had finally told them which of their existing contacts were dead.

## The traps

**Never overwrite the client's own data.** Enrich blanks, add new columns, and flag where every value came from. The moment your pipeline silently replaces something a human typed, trust in the whole file dies.

**Never ship unverified AI-found names.** It is tempting, because the discovery stage produces so much so fast. A third of it is wrong. One embarrassing email to a person who left years ago costs more goodwill than the whole clean list earns.

**Watch for systematic bias, not just individual errors.** When I had a model score companies against an ideal-customer rubric, an audit of a 30-company sample showed it was consistently over-grading one whole category of business. The fix was rewording the rubric and re-running everything, not correcting thirty rows by hand. Audit samples, fix causes.

**Mind the money.** Running a frontier model over everything cost me about 30,000 tokens per company on the first full pass. The cheap-discover, cheap-verify, escalate-rarely version does the same job mostly on free tiers. The expensive model is for judgment calls, not for reading web pages.

## Where to start

Take 25 companies from your own CRM. Pull their registry records, check which of your stored contacts still appear anywhere current, and tag every name with source, date, and confidence. That's one afternoon with an AI assistant, and it will tell you your real number, the percentage of your database that's still true. Mine was 58%. Yours will be worse than you think.

*The verification pattern here (independent second model plus a hard evidence-dated rule) is general. I now use it for anything AI researches on my behalf, not just contacts.*
