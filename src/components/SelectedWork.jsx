import { useState } from 'react';
import photos from '../data/photos.js';
import FavoriteToggle from './FavoriteToggle.jsx';

const categories = ['All', 'Portrait', 'Nature', 'Travel', 'Architecture'];

export default function SelectedWork() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoritesById, setFavoritesById] = useState({});

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
        <div className="mt-l grid grid-cols-[1fr] items-start gap-x-m gap-y-l md:grid-cols-[1fr_1fr]">
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
        </div>
    </section>
  );
}
