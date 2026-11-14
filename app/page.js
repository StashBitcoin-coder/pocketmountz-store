import { shopify } from '../lib/shopify';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let ok = false, shopName = '', items = [], err = '';
  try {
    const d = await shopify('{ shop { name } products(first:5){ edges { node { title handle } } } }');
    ok = true;
    shopName = d.shop.name;
    items = d.products.edges.map(function (e) { return e.node; });
  } catch (e) { err = String((e && e.message) || e); }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ color: 'var(--white)', fontSize: 32, marginBottom: 8 }}>PocketMountz</h1>
      <p style={{ color: 'var(--gold)', marginBottom: 24, letterSpacing: '.05em' }}>Store skeleton — connection check</p>
      {ok ? (
        <div>
          <p style={{ marginBottom: 12 }}>Connected to Shopify: <b style={{ color: 'var(--white)' }}>{shopName}</b></p>
          <p style={{ marginBottom: 8 }}>Products found: {items.length}</p>
          <ul style={{ paddingLeft: 18 }}>
            {items.map(function (p) { return <li key={p.handle} style={{ color: 'var(--text)' }}>{p.title}</li>; })}
          </ul>
          {items.length === 0 ? <p style={{ color: 'var(--text)' }}>No products yet — that is fine, we will add them.</p> : null}
        </div>
      ) : (
        <div>
          <p style={{ color: '#e07a5f', marginBottom: 10 }}>Not connected yet.</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#888', fontSize: 12 }}>{err}</pre>
          <p style={{ marginTop: 12 }}>Check the two environment variables in Vercel, then redeploy.</p>
        </div>
      )}
    </main>
  );
}
