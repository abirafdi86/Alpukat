# AFMS design system

The design system lives in `src/assets/css/main.css` and `src/components/ui/`.
Import components from `@/components/ui`. Components use Vue 3 Composition API and TypeScript.
No application features or new routes are included.

## Foundation

| Purpose | Tailwind token / style |
| --- | --- |
| Primary actions | `bg-brand` (green-700), `hover:bg-brand-hover` (green-800) |
| Quiet accents | `bg-brand-soft` (green-50) |
| Canvas / cards | `bg-canvas` (slate-50) / `bg-surface` (white) |
| Primary / secondary text | `text-ink` (slate-900) / `text-muted` (slate-500) |
| Borders | `border-line` (slate-200); controls use slate-300 |
| Status | emerald success, amber warning, red danger, blue information |
| Page / section title | `page-title` / `section-title` |
| Supporting copy | `secondary-text` |
| Card | `ui-card`: rounded-xl, border, white, shadow-sm |
| Controls | rounded-lg, 40–44px standard height |
| Spacing | 4px scale; 16–24px component padding; 24–40px page padding |

The font stack uses Inter when locally available, then Segoe UI and the system sans-serif.
No font network request or additional dependency is required. Use regular body text,
medium control labels, and semibold headings; avoid all-caps data headings.
Use tabular numerals and right alignment for quantities and money.

Keep borders subtle, use whitespace for hierarchy, and reserve green for actions and selection.
Use status words alongside colors. Avoid gradients, decorative illustrations, large shadows,
and animation beyond loading indicators. Loading animation respects reduced-motion preferences.

## Component APIs

| Component | Props / model | Slots / events |
| --- | --- | --- |
| UiButton | variant: primary, secondary, ghost, danger; size: sm, md, lg; type; disabled; loading | default, leading, trailing; native click |
| UiInput | v-model: string or number; required label; id, type, hint, error | trailing; native input attributes/events forwarded to input |
| UiSelect | v-model: string; required label, options; id, placeholder, hint, error | native select attributes/events forwarded to select |
| UiCard | title, description | default, header, actions, footer |
| UiTable | required caption | head, default (body rows), footer |
| UiBadge | tone: neutral, success, warning, danger, info | default |
| UiModal | required boolean v-model, title; description | default, footer |
| UiDropdown | required label, items; variant (default secondary) | trigger; select(id) |
| UiToast | required title; description, tone, dismissible | dismiss |
| UiEmptyState | required title, description | icon, default (actions) |
| UiSkeleton | shape: text, rectangle, circle | class for size overrides |

Shared prop types are in `src/types/ui.ts`. Standard tone classes are in `src/constants/ui.ts`.
Class overrides work through Tailwind utilities. On inputs and selects, attributes including
class, required, autocomplete, disabled, and name belong to the native control.

### Forms and buttons

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiInput, UiSelect } from '@/components/ui'

const name = ref('')
const status = ref('')
const options = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]
</script>

<template>
  <form class="space-y-5" @submit.prevent>
    <UiInput v-model="name" label="Name" name="name" required hint="Use a descriptive name." />
    <UiSelect v-model="status" label="Status" :options="options" placeholder="Choose a status" />
    <div class="flex flex-wrap justify-end gap-3">
      <UiButton variant="secondary">Cancel</UiButton>
      <UiButton type="submit">Save</UiButton>
    </div>
  </form>
</template>
```

Initialize select models to an empty string when using a placeholder. Inputs and selects
associate their visible labels and hint/error text automatically. Pass an error string
to show validation feedback; validation itself belongs in schemas and feature logic.
Keep meaningful button text while loading. Icon-only buttons require `aria-label`.
Buttons default to `type="button"` to prevent accidental form submission.

### Data and status

```vue
<UiTable caption="Example records">
  <template #head>
    <tr><th scope="col">Name</th><th scope="col" class="numeric">Quantity</th><th scope="col">Status</th></tr>
  </template>
  <tr>
    <td>Example</td><td class="numeric">120</td>
    <td><UiBadge tone="success">Active</UiBadge></td>
  </tr>
</UiTable>
```

Tables use native semantics and a focusable horizontal scroll region on small screens.
Supply real th/td elements, column scopes, stable row keys, and visible status labels.
Sorting, selection, pagination, and data fetching belong to future feature components.

### Dialogs and dropdowns

```vue
<UiButton @click="open = true">Open dialog</UiButton>
<UiModal v-model="open" title="Dialog title" description="Brief context for this action.">
  <p>Dialog content</p>
  <template #footer><UiButton variant="secondary" @click="open = false">Close</UiButton></template>
</UiModal>

<UiDropdown label="Actions" :items="[
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete', danger: true },
]" @select="handleAction" />
```

Define `open = ref(false)` and `handleAction(id: string)` in the consuming component.
The native dialog provides modal focus containment, Escape dismissal, a backdrop, and
focus restoration. Close is always explicit via the close button, Escape, or model;
clicking the backdrop does not discard work. Put autofocus on an appropriate field
when needed. Avoid nested dialogs.

Dropdowns are button-list disclosures, not ARIA application menus. Open with Enter/Space,
Tab through actions, close with Escape or an outside click. Selection restores trigger focus.
Keep labels concise. Disabled actions are skipped by keyboard navigation.

### Feedback and loading

```vue
<div class="fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm">
  <UiToast v-if="showToast" title="Changes saved" tone="success" @dismiss="showToast = false" />
</div>

<div role="status" aria-label="Loading records" aria-busy="true" class="space-y-3">
  <UiSkeleton class="w-1/3" />
  <UiSkeleton shape="rectangle" />
  <span class="sr-only">Loading records</span>
</div>

<UiEmptyState title="No records yet" description="Records will appear here when added.">
  <UiButton>Add record</UiButton>
</UiEmptyState>
```

Define `showToast = ref(true)` in the consuming component. The parent owns toast mounting
and dismissal; there are no automatic timers that hide messages before they can be read.
Success, warning, information, and neutral toasts announce politely; danger uses an alert.
Skeletons are decorative: label the containing loading region, then replace it with content.
Empty states explain the next step without fake data.

## Reference

The CSS-first tokens use [Tailwind theme variables](https://tailwindcss.com/docs/theme).
Component models follow [Vue script setup](https://vuejs.org/api/sfc-script-setup).
