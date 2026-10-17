# Photography Portfolio

A single-page photography portfolio for the fictional photographer **Alex Morgan**, built with React and JavaScript using Vite, with Tailwind CSS and the original design preserved. The design uses warm neutral colors, elegant typography, generous whitespace, and large photography.

## Features

- Navigation links to sections on the same page.
- Hero with an introduction, featured image, and calls to action.
- Selected Work gallery mixing portrait and landscape images.
- Category filter for showing all work or one photography category at a time.
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
│   ├── styles.js       # Shared container and button utility strings
│   ├── components/     # Header, Hero, SelectedWork, About, Contact, Footer
│   └── data/
│       └── photos.js   # Gallery items as an array of objects
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

| Change | File |
| --- | --- |
| Gallery photos, titles, categories, alt text and portrait/landscape classes | `src/data/photos.js` |
| Hero headline, introduction and featured image | `src/components/Hero.jsx` |
| Photographer biography and image | `src/components/About.jsx` |
| Navigation and footer content | `src/components/Header.jsx`, `src/components/Footer.jsx` |
| Preview form labels and session choices | `src/components/Contact.jsx` |
| Colors, fonts, spacing, image ratios, breakpoints and fluid sizing | `css/main.css` (`@theme` and `:root`) |
| Shared button and container utilities | `src/styles.js` |
| Base typography, keyboard focus and Preflight adjustments | `css/base.css` |

Gallery entries are hardcoded as an array of objects in `src/data/photos.js` and rendered by `SelectedWork` with `.map()` using each stable `id` as the React key. Preserve image `alt`, dimensions and aspect-ratio classes when editing. Gallery images remain lazy-loaded by the component, while the Hero image retains `fetchPriority="high"`.

`SelectedWork` stores the active gallery category in `useState`. `All` is the initial value; the other filter buttons match the `category` values in `photos.js`. Each button exposes its selected state through `aria-pressed`.

The form is deliberately not connected to a service. Its disabled button and `onSubmit` cancellation must remain while it is a preview.

## Image and font sources

- Photography is loaded from [Unsplash](https://unsplash.com/).
- Playfair Display and Inter are loaded from [Google Fonts](https://fonts.google.com/).

This is an educational portfolio project. Local assignment and design documents under `docs/` are excluded from Git by the current `.gitignore`.

## Migration status

The page uses React section components and Tailwind CSS v4 through the Vite plugin. Header, Hero, SelectedWork, About, Contact and Footer are composed in that order by App. The four content sections remain direct children of main.

`css/main.css` defines the shared design tokens with `@theme`: colors, fonts, weights, spacing, image ratios, fluid typography, 1200px content limit and the exact 768px/1024px breakpoints. Fluid gutters and section/Hero spacing use CSS variables. Components use Tailwind utilities; `src/styles.js` shares the container and button utility strings. `css/base.css` restores the original typography, link underlines, focus outlines and native form metrics affected by Preflight.

The preview form remains disabled and prevents submission. Original source, screenshots and migration verification artifacts are retained locally under `reference/`, excluded from Git and the production build. No new effects, content or form integration were added.

## Verification and remaining checks

Build and lint pass. Legacy component CSS files and their imports have been removed; only `css/main.css` and `css/base.css` remain. The lockfile records the installed dependencies.

Browser comparisons already performed in Chrome 155 at 375, 768, 1024 and 1440px confirmed matching geometry and sampled computed styles after fonts and all six images loaded. Responsive layout and overflow checks passed at 320, 375, 767, 768, 1023, 1024 and 1440px. Hover, selected focus-visible states and the disabled button matched the original. Production smoke checks confirmed valid labels, section anchors, one H1 and cancelled form submission, without JavaScript page errors.

Full pixel identity is not claimed: comparisons found image raster differences at 375px and small native select-text raster differences at 1024/1440px. The 768px live comparison was identical. Local screenshots and detailed measurements are under `reference/tailwind-stage-4/`.

Final acceptance is **partially verified**: a complete sequential Tab/Shift+Tab walkthrough, clicking every anchor including Back to top, and network observation during Enter/requestSubmit attempts still need to run. The expanded browser test did not execute because automatic approval review reached its usage limit. Source inspection confirms preserved image attributes, labels, anchor targets, disabled submission and `preventDefault`; it does not replace these remaining interaction checks.

To complete the remaining checks, run `npm run build` followed by `npm run preview`, open the printed URL, and:

1. Traverse all links and controls with Tab and Shift+Tab; verify visible focus and natural page order. The disabled Send Inquiry button must be skipped.
2. Click each section link and Back to top; verify the intended destination.
3. Fill the required fields with test values. With the Network panel recording after initial assets load, press Enter in an input and invoke `document.querySelector('form').requestSubmit()` in the console. Confirm no navigation or submission request occurs.
4. Check the console for React errors and key warnings, and verify layout immediately above the breakpoints at 769 and 1025px.

No publishing, hosting changes, Backend, or submission integration is included in this migration.
