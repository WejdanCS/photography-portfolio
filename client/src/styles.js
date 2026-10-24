export const pageContainer = 'mx-auto w-[calc(100%-var(--page-gutter)-var(--page-gutter))] max-w-page';
export const buttonBase = 'inline-flex min-h-target max-w-full items-center justify-center border rounded-none px-m py-s font-semibold tracking-label leading-[1.4] text-center no-underline uppercase cursor-pointer [&:hover:not(:disabled)]:bg-text-primary [&:hover:not(:disabled)]:text-background disabled:border-border disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed';
export const primaryButton = `${buttonBase} border-transparent bg-accent text-background`;
export const secondaryButton = `${buttonBase} border-text-primary bg-transparent text-text-primary`;
