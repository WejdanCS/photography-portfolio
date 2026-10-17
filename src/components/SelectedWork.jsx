export default function SelectedWork() {
  return (
    <section className="py-(--section-spacing)" id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Selected Work</h2>
        <p>A collection of people, landscapes, and spaces that invite a closer look.</p>
        <div className="mt-l grid grid-cols-[1fr] items-start gap-x-m gap-y-l md:grid-cols-[1fr_1fr]">
            <figure className="min-w-0">
                <img className="w-full h-auto aspect-portrait object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&amp;fit=crop&amp;w=600&amp;h=800&amp;q=85" alt="A man looking toward the camera in soft outdoor light" width="600" height="800" loading="lazy" />
                <figcaption className="mt-s"><h3 className="mb-xs text-[1.5rem]">In Natural Light</h3><p className="m-0 text-[0.875rem] uppercase tracking-label">Portrait</p></figcaption>
            </figure>
            <figure className="min-w-0">
                <img className="w-full h-auto aspect-landscape object-cover" src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&amp;fit=crop&amp;w=900&amp;h=600&amp;q=85" alt="Sunlight filtering through tall trees in a green forest" width="900" height="600" loading="lazy" />
                <figcaption className="mt-s"><h3 className="mb-xs text-[1.5rem]">Through the Trees</h3><p className="m-0 text-[0.875rem] uppercase tracking-label">Nature</p></figcaption>
            </figure>
            <figure className="min-w-0">
                <img className="w-full h-auto aspect-landscape object-cover" src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&amp;fit=crop&amp;w=900&amp;h=600&amp;q=85" alt="An alpine lake beneath rugged mountains" width="900" height="600" loading="lazy" />
                <figcaption className="mt-s"><h3 className="mb-xs text-[1.5rem]">Quiet Horizons</h3><p className="m-0 text-[0.875rem] uppercase tracking-label">Travel</p></figcaption>
            </figure>
            <figure className="min-w-0">
                <img className="w-full h-auto aspect-portrait object-cover" src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&amp;fit=crop&amp;w=600&amp;h=800&amp;q=85" alt="Sculptural white architecture viewed against the sky" width="600" height="800" loading="lazy" />
                <figcaption className="mt-s"><h3 className="mb-xs text-[1.5rem]">Lines and Light</h3><p className="m-0 text-[0.875rem] uppercase tracking-label">Architecture</p></figcaption>
            </figure>
        </div>
    </section>
  );
}
