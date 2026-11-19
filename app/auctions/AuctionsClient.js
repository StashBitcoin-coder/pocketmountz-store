'use client';
import { useState, useEffect } from 'react';
import AuctionClient from '../auction/[handle]/AuctionClient';
import AuctionCard from './AuctionCard';

export default function AuctionsClient() {
  var [auctions, setAuctions] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    fetch('/api/auctions')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.auctions) setAuctions(data.auctions);
        setLoading(false);
      })
      .catch(function () { setLoading(false); });
  }, []);

  if (loading) return <div className="auctions-page"><div className="page-hed"><p className="eyebrow">Live Now</p><h1 className="col-title">Auction</h1></div><p className="auctions-empty">Loading…</p></div>;

  if (auctions.length === 0) {
    return (
      <div className="auctions-page">
        <div className="page-hed"><p className="eyebrow">Live Now</p><h1 className="col-title">Auction</h1><p className="sub">One piece. Highest bid wins.</p></div>
        <p className="auctions-empty">No active auctions right now. Check back soon.</p>
      </div>
    );
  }

  var featured = auctions[0];
  var rest = auctions.slice(1);

  return (
    <div className="auctions-page">
      <div className="page-hed"><p className="eyebrow">Live Now</p><h1 className="col-title">Auction</h1><p className="sub">One piece. Highest bid wins.</p></div>
      <AuctionClient auction={featured} />
      {rest.length > 0 && (
        <div className="auctions-more">
          <h2 className="auctions-more-title">More Auctions</h2>
          <div className="auctions-grid">
            {rest.map(function (a) { return <AuctionCard key={a.id} auction={a} />; })}
          </div>
        </div>
      )}
    </div>
  );
}
