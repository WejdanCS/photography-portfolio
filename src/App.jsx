export default function App() {
  return (
    <>
      <header className="container site-header">
          <a className="site-brand" href="#hero">Alex Morgan — Photography</a>
          <nav className="site-nav" aria-label="Main navigation">
              <a href="#hero">Home</a>
              <a href="#work">Selected Work</a>
              <a href="#about">About</a>
              <a href="#contact">Book a Shoot</a>
          </nav>
      </header>

      <main className="container">
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

          <section id="work" aria-labelledby="work-heading">
              <h2 id="work-heading">Selected Work</h2>
              <p>A collection of people, landscapes, and spaces that invite a closer look.</p>
              <div className="gallery">
                  <figure className="gallery-item gallery-item--portrait">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&amp;fit=crop&amp;w=600&amp;h=800&amp;q=85" alt="A man looking toward the camera in soft outdoor light" width="600" height="800" loading="lazy" />
                      <figcaption><h3>In Natural Light</h3><p>Portrait</p></figcaption>
                  </figure>
                  <figure className="gallery-item">
                      <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&amp;fit=crop&amp;w=900&amp;h=600&amp;q=85" alt="Sunlight filtering through tall trees in a green forest" width="900" height="600" loading="lazy" />
                      <figcaption><h3>Through the Trees</h3><p>Nature</p></figcaption>
                  </figure>
                  <figure className="gallery-item">
                      <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&amp;fit=crop&amp;w=900&amp;h=600&amp;q=85" alt="An alpine lake beneath rugged mountains" width="900" height="600" loading="lazy" />
                      <figcaption><h3>Quiet Horizons</h3><p>Travel</p></figcaption>
                  </figure>
                  <figure className="gallery-item gallery-item--portrait">
                      <img src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&amp;fit=crop&amp;w=600&amp;h=800&amp;q=85" alt="Sculptural white architecture viewed against the sky" width="600" height="800" loading="lazy" />
                      <figcaption><h3>Lines and Light</h3><p>Architecture</p></figcaption>
                  </figure>
              </div>
          </section>

          <section id="about" className="about" aria-labelledby="about-heading">
              <img className="about-image" src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&amp;fit=crop&amp;w=600&amp;h=400&amp;q=85" alt="A camera held ready to capture a photograph" width="600" height="400" loading="lazy" />
              <div className="about-content">
                  <h2 id="about-heading">About</h2>
                  <p>I'm Alex, a photographer drawn to natural light and the stories in ordinary moments. My approach is relaxed and thoughtful, making room for people and places to feel like themselves.</p>
                  <a className="about-link" href="#contact">Let's create something together</a>
              </div>
          </section>

          <section id="contact" className="contact" aria-labelledby="contact-heading">
              <h2 id="contact-heading">Contact / Book a Shoot</h2>
              <p>Have a portrait session, a creative project, or a place in mind? Tell me a little about your idea.</p>
              <p id="form-note" className="contact-note">This form is a preview. Booking requests are not sent yet.</p>
              <form onSubmit={(event) => event.preventDefault()} className="contact-form" aria-describedby="form-note">
                  <div className="form-field">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" name="name" autoComplete="name" required />
                  </div>
                  <div className="form-field">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" autoComplete="email" required />
                  </div>
                  <div className="form-field">
                      <label htmlFor="session">Photography / Session type</label>
                      <select id="session" name="session" required>
                          <option value="">Choose a session type</option>
                          <option value="portrait">Portrait</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="travel">Travel</option>
                          <option value="architecture">Architecture</option>
                          <option value="other">Other</option>
                      </select>
                  </div>
                  <div className="form-field">
                      <label htmlFor="month">Preferred month (optional)</label>
                      <input type="month" id="month" name="month" />
                  </div>
                  <div className="form-field">
                      <label htmlFor="message">Tell me about your project</label>
                      <textarea id="message" name="message" rows="5" required></textarea>
                  </div>
                  <button className="button button--primary" type="submit" disabled>Send Inquiry</button>
              </form>
          </section>
      </main>

      <footer className="container site-footer">
          <div className="footer-info">
              <p className="footer-brand">Alex Morgan — Photography</p>
              <p className="footer-description">People, places, and everyday stories.</p>
          </div>
          <a className="footer-link" href="#hero">Back to top</a>
      </footer>
    </>
  );
}
