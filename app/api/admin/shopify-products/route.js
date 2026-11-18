const DOMAIN = 'qwgc1w-vx.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';
const SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  try {
    const { secret, query } = await req.json();
    if (!SECRET || secret !== SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const gql = `{
      products(first: 50${query ? `, query: "title:*${query}*"` : ''}) {
        edges {
          node {
            id
            title
            handle
            variants(first: 1) { edges { node { id price { amount } } } }
            media(first: 1) {
              edges {
                node {
                  mediaContentType
                  ... on MediaImage { image { url } }
                  ... on Video { sources { url mimeType } }
                }
              }
            }
          }
        }
      }
    }`;

    const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
      body: JSON.stringify({ query: gql }),
    });
    const data = await res.json();
    const products = data.data.products.edges.map(function ({ node }) {
      var media = node.media.edges[0]?.node;
      var image_url = null;
      if (media) {
        if (media.mediaContentType === 'IMAGE') image_url = media.image?.url;
        if (media.mediaContentType === 'VIDEO') image_url = media.sources?.find(s => s.mimeType === 'video/mp4')?.url;
      }
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        variant_id: node.variants.edges[0]?.node.id,
        price: node.variants.edges[0]?.node.price.amount,
        image_url,
      };
    });
    return Response.json({ products });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
