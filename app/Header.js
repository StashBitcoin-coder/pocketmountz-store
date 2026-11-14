import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header>
      <div className="hbar">
        <a className="logo" href="/"><img src="/logo.png" alt="PocketMountz" /></a>
        <nav className="hnav">
          <a href="/collection">Collection</a>
          <a href="/">Drops</a>
          <a href="/">Auctions</a>
          <a href="/">About</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
