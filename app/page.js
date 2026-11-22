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

        <section className="band crown-band first">
          <div className="crown-split">
            <div className="crown-text">
              <div className="slabel">The Crown</div>
              <div className="crown-serial">#2 &nbsp;·&nbsp; Bitcoin Ordinal Inscription</div>
              <h2 className="crown-story-title">To Be Continued&hellip;</h2>
              <p className="crown-story">The second PocketMountz piece ever inscribed on Bitcoin. Made in collaboration with a small group of people who believed that somewhere along the way, collecting lost its soul — traded off for grades, slabs, and market speculation.</p>
              <p className="crown-story">This card is the proof of concept. A real object, made by a real artist, with its existence permanently sealed on the oldest blockchain in the world. Not a certificate. Not a scan. The thing itself, proven.</p>
              <p className="crown-story">Collecting was never supposed to be an investment strategy. It was supposed to mean something. This is where that starts again.</p>
              {crown && <div className="pricechip crown-price">{money(crown.priceRange.minVariantPrice)}</div>}
              {crown && <a className="btn gold crown-btn" href="/collection">View the piece</a>}
            </div>
            <div className="crown-img-col">
              <img src="/crown-bg.jpg" alt="The Crown — PocketMountz #2" className="crown-photo" />
            </div>
          </div>
        </section>

        <section className="band">
          <div className="slabel">Real Fine Artists</div>
          <div className="stitle">The hands behind the work.</div>
          <div className="artistrow">
            {artists.map(function (a) {
              return (
                <a className="ai" href={'/collection?artist=' + a.handle} key={a.handle}>
                  <div className="av">
                    {a.image ? <img src={a.image.url} alt={a.title} /> : initials(a.title)}
                  </div>
                  <div className="nm">{a.title}</div>
                </a>
              );
            })}
          </div>
          <p className="artist-note">Every piece is credited, signed, and numbered. The artist is the art.</p>
        </section>

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
