'use client';
import { useState, useEffect } from 'react';

const DOMAIN = 'qwgc1w-vx.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';

async function createEntryCheckout(variantId, email) {
  var res = await fetch('https://' + DOMAIN + '/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({
      query: 'mutation cartCreate($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl}userErrors{message}}}',
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity: 1 }],
          buyerIdentity: { email: email },
        },
      },
    }),
  });
  var json = await res.json();
  return json.data?.cartCreate?.cart?.checkoutUrl || null;
}

export default function DropClient({ drop }) {
  var [uiState, setUiState] = useState('loading');
  var [showForm, setShowForm] = useState(false);
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [entryInfo, setEntryInfo] = useState(null);
  var [cd, setCd] = useState({ h: '--', m: '--', s: '--' });
  var [urgent, setUrgent] = useState(false);
  var [busy, setBusy] = useState(false);
  var [error, setError] = useState('');
  var [previewState, setPreviewState] = useState(null);

  // On mount: check localStorage for existing entry
  useEffect(function () {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem('pm_drop_entry') || 'null'); } catch (e) {}

    if (drop.status === 'open' && stored) {
      setEntryInfo(stored);
      setUiState('entered');
    } else {
      setUiState(drop.status); // 'open' | 'closed' | 'drawn'
    }
  }, [drop.status]);

  // Countdown
  useEffect(function () {
    var end = new Date(drop.endsAt).getTime();
    function tick() {
      var diff = Math.max(0, end - Date.now());
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
  }, [drop.endsAt]);

  async function handleEnter() {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (!drop.entryVariantId) { setError('Entry is not yet configured. Check back soon.'); return; }
    setError('');
    setBusy(true);
    try {
      // Save to localStorage before redirecting so we show entered state on return
      var info = { name: name.trim(), email: email.trim(), ts: Date.now() };
      try { localStorage.setItem('pm_drop_entry', JSON.stringify(info)); } catch (e) {}

      var url = await createEntryCheckout(drop.entryVariantId, email.trim());
      if (!url) throw new Error('No checkout URL returned.');
      window.location.href = url;
    } catch (e) {
      setBusy(false);
      setError('Could not create checkout. Please try again.');
    }
  }

  var active = previewState || uiState;

  if (uiState === 'loading') return null;

  return (
    <div className="drop-wrap">

      {/* ── preview state switcher ── */}
      <div className="drop-preview-bar">
        <span className="drop-preview-label">Preview →</span>
        {[
          { key: 'open', label: 'Entry Open' },
          { key: 'entered', label: 'Entered' },
          { key: 'closed', label: 'Closed' },
          { key: 'winner', label: 'Winner' },
        ].map(function (s) {
          return (
            <button
              key={s.key}
              className={'drop-state-btn' + (active === s.key ? ' on' : '')}
              onClick={function () { setPreviewState(s.key === active ? null : s.key); }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── hero ── */}
      <div className="drop-hero">

        {/* left */}
        <div className="drop-left">
          <div className="drop-eyebrow">
            <span className={
              'drop-dot' +
              (active === 'winner' ? ' gold' : active === 'closed' || active === 'drawn' ? ' dim' : '')
            } />
            {active === 'open' && 'Live Drop — Entry Open'}
            {active === 'entered' && 'You Are Entered — Draw Pending'}
            {active === 'closed' && 'Entry Closed — Draw in Progress'}
            {active === 'drawn' && 'Draw Complete — Winners Notified'}
            {active === 'winner' && 'You Won — Complete Purchase'}
          </div>
          <h1 className="drop-title">{drop.title.split(' No.').map(function (p, i) {
            return i === 0 ? p : <span key={i}><br />No.{p}</span>;
          })}</h1>
          <div className="drop-subtitle">{drop.subtitle}</div>
          <p className="drop-desc">
            A museum-finished fine art piece — archival pigmented ink on metallic pearl paper,
            face-mounted to museum glass with a diamond edge. This edition is limited to{' '}
            <strong>{drop.edition} pieces</strong>. One winner per entry. Fair draw. No bots.
          </p>
          <div className="drop-chips">
            <span className="drop-chip gold">Edition of {drop.edition}</span>
            <span className="drop-chip">Museum Glass</span>
            <span className="drop-chip">Archival Ink</span>
            <span className="drop-chip gold">Bitcoin Provenance</span>
          </div>

          {/* how it works */}
          <div className="drop-how">
            <p className="eyebrow" style={{ marginBottom: 16 }}>The Draw</p>
            <div className="drop-how-grid">
              {[
                { n: '01', t: 'Enter', b: 'Submit during the window. Email required. No payment captured yet.' },
                { n: '02', t: 'Draw', b: drop.edition + ' winners selected by fair random draw. Announced same day.' },
                { n: '03', t: 'Invoice', b: 'Winners get a Shopify invoice. 24-hour window. Unclaimed pieces re-enter the pool.' },
                { n: '04', t: 'Ships', b: 'Your piece ships with its Origin Key certificate. Tracking provided.' },
              ].map(function (c) {
                return (
                  <div key={c.n} className="drop-how-card">
                    <div className="drop-how-num">0{c.n.slice(-1)} — {c.t}</div>
                    <p className="drop-how-body">{c.b}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* right: entry card */}
        <div className="drop-entry-card">

          {/* image */}
          <div className="drop-entry-img" style={drop.imageUrl ? { backgroundImage: 'url(' + drop.imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!drop.imageUrl && (
              <div className="drop-entry-img-inner">
                <div className="drop-dia-preview">&#9670;</div>
                <div className="drop-dia-label">{drop.title}</div>
              </div>
            )}
            <div className="drop-img-badge">
              {active === 'winner' ? '🏆 Winner' : drop.edition + ' Pieces'}
            </div>
          </div>

          <div className="drop-entry-body">

            {/* countdown — shown for open + entered */}
            {(active === 'open' || active === 'entered') && (
              <>
                <div className="drop-cd-label">Entry window closes in</div>
                <div className={'drop-cd' + (urgent ? ' urgent' : '')}>
                  <div className="drop-cd-unit"><div className="drop-cd-num">{cd.h}</div><div className="drop-cd-tick">Hours</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">{cd.m}</div><div className="drop-cd-tick">Min</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">{cd.s}</div><div className="drop-cd-tick">Sec</div></div>
                </div>
              </>
            )}

            {/* winner countdown */}
            {active === 'winner' && (
              <>
                <div className="drop-cd-label" style={{ color: 'var(--gold)' }}>Invoice expires in</div>
                <div className="drop-cd urgent">
                  <div className="drop-cd-unit"><div className="drop-cd-num">23</div><div className="drop-cd-tick">Hours</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">59</div><div className="drop-cd-tick">Min</div></div>
                  <div className="drop-cd-unit"><div className="drop-cd-num">00</div><div className="drop-cd-tick">Sec</div></div>
                </div>
              </>
            )}

            {/* ── STATE: OPEN ── */}
            {active === 'open' && (
              <div>
                <div className="drop-price-row">
                  <div className="drop-price">${drop.price}</div>
                  <div className="drop-price-note">Per piece · $1 entry credited</div>
                </div>
                {!showForm ? (
                  <>
                    <button className="drop-btn-enter" onClick={function () { setShowForm(true); setError(''); }}>
                      Enter the Drop — $1
                    </button>
                    <p className="drop-fine">$1 entry fee applied to your purchase if selected. Non-refundable.</p>
                  </>
                ) : (
                  <div>
                    {error && <div className="drop-error">{error}</div>}
                    <div className="drop-form-field">
                      <label>Name</label>
                      <input value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Your name" />
                    </div>
                    <div className="drop-form-field">
                      <label>Email</label>
                      <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="you@email.com" />
                    </div>
                    <button className="drop-btn-enter" disabled={busy} onClick={handleEnter}>
                      {busy ? 'Redirecting…' : 'Pay $1 & Submit Entry'}
                    </button>
                    <button className="drop-btn-back" onClick={function () { setShowForm(false); setError(''); }}>← Back</button>
                  </div>
                )}
              </div>
            )}

            {/* ── STATE: ENTERED ── */}
            {active === 'entered' && (
              <div>
                <div className="drop-entered-banner">
                  <div className="drop-entered-icon">✔</div>
                  <div>
                    <div className="drop-entered-hed">You&apos;re in the draw.</div>
                    <div className="drop-entered-sub">
                      Entry submitted for{' '}
                      <strong>{(entryInfo && entryInfo.email) || email || 'your email'}</strong>.
                      {' '}If selected, you&apos;ll receive an invoice by email.
                    </div>
                    <div className="drop-draw-pill">Draw on <strong>{drop.drawDate}</strong></div>
                  </div>
                </div>
                <p className="drop-fine" style={{ marginTop: 10 }}>
                  To cancel, email <strong>drops@pocketmountz.com</strong>
                </p>
              </div>
            )}

            {/* ── STATE: CLOSED ── */}
            {active === 'closed' && (
              <div>
                <div className="drop-closed-banner">
                  <div className="drop-closed-hed">Entry Closed</div>
                  <div className="drop-closed-sub">Draw in progress. Results within 2 hours.</div>
                </div>
                <div style={{ marginBottom: 8, fontSize: '12.5px', color: 'var(--text2)' }}>
                  Get notified when the next drop opens:
                </div>
                <div className="drop-notify-row">
                  <input className="drop-notify-input" type="email" placeholder="your@email.com" />
                  <button className="drop-notify-btn">Notify Me</button>
                </div>
              </div>
            )}

            {/* ── STATE: DRAWN ── */}
            {active === 'drawn' && (
              <div>
                <div className="drop-closed-banner">
                  <div className="drop-closed-hed">Draw Complete</div>
                  <div className="drop-closed-sub">{drop.edition} winners have been notified by email. Check your inbox.</div>
                </div>
                <p className="drop-fine" style={{ marginTop: 10, textAlign: 'center' }}>
                  Didn&apos;t win? Get notified for the next drop:
                </p>
                <div className="drop-notify-row" style={{ marginTop: 8 }}>
                  <input className="drop-notify-input" type="email" placeholder="your@email.com" />
                  <button className="drop-notify-btn">Notify Me</button>
                </div>
              </div>
            )}

            {/* ── STATE: WINNER (preview only) ── */}
            {active === 'winner' && (
              <div>
                <div className="drop-winner-banner">
                  <div className="drop-trophy">🏆</div>
                  <div className="drop-winner-hed">You Won.</div>
                  <div className="drop-winner-sub">
                    Your name was drawn. Complete purchase to claim your piece — your $1 entry has been credited. Invoice expires in 24 hours.
                  </div>
                  <button className="drop-btn-checkout">Complete Purchase — ${drop.price - drop.entryFee}</button>
                </div>
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
        <p className="eyebrow" style={{ marginBottom: 8 }}>Past Drops</p>
        <h2 className="drop-past-hed">Every edition. All sold.</h2>
        <div className="drop-past-grid">
          {[
            { name: 'Steph Curry — Splash Zone', meta: 'Edition of 50 · Nov 10, 2026' },
            { name: 'Steph Curry — Back-to-Back', meta: 'Edition of 30 · Oct 4, 2026' },
            { name: 'Steph Curry — Range', meta: 'Edition of 25 · Sep 1, 2026' },
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
