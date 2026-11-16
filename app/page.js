import { shopify } from '../lib/shopify';
import Header from './Header';

export const dynamic = 'force-dynamic';

function money(p) {
  if (!p) return '';
  try { return '$' + Math.round(Number(p.amount)).toLocaleString(); } catch (e) { return ''; }
}

function initials(name) {
  return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

export default async function Home() {
  let products = [];
  let artists = [];
  try {
    const d = await shopify(`{
      collections(first: 20) {
        edges { node { title handle image { url } } }
      }
      products(first: 8) {
        edges { node { title handle priceRange { minVariantPrice { amount currencyCode } } images(first:1){ edges { node { url } } } } }
      }
    }`);
    products = d.products.edges.map(function (e) { return e.node; });
    artists = d.collections.edges.map(function (e) { return e.node; });
  } catch (e) {}

  const crown = products[0];
  const grid = products.slice(1, 6);

  return (
    <>
      <Header />
      <div className="wrap">

        <section className="band first">
          <div className="slabel">Real Fine Artists</div>
          <div className="stitle">The hands behind the work.</div>
          <div className="artistrow">
            {artists.map(function (a) {
              return (
                <div className="ai" key={a.handle}>
                  <div className="av">
                    {a.image ? <img src={a.image.url} alt={a.title} /> : initials(a.title)}
                  </div>
                  <div className="nm">{a.title}</div>
                </div>
              );
            })}
          </div>
          <p className="artist-note">Every piece is credited, signed, and numbered. The artist is the art.</p>
        </section>

        {crown ? (
          <section className="band">
            <div className="slabel">The Crown</div>
            <div className="stitle">One piece. One of one.</div>
            <div className="crown">
              <div className="cart">
                {crown.images.edges[0] ? <img src={crown.images.edges[0].node.url} alt={crown.title} /> : <span className="ph">PM</span>}
              </div>
              <div className="ct">
                <div className="ce">Signed &middot; Authenticated on Bitcoin</div>
                <h3>{crown.title}</h3>
                <p>The moment, made permanent &mdash; a one-of-one fine collectable, inscribed on the Bitcoin blockchain the day it was made. The only signed piece that carries its own proof of authenticity.</p>
                <div className="pricechip">{money(crown.priceRange.minVariantPrice)}</div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="band">
          <div className="slabel">Why It&rsquo;s Different</div>
          <div className="stitle">Not another trading card.</div>
          <div className="beats">
            <div className="beat"><div className="bi">&#9632;</div><h4>Fine art, not prints</h4><p>Archival pigment on metallic pearl, face-mounted to museum glass, diamond-edge finished. A real object, built to last.</p></div>
            <div className="beat"><div className="bi">&#10022;</div><h4>Signed by the athlete</h4><p>Select works are hand-signed &mdash; licensed, authentic, and rare.</p></div>
            <div className="beat"><div className="bi">&#9670;</div><h4>Proven on Bitcoin</h4><p>An Ordinal inscription seals provenance on the oldest blockchain. Verifiable by anyone, forever.</p></div>
          </div>
        </section>

        {grid.length ? (
          <section className="band">
            <div className="slabel">A First Look</div>
            <div className="stitle">Preview the collection.</div>
            <div className="pgrid">
              {grid.map(function (p) {
                var img = p.images.edges[0] ? p.images.edges[0].node.url : null;
                return (
                  <a className="pcard" href="/collection" key={p.handle}>
                    <div className="pimg">{img ? <img src={img} alt={p.title} /> : <span className="ph">PM</span>}</div>
                    <div className="pm">
                      <div className="pt">{p.title}</div>
                      <div className="pp">{money(p.priceRange.minVariantPrice)}</div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="center"><a className="btn gold" href="/collection">Browse everything</a></div>
          </section>
        ) : null}

      </div>

      <footer>
        <div className="fbf">New drops, first.</div>
        <div className="fsub">Join the list for new releases and auctions.</div>
        <form className="capture">
          <input type="email" placeholder="your@email.com" aria-label="email" />
          <button type="button">Get First Access</button>
        </form>
        <div className="flinks">PocketMountz &nbsp;&middot;&nbsp; Real fine art, real artists &nbsp;&middot;&nbsp; Verify on-chain</div>
      </footer>
    </>
  );
}
