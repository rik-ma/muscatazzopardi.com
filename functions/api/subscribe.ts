// functions/api/subscribe.ts
//
// Cloudflare Pages Function — POST /api/subscribe
// JSON body: { email: string, company?: string }  (company is a honeypot field)
// Also accepts application/x-www-form-urlencoded posts from the no-JS
// fallback (the newsletter form's native action) and answers those with a
// minimal HTML page instead of JSON.
//
// Storage: Cloudflare KV, binding name SUBSCRIBERS. Key = lowercased email,
// value = JSON { ts: ISO 8601 string, source: 'site' }.
//
// On each genuinely new subscriber, notifies Richard by email (Resend, reusing
// the contact form's RESEND_API_KEY / CONTACT_TO / CONTACT_FROM). Best-effort
// via waitUntil, so it never delays or fails the subscriber's request.
//
// If the SUBSCRIBERS binding isn't configured (e.g. local dev without
// `wrangler.toml` KV setup, or a preview deploy without the binding attached),
// this fails gracefully with 501 rather than throwing — the newsletter form
// degrades to a clear inline error instead of a crash.
//
// TODO (double opt-in): this endpoint currently records a single-opt-in
// subscription. Before sending to this list for real, add a confirmation
// step: on signup, generate a token, store { ts, source, confirmed: false,
// token }, and email a confirm link (e.g. via Resend) that PATCHes the
// record to confirmed: true. Only export confirmed rows for sends.
//
// Local export flow (md-files-not-backend, per design-constitution-web.md §10):
// this Function is the only "backend." There is no database to browse.
// To turn KV into the subscribers.md that the send script reads, run the
// wrangler commands documented in scripts/export-subscribers.md — they list
// all keys in the SUBSCRIBERS namespace and fetch each value, which a local
// script then folds into markdown.

interface Env {
  SUBSCRIBERS?: KVNamespace;
  // Reused from the contact form: notify Richard on each new subscriber.
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface SubscribeBody {
  email?: string;
  company?: string; // honeypot — real visitors never fill this in
}

interface Outcome {
  status: number;
  ok: boolean;
  message: string; // written for humans; doubles as the no-JS page copy
  newSubscriber?: string; // set to the email only when a genuinely NEW row was stored
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Minimal confirmation/error page for no-JS form posts. Deliberately plain:
// paper, ink, one link home. No fonts are loaded to keep it a single response.
function htmlPage(message: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Newsletter — Richard Muscat Azzopardi</title>
</head>
<body style="background:#0A0A0A;color:#F4F2EC;font-family:system-ui,sans-serif;line-height:1.6;padding:3rem 1.5rem;">
<p style="max-width:34rem;margin:0 0 1.5rem 0;">${message}</p>
<p style="max-width:34rem;margin:0;"><a href="/" style="color:#F4F2EC;">Back to the homepage</a></p>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function subscribe(body: SubscribeBody, env: Env): Promise<Outcome> {
  // Honeypot: bots fill every field, including ones hidden from humans.
  // Pretend success so the bot doesn't learn to skip this field next time.
  if (body.company) {
    return { status: 200, ok: true, message: 'Done.' };
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
    return {
      status: 400,
      ok: false,
      message: 'That doesn’t look like a valid email address.',
    };
  }
  const email = rawEmail.toLowerCase();

  if (!env.SUBSCRIBERS) {
    // Binding missing — most likely not configured on this environment yet.
    // Fail clearly rather than pretending the signup worked.
    return {
      status: 501,
      ok: false,
      message: 'The signup isn’t wired up yet. Try again in a day or two.',
    };
  }

  // Only a first-time email counts as new: skip the write if it's already
  // there (preserves the original signup timestamp) and don't re-notify.
  let isNew = false;
  try {
    const existing = await env.SUBSCRIBERS.get(email);
    if (!existing) {
      await env.SUBSCRIBERS.put(
        email,
        JSON.stringify({ ts: new Date().toISOString(), source: 'site' })
      );
      isNew = true;
    }
  } catch {
    return {
      status: 500,
      ok: false,
      message: 'Could not save your subscription. Try again in a moment.',
    };
  }

  return {
    status: 200,
    ok: true,
    message: 'Done. You’ll hear from me when there’s something worth reading.',
    newSubscriber: isNew ? email : undefined,
  };
}

// Best-effort notification to Richard when someone new subscribes. Runs after
// the response (via waitUntil), so a slow or failed Resend call never affects
// the subscriber. Silently no-ops if the email env vars aren't configured.
async function notifyNewSubscriber(email: string, env: Env): Promise<void> {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return;
  const from = env.CONTACT_FROM || 'Muscat Azzopardi site <onboarding@resend.dev>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [env.CONTACT_TO],
        subject: `New newsletter subscriber: ${email}`,
        text: `${email} just subscribed to the newsletter.\n\nWhen: ${new Date().toISOString()}\n\nThe full list lives in the SUBSCRIBERS KV namespace.`,
      }),
    });
  } catch {
    // Notification is best-effort; the subscription is already saved.
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const contentType = request.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  let body: SubscribeBody;
  if (isJson) {
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Malformed request.' }, 400);
    }
  } else {
    // No-JS fallback: the form posts application/x-www-form-urlencoded.
    try {
      const form = await request.formData();
      body = {
        email: (form.get('email') ?? '').toString(),
        company: (form.get('company') ?? '').toString(),
      };
    } catch {
      return htmlPage('That didn’t work. Head back and try again.', 400);
    }
  }

  const result = await subscribe(body, env);

  // Fire the notification after responding — doesn't delay or risk the signup.
  if (result.newSubscriber) {
    context.waitUntil(notifyNewSubscriber(result.newSubscriber, env));
  }

  if (!isJson) {
    return htmlPage(result.message, result.status);
  }
  return json(result.ok ? { ok: true } : { error: jsonError(result) }, result.status);
};

// Keep the JSON error contract the client script already understands:
// the missing-binding case stays the literal code 'not configured'; other
// errors pass their human-readable message through.
function jsonError(result: Outcome): string {
  return result.status === 501 ? 'not configured' : result.message;
}

// Any method other than POST gets an explicit 405 with an Allow header
// (onRequestPost takes precedence for POST).
export const onRequest: PagesFunction = async () => {
  return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
};
