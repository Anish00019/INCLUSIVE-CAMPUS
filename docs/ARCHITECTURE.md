# Architecture and deployment boundaries

## Frontend

`main.jsx` installs Router, Accessibility, Auth, Data and Toast providers. Public landing/auth routes sit outside `AppLayout`; shared and role-specific routes use route guards. Every page is lazy-loaded.

The shell provides the sidebar, topbar, notification panel, global search and accessibility toolbar. Components in `common/` implement shared cards, dialogs, focus management, filters, inputs, tabs and directory editing. Student/faculty/support/admin pages compose these rather than implementing independent design systems.

`InstitutionOverview` is shared between support/admin dashboards and reporting. Its aggregates derive from the filtered sample student/request records, not decorative hard-coded KPI values. `RecordManager` is configured per collection, with explicit visible columns/editable fields. College academic directories do not display diagnoses.

### Local demo persistence

`src/services/mockData.js` owns fictional seed records. `src/services/api.js` owns mutations and persistence. React pages call `DataContext.actions`; the context refreshes its snapshot after writes.

Main storage keys:
- `ic_db_v1`: sample records and bcrypt-hashed demo credentials (still client-controlled).
- `ic_session_v1`: `{userId, expiresAt}` with a two-hour demo expiry. **Not a real JWT.**
- `ic_prefs_v1`: accessibility preferences.
- `ic_app_settings`: notification/privacy/region preference demonstrations.

The data is intentionally visible to the browser owner and shared across demo-role logins on that origin. This enables the exhibition workflow, not real confidentiality. Profile exports are limited to the current student in the UI; REST endpoints provide actual server-side scopes. Never treat route guards or hidden UI as authorisation.

### Accessibility state

Preferences update root classes (`dark`, `high-contrast`, `dyslexic`, `highlight-links`, `reduce-motion`, `reading-mode`) and root font sizing. Fonts are self-hosted; dyslexia mode uses OpenDyslexic. Recharts animation is disabled and OS reduced motion is respected. TTS and speech-recognition objects are cleaned up on unmount.

Dialogs restore focus and trap Tab/Shift+Tab. Mobile navigation mounts only while open so hidden drawer links cannot receive focus. Tabs support arrows/Home/End. Toasts use live regions. Voice navigation is explicitly opt-in, then initiated with a microphone button; it never silently starts the microphone.

## Backend

`server/index.js` validates secrets, connects MongoDB, starts the Express app on `0.0.0.0`, and handles shutdown. `app.js` owns headers, JSON limits, rate limiting and safe error responses. `middleware/auth.js` verifies JWTs and reloads active user/role/version information from MongoDB. `routes/api.js` applies strict schemas and resource-level access checks.

Mongoose collections include all 14 requested domain models and an additional audit log. References are normalised: users own student/faculty profiles; departments own courses; courses contain subjects; assignments/attendance/materials/exams reference subjects; support requests reference students; notifications/messages are scoped to users.

Confidential fields use AES-GCM with a separate encryption key and are excluded from default projections. Generic academic queries never include diagnostic notes. Faculty receive consented accommodations only; support staff and the student owner can access confidential notes/documents. Administrators receive institutional coordination metadata and aggregates, not medical descriptions.

## Switching the UI to real data

The UI is deliberately **not** configured to silently fall back to local data after a failed real API request. Such a fallback would mislead users into believing an important accommodation request had reached their institution.

A production integration needs an explicit adapter replacing `src/services/api.js` and changes to `AuthContext`/`DataContext`:

1. Replace mock authentication with `/api/auth/*`. Prefer hardened HttpOnly secure-cookie sessions (and CSRF protection) for a production browser deployment rather than storing bearer tokens in localStorage; the bundled API currently accepts bearer JWTs.
2. Resolve server ObjectIds and map normalised references to UI identities. MongoDB `subject`/`student` fields are not the demo's `subjectId`/`studentId` aliases.
3. Replace `bootstrap()` with role-scoped queries; do **not** fetch one giant institution-wide database snapshot into every client.
4. Map server per-student submissions to the student's assignment card state and faculty grading views. Demo assignments use a simplified shared status.
5. Upload confidential documents to the authenticated document endpoint; only show upload success after the server confirms persistence. The demo only retains metadata.
6. Fetch preferences per user and reconcile them intentionally with browser preferences. Connect messaging, notification read state and report filters to the appropriate endpoints.
7. Add explicit offline/error states, cancellation, retries for safe reads, and concurrency/version-conflict handling. Never retry non-idempotent submissions without an idempotency key.

The bundled API and this adapter boundary make the implementation extensible, but are not a claim of an already configured end-to-end MongoDB deployment.

## Deployment checklist

- HTTPS reverse proxy serving static SPA assets and same-origin `/api`; configure SPA fallback for client routes.
- Explicit trusted proxy configuration and host policy; Vite's permissive preview host setting is for development only.
- Private MongoDB network, least-privilege credentials, encryption/backups, unique JWT/data-encryption keys in a secret manager, rotation and disaster-recovery procedures.
- Institutional identity verification, faculty/student enrolment assignment and support case assignment policies.
- Upload malware scanning and quarantining; larger documents/media in private storage; accessible transcoding/caption authoring workflow.
- Email/SMS notification provider with delivery tracking and opt-in/consent policies.
- Retention, account deletion, access review, audit monitoring and privacy-law review for the institution's jurisdiction.
- Database integration tests, cross-role ownership tests, security review and load tests.
- Manual keyboard, zoom/reflow, screen-reader and disabled-user testing. Automated axe checks cover only some WCAG criteria.
