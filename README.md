# Photography Portfolio

A single-page photography portfolio for the fictional photographer **Alex Morgan**, built with React and JavaScript using Vite, with the original CSS3 design preserved. The design uses warm neutral colors, elegant typography, generous whitespace, and large photography.

## Features

- Navigation links to sections on the same page.
- Hero with an introduction, featured image, and calls to action.
- Selected Work gallery mixing portrait and landscape images.
- Short About section and a booking inquiry form preview.
- Footer with a back-to-top link.
- Responsive layouts using CSS Grid, Flexbox, and media queries.
- Semantic HTML, image alternative text, labelled form controls, and visible keyboard focus styles.

## Getting started

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

- `npm run build`: create the production site in `dist/`.
- `npm run preview`: preview the production build locally.
- `npm run lint`: check JavaScript and JSX with ESLint.

Open the URL printed by Vite. The page now requires JavaScript; opening `index.html` directly is no longer the development workflow.


An internet connection is needed to load Google Fonts and the remote Unsplash images. System font fallbacks are provided.

## Project structure

```text
Photography Portfolio/
├── index.html          # HTML metadata and React mount point
├── src/
│   ├── main.jsx        # React entry point and original CSS import
│   └── App.jsx         # Entire page in JSX (section extraction is a later step)
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── README.md
└── css/
    ├── main.css        # Stylesheet entry point and imports
    ├── colors.css      # Color variables
    ├── fonts.css       # Font imports, families, and weight variables
    ├── spacing.css     # Spacing and container variables
    ├── base.css        # Global styles, typography, and focus outlines
    ├── buttons.css     # Button variants and states
    └── sections.css    # Section layouts and responsive rules
```

## Design system

| Role | Value |
| --- | --- |
| Background | `#F7F6F2` |
| Primary text | `#1A1A1A` |
| Secondary text | `#77736D` |
| Accent | `#9A7B5B` |
| Border | `#DEDAD3` |
| Headings | Playfair Display |
| Body text and controls | Inter |

Spacing tokens use `8`, `16`, `24`, `48`, and `80px`. The main container has a maximum width of `1200px` with responsive side margins.

- Below `768px`: the gallery and About section use one column; the footer stacks vertically.
- From `768px`: the gallery and About section use two columns; the footer uses a horizontal, wrapping layout.
- From `1024px`: the Hero uses two columns, with a slightly wider image column.

Gallery images use `object-fit: cover` with `3:2` landscape and `3:4` portrait aspect ratios.

## Contact form status

The form is a **visual preview only**. It has no submission endpoint, and the Send Inquiry button is intentionally disabled. No booking request or email is sent. The Book a Shoot links navigate to this section.

## Customization

Edit `src/App.jsx` to replace the sample identity, introduction, photo titles, images, and alternative text. Update the CSS variables to adjust the design consistently. Connect a submission service before enabling the contact form.

## Image and font sources

- Photography is loaded from [Unsplash](https://unsplash.com/).
- Playfair Display and Inter are loaded from [Google Fonts](https://fonts.google.com/).

This is an educational portfolio project. Local assignment and design documents under `docs/` are excluded from Git by the current `.gitignore`.

## Migration status

Stage 2 installs React/Vite and converts HTML attributes to JSX while preserving all original CSS files. Tailwind and section-component extraction have not started. The preview form stays disabled and its submit handler prevents navigation/submission. Original source and screenshots are retained locally under `reference/html-css-baseline-2026-10-17/`, excluded from Git and the production build.
