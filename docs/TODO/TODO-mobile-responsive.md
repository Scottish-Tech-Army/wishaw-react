# Mobile View / Responsive Design To‑Do ✅

## 1. Global setup

- [x] 1a**Verify viewport meta tag**
  - [x] Open `index.html` and ensure there is a `<meta name="viewport" content="width=device-width, initial-scale=1">`. ✅ Already present as `initial-scale=1.0`
- [x] 1b **Define mobile-first breakpoint strategy**
  - [x] Decide core breakpoints (e.g. 640px, 768px, 1024px). ✅ sm=640px, md=768px, lg=1024px
  - [x] Add comments or variables in `index.css` / `App.css` documenting these breakpoints. ✅ Added to both files
- [x] 1c **Set base typography and spacing for small screens**
  - [x] Ensure `body` font-size, line-height, and padding work well at ~320–375px width. ✅ Added `font-size: 1rem`, `line-height: 1.6`, `overflow-x: hidden` to `body` in `index.css`
  - [x] Remove fixed heights where possible; use min-height/flex instead. ✅ Converted `height: 600px`/`500px` on `.hero` to `min-height`; converted desktop-first `max-width` query to mobile-first `min-width` in `App.css`

---

## 2. Global layout & utilities (`App.tsx`, `App.css`, `index.css`, `portal.css`)

- [x] 2a **Convert any fixed widths to fluid widths**
  - [x] Replace `width: XXXpx` with `%`, `max-width`, or `flex: 1` where practical. ✅ `.sp-notif-panel` → `min(320px, calc(100vw - 2rem))`; all `App.css` desktop-first `max-width` queries audited (all were already `max-width` caps, which are fluid); converted remaining `@media (max-width: ...)` blocks in `App.css` to mobile-first `@media (min-width: ...)`; `.about__container` and `.footer__container` now default to single-column/stacked on mobile
- [x] 2b **Use flex/grid for layout**
  - [x] Ensure main page sections stack vertically on small screens (column direction). ✅ `App.css`: programs/news grids default to `1fr` on mobile (multi-col at sm+); about/programs/news/partners sections get tighter padding on mobile; section headings scale down. `portal.css`: `.sp-layout` is now `flex-direction: column` by default (mobile), going row at sm (≥640px); `.sp-sidebar` becomes a horizontal top nav on mobile and reverts to a side column at sm+; `.sp-dashboard__grid` defaults to `1fr` (mobile) → `1fr 1fr` at md; `.sp-quicklinks` defaults to 2-col (mobile) → 4-col at sm; `.sp-stats-row` defaults to 2-col → 4-col at md; `.sp-dashboard__hero-card` stacks column on mobile → row at sm+
- [x] 2c **Add core media queries**
  - [x] Add `@media (min-width: 768px)` rules to introduce multi-column / desktop layouts. ✅ All layout sections now have `min-width` companions: navbar (768px), hero (768px), about (768px), programs/news/partners grids (640px), footer (768px), portal layout/sidebar (640px/768px), dashboard grid (768px), stats row (768px), quicklinks (640px), leaderboard cards (680px), myrank bar (600px), stats-breakdown (600px), evidence layout (760px)
  - [x] Keep default (no media query) styles optimized for mobile (mobile-first). ✅ Every `@media (max-width: ...)` in `App.css`, `index.css`, and `portal.css` has been converted to `@media (min-width: ...)`; base styles now target ~320px

---

## 3. Public marketing pages (`Navbar`, `Hero`, `Programs`, `News`, `Partners`, `About`, `Footer`)

### 3.1 Navbar (`src/components/Navbar.tsx`)

- [x] 3.1a **Mobile navigation pattern**
  - [x] Collapse horizontal nav links into a hamburger menu for small screens. ✅ Desktop links hidden by default (`display: none`), shown at `min-width: 768px`
  - [x] Add a toggle state to show/hide the mobile menu. ✅ `open` state drives conditional render of `#navbar-mobile-menu`; icon switches ☰↔✕
  - [x] Ensure the logo and menu icon fit on a single line at 320px width. ✅ Container padding reduced to `0.75rem 1rem` on mobile; brand font shrinks to `1.2rem` on mobile with `text-overflow: ellipsis`; right controls use `flexShrink: 0`
- [x] 3.1b **Accessibility**
  - [x] Use `<button>` for the menu icon with `aria-expanded`, `aria-controls`. ✅ Already in place from 3.1a; added `ref={toggleRef}` and `aria-hidden="true"` on the icon span
  - [x] Trap focus inside the open mobile menu if it's a full-screen overlay. ✅ `useEffect` traps Tab/Shift+Tab within toggle button + menu links; `Escape` closes menu and returns focus to toggle; click-outside closes menu; first link auto-focused on open; menu has `role="menu"` / links have `role="menuitem"`

### 3.2 Hero section (`src/components/Hero.tsx`)

- [x] 3.2a **Layout**
  - [x] Stack text and image vertically on small screens (image below text). ✅ Hero uses a full-bleed CSS background (no separate image element); overlay uses `inset: 0` + `min-height: inherit` so it never clips; content is centred via flex at all sizes
  - [x] Ensure hero text is readable on narrow screens (no overflow/clip). ✅ `.hero__content` padding reduced to `1.25rem` horizontal on mobile (safe on 320px); `.hero__title` starts at `1.75rem` (320px) → `2.25rem` (480px) → `3.5rem` (768px); `overflow-wrap: break-word` on both title and subtitle; `width: 100%` on content container; added `aria-label` to the `<section>` for screen readers
- [x] 3.2b **Buttons/CTAs**
  - [x] Make primary CTA buttons full-width or at least large/tappable (≥44px height). ✅ `.hero__cta` is `display: block; width: 100%; min-height: 44px` on mobile → `display: inline-block; width: auto` at `min-width: 480px`; `text-align: center` ensures text stays centred when full-width

### 3.3 Other sections (`Programs.tsx`, `News.tsx`, `Partners.tsx`, `About.tsx`, `Footer.tsx`)

- [x] 3.3a **Cards and grids**
  - [x] Ensure card lists become a single column on small screens. ✅ `.programs__grid` and `.news__grid` already default to `1fr` (mobile) → `auto-fit minmax` at `sm` (640px) from task 2b; `.about__container` single-column on mobile
  - [x] Add horizontal padding so content isn't flush with the edges. ✅ Sections use `padding: 3rem 1rem` on mobile; `.programs__card` reduced to `1.75rem 1.25rem` mobile → `2.5rem 2rem` at sm; `.news__card` reduced to `1.25rem` mobile → `2rem` at sm; `overflow-wrap: break-word` on all card headings; `.about__text h2` scales `1.75rem` → `2.5rem` at md; card text left-aligned on mobile for readability
- [x] 3.3b **Logos / images**
  - [x] Ensure partner logos and images are responsive (`max-width: 100%; height: auto`). ✅ Global `img, video, svg { max-width: 100%; height: auto; display: block }` added to `index.css` as a blanket baseline; `.partners__logo` now a flex item with `flex: 0 1 140px` mobile → `0 1 200px` at sm, and `img` gets `width: 100%` to scale within its container; `.about__image img` gets explicit `max-width: 100%` + `display: block`
- [x] 3.3c **Footer**
  - [x] Stack footer columns on small screens. ✅ `.footer__container` already `flex-direction: column` on mobile → `row` at `min-width: 768px` (from task 2a); footer padding tightened to `1.5rem 1rem` mobile → `2rem` at md
  - [x] Ensure links are easily tappable and text stays readable. ✅ `.footer__links a` now `display: flex; align-items: center; padding: 0.6rem 0.75rem; min-height: 44px` (WCAG touch target); `.footer__links` gets `flex-wrap: wrap; justify-content: center` on mobile; `.footer__social a` gets `min-width/min-height: 44px` and flexbox centering; social icon gap tightened

---

## 4. Student portal – layout & navigation (`src/components/portal/student/*`, `portal.css`)

### 4.1 Student layout shell (`StudentLayout.tsx`)

- [x] 4.1a **Responsive layout**
  - [x] If there is a sidebar, collapse it into a top/bottom nav or slide-out drawer on mobile. ✅ Sidebar becomes a horizontal top nav bar on mobile (`<640px`): `flex-direction: row`, `position: static`, single scrollable row of compact link chips (`overflow-x: auto`, `scrollbar-width: none`), padding tightened to `0.5rem 0.75rem`; sidebar footer (logout/exit/settings) hidden on mobile and replaced with a compact `⏻` logout button inside the sidebar header
  - [x] Ensure main content has adequate padding and doesn't sit under fixed headers. ✅ `.sp-content` padding `1rem` on mobile; topbar is `position: sticky; top: 0` with `min-height: 44px`; topbar padding tightened to `0.65rem 1rem` on mobile; topbar greeting hidden on mobile (`.sp-topbar__left { display: none }`) to save space; topbar right controls use `margin-left: auto` to stay right-aligned
- [x] 4.1b **Navigation**
  - [x] Provide a concise mobile nav (icons + labels if needed). ✅ All nav links render icon + label in the horizontal scroll strip; Settings moved into `sp-sidebar__nav` (hidden on desktop ≥640px via `.sp-sidebar__link--settings-nav`) so it is reachable on mobile without the sidebar footer
  - [x] Make sure active route is clearly highlighted. ✅ `.sp-sidebar__link--active` now receives a `border-bottom: 2px solid var(--sp-accent-lit)` + rounded top corners on mobile (`< 640px`), giving a strong tab-style accent; desktop keeps the filled-pill highlight; React Router `NavLink` automatically sets `aria-current="page"` on the active link; `<nav>` now has `aria-label="Student portal navigation"`

### 4.2 Student dashboard & pages

- [x] 4.2a `StudentDashboard.tsx`
  - [x] Stack dashboard cards vertically on small screens. ✅ `.sp-dashboard` is `flex-direction: column` by default; `.sp-dashboard__grid` is single-column on mobile, two-column at ≥768px; `.sp-stats-row` is 2-col mobile → 4-col at ≥768px; `.sp-quicklinks` is 2-col mobile → 4-col at ≥640px; `.sp-dashboard__hero-card` stacks column on mobile → row at ≥640px (existing)
  - [x] Avoid multi-column layouts under ~768px. ✅ XP bar meta wraps with `flex-wrap: wrap` and hides the "remaining" sub-text below 480px to prevent overflow; `.sp-main-badges-row` switches from fixed `repeat(3, 1fr)` to `auto-fill minmax(80px, 1fr)` on mobile → fixed 3-col at ≥480px; `.sp-stat-card__label` gets `overflow-wrap: break-word` so long labels ("Team XP This Week") wrap cleanly inside the 2-col stat grid
- [x] 4.2b `StudentBadges.tsx`
  - [x] Make badge cards a single column on mobile. ✅ `.sbb-cards` is already `flex-direction: column` (single column at all widths); `.sbb-badge-card__header` padding tightened to `0.85rem 0.9rem` / gap `0.75rem` on mobile → restored to `1rem 1.25rem` / gap `1rem` at ≥480px; `.sbb-badge-card__body` padding similarly tightened; `.sbb-badge-card__xp-row` gets `flex-wrap: wrap` so long XP text wraps cleanly; `.sbb-page__stats` becomes a full-width equal-flex row on mobile (3 chips share the full width) → natural `width: auto` layout at ≥560px
  - [x] Ensure badge images scale down appropriately. ✅ Badges use emoji icons (no `<img>` elements) so scaling is automatic; `.sbb-badge-card__icon-wrap` is `52px × 52px` with `flex-shrink: 0`, safely fitting any screen ≥320px; `.sbb-sub-badge__detail` left indent reduced from `3.35rem` to `1rem` on mobile → restored at ≥480px to maintain alignment with icons
- [x] 4.2c `EvidenceSubmission.tsx`
  - [x] Make forms full-width with readable labels and touch-friendly inputs. ✅ `.ev-select` gets `width: 100%; min-height: 44px` (WCAG touch target); `.ev-textarea` gets `width: 100%`; `.ev-btn` gets `min-height: 44px`; `.ev-btn--full` already sets `width: 100%`; `.ev-page` padding tightened to `1rem` on mobile → `2rem 1.5rem 3rem` at ≥640px; `.ev-card` padding tightened to `1rem` on mobile → `1.5rem` at ≥480px
  - [x] Ensure any multi-column form layouts collapse to single column. ✅ `.ev-layout` is already `grid-template-columns: 1fr` by default (single column), upgrading to `1fr 1fr` at ≥760px; `.ev-challenge-info` gets `flex-wrap: wrap` so the XP badge wraps below the text+criteria on very narrow screens instead of squeezing; all form fields (`ev-field`) are already `flex-direction: column` stacking label above input
  - [x] Additional mobile polish. ✅ `.ev-textarea` set to `font-size: 1rem` on mobile to prevent iOS auto-zoom on focus → `0.88rem` at ≥480px; `.ev-dropzone__remove` gets `min-height: 44px` WCAG touch target; `.ev-dropzone__file-name` and `.ev-challenge-info__criteria` get `overflow-wrap: break-word` for long text; `.ev-submission` gets `flex-wrap: wrap` on mobile so meta (status+date) drops to its own row below the body → `flex-wrap: nowrap` at ≥480px; `.ev-submission__notes` changes from `white-space: nowrap` → `normal` on mobile so long notes display fully → restored at ≥480px; `.ev-page__title` shrinks from `1.6rem` → `1.35rem` on mobile → restored at ≥480px; all submission text fields get `overflow-wrap: break-word` for safety
- [x] 4.2d `StudentTeams.tsx` / `StudentTeamDetail.tsx`
  - [x] Ensure team lists are simple vertical lists on mobile. ✅ `.sp-teams__grid` uses `repeat(auto-fill, minmax(min(300px, 100%), 1fr))` — the `min()` clamp guarantees a single column on any screen narrower than 300px (e.g. 320px); `.sp-teams` padding tightened to `1rem` on mobile → `2rem 1.5rem 3rem` at ≥640px; `.sp-team-detail__members-grid` likewise uses `minmax(min(340px, 100%), 1fr)` for safe single-column on mobile; `.sp-team-detail` padding tightened to `1rem` → `1.5rem` at ≥640px
  - [x] Convert complex tables into stacked "cards" or definition lists where needed. ✅ Both pages already use card-based layouts (no HTML tables); `MemberCard` stacks badge rows and module rows vertically inside a `flex-direction: column` card body; `.sp-team-detail__hero-body` uses `flex-wrap: wrap` so the stats row drops below the description on narrow screens; `.sp-team-detail__hero-stats` becomes `width: 100%; justify-content: stretch` on mobile (3 stat chips share the full width with `flex: 1`) → `width: auto` / `flex: none` at ≥640px; `.sp-team-detail__hero-name` scales from `1.3rem` mobile → `1.6rem` at ≥480px; `.sp-team-detail__hero-body` gap/padding tightened on mobile; `.sp-member-card__header` padding/gap tightened on mobile; `.sp-member-card__gamertag` gets `overflow-wrap: break-word` for long gamertags
- [x] 4.2e `StudentLeaderboard.tsx`
  - [x] Make leaderboard horizontally scrollable if columns are many, or collapse columns on mobile. ✅ `.sp-lb-table-wrapper` already has `overflow-x: auto` as a scrollable fallback; additionally, the `Level`, `Modules`, and `Badges` columns are now hidden below 540px via new `.sp-lb-th--secondary` / `.sp-lb-td--secondary` CSS classes (`display: none` → `display: table-cell` at ≥540px), keeping only `Rank`, `Player`, and `XP` visible on phones; the three column-toggle classes have been applied to the corresponding `<th>` and `<td>` elements in the TSX
  - [x] Keep key info (rank, name, score) visible without scrolling when possible. ✅ `Rank`, `Player` and `XP` columns are always visible at all widths; `.sp-lb-player__name` gets `overflow-wrap: break-word` so long gamertags don't overflow; podium scales gracefully on narrow screens — avatars shrink from `64px`→`48px` (2nd/3rd) and `76px`→`58px` (1st), block heights reduced, gap tightened, names shrink to `0.75rem` — all restoring to original sizes at ≥480px; `.sp-lb-tab`, `.sp-lb-period-btn`, and `.sp-lb-filter-btn` all get `min-height: 44px` (WCAG touch target)
- [x] 4.2f `StudentProfile.tsx`, `StudentPublicProfile.tsx`, `StudentSettings.tsx`
  - [x] Stack sections vertically with generous spacing. ✅ `.sp-profile__hero-content` switches to `flex-direction: column; align-items: center; text-align: center` on mobile, restoring `flex-direction: row` at ≥640px; hero padding tightened `1.25rem 1rem 1rem` → `2rem 2rem 1.25rem` at ≥640px; `.sp-profile__stats-row` uses safe `minmax(min(120px, 100%), 1fr)` grid; `.sp-profile__tabs` gets `overflow-x: auto` horizontal scroll with hidden scrollbar; `.sp-tab-btn` gets `min-height: 44px` (WCAG touch); avatar scales `76px`→`100px` at ≥480px; name font `1.25rem`→`1.45rem` at ≥480px; rank circle shrinks to `44px`→`52px` at ≥480px; `.sp-badge-group__progress` hidden on mobile, shown at ≥640px; `.sp-xp-history__item` stacks XP/date under activity on mobile (`grid-template-columns: 2rem 1fr`), restores 4-column grid at ≥640px; `.sp-module__tracker-head`/`.sp-module__tracker-row` get `min-width: 560px` inside scrollable wrapper; bio card tightened to `1rem` padding on mobile; all long text gets `overflow-wrap: break-word`
  - [x] Ensure forms and profile fields fit on small screens without horizontal scroll. ✅ **Settings:** `.sp-settings` padding `1rem 1rem 2.5rem` → `2rem 1.5rem 3rem` at ≥640px; `.sp-settings__section` padding `1rem`→`1.5rem` at ≥640px; `.sp-settings__input`/`.sp-settings__textarea` get `font-size: 1rem` (prevents iOS zoom) + `min-height: 44px`; `.sp-settings__actions` stacks vertically with stretch buttons on mobile, restoring `flex-direction: row` at ≥640px; `.sp-settings__avatar-row` stacks vertically centered on mobile, restoring `flex-direction: row` at ≥640px; avatar preview `80px` on mobile; `.sp-settings__show-pass-btn` gets `min-height: 44px`; base styles added for `.sp-settings__avatar-row`, `.sp-settings__avatar-preview`, `.sp-settings__avatar-controls`, `.sp-settings__avatar-input`; **Public profile:** `.sp-member-card__badge-row`/`.sp-member-card__module-row` get `flex-wrap: wrap`; badge/module meta rows get `flex-wrap: wrap` with tighter gap; long names get `overflow-wrap: break-word`

---

## 5. Admin portal – layout & tables (`src/components/portal/admin/*`)

### 5.1 Admin layout (`AdminLayout.tsx`)

- [ ] **Responsive chrome**
  - [ ] Collapse any left sidebar to a drawer/top nav on small screens.
  - [ ] Ensure header actions (search, user menu) wrap or stack nicely on narrow widths.

### 5.2 Admin pages

- [ ] `AdminDashboard.tsx`
  - [ ] Stack dashboard widgets and charts vertically on mobile.
  - [ ] Avoid side-by-side cards until `min-width: 768px`.
- [ ] `AdminUsers.tsx` and other management views
  - [ ] Audit tables: for mobile, convert to:
    - [ ] Scrollable tables (horizontal scroll) **or**
    - [ ] Card-based layouts where each row becomes a card with key fields.
  - [ ] Ensure action buttons (edit/delete) are touch-friendly and visible.

---

## 6. Shared hooks/data views (read-only responsiveness)

- [ ] **Check UI consuming hooks in `src/hooks/`**
  - [ ] For components that render large lists (leaderboard, modules, teams), ensure:
    - [ ] Reasonable line length, wrapping text.
    - [ ] No overflow from long names or labels (use `word-break` or truncation with tooltip where needed).

---

## 7. Testing & polish

- [ ] **Browser dev tools testing**
  - [ ] Test at 320px, 375px, 414px, 768px, and 1024px widths.
  - [ ] Test portrait and landscape orientations.
- [ ] **Keyboard & screen reader**
  - [ ] Confirm navigation (especially mobile menus, drawers, dialogs) is keyboard accessible.
  - [ ] Check focus states are visible on all interactive elements.
- [ ] **Real devices (if possible)**
  - [ ] Open on an actual phone and a small tablet; validate performance and tap targets.
- [ ] **Final visual polish**
  - [ ] Align spacing, font sizes, and colors with any existing design/brand tokens.
  - [ ] Remove any debug borders or placeholder styles.

---

## 8. Nice-to-have enhancements

- [ ] Add subtle transitions for opening/closing mobile nav menus and drawers.
- [ ] Implement “scroll to top” or sticky header behavior where it improves UX.
- [ ] Consider dark mode or high-contrast tweaks if your `ThemeContext` supports it.
