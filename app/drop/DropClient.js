'use client';
import { useState, useEffect } from 'react';

const DROP_ENDS_AT = new Date('2026-11-27T18:00:00Z').getTime();

export default function DropClient() {
  var [dropState, setDropState] = useState('open');
  var [showForm, setShowForm] = useState(false);
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [enteredEmail, setEnteredEmail] = useState('');
  var [cd, setCd] = useState({ h: '00', m: '00', s: '00' });
  var [urgent, setUrgent] = useState(false);
  var [entries] = useState(1247);

  useEffect(function () {
    function tick() {
      var diff = Math.max(0, DROP_ENDS_AT - Date.now());
      setCd({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
      setUrgent(diff < 3600000 && diff > 0);
    }
    tick();
    var t = setInterval(tick, 1000);
    return function () { clearInterval(t); };
  }, []);

  function submit() {
    if (!name.trim() || !email.trim() || !email.includes('@')) return;
    setEnteredEmail(email);
    setDropState('entered');
    setShowForm(false);
  }

  var eyebrowMap = {
    open: 'Live Drop — Entry Open',
    entered: 'You Are Entered — Draw Pending',
    closed: 'Entry Closed — Draw in Progress',
    winner: 'You Won — Complete Purchase',
  };

  return (
    <div className="drop-wrap">

      {/* ── preview state switcher ── */}
      <div className="drop-preview-bar">
        <span className="drop-preview-label">Preview states →</span>
        {['open','entered','closed','winner'].map(function (s) {
          return (
            <button
              key={s}
              className={'drop-state-btn' + (dropState === s ? ' on' : '')}
              onClick={function () { setDropState(s); setShowForm(false); }}
            >
              {s === 'open' ? 'Entry Open' : s === 'entered' ? 'Entered' : s === 'closed' ? 'Closed' : 'Winner'}
            </button>
          );
        })}
      </div>

      {/* ── drop hero ── */}
      <div className="drop-hero">

        {/* left: info */}
        <div className="drop-left">
          <div className="drop-eyebrow">
            <span className={'drop-dot' + (dropState === 'winner' ? ' gold' : dropState === 'closed' ? ' dim' : '')} />
            {eyebrowMap[dropState]}
          </div>
          <h1 className="drop-title">Steph Curry<br />No. 30</h1>
          <div className="drop-subtitle">Golden State Warriors · 2023 Championship</div>
          <p className="drop-desc">
            A museum-finished fine art piece — archival pigmented ink on metallic pearl paper, face-mounted to museum glass with a diamond edge. This edition is limited to <strong>30 pieces</strong>. One winner per entry. Fair draw. No bots.
          </p>
          <div className="drop-chips">
            <span className="drop-chip gold">Edition of 30</span>
            <span className="drop-chip">Museum Glass</span>
            <span className="drop-chip">Archival Ink</span>
            <span className="drop-chip gold">Bitcoin Provenance</span>
          </div>

          {/* how it works */}
          <div className="drop-how">
            <p className="eyebrow" style={{marginBottom:16}}>The Draw</p>
            <div className="drop-how-grid">
              <div className="drop-how-card">
                <div className="drop-how-num">01 — Enter</div>
                <div className="drop-how-title">One entry per customer</div>
                <p className="drop-how-body">Submit during the window. Email required. No payment captured yet.</p>
              </div>
              <div className="drop-how-card">
                <div className="drop-how-num">02 — Draw</div>
                <div className="drop-how-title">Random. Verifiable.</div>
                <p className="drop-how-body">30 winners selected by fair random draw from all entries. Announced same day.</p>
              </div>
              <div className="drop-how-card">
                <div className="drop-how-num">03 — Invoice</div>
                <div className="drop-how-title">24 hours to pay</div>
                <p className="drop-how-body">Winners get a Shopify invoice link. 24-hour window. Unclaimed pieces go back to the pool.</p>
              </div>
              <div className="drop-how-card">
                <div className="drop-how-num">04 — Ships</div>
                <div className="drop-how-title">Packed by hand</div>
                <p className="drop-how-body">Your piece ships with its Origin Key certificate. Tracking provided.</p>
              </div>
            </div>
          </div>
        </div>

        {/* right: entry card */}
        <div className="drop-entry-card">

          {/* product image */}
          <div className="drop-entry-img">
            <div className="drop-entry-img-inner">
              <div className="drop-dia-preview">&#9670;</div>
              <div className="drop-dia-label">Steph Curry No. 30</div>
            </div>
            <div className="drop-img-badge">
              {dropState === 'winner' ? '🏆 Winner' : '30 Pieces'}
            </div>
          </div>

          <div className="drop-entry-body">

            {/* countdown */}
            {dropState !== 'closed' && (
              <>
                <div className="drop-cd-label">
                  {dropState === 'winner' ? 'Invoice expires in' : 'Entry window closes in'}
                </div>
                <div className={'drop-cd' + (urgent || dropState === 'winner' ? ' urgent' : '')}>
                  <div className="drop-cd-unit">
                    <div className="drop-cd-num">{cd.h}</div>
                    <div className="drop-cd-tick">Hours</div>
                  </div>
                  <div className="drop-cd-unit">
                    <div className="drop-cd-num">{cd.m}</div>
                    <div className="drop-cd-tick">Min</div>
                  </div>
                  <div className="drop-cd-unit">
                    <div className="drop-cd-num">{cd.s}</div>
                    <div className="drop-cd-tick">Sec</div>
                  </div>
                </div>
              </>
            )}

            {/* STATE: OPEN */}
            {dropState === 'open' && (
              <div>
                <div className="drop-price-row">
                  <div className="drop-price">$349</div>
                  <div className="drop-price-note">Per piece · $1 entry credited</div>
                </div>
                <div className="drop-bar"><div className="drop-bar-fill" style={{width:'62%'}} /></div>
                <div className="drop-entries-meta">
                  <span><strong>{entries.toLocaleString()}</strong> entries</span>
                  <span>30 winners</span>
                </div>
                {!showForm ? (
                  <>
                    <button className="drop-btn-enter" onClick={function () { setShowForm(true); }}>
                      Enter the Drop — $1
                    </button>
                    <p className="drop-fine">$1 entry fee applied to your purchase price if selected. Non-refundable.</p>
                  </>
                ) : (
                  <div>
                    <div className="drop-form-field">
                      <label>Name</label>
                      <input value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Your name" />
                    </div>
                    <div className="drop-form-field">
                      <label>Email</label>
                      <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="you@email.com" />
                    </div>
                    <button className="drop-btn-enter" onClick={submit}>Pay $1 &amp; Submit Entry</button>
                    <button className="drop-btn-back" onClick={function () { setShowForm(false); }}>← Back</button>
                  </div>
                )}
              </div>
            )}

            {/* STATE: ENTERED */}
            {dropState === 'entered' && (
              <div>
                <div className="drop-entered-banner">
                  <div className="drop-entered-icon">✔</div>
                  <div>
                    <div className="drop-entered-hed">You&apos;re in the draw.</div>
                    <div className="drop-entered-sub">Entry confirmed for <strong>{enteredEmail || 'you@email.com'}</strong>. If selected, you&apos;ll receive an invoice link by email.</div>
                    <div className="drop-draw-pill">Draw on <strong>Nov 27 · 10 AM PT</strong></div>
                  </div>
                </div>
                <div className="drop-bar"><div className="drop-bar-fill" style={{width:'62%'}} /></div>
                <div className="drop-entries-meta">
                  <span><strong>{entries.toLocaleString()}</strong> entries</span>
                  <span>30 winners</span>
                </div>
                <p className="drop-fine" style={{marginTop:14}}>To cancel, email <strong>drops@pocketmountz.com</strong></p>
              </div>
            )}

            {/* STATE: CLOSED */}
            {dropState === 'closed' && (
              <div>
                <div className="drop-closed-banner">
                  <div className="drop-closed-hed">Entry Closed</div>
                  <div className="drop-closed-sub">Draw happening now. Results within 2 hours.</div>
                </div>
                <div className="drop-cd-label">Time since close</div>
                <div className="drop-cd">
                  <div className="drop-cd-unit"><div className="drop-cd-num">00</div><div className="drop-cd-tick">Hours</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">42</div><div className="drop-cd-tick">Min</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">11</div><div className="drop-cd-tick">Sec</div></div>
                </div>
                <div style={{marginBottom:8,fontSize:'12.5px',color:'var(--text2)'}}>Get notified when the next drop opens:</div>
                <div className="drop-notify-row">
                  <input className="drop-notify-input" type="email" placeholder="your@email.com" />
                  <button className="drop-notify-btn">Notify Me</button>
                </div>
              </div>
            )}

            {/* STATE: WINNER */}
            {dropState === 'winner' && (
              <div>
                <div className="drop-winner-banner">
                  <div className="drop-trophy">🏆</div>
                  <div className="drop-winner-hed">You Won.</div>
                  <div className="drop-winner-sub">Your name was drawn. Complete purchase to claim your piece — your $1 entry fee has been credited. Invoice expires in 24 hours.</div>
                  <button className="drop-btn-checkout">Complete Purchase — $348</button>
                </div>
                <p className="drop-fine" style={{marginTop:10,textAlign:'center'}}>Invoice expires <strong>Nov 28 · 10 AM PT</strong> — unclaimed pieces re-enter next draw</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── drop rules ── */}
      <div className="drop-rules">
        <h3 className="drop-rules-hed">Drop Rules</h3>
        <ul className="drop-rules-list">
          <li>One entry per person. Duplicate emails are disqualified.</li>
          <li>Entry requires a $1 fee — applied toward your purchase price if selected. Non-refundable.</li>
          <li>Winners are selected by cryptographic random draw. The draw is fair by design.</li>
          <li>Winners receive a Shopify invoice link by email. Payment is due within 24 hours.</li>
          <li>Unclaimed pieces go to a secondary draw from the same entry pool.</li>
          <li>All sales are final. PocketMountz ships within 7 business days of payment.</li>
          <li>Each piece ships with its Origin Key — an Ordinal Inscription serving as permanent provenance.</li>
        </ul>
      </div>

      {/* ── past drops ── */}
      <div className="drop-past">
        <p className="eyebrow" style={{marginBottom:8}}>Past Drops</p>
        <h2 className="drop-past-hed">Every edition. All sold.</h2>
        <div className="drop-past-grid">
          {[
            {name:'Steph Curry — Splash Zone', meta:'Edition of 50 · Nov 10, 2026'},
            {name:'Steph Curry — Back-to-Back', meta:'Edition of 30 · Oct 4, 2026'},
            {name:'Steph Curry — Range', meta:'Edition of 25 · Sep 1, 2026'},
          ].map(function (d) {
            return (
              <div key={d.name} className="drop-past-card">
                <div className="drop-past-img">&#9670;</div>
                <div className="drop-past-body">
                  <div className="drop-past-name">{d.name}</div>
                  <div className="drop-past-meta">{d.meta}</div>
                  <span className="drop-past-sold">Sold Out</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
