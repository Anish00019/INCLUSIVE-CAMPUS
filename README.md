# Inclusive Campus

**Education Without Barriers.** An accessibility-first college portal with four connected workspaces: Student, Faculty, Disability Support, and College Administration.

A responsive React application with a working local-data exhibition demo, plus a separately runnable Express/MongoDB REST API. The demo does not require MongoDB or external services.

> **Important:** The live frontend uses fictional data in `localStorage`, including mock login credentials. Client-side role navigation is not a security boundary. Do not enter real disability information, medical documents, or real passwords. The separate API implements server-side security; it is not yet wired to the demo UI.

## Technical QA audit — 22 November 2026

**Deployment verdict: NOT production-ready.** The existing demo was audited and fixed in place; it was not rebuilt or silently connected to a mock “live” backend. Read [the QA report](docs/QA-REPORT.md), [feature/test matrix](docs/QA-TEST-MATRIX.md), and [source inventory](docs/QA-FILE-INVENTORY.md) for executed results and remaining blockers. Local role navigation, shared sample academic data and saved privacy preferences are not real confidentiality guarantees.

```bash
npm run test:check      # ESLint (zero warnings), Vitest/RTL/Supertest, Node security, build
# Start npm run dev (or production preview) before these browser checks:
npm run test:controls   # Additional negative/boundary and keyboard controls
npm run test:matrix     # All role routes × 8 widths + light/dark/contrast axe
npm run test:performance # Lighthouse against localhost:5174 production preview
```

Tests accept `TEST_BASE_URL`; Lighthouse accepts `PERF_BASE_URL`. Raw generated evidence is ignored under `test-results/`; compact durable audit evidence is in `docs/qa-evidence/`. API model-stub tests are explicitly **not MongoDB integration tests**. No Firefox, Safari, Edge, or real screen-reader result is claimed.

## Run the frontend

Requires **Node.js 22.12+** and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The server binds to `0.0.0.0` and supports the Arena live-preview host. Browser requests to `/api` proxy through Vite to port 5000; browser code does not call a remote user's localhost.

```bash
npm run build       # Optimised, route-split production bundle
npm run preview -- --host 0.0.0.0
```

Inter and OpenDyslexic fonts are self-hosted from installed npm packages. No Google Fonts, paid APIs, or external images are required.

## Demo accounts

All four accounts use **`demo1234`**. Sign in using the form, or choose an account card to fill its credentials.

| Workspace | Email | Home |
|---|---|---|
| Student — Aarav Sharma | `student@campus.edu` | `/dashboard` |
| Faculty — Dr. Meera Iyer | `faculty@campus.edu` | `/faculty` |
| Disability Support — Rohan Verma | `support@campus.edu` | `/support-admin` |
| College Admin — Dr. Kavita Menon | `admin@campus.edu` | `/admin` |

Public registration creates student demo accounts only. Staff use pre-provisioned demo accounts. Directory edits in User Management do **not** provision login credentials.

### Suggested exhibition walkthrough

1. Sign in as Student. Explore academic progress, attendance, the weekly timetable and examination accommodations.
2. Open **Accessibility Support Requests → New request**. Choose a category, describe a need and submit. Follow its status in Track Requests.
3. Sign out and sign in as Support. Search for the request, assign a team member, approve it and write an update.
4. Return as Student: the decision appears in notifications and the request timeline.
5. As Faculty, mark attendance, publish an assignment, and upload learning-material metadata. Submit work as Student, then grade it with feedback as Faculty.
6. As College Admin, filter analytics by department, academic year and request status. Generate an aggregate JSON report or export filtered directory records as CSV.
7. Try the Assistive Learning Hub's reader, dictation, samples, downloads, and simplified-reading controls. Change accessibility preferences; they persist across pages and reloads.

Reset fictional records from **Settings → Reset demo data**. Accessibility preferences have their own reset button. “Clear local storage & sign out” removes all demo records and preferences on that browser origin.

## Implemented workspaces

### Student
- Dashboard with GPA, attendance, assignments, exams, profile completion, timetable, support requests, notifications and quick actions.
- Academic overview and interactive Recharts visualisations, subject attendance, weekly timetable, assignments and submission notes, examination schedule and downloadable text hall ticket.
- Searchable materials with sample accessible text, transcripts, caption previews, read-aloud, simplified reading and text downloads.
- Support request forms, attachment metadata, status timeline, assigned staff and updates.

### Faculty
- Teaching overview, department roster and approved accommodation flags, with no diagnosis fields in faculty views.
- Attendance marking with all-present/all-absent controls and persisted session history. Saving the same subject/date replaces that demo session.
- Assignment publishing, student submission previews, grading, persisted feedback and in-app reminders.
- Material publishing/editing, accessibility metadata checks and case coordination notes.

### Disability Support
- Review, approve, reject, assign staff and update request statuses with required decision notes.
- Student accommodation-profile editor, staff directory, resource inventory and aggregate reports.

### College Administration
- Institution-wide analytics with department/year/status filtering.
- Student academic records, users, departments, degree courses and exportable reports.
- Read-only case coordination. Confidential request descriptions/documents are not shown to college administrators.

### Shared
- Profile editing, working demo password changes, own-data JSON export and locally recorded deletion requests.
- Search (`Ctrl/⌘+K`), notification panel, messages with persisted text, profile dropdown, breadcrumbs, collapsible sidebar and mobile navigation drawer.
- Settings, protected routes, loading and empty states, validation and toast feedback.

## Accessibility

- Semantic landmarks, skip link, visible keyboard focus, labelled inputs and accessible status notifications.
- Focus-trapped dialogs and mobile navigation, Escape-to-close, arrow-key tabs and keyboard-operable controls.
- Adjustable root text size, light/dark/high-contrast modes, self-hosted OpenDyslexic, highlighted links, simplified reading and reduced motion. OS reduced-motion preference is respected.
- Browser text-to-speech with playback-rate control; speech recognition and voice navigation where browser support and microphone permission allow.
- Enable **Voice navigation** in accessibility settings, then use the microphone button and say “open dashboard”, “messages”, “profile”, or “accessibility”. Unsupported browsers retain keyboard and typed alternatives.
- Sample media previews have written alternatives. Speech recognition may use a browser vendor's remote service; do not dictate confidential information without informed consent.

**Target: WCAG 2.2 AA, not a compliance certification.** Automated checks do not replace manual testing with screen readers and disabled users.

## Demo boundaries

The prototype intentionally stores data locally so the exhibition works without infrastructure:

- Faculty attendance session records, assignment state and sample messages are shared within one browser's fictional dataset, not a multi-user concurrent server.
- File pickers retain **names/metadata**, not binary uploads. Material/video previews are sample text and caption demonstrations, not a real media-transcoding service. Text downloads, CSV exports and report exports are real generated files.
- Email/SMS/digest, regional preferences, and privacy toggles in Settings are stored preferences, not connected external services or server-enforced policies. In-app notifications remain active.
- Demo password changes are persisted in mock credentials, not securely hashed browser credentials. Real password hashing is implemented only by the REST API.
- Academic data is a small seeded sample; aggregate totals describe the displayed sample. This is not evidence of institutional compliance or disability-related educational outcomes.
- Account-deletion requests are recorded locally for demonstration; they are not sent to a college office and do not delete records.

## Backend

The API is in `server/`. It requires a separately running MongoDB instance. **No live database was configured in this workspace.**

```bash
cp .env.example .env
# Set MONGODB_URI to your local/development MongoDB.
# Generate two DIFFERENT secrets; put one in JWT_SECRET and the other in DATA_ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run server
```

Optional local-only seeding:

```bash
# Set SEED_PASSWORD (at least 10 characters) in your local .env, then:
npm run seed
```

The seed creates the four accounts above, a CSE department/course, linked student/faculty profiles, a subject and an accessible note. The backend accounts use your `SEED_PASSWORD`, **not** the frontend's fixed demo password. Seeding is refused when `NODE_ENV=production` and does not overwrite existing records.

### Backend security

- Bcrypt password hashes, short-lived HS256 JWTs with issuer/audience checks, active-account checks and database-backed token-version revocation on password/role changes and logout.
- Public registration is restricted to the student role. Privileged accounts require an authenticated college administrator.
- Server-side role checks and student/course/faculty ownership checks. Faculty receive only consented accommodations, never diagnoses or confidential documents. College administrators receive academic and aggregate data, not confidential support profiles.
- Strict Zod input allowlists, Mongoose validators, bounded request bodies/queries, authentication/API rate limits, Helmet headers and no wildcard CORS.
- AES-256-GCM encryption at rest for confidential support descriptions, accessibility notes and uploaded document data, using a separate 32-byte encryption key.
- Authenticated document access checks, filename/MIME/signature validation, up to three 1 MB documents per request, forced download and no-store responses. Only the student owner and support staff may access them.
- Support/profile/document access audit records without medical descriptions in the audit payload.

See [API reference](docs/API.md) for endpoints and the [architecture notes](docs/ARCHITECTURE.md) for the frontend/backend integration boundary.

**Before deployment:** wire an explicit API adapter to the UI, configure HTTPS and a private MongoDB network, establish key rotation/backups/retention/consent policy, add malware scanning and object storage for larger uploads, provision staff and enrolment relationships, integrate notification delivery, and conduct database-backed integration, penetration and manual accessibility testing. This repository is not a claim that those operational controls are already deployed.

## Tests

Start the frontend first for browser tests:

```bash
npm run dev
# In another terminal:
npm test                 # 8 backend/security/validation tests; no MongoDB required
npm run test:smoke        # Renders all 34 protected route/role combinations
npm run test:workflows    # Login, RBAC navigation, request/decision, notifications,
                         # messages, attendance, publish/submit/grade, materials,
                         # records, reports, preferences, password and mobile flows
npm run test:a11y         # axe WCAG A/AA checks on six representative pages
npm run test:ui           # All browser suites
npm audit
```

Browser checks use Playwright with an npm-packaged headless Chromium for restricted-network Linux environments. Set `CHROMIUM_EXECUTABLE_PATH` to use your installed browser, and `TEST_BASE_URL` for a different application origin. Generated screenshots and axe results are ignored in `test-results/`.

The build, 8 backend/security tests, 34 route smoke checks, interactive workflow checks, mobile-width checks and six-page axe checks have been exercised. The API's successful MongoDB write/read paths still require integration testing against your database; the included tests do not pretend to cover that infrastructure.

## Structure

```text
src/
  components/
    accessibility/       # Toolbar, controls, speech and voice navigation
    charts/              # Themed, responsive Recharts components
    common/              # Cards, forms, dialogs, tabs and record directory editor
    dashboard/           # Timelines, request cards and institution analytics
    forms/               # Support request form
    layout/              # Sidebar, topbar, search, notifications and route guards
  context/               # Auth, data, accessibility and toast providers
  hooks/                 # Local storage, media queries, document titles, debounce
  pages/
    auth/ student/ faculty/ support/ admin/
  services/              # Demo dataset and local-storage API seam
  styles/ utils/
server/
  models/                # 14 required collection models + audit log
  middleware/            # JWT authentication and role authorisation
  routes/                # Validated and scoped REST endpoints
  security.js app.js index.js seed.js
tests/ docs/
```

React 18 · JavaScript · Vite · Tailwind CSS · React Router · Lucide · Recharts · Express · Mongoose/MongoDB
