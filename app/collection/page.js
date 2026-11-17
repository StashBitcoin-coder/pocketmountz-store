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
            description
            descriptionHtml
            image { url }
            metafield(namespace: "custom", key: "sort_order") { value }
            products(first: 200) {
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
    collections.sort(function (a, b) {
      var ao = a.metafield ? parseInt(a.metafield.value) : 999;
      var bo = b.metafield ? parseInt(b.metafield.value) : 999;
      return ao - bo;
    });
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
