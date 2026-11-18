import { getDb } from '../../../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) return Response.json({ error: 'Valid email required' }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const sql = getDb();
    await sql`
      INSERT INTO email_verifications (email, code, expires_at)
      VALUES (${email.toLowerCase()}, ${code}, ${expires})
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'PocketMountz — Your bid verification code',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;">
          <h2 style="color:#C8A44A;">PocketMountz Auctions</h2>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0C0C0C;background:#f5f5f5;padding:20px;text-align:center;border-radius:8px;">${code}</div>
          <p style="color:#888;font-size:13px;">Expires in 10 minutes. Do not share this code.</p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
