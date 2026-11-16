import { shopify } from '../../lib/shopify';
import Header from '../Header';
import Browse from '../Browse';

export const dynamic = 'force-dynamic';

export default async function Collection() {
  let collections = [];
  try {
    const d = await shopify(`{
      collections(first: 20) {
        edges {
          node {
            title
            handle
            image { url }
            products(first: 50) {
              edges {
                node {
                  title
                  handle
                  description
                  tags
                  availableForSale
                  priceRange { minVariantPrice { amount currencyCode } }
                  images(first: 1) { edges { node { url } } }
                }
              }
            }
          }
        }
      }
    }`);
    collections = d.collections.edges.map(function (e) { return e.node; });
  } catch (e) {}
  return (
    <>
      <Header />
      <div className="wrap collection-wrap">
        <Browse collections={collections} />
      </div>
    </>
  );
}
