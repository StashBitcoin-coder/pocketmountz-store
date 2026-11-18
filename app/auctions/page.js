import Header from '../Header';
import AuctionsClient from './AuctionsClient';

export default function AuctionsPage() {
  return (
    <>
      <Header />
      <div className="wrap">
        <AuctionsClient />
      </div>
    </>
  );
}
