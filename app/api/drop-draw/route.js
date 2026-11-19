import { getDb } from '../../../lib/db';
import { Resend } from 'resend';
import { DROP } from '../../../lib/dropConfig';

const resend = new Resend(process.env.RESEND_API_KEY);

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    var j = buf[0] % (i + 1);
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

export async function POST(req) {
  var secret = req.headers.get('x-draw-secret');
  if (!process.env.DROP_DRAW_SECRET || secret !== process.env.DROP_DRAW_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    var sql = getDb();

    var entries = await sql`
      SELECT name, email FROM drop_entries
      WHERE drop_id = ${'drop-1'}
      ORDER BY created_at ASC
    `;

    if (entries.length === 0) {
      return Response.json({ error: 'No entries found.' }, { status: 400 });
    }

    var numWinners = Math.min(DROP.edition, entries.length);
    var winners = shuffle(entries).slice(0, numWinners);

    var results = [];
    for (var i = 0; i < winners.length; i++) {
      var w = winners[i];
      try {
        await resend.emails.send({
          from: 'PocketMountz <onboarding@resend.dev>',
          to: w.email,
          subject: 'You won the ' + DROP.title + ' drop!',
          html: `
            <div style="background:#0C0C0C;color:#C9C9C9;font-family:'Inter',sans-serif;font-size:15px;line-height:1.6;max-width:560px;margin:0 auto;padding:40px 24px;">
              <div style="font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C8A44A;margin-bottom:16px;">PocketMountz ◆ Drop Winner</div>
              <h1 style="font-family:'Oswald',sans-serif;font-weight:800;font-size:28px;color:#F1F1F1;line-height:1;margin:0 0 20px;">You won, ${w.name}.</h1>
              <p style="margin:0 0 16px;">Your name was drawn for the <strong style="color:#F1F1F1;">${DROP.title}</strong> — edition of ${DROP.edition}.</p>
              <p style="margin:0 0 24px;">We'll send your invoice link shortly. The price is <strong style="color:#C8A44A;">$${DROP.price - DROP.entryFee}</strong> (your $${DROP.entryFee} entry fee has been credited).</p>
              <p style="margin:0 0 8px;font-size:13px;color:#7E7E7E;">You have <strong style="color:#C9C9C9;">24 hours</strong> to complete your purchase. Unclaimed pieces go back into a secondary draw.</p>
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #2A2A2A;font-size:11px;color:#7E7E7E;">
                PocketMountz · Real fine art, real artists · Verify on-chain<br/>
                Questions? Reply to this email.
              </div>
            </div>
          `,
        });
        results.push({ email: w.email, name: w.name, sent: true });
      } catch (e) {
        results.push({ email: w.email, name: w.name, sent: false, error: e.message });
      }
    }

    return Response.json({
      success: true,
      totalEntries: entries.length,
      numWinners: winners.length,
      results,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
