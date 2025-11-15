export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { google } from 'googleapis';

/**
 * API route that handles appointment bookings. This route is used by the
 * Vapi.ai create_booking tool to append appointment data to a Google Sheet.
 * It supports POST requests with a JSON body containing `name`, `date`, and
 * `time` and optional `phone` and `service` fields. The route reads
 * Google service account credentials from environment variables and writes
 * a new row to a sheet named "Foglalások". A GET request can be used to
 * confirm that the endpoint is live.
 */

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, date, time, service } = body || {};

    // Validate required fields
    if (!name || !date || !time) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Hiányzó adatok. Név, dátum és időpont szükséges.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up Google Sheets API authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return new Response(
        JSON.stringify({ success: false, message: 'GOOGLE_SHEET_ID hiányzik az env-ből.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Compose the new row with creation timestamp and provided details
    const timestamp = new Date().toISOString();
    const newRow = [timestamp, name, phone || '', date, time, service || ''];

    // Append the new row to the sheet named "Foglalások". Ensure the sheet tab exists.
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Foglalások!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [newRow] }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sikeresen rögzítettem ${name} időpontját ${date} ${time}-ra.`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Booking error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Hiba az időpont rögzítésében: ${err?.message || 'ismeretlen hiba'}`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response('Mosoly Dental booking endpoint működik ✅', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}