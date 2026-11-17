'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

const DOMAIN = 'qwgc1w-vx.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';

async function sfetch(query, variables) {
  const res = await fetch('https://' + DOMAIN + '/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  });
  const json = await res.json();
  return json.data;
}

var CART_FIELDS = `
  id checkoutUrl
  lines(first: 100) {
    edges { node {
      id quantity
      merchandise { ... on ProductVariant {
        id
        product {
          title
          images(first: 1) { edges { node { url } } }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }}
    }}
  }
`;

async function fetchCart(cartId) {
  var d = await sfetch(
    'query cartGet($id:ID!){cart(id:$id){' + CART_FIELDS + '}}',
    { id: cartId }
  );
  return d.cart;
}

export function CartProvider({ children }) {
  var [cart, setCart] = useState(null);
  var [drawerOpen, setDrawerOpen] = useState(false);
  var [loading, setLoading] = useState(false);

  useEffect(function () {
    try {
      var savedId = localStorage.getItem('pm_cart_id');
      if (savedId) {
        fetchCart(savedId).then(function (c) {
          if (c && c.lines.edges.length > 0) setCart(c);
          else localStorage.removeItem('pm_cart_id');
        }).catch(function () { localStorage.removeItem('pm_cart_id'); });
      }
    } catch (e) {}
  }, []);

  function saveCart(c) {
    setCart(c);
    try { localStorage.setItem('pm_cart_id', c.id); } catch (e) {}
  }

  var addToCart = useCallback(async function (variantId) {
    setLoading(true);
    try {
      var d;
      if (!cart) {
        d = await sfetch(
          'mutation cartCreate($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{' + CART_FIELDS + '}}}',
          { lines: [{ merchandiseId: variantId, quantity: 1 }] }
        );
        saveCart(d.cartCreate.cart);
      } else {
        d = await sfetch(
          'mutation cartLinesAdd($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{' + CART_FIELDS + '}}}',
          { cartId: cart.id, lines: [{ merchandiseId: variantId, quantity: 1 }] }
        );
        saveCart(d.cartLinesAdd.cart);
      }
    } catch (e) {
      console.error('Cart error', e);
    } finally {
      setLoading(false);
      setDrawerOpen(true);
    }
  }, [cart]);

  var removeFromCart = useCallback(async function (lineId) {
    if (!cart) return;
    var d = await sfetch(
      'mutation cartLinesRemove($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){cart{' + CART_FIELDS + '}}}',
      { cartId: cart.id, lineIds: [lineId] }
    );
    var updated = d.cartLinesRemove.cart;
    if (updated.lines.edges.length === 0) {
      setCart(null);
      try { localStorage.removeItem('pm_cart_id'); } catch (e) {}
    } else {
      saveCart(updated);
    }
  }, [cart]);

  var lines = cart ? cart.lines.edges.map(function (e) { return e.node; }) : [];
  var itemCount = lines.reduce(function (sum, l) { return sum + l.quantity; }, 0);

  // Force checkout URL to use the myshopify.com domain regardless of custom domain setting
  function safeCheckoutUrl(url) {
    if (!url) return null;
    try {
      var u = new URL(url);
      u.hostname = DOMAIN;
      return u.toString();
    } catch (e) { return url; }
  }

  return (
    <CartContext.Provider value={{
      addToCart: addToCart,
      removeFromCart: removeFromCart,
      lines: lines,
      itemCount: itemCount,
      checkoutUrl: safeCheckoutUrl(cart ? cart.checkoutUrl : null),
      drawerOpen: drawerOpen,
      setDrawerOpen: setDrawerOpen,
      loading: loading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
