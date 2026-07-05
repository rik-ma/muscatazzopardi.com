# Deploying muscatazzopardi.com — 10-minute runbook

This is a static Astro site deploying to Cloudflare Pages. Run these steps
in order the first time; most of them are one-off setup.

## 1. Log in to Cloudflare

```
npx wrangler login
```

Opens a browser window to authorize Wrangler against the Cloudflare
account that will host the site.

## 2. Create the Pages project

```
npx wrangler pages project create muscatazzopardi
```

Accept the defaults (production branch `main` is fine even without a git
remote connected yet — deploys can be pushed directly with Wrangler).

## 3. Build

```
npm run build
```

Outputs the static site to `dist/`. Confirm it completed without errors
and that `dist/index.html` exists before deploying.

## 4. Deploy

```
npx wrangler pages deploy dist
```

Wrangler uploads `dist/` and prints a `*.pages.dev` preview URL. Open it
and click through Home, About, Writing, Playbooks, Now, and Contact
before moving on.

## 5. Hook up the custom domain

In the Cloudflare dashboard: **Pages → muscatazzopardi → Custom domains →
Set up a custom domain**, enter `muscatazzopardi.com` (and `www` if it
should redirect), and follow the DNS prompts. If the domain's nameservers
already point at Cloudflare this is close to instant; otherwise allow for
DNS propagation.

## 6. Create the KV namespace for newsletter subscribers

```
npx wrangler kv namespace create SUBSCRIBERS
```

Take the namespace ID Wrangler prints and bind it in **Pages →
muscatazzopardi → Settings → Functions → KV namespace bindings**:
variable name `SUBSCRIBERS`, namespace = the one just created. This is
what the newsletter signup Pages Function reads and writes.

## 7. Set secrets

In **Pages → muscatazzopardi → Settings → Environment variables**
(Production, and Preview if you want form testing on preview deploys to
work), add as **encrypted** secrets:

- `RESEND_API_KEY` — API key for the transactional email provider sending
  double-opt-in confirmations and the Contact page notification.
- `CONTACT_TO` — the email address that receives Contact form submissions
  (Richard's real address never appears in the site's HTML; it only lives
  here).

## 8. Enable Cloudflare Web Analytics

In **Analytics & Logs → Web Analytics**, add the site and copy the beacon
token. Paste it into the commented placeholder at the end of `<head>` in
`src/layouts/BaseLayout.astro`, then uncomment the `<script>` tag. This is
cookie-free, privacy-light analytics — no consent banner needed. Rebuild
and redeploy after editing.

## 9. Submit to search engines

- **Google Search Console** — add the property (domain or URL-prefix),
  verify via the DNS TXT record Cloudflare gives you, then submit
  `https://muscatazzopardi.com/sitemap-index.xml`.
- **Bing Webmaster Tools** — same idea; Bing also offers a one-click
  import from an already-verified Search Console property, which is
  faster than reverifying DNS.

## 10. Post-deploy checks

Confirm each of these on the live domain before calling it done:

- `https://muscatazzopardi.com/robots.txt` — loads, lists the AI crawlers,
  points `Sitemap:` at the right URL.
- `https://muscatazzopardi.com/llms.txt` — loads, canonical URLs resolve.
- `https://muscatazzopardi.com/rss.xml` — validates, lists only published
  (non-draft) essays.
- `https://muscatazzopardi.com/sitemap-index.xml` — loads.
- Paste one essay URL into LinkedIn's Post Inspector
  (https://www.linkedin.com/post-inspector/) and confirm its OG card
  renders the correct title, not the default name-only card. If it shows
  a stale card, LinkedIn is caching the old fetch — use the inspector's
  re-scrape option.

## Re-deploying after changes

Every subsequent deploy is just:

```
npm run build
npx wrangler pages deploy dist
```

If a new essay or playbook was added, run
`python scripts/generate-og.py` first so its OG card exists in
`public/og/` before the build picks it up.
