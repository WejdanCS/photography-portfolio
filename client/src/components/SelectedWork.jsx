import { useEffect, useState } from 'react';
import FavoriteToggle from './FavoriteToggle.jsx';
import { secondaryButton } from '../styles.js';
import { apiErrorMessage } from '../lib/api.js';

const categories = ['All', 'Portrait', 'Nature', 'Travel', 'Architecture'];
const galleryStatus = 'mt-l flex min-h-[16rem] flex-col items-center justify-center border-y border-border px-m py-l text-center';

export default function SelectedWork() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoritesById, setFavoritesById] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadPhotos() {
      try {
        const response = await fetch('/api/photos', { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(data, 'Failed to fetch photos.'));
        if (!Array.isArray(data.data)) throw new Error('Invalid photos response.');

        if (!controller.signal.aborted) setPhotos(data.data);
      } catch {
        if (!controller.signal.aborted) {
          setError('Unable to load photos. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadPhotos();
    return () => controller.abort();
  }, [requestVersion]);

  function retryPhotos() {
    setError('');
    setIsLoading(true);
    setRequestVersion((version) => version + 1);
  }

  const visiblePhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((photo) => photo.category === selectedCategory);

  function updateFavorite(photoId, checked) {
    setFavoritesById((currentFavorites) => ({
      ...currentFavorites,
      [photoId]: checked,
    }));
  }

  return (
    <section className="scroll-mt-[14rem] py-(--section-spacing) md:scroll-mt-[7rem]" id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Selected Work</h2>
        <p>A collection of people, landscapes, and spaces that invite a closer look.</p>
        <div className="mt-m flex flex-wrap gap-xs" role="group" aria-label="Filter selected work by category">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                className={`min-h-target border px-s py-xs font-medium ${
                  isSelected
                    ? 'border-accent bg-accent text-background'
                    : 'border-border bg-transparent text-text-primary hover:border-text-primary'
                }`}
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
        {isLoading && (
          <div className={galleryStatus} role="status">
            <span
              className="mb-m h-m w-m rounded-full border-2 border-border border-t-accent motion-safe:animate-spin"
              aria-hidden="true"
            />
            <p className="mb-xs text-[0.875rem] font-medium uppercase tracking-label text-accent">Loading collection</p>
            <p className="m-0 text-text-secondary">The photographs will appear shortly.</p>
          </div>
        )}
        {error && (
          <div className={galleryStatus}>
            <div role="alert">
              <h3 className="mb-s">The collection is taking a moment</h3>
              <p className="mb-m text-text-secondary">{error}</p>
            </div>
            <button
              className={secondaryButton}
              type="button"
              onClick={retryPhotos}
            >
              Try again
            </button>
          </div>
        )}
        {!isLoading && !error && visiblePhotos.length === 0 && (
          <div className={galleryStatus} role="status">
            <h3 className="mb-s">{photos.length === 0 ? 'A collection in the making' : 'More to discover'}</h3>
            <p className="m-0 text-text-secondary">
              {photos.length === 0
                ? 'New photographs will be shared here soon.'
                : 'No photographs in this category yet. Explore the rest of the collection.'}
            </p>
            {photos.length > 0 && (
              <button className={`${secondaryButton} mt-m`} type="button" onClick={() => setSelectedCategory('All')}>
                View all work
              </button>
            )}
          </div>
        )}
        {!isLoading && !error && <div className="mt-l grid grid-cols-[1fr] items-start gap-x-m gap-y-l md:grid-cols-[1fr_1fr]">
            {visiblePhotos.map((photo) => (
              <figure className="min-w-0" key={photo.id}>
                <img
                  className={`h-auto w-full ${photo.aspectClass} object-cover`}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                />
                <figcaption className="mt-s flex items-start justify-between gap-s">
                  <div className="min-w-0">
                    <h3 className="mb-xs text-[1.5rem]">{photo.title}</h3>
                    <p className="m-0 text-[0.875rem] uppercase tracking-label">{photo.category}</p>
                  </div>
                  <FavoriteToggle
                    checked={Boolean(favoritesById[photo.id])}
                    label={photo.title}
                    onChange={(checked) => updateFavorite(photo.id, checked)}
                  />
                </figcaption>
              </figure>
            ))}
        </div>}
    </section>
  );
}
