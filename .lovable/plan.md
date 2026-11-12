# In-app website demos

## What will change
- Give each marketplace listing a dedicated in-app demo URL and replace the external preview links.
- Build six polished, distinct and interactive storefront/website demos, each with a persistent marketplace banner and a direct “Buy This Website” checkout handoff.
- Replace the marketplace’s empty preview frames with real visual mini-previews that match the demos.
- Keep admin credentials and source ZIP delivery exclusively within the existing server-verified Korapay success flow.

## Technical approach
- Use a single typed `/preview/$slug` TanStack route for the six dedicated preview paths, with per-demo head metadata and a not-found fallback.
- Pass the selected product back to `/` through a checkout query parameter; open that listing’s existing checkout dialog without changing payment verification or delivery rules.
- Import the six generated, bundled preview images and use project design tokens for the demo-specific visual palettes.
- Add focused route/product tests and verify demo interactions, mobile layout, and the existing purchase gate.
