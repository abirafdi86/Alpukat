# Avocado Farm Management System (AFMS)

Vue 3 Composition API + Vite with TypeScript, Tailwind CSS 4, Pinia, Vue Router, Lucide, VueUse, Zod, and date-fns.

## Development

Use Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).
The root route redirects to /dashboard.

```sh
npm run typecheck
npm run build
npm run preview
```

Build includes TypeScript checking. Deploy the generated `dist/` directory.
Configure your hosting provider to serve `index.html` for application routes so direct links and refresh work with Vue Router's HTML5 history.

## Structure

- `src/main.ts`, `src/App.vue`: application entry and layout selection.
- `src/router/`: explicit routes and page titles.
- `src/pages/`: all 13 requested placeholder pages.
- `src/layouts/`: workspace and account layouts.
- `src/components/`: reusable UI components.
- `src/assets/css/`: Tailwind entry and shared styles.
- `src/constants/`: navigation configuration and explicit Lucide imports.
- `src/stores/`: Pinia state for mobile navigation.
- `src/composables/`: reserved for reusable Composition API logic.
- `src/services/`: reserved for business logic and API access.
- `src/types/`: UI TypeScript contracts.
- `src/utils/`: date-fns formatting helper.
- `src/plugins/`: reserved for Vue plugins.
- `shared/types/`: initial domain interfaces.
- `shared/schemas/`: common Zod validation primitives.
- `public/`: static assets.

Tailwind uses its Vite plugin in `vite.config.ts`. Pinia and Vue Router are registered explicitly in `src/main.ts`. VueUse handles Escape to close mobile navigation.

## Scope

Login and Register provide validated forms and local mock sessions. Workspace routes require a mock session; domain pages remain placeholders. No real backend or credential verification is connected. See [authentication](docs/authentication.md) for demo usage, validation, persistence, and integration points.

Setup references: [Vite](https://vite.dev/guide/) and [Vue Router](https://router.vuejs.org/installation).

## Design system

See [design-system documentation](docs/design-system.md) for tokens, component APIs, accessibility conventions, and usage examples.

## Application layout

See [application layout](docs/application-layout.md) for responsive behavior, navigation, and account integration points.
