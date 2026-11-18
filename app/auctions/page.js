import { getDb } from '../../lib/db';
import Header from '../Header';
import AuctionCard from './AuctionCard';

export const dynamic = 'force-dynamic';

export default async function AuctionsPage() {
  const sql = getDb();
  const auctions = await sql`
    SELECT id, product_handle, product_title, image_url,
      starting_bid, current_bid, bid_count, starts_at, ends_at, status
    FROM auctions
    WHERE status = 'active'
    ORDER BY ends_at ASC
  `;

  return (
    <>
      <Header />
      <div className="wrap">
        <div className="auctions-page">
          <div className="auctions-header">
            <h1 className="auctions-title">Live Auctions</h1>
            {auctions.length === 0 && (
              <p className="auctions-empty">No active auctions right now. Check back soon.</p>
            )}
          </div>
          <div className="auctions-grid">
            {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
          </div>
        </div>
      </div>
    </>
  );
}
