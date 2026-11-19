export const DROP = {
  title: 'Steph Curry No. 30',
  subtitle: 'Golden State Warriors · 2023 Championship',
  edition: 30,
  price: 349,
  entryFee: 1,
  drawDate: 'Nov 27 · 10 AM PT',
  endsAt: '2026-11-27T18:00:00Z',
  imageUrl: '', // set to Shopify CDN image URL once you have one
  // ─── Shopify entry fee product ────────────────────────────────────────
  // Create a product called "Drop Entry Fee" priced at $1 in Shopify admin,
  // then paste its variant GID here:  gid://shopify/ProductVariant/XXXXXXXXX
  entryVariantId: '',
  // ─── Drop status (change this to control the page) ────────────────────
  // 'open'   → entry form live
  // 'closed' → entry closed, draw pending
  // 'drawn'  → draw complete, winners notified by email
  status: 'open',
};
