export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Simple Vapi webhook endpoint for diagnostics. It echoes back the received
 * transcript or text field in the request body. This can be used to verify
 * that the Vapi.ai assistant can reach the server and that payloads are
 * being received correctly. For production use, you can replace this
 * implementation with a call to an LLM or custom logic.
 */

export async function POST(req) {
  try {
    const data = await req.json();
    const text = data.transcript || data.text || '';
    return new Response(
      JSON.stringify({ response: `Szerver válasz: ${text}` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ response: 'Hiba: nem tudtam feldolgozni a kérést.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response('Vapi webhook live ✅', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}