import { pageContainer } from '../styles.js';
import { useLocation } from 'react-router';

export default function Footer() {
  const { pathname } = useLocation();
  return (
    <footer className={`${pageContainer} flex flex-col items-start gap-m border-t border-t-border py-m md:flex-row md:flex-wrap md:items-center md:justify-between`}>
        <div className="min-w-0">
            <p className="mb-xs font-heading">Alex Morgan — Photography</p>
            <p className="m-0 text-text-secondary">People, places, and everyday stories.</p>
        </div>
        <a className="inline-flex min-h-target items-center py-xs decoration-accent underline-offset-[0.3em] hover:decoration-2" href={pathname === '/' ? '#hero' : '/#hero'}>Back to top</a>
    </footer>
  );
}
