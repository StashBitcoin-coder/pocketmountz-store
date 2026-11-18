import Header from '../../Header';
import AuctionAdminClient from './AuctionAdminClient';

export default function AdminAuctionPage() {
  return (
    <>
      <Header />
      <div className="wrap">
        <AuctionAdminClient />
      </div>
    </>
  );
}
