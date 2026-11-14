const DOMAIN = 'e6e874-2.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';

export async function shopify(query, variables = {}) {
  const res = await fetch(`https://${DOMAIN}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}
