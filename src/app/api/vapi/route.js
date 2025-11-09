export async function POST(req) {
  const data = await req.json();
  const text = data.text || data.transcript || "";

  return new Response(
    JSON.stringify({
      response: `A szerver válasza rendben működik, kaptam: "${text}".`
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function GET() {
  return new Response("Vapi teszt endpoint működik ✅", { status: 200 });
}
