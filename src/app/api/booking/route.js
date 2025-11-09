import { google } from "googleapis";

export async function POST(req) {
  const body = await req.json();
  const { name, phone, date, time, service } = body;

  if (!name || !date || !time) {
    return new Response(JSON.stringify({
      success: false,
      message: "Hiányzó adatok. Név, dátum és időpont szükséges."
    }), { status: 400 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const newRow = [new Date().toISOString(), name, phone || "", date, time, service || ""];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Foglalások!A:F",
      valueInputOption: "USER_ENTERED",
      resource: { values: [newRow] },
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Sikeresen rögzítettem ${name} időpontját ${date} ${time}-ra.`
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Booking error:", err);
    return new Response(JSON.stringify({
      success: false,
      message: "Nem sikerült rögzíteni az időpontot."
    }), { status: 500 });
  }
}

export async function GET() {
  return new Response("Mosoly Dental booking endpoint működik ✅", { status: 200 });
}
