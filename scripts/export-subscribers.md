# Exporting subscribers from KV

The site has no database. Signups from `functions/api/subscribe.ts` land in a
Cloudflare KV namespace bound as `SUBSCRIBERS` (key = lowercased email, value
= `{ ts, source }` JSON). This note is the manual pull step in the
md-files-not-backend flow: KV → `subscribers.md` → a local send script reads
that file plus the essay markdown and emails the list.

## 1. Find the namespace ID

```
npx wrangler kv namespace list
```

Look for the namespace bound to `SUBSCRIBERS` in `wrangler.toml` and copy its `id`.

## 2. List all subscriber keys

```
npx wrangler kv key list --namespace-id=<NAMESPACE_ID>
```

Returns a JSON array of `{ name, expiration? }` — `name` is the lowercased email.

## 3. Fetch each value

```
npx wrangler kv key get --namespace-id=<NAMESPACE_ID> "<email>"
```

Returns the stored `{ "ts": "...", "source": "site" }` for that key. Loop over
the key list above to pull every record (a short local script — Node, or
Claude Code itself — can drive `wrangler kv key list` and `wrangler kv key
get` in sequence and fold the results into `subscribers.md`).

## 4. Fold into subscribers.md

Each row: email, subscribed date (from `ts`), source. Keep the file in the
private repo, never in this public one — it's reader PII.

## Notes

- `--namespace-id` can be swapped for `--binding=SUBSCRIBERS --env=production`
  once the binding is confirmed in `wrangler.toml`, which is usually less
  error-prone than copy-pasting the raw ID.
- This is a single-opt-in list today. Once double opt-in ships (see the TODO
  in `functions/api/subscribe.ts`), filter the export to `confirmed: true`
  records only before sending anything.
