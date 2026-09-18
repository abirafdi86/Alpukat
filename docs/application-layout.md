# Application layout

The workspace uses Vue 3 and Vue Router, as confirmed during implementation.

## Components

- `src/layouts/default.vue`: shell composition, route-change drawer dismissal, and main content.
- `src/components/AppSidebar.vue`: shared grouped navigation for desktop and mobile.
- `src/components/AppHeader.vue`: breadcrumbs, page search, notifications, and account controls.
- `src/components/AppMobileDrawer.vue`: native modal navigation drawer.
- `src/components/AppBrand.vue`: full and compact AFMS branding.
- `src/constants/navigation.ts`: single navigation source for sidebar, breadcrumbs, and page search.
- `src/stores/app.ts`: transient drawer state and persisted desktop collapse preference.

## Responsive behavior

Desktop begins at 1024px (Tailwind lg). The fixed sidebar is 260px expanded and
80px collapsed. The preference is stored under `afms:sidebar-collapsed`.
Icon-only links retain accessible names and hover titles.

The header stays at 64px. Main content uses p-6, increasing to p-8 at lg.
On smaller screens, the sidebar becomes a left drawer with a backdrop, contained
focus, Escape dismissal, explicit close button, and body scroll locking.
Navigation closes the drawer, even when clicking the current page. Crossing into
desktop mode also closes it. Each navigation area scrolls independently on short screens.

The compact header keeps navigation, search, notifications, and account controls visible.
Breadcrumbs follow the current route; group information appears when space permits.

## Header actions

- Search filters the existing navigation labels and routes to the selected page.
- Notifications opens an empty-state dialog; there is no notification service yet.
- Profile opens the current mock account summary.
- Settings routes to the existing settings placeholder.
- Logout clears the mock session and routes to the login form.

The header reads the user name, role, and initials from the mock authentication store.
Workspace routes require a local mock session. This is UI-only authentication, with no
backend or role enforcement. See [authentication](authentication.md) for session behavior.
Workspace page content remains placeholder-only.

UiDropdown now accepts an optional `variant` prop and a `trigger` slot for custom
account/avatar content, while retaining its accessible label and disclosure behavior.

## Validation

TypeScript and production build pass. Browser checks cover desktop dimensions,
collapse persistence, active navigation, page search, account actions, and mobile
drawer focus, scroll locking, Escape/backdrop dismissal, and horizontal overflow.
