import Header from '../Header';
import AboutContent from './AboutContent';
import { shopify } from '../../lib/shopify';

export const dynamic = 'force-dynamic';

export default async function About() {
  let artists = [];
  try {
    const d = await shopify(`{
      collections(first: 20) {
        edges { node { title handle description image { url } metafield(namespace:"custom",key:"sort_order"){ value } } }
      }
    }`);
    artists = d.collections.edges.map(function (e) { return e.node; });
    artists.sort(function (a, b) {
      var ao = a.metafield ? parseInt(a.metafield.value) : 999;
      var bo = b.metafield ? parseInt(b.metafield.value) : 999;
      return ao - bo;
    });
  } catch (e) {}
  return (
    <>
      <Header />
      <AboutContent artists={artists} />
    </>
  );
}


const PILLS = [
  { id: 'work',     title: 'The Work',        sub: 'Built by hand. Finished to last.' },
  { id: 'license',  title: 'The License',     sub: 'Official Curry NIL license.' },
  { id: 'artists',  title: 'The Artists',     sub: 'Named artists. Real bios.' },
  { id: 'ordinals', title: 'The Inscription', sub: 'Provenance sealed on Bitcoin.' }
];

function initials(name) {
  return name.split(' ').map(function (w) { return w[0]; }).join('');
}

export default function About() {
  const [open, setOpen] = useState(null);
  const detailRef = useRef(null);

  useEffect(function () {
    if (open && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [open]);

  function toggle(id) {
    setOpen(open === id ? null : id);
  }

  return (
    <>
      <Header />
      <div className="wrap about-wrap">
        <p className="eyebrow">Who We Are</p>
        <h1 className="about-h1">Integrity.<br />Witnessed.</h1>
        <p className="about-lead">PocketMountz publishes officially licensed Stephen Curry fine art collectibles — museum-quality pieces made by real artists, built to last, with provenance you can verify.</p>

        <div className="about-pills">
          {PILLS.map(function (p) {
            return (
              <button
                key={p.id}
                className={'about-pill' + (open === p.id ? ' active' : '')}
                onClick={function () { toggle(p.id); }}
              >
                <span className="about-pill-title"><span className="about-pill-dia">&#9670;</span> {p.title}</span>
                <span className="about-pill-sub">{p.sub}</span>
              </button>
            );
          })}
        </div>

        {open && (
          <div className="about-detail" ref={detailRef}>
            <div className="about-detail-inner">

              {open === 'work' && (
                <>
                  <div className="about-detail-label">The Work</div>
                  <div className="about-detail-title">Every piece is built, not printed.</div>
                  <div className="about-detail-body">
                    <p>These aren&rsquo;t posters. Each PocketMountz is a hand-finished fine art object &mdash; archival pigmented ink on metallic pearl paper, face-mounted to museum glass, backed with duck-woven cotton watercolor paper, and finished with a diamond edge. The result holds up under a loupe.</p>
                    <p>Everything is a reproduction of original licensed artwork. No digital file is the product &mdash; the physical object is.</p>
                    <div className="about-mat-callout">Archival Pigmented Ink &middot; Metallic Pearl Paper &middot; Museum Glass Face-Mount &middot; Duck-Woven Cotton Watercolor Backs And Select Foil Chase Backs &middot; Diamond Edge Finish</div>
                  </div>
                </>
              )}

              {open === 'license' && (
                <>
                  <div className="about-detail-label">The License</div>
                  <div className="about-detail-title">Official. Not a reproduction of a reproduction.</div>
                  <div className="about-detail-body">
                    <p>We hold an active Stephen Curry NIL license. Every piece in the collection is authorized &mdash; not fan art, not unlicensed. William Wade, founder of PocketMountz, holds the license directly. That matters when you&rsquo;re buying something to keep.</p>
                    <p>Authentication available on request.</p>
                  </div>
                </>
              )}

              {open === 'artists' && (
                <>
                  <div className="about-detail-label">The Artists</div>
                  <div className="about-detail-title">Named artists. Not stock.</div>
                  <div className="about-detail-body">
                    <p>Every piece in the collection is attributed to a real working artist. Buy the work because you know who made it.</p>
                    <div className="about-artists-grid">
                      {ARTISTS.map(function (a, i) {
                        return (
                          <div className="about-acard" key={i}>
                            <div className="about-av">{initials(a.name)}</div>
                            <div className="about-aname">{a.name}</div>
                            <div className="about-abio">{a.bio}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {open === 'ordinals' && (
                <>
                  <div className="about-detail-label">The Inscription</div>
                  <div className="about-detail-title">Provenance no hologram can match.</div>
                  <div className="about-detail-body">
                    <p>A Bitcoin inscription proves what happened, when, and between whom. That&rsquo;s it. That&rsquo;s all it should do. The <em>Proof of Receipt</em> white paper makes the case for pairing a physical object with an inscription as its permanent provenance record &mdash; not replacing the art, just witnessing it. Calling a receipt the art was always the problem. Turns out, a JPEG of a receipt isn&rsquo;t worth much either.</p>
                    <p>At PocketMountz, we call these <strong>Origin Keys</strong> &mdash; Ordinal Inscriptions with a SeedPod encapsulated inside the PocketMountz physical piece. The object carries the art. The inscription carries the proof. Neither replaces the other.</p>
                    <div className="about-ord-callout">
                      <div className="about-ord-dia">&#9670;</div>
                      <p>Where a hologram asks you to trust a sticker, an Origin Key asks you to trust math. Inscribed once. Verifiable forever.{' '}
                        <a href="https://genesis.immutableeditions.com/news/proof-of-receipt/Proof-of-Receipt-White-Paper.pdf" target="_blank" rel="noopener noreferrer" className="about-ord-link">Read the Proof of Receipt white paper &rarr;</a>
                      </p>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
}
