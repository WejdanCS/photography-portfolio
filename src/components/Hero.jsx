import { primaryButton, secondaryButton } from '../styles.js';

export default function Hero() {
  return (
    <section id="hero" className="grid grid-cols-1 items-center gap-l py-(--section-spacing) lg:grid-cols-[1fr_1.2fr] lg:gap-(--hero-gap)" aria-labelledby="hero-heading">
        <div className="min-w-0">
            <p className="mb-m text-[0.875rem] uppercase tracking-label">Portrait · Lifestyle · Travel</p>
            <h1 className="max-w-[12ch] text-balance" id="hero-heading">Photography that tells a story</h1>
            <p className="max-w-[42ch] text-intro">Honest portraits, quiet places, and the beauty of everyday moments, captured in natural light.</p>
            <div className="mt-m mb-0 flex flex-wrap gap-s">
                <a className={secondaryButton} href="#work">View Work</a>
                <a className={primaryButton} href="#contact">Book a Shoot</a>
            </div>
        </div>
        <figure className="min-w-0">
            <img className="w-full h-auto aspect-landscape object-cover" src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&amp;fit=crop&amp;w=1200&amp;q=85" alt="A wooden cabin beside a still lake surrounded by mountains" width="1200" height="800" fetchPriority="high" />
            <figcaption className="text-[0.875rem]">A moment of stillness.</figcaption>
        </figure>
    </section>
  );
}
