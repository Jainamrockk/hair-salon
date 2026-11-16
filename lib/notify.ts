import "server-only";
/** Text-message add-on. Sends through Twilio when credentials are set; otherwise logs and returns false (demo mode). */
export async function sendSms(phone10: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) { console.log(`[sms demo] to ${phone10}: ${body}`); return false; }
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: `+1${phone10}`, From: from, Body: body }),
    });
    return res.ok;
  } catch { return false; }
}
