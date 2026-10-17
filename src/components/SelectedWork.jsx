export default function SelectedWork() {
  return (
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
  );
}
