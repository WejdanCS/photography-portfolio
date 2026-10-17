export default function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-heading">
        <img className="about-image" src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&amp;fit=crop&amp;w=600&amp;h=400&amp;q=85" alt="A camera held ready to capture a photograph" width="600" height="400" loading="lazy" />
        <div className="about-content">
            <h2 id="about-heading">About</h2>
            <p>I'm Alex, a photographer drawn to natural light and the stories in ordinary moments. My approach is relaxed and thoughtful, making room for people and places to feel like themselves.</p>
            <a className="about-link" href="#contact">Let's create something together</a>
        </div>
    </section>
  );
}
