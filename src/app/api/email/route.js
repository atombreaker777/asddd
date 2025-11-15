export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Example email sending endpoint using SendGrid. This route is optional and
 * demonstrates how you can send confirmation emails after booking an
 * appointment. To use this, set the environment variables SENDGRID_API_KEY
 * and SENDGRID_SENDER in Vercel. The request body should contain
 * `to`, `subject`, and `message` fields.
 */

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, subject, message } = body;
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'Hiányzó e-mail paraméterek.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const apiKey = process.env.SENDGRID_API_KEY;
    const sender = process.env.SENDGRID_SENDER;
    if (!apiKey || !sender) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'SENDGRID_API_KEY vagy SENDGRID_SENDER hiányzik.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: sender },
        subject,
        content: [{ type: 'text/plain', value: message }]
      })
    });
    return new Response(
      JSON.stringify({ success: res.ok, message: res.ok ? 'Email sent' : 'Failed to send email' }),
      { status: res.ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: `Email hiba: ${err?.message || 'ismeretlen hiba'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response('Email endpoint live ✅', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}