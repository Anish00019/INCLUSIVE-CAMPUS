# Inclusive Campus — Technical QA and remediation report

**Audit date:** 22 November 2026 (UTC)
**Repository:** `Anish00019/INCLUSIVE-CAMPUS`
**Working branch:** `arena/da0ce64b-inclusive-campus`
**Method:** inspect and repair the existing application, preserving its React/Tailwind design and role workspaces. No replacement application was built.

## 1. Executive decision

# NOT PRODUCTION-READY

The local exhibition demo has substantially stronger validation, persistence recovery, session handling, keyboard support and responsive behaviour. Executed test results are recorded below, not inferred from screenshots or button presence.

**This is not a completed end-to-end production certification.** The browser still uses its local demo service, not the separate Express API. MongoDB successful CRUD, persisted ownership, index enforcement and concurrent-write behaviour could not be exercised. Client-side roles and hashed demo credentials do not protect data from the browser owner. Do not enter real passwords, disability information or medical documents.

The requested release gate is **not met**: critical/high deployment blockers remain, some requested capabilities are not implemented, and real assistive-technology/cross-engine testing is unavailable. “Pass” below always names a specific tested scope; it does not mean every control or all possible data combinations passed.

## 2. Architecture and inspection

```text
React 18 + Router + lazy role pages
  └─ Auth / Data / Accessibility / Toast contexts
      └─ src/services/api.js → fictional seed + browser localStorage

Separate, unwired service:
Express → strict Zod schemas → JWT/role/ownership middleware
        → Mongoose → MongoDB (not available for successful integration tests)
```

- Four role workspaces: student, faculty, disability support and college administrator; shared profile, messaging, notifications, settings and accessibility controls.
- Shared `RecordManager` powers academic/support directories; `InstitutionOverview` powers dashboards/reporting. These reuse existing components rather than duplicating applications.
- REST models normalise users, student/faculty profiles, departments, courses, subjects, attendance, assignments, examinations, materials, requests/documents, messages, notifications, preferences and audit events.
- The complete first-party file inventory and content hashes are in [QA-FILE-INVENTORY.md](QA-FILE-INVENTORY.md). Build/import resolution and ESLint cover JS/JSX/MJS/configuration. Inspection is source review/static analysis, **not** proof that every runtime branch was exercised. Generated dependencies/build output are not described as manually reviewed.
- No frontend adapter exists for MongoDB ObjectIds, scoped REST reads or per-student assignment submissions. See [ARCHITECTURE.md](ARCHITECTURE.md).

## 3. Executed verification

| Verification | Actual result | Scope / evidence |
|---|---|---|
| Production build | PASS | `npm run test:check`; Vite production bundle |
| ESLint | 0 errors, 0 warnings / 101 files | Zero-warning gate; `eslint-final.json` |
| Vitest | **55/55 passed**, 0 failed | 12 demo-service + 9 RTL/validator/hook + 1 loading + 33 Supertest/model-stub tests |
| Node security | **8/8 passed** | Crypto/config/header/auth-rejection/model checks; no live DB writes |
| Critical workflows | **18 PASS checkpoints** | Demo journeys and runtime assertions; `workflows-final.log` |
| Additional controls | **27 passed**, 0 failures | Positive/negative/file picker/keyboard/exports/storage; `controls.json` |
| Route smoke | **34 route/role combinations rendered** | `smoke-final.log`, intended headings and no captured runtime/console errors |
| Responsive | **272/272 role-route-width checks**, **40/40 public checks passed** | Eight requested widths; document overflow assertion |
| axe | **44 role/theme + 6 public/dialog scans**, 0 violations | A/AA tags through WCAG 2.2; 6 additional legacy representative scans also retained |
| Dependency audit | **0 known vulnerabilities** | `npm audit --json`; not a full security certification |
| MongoDB integration | **BLOCKED, not passed** | Binary download TLS/ECONNRESET; no successful DB acceptance tests |
| Cross-engine / actual screen readers | **NOT VERIFIED** | Only packaged Chromium available |

### Evidence interpretation

- Vitest combines demo-service boundaries, React Testing Library/Jest DOM controls and **Supertest HTTP tests with explicit model stubs**. They do not test real database persistence.
- Existing Node security tests exercise cryptography, configuration, authentication rejection, model definitions, HTTP headers/health and public-input rejection; they also do not establish MongoDB write success.
- The workflow suite signs into the demo using the login form, mutates fictional records, switches demo roles and checks persisted results. Material publishing is **metadata**, not a successful binary upload or a live academic system.
- Role/route smoke checks are navigation/render checks, not exhaustive form/control checks. Viewport combinations are layout checks, not additional browser engines.
- Raw logs/reports/screenshots are in ignored `test-results/`. Compact durable results are saved in [qa-evidence/results.json](qa-evidence/results.json); individual test expectations/observations are indexed in [QA-TEST-MATRIX.md](QA-TEST-MATRIX.md).

### Important baseline results

The initial new demo boundary suite reproduced **11 failures out of 12 tests**. After service repairs all 12 passed. Initial ESLint: **3 errors and 85 warnings across 90 files**. The initial broad browser matrix detected **25 overflowing route/width combinations** and violations in **20 of 44 axe page/theme scans**. An intermediate run reduced overflow to three combinations and exposed an additional chart-hidden-focus mistake introduced during remediation; that mistake was corrected, not suppressed in axe configuration.

A later zero-overflow/zero-axe run still recorded a caught Timetable null-data render error in the browser console. That run was not accepted as clean: a loading guard and RTL regression were added, and the suites strengthened to reject console errors/error-boundary fallback headings.

A failing critical workflow was reproduced repeatedly at the support-decision dialog. The available headless Chromium stalled during click/screenshot rendering with the modal backdrop filter. Removing that blur, retaining the dim overlay and dialog design, allowed the unchanged decision workflow to complete. No forced click or programmatic DOM click was used to obtain the workflow pass.

## 4. Confirmed defects and direct repairs

Severity reflects impact if the affected behaviour were used for student records. Some fixes improve a demo boundary only; deployment blockers below remain.

| ID | Severity | Location / cause | Repair and verification |
|---|---|---|---|
| F01 | High | `services/api.js`, `DataContext`: absent identity fell back to first student/faculty | Removed fallback. Unknown account returns no profile; regression checks both identity lookups. |
| F02 | High | `services/api.js`, `AuthContext`: malformed/expired local sessions accepted or crashed parsing | Two-hour `{userId,expiresAt}` demo sessions; malformed/expired cleanup; periodic/focus recheck. Service and browser refresh-expiry checks pass. It is not secure server authentication. |
| F03 | High | `services/api.js`: registration depended on page-only validation, inconsistent email normalisation | Service validates/normalises email, names, department/year, password bytes and role; unique generated roll numbers. Positive registration/login workflow and negative service cases pass. |
| F04 | High | `services/api.js`: plaintext local demo passwords | Store bcrypt hashes, convert legacy demo credentials in memory (persisted on the next successful save), await password updates. Workflow checks stored hash/no plaintext property. Browser-controlled hashes remain unsuitable for real authentication. |
| F05 | High | `services/api.js`: mark-all/clear notification mutations affected another account | Scope mutations to current-account/public notifications. Service regression preserves another account's private unread item. |
| F06 | High | `services/api.js`, profile/provider state updater: quota failures left in-memory records different from persisted data; profile save side effects ran inside state updater | Snapshot rollback; persistence outside React updater; form catches errors. Service quota regression and browser failed-save check verify no saved-record change or false success. |
| F07 | Medium | `services/api.js`: intentionally empty student directory was reseeded | Preserve empty collection; reload regression passes. |
| F08 | High | `validation.js`, `RecordManager`, demo service: invalid records/duplicate email or roll/ranges could be saved | Shared text/email/phone/date/range validation, duplicate checks and visible form errors; GPA decimal step; service and browser duplicate-record checks. This does not establish MongoDB uniqueness. |
| F09 | Medium | `RequestForm`: unsupported, empty, excessive and oversized attachments accepted; size instructions inconsistent | Validate extension/count/nonzero/5 MB metadata, label picker, accurate metadata-only copy. Unit boundary checks and actual browser file-picker cases; dialog axe scan. |
| F10 | Medium | `services/api.js`: forged request status/invalid status and repeated pending requests | Initial status is validated; invalid status rejected and duplicate pending request protection added. Status/forged-input regressions pass; exhaustive workflow-transition policy is not implemented. |
| F11 | Medium | `Messages`: empty/oversized input and fake “attachment” message behaviour | Validate 1–10,000 chars; whitespace disabled; attachment action states limitation instead of inserting fake file text. Message persistence and inert HTML-payload rendering tested. |
| F12 | Medium | `recordAttendance`: correction keys discarded and primary student's aggregate used an arbitrary total | Retain correction history; replace same subject/date session and recompute known subject totals. Idempotent correction regression and faculty browser save pass. Other demo students still use simplified sample aggregate counters. |
| F13 | High | `AuthContext`/`Profile`: save errors could escape render/updater or password operation was not awaited | Pure state updates, caught save failures; awaited bcrypt password change; visible inline password error/pending state; cancel clears password state and profile draft. Positive/negative browser checks pass. |
| F14 | Medium | `Modal`: onClose identity retriggered focus effect while typing; repeated title ID | Stable callback ref, per-dialog IDs, filtered Tab trap, focus restoration, blur removal. RTL typing/focus/Escape/Tab tests and browser dialogs pass in tested states. |
| F15 | Medium | `Dropdown`, tabs and global search: missing keyboard menu navigation/focus return, wrong role-specific result destination | Arrow/Home/End/Escape menu control; search focus restoration/empty-result boundary; role destinations and faculty search scope. RTL and browser keyboard/search checks pass. |
| F16 | Medium | Topbar, statistic cards, page header and filter rows: min-content widths overflowed narrow/mobile/tablet content | Flexible search, shrink constraints, wrapping labels/actions, stacked toolbars and bounded scrollable tabs. Full width matrix rerun; see final results. Wide data tables intentionally scroll within their container. |
| F17 | Medium | Chart sectors and text: unlabeled SVG segments, light/dark/high-contrast failures, opacity-reduced tab counts | Accessible chart summary/segment labels, decorative attendance chart hidden with textual equivalent, stronger text colours and contrast themes. Final axe results below; no rules disabled. |
| F18 | Medium | `useLocalStorage`, `Settings`, toast/provider timers: side effects in updater, invalid saved shapes, uncleaned timers or false saved messages | Persist outside updater, type-check saved shapes, preserve value on failure, visible storage-failure notification; stable toast object/timer cleanup and settings timer cleanup. RTL quota/shape regression passes. |
| F19 | Medium | Faculty grading/material/attendance and support save handlers: unhandled persistence failures could leave pending/success states incorrect | Catch operation failures, retain forms, reset pending flags; remove unnecessary timer-based mutations. Positive workflows rerun. Not every failure permutation was browser-injected. |
| F20 | High | REST signed malformed subjects, bcrypt byte truncation, duplicate/invalid attendance roster/date | Reject malformed JWT claim IDs/version; cap password UTF-8 bytes; calendar validation; duplicate students; course/roster checks. Supertest rejection tests pass with model stubs; DB roster-count path still requires integration testing. |
| F21 | High | REST reference integrity / concurrent assignment submissions | Validate referenced departments/courses/faculty/subjects; atomic conditional submission update; optimistic document concurrency; unique course/subject code indexes; 409 version conflict response. Source/build/HTTP checks only for DB-dependent writes: **integration verification blocked**. |
| F22 | Medium | REST attachment path/control chars and notifications duplicated confidential decision notes | Safe filename validation; status-only notification copy; owner/support access retained. Supertest forged-content/filename/ownership denials; successful encrypted storage/download still blocked. |
| F23 | Medium | UI copy overstated JWT use, sharing enforcement, deletion workflow and material upload | Explicit demo-vs-API wording; deletion marker and metadata limitations stated. Does not invent an email/deletion/upload provider. |
| F25 | High | `student/Timetable`: async bootstrap could render the page before `db` existed; an error boundary then hid it behind a fallback heading | Added an explicit loading state and a null-data RTL regression. Browser suites now fail on captured console errors/error-boundary headings, not only uncaught page errors. Final matrix rerun required and recorded below. |
| F24 | Low | Unused imports, hook dependencies, landing heading order and missing robots.txt | Remove unused imports, fix dependency warnings, correct footer heading level, add robots file. Zero-warning lint and production build; robots is not access control. |

## 5. Open defects, limitations and missing capabilities

| ID | Severity | Status | Evidence / required next work |
|---|---|---|---|
| O01 | **Critical for real data** | OPEN — deployment blocker | Every demo role receives browser-local fictional data; role/session values can be edited and no server guards the local database. Replace demo service with a scoped authenticated adapter before collecting real data. Do not interpret frontend role tests as security certification. |
| O02 | **High** | BLOCKED — integration | No running/configured MongoDB. Isolated MongoMemoryServer attempted version 7.0.14; download from `fastdl.mongodb.org` failed with TLS/ECONNRESET in this network environment. No successful CRUD/seed/index/encryption round-trip/transaction/concurrency acceptance claimed. |
| O03 | **High** | OPEN — data model/integration | Demo assignments have one shared status/submission and historical academic/attendance content is sample/shared rather than complete per-student records. A newly registered student can still encounter sample academic content. Map real per-student REST records and implement appropriate missing-record states before deployment. |
| O04 | **High** | OPEN — consent/confidentiality | Demo privacy preferences are local demonstrations, not enforced data-delivery consent. Source/UI copy now says so. Raw browser data remains accessible. Real enforcement must use REST per-user sharing and minimum-necessary projections; perform live ownership/consent regression. |
| O05 | **High** | OPEN — backend reliability | Several backend operations write a record, notification and audit event separately. Without tested transactions/idempotency, partial success may return an error and retries can duplicate work. Validate transactions against a replica-set test DB and define retry semantics. |
| O06 | Medium | OPEN | Demo file metadata supports up to 5 MB and DOC/DOCX; separate API accepts at most 1 MB decoded PDF/PNG/JPEG/text. No connected upload/storage/malware scanner/media transcoder/caption service. Reconcile contracts in adapter, validate quotas/content and test successful encrypted download. |
| O07 | Medium | OPEN / NOT IMPLEMENTED | No student-delete UI/API workflow, no true directory pagination, no full assignment editing API, no exhaustive timetable/examination overlap engine. These are not passing tests. Read-only sample tables cannot demonstrate those capabilities. |
| O08 | Medium | OPEN | Exam check only detects same subject/date equality; it is not a complete time-duration/student/faculty/hall collision detector. Support duplicate enforcement is not a database unique/idempotency policy. |
| O09 | Medium | NOT VERIFIED | Real file/media content accessibility, microphone permission/audio recognition, TTS pronunciation, screen-reader announcements, braille output and OS high-contrast. API availability and DOM labels do not prove these work for a real user. |
| O10 | Medium | NOT VERIFIED | Firefox, branded Chrome/Edge and Safari/WebKit/mobile OS browsers were unavailable. Chromium-emulated viewport widths do not replace real-device or multi-engine testing. |
| O11 | Medium | PARTIAL | The automated route/control matrix is extensive but not an exhaustive activation of every implemented control in every role/theme/error state. Full manual screen-reader, 200%/400% zoom, touch-target and visual review remains a release gate. axe zero is not WCAG certification. |
| O12 | Medium | NOT VERIFIED | Production HTTPS/reverse-proxy headers/CSP, backup/restore/key rotation, retention/deletion, monitoring, penetration testing, real load/memory/large-list performance and database query plans. API Helmet headers do not establish frontend deployment headers. |
| O13 | Low/Medium | OPEN | Initial shared bundle remains substantial; large directories have no true pagination/virtualisation, and sample bootstrap is an institution-wide browser snapshot. Measure with representative production records only after scoped API integration. |

## 6. Browser, responsive and accessibility findings

Executed engine: **packaged Chromium 153.0.8010.0 on Linux**, via Playwright. Branded Chrome, Edge, Firefox and Safari/WebKit were not executed.

- Authenticated matrix: **272 checks**, 0 page-overflow failures; 44 role/theme scans, 0 failing scans.
- Public/auth/404 matrix: **40 checks**, 0 page-overflow failures; five public scans and one request-dialog scan.
- Requested widths: **320, 375, 425, 768, 1024, 1280, 1440, 1920 px**.
- Final broad matrix captured **0 uncaught page errors, 0 console warnings/errors and 0 HTTP responses ≥400**. Browser control/workflow/smoke suites also assert their captured runtime/console errors. This is not an API connectivity pass: the frontend does not call the real API.

Keyboard execution covers modal input continuity/Tab/Escape/focus return, tabs, account menu arrows/Home/End/Escape, search empty/results/Enter/Escape, and mobile drawer Escape. Additional programmatic axe scans cover public/auth/404 pages and a support-request dialog, not just the landing page.

- Automated semantics/contrast are assessed only in the recorded rendered states. Chart summaries are available without requiring colour interpretation.
- Responsive assertions compare document scroll width to viewport width, catching page-wide overflow. They do not by themselves prove good visual balance, hit-target size, text readability or all chart-label legibility.
- Wide tables deliberately use an internal horizontal scroll region; clipping all document overflow was not used to hide failures.
- NVDA, JAWS, VoiceOver and TalkBack were not available. No real screen-reader pass is claimed.

## 7. OWASP-oriented review

| Area | Observed / tested | Residual risk |
|---|---|---|
| Authentication | REST HS256 issuer/audience/expiry/version/active-user checks; malformed/expired/revoked/inactive tests | UI not connected; local sessions forgeable; production token storage/session strategy still required |
| RBAC / IDOR | HTTP denials for faculty/admin/student confidential updates, another student's accessibility profile, documents and message read state | Model stubs, not persisted cross-account DB integration; demo raw data unprotected |
| Injection / XSS | Strict Zod allowlists, query/body NoSQL rejection, no `eval`/`dangerouslySetInnerHTML`; browser message HTML rendered as text; CSV formula-neutralisation regression | Not a penetration-test certification; rich content/imports must stay sanitised when added |
| CSRF / CORS | API uses explicit bearer header, no ambient auth cookie and no wildcard credentialled CORS | If switching to cookies, implement SameSite/CSRF checks; XSS can still steal browser-accessible credentials |
| Passwords / keys | bcrypt, UTF-8 byte limits, independent JWT/AES keys; no real secrets added; sample env ignored | Client demo credentials are not secure authentication; key lifecycle/production entropy/storage unverified |
| PII / documents | Confidential API projections, AES-GCM selected fields/document bytes, attachment signature/path checks, logged access | Timeline notes and ordinary communication can still contain sensitive plaintext in DB; complete data classification/encryption/retention and access auditing needed |
| Uploads | HTTP tests reject empty/oversized/forged-signature/binary-text/unsupported/path-traversal fixtures | Signature matching is not malware scanning; successful storage/downloading blocked |
| Dependencies | Final npm audit results recorded below | Zero known advisories is not absence of vulnerabilities; no production DAST/load assessment |
| Error handling / headers | JSON parse/size errors, no-store, nosniff, safe API generic errors, conflict handling | Confirm deployed proxy/security headers and eliminate ambiguous partial multi-write success |

No destructive production tests or real student data were used. Tests and fixtures use fictional records. Environment secrets are not included in this report or committed artifacts.

## 8. Performance measurements

### Final production-preview lab results

Order: Performance / Accessibility / Best Practices / SEO. Targets: 85 / 95 / 90 / 90.

| Page / profile | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Landing, mobile Slow 4G / 4× CPU | 88 | 100 | 100 | 100 |
| Landing, desktop Dense 4G / 1× CPU | 99 | 100 | 100 | 100 |
| Signed-in demo dashboard, desktop Dense 4G / 1× CPU | UNAVAILABLE | 100 | 100 | 63 |

Lighthouse 13.6.0; production preview `http://localhost:5174`; mobile 375×812, desktop 1440×1000; device scale 1; simulated throttling. Desktop dashboard uses a fictional signed-in browser profile and is not intended as an indexed public landing page. Its SEO score is recorded as measured, not a pass against 90. Its final performance measurement is blocked by the screenshot-collection error below.

The earlier baseline was mobile **88/98/100/91** and desktop **75/98/100/91**. The initial desktop measurement retained mobile throttling (150 ms RTT, ~1.6 Mbps, 4× CPU), so its performance score is **not directly comparable** with the final standard desktop profile (40 ms RTT, 10 Mbps, 1× CPU). No such profile change is presented as a code speedup.

One final mobile attempt and two final dashboard attempts had **no valid performance score**: Lighthouse could not collect screenshots (`NO_SCREENSHOTS`), which is recorded as an execution error, not zero or a passing score. A mobile-only retry was run with the same mobile profile; the table uses that retry if it produced a valid score. The failed reports are retained in `test-results/lighthouse-mobile-error.json` and `test-results/lighthouse-dashboard-error.json`. The mobile-only retry produced 88. An earlier complete run measured dashboard performance 97, but the final dashboard attempts both had `NO_SCREENSHOTS`; the final table therefore correctly reports UNAVAILABLE rather than presenting that earlier score as a final pass.

**Remaining dashboard measurement errors:** `NO_SCREENSHOTS` affected Speed Index, filmstrip/final screenshot and derived metrics. No final authenticated-page performance pass is claimed.

The substantial shared bundle remains approximately **329 KB JS / 107 KB gzip**, with the separate lazy chart chunk approximately **474 KB / 124 KB gzip**. These are emitted build sizes, not proof that every byte is loaded on every route. There is no production dataset, memory-soak, API latency or database query-plan benchmark.


Measurements are environment-specific single lab runs, not guarantees or field percentiles. No API latency, MongoDB query execution time or real institutional load result is claimed. Route splitting, self-hosted fonts and disabled chart animation are retained. Remaining bundle/list/bootstrap concerns are listed above.

## 9. Reproduction and release gates

```bash
npm ci
npm run test:check
npm audit
npm run preview -- --host 0.0.0.0 --port 5174
# In another terminal:
TEST_BASE_URL=http://localhost:5174 npm run test:ui
PERF_BASE_URL=http://localhost:5174 npm run test:performance
```

The browser launcher uses npm-packaged Chromium when browser-CDN downloads are unavailable. `CHROMIUM_EXECUTABLE_PATH` can select an installed Chromium executable; that alone does not test Firefox/Safari.

Before considering a real deployment:
1. Connect the frontend to role-scoped REST reads/writes; remove the full local institutional snapshot and shared academic/submission state.
2. Provide an isolated MongoDB replica-set test service; verify success/failure/rollback/concurrency, references, indexes, encryption, seed and backup/restore with real integration tests.
3. Exercise student A/B ownership, staff assignment/consent, direct REST calls and confidential document bytes end-to-end.
4. Implement missing required CRUD/deletion/pagination/conflict workflows instead of treating absent controls as tests.
5. Finish all implemented-control negative/error/keyboard/zoom/touch tests and cross-engine/real assistive-technology review.
6. Validate production sessions, HTTPS, headers/CSP, privacy consent, malware scanning, keys, audit retention, incident response and load/monitoring.
7. Rerun regression against that integrated deployment; accept only if critical/high issues are closed and requested performance/accessibility gates hold with representative data.

**Final conclusion:** Remediation and substantial reproducible demo/HTTP-boundary testing completed in the existing project. Production readiness, full backend/database integration, complete feature coverage and WCAG conformance are **not established**.
