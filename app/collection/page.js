import { shopify } from '../../lib/shopify';
import Header from '../Header';
import Browse from '../Browse';

export const dynamic = 'force-dynamic';

async function fetchAllProducts(collectionHandle) {
  var products = [];
  var cursor = null;
  var hasMore = true;
  while (hasMore) {
    var after = cursor ? `, after: "${cursor}"` : '';
    var d = await shopify(`{
      collection(handle: "${collectionHandle}") {
        products(first: 250${after}) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              title handle description tags availableForSale createdAt
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url } } }
            }
          }
        }
      }
    }`);
    var page = d.collection.products;
    products = products.concat(page.edges.map(function (e) { return e.node; }));
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }
  return products;
}

export default async function Collection() {
  let collections = [];
  try {
    const d = await shopify(`{
      collections(first: 20) {
        edges {
          node {
            title handle description descriptionHtml
            image { url }
            metafield(namespace: "custom", key: "sort_order") { value }
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
    collections = await Promise.all(collections.map(async function (c) {
      var products = await fetchAllProducts(c.handle);
      return Object.assign({}, c, { products: { edges: products.map(function (p) { return { node: p }; }) } });
    }));
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
