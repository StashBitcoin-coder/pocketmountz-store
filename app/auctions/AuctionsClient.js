'use client';
import { useState, useEffect } from 'react';
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

  return (
    <div className="auctions-page">
      <div className="auctions-header">
        <h1 className="auctions-title">Live Auctions</h1>
      </div>
      {loading && <p className="auctions-empty">Loading…</p>}
      {!loading && auctions.length === 0 && (
        <p className="auctions-empty">No active auctions right now. Check back soon.</p>
      )}
      <div className="auctions-grid">
        {auctions.map(function (a) { return <AuctionCard key={a.id} auction={a} />; })}
      </div>
    </div>
  );
}
