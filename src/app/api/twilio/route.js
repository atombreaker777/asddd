/*
 * This API route handles inbound voice calls from Twilio.
 *
 * When Twilio receives a call, it will request this endpoint.  On the
 * initial GET request we return a TwiML document with a <Gather>
 * directive asking the caller (in Hungarian) to state their desired
 * appointment date and time.  The <Gather> posts back to this same
 * endpoint via POST with a SpeechResult parameter containing the
 * transcribed text.
 *
 * The POST handler parses the transcribed speech, forwards it to the
 * Groq chat API to generate a short receptionist response, and then
 * returns a TwiML document using Twilio's built‑in Text‑to‑Speech to
 * speak the response.  No secrets are hard‑coded in this file; set
 * GROQ_API_KEY in your environment and NEXT_PUBLIC_APP_URL to the
 * public URL of your deployed application (e.g. your Vercel domain).
 */

export async function GET(req) {
  // In the initial GET request Twilio expects a TwiML response with a Gather.
  // We ask the caller to state the desired appointment time/date.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const actionUrl = `${baseUrl}/api/twilio`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Gather input="speech" language="hu-HU" action="${actionUrl}" method="POST" speechTimeout="auto">\n    <Say language="hu-HU">Üdvözlöm a Mosoly Dental recepcióján. Kérem, mondja el, hogy milyen napra és időpontra szeretne foglalni.</Say>\n  </Gather>\n  <Say language="hu-HU">Sajnálom, nem értettem. Viszont hallásra.</Say>\n</Response>`;
  return new Response(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(req) {
  // Twilio sends POST requests with application/x-www-form-urlencoded
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  const speechResult = params.get('SpeechResult') || '';

  // Build the messages array for Groq.  The system prompt instructs
  // the assistant to act as a polite Hungarian dental receptionist.
  const systemPrompt = [
    'Te a Mosoly Dental fogorvosi rendelő barátságos, professzionális recepciósa vagy.',
    'Feladatod, hogy időpontot foglalj vagy módosíts a hívók számára.',
    'Az ügyfeleket tegezheted, de maradj udvarias.',
    'Először kérdezd meg, melyik nap és időpont lenne megfelelő.',
    'Ha a kért idő foglalt, javasolj közeli szabad időpontot.',
    'A rendelő címe: Budapest, Példa u. 12., nyitvatartás: hétfőtől péntekig 8–17 óráig.',
    'Ne találj ki nem létező szolgáltatást, és ne adj orvosi tanácsot.',
  ].join(' ');

  const groqPayload = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: speechResult },
    ],
    model: 'llama3-8b-8192',
    temperature: 0.2,
    max_tokens: 256,
    stream: false,
  };

  let replyText = 'Elnézést, hiba történt a feldolgozás során.';
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqPayload),
    });
    if (groqRes.ok) {
      const data = await groqRes.json();
      replyText = data.choices?.[0]?.message?.content?.trim() || replyText;
    }
  } catch (err) {
    // If Groq API fails we keep the default error message.
    console.error('Error communicating with Groq API', err);
  }

  // Respond to Twilio with a TwiML <Say> to speak the assistant's reply in Hungarian.
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="hu-HU" voice="Polly.Bianca">${replyText}</Say>\n</Response>`;
  return new Response(twimlResponse, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}