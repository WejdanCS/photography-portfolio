export default function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-heading">
        <div className="hero-content">
            <p className="small-label hero-label">Portrait · Lifestyle · Travel</p>
            <h1 id="hero-heading">Photography that tells a story</h1>
            <p className="hero-description">Honest portraits, quiet places, and the beauty of everyday moments, captured in natural light.</p>
            <div className="button-group">
                <a className="button button--secondary" href="#work">View Work</a>
                <a className="button button--primary" href="#contact">Book a Shoot</a>
            </div>
        </div>
        <figure className="hero-image">
            <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&amp;fit=crop&amp;w=1200&amp;q=85" alt="A wooden cabin beside a still lake surrounded by mountains" width="1200" height="800" fetchPriority="high" />
            <figcaption>A moment of stillness.</figcaption>
        </figure>
    </section>
  );
}
