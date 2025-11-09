export async function POST(req) {
  const body = await req.json();
  const { to, subject, message } = body;

  const apiKey = process.env.SENDGRID_API_KEY;
  const sender = process.env.SENDGRID_SENDER;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: sender },
      subject,
      content: [{ type: "text/plain", value: message }],
    }),
  });

  return new Response(
    JSON.stringify({
      success: res.ok,
      message: res.ok ? "Email sent" : "Failed to send email",
    }),
    { status: res.ok ? 200 : 500 }
  );
}
