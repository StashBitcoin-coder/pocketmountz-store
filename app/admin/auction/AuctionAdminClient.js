'use client';
import { useState, useCallback } from 'react';

function fmt(dt) {
  if (!dt) return '';
  return new Date(dt).toISOString().slice(0, 16);
}

export default function AuctionAdminClient() {
  var [secret, setSecret] = useState('');
  var [authed, setAuthed] = useState(false);
  var [auctions, setAuctions] = useState([]);
  var [form, setForm] = useState({
    product_handle: '', product_title: '', variant_id: '', image_url: '',
    starting_bid: '', reserve_price: '', starts_at: '', ends_at: '',
  });
  var [msg, setMsg] = useState('');
  var [loading, setLoading] = useState(false);
  var [editing, setEditing] = useState(null);
  var [products, setProducts] = useState([]);
  var [productSearch, setProductSearch] = useState('');
  var [productLoading, setProductLoading] = useState(false);
  var [pickerOpen, setPickerOpen] = useState(false);
  var [multiMode, setMultiMode] = useState(false);

  var fetchProducts = useCallback(async function (q) {
    setProductLoading(true);
    var res = await fetch('/api/admin/shopify-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, query: q || '' }),
    });
    var data = await res.json();
    setProductLoading(false);
    if (data.products) setProducts(data.products);
  }, [secret]);

  function pickProduct(p) {
    setForm(function (f) {
      return Object.assign({}, f, {
        product_handle: p.handle,
        product_title: p.title,
        variant_id: p.variant_id || '',
        image_url: p.image_url || '',
        starting_bid: f.starting_bid,
      });
    });
    setPickerOpen(false);
    setProductSearch('');
  }

  async function login() {
    setMsg('');
    var res = await fetch('/api/admin/list-auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    var data = await res.json();
    if (data.error) { setMsg(data.error); return; }
    setAuctions(data.auctions);
    var s = await fetch('/api/admin/settings').then(function (r) { return r.json(); });
    setMultiMode(s.settings?.multi_auction_mode === 'true');
    setAuthed(true);
  }

  async function toggleMultiMode() {
    var next = !multiMode;
    setMultiMode(next);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, key: 'multi_auction_mode', value: String(next) }),
    });
  }

  async function reload() {
    var res = await fetch('/api/admin/list-auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    var data = await res.json();
    if (data.auctions) setAuctions(data.auctions);
  }

  function set(k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    var endpoint = editing ? '/api/admin/update-auction' : '/api/admin/create-auction';
    var payload = Object.assign({}, form, { secret });
    if (payload.starts_at) payload.starts_at = new Date(payload.starts_at).toISOString();
    if (payload.ends_at) payload.ends_at = new Date(payload.ends_at).toISOString();
    if (payload.starting_bid) payload.starting_bid = Number(payload.starting_bid);
    if (payload.reserve_price) payload.reserve_price = Number(payload.reserve_price);
    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    var data = await res.json();
    setLoading(false);
    if (data.error) { setMsg('Error: ' + data.error); window.scrollTo(0,0); return; }
    setMsg(editing ? 'Updated!' : 'Auction created!');
    setForm({ product_handle: '', product_title: '', variant_id: '', image_url: '', starting_bid: '', reserve_price: '', starts_at: '', ends_at: '' });
    setEditing(null);
    reload();
  }

  async function endAuction(handle) {
    if (!confirm('End this auction now?')) return;
    await fetch('/api/admin/update-auction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, product_handle: handle, status: 'ended' }),
    });
    reload();
  }

  async function deleteAuction(handle) {
    if (!confirm('Permanently delete this auction and all its bids? This cannot be undone.')) return;
    var res = await fetch('/api/admin/delete-auction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, product_handle: handle }),
    });
    var data = await res.json();
    if (data.error) { alert(data.error); return; }
    reload();
  }

  function editAuction(a) {
    setEditing(a.product_handle);
    setForm({
      product_handle: a.product_handle,
      product_title: a.product_title,
      variant_id: a.variant_id,
      image_url: a.image_url || '',
      starting_bid: a.starting_bid,
      reserve_price: a.reserve_price || '',
      starts_at: fmt(a.starts_at),
      ends_at: fmt(a.ends_at),
    });
    window.scrollTo(0, 0);
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <h2 className="admin-heading">Auction Admin</h2>
        <div className="auction-field">
          <label>Admin Password</label>
          <input type="password" value={secret} onChange={function (e) { setSecret(e.target.value); }}
            onKeyDown={function (e) { if (e.key === 'Enter') login(); }} placeholder="Enter password" />
        </div>
        {msg && <p className="auction-error">{msg}</p>}
        <button className="btn gold" onClick={login} style={{width:'100%',marginTop:12}}>Log In</button>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div className="admin-cols">
        <div className="admin-form-col">
          <h2 className="admin-heading">{editing ? 'Edit Auction' : 'New Auction'}</h2>
          {editing && <p className="admin-editing-note">Editing: <strong>{editing}</strong> <button className="auction-back" onClick={function () { setEditing(null); setForm({ product_handle: '', product_title: '', variant_id: '', image_url: '', starting_bid: '', reserve_price: '', starts_at: '', ends_at: '' }); }}>Cancel</button></p>}
          {msg && <p className={msg.startsWith('Error') ? 'auction-error' : 'admin-success'} style={{marginBottom:16}}>{msg}</p>}
          <form onSubmit={submit} className="auction-form">
            {!editing && (
              <div className="auction-field">
                <label>Select from Shopify</label>
                {!pickerOpen
                  ? <button type="button" className="admin-btn" style={{width:'100%',padding:'10px',fontSize:13}} onClick={function () { setPickerOpen(true); fetchProducts(''); }}>Browse Products →</button>
                  : (
                    <div className="product-picker">
                      <input autoFocus value={productSearch} onChange={function (e) { setProductSearch(e.target.value); fetchProducts(e.target.value); }} placeholder="Search by name…" className="product-picker-search" />
                      <div className="product-picker-list">
                        {productLoading && <div className="product-picker-empty">Loading…</div>}
                        {!productLoading && products.length === 0 && <div className="product-picker-empty">No products found.</div>}
                        {products.map(function (p) {
                          return (
                            <button type="button" key={p.id} className="product-picker-row" onClick={function () { pickProduct(p); }}>
                              {p.image_url && (p.image_url.includes('.mp4') || p.image_url.includes('/videos/'))
                                ? <video src={p.image_url} className="product-picker-thumb" muted />
                                : p.image_url ? <img src={p.image_url} className="product-picker-thumb" alt="" />
                                : <div className="product-picker-thumb product-picker-ph">PM</div>}
                              <div className="product-picker-info">
                                <div className="product-picker-name">{p.title}</div>
                                <div className="product-picker-handle">{p.handle} · ${p.price}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <button type="button" className="auction-back" onClick={function () { setPickerOpen(false); }}>← Cancel</button>
                    </div>
                  )}
              </div>
            )}
            <div className="auction-field">
              <label>Product Handle</label>
              <input value={form.product_handle} onChange={function (e) { set('product_handle', e.target.value); }} placeholder="1952-topps-mantle" disabled={!!editing} />
            </div>
            <div className="auction-field">
              <label>Title</label>
              <input value={form.product_title} onChange={function (e) { set('product_title', e.target.value); }} placeholder="1952 Topps Mickey Mantle RC PSA 5" />
            </div>
            <div className="auction-field">
              <label>Shopify Variant ID</label>
              <input value={form.variant_id} onChange={function (e) { set('variant_id', e.target.value); }} placeholder="gid://shopify/ProductVariant/XXXXX" />
            </div>
            <div className="auction-field">
              <label>Image / Video URL</label>
              <input value={form.image_url} onChange={function (e) { set('image_url', e.target.value); }} placeholder="https://cdn.shopify.com/..." />
            </div>
            <div className="admin-row">
              <div className="auction-field">
                <label>Starting Bid ($)</label>
                <input type="number" value={form.starting_bid} onChange={function (e) { set('starting_bid', e.target.value); }} placeholder="25.00" min="1" step="0.01" />
              </div>
              <div className="auction-field">
                <label>Reserve Price ($) <span className="auction-optional">optional</span></label>
                <input type="number" value={form.reserve_price} onChange={function (e) { set('reserve_price', e.target.value); }} placeholder="none" min="1" step="0.01" />
              </div>
            </div>
            <div className="admin-row">
              <div className="auction-field">
                <label>Starts At</label>
                <input type="datetime-local" value={form.starts_at} onChange={function (e) { set('starts_at', e.target.value); }} />
              </div>
              <div className="auction-field">
                <label>Ends At</label>
                <input type="datetime-local" value={form.ends_at} onChange={function (e) { set('ends_at', e.target.value); }} />
              </div>
            </div>
            <button className="btn gold auction-submit" type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Update Auction' : 'Create Auction'}
            </button>
          </form>
        </div>

        <div className="admin-list-col">
          <div className="admin-setting-row">
            <div>
              <div className="admin-setting-label">Multiple Auction Mode</div>
              <div className="admin-setting-desc">{multiMode ? 'Showing all active auctions on the page' : 'Showing one auction at a time — others are queued'}</div>
            </div>
            <button className={'admin-toggle' + (multiMode ? ' on' : '')} onClick={toggleMultiMode}>
              <span className="admin-toggle-knob" />
            </button>
          </div>
          <h2 className="admin-heading" style={{marginTop:28}}>All Auctions</h2>
          {auctions.length === 0 && <p style={{color:'var(--text2)',fontSize:13}}>No auctions yet.</p>}
          {auctions.map(function (a) {
            return (
              <div className="admin-auction-row" key={a.id}>
                <div className="admin-auction-info">
                  <strong>{a.product_title}</strong>
                  <span className="admin-auction-meta">{a.product_handle} · ${a.current_bid} · {a.bid_count} bids · <span className={a.status === 'active' ? 'admin-status-active' : 'admin-status-ended'}>{a.status}</span></span>
                </div>
                <div className="admin-auction-actions">
                  <button className="admin-btn" onClick={function () { editAuction(a); }}>Edit</button>
                  {a.status === 'active' && <button className="admin-btn danger" onClick={function () { endAuction(a.product_handle); }}>End</button>}
                  {a.status !== 'active' && <button className="admin-btn danger" onClick={function () { deleteAuction(a.product_handle); }}>Delete</button>}
                  <a className="admin-btn" href={'/auction/' + a.product_handle} target="_blank" rel="noopener noreferrer">View</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
