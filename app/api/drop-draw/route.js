import { DROP } from '../../../lib/dropConfig';

const SHOPIFY_DOMAIN = 'qwgc1w-vx.myshopify.com';

function adminFetch(query, variables) {
  return fetch('https://' + SHOPIFY_DOMAIN + '/admin/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  }).then(function (r) { return r.json(); });
}

// Fisher-Yates shuffle using crypto random values
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    var j = buf[0] % (i + 1);
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

export async function POST(req) {
  // Verify secret
  var secret = req.headers.get('x-draw-secret');
  if (!process.env.DROP_DRAW_SECRET || secret !== process.env.DROP_DRAW_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SHOPIFY_ADMIN_TOKEN) {
    return Response.json({ error: 'SHOPIFY_ADMIN_TOKEN env var not set' }, { status: 500 });
  }

  if (!DROP.entryVariantId) {
    return Response.json({ error: 'DROP.entryVariantId not configured in lib/dropConfig.js' }, { status: 400 });
  }

  try {
    // 1. Fetch all paid orders containing the entry fee variant
    var ordersQuery = `
      query getOrders($cursor: String) {
        orders(first: 250, after: $cursor, query: "financial_status:paid") {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              email
              lineItems(first: 20) {
                edges {
                  node {
                    variant { id }
                  }
                }
              }
            }
          }
        }
      }
    `;

    var allOrders = [];
    var cursor = null;
    var hasMore = true;

    while (hasMore) {
      var result = await adminFetch(ordersQuery, { cursor: cursor });
      var page = result.data?.orders;
      if (!page) break;
      page.edges.forEach(function (e) { allOrders.push(e.node); });
      hasMore = page.pageInfo.hasNextPage;
      cursor = page.pageInfo.endCursor;
    }

    // 2. Filter to orders containing the entry fee variant, deduplicate by email
    var seen = new Set();
    var entrants = [];
    allOrders.forEach(function (order) {
      if (!order.email) return;
      var hasEntry = order.lineItems.edges.some(function (li) {
        return li.node.variant?.id === DROP.entryVariantId;
      });
      if (hasEntry && !seen.has(order.email.toLowerCase())) {
        seen.add(order.email.toLowerCase());
        entrants.push(order.email);
      }
    });

    if (entrants.length === 0) {
      return Response.json({ error: 'No valid entrants found.' }, { status: 400 });
    }

    // 3. Shuffle and pick winners
    var numWinners = Math.min(DROP.edition, entrants.length);
    var shuffled = shuffle(entrants);
    var winners = shuffled.slice(0, numWinners);

    // 4. Create Draft Orders for each winner and send invoice
    var draftResults = [];
    var draftMutation = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder { id invoiceUrl }
          userErrors { message }
        }
      }
    `;
    var sendInvoiceMutation = `
      mutation draftOrderInvoiceSend($id: ID!) {
        draftOrderInvoiceSend(id: $id) {
          draftOrder { id }
          userErrors { message }
        }
      }
    `;

    for (var i = 0; i < winners.length; i++) {
      var winnerEmail = winners[i];
      var winnerPrice = String(DROP.price - DROP.entryFee);

      var draftRes = await adminFetch(draftMutation, {
        input: {
          email: winnerEmail,
          lineItems: [{
            title: DROP.title,
            originalUnitPrice: winnerPrice,
            quantity: 1,
          }],
          note: 'Drop winner — $1 entry fee credited. Original price: $' + DROP.price,
          tags: ['drop-winner'],
        },
      });

      var draft = draftRes.data?.draftOrderCreate?.draftOrder;
      if (!draft) {
        draftResults.push({ email: winnerEmail, error: 'Failed to create draft order' });
        continue;
      }

      // Send invoice email
      await adminFetch(sendInvoiceMutation, { id: draft.id });
      draftResults.push({ email: winnerEmail, draftOrderId: draft.id, invoiceUrl: draft.invoiceUrl });
    }

    return Response.json({
      success: true,
      totalEntrants: entrants.length,
      numWinners: winners.length,
      winners: draftResults,
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
