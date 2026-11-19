import ThemeToggle from './ThemeToggle';
import CartIcon from './CartIcon';

export default function Header() {
  return (
    <header>
      <div className="hbar">
        <a className="logo" href="/"><img src="/logo.png" alt="PocketMountz" /></a>
        <nav className="hnav">
          <a href="/collection" className="hide-sm">Collection</a>
          <a href="/drop" className="hide-sm">Drop</a>
          <a href="/auctions" className="hide-sm">Auction</a>
          <a href="/about" className="hide-sm">About</a>
          <CartIcon />
          <ThemeToggle />
        </nav>
      </div>
      <div className="hnav-sub">
        <a href="/collection">Collection</a>
        <a href="/drop">Drop</a>
        <a href="/auctions">Auction</a>
        <a href="/about">About</a>
      </div>
    </header>
  );
}
