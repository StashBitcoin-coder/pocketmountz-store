'use client';
import { useState, useEffect, useCallback } from 'react';

function money(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function Countdown({ endsAt, onEnd }) {
  const [time, setTime] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(function () {
    function tick() {
      var diff = new Date(endsAt) - new Date();
      if (diff <= 0) { setTime('Ended'); if (onEnd) onEnd(); return; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 600000);
      if (d > 0) setTime(d + 'd ' + h + 'h ' + m + 'm ' + s + 's');
      else if (h > 0) setTime(h + 'h ' + m + 'm ' + s + 's');
      else setTime(m + 'm ' + s + 's');
    }
    tick();
    var t = setInterval(tick, 1000);
    return function () { clearInterval(t); };
  }, [endsAt]);

  return <span className={urgent ? 'auction-timer urgent' : 'auction-timer'}>{time}</span>;
}

export default function AuctionClient({ auction: initial }) {
  var [auction, setAuction] = useState(initial);
  var [step, setStep] = useState('bid'); // bid | verify | checkout | done
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [amount, setAmount] = useState('');
  var [maxAmount, setMaxAmount] = useState('');
  var [code, setCode] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [checkoutUrl, setCheckoutUrl] = useState('');
  var [ended, setEnded] = useState(auction.status !== 'active');

  var minBid = Number(auction.current_bid) === 0
    ? Number(auction.starting_bid)
    : Number(auction.current_bid) + 1;

  // Poll auction every 15s for live updates
  useEffect(function () {
    if (ended) return;
    var t = setInterval(async function () {
      try {
        var res = await fetch('/api/auction/' + auction.product_handle);
        var data = await res.json();
        if (data.id) setAuction(data);
      } catch (e) {}
    }, 15000);
    return function () { clearInterval(t); };
  }, [auction.product_handle, ended]);

  var sendCode = useCallback(async function () {
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (!amount || Number(amount) < minBid) { setError('Minimum bid is ' + money(minBid)); return; }
    setLoading(true);
    try {
      var res = await fetch('/api/bid/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      var data = await res.json();
      if (data.error) { setError(data.error); return; }
      setStep('verify');
    } catch (e) { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  }, [name, email, amount, minBid]);

  var placeBid = useCallback(async function () {
    setError('');
    if (!code || code.length !== 6) { setError('Enter the 6-digit code from your email.'); return; }
    setLoading(true);
    try {
      var res = await fetch('/api/bid/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auction_id: auction.id,
          bidder_name: name,
          bidder_email: email,
          amount: Number(amount),
          max_amount: maxAmount ? Number(maxAmount) : null,
          code,
        }),
      });
      var data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCheckoutUrl(data.checkout_url);
      setAuction(function (a) { return Object.assign({}, a, { current_bid: data.current_bid, ends_at: data.ends_at }); });
      setStep('checkout');
    } catch (e) { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  }, [auction.id, name, email, amount, maxAmount, code]);

  return (
    <div className="auction-wrap">
      <div className="auction-grid">
        <div className="auction-img-col">
          {auction.image_url
            ? (auction.image_url.includes('.mp4') || auction.image_url.includes('.mov') || auction.image_url.includes('.webm') || auction.image_url.includes('/videos/'))
              ? <video className="auction-img auction-video" src={auction.image_url} autoPlay loop muted playsInline controls />
              : <img className="auction-img" src={auction.image_url} alt={auction.product_title} />
            : <div className="auction-img-ph">PM</div>}
        </div>

        <div className="auction-info-col">
          <p className="eyebrow">Live Auction</p>
          <h1 className="auction-title">{auction.product_title}</h1>

          <div className="auction-stats">
            <div className="auction-stat">
              <div className="auction-stat-label">Current Bid</div>
              <div className="auction-stat-val">{Number(auction.current_bid) > 0 ? money(auction.current_bid) : money(auction.starting_bid)}</div>
            </div>
            <div className="auction-stat time-left">
              <div className="auction-stat-label">{ended ? 'Ended' : 'Time Left'}</div>
              <div className="auction-stat-val">
                {ended
                  ? <span className="auction-timer">Closed</span>
                  : <Countdown endsAt={auction.ends_at} onEnd={function () { setEnded(true); }} />}
              </div>
            </div>
            <div className="auction-stat">
              <div className="auction-stat-label">Bids</div>
              <div className="auction-stat-val">{auction.bid_count}</div>
            </div>
          </div>

          {!ended && (
            <div className="auction-form-wrap">
              {step === 'bid' && (
                <div className="auction-form">
                  <div className="auction-field">
                    <label>Your Name</label>
                    <input value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Full name" />
                  </div>
                  <div className="auction-field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="you@email.com" />
                  </div>
                  <div className="auction-field">
                    <label>Your Bid (minimum {money(minBid)})</label>
                    <div className="auction-amount-wrap">
                      <span className="auction-dollar">$</span>
                      <input type="number" value={amount} onChange={function (e) { setAmount(e.target.value); }} placeholder={minBid.toFixed(2)} min={minBid} step="1" />
                    </div>
                  </div>
                  <div className="auction-field">
                    <label>Max Auto-Bid <span className="auction-optional">(optional — we bid for you up to this amount)</span></label>
                    <div className="auction-amount-wrap">
                      <span className="auction-dollar">$</span>
                      <input type="number" value={maxAmount} onChange={function (e) { setMaxAmount(e.target.value); }} placeholder="Leave blank to bid manually" min={amount || minBid} step="1" />
                    </div>
                  </div>
                  {error && <p className="auction-error">{error}</p>}
                  <button className="btn gold auction-submit" onClick={sendCode} disabled={loading}>
                    {loading ? 'Sending code…' : 'Continue →'}
                  </button>
                  <p className="auction-fine">A $1 refundable deposit is required to qualify your bid. You will be redirected to pay after verifying your email.</p>
                </div>
              )}

              {step === 'verify' && (
                <div className="auction-form">
                  <p className="auction-verify-msg">We sent a 6-digit code to <strong>{email}</strong>. Enter it below to confirm your bid.</p>
                  <div className="auction-field">
                    <label>Verification Code</label>
                    <input value={code} onChange={function (e) { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); }} placeholder="123456" maxLength={6} className="auction-code-input" />
                  </div>
                  {error && <p className="auction-error">{error}</p>}
                  <button className="btn gold auction-submit" onClick={placeBid} disabled={loading}>
                    {loading ? 'Placing bid…' : 'Confirm Bid'}
                  </button>
                  <button className="auction-back" onClick={function () { setStep('bid'); setError(''); }}>← Back</button>
                </div>
              )}

              {step === 'checkout' && (
                <div className="auction-form">
                  <div className="auction-success">
                    <div className="auction-success-icon">✓</div>
                    <h3>Bid placed — {money(Number(amount))}!</h3>
                    <p>Complete your $1 refundable deposit to lock in your bid. If you win, we'll email you a payment link for the full amount.</p>
                    <a className="btn gold auction-submit" href={checkoutUrl} target="_blank" rel="noopener noreferrer">Pay $1 Deposit →</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {ended && auction.current_winner_name && (
            <div className="auction-ended-banner">
              <strong>Auction Closed</strong>
              <p>Winning bid: {money(auction.current_bid)}</p>
            </div>
          )}

          {auction.bids && auction.bids.length > 0 && (
            <div className="auction-history">
              <h3 className="auction-history-title">Bid History</h3>
              {auction.bids.slice(0, 10).map(function (b) {
                return (
                  <div className="auction-history-row" key={b.id}>
                    <span className="auction-history-name">{b.bidder_name.split(' ')[0]}***</span>
                    <span className="auction-history-amount">{money(b.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
