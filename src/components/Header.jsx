import { useEffect, useId, useState } from 'react';
import { pageContainer } from '../styles.js';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

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
        <a className="min-w-0 py-xs font-heading text-[1.25rem] no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#hero">Alex Morgan — Photography</a>
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
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#hero">Home</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#work">Selected Work</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#about">About</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#contact">Book a Shoot</a>
        </nav>
        <nav
          id={mobileMenuId}
          className={`${isMenuOpen ? 'flex' : 'hidden'} w-full flex-col border-t border-border pt-s md:hidden`}
          aria-label="Mobile navigation"
        >
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href="#hero" onClick={closeMenu}>Home</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href="#work" onClick={closeMenu}>Selected Work</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href="#about" onClick={closeMenu}>About</a>
          <a className="inline-flex min-h-target items-center py-xs no-underline hover:text-accent" href="#contact" onClick={closeMenu}>Book a Shoot</a>
        </nav>
    </header>
  );
}
