export default function FavoriteToggle({ checked, onChange, label }) {
  const actionLabel = `${checked ? 'Remove' : 'Add'} ${label} ${checked ? 'from' : 'to'} favorites`;

  return (
    <button
      className={`inline-flex size-target shrink-0 items-center justify-center border text-[1.25rem] leading-none ${
        checked
          ? 'border-accent bg-accent text-background'
          : 'border-border bg-transparent text-text-primary hover:border-accent hover:text-accent'
      }`}
      type="button"
      aria-label={actionLabel}
      aria-pressed={checked}
      title={actionLabel}
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true">{checked ? '♥' : '♡'}</span>
    </button>
  );
}
