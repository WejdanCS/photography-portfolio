import { useEffect, useId, useState } from 'react';
import { pageContainer } from '../styles.js';
import { Link, useLocation } from 'react-router';
import { authClient } from '../lib/auth-client.js';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const { pathname } = useLocation();
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const homeAnchor = (hash) => pathname === '/' ? hash : `/${hash}`;

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError('');
    try {
      const result = await authClient.signOut();
      if (result.error) setSignOutError('Unable to sign out. Please try again.');
      else setIsMenuOpen(false);
    } catch {
      setSignOutError('Unable to sign out. Please check your connection.');
    } finally {
      setIsSigningOut(false);
    }
  }

  const accountControls = isPending ? (
    <span className="py-xs text-[0.875rem] text-text-secondary" role="status">Checking session…</span>
  ) : sessionError ? (
    <button className="min-h-target cursor-pointer bg-transparent py-xs text-text-secondary underline" type="button" onClick={() => refetch()}>Retry session</button>
  ) : session ? (
    <>
      <span className="max-w-[12rem] truncate text-[0.875rem] text-text-secondary" title={session.user.name}>{session.user.name}</span>
      <button className="min-h-target cursor-pointer bg-transparent py-xs text-text-primary hover:text-accent disabled:cursor-wait" type="button" disabled={isSigningOut} onClick={handleSignOut}>
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  ) : (
    <Link className="inline-flex min-h-target items-center py-xs text-accent no-underline hover:underline" to="/login" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
  );

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`${pageContainer} sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-m border-b border-b-border bg-background py-m`}>
        <a className="min-w-0 py-xs font-heading text-[1.25rem] no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href={homeAnchor('#hero')}>Alex Morgan — Photography</a>
        <button
          className="inline-flex min-h-target min-w-target cursor-pointer items-center justify-center border border-text-primary bg-transparent p-xs text-text-primary md:hidden"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
        <nav className="hidden min-w-0 flex-wrap items-center gap-x-m gap-y-xs md:flex" aria-label="Main navigation">
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href={homeAnchor('#hero')}>Home</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href={homeAnchor('#work')}>Selected Work</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href={homeAnchor('#about')}>About</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href={homeAnchor('#contact')}>Book a Shoot</a>
            {accountControls}
        </nav>
        <nav
          id={mobileMenuId}
          className={`${isMenuOpen ? 'flex' : 'hidden'} w-full flex-col border-t border-border pt-s md:hidden`}
          aria-label="Mobile navigation"
        >
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href={homeAnchor('#hero')} onClick={closeMenu}>Home</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href={homeAnchor('#work')} onClick={closeMenu}>Selected Work</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href={homeAnchor('#about')} onClick={closeMenu}>About</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href={homeAnchor('#contact')} onClick={closeMenu}>Book a Shoot</a>
          {accountControls}
        </nav>
        {signOutError && <p className="mb-0 mt-s w-full border-l-2 border-accent pl-s text-[0.875rem]" role="alert">{signOutError}</p>}
    </header>
  );
}
