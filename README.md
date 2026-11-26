# Money Tracker

A private-by-default, multi-user personal finance website for tracking income, expenses, investments, money lent and borrowed, repayment history, income goals, and a transaction-linked money diary.

> **Project status:** Requirements and initial system design are documented. The attached Gemini dashboard, ledger, and lending/borrowing screens are the selected visual direction. Implementation, review, and deployment are next. The selected stack below is a reasoned starting point; revisit it if the UI reveals a concrete constraint.

## Product goals

- Work well on phone and desktop in a browser. No native mobile app is in scope.
- Let users create their own accounts. Every user sees only their own financial data; no shared accounts.
- Use one chosen currency per user. Choose it at signup, allow changing it in settings, and do not convert currencies.
- Let users create manual cash/bank accounts with opening balances. Recorded activity updates each account's tracked balance; no bank connection or automatic balance sync is implied.
- Make common money records quick to add, edit, search, filter, export, and delete.
- Present daily and monthly summaries, net worth, cash flow, investments, debts due, charts, and income goals.
- Link lending and borrowing records to repayment history and diary reminders.
- Keep investment details manually entered and editable by the user.
- Provide password login and email OTP password reset. Do not require email verification at login.
- Keep code organized by feature so an investment or lending change stays within its feature module where practical.

## Confirmed requirements

| Area | Requirement |
|---|---|
| Accounts | Multiple independent users; each user sees their own records only. No sharing. |
| Currency | One currency per user, selected at signup and changeable in settings. No multi-currency conversion. Try locale/network-informed default selection where reliable; fall back to USD and always let the user choose. |
| Cash accounts | Users can add manual cash/bank accounts and opening balances. Ledger activity updates the tracked balance; there is no bank integration. |
| Records | Income, expenses, investments, borrowed, lent, repayments, and transfers; include dates, categories, notes, and attachments/recurrence as optional follow-up decisions before implementation. |
| Investments | Users manually enter and maintain investment details. |
| Lending/borrowing | Repayments reduce outstanding balances and create linked ledger entries. A linked diary reminder is created automatically. |
| Diary | Dated, transaction-linked notes; e.g. “Lent $100 to Mentos on 22 Nov 2026 for chocolate.” When the due is paid, the user can delete the diary reminder while retaining the transaction and repayment history. |
| Goals and reporting | Income goal; daily and monthly summaries, net worth, cash flow, investment totals, debts due, charts, and exports. |
| Authentication | Password login; email OTP only for forgotten-password flow. No email verification gate at login. Password reset is initiated from login. |
| Record management | Edit/delete transactions; CSV import/export. |
| Devices | Responsive browser website for phone and desktop; no installable/native app requirement. |
| Build pace | User has coding, Git, database, and deployment experience; allow at least 6 hours each week. |
| Code organization | Separate feature modules/files, especially investments and lending/borrowing, to keep future changes localized. |

### Decisions still to make during UI/product detailing

- Whether signup is open to anyone or invite-only. Initial recommendation: open signup with verified rate limits and anti-abuse protections; email verification remains optional as requested.
- Categories and default category list; whether attachments and recurring entries are needed.
- Investment fields (account/institution, asset label, contributed amount, current value, date, notes) and whether history of value changes is required.
- Whether repayments and debt due dates need in-app reminders; push notifications are not currently requested.
- Whether to support credit-card/liability accounts as a distinct account type. Initial scope tracks cash/bank balances plus money borrowed/lent; avoid presenting an untracked credit-card liability in net worth.
- Import behavior for duplicates, invalid rows, and rollback after a partial import.
- Locale handling, timezone, and the exact currency list.
- Email delivery provider and sender domain. Gmail may be convenient for development, but a real multi-user launch needs dependable transactional delivery and rate limiting.
- Product name, branding, visual direction, and final host/domain.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| UI and application | Next.js App Router + TypeScript | One typed web application for responsive pages and server-side operations. |
| Styling and components | Tailwind CSS + accessible component primitives (e.g. shadcn/ui) | Fast visual iteration after selecting the UI direction; consistent responsive components. |
| Data store | Supabase hosted PostgreSQL | Relational data fits ledgers, repayment links, and user ownership constraints. |
| Authentication | Supabase Auth, password sign-in and email OTP recovery | Avoid implementing password storage and OTP lifecycle ourselves; enforce ownership in database policies and server code. |
| Charts | Recharts (or equivalent after UI selection) | Dashboard charts without coupling financial calculations to chart components. |
| Validation | Zod schemas shared at form/server boundaries | Reject malformed amounts, dates, and imported rows consistently. |
| Hosting | Render or another host selected after a staging comparison; Supabase hosts DB/Auth | Keep hosting swappable. A Render free service is useful for a preview, not the dependable final service. |
| Email | Supabase Auth email provider initially; configure a transactional provider for production delivery | OTP email should not depend on an ad-hoc Gmail SMTP setup. Validate provider pricing, sender/domain requirements, and deliverability before launch. |
| Source control and CI | GitHub + GitHub Actions (lint, typecheck, build, automated checks) | Reviewable history and repeatable deployment checks. |

**Money representation:** store values as integer minor units (for example, cents/paise) plus an ISO 4217 currency code. Never use floating-point arithmetic for money. Currency is fixed per user for normal entry; changing it later must not silently reinterpret old amounts. Ask the user to confirm whether changing currency should change only future records or convert existing ones. Recommended default: currency change applies to new records only; historic values retain their stored currency and are clearly labeled until converted by an explicit migration.

## Selected visual direction

Use the three user-provided Gemini mockups as the design reference set:

- **Dashboard:** spacious summary cards, income-goal progress, cash-flow chart, net-worth breakdown, recent activity, and upcoming debts.
- **Ledger:** clear date/description/category/type/amount columns, search, type filters, and a prominent add-transaction action.
- **Lending & borrowing detail:** searchable record list beside a selected record's outstanding balance, repayment action/history, and linked diary reminder.

Shared visual language: warm off-white page background, white cards with subtle warm-gray borders, deep forest-green primary actions and headings, restrained green/red/blue state colors, rounded corners, generous spacing, and large readable type. Keep the same components and hierarchy across pages. On narrow screens, collapse the desktop navigation and turn the selected-record side panel into a navigable detail page or drawer; do not shrink the two-column mockup unchanged.

Treat generated text and numbers as placeholders, not product rules. In particular, format chart numbers correctly and ensure all dashboard figures reconcile with the underlying ledger. A loan repayment is a return of principal and must reduce the receivable/payable; it must not be counted as earned income or as an income-goal contribution. Investment contributions are asset transfers, not expenses. Keep each transaction's financial meaning explicit in charts and reports.

## System design

```text
┌────────────────────────────── User devices ───────────────────────────────┐
│             Mobile browser                         Desktop browser        │
└─────────────────────────────┬─────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         Next.js web application                           │
│                                                                           │
│  UI pages/components  ──>  Feature services  ──>  Validation / auth guard  │
│  Dashboard                  ledger                 Zod                     │
│  Transactions               investments            user session           │
│  Lending & borrowing        debts                  ownership checks        │
│  Diary                      goals                  safe error handling     │
│  Settings                   reports / CSV                                  │
└────────────────────────────┬───────────────────────┬──────────────────────┘
                             │                       │
                   scoped SQL / RLS          auth API / OTP email
                             │                       │
                             ▼                       ▼
┌──────────────────────────────┐        ┌───────────────────────────────────┐
│ Supabase PostgreSQL          │        │ Supabase Auth + transactional     │
│ users, accounts, entries,    │        │ email provider (configured sender)│
│ investments, debts, payments,│        └───────────────────────────────────┘
│ diary, goals, categories     │
│ Row Level Security policies │
└──────────────────────────────┘
                 │ wrapped per-user data keys only
                 ▼
┌─────────────────────────────────────┐
│ External KMS / HSM                  │
│ Holds wrapping key (KEK); unwrap is  │
│ restricted to server identity, with  │
│ audit logs and key rotation          │
└─────────────────────────────────────┘

GitHub ──> CI checks ──> staging deploy ──> production deploy
                              │                       │
                     test account/data       HTTPS + production env vars
```

### Main request flow

1. The browser sends a request over HTTPS.
2. The server validates the Supabase session and parses request data with the feature's schema.
3. A feature service performs the operation using the authenticated user identity. It never trusts a user ID supplied by the browser.
4. PostgreSQL Row Level Security (RLS) independently restricts every query and mutation to the signed-in user's rows.
5. Related money operations (for example, repayment + balance update + ledger entry) run in one database transaction so they cannot become partially applied.
6. The server returns only the minimum needed data; logs never include passwords, OTPs, session tokens, or unnecessary financial details.
7. For application-level encryption, the server fetches the signed-in user's encrypted rows, asks the KMS to unwrap that user's data-encryption key (DEK), decrypts only in server memory, performs calculations, then encrypts sensitive fields before writes. The browser never receives the DEK or KMS credentials.

### Core data model (initial)

```text
auth.users (Supabase managed)
    │ 1:1
    └── user_profiles (user_id, display_name, currency_code, timezone, created_at)
           ├── accounts (id, user_id, name, kind: cash|bank, opening_balance_minor,
           │             currency_code, archived_at, created_at, updated_at)
           ├── transactions (id, user_id, type, amount_minor, currency_code,
           │                 account_id?, destination_account_id?, category_id,
           │                 occurred_at, description, created_at, updated_at, deleted_at?)
           ├── investments (id, user_id, name, invested_minor, current_value_minor,
           │                valuation_date, notes, created_at, updated_at)
           ├── debt_items (id, user_id, kind: lent|borrowed, person, principal_minor,
           │               due_date, status, notes, created_at, updated_at)
           │       └── debt_payments (id, user_id, debt_item_id, amount_minor,
           │                        paid_at, transaction_id)
           ├── diary_entries (id, user_id, transaction_id?, debt_item_id?, entry_date,
           │                  body, reminder_status, created_at, updated_at)
           ├── income_goals (id, user_id, target_minor, period, starts_on, ends_on)
           └── categories (id, user_id?, name, kind, is_default)
```

Use foreign keys, check constraints for positive amounts and valid states, indexes on `(user_id, occurred_at)` and due dates, and RLS on every user-owned table. Every referenced account must belong to the same user. Derive current account balances from opening balance plus posted entries, rather than maintaining a second unverified balance; a transfer must debit one account and credit another atomically. For deletes, define the behavior explicitly: deleting a debt reminder must not delete repayments or ledger history. Prefer soft-delete for user-visible financial records only if the UI needs an undo/audit trail; provide a clear permanent-delete flow if required. CSV import must validate the full file, preview changes, and commit atomically or report per-row failures without duplicating entries.

### Financial definitions

- **Cash flow:** earned income minus expenses over the chosen period. Transfers between a user's accounts, loan principal/repayments, and investment contributions are excluded from earned-income totals and income-goal progress; report principal movements separately so cash movement is still visible.
- **Net worth:** sum of manually tracked cash/bank account balances plus manually maintained investment current values plus money lent outstanding, minus money borrowed outstanding. Include only liabilities the user records; no bank balance is inferred or synced.
- **Investment total:** manually entered current values, with contributions available as a separate total.
- **Debt due:** remaining balance and due date, with partial repayments reflected immediately.
- **Income goal progress:** qualifying income ledger entries during the selected goal period divided by the target.

Definitions should appear in help text so users understand what a total includes. These are personal tracking calculations, not bank-linked balances or investment advice.

## Code organization

Keep each domain's pages, schemas, server actions/services, and UI components grouped together. Share only stable primitives and cross-domain infrastructure.

```text
src/
  app/                         # route composition, layouts, auth callbacks
  components/ui/               # buttons, inputs, dialogs, tables
  features/
    auth/                      # sign-in, sign-up, reset OTP, session helpers
    dashboard/                 # summaries and chart composition
    ledger/                    # income, expenses, transfers, shared entry types
    investments/               # investment forms, service, schema, queries
    debts/                     # lending/borrowing, repayments, due tracking
    diary/                     # linked diary notes and deletion behavior
    goals/                     # income targets and progress
    reports/                   # filters, calculations, CSV import/export
    settings/                  # currency, profile, account deletion
  lib/
    supabase/                  # server/browser clients; no service key in browser
    money/                     # exact arithmetic and formatting
    security/                  # common authorization helpers
  types/                       # generated database types
supabase/
  migrations/                  # versioned schema, indexes, RLS, functions
  seed.sql                     # local development data only
```

Avoid putting feature rules in generic page components. Debt repayment behavior belongs in `features/debts` and its database transaction/function; investment valuation behavior belongs in `features/investments`.

## Security and privacy requirements

- Enforce HTTPS in hosted environments and secure cookie/session handling.
- Rely on the database provider's AES-256 encryption at rest and TLS in transit as the baseline; add application-level encryption for sensitive user data as an additional layer, not as a replacement for authentication, RLS, or secure deployment.
- Use **AES-256-GCM** (authenticated encryption), not an unspecified AES mode. Generate a unique random 96-bit nonce for each encryption with a key; store nonce, ciphertext, and authentication tag together. Use a cryptographic library/API and never implement cipher primitives ourselves.
- Use envelope encryption: generate a random 256-bit per-user DEK; have an external KMS/HSM key-encryption key (KEK) wrap it. Store only the wrapped DEK and KMS key/version identifier with the user's database metadata. The raw DEK and KEK must never be stored in a second ordinary database or sent to the browser.
- Restrict KMS unwrap permission to the server's workload identity, separate dev/staging/production keys, audit key usage, and plan key rotation and data re-encryption before launch. Password reset must not destroy or change the data key.
- Keep database queries behind server-side feature services for encrypted fields. Aggregations and reports must decrypt authorized rows in server memory; encrypted text cannot be searched/indexed normally. Document the remaining visible metadata (such as record type, date, and user ownership) and the performance trade-off.
- Delete the user's wrapped DEK as part of account deletion only after the deletion flow also removes the encrypted records according to retention policy; key deletion can make surviving ciphertext unrecoverable, so the process must be deliberate and auditable.
- Store passwords and OTPs only through the auth provider; never store plaintext credentials.
- Protect every database table with RLS and test cross-user access denial.
- Keep the Supabase service-role key and email provider credentials on the server in environment secrets; never commit `.env` files.
- Apply rate limits to login, signup, and OTP requests; use generic password-reset responses to avoid revealing whether an email exists.
- Validate and sanitize all user input; protect CSV import from formula injection on exported spreadsheet cells.
- Do not log secrets or complete financial records. Minimize analytics and avoid ad tracking on finance pages.
- Provide account deletion and a clear explanation of what is removed and what is retained during the deletion flow.
- Keep a privacy policy, terms, and contact/support route before inviting public users.
- Configure database backups/retention appropriate to a live finance tracker even though the app has no user-managed backup feature. A free tier without backups is not suitable for dependable production data.

## User-facing pages

- Public landing page with product scope and privacy summary
- Sign up, sign in, forgotten-password OTP, reset password
- First-run setup: currency, timezone, initial preferences
- Dashboard: daily/monthly summary, income goal, net worth, cash flow, investments, debt due, charts
- Accounts: add/edit/archive manual cash and bank accounts, set opening balances, and inspect current tracked balances
- Ledger: filter/search, add/edit/delete income, expense, and transfer; select the affected account(s)
- Investments: manually add/edit/remove and inspect contributed/current value totals
- Lending & borrowing: create item, due date, repayment history, outstanding amount
- Diary: dated notes linked to transactions/debts, edit and remove reminder
- Reports: date ranges, charts/tables, CSV export and guided import
- Settings: profile, currency change behavior, password reset guidance, account deletion
- Error, empty, loading, and not-found states; accessible keyboard/focus behavior

## End-to-end build timeline

Estimate: **about 21–27 weeks at 6 hours/week** (roughly 126–162 focused hours), including UI selection, learning/research buffer, implementation, review, and deployment. This is a complete first public product target, not a sequence of released product versions. Re-estimate after UI selection and the remaining decisions above.

| Phase | Duration | Deliverable / exit condition |
|---|---:|---|
| 1. Requirements and product rules | 1 week | Resolve open product decisions, define money calculations, delete semantics, currency-change behavior, and acceptance criteria. This README is the starting spec. |
| 2. UI exploration and selection | 1–2 weeks | Create Gemini prompt from this spec, generate multiple coherent screens, choose one direction, and document responsive states and components. |
| 3. Repository and engineering foundation | 1 week | GitHub repository, Next.js/TypeScript setup, formatting/lint/typecheck/build scripts, environment template, local setup instructions, CI workflow. |
| 4. Database and auth foundation | 2 weeks | Supabase project, migrations, user profile/currency, password auth, OTP reset, RLS policies, rate limits, auth/session pages. Cross-user isolation proven. |
| 5. Accounts, ledger, and exact money handling | 3–4 weeks | Manual cash/bank accounts and opening balances; income, expenses, transfers, categories, dates/notes, add/edit/delete, filters, exact totals, transaction history, and reconciled account balances. |
| 6. Investments and debt workflows | 2–3 weeks | Manual investment records; lending/borrowing items; partial/full repayments; atomic ledger links; due balances; linked diary reminders. |
| 7. Goals, diary, and dashboard | 2–3 weeks | Income goal; linked diary management; daily/monthly summaries, cash flow, net worth, investments, debts due, charts, empty/loading/error states. |
| 8. Reports and CSV | 1–2 weeks | Date filters, CSV export, safe import preview/validation/duplicate handling, clear error report. |
| 9. Product completeness and accessibility | 2 weeks | Responsive polish, keyboard/screen-reader checks, account settings/deletion, privacy policy, terms, help text, error handling. |
| 10. Independent review and fixes | 2–3 weeks | Review by Claude and other agents plus a software engineer; resolve findings; check auth, RLS, calculations, data integrity, and UX. |
| 11. Staging, deployment, and launch | 2 weeks | Production-like staging; secrets and email setup; domain/HTTPS; production DB; migrations; smoke checks; logs/alerts; rollback and support process; deployed URL verified. |

At 10–12 hours/week, the same work may fit in roughly 10–16 weeks. Unpaid-tier limits and provider onboarding can extend the calendar independently of coding hours.

## Definition of done

- A new user can create an account, choose a currency, sign in, and complete OTP password recovery.
- User A cannot read or change User B's data, including through crafted API requests or CSV operations.
- Users can add manual cash/bank accounts and opening balances; account balances reconcile with ledger entries and transfers.
- Users can add, edit, filter, export, import, and delete supported transaction types without amount precision errors.
- A debt repayment updates outstanding balance and creates exactly one linked ledger entry; retrying a request cannot double-charge the record.
- The diary entry is linked and can be deleted independently from repayment and ledger history.
- Dashboard totals match ledger and debt records for defined periods and currency behavior.
- The website is usable on phone and desktop, keyboard accessible, and handles loading, empty, and error states.
- Production uses HTTPS, environment secrets, managed durable Postgres, RLS, configured email delivery, and operational logging/alerts.
- Setup, deployment, privacy, and user-facing help documentation are complete; an independent review has no unresolved critical/high-severity issue.

## Local development (to fill in during setup)

Prerequisites: Node.js LTS, Git, GitHub account, Supabase account, package manager selected at scaffold time.

```bash
git clone <repository-url>
cd <repository-folder>
npm install
cp .env.example .env.local
# Fill the local Supabase URL and public anon key; keep server secrets private.
npm run dev
```

Before the first implementation commit, add the exact commands for local Supabase/migrations, lint, typecheck, build, and automated checks after scaffolding the app.

## Environment variables (planned)

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server only; do not expose to browser
NEXT_PUBLIC_APP_URL=
EMAIL_PROVIDER_API_KEY=          # if a separate transactional provider is selected
KMS_KEY_ID=                      # server only; use workload identity where supported
KMS_CREDENTIALS=                # server only; prefer managed identity, never commit credentials
```

Use separate Supabase projects or isolated environments for local development, staging, and production. Never use production financial data as test fixtures.

## Deployment and cost notes

The final host is intentionally not fixed. Compare Render and suitable alternatives after the app is scaffolded and test a staging deployment. Free tiers change; verify limits again before launch.

- Render's official free-plan documentation says free web services spin down after 15 minutes idle and free Postgres expires 30 days after creation, has no backups, and is intended for experimentation rather than production. Therefore, use it only for a temporary demo/staging environment unless you move to a durable paid database/service.
- Supabase currently offers a free hosted Postgres/Auth tier, but its free database may pause after inactivity and has no automatic backups. It is useful for development or low-risk evaluation; a multi-user finance tracker that people rely on should move to a plan with durable availability and backups before public launch.
- Vercel Hobby is restricted to personal/non-commercial use under its current terms. Do not assume it is suitable for a public multi-user service without checking eligibility and current terms.
- Supabase's default email service may not meet the volume/deliverability needs of a public launch. Configure a production email sender, verified domain as required, OTP rate limits, and recovery-flow monitoring.
- A reliable service may not remain free. Keep data portable (Postgres migrations, CSV export, no vendor-only money schema) and confirm current pricing before committing to a provider.

## Review workflow

After implementation is reviewable, run a structured review with Claude, other coding agents, and a software engineer. Ask reviewers to inspect the actual branch and report reproducible findings with severity, file/line, impact, and proposed fix. Resolve findings, rerun relevant checks, and retain a short review record. Do not deploy until security/data-integrity findings are resolved.

## Technology references

- [Render free services and their limitations](https://render.com/docs/free)
- [Supabase pricing and current free plan limits](https://supabase.com/pricing)
- [Vercel Hobby plan and usage terms](https://vercel.com/docs/plans/hobby)
- [Resend current transactional email pricing](https://resend.com/pricing)

These plans can change; recheck before deployment.
