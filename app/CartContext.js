'use client';
import { createContext, useContext, useState, useCallback } from 'react';

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

export function CartProvider({ children }) {
  var [cart, setCart] = useState(null);
  var [drawerOpen, setDrawerOpen] = useState(false);
  var [loading, setLoading] = useState(false);

  var addToCart = useCallback(async function (variantId) {
    setLoading(true);
    try {
      var d;
      if (!cart) {
        d = await sfetch(
          'mutation cartCreate($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{' + CART_FIELDS + '}}}',
          { lines: [{ merchandiseId: variantId, quantity: 1 }] }
        );
        setCart(d.cartCreate.cart);
      } else {
        d = await sfetch(
          'mutation cartLinesAdd($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{' + CART_FIELDS + '}}}',
          { cartId: cart.id, lines: [{ merchandiseId: variantId, quantity: 1 }] }
        );
        setCart(d.cartLinesAdd.cart);
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
    setCart(d.cartLinesRemove.cart);
  }, [cart]);

  var lines = cart ? cart.lines.edges.map(function (e) { return e.node; }) : [];
  var itemCount = lines.reduce(function (sum, l) { return sum + l.quantity; }, 0);

  return (
    <CartContext.Provider value={{
      addToCart: addToCart,
      removeFromCart: removeFromCart,
      lines: lines,
      itemCount: itemCount,
      checkoutUrl: cart ? cart.checkoutUrl : null,
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
