import Header from '../Header';
import AboutContent from './AboutContent';
import { shopify } from '../../lib/shopify';

export const dynamic = 'force-dynamic';

export default async function About() {
  let artists = [];
  try {
    const d = await shopify(`{
      collections(first: 20) {
        edges { node { title handle description descriptionHtml image { url } metafield(namespace:"custom",key:"sort_order"){ value } } }
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
