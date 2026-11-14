import { shopify } from '../../lib/shopify';
import Header from '../Header';

export const dynamic = 'force-dynamic';

function money(p) {
  if (!p) return '';
  try { return '$' + Math.round(Number(p.amount)).toLocaleString(); } catch (e) { return ''; }
}

export default async function Collection() {
  let products = [];
  try {
    const d = await shopify('{ products(first:50){ edges { node { title handle priceRange { minVariantPrice { amount currencyCode } } images(first:1){ edges { node { url } } } } } } }');
    products = d.products.edges.map(function (e) { return e.node; });
  } catch (e) {}

  return (
    <>
      <Header />
      <div className="wrap">
        <section className="band first">
          <div className="slabel">The Collection</div>
          <div className="stitle">Every piece.</div>
          <p className="center" style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '-22px', marginBottom: '30px' }}>{products.length} works</p>
          <div className="pgrid">
            {products.map(function (p) {
              var img = p.images.edges[0] ? p.images.edges[0].node.url : null;
              return (
                <a className="pcard" href="/" key={p.handle}>
                  <div className="pimg">{img ? <img src={img} alt={p.title} /> : <span className="ph">PM</span>}</div>
                  <div className="pm">
                    <div className="pt">{p.title}</div>
                    <div className="pp">{money(p.priceRange.minVariantPrice)}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
