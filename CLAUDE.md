# CLAUDE.md

Small React SPA: username/password login against an external backend, then a feedback UI
(the feedback part isn't built yet). Single page, no router yet.

## Design system

Notion-inspired. Tokens live in [src/styles/tokens.css](src/styles/tokens.css) (imported
at the top of `src/index.css`) - `--color-*` semantic roles with light + dark values,
`--font-*`, `--space-*` (4px base), `--radius-*`, `--shadow-*`. Full spec, component
states, and the visual canvas link are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

The token layer is live but components are **not migrated yet**. When you touch a
component, move its hard-coded values onto the tokens (LoginPage first). Use the semantic
role, not the hex. Never hard-code a colour that only has a light value - dark mode is
token-only. The palette follows `prefers-color-scheme`; the theme switcher on LoginPage
overrides it with a `data-theme` attribute on `<html>` (see `src/shared/useTheme.ts`, and
the pre-paint init script in `index.html`).

## Stack (don't swap without a concrete reason)

- React 19, TypeScript, Vite 8.
- `lucide-react` for icons (per-icon imports).
- oxlint (`.oxlintrc.json`) is the only linter. No ESLint, no Prettier.
- No test runner is installed yet.
- `verbatimModuleSyntax` is on: import types with the inline `type` modifier
  (`import { foo, type Bar } from '...'`) or `tsc` fails.
- `strict` is not currently enabled in tsconfig. Still avoid `any` and keep request/response
  types explicit.
- ASCII only in source — identifiers, comments, filenames, commit messages. The one
  exception: **all user-facing UI copy is Russian** (labels, buttons, headings, errors,
  empty states, `<html lang="ru">`). Write the Cyrillic inline in JSX; no i18n library yet.

## Actual structure (keep this section true to the code)

```
src/
  api/
    client.ts        # fetch wrapper: base URL, credentials:'include', ApiError, get/post
    auth.ts          # login() -> POST /authn ; checkAuthStatus() -> GET /authn/me
  context/
    auth-context.ts  # createContext + AuthContextValue / AuthStatus types (NO components)
    AuthContext.tsx  # <AuthProvider> only
    useAuth.ts       # useAuth() hook only
  shared/
    useTheme.ts      # theme preference hook (system/light/dark) -> <html data-theme>
    LoadingScreen.tsx # token-based initial-load screen (App.tsx status==='loading')
  pages/
    LoginPage.tsx
  App.tsx            # renders Loading / LoginPage / signed-in view off useAuth().status
  main.tsx           # createRoot + <AuthProvider>
```

**Why the context is three files:** `react/only-export-components` (react-refresh) wants a
module to export only components. Keep the context object, the hook, and the provider in
separate files — don't merge them back into one.

**Intended direction as features land:** group by feature under `src/features/<name>/`
(`components/`, `api.ts`, `hooks.ts`, `types.ts`); genuinely shared code in `src/shared/`;
route-level composition in `src/pages/`. Follow the existing `api/` and `context/` boundaries
until then — don't scaffold empty feature folders ahead of need.

## Auth & the cookie gotcha (read before touching auth or the fetch layer)

- The backend issues an httpOnly session cookie on `POST /authn` only. Every later request
  must carry it: `credentials: 'include'` in `client.ts` is load-bearing.
- The dev frontend origin (`http://localhost:5173`) and the backend
  (`VITE_API_BASE_URL`, e.g. `https://localhost:7016`) differ in port **and** scheme, so every
  API call is cross-site. A `SameSite=Lax`/`Strict` cookie won't ride a cross-site GET, so
  `GET /authn/me` after a page refresh returns 401 and the app signs itself out even though
  login "worked".
- Login looks fine regardless because `AuthProvider.login()` sets `status: 'authenticated'`
  straight from the POST response body, not from a cookie round-trip. The first request that
  actually depends on the cookie is the post-refresh `checkAuthStatus()`.
- Dev fix when this bites: add a Vite `server.proxy` entry for `/authn` -> backend
  (`changeOrigin: true`, `secure: false`) and set `VITE_API_BASE_URL` empty so the browser
  stays same-origin. Split-origin only works if the backend sends `SameSite=None; Secure` and
  both ends are HTTPS.

## Env

- `VITE_API_BASE_URL` is the only variable. `.env` is gitignored; `.env.example` is the
  tracked template — update it whenever you add a variable.

## Conventions that matter here

- Network calls go through `src/api/client.ts` (or a feature `api.ts`), never a raw `fetch`
  in a component.
- `client.ts` normalizes every failure into `ApiError` (with `.status`); UI branches on that
  (see the 401 handling in `LoginPage`). Keep that pattern.
- Components render UI and wire interactions; reusable stateful logic goes in hooks.
- `useEffect` only to sync with an external system (subscriptions, timers, browser APIs) —
  not to derive values computable during render.
- Local component state by default. Context only for stable cross-cutting concerns (auth today).
- Every async view accounts for loading / error / empty / success.
- Forms: a visible label per input, correct `type` and `autocomplete`, submit disabled while
  a request is in flight, errors surfaced with `role="alert"`. No native browser validation
  UI - put `noValidate` on the `<form>`, validate in the submit handler, render errors
  inline (see `LoginPage` and DESIGN_SYSTEM.md > Validation).
- Styling is plain per-component `.css` files with `id`/`className` as already used. No CSS
  framework — match what's there.
- UI chrome is not text-selectable: `user-select: none` on controls and screen/section
  titles (`button`/`label` are global in `index.css`; set it per-component for menu items,
  tabs, tags, headings). Content, alert messages, and form fields stay selectable. See
  DESIGN_SYSTEM.md > Selection.
- Icons come from `lucide-react`, imported per-icon (`import { MessageSquareText } from
  'lucide-react'`). Size with the `size` prop, colour via `currentColor` (set `color` in
  CSS). Never hand-author SVG `<path>` data for an icon — no bespoke glyphs. If lucide is
  missing a glyph you need, ask before pulling in another icon source.

## When adding libraries (none of these are present yet)

- Server data at scale: TanStack Query instead of hand-rolled `useEffect` fetching.
- Runtime response validation: Zod at the API boundary once payloads get complex.
- Tests: React Testing Library for components, MSW for API, Playwright for critical e2e.
  Prioritize auth, form submission, error handling, data mutations.

## Commands

- `npm run dev` — Vite dev server.
- `npm run lint` — oxlint.
- `npm run build` — `tsc -b` then `vite build`. This is the typecheck gate; run it for any
  change to shared code or an app-wide flow.
- `npm run preview` — serve the production build.

## Workflow

1. Read the nearest owning module / hook / api / component before editing.
2. Make the smallest change at the root cause. Don't fix unrelated bugs or reformat untouched
   files in the same pass.
3. Run lint and build after changes that touch shared behavior.
4. Don't commit or create branches unless asked. (The repo has no commits yet.)
