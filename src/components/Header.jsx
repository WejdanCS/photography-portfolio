import { pageContainer } from '../styles.js';

export default function Header() {
  return (
    <header className={`${pageContainer} sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-m gap-y-s border-b border-b-border bg-background py-m`}>
        <a className="min-w-0 py-xs font-heading text-[1.25rem] no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#hero">Alex Morgan — Photography</a>
        <nav className="flex min-w-0 flex-wrap items-center gap-x-m gap-y-xs" aria-label="Main navigation">
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#hero">Home</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#work">Selected Work</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#about">About</a>
            <a className="inline-flex min-h-target items-center py-xs no-underline hover:underline hover:decoration-accent hover:underline-offset-[0.3em]" href="#contact">Book a Shoot</a>
        </nav>
    </header>
  );
}
