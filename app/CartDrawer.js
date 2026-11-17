'use client';
import { useCart } from './CartContext';

function money(amount) {
  try { return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return ''; }
}

export default function CartDrawer() {
  var { lines, itemCount, checkoutUrl, drawerOpen, setDrawerOpen, removeFromCart } = useCart();

  var subtotal = lines.reduce(function (sum, l) {
    var amt = l.merchandise.product.priceRange.minVariantPrice.amount;
    return sum + Number(amt) * l.quantity;
  }, 0);

  return (
    <>
      {drawerOpen && (
        <div className="cart-overlay" onClick={function () { setDrawerOpen(false); }} />
      )}
      <div className={'cart-drawer' + (drawerOpen ? ' open' : '')}>
        <div className="cart-drawer-head">
          <span className="cart-drawer-title">Your Cart {itemCount > 0 && <span className="cart-drawer-count">({itemCount})</span>}</span>
          <button className="cart-drawer-close" onClick={function () { setDrawerOpen(false); }}>✕</button>
        </div>

        <div className="cart-drawer-body">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            lines.map(function (line) {
              var product = line.merchandise.product;
              var img = product.images.edges[0] ? product.images.edges[0].node.url : null;
              var price = product.priceRange.minVariantPrice.amount;
              return (
                <div className="cart-line" key={line.id}>
                  <div className="cart-line-img">
                    {img ? <img src={img} alt={product.title} /> : <span className="cart-line-ph">PM</span>}
                  </div>
                  <div className="cart-line-info">
                    <div className="cart-line-title">{product.title}</div>
                    <div className="cart-line-price">{money(price)}</div>
                  </div>
                  <button className="cart-remove" onClick={function () { removeFromCart(line.id); }} title="Remove">✕</button>
                </div>
              );
            })
          )}
        </div>

        {lines.length > 0 && (
          <div className="cart-drawer-foot">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <a className="btn gold cart-checkout-btn" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
