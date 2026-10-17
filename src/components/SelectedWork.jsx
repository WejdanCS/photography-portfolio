import photos from '../data/photos.js';

export default function SelectedWork() {
  return (
    <section className="py-(--section-spacing)" id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Selected Work</h2>
        <p>A collection of people, landscapes, and spaces that invite a closer look.</p>
        <div className="mt-l grid grid-cols-[1fr] items-start gap-x-m gap-y-l md:grid-cols-[1fr_1fr]">
            {photos.map((photo) => (
              <figure className="min-w-0" key={photo.id}>
                <img
                  className={`h-auto w-full ${photo.aspectClass} object-cover`}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                />
                <figcaption className="mt-s">
                  <h3 className="mb-xs text-[1.5rem]">{photo.title}</h3>
                  <p className="m-0 text-[0.875rem] uppercase tracking-label">{photo.category}</p>
                </figcaption>
              </figure>
            ))}
        </div>
    </section>
  );
}
