'use client';
import { useState } from 'react';

const ARTISTS = [
  { id: 'all', label: 'All', init: '◆' },
  { id: 'jane', label: 'Jane Doe', init: 'JD' },
  { id: 'mia', label: 'Mia Chen', init: 'MC' },
  { id: 'leo', label: 'Leo Park', init: 'LP' },
  { id: 'ray', label: 'Ray Vasquez', init: 'RV' },
  { id: 'nina', label: 'Nina Osei', init: 'NO' }
];

function money(p) {
  if (!p) return '';
  try { return '$' + Math.round(Number(p.amount)).toLocaleString(); } catch (e) { return ''; }
}

export default function Browse({ products }) {
  const [artist, setArtist] = useState('all');
  const [tier, setTier] = useState('all');
  const [status, setStatus] = useState('all');
  const [sale, setSale] = useState('all');

  const shown = products;

  return (
    <section className="band first">
      <div className="slabel">The Collection</div>
      <div className="stitle">Every piece.</div>

      <div className="arowlabel">Artists</div>
      <div className="browse-arow">
        {ARTISTS.map(function (a) {
          return (
            <button className={'browse-ai' + (artist === a.id ? ' active' : '')} key={a.id} onClick={function () { setArtist(a.id); }}>
              <span className={'bav' + (a.id === 'all' ? ' allav' : '')}>{a.init}</span>
              <span className="blbl">{a.label}</span>
            </button>
          );
        })}
      </div>

      <div className="controls">
        <div className="sel"><select value={tier} onChange={function (e) { setTier(e.target.value); }}>
          <option value="all">All Tiers</option>
          <option value="plain">Plain</option>
          <option value="ordinal">Ordinal</option>
          <option value="signed">Signed</option>
        </select></div>
        <div className="sel"><select value={status} onChange={function (e) { setStatus(e.target.value); }}>
          <option value="all">All Status</option>
          <option value="sale">For Sale</option>
          <option value="sold">Sold</option>
        </select></div>
        <div className="sel"><select value={sale} onChange={function (e) { setSale(e.target.value); }}>
          <option value="all">All Sales</option>
          <option value="buy">Buy Now</option>
          <option value="auction">Auction</option>
        </select></div>
      </div>

      <p className="bcount"><b>{shown.length}</b> works</p>

      <div className="pgrid">
        {shown.map(function (p) {
          var img = p.images.edges[0] ? p.images.edges[0].node.url : null;
          return (
            <a className="pcard" href="/" key={p.handle}>
              <div className="pimg">{img ? <img src={img} alt={p.title} /> : <span className="ph">PM</span>}</div>
              <div className="pm">
                <div className="pt">{p.title}</div>
                <div className="pfoot">
                  <span className="pp">{money(p.priceRange.minVariantPrice)}</span>
                  <span className="btag">Buy Now</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
