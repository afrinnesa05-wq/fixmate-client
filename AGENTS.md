<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design direction (FixMate Olive Green)

Modern, minimal, elegant, premium home-service platform. Inspired by the FixMate Olive Green homepage reference: warm cream backgrounds, olive green for primary actions, charcoal for readable typography, soft olive for secondary elements, and gold only for small decorative accents. Avoid excessive gradients, shadows, colours, and unnecessary decorations. Maintain consistent spacing, typography, border radius, and button styles. Apply consistently across all pages and dashboards.

### Brand colour palette (exact — do not replace, modify, or introduce new brand colours)

| Role | Hex |
| --- | --- |
| Primary | `#667044` |
| Secondary | `#858B68` |
| Background | `#F7F6EF` |
| Text | `#292A24` |
| Muted | `#A5A58D` |
| Accent | `#C5A46D` |
| Dark section | `#34382B` |

### How the colours are distributed

The palette itself is correct — the risk is in how colours are distributed. Keep this balance:

- `#667044` (Primary) — the **dominant** brand colour. Use it for important actions and highlights: primary CTAs, links, active states, key accents.
- `#F7F6EF` (Background) — warm cream backgrounds for pages and surfaces.
- `#292A24` (Text) — readable typography everywhere.
- `#858B68` (Secondary) — **sparingly**, only for secondary elements.
- `#A5A58D` (Muted) — muted text and subtle borders only.
- `#C5A46D` (Accent) — **only** small decorative accents (e.g. footer headings, icon highlights, logo accent).
- `#34382B` (Dark section) — mainly for a dark footer or selected dark sections.

Rules:

- Only colours from this palette (plus white and neutral tints/shades derived from them). Do not introduce new hues.
- **Avoid using too many colours in the same component.** Usually: background + text + at most one accent. Maintain visual consistency and a premium, minimal aesthetic.
- Use Tailwind arbitrary values (`bg-[#667044]`, `text-[#292A24]`) or add tokens to `app/globals.css` when a colour is used repeatedly.
- The Navbar and Footer use this palette: cream/charcoal/olive on the Navbar, deep olive with gold accents on the Footer. Keep them on it.
- Keep spacing, radius, and shadow treatment consistent: soft shadows (`shadow-sm`/`shadow-md`), rounded cards (`rounded-lg`/`rounded-xl`), and restrained borders.
