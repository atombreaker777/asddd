/**
 * API route for forwarding chat messages to a Make.com webhook.  
 *  
 * Accepts a JSON body with a `message` field and forwards this payload to the provided
 * webhook URL. Responds with a success indicator.  
 * If the upstream call fails, returns a 500 status with an error message.
 */
export async function POST(request) {
  const { message } = await request.json();
  if (typeof message !== 'string' || message.trim() === '') {
    return new Response(JSON.stringify({ success: false, error: 'Ürüs üzenet' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    // Forward the message to the external Make.com webhook.
    await fetch('https://hook.eu2.make.com/xyz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook hívás hiba:', error);
    return new Response(JSON.stringify({ success: false, error: 'Hiba történt az üzenet továbbításakor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
