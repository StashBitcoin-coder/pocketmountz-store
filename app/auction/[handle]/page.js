import { getDb } from '../../../lib/db';
import Header from '../../Header';
import AuctionClient from './AuctionClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AuctionPage({ params }) {
  const { handle } = await params;
  const sql = getDb();
  const rows = await sql`SELECT id, product_handle, product_title, variant_id, image_url, starting_bid, reserve_price, current_bid, current_winner_email, current_winner_name, bid_count, starts_at, ends_at, status, created_at FROM auctions WHERE product_handle = ${handle}`;
  if (!rows.length) notFound();
  const auction = rows[0];

  return (
    <>
      <Header />
      <div className="wrap">
        <AuctionClient auction={auction} />
      </div>
    </>
  );
}
