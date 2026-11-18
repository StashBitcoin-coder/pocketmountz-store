'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function money(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function MiniTimer({ endsAt }) {
  const [time, setTime] = useState('');
  const [urgent, setUrgent] = useState(false);
  useEffect(function () {
    function tick() {
      var diff = new Date(endsAt) - new Date();
      if (diff <= 0) { setTime('Ended'); return; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 600000);
      if (d > 0) setTime(d + 'd ' + h + 'h ' + m + 'm');
      else if (h > 0) setTime(h + 'h ' + m + 'm ' + s + 's');
      else setTime(m + 'm ' + s + 's');
    }
    tick();
    var t = setInterval(tick, 1000);
    return function () { clearInterval(t); };
  }, [endsAt]);
  return <span className={urgent ? 'auction-timer urgent' : 'auction-timer'}>{time}</span>;
}

export default function AuctionCard({ auction }) {
  var isVideo = auction.image_url && (
    auction.image_url.includes('.mp4') ||
    auction.image_url.includes('.mov') ||
    auction.image_url.includes('.webm') ||
    auction.image_url.includes('/videos/')
  );
  var currentBid = Number(auction.current_bid) > 0 ? auction.current_bid : auction.starting_bid;

  return (
    <Link href={'/auction/' + auction.product_handle} className="auction-card">
      <div className="auction-card-media">
        {auction.image_url
          ? isVideo
            ? <video src={auction.image_url} autoPlay loop muted playsInline className="auction-card-img" />
            : <img src={auction.image_url} alt={auction.product_title} className="auction-card-img" />
          : <div className="auction-card-ph">PM</div>}
      </div>
      <div className="auction-card-body">
        <p className="auction-card-title">{auction.product_title}</p>
        <div className="auction-card-stats">
          <div>
            <div className="auction-card-label">Current Bid</div>
            <div className="auction-card-val">{money(currentBid)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="auction-card-label">Time Left</div>
            <div className="auction-card-val"><MiniTimer endsAt={auction.ends_at} /></div>
          </div>
        </div>
        <div className="auction-card-bids">{auction.bid_count} bid{auction.bid_count !== 1 ? 's' : ''}</div>
      </div>
    </Link>
  );
}
