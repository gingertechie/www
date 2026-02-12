# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with the Barebones Astro template. It's a static site generator using Astro, Tailwind CSS v4, and Markdown for content. The site includes blog posts, projects, RSS feeds, and full SEO support.

## Development Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build production site to ./dist/
npm run preview  # Preview production build locally
npm run astro    # Run Astro CLI commands (e.g., astro check)
```

## Project Architecture

### Content Management

Content is managed through Astro's Content Collections API (`src/content.config.ts`):

- **Blog collection**: Located in `src/content/blog/`, each post is a directory containing an `index.md` file with frontmatter (title, description, publicationDate, image, imageAlt, tags)
- **Projects collection**: Located in `src/content/projects/`, each project has title, description, publicationDate (optional), and href
- Both collections use the glob loader with pattern `**/[^_]*.{md,mdx}` (files starting with `_` are ignored)

Note: The `markdown/` directory contains exported Medium posts but is NOT used in site generation.

### Routing Structure

File-based routing in `src/pages/`:
- `index.astro` - Homepage
- `blog/index.astro` - Blog listing page
- `blog/[...id].astro` - Dynamic blog post pages (uses getStaticPaths with content collection)
- `projects/index.astro` - Projects listing page
- `rss.xml.js` - RSS feed generation (sorts by publicationDate descending)
- `robots.txt.ts` - Robots.txt generation

### Path Aliases

TypeScript is configured with path alias `@/*` → `./src/*` (see `tsconfig.json`). Always use this alias when importing from src:

```typescript
import { SITE } from "@/siteConfig";
import { formatDate } from "@/lib/util";
```

### Site Configuration

All site-wide configuration lives in `src/siteConfig.ts`:
- `SITE` - Title, description, href, author, locale
- `NAV_LINKS` - Navigation menu items
- `SOCIAL_LINKS` - Social media links for footer

Update this file to change site metadata, navigation, or social links.

### Styling

- **Tailwind CSS v4**: Integrated via Vite plugin (not PostCSS)
- **Global styles**: `src/styles/global.css` (imported in BaseLayout)
- **Typography**: `src/styles/typography.css` (custom prose styles for markdown content)
- **Theme system**: Supports system/dark/light modes via ThemeToggle component
- **Prettier**: Configured with astro and tailwindcss plugins (`.prettierrc.mjs`)

### Component Patterns

Components in `src/components/`:
- Use Astro component syntax (`.astro` files)
- Props are typed with TypeScript interfaces
- SEO components (`SeoPage.astro`, `SeoPost.astro`) handle meta tags and Open Graph
- `BaseHead.astro` includes common head elements (favicons, fonts, viewport)
- `ThemeToggle.astro` manages dark mode with localStorage persistence

### Utilities

`src/lib/util.ts`:
- `formatDate(date, options?, locale?)` - Formats dates using Intl.DateTimeFormat, defaults to SITE.locale

### Type Definitions

`src/types.ts` exports:
- `SiteConfiguration`
- `NavigationLinks`, `NavigationLink`
- `SocialLinks`, `SocialLink`

### Markdown Configuration

Astro markdown config (`astro.config.mjs`):
- Syntax highlighting theme: `dark-plus`
- Sitemap integration enabled (requires `site` config)

## Key Implementation Patterns

1. **Adding blog posts**: Create a new directory in `src/content/blog/` with an `index.md` file containing the required frontmatter
2. **Adding projects**: Create a new `.md` file in `src/content/projects/` with required frontmatter
3. **Modifying navigation**: Edit `NAV_LINKS` in `src/siteConfig.ts`
4. **Styling markdown content**: Edit `src/styles/typography.css` to customize prose styles
5. **SEO updates**: Modify SEO components or update SITE config in `siteConfig.ts`

## Important Notes

- TypeScript is configured with Astro's strict preset
- The site URL is set in `astro.config.mjs` (required for sitemap/RSS)
- Public assets go in `public/` directory (favicons, OG images, etc.)
- Astro 5.x uses the new Content Layer API with loaders instead of legacy collections
