export default function Header() {
  return (
    <header className="container site-header">
        <a className="site-brand" href="#hero">Alex Morgan — Photography</a>
        <nav className="site-nav" aria-label="Main navigation">
            <a href="#hero">Home</a>
            <a href="#work">Selected Work</a>
            <a href="#about">About</a>
            <a href="#contact">Book a Shoot</a>
        </nav>
    </header>
  );
}
