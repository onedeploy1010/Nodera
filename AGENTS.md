# Nodera

React + Vite + Tailwind CSS single-page app, originally exported from Figma Make,
now developed and deployed on a self-hosted server (`35.246.59.75`).

## Development Server

The Vite dev server is **not** started automatically here — start it yourself:

```bash
pnpm dev   # binds 0.0.0.0:$PORT (default 8443), strictPort
```

- On the server it runs in the `nodera` tmux session from the `/opt/nodera-dev` working copy
- Preview URL: <http://35.246.59.75:8443>
- Hot reload: changes to source files are reflected immediately
- If the port is taken, a dev server is probably already up — run `tmux attach -t nodera` and check before starting another

## Deployment

Production is a plain static build served by nginx. There is no backend process, so
nothing needs pm2 or systemd.

```bash
bash /opt/nodera/deploy.sh   # git pull -> pnpm build -> rsync dist/ to the web root
```

- Build output: `dist/` (`pnpm build`)
- Web root: `/var/www/nodera`, served by nginx on port 80 (see `deploy/nginx.conf`)
- The deploy working copy is `/opt/nodera`, separate from the `/opt/nodera-dev` one used for editing
- `.figma/make/site.json` drives the page title, description and `robots.txt`, and `vite.config.ts`
  imports it at build time — do not delete the `.figma/` directory

## Browser checks

Headless Chromium is installed and wired up through the `playwright` MCP server, so UI work
can be verified here instead of being handed back to the user. Open <http://localhost:8443/>,
take a screenshot, click through the flow and read the console. Do that before reporting a
visual change as done.

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
