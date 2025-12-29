# Translation Checklist (Infra + Domains)

## Infra now in place

- Global provider with type-safe map (`TranslationsProvider`) and hook (`useTranslations`).
- Locale persistence (localStorage + cookie) and html `lang` sync.
- Floating language switcher component ready to reuse (`LanguageSwitcher`).
- Toaster helper aligned on `t.toasts.*` across locales.

## Domains to cover next

- Global shell: navbar, sidebar, breadcrumbs, footer, cookie banner labels, theme toggle labels, currency selector labels, search placeholders.
- Public pages: home hero, course catalog filters/sorting, pricing/checkout CTAs, testimonials, FAQ, contact form, legal pages (LGPD/terms/privacy), 404/500 messages.
- Dashboards: admin (all menu items, cards, tables empty states, filters), teacher (courses, earnings, students, messages inbox), student (courses, progress, certificates, notifications).
- Forms: validation/error/success messages beyond auth (profile, password, avatar, course CRUD, uploads, payments).
- Empty states and skeleton labels: lists with zero items, loading placeholders, retry actions.
- Status badges: enrollment, payment, course publication, feature flags, notifications read/unread.
- Dynamic data mapping: category names, roles, plan names, payment statuses, certificate statuses.

## Key naming conventions

- Keep domain-specific namespaces to avoid collisions: `toasts`, `inbox`, `navbar`, `sidebar`, `footer`, `emptyStates`, `badges`, `filters`, `cta`, `forms.profile`, `forms.course`, `forms.payment`.
- Prefer nouns for labels (`navbar.courses`) and verbs for CTAs (`cta.startNow`).
- Reuse global `common` for generic actions (save, cancel, delete) to avoid duplicates.

## How to add safely

1. Add keys in `pt-BR.json` first (source of truth), then mirror in `en-US.json` and `es-ES.json` — build will fail if keys diverge thanks to the typed map.
2. For new UI strings, wire components to `useTranslations()` and use dotted paths (ex.: `t.navbar.courses`).
3. For dynamic values, map enums/status codes to translations (ex.: `statusLabels[status]`).
4. Keep toasts under `t.toasts.*` (success/error/validation/confirmation/upload).

## Quick gaps to fill (high impact)

- Navbar/sidebar menu item labels for all roles.
- Footer links/titles, newsletter CTA.
- Admin dashboard card titles/subtitles and table column headers.
- Student dashboard progress labels and certificate statuses.
- Teacher earnings breakdown labels and payout actions.
- Course catalog filters (category, price, sort) and empty state messages.
