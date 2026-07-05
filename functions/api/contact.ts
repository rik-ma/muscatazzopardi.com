// Cloudflare Pages Function — POST /api/contact
//
// Receives the Contact page form submission, validates it, checks the
// honeypot field, and sends the message via the Resend API. Richard's
// real address never appears in client-side HTML (see
// design-constitution-web.md §4 and §10) — it only lives here, as an
// environment variable on the Cloudflare Pages project.
//
// Required environment variables (set in the Cloudflare Pages dashboard,
// not committed to the repo):
//   RESEND_API_KEY  — API key from resend.com
//   CONTACT_TO      — the address messages should be forwarded to
//   CONTACT_FROM    — optional; a verified "from" address for Resend
//                      (defaults to Resend's onboarding sender if unset)
//
// If RESEND_API_KEY or CONTACT_TO are missing, the function responds with
// 501 so the site keeps working (and the form degrades gracefully) before
// the mailer is configured.

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — real visitors leave this blank
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

// Minimal confirmation/error page for no-JS form posts. Deliberately plain:
// paper, ink, one link back. No fonts are loaded to keep it a single response.
function htmlPage(message: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Get in touch — Richard Muscat Azzopardi</title>
</head>
<body style="background:#0A0A0A;color:#F4F2EC;font-family:system-ui,sans-serif;line-height:1.6;padding:3rem 1.5rem;">
<p style="max-width:34rem;margin:0 0 1.5rem 0;">${message}</p>
<p style="max-width:34rem;margin:0;"><a href="/contact" style="color:#F4F2EC;">Back to the contact page</a></p>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const contentType = request.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  let payload: ContactPayload;
  if (isJson) {
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }
  } else {
    // No-JS fallback: the form posts application/x-www-form-urlencoded.
    try {
      const form = await request.formData();
      payload = {
        name: (form.get('name') ?? '').toString(),
        email: (form.get('email') ?? '').toString(),
        message: (form.get('message') ?? '').toString(),
        company: (form.get('company') ?? '').toString(),
      };
    } catch {
      return htmlPage('That didn’t work. Head back and try again.', 400);
    }
  }

  const respond = (jsonBody: Record<string, unknown>, message: string, status: number) =>
    isJson ? json(jsonBody, status) : htmlPage(message, status);

  const name = (payload.name ?? '').toString().trim();
  const email = (payload.email ?? '').toString().trim();
  const message = (payload.message ?? '').toString().trim();
  const honeypot = (payload.company ?? '').toString().trim();

  // Honeypot: bots tend to fill every field. A real visitor never sees
  // this one (it's visually hidden and removed from the tab order), so
  // any value here means silently drop the submission but report success
  // to avoid tipping the bot off.
  if (honeypot) {
    return respond({ ok: true }, 'Thanks — that’s on its way to me.', 200);
  }

  if (!name || !email || !message) {
    return respond(
      { error: 'missing_fields' },
      'Please fill in your name, email, and message, then send it again.',
      400
    );
  }
  if (name.length > 200 || email.length > 320 || message.length > 5000) {
    return respond(
      { error: 'field_too_long' },
      'That message is too long for this form. Trim it down and try again.',
      400
    );
  }
  if (!EMAIL_RE.test(email)) {
    return respond(
      { error: 'invalid_email' },
      'That doesn’t look like a valid email address. Head back and check it.',
      400
    );
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    return respond(
      { error: 'not configured' },
      'The contact form isn’t wired up yet. Please reach out on LinkedIn instead.',
      501
    );
  }

  const fromAddress = env.CONTACT_FROM || 'Muscat Azzopardi site <onboarding@resend.dev>';

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `Site contact form — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      }),
    });

    if (!resendRes.ok) {
      return respond(
        { error: 'send_failed' },
        'Something went wrong sending that. Please try again or reach out on LinkedIn.',
        502
      );
    }

    return respond({ ok: true }, 'Thanks — that’s on its way to me. I’ll reply soon.', 200);
  } catch {
    return respond(
      { error: 'send_failed' },
      'Something went wrong sending that. Please try again or reach out on LinkedIn.',
      502
    );
  }
};

// Any method other than POST gets an explicit 405 with an Allow header
// (onRequestPost takes precedence for POST).
export const onRequest: PagesFunction = async () => {
  return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
    status: 405,
    headers: { ...JSON_HEADERS, Allow: 'POST' },
  });
};
