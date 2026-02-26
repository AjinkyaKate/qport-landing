function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function isEmail(s) {
  if (typeof s !== "string") return false;
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clip(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  // Fallback: stream read.
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function sendResendEmail({ apiKey, from, to, subject, html, replyTo }) {
  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (replyTo) payload.reply_to = replyTo;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await r.json();
  } catch {
    // ignore
  }

  if (!r.ok) {
    const message = data?.message || data?.error || `Resend error (${r.status})`;
    const err = new Error(message);
    err.status = r.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, { ok: true });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "QPort <onboarding@resend.dev>";
  const teamTo = process.env.DEMO_TEAM_TO || "ajinkyakate2001@gmail.com";

  if (!apiKey) return json(res, 500, { ok: false, error: "Missing RESEND_API_KEY" });

  const body = await readBody(req);
  if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body" });

  // Honeypot field for simple spam filtering.
  if (typeof body.website === "string" && body.website.trim()) {
    return json(res, 200, { ok: true, spam: true });
  }

  const name = clip(body.name, 80);
  const company = clip(body.company, 120);
  const role = clip(body.role, 80);
  const email = clip(body.email, 180);

  if (!name || !company || !role || !email) {
    return json(res, 400, { ok: false, error: "Missing required fields" });
  }
  if (!isEmail(email)) {
    return json(res, 400, { ok: false, error: "Invalid email address" });
  }

  const meta = {
    created_at: typeof body.created_at === "string" ? body.created_at : new Date().toISOString(),
    page_url: clip(body.page_url, 500),
    referrer: clip(body.referrer, 500),
    utm_source: clip(body.utm_source, 80),
    utm_medium: clip(body.utm_medium, 80),
    utm_campaign: clip(body.utm_campaign, 120),
    utm_term: clip(body.utm_term, 120),
    utm_content: clip(body.utm_content, 120),
    ip:
      clip(req.headers["x-forwarded-for"]?.split(",")[0] || "", 80) ||
      clip(req.socket?.remoteAddress || "", 80),
  };

  const safe = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const teamSubject = `QPort demo request — ${company}`;
  const teamHtml =
    `<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.45;">` +
    `<h2 style="margin:0 0 12px 0;">New demo request</h2>` +
    `<p style="margin:0 0 12px 0;">Reply to this email to respond directly to <b>${safe(email)}</b>.</p>` +
    `<table style="border-collapse:collapse; width:100%; max-width:640px;">` +
    `<tr><td style="padding:6px 0; color:#555; width:160px;">Name</td><td style="padding:6px 0;"><b>${safe(
      name
    )}</b></td></tr>` +
    `<tr><td style="padding:6px 0; color:#555;">Company</td><td style="padding:6px 0;"><b>${safe(
      company
    )}</b></td></tr>` +
    `<tr><td style="padding:6px 0; color:#555;">Role</td><td style="padding:6px 0;">${safe(
      role
    )}</td></tr>` +
    `<tr><td style="padding:6px 0; color:#555;">Email</td><td style="padding:6px 0;"><a href="mailto:${safe(
      email
    )}">${safe(email)}</a></td></tr>` +
    `</table>` +
    `<hr style="border:none; border-top:1px solid #eee; margin:16px 0;" />` +
    `<div style="color:#666; font-size:12px;">` +
    `<div>Created: ${safe(meta.created_at)}</div>` +
    (meta.page_url ? `<div>Page: ${safe(meta.page_url)}</div>` : "") +
    (meta.referrer ? `<div>Referrer: ${safe(meta.referrer)}</div>` : "") +
    (meta.utm_source ? `<div>UTM: ${safe(meta.utm_source)} / ${safe(meta.utm_medium)} / ${safe(meta.utm_campaign)}</div>` : "") +
    (meta.ip ? `<div>IP: ${safe(meta.ip)}</div>` : "") +
    `</div>` +
    `</div>`;

  const leadSubject = "QPort demo request received";
  const leadHtml =
    `<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.45;">` +
    `<p style="margin:0 0 10px 0;">Hi ${safe(name)},</p>` +
    `<p style="margin:0 0 12px 0;">We received your demo request. Our team will reach out soon.</p>` +
    `<div style="margin:16px 0; padding:12px 14px; border:1px solid #eee; border-radius:12px;">` +
    `<div style="font-size:12px; color:#666; letter-spacing:0.08em;">REQUEST SUMMARY</div>` +
    `<div style="margin-top:10px; font-size:14px;">` +
    `<div><b>Company:</b> ${safe(company)}</div>` +
    `<div><b>Role:</b> ${safe(role)}</div>` +
    `<div><b>Email:</b> ${safe(email)}</div>` +
    `</div>` +
    `</div>` +
    `<p style="margin:0; color:#666; font-size:12px;">If you need to add context, reply to this email.</p>` +
    `</div>`;

  try {
    const sentTeam = await sendResendEmail({
      apiKey,
      from,
      to: teamTo,
      subject: teamSubject,
      html: teamHtml,
      replyTo: email,
    });

    let sentLead = null;
    try {
      sentLead = await sendResendEmail({
        apiKey,
        from,
        to: email,
        subject: leadSubject,
        html: leadHtml,
        replyTo: "demo@qportai.com",
      });
    } catch {
      // If lead email fails, the team still received the request. Keep response OK.
    }

    return json(res, 200, {
      ok: true,
      sent: { team: Boolean(sentTeam?.id), lead: Boolean(sentLead?.id) },
    });
  } catch (e) {
    return json(res, 502, { ok: false, error: e?.message || "Email send failed" });
  }
}

