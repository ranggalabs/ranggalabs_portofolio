# FRONTEND UI PROMPT — Portfolio Website + CMS Admin (for Google Stitch)

> **How this file is used:** it is provided together with `PRD_Portfolio_CMS.md` (the product requirements, written in Indonesian). The PRD is the source of truth for **what** to build (pages, features, data fields). This file defines **how it must look and behave**. If they conflict, the PRD wins on functionality and this file wins on visual design.

---

## 0. YOUR TASK

Design the complete UI for two connected products:

1. **Public portfolio website** of *Rangga Prasetya, Fullstack Developer* (responsive: desktop 1440 px and mobile 390 px).
2. **CMS admin panel** used only by the owner to manage projects, media, CV, profile, and contact messages (desktop 1440 px, plus a tablet 834 px view for the project editor).

### Work order (follow strictly)
1. **First**, produce a **Design System board** containing: color tokens, typography scale, spacing/radius scale, every component (with variants and states), and the full icon set from Section 4. **Every later screen must be built only from what is on this board.**
2. **Then** generate screens in this order: Public → Home, Projects, Project Detail, About, CV, Contact, 404 → Admin → Login, Dashboard, Projects List, Project Editor, Media Library, Resume, Profile, Site Settings, Inbox.
3. After each screen, silently check it against the **Consistency Checklist (Section 7)** and fix violations before presenting.

---

## 1. PRODUCT CONTEXT (short)

- Audience of public site: **clients** who want to see what the developer has built, and **recruiters** who want a quick summary and a CV download.
- Primary conversion: contact form and CV download. Secondary: open a project's live site or repository.
- Tone: professional, calm, modern, trustworthy. Not flashy, not playful.
- The CMS must feel like a **simple, focused tool**: one user, few screens, no clutter.

---

## 2. DESIGN DIRECTION

- Style: **clean minimal**, lots of whitespace, strong typographic hierarchy, content-first (project imagery is the hero).
- Mood: technical but warm. Think "well-organized developer notebook", not "neon hacker theme".
- Layout: single-column reading flow on mobile; 12-column grid on desktop, max content width **1200 px** (text blocks max **680 px**).
- Motion: minimal and subtle (fade/slide 150–250 ms, hover elevation). No parallax, no heavy blur/glass, no large animated backgrounds (page speed is a hard requirement).
- Imagery: use neutral gray **placeholders with fixed aspect ratios** (16:9 for project covers, 1:1 for avatar, 1200×630 for OG preview). Never leave images without a defined ratio.
- Support **light and dark themes** with the same layout; design light first, then provide dark for the Design System board, Home, and Project Editor.

---

## 3. DESIGN TOKENS (use exactly these)

### 3.1 Color
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FFFFFF` | `#0B0D10` | page background |
| `surface` | `#F7F8FA` | `#12151A` | cards, panels |
| `surface-2` | `#EEF0F3` | `#1A1E25` | hover / nested surfaces |
| `border` | `#E2E5EA` | `#262B33` | all 1 px borders |
| `text` | `#0F1419` | `#F2F4F7` | primary text |
| `text-muted` | `#5B6472` | `#9AA3B2` | secondary text |
| `primary` | `#2563EB` | `#5B8DEF` | main actions, links, focus |
| `primary-hover` | `#1D4ED8` | `#7BA3F3` | hover state |
| `on-primary` | `#FFFFFF` | `#0B0D10` | text on primary |
| `success` | `#16A34A` | `#4ADE80` | published, sent |
| `warning` | `#D97706` | `#FBBF24` | draft, attention |
| `danger` | `#DC2626` | `#F87171` | delete, errors |

Rules: **one accent color only** (`primary`). Status colors are used **only** for status (badges, toasts, validation). Text/background contrast must meet WCAG AA.

### 3.2 Typography
- Font families (max 2): **Inter** (all UI and headings) and **JetBrains Mono** (only for technology chips, code, slugs, file names).
- Weights (max 3): 400, 500, 600.
- Scale (desktop / mobile): 
  - Display 56/64 → 36/44 (hero only), weight 600
  - H1 40/48 → 30/38, 600
  - H2 28/36 → 24/32, 600
  - H3 20/28 → 18/26, 600
  - Body L 18/28, Body 16/26, Small 14/22, Caption 12/18 — weight 400 (500 for labels)
- Letter-spacing: -0.02em on Display/H1/H2; normal elsewhere.

### 3.3 Spacing, radius, elevation
- Spacing scale (4 px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section vertical padding: 96 (desktop) / 64 (mobile).
- Radius: **8** (inputs, buttons, chips), **12** (cards, panels), **16** (large media, modals), **999** (avatar, pill badges).
- Elevation: 3 levels only — none (default, use 1 px border), `sm` (hover on cards), `md` (menus, modals). No colored or heavy shadows.
- Focus ring: 2 px `primary` outline with 2 px offset on every interactive element.

---

## 4. ICON SYSTEM (mandatory)

**Use ONE icon set for the whole product: Lucide.** Do not mix sets. Do not use emoji as icons. Do not use filled and outlined styles together.

Rules:
- Grid **24×24**, stroke **1.75 px**, round caps and joins, outlined style only.
- Sizes allowed: **16** (inline with small text / chips), **20** (buttons, inputs, nav items), **24** (standalone, empty states). No other sizes.
- Color: icons **inherit the text color** of their context (`text`, `text-muted`, or `on-primary`). Status icons use status colors.
- Icon + label in buttons: icon on the left, 8 px gap, except "external link" and "next/forward" arrows which go on the right.
- **One meaning = one icon, everywhere.** Use this map and never substitute:

| Meaning | Lucide icon |
|---|---|
| Home | `house` |
| Projects | `layout-grid` |
| About / Profile | `user` |
| CV / document | `file-text` |
| Contact / email | `mail` |
| Download | `download` |
| External link / open live site | `arrow-up-right` |
| Repository | `github` (brand mark) |
| LinkedIn | `linkedin` (brand mark) |
| Search | `search` |
| Filter | `sliders-horizontal` |
| Add / new | `plus` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Save / confirm | `check` |
| Cancel / close | `x` |
| Preview | `eye` |
| Publish | `upload` |
| Draft | `file-pen` |
| Featured | `star` |
| Media / image | `image` |
| Upload file | `upload-cloud` |
| Inbox / messages | `inbox` |
| Settings | `settings` |
| Dashboard | `gauge` |
| Logout | `log-out` |
| Menu (mobile) | `menu` |
| Theme light / dark | `sun` / `moon` |
| Drag to reorder | `grip-vertical` |
| Calendar / year | `calendar` |
| Location | `map-pin` |
| Success | `circle-check` |
| Warning | `triangle-alert` |
| Error | `circle-x` |
| Info | `info` |
| Chevron (expand / next) | `chevron-down` / `chevron-right` |

---

## 5. COMPONENT LIBRARY (build once, reuse everywhere)

Name every component exactly as below and **reuse the same instance/style for the same purpose on every screen.** Show all variants and states on the Design System board.

**Actions**
- `Button` — variants: **primary** (filled `primary`), **secondary** (border + `surface`), **ghost** (text only), **danger** (filled `danger`, admin only). Sizes: **md** (40 px height) and **lg** (48 px, public hero/CTA only). States: default, hover, focus, active, disabled, loading (spinner replaces icon). Radius 8. **Max one primary button per view/section.**
- `IconButton` — 40×40, ghost/secondary only, always with tooltip and `aria-label`.
- `Link` — `primary` color, underline on hover; external links get the `arrow-up-right` icon.

**Display**
- `TechChip` — JetBrains Mono, 12–14 px, `surface-2` background, radius 8, optional 16 px icon.
- `StatusBadge` — pill; **Published** (success), **Draft** (warning), **New** (primary), **Read** (neutral). Always dot + text, never color alone.
- `ProjectCard` — **the only project card used across Home, Projects list, and related projects**: 16:9 cover, title (H3), one-line summary (Body, 2-line clamp), up to 3 `TechChip` + "+N", year, `arrow-up-right` on hover. Hover: `sm` elevation, cover scales 1.02.
- `SectionHeader` — H2 + optional muted description + optional right-aligned Link.
- `Breadcrumb`, `Avatar` (1:1, 999 radius), `MetricItem` (large number + caption), `Divider` (1 px `border`).

**Forms** (shared by public Contact form and all admin forms)
- `TextField`, `TextArea`, `Select`, `Toggle`, `Checkbox`, `FileUpload` (drag-drop area with `upload-cloud`), `TagInput`, `RichTextEditor` (toolbar with the same icon rules). Each has: label above, helper text, error text (danger + `circle-x`), disabled and focus states. Height 40 px, radius 8, 1 px `border`.
- Validation messages are short, specific, and shown under the field.

**Navigation & layout**
- `TopNav` (public): logo/name left, links center or right (Home, Projects, About, CV, Contact), theme toggle, primary `Button` "Contact". Sticky, `bg` with 1 px bottom border on scroll. Mobile: `menu` icon → full-width drawer.
- `Footer` (public): name, short tagline, nav links, social `IconButton`s (GitHub, LinkedIn, Mail), copyright.
- `AdminSidebar` (admin): 240 px, logo, nav items with 20 px icons (Dashboard, Projects, Media, Resume, Profile, Settings, Inbox with count badge), user menu at bottom. Collapses to icons on tablet.
- `AdminTopbar`: page title, breadcrumbs, primary action on the right.
- `Tabs`, `Pagination`, `Table` (admin lists: sortable header, row hover `surface-2`, row actions as `IconButton`s: `pencil`, `eye`, `trash-2`).

**Feedback**
- `Toast` (success / warning / error / info with matching icons, top-right, auto-dismiss), `Modal` (radius 16, confirm/cancel; delete confirmations use danger `Button`), `EmptyState` (24 px icon, title, one-line help, one `Button`), `Skeleton` (for cards, table rows, editor), `Alert` (inline banner).

---

## 6. SCREENS

Use realistic sample content. Owner: **Rangga Prasetya — Fullstack Developer**, Bandung, Indonesia. Sample projects: *Angkot To School* (smart city transit platform, DISHUB Kota Bandung), *Smart Parking IoT System*, *Threadibility* (Chrome extension), *Wawasan Bela Negara Quiz*. Sample tech: React, TypeScript, Next.js, Node.js, PostgreSQL, Leaflet.js, ESP32, Supabase. Use Indonesian or English consistently per screen (default English UI copy).

### 6.1 Public website (desktop 1440 + mobile 390)

1. **Home**
   - Hero: small "Available for projects" `StatusBadge`-style pill, Display headline, one-sentence subheadline, `Button` primary "View Projects" + `Button` secondary "Download CV" (`download`), row of social `IconButton`s. Right (desktop) or below (mobile): avatar or abstract shape placeholder.
   - Featured Projects: `SectionHeader` + grid of 3 `ProjectCard` (1 column on mobile).
   - Skills/Technologies: grouped `TechChip`s by category (Frontend, Backend, Database, IoT, Tools).
   - Highlights: 3 `MetricItem` (e.g., projects delivered, technologies, years learning) — placeholders.
   - CTA band: short text + primary `Button` "Get in touch".
   - `Footer`.
2. **Projects** — page title, short intro, filter bar (category `Tabs` + technology `Select`, `sliders-horizontal`), grid of `ProjectCard` (3 columns desktop, 2 tablet, 1 mobile), `Pagination` or "Load more", `EmptyState` variant for no results.
3. **Project Detail (case study)** — `Breadcrumb`, H1, summary, meta row (role, year, category with 16 px icons), 16:9 cover, action row (`Button` primary "Visit Live Site" with `arrow-up-right`, `Button` secondary "View Repository" with `github`), sections: Problem, Solution, Result (rich text, max 680 px), `MetricItem` row, tech stack `TechChip`s, image gallery (2-column), "Related Projects" (2–3 `ProjectCard`), CTA band.
4. **About** — photo (1:1), bio, short timeline of experience/education/certifications (simple vertical list with `calendar` icon and dates), skills, CV `Button`.
5. **CV** — page title, last updated caption, embedded PDF preview area (fixed-height frame with fallback), primary `Button` "Download CV" (`download`), secondary "Open in new tab" (`arrow-up-right`).
6. **Contact** — two columns: left short text + direct links (email, WhatsApp, LinkedIn, GitHub, location with `map-pin`); right form (`TextField` name, `TextField` email, `TextArea` message, Turnstile placeholder, primary `Button` "Send message"). Include success `Alert`/`Toast` and inline error states.
7. **404** — large "404", short message, `Button` primary "Back to Home", `Button` secondary "View Projects".

### 6.2 CMS admin (desktop 1440; project editor also tablet 834)

All admin screens use `AdminSidebar` + `AdminTopbar`.

1. **Login** — centered card: logo, `TextField` email, `TextField` password, primary `Button` "Sign in", error `Alert` state. No sidebar.
2. **Dashboard** — 4 stat cards (Published projects, Drafts, New messages, CV last updated), "Recent projects" `Table` (5 rows), "Latest messages" list (3 items), quick actions (`Button` "New Project", "Upload CV").
3. **Projects List** — topbar action primary `Button` "New Project" (`plus`); toolbar with search, status filter `Select`, category filter; `Table` with columns: cover thumbnail, title + slug (mono), category, `StatusBadge`, featured (`star`), year, updated, row actions; drag handle (`grip-vertical`) to reorder featured; `Pagination`; `EmptyState` variant.
4. **Project Editor** (most important admin screen) — two-column layout: 
   - Main column (form): Title, Slug (mono, auto-generated, editable), Summary (with 160-character counter), Cover (`FileUpload` with preview + required alt text), Gallery (multi-upload with reorder), Content (`RichTextEditor` with sections Problem / Solution / Result), Metrics (repeatable label + value rows with `plus` and `trash-2`), Tech stack (`TagInput`), Links (live URL, repository URL).
   - Side column: **Publish panel** (`StatusBadge`, primary `Button` "Publish" (`upload`), secondary "Save draft" (`file-pen`), ghost "Preview" (`eye`)), Category `Select`, Year, Role, Client type, Featured `Toggle`, and **SEO panel** (SEO title with counter, meta description with counter, OG image `FileUpload`, live **search-result preview** card and **social-share preview** card).
   - Unsaved-changes indicator and delete (danger, with confirm `Modal`) at the bottom of the side column.
5. **Media Library** — grid/list toggle, upload dropzone, search, each item: thumbnail, file name (mono), dimensions, size, alt-text status (warning `triangle-alert` if missing); detail side panel with alt text and caption editing.
6. **Resume** — current CV card (file name, version label, uploaded date, size, PDF preview thumbnail), `FileUpload` to replace, `TextField` version label, primary `Button` "Publish new CV", read-only stable public URL with copy `IconButton`.
7. **Profile** — form: name, headline, bio (`RichTextEditor`), photo upload, location, availability text, social links (repeatable rows).
8. **Site Settings** — site name, site URL, default SEO title/description, default OG image, contact email, with a save bar.
9. **Inbox** — split view: message list (sender, excerpt, date, `StatusBadge` New/Read) and message detail panel (full message, sender email with copy, "Reply" `Button` with `mail`, "Mark as read"/"Delete").

### 6.3 Required states (show at least once)
Loading (`Skeleton`), empty (`EmptyState`), validation error, success toast, destructive confirm `Modal`, disabled/loading button, and dark theme for Design System board, Home, and Project Editor.

---

## 7. CONSISTENCY CHECKLIST (hard rules — verify every screen)

1. **Same function → same component.** A project is always shown with `ProjectCard`; a status is always a `StatusBadge`; an action is always a `Button`/`IconButton`. Never invent a one-off variant.
2. **Same meaning → same icon**, taken only from the Section 4 map. One set (Lucide), one stroke width, allowed sizes 16/20/24 only.
3. **Only tokens from Section 3.** No new colors, font sizes, radii, or shadows. Only one accent color.
4. **One primary `Button` per view/section**; secondary/ghost for everything else; destructive actions always `danger` + confirm `Modal`.
5. **Labels are consistent:** same verbs for same actions across the product (e.g., always "Publish", "Save draft", "Delete", "Download CV", "Send message"). Buttons use sentence case.
6. **Alignment and spacing** follow the 4 px scale and 12-column grid; identical section padding across pages.
7. **Every input has a visible label, helper/error text, and all states.** Errors never rely on color alone.
8. **Every image has a defined aspect ratio** and alt text intent; no unlabeled icon-only controls (tooltips + `aria-label`).
9. **Public and admin share the same tokens and form components**, only layout differs.
10. **Mobile is not a shrunk desktop:** touch targets ≥ 44 px, stacked layout, drawer navigation, no horizontal scrolling.
11. If something is not defined in this file or the PRD, **choose the simplest option that reuses an existing component** instead of adding a new style.

---

## 8. PERFORMANCE-AWARE UI RULES

The site targets Lighthouse mobile ≥ 95. Therefore:
- Avoid large full-bleed hero videos, heavy gradients, big blurs, and stacked shadows.
- Keep a single hero image/graphic; below-the-fold images are lazy by nature.
- Limit decorative elements; prefer type, spacing, and borders for hierarchy.
- Hover/scroll effects only via `transform` and `opacity`. Respect reduced-motion (design a static alternative).

## 9. ACCESSIBILITY

- WCAG AA contrast in both themes; visible focus ring; full keyboard operability.
- Semantic structure: one H1 per page, logical heading order, landmarks (`header`, `nav`, `main`, `footer`).
- Form labels always visible (no placeholder-only labels). Minimum touch target 44×44 px.

## 10. DELIVERABLES

1. Design System board (tokens, components with states, icon set).
2. All public screens at desktop and mobile.
3. All admin screens at desktop (+ tablet for Project Editor).
4. Dark theme for: Design System board, Home, Project Editor.
5. A short list of any assumptions made where this file and the PRD were silent.
