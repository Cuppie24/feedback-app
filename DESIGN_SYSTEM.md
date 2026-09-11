# Feedback App - Design System

Notion-inspired: warm-neutral surfaces, one sage-green accent,
restrained status hues, small radii, quiet shadows. Every token has a
light and a dark value.

- **Tokens (source of truth):** [src/styles/tokens.css](src/styles/tokens.css),
  imported at the top of [src/index.css](src/index.css).
- **Visual canvas:** https://claude.ai/code/artifact/0e089325-f823-462c-bed8-ef8b55e45343
  (Foundations, Components, Screens light, Screens dark). In the Claude
  Code terminal `/artifacts` lists it.

## Status

Adopt incrementally: when you touch a component, move its hard-coded
values to the `--color-*` / `--space-*` / etc. variables. Don't do a
big-bang restyle in one pass.

- [x] `LoginPage` - on tokens (card, brand mark, field/focus/error
  states, primary button). `#root` no longer boxed to a fixed width.
- [x] `LoadingScreen` (initial-load state) - on tokens; a single quiet
  pulse on the brand mark, themed with the rest of the app.
- [x] Feedback UI (`src/features/feedback`) - the old `App.tsx` `#center`
  placeholder and the dead `App.css` starter styles are gone; `App.tsx`
  now renders `<FeedbackApp />` for the signed-in state. Runs on
  in-memory seed data (no backend yet). See CLAUDE.md for the file
  layout.

## Principles

- **One filled button per screen.** Primary action is `--color-accent`;
  everything else is a bordered or ghost button.
- **Flat by default.** Only floating surfaces (menus, dialogs, toasts)
  get a shadow. Inline content uses a 1px border.
- **Surfaces sit close together.** The accent does the pointing, not
  heavy contrast between panels.
- **Muted status colours.** Wash background + darker text of the same
  hue, never a saturated fill.
- **Dark mode is token-only.** Palettes follow `prefers-color-scheme`
  by default; a `data-theme="light" | "dark"` attribute on `<html>`
  (set by the theme switcher, persisted to `localStorage`, pre-applied
  by an inline script in `index.html`) forces one. Never hard-code a
  colour that only has a light value.
- **Icons are `lucide-react`, never hand-drawn.** Stroke icons on the
  16 / 20 / 24 grid. Size with the `size` prop; colour through
  `currentColor`.

## Colour

Semantic role names are stable across themes - use the role, not the
hex.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#ffffff` | `#191919` | Page background |
| `--color-surface-sunken` | `#f7f7f5` | `#202020` | Panels, list wells |
| `--color-surface-hover` | `rgba(55,53,47,.06)` | `rgba(255,255,255,.055)` | Row / button hover |
| `--color-surface-active` | `rgba(55,53,47,.09)` | `rgba(255,255,255,.09)` | Pressed row |
| `--color-border` | `#e9e9e7` | `rgba(255,255,255,.094)` | Dividers |
| `--color-border-strong` | `rgba(55,53,47,.16)` | `rgba(255,255,255,.14)` | Input outline |
| `--color-text` | `#37352f` | `rgba(255,255,255,.81)` | Primary text |
| `--color-text-muted` | `rgba(55,53,47,.65)` | `rgba(255,255,255,.46)` | Secondary text, labels |
| `--color-text-subtle` | `rgba(55,53,47,.45)` | `rgba(255,255,255,.28)` | Captions, placeholder |
| `--color-text-on-accent` | `#ffffff` | `#ffffff` | Text on the accent fill |
| `--color-accent` | `#5f7355` | `#8ba579` | Primary action, links, focus |
| `--color-accent-hover` | `#53664a` | `#9bb489` | Accent hover |
| `--color-accent-active` | `#46543e` | `#7a9268` | Accent pressed |
| `--color-accent-wash` | `#ebeee4` | `#2b3327` | Selected state, brand rail, info tag |
| `--color-accent-ring` | `rgba(95,115,85,.28)` | `rgba(139,165,121,.32)` | Focus ring |
| `--color-danger` | `#e03e3e` | `#ff7369` | Errors, destructive |
| `--color-danger-wash` | `#fdebec` | `#4b2b2b` | Error field / tag bg |
| `--color-danger-ring` | `rgba(224,62,62,.16)` | `rgba(255,115,105,.24)` | Error focus ring |
| `--color-success` | `#0f7b6c` | `#4dab9a` | Confirmations |
| `--color-success-wash` | `#ddedea` | `#213b37` | Success tag bg |
| `--color-warning` | `#cb912f` | `#ffdc49` | Needs attention |
| `--color-warning-wash` | `#fbf3db` | `#3d3016` | Warning tag bg |
| `--color-neutral-wash` | `rgba(55,53,47,.08)` | `rgba(255,255,255,.09)` | Neutral tag bg |

### Tag text colours

Tags pair a `*-wash` background with a darker text of the same hue:

| Tag | Light bg / text | Dark bg / text |
| --- | --- | --- |
| Neutral | `--color-neutral-wash` / `--color-text` | `--color-neutral-wash` / `--color-text` |
| Info (Idea) | `--color-info-wash` / `--color-info-text` | `--color-info-wash` / `--color-info-text` |
| Success (Shipped) | `--color-success-wash` / `#1c3a2e` | `--color-success-wash` / `#7fcbbb` |
| Danger (Bug) | `--color-danger-wash` / `#5d1715` | `--color-danger-wash` / `#ff9e96` |
| Warning (Open) | `--color-warning-wash` / `#402c1b` | `--color-warning-wash` / `#f2d072` |

## Typography

One system stack (`--font-sans`), four weights. Tight tracking on
large text, `1.5` line-height on body. `--font-serif` (Georgia stack)
is reserved for the login title only.

| Role | Size | Weight | Tracking | Line-height |
| --- | --- | --- | --- | --- |
| display | 40 | 700 | -0.022em | 1.12 |
| heading | 24 | 600 | -0.012em | 1.25 |
| subheading | 18 | 600 | - | 1.35 |
| body | 16 | 400 | - | 1.5 |
| ui / control | 14 | 500 | - | 1.45 |
| caption | 12 | 500 | - | 1.4 |
| overline | 11 | 600 | 0.08em, uppercase | - |

## Spacing

4px base: `--space-2 4 6 8 12 16 24 32 48 64`. Interfaces stay dense;
sections breathe with 32 / 48.

## Radius

- `--radius-sm` 3px - inputs, menu items
- `--radius-md` 5px - buttons, tags
- `--radius-lg` 8px - cards, modals
- `--radius-pill` 999px - pills, avatars

## Elevation

- `--shadow-flat` - `inset 0 0 0 1px` border. The default.
- `--shadow-raised` - cards on a sunken background, toasts.
- `--shadow-overlay` - menus, dialogs, popovers (the Notion popover
  stack).

## Motion

Motion is **functional, never decorative**. Fast and quiet - the user
should barely notice it. No bounce, no spring, no attention-seeking
animation on everyday controls.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | `80ms` | hover fills, tiny state flips |
| `--duration-fast` | `140ms` | buttons, inputs, tags |
| `--duration-medium` | `200ms` | popovers, toasts, disclosure, card entrances |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | entrances (element appearing) |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | state changes (hover, focus, toggle) |

Rules:

- Animate `opacity`, `transform`, `background-color` and `box-shadow`
  only. Never `width` / `height` / `top` / `left` - use `transform`.
- **Entrance:** fade + a 2-4px `translateY` or `scale(0.98)`,
  `--ease-out`, `--duration-medium`.
- **Hover / press / focus:** `--duration-instant` to `--duration-fast`,
  `--ease-in-out`.
- **Reduced motion is handled globally** in `src/index.css` - a
  `@media (prefers-reduced-motion: reduce)` rule collapses every
  transition and animation to ~0. Don't re-implement it per component;
  just don't rely on motion to convey meaning.
- No spinner as the default loading affordance - prefer inline text or
  a skeleton.

## Validation & feedback

- **No native browser validation.** Forms carry `noValidate`; validate
  in the submit handler and render errors inline with the field
  (`--color-danger` text, `role="alert"`, `aria-invalid` +
  `aria-describedby` on the input). The native `required` bubble is not
  design-system styled and must not be relied on.
- Clear a field's error as soon as the user edits that field.
- Submit-level failures (auth, network) render once, above the submit
  button, not per field.

## Selection

UI chrome is not text-selectable - dragging across the app should not
highlight button labels, field labels, or screen titles like a
document.

- `user-select: none` on **controls and titles**: `button`, `label`,
  headings that act as a screen/section title, menu items, tabs, tags,
  icons. `button` and `label` are covered globally in `src/index.css`;
  set it per-component for the rest.
- `user-select: text` (the default) stays on **genuine content and
  messages** - body copy, feedback text, error/alert messages someone
  may want to copy - and **always on form fields** (`input`,
  `textarea`), which the reference `LoginPage` sets explicitly so an
  ancestor `none` can't leak in.

## Component specs

Heights: control `32px`, small control `26px`, form field `34px`.
Hit targets on touch never below `44px`.

### Button

- **Primary:** `--color-accent` fill, `--color-text-on-accent`, 14/500,
  padding `0 12px`, `--radius-md`. Hover `--color-accent-hover`, active
  `--color-accent-active`, disabled `opacity: .45`.
- **Secondary:** transparent, `inset 0 0 0 1px --color-border-strong`,
  `--color-text`.
- **Subtle:** `--color-surface-hover` fill, `--color-text`.
- **Danger:** transparent, `inset 0 0 0 1px` of `--color-danger` at
  40% alpha, `--color-danger` text.

### Text field / textarea / select

- Shell: `inset 0 0 0 1px --color-border-strong`, `--radius-sm`,
  `--color-bg`. Not a border box.
- **Focus:** `inset 0 0 0 1px --color-accent, var(--focus-ring)`.
- **Error:** `inset 0 0 0 1px --color-danger, 0 0 0 3px
  --color-danger-ring`, plus helper text in `--color-danger` with
  `role="alert"`.
- **Disabled:** `--color-surface-sunken` bg, `--color-text-subtle`.
- Label: 13/500, `--color-text-muted`, above the field.
- Select carries a chevron and nothing else.

### Checkbox / radio

16px, `--radius-sm` (square) / circle (radio). Set state drawn in
`--color-accent`. Label is always clickable text beside it.

### Tag

Pill, `padding: 2px 8px`, `--radius-md`, 12/500. Wash bg + darker text
of the same hue (table above). Category and status both live here.

### Callout

`display: flex; gap: 12px; padding: 14px 16px; --radius-md`. Icon +
one sentence. `--color-surface-sunken` + border for neutral;
`--color-accent-wash` for informational.

### Card

`--color-bg`, 1px `--color-border`, `--radius-lg`, padding ~18-20px.
Optional footer holds one action, right-aligned, above a divider.

### Toast

`--shadow-raised`, 1px `--color-border`, `--radius-md`. 3px rule on the
left in the status colour. Auto-dismiss; errors stay until dismissed.

### Menu (popover)

`--shadow-overlay`, `--radius-lg`, 4px padding, 4px item radius,
`--color-surface-hover` on hover. Destructive item in `--color-danger`.

### Avatar / identity row

Avatar: initials, `--color-accent` bg, `--color-text-on-accent`,
`--radius-pill`. Name 13/500, handle 12 `--color-text-muted`.

## Screens

- **Login** - a centered card on a gridded canvas
  (`--color-surface-sunken` + a 40px `--color-border` grid). The card
  splits into a tinted brand rail (`--color-accent-wash`: solid accent
  mark, `Micros`, decorative skeleton lines, `рабочее пространство`
  note) and a form panel (`Вход` overline, serif `Обратная связь`
  title, placeholder-only email + password fields with visually-hidden
  labels, full-width primary button, and a centered
  `Не можете войти? Свяжитесь с администратором` help note - plain
  text, not a link). A theme switcher (`Monitor` / `Sun` / `Moon`,
  cycles system -> light -> dark) sits in the top-right of the canvas.
  The rail drops below 620px, leaving the form full width. 401 copy
  unchanged (`Неверный логин или пароль`).
- **Feedback** - a persistent left sidebar (brand mark + `Новое
  обращение` / `Мои обращения` / `Все обращения` nav, active item on
  `--color-accent-wash`) beside a scrolling main pane. No router: nav
  clicks are local view state in `FeedbackApp`.
  - *Новое обращение* - a bordered form card (type as three single-select
    pills - Ошибка/danger, Предложение/info, Отзыв/neutral - title
    input, message textarea, an attachments dropzone with uniform 72px
    tiles for images and files alike, right-aligned primary submit)
    followed by a ticket list under a sliding `Недавние`/`Популярные`
    segmented control (chronological vs. sorted by votes).
  - *Мои обращения* / *Все обращения* - the same ticket list
    (`category tag + title/last-message snippet + status tag + vote
    button + relative time`, "Все" adds an author column and a search
    field) filtered to the current user or everyone.
  - *Обращение detail* - back link, category + status tags, title, a
    read-only message thread (own messages filled `--color-accent`,
    right-aligned; others flat-bordered, left-aligned). No reply
    composer yet.
  - Category tag column is a fixed 104px (`Предложение` is the long
    pole) so a label can never overlap the title column next to it.
  - Voting lives on the shared ticket list (`useFeedbackTickets`), so a
    vote made from any list is reflected everywhere, including detail.
