# Deploying muscatazzopardi.com — runbook

Static Astro site on Cloudflare Pages, **direct-upload** deploy (not
git-connected — see AGENTS.md "Deployment and Git" for why). GitHub is
backup/history only and is not involved in deploying.

## STATUS (July 2026)

DONE: Cloudflare auth, Pages project `muscatazzopardi` created, KV
namespace `SUBSCRIBERS` created + bound, `RESEND_API_KEY` secret set,
`CONTACT_TO`/`CONTACT_FROM` vars set, site deployed and live at
`https://muscatazzopardi.pages.dev`, contact form + newsletter both
tested working, repo pushed to GitHub (`rik-ma/muscatazzopardi.com`).

STILL OUTSTANDING: custom-domain cutover (step 5), Web Analytics token
(step 8), Search Console + Bing (step 9). These wait on Richard's go.

## The routine deploy (this is all you normally need)

```
npm run build
npx wrangler pages deploy dist --project-name muscatazzopardi --branch main --commit-dirty=true
git add -A && git commit -m "..." && git push   # backup to GitHub
```

If an essay/playbook was added or renamed, run
`python scripts/generate-og.py` before the build so its OG card exists.

---

Everything below is one-off setup. Steps 1–4, 6, 7 are already done and
recorded here for reference / disaster recovery.

## 1. Log in to Cloudflare  ✅ done

```
npx wrangler login
```

## 2. Create the Pages project  ✅ done

```
npx wrangler pages project create muscatazzopardi --production-branch main
```

## 3. Build  ✅ (routine)

```
npm run build
```

Outputs the static site to `dist/`.

## 4. Deploy  ✅ (routine — see "The routine deploy" above)

```
npx wrangler pages deploy dist --project-name muscatazzopardi --branch main --commit-dirty=true
```

Prints a `*.pages.dev` URL. Currently live at
`https://muscatazzopardi.pages.dev`.

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

Only `RESEND_API_KEY` is an encrypted secret (already set via
`wrangler pages secret put RESEND_API_KEY --project-name muscatazzopardi`).
`CONTACT_TO` and `CONTACT_FROM` are plain `[vars]` in `wrangler.toml`
(both `richard@muscatazzopardi.com`) and apply automatically on deploy —
they are not secrets and don't need dashboard entry. Pages captures
secrets at deploy time, so redeploy after changing `RESEND_API_KEY`.

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
