# Zentrix Premium IT Company Website

A complete responsive website built with **HTML5, CSS3, and vanilla JavaScript only**. No frameworks, build tools, package installation, or external libraries are required.

## Folder structure

```text
zentrix-website/
├── index.html
├── README.md
├── robots.txt
├── sitemap.xml
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── theme.js
│   ├── animations.js
│   └── slider.js
└── assets/
    ├── logo.png
    ├── favicon.png
    ├── client-logo-1.png ... client-logo-6.png
    ├── client-logos/
    └── images/
```

## Run locally

Open `index.html` directly, or serve the folder with any static server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Replace the logo

Replace:

```text
assets/logo.png
```

Use a transparent PNG with a wide aspect ratio. Keep the same filename to avoid editing the HTML. The supplied logo was extracted from the uploaded Zentrix brand image.

## Replace client logos

Replace these files:

```text
assets/client-logo-1.png
assets/client-logo-2.png
assets/client-logo-3.png
assets/client-logo-4.png
assets/client-logo-5.png
assets/client-logo-6.png
```

The carousel duplicates the logos in `index.html` to create a seamless loop. When adding more logos, add the same set twice in the `.client-marquee__track` element. The duplicate set should use `aria-hidden="true"` and empty `alt` text.

## Replace portfolio images

Replace the SVG files in:

```text
assets/images/project-fintech.svg
assets/images/project-health.svg
assets/images/project-commerce.svg
assets/images/project-ai.svg
assets/images/project-cloud.svg
```

PNG, JPG, WebP, or SVG files can be used. Update the image paths and alt text in the Portfolio section of `index.html`.

## Edit text content

All visible content is organized by section in `index.html`. Search for these section IDs:

- `#home`
- `#about`
- `#services`
- `#solutions`
- `#clients`
- `#portfolio`
- `#testimonials`
- `#contact`

Update the email, phone number, location, social media links, project details, testimonials, client names, and statistics before publishing.

## Connect the contact form

The current form performs complete client-side validation and displays a success animation. It uses a short simulated request so the frontend can be previewed without a backend.

In `js/main.js`, find:

```js
// Replace this simulated request with fetch('/your-api-endpoint', {...}).
```

Replace the simulated promise with a `fetch()` request to your backend, serverless function, email service, CRM, or form endpoint. Validate and sanitize all data again on the server.

## Theme settings

Dark and light themes are controlled in `js/theme.js`. The selected theme is saved under:

```text
zentrix-theme
```

Brand and theme variables are at the top of `css/style.css`.

## SEO before launch

Update the following in `index.html`:

- Page title
- Meta description
- Open Graph image and text
- Contact details

Also replace the placeholder domain in `robots.txt` and `sitemap.xml` with the final production domain.

## Deployment

This is a static frontend and can be deployed to any standard web host, GitHub Pages, Cloudflare Pages, Netlify, Vercel static hosting, an S3-compatible bucket, or a conventional server. Upload the entire folder while preserving the directory structure.
