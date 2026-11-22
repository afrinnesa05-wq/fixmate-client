<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design direction (FixMate Olive Green)

Modern, minimal, elegant, premium home-service platform. Inspired by the FixMate Olive Green homepage reference: warm off-white backgrounds, olive green for primary actions, charcoal for readable typography, soft sage for secondary elements, and warm beige only for small decorative accents. Avoid excessive gradients, shadows, colours, and unnecessary decorations. Maintain consistent spacing, typography, border radius, and button styles. Apply consistently across all pages and dashboards.

### Brand colour palette (exact — do not replace, modify, or introduce new brand colours)

| Role | Hex |
| --- | --- |
| Primary Olive | `#596B3F` |
| Warm Off-white | `#F7F6F0` |
| Charcoal Text | `#30352B` |
| Soft Sage | `#A8B39A` |
| Warm Beige | `#E8DFC9` |
| Deep Olive | `#414A35` |

### How the colours are distributed

The palette itself is correct — the risk is in how colours are distributed. Keep this balance:

- `#596B3F` (Primary Olive) — the **dominant** brand colour. Use it for important actions and highlights: primary CTAs, links, active states, key accents.
- `#F7F6F0` (Warm Off-white) — warm off-white backgrounds for pages and surfaces, and light text on dark sections.
- `#30352B` (Charcoal Text) — readable typography everywhere.
- `#A8B39A` (Soft Sage) — secondary elements and icons (e.g. footer icons, logo accent on dark).
- `#E8DFC9` (Warm Beige) — **only** small decorative accents and warm neutral tints.
- `#414A35` (Deep Olive) — mainly for the dark footer or selected dark sections, and for darker olive hover states.

Rules:

- Only colours from this palette (plus white and neutral tints/shades derived from them). Do not introduce new hues.
- **Avoid using too many colours in the same component.** Usually: background + text + at most one accent. Maintain visual consistency and a premium, minimal aesthetic.
- Use Tailwind arbitrary values (`bg-[#596B3F]`, `text-[#30352B]`) or add tokens to `app/globals.css` when a colour is used repeatedly.
- The Navbar and Footer use this palette: off-white/charcoal/olive on the Navbar, deep olive with soft sage accents on the Footer. Keep them on it.
- Keep spacing, radius, and shadow treatment consistent: soft shadows (`shadow-sm`/`shadow-md`), rounded cards (`rounded-lg`/`rounded-xl`), and restrained borders.
