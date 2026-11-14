import { shopify } from '../../lib/shopify';
import Header from '../Header';
import Browse from '../Browse';

export const dynamic = 'force-dynamic';

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
        <Browse products={products} />
      </div>
    </>
  );
}
