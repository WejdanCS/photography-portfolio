# Photography Portfolio

A single-page photography portfolio for the fictional photographer **Alex Morgan**, built with React and JavaScript using Vite, with Tailwind CSS and the original design preserved. The design uses warm neutral colors, elegant typography, generous whitespace, and large photography.

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
│   ├── main.jsx        # React entry point and Tailwind CSS import
│   ├── App.jsx         # Page composition and main landmark
│   └── components/     # Header, Hero, SelectedWork, About, Contact, Footer
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── README.md
└── css/
    ├── main.css        # Tailwind import, @theme tokens and fluid layout variables
    └── base.css        # Typography, focus and explicit Preflight adjustments
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

Edit the relevant file in `src/components/` to replace the sample identity, introduction, photo titles, images, and alternative text. Update the `@theme` tokens and CSS variables in `css/main.css` to adjust the design consistently. Connect a submission service before enabling the contact form.

## Image and font sources

- Photography is loaded from [Unsplash](https://unsplash.com/).
- Playfair Display and Inter are loaded from [Google Fonts](https://fonts.google.com/).

This is an educational portfolio project. Local assignment and design documents under `docs/` are excluded from Git by the current `.gitignore`.

## Migration status

The page uses React section components and Tailwind CSS v4 through the Vite plugin. Header, Hero, SelectedWork, About, Contact and Footer are composed in that order by App. The four content sections remain direct children of main.

`css/main.css` defines the shared design tokens with `@theme`: colors, fonts, weights, spacing, image ratios, fluid typography, 1200px content limit and the exact 768px/1024px breakpoints. Fluid gutters and section/Hero spacing use CSS variables. Components use Tailwind utilities; `src/styles.js` shares the container and button utility strings. `css/base.css` restores the original typography, link underlines, focus outlines and native form metrics affected by Preflight.

The preview form remains disabled and prevents submission. Original source, screenshots and migration verification artifacts are retained locally under `reference/`, excluded from Git and the production build. No new effects, content or form integration were added.
