# Authentication UI and mock sessions

AFMS provides /login and /register using the shared design system and a responsive
two-section authentication layout. Desktop shows quiet green branding and CSS leaf
shapes beside the form. Mobile shows the form and compact branding.

## Trying the UI

- On Login, choose **Use demo account**, then **Login**.
- Or use any valid email with a password of 8–128 characters.
- To exercise request errors, use `error@afms.test` with otherwise valid fields.
  This reserved address simulates failure for login, registration, and password reset.
- Registration requires a name, valid email, phone number, password, and matching confirmation.
- Forgot Password opens a validated dialog with a mock confirmation. It sends no email.

Requests take approximately 650ms so loading states are visible. Controls disable during
submission. Errors appear next to fields and request failures use an accessible alert.
Validation runs on blur and submit, then updates as fields are corrected. Submission
focuses the first invalid field. Each password field has its own visibility toggle.

## Validation

Schemas live in `shared/schemas/auth.ts`; types are inferred in `shared/types/auth.ts`.

- Names: trimmed, 2–80 characters.
- Email: validated, trimmed, and lowercased.
- Phone: common international formatting accepted; 7–15 digits.
- Login password: 8–128 characters.
- Registration password: 8–128 characters, including a letter and a number.
- Confirmation must match exactly; passwords are not trimmed.

## Mock session behavior

Successful login and registration route to /dashboard. The header displays the mock
user's name and role. Workspace routes require a mock session, while /login and /register
remain public. These client-side checks provide UI navigation only, not real security.

Remember Me saves a minimal mock profile (name, email, role) in localStorage.
Without Remember Me, the profile uses sessionStorage and lasts for the current tab.
Registration starts a sessionStorage session. Logout clears both locations.
The storage key is `afms:mock-user`.

Passwords, password confirmations, and phone numbers are not stored or sent anywhere.
No actual accounts, credential verification, tokens, backend requests, or reset emails exist.
Mock requests are cancelled when their form unmounts; closing the reset dialog also cancels
its pending request. A late completion cannot unexpectedly navigate to the dashboard.

## Structure

- `src/layouts/auth.vue`: responsive branding and form area.
- `src/pages/login.vue`, `src/pages/register.vue`: form composition.
- `src/components/auth/`: password input, error alert, and reset dialog.
- `src/composables/useZodForm.ts`: field validation and invalid-field focus.
- `src/composables/useMockAuthRequest.ts`: loading, errors, and cancellation.
- `src/services/mockAuth.ts`: replaceable mock service.
- `src/stores/auth.ts`: mock session and persistence.
- `src/router/index.ts`: workspace session guard.
- `src/components/AppHeader.vue`: session-backed user presentation and logout.

When adding a real backend, replace the mock service and storage/session mechanism.
The UI schemas and reusable controls can remain.

## Verification

TypeScript and production build checks pass. Desktop/mobile browser checks cover required
fields, invalid phone and confirmation, password visibility, loading/disabled controls,
request failure/retry, password-reset feedback, remember-me persistence, logout, registration,
normalized profile values, absence of stored passwords, request cancellation, and overflow.
