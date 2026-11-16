'use client';
import { useState } from 'react';

function money(p) {
  if (!p) return '';
  try { return '$' + Math.round(Number(p.amount)).toLocaleString(); } catch (e) { return ''; }
}

function initials(name) {
  return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

export default function Browse({ collections }) {
  const [artist, setArtist] = useState(null);
  const [tier, setTier] = useState('all');
  const [status, setStatus] = useState('all');
  const [sale, setSale] = useState('all');
  const [modal, setModal] = useState(null);

  const seen = new Set();
  const allProducts = [];
  collections.forEach(function (c) {
    c.products.edges.forEach(function (e) {
      if (!seen.has(e.node.handle)) {
        seen.add(e.node.handle);
        allProducts.push(Object.assign({}, e.node, { collectionHandle: c.handle }));
      }
    });
  });

  var shown = [];
  if (artist !== null) {
    shown = artist === 'all'
      ? allProducts.slice()
      : allProducts.filter(function (p) { return p.collectionHandle === artist; });

    if (tier !== 'all') shown = shown.filter(function (p) { return p.tags.includes('tier:' + tier); });
    if (status === 'for-sale') shown = shown.filter(function (p) { return p.availableForSale; });
    if (status === 'sold') shown = shown.filter(function (p) { return !p.availableForSale; });
    // sale filter only meaningful when not filtering for sold
    if (status !== 'sold') {
      if (sale === 'auction') shown = shown.filter(function (p) { return p.tags.includes('sale:auction'); });
      if (sale === 'buy-now') shown = shown.filter(function (p) { return !p.tags.includes('sale:auction'); });
    }
  }

  function handleStatus(val) {
    setStatus(val);
    if (val === 'sold') setSale('all');
  }

  function clearFilters() {
    setTier('all');
    setStatus('all');
    setSale('all');
  }

  return (
    <div>
      <p className="eyebrow">The Collection</p>
      <h1 className="col-title">The Collection</h1>
      <p className="sub">Every piece in one place. Tap an artist, or filter the lot.</p>

      <div className="arowlabel">Artists</div>
      <div className="browse-arow">
        <button
          className={'browse-ai' + (artist === 'all' ? ' active' : '')}
          onClick={function () { setArtist('all'); }}
        >
          <span className="bav allav">◆</span>
          <span className="blbl">All</span>
        </button>
        {collections.map(function (c) {
          return (
            <button
              className={'browse-ai' + (artist === c.handle ? ' active' : '')}
              key={c.handle}
              onClick={function () { setArtist(c.handle); }}
            >
              {c.image
                ? <img className="bavimg" src={c.image.url} alt={c.title} />
                : <span className="bav">{initials(c.title)}</span>
              }
              <span className="blbl">{c.title}</span>
            </button>
          );
        })}
      </div>

      {artist !== null && (
        <>
          <div className="controls">
            <div className="sel">
              <select value={tier} onChange={function (e) { setTier(e.target.value); }}>
                <option value="all">All Tiers</option>
                <option value="plain">Plain</option>
                <option value="ordinal">Ordinal</option>
                <option value="signed">Signed</option>
              </select>
            </div>
            <div className="sel">
              <select value={status} onChange={function (e) { handleStatus(e.target.value); }}>
                <option value="all">All Status</option>
                <option value="for-sale">For Sale</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className={'sel' + (status === 'sold' ? ' sel-disabled' : '')}>
              <select value={sale} disabled={status === 'sold'} onChange={function (e) { setSale(e.target.value); }}>
                <option value="all">All Sales</option>
                <option value="buy-now">Buy Now</option>
                <option value="auction">Auction</option>
              </select>
            </div>
            <button className="clear-btn" onClick={clearFilters}>Clear</button>
          </div>
          <p className="bcount"><b>{shown.length}</b> works</p>
          <div className="pgrid">
            {shown.map(function (p) {
              var img = p.images.edges[0] ? p.images.edges[0].node.url : null;
              return (
                <button className="pcard" key={p.handle} onClick={function () { setModal(p); }}>
                  <div className="pimg">
                    {img ? <img src={img} alt={p.title} /> : <span className="ph">PM</span>}
                    {!p.availableForSale && <div className="sold-badge">SOLD</div>}
                  </div>
                  <div className="pm">
                    <div className="pt">{p.title}</div>
                    <div className="pfoot">
                      <span className="pp">{money(p.priceRange.minVariantPrice)}</span>
                      <span className={'btag' + (!p.availableForSale ? ' btag-sold' : '')}>
                        {!p.availableForSale ? 'Sold' : p.tags.includes('sale:auction') ? 'Auction' : 'Buy Now'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {artist === null && (
        <div className="empty-state">
          <p>Select an artist or <strong>All</strong> to browse the collection.</p>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={function () { setModal(null); }}>
          <div className="modal-box" onClick={function (e) { e.stopPropagation(); }}>
            <button className="modal-close" onClick={function () { setModal(null); }}>✕</button>
            <div className="modal-img">
              {modal.images.edges[0]
                ? <img src={modal.images.edges[0].node.url} alt={modal.title} />
                : <span className="ph">PM</span>
              }
              {!modal.availableForSale && <div className="modal-sold-banner">SOLD</div>}
            </div>
            <div className="modal-info">
              <h2>{modal.title}</h2>
              <div className="modal-price">{money(modal.priceRange.minVariantPrice)}</div>
              {modal.availableForSale
                ? modal.description && <p className="modal-desc">{modal.description}</p>
                : <p className="modal-locked">🔒 Sign in to view details on sold works.</p>
              }
              {modal.tags.length > 0 && (
                <div className="modal-tags">
                  {modal.tags.map(function (t) {
                    return <span className="modal-tag" key={t}>{t.replace(':', ' · ')}</span>;
                  })}
                </div>
              )}
              {modal.availableForSale && (
                <a
                  className="btn gold modal-btn"
                  href={'https://qwgc1w-vx.myshopify.com/products/' + modal.handle}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {modal.tags.includes('sale:auction') ? 'View Auction' : 'Buy Now'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
