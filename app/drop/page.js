import Header from '../Header';
import DropClient from './DropClient';
import { DROP } from '../../lib/dropConfig';

export default function DropPage() {
  return (
    <>
      <Header />
      <div className="wrap drop-page">
        <DropClient drop={DROP} />
      </div>
    </>
  );
}
