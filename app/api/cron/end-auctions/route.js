import { getDb } from '../../../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = 'qwgc1w-vx.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';

async function createCheckoutUrl(variantId) {
  const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({
      query: `mutation cartCreate($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{checkoutUrl}}}`,
      variables: { lines: [{ merchandiseId: variantId, quantity: 1 }] },
    }),
  });
  const data = await res.json();
  return data.data?.cartCreate?.cart?.checkoutUrl || null;
}

export async function GET(req) {
  // Verify this is called by Vercel cron
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    // Find all active auctions that have passed their end time
    const ended = await sql`
      SELECT id, product_handle, product_title, variant_id,
        current_bid, reserve_price, current_winner_email, current_winner_name, bid_count
      FROM auctions
      WHERE status = 'active' AND ends_at <= NOW()
    `;

    if (!ended.length) return Response.json({ processed: 0 });

    const results = [];

    for (const auction of ended) {
      const reserveMet = !auction.reserve_price || Number(auction.current_bid) >= Number(auction.reserve_price);
      const hasWinner = auction.current_winner_email && auction.bid_count > 0;

      if (hasWinner && reserveMet) {
        // Create Shopify checkout link for the winner
        const checkoutUrl = await createCheckoutUrl(auction.variant_id);

        // Mark auction as ended
        await sql`UPDATE auctions SET status = 'ended' WHERE id = ${auction.id}`;

        // Email the winner
        if (checkoutUrl) {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: auction.current_winner_email,
            subject: `You won the auction for ${auction.product_title}!`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
                <h2 style="color:#C8A44A;">Congratulations, ${auction.current_winner_name}!</h2>
                <p>You won the PocketMountz auction for:</p>
                <h3 style="color:#0C0C0C;">${auction.product_title}</h3>
                <p><strong>Winning bid: $${Number(auction.current_bid).toFixed(2)}</strong></p>
                <p>Click the button below to complete your purchase. This link expires in 48 hours.</p>
                <a href="${checkoutUrl}" style="display:inline-block;background:#C8A44A;color:#0C0C0C;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
                  Complete Purchase →
                </a>
                <p style="color:#888;font-size:12px;">Questions? Reply to this email or visit pocketmountz.com</p>
              </div>
            `,
          });
        }

        results.push({ id: auction.id, status: 'ended', winner: auction.current_winner_email, checkout: !!checkoutUrl });

      } else if (!hasWinner || !reserveMet) {
        // No bids or reserve not met — end without a winner
        const newStatus = !reserveMet ? 'reserve_not_met' : 'no_bids';
        await sql`UPDATE auctions SET status = ${newStatus} WHERE id = ${auction.id}`;
        results.push({ id: auction.id, status: newStatus });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
