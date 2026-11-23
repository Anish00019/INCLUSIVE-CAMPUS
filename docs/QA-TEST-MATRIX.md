# QA feature and test matrix — 22 November 2026

Verdict: **NOT PRODUCTION-READY**. Passes below are explicitly scoped. Counts overlap across suites; do not add them as unique features. API model stubs are not database integration. No code-coverage percentage was calculated.

## Feature-level expectations and observations

| Feature | Expected | Actual executed observation | Status / evidence |
|---|---|---|---|
| Landing/About/auth/404 | Render/reflow with valid semantics | Five public pages at eight widths, axe, actual protected-route redirect | PASS for rendered states; not all public navigation links activated; controls.mjs |
| Registration/login/session/logout | Valid student account; reject bad credentials; expiry/logout protect routes | Login/registration workflow; wrong password, expiry after refresh, logout and direct-route denial | PASS in local demo; real DB auth BLOCKED |
| Student directory | Add/edit/search; reject duplicates/bad numbers; preserve on quota failure | Actual valid student create/edit, Unicode name/decimal GPA, empty filter, duplicate roll, storage fault; service boundaries | PASS for these cases; delete/pagination NOT IMPLEMENTED |
| Support request/decision | Student submits; support assigns/approves; student notified | Full demo cross-role journey and persisted status/staff; invalid status/forgery service tests | PASS for approval path; exhaustive rejection/transition combinations PARTIAL |
| Attachments | Reject empty/oversized/unsupported files; accessible picker | Browser file input + validators; accessible dialog scan; seven HTTP upload rejection tests | PASS negative metadata/HTTP boundaries; binary persistence/download BLOCKED |
| Assignments/grading | Faculty publishes, student submits, faculty grades and notifies | Demo journey verifies saved status/marks/feedback; search empty/reset | PASS demo journey; per-student real DB/concurrency BLOCKED; shared demo model remains OPEN |
| Attendance | Save/correct without double count; export | Faculty saves; service idempotent correction/aggregate; actual report download | PASS demo cases; persisted DB roster writes BLOCKED |
| Academics/timetable/exams | Show correct own records and handle missing/loading/conflicts | Route/reflow/axe and sample transcript/ICS downloads; Timetable null-data RTL | PARTIAL — sample/shared academic history; full enrolment/conflict/missing-record semantics OPEN |
| Materials | Publish/access accessible content | Saved faculty metadata; student opens sample reader and downloads actual text | PASS demo listing/text controls; real binary/media/caption pipeline NOT IMPLEMENTED |
| Messaging | Persist valid text; reject empty/long; inert HTML; ownership | Positive/reload/whitespace/HTML browser checks; length validator; recipient HTTP denial | PASS tested scope; API/database real delivery BLOCKED |
| Notifications | Read/clear only scoped items; cancellation safe | Workflow mark-read; service another-account preservation; clear cancellation | PASS demo scope and HTTP boundary; real DB read state BLOCKED |
| Profile/password | Save/cancel; reject wrong current password; hashed credential | Save/password workflow; cancel/reset; inline wrong-password error; quota and hash assertions | PASS local demo; real account lifecycle BLOCKED |
| Search/menu/dialogs/tabs/drawer | Keyboard navigation/focus/Escape; empty search; correct routes | RTL and actual browser keyboard checks | PASS tested controls; complete screen-reader/zoom coverage NOT VERIFIED |
| Accessibility preferences | Text size/theme persist and reset | Workflow text-size/dark/reload/reset; light/dark/contrast axe | PASS DOM/preference scope; speech/audio/OS AT NOT VERIFIED |
| Settings/privacy/deletion | Honest feedback and enforcement | Source/RTL persistence handling; UI describes preference-only/demo marker limitations | PARTIAL — real consent, delivery providers and deletion workflow OPEN |
| Institutional reports/directories | Filter aggregates, save directory fields and export | Department create, filtered CSV download and saved report filters; route matrix for other directories | PASS selected workflows; every directory field/action NOT exhaustively exercised |
| REST security | Reject invalid JWT/IDOR/roles/injection/upload content | Supertest model-stub denials plus Node security suite | PASS HTTP/crypto boundary scope only; database positive paths BLOCKED |
| Performance | Measure actual production bundle against requested targets | Lighthouse lab reports with profile/settings and errors retained | See QA-REPORT.md; not a field/load/DB test |

## Route/role layout and automated accessibility

Expected: intended workspace heading (not error-boundary fallback), no page-wide overflow at 320/375/425/768/1024/1280/1440/1920, zero recorded axe A/AA violations in the light scan, no console errors. This is navigation/render coverage, not full interaction coverage.

| Role | Route | Width checks | Light axe violations | Actual status |
|---|---|---:|---:|---|
| student | `/dashboard` | 8/8 | 0 | PASS rendered checks |
| student | `/academics` | 8/8 | 0 | PASS rendered checks |
| student | `/timetable` | 8/8 | 0 | PASS rendered checks |
| student | `/attendance` | 8/8 | 0 | PASS rendered checks |
| student | `/assignments` | 8/8 | 0 | PASS rendered checks |
| student | `/examinations` | 8/8 | 0 | PASS rendered checks |
| student | `/study-materials` | 8/8 | 0 | PASS rendered checks |
| student | `/support` | 8/8 | 0 | PASS rendered checks |
| student | `/support/track` | 8/8 | 0 | PASS rendered checks |
| student | `/assistive-hub` | 8/8 | 0 | PASS rendered checks |
| student | `/profile` | 8/8 | 0 | PASS rendered checks |
| student | `/accessibility-settings` | 8/8 | 0 | PASS rendered checks |
| student | `/messages` | 8/8 | 0 | PASS rendered checks |
| student | `/notifications` | 8/8 | 0 | PASS rendered checks |
| student | `/settings` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty/students` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty/attendance` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty/assignments` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty/materials` | 8/8 | 0 | PASS rendered checks |
| faculty | `/faculty/requests` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin/requests` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin/students` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin/staff` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin/resources` | 8/8 | 0 | PASS rendered checks |
| support | `/support-admin/reports` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin/students` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin/users` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin/departments` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin/courses` | 8/8 | 0 | PASS rendered checks |
| admin | `/admin/reports` | 8/8 | 0 | PASS rendered checks |
| admin | `/support-admin/requests` | 8/8 | 0 | PASS rendered checks |

### Theme scans

| Theme | Route | Axe violations | Status |
|---|---|---:|---|
| dark | `/dashboard` | 0 | PASS scan |
| dark | `/accessibility-settings` | 0 | PASS scan |
| dark | `/support` | 0 | PASS scan |
| dark | `/messages` | 0 | PASS scan |
| dark | `/assistive-hub` | 0 | PASS scan |
| contrast | `/dashboard` | 0 | PASS scan |
| contrast | `/accessibility-settings` | 0 | PASS scan |
| contrast | `/support` | 0 | PASS scan |
| contrast | `/messages` | 0 | PASS scan |
| contrast | `/assistive-hub` | 0 | PASS scan |

### Public and dialog scans

| State | Axe violations | Status |
|---|---:|---|
| public / | 0 | PASS scan |
| public /about | 0 | PASS scan |
| public /login | 0 | PASS scan |
| public /register | 0 | PASS scan |
| public /unknown-audit-route | 0 | PASS scan |
| request dialog | 0 | PASS scan |

## Executed critical workflow checkpoints

Expected result is the stated operation plus persistence/DOM assertions in `tests/workflows.mjs`. Actual observations below come from executed PASS checkpoints, not a planned checklist.

| Checkpoint | Actual |
|---|---|
| login validation and student sign-in | PASS asserted |
| role-protected routes | PASS asserted |
| submit support request with persistence | PASS asserted |
| approve, assign staff and notify student | PASS asserted |
| support update notification and mark all read | PASS asserted |
| messages persist after reload | PASS asserted |
| class attendance management | PASS asserted |
| publish faculty assignment | PASS asserted |
| student assignment submission | PASS asserted |
| grading with saved feedback | PASS asserted |
| publish accessible material metadata | PASS asserted |
| institutional record management | PASS asserted |
| filtered report export | PASS asserted |
| text size, theme and preference persistence | PASS asserted |
| profile editing and password update persist | PASS asserted |
| mobile layouts and keyboard drawer dismissal | PASS asserted |
| student registration and optional support preference persistence | PASS asserted |
| no runtime errors throughout workflows | PASS asserted |

## Executed secondary controls

Each statement names the expectation; its status is the actual recorded assertion result in `tests/controls.mjs`.

| Expected behaviour / test | Actual |
|---|---|
| five public/404 pages: 40 viewport checks and axe | PASS asserted |
| unauthenticated direct student route redirects to login | PASS asserted |
| global search empty results and Escape | PASS asserted |
| global search keyboard navigation opens timetable | PASS asserted |
| timetable calendar export yields an ICS document | PASS asserted |
| sample academic transcript export contains transcript text | PASS asserted |
| sample attendance report downloads readable text | PASS asserted |
| sample material reader opens and downloads text (not binary media) | PASS asserted |
| request picker rejects unsupported extension | PASS asserted |
| request picker rejects oversized attachment | PASS asserted |
| request picker rejects empty attachment | PASS asserted |
| valid attachment metadata and accessible request dialog | PASS asserted |
| assignment search empty state and filter reset | PASS asserted |
| empty and whitespace messages cannot be submitted | PASS asserted |
| message HTML payload renders as inert text | PASS asserted |
| profile cancel discards unsaved fields | PASS asserted |
| wrong current password remains an error, not success | PASS asserted |
| clear notifications confirmation can be cancelled | PASS asserted |
| student directory search empty state and clear | PASS asserted |
| student duplicate roll remains a visible validation error | PASS asserted |
| quota failure leaves record unchanged and form open with error | PASS asserted |
| administrator adds a valid student academic record | PASS asserted |
| administrator edits student with Unicode and decimal GPA; survives refresh | PASS asserted |
| account menu arrows/End/Escape and focus restoration | PASS asserted |
| logout clears session and protects direct admin route | PASS asserted |
| expired session rejected after refresh | PASS asserted |
| no page runtime errors in secondary controls | PASS asserted |

## Vitest / RTL / Supertest individual assertions

“Passed” is the actual runner outcome for the named expectation. Test source contains fixture values and exact assertions. All API tests in `api.test.js` use explicit model stubs. No positive MongoDB operation is represented by these results.

### `tests/unit/api.test.js`

| Expected behaviour / test | Actual |
|---|---|
| Supertest API boundaries (model stubs) returns the authenticated public user without a password hash | PASSED |
| Supertest API boundaries (model stubs) rejects an expired JWT | PASSED |
| Supertest API boundaries (model stubs) rejects a revoked JWT | PASSED |
| Supertest API boundaries (model stubs) rejects inactive accounts | PASSED |
| Supertest API boundaries (model stubs) rejects malformed signed subject IDs without a database cast | PASSED |
| Supertest API boundaries (model stubs) student cannot update confidential support requests | PASSED |
| Supertest API boundaries (model stubs) faculty cannot update confidential support requests | PASSED |
| Supertest API boundaries (model stubs) admin cannot update confidential support requests | PASSED |
| Supertest API boundaries (model stubs) faculty cannot read confidential accessibility profiles | PASSED |
| Supertest API boundaries (model stubs) admin cannot read confidential accessibility profiles | PASSED |
| Supertest API boundaries (model stubs) student cannot read another student accessibility profile | PASSED |
| Supertest API boundaries (model stubs) student cannot download an unowned confidential document | PASSED |
| Supertest API boundaries (model stubs) faculty cannot download an unowned confidential document | PASSED |
| Supertest API boundaries (model stubs) admin cannot download an unowned confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects forged owner/status in support submission | PASSED |
| Supertest API boundaries (model stubs) rejects an empty message before looking up a recipient | PASSED |
| Supertest API boundaries (model stubs) rejects a message over the maximum length | PASSED |
| Supertest API boundaries (model stubs) rejects body-based NoSQL injection | PASSED |
| Supertest API boundaries (model stubs) rejects query-based NoSQL injection | PASSED |
| Supertest API boundaries (model stubs) recipient ownership is required to mark a message read | PASSED |
| Supertest API boundaries (model stubs) does not allow an administrator to deactivate their own account | PASSED |
| Supertest API boundaries (model stubs) rejects invalid calendar dates in attendance | PASSED |
| Supertest API boundaries (model stubs) rejects duplicate students in one attendance session | PASSED |
| Supertest API boundaries (model stubs) rejects UTF-8 passwords that bcrypt would silently truncate | PASSED |
| Supertest API boundaries (model stubs) requires independent encryption and authentication keys | PASSED |
| Supertest API boundaries (model stubs) omits permissive cross-origin credentials and disables caching | PASSED |
| Supertest API boundaries (model stubs) rejects empty confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects oversized confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects forged PDF confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects forged PNG confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects binary text confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects unsupported confidential document | PASSED |
| Supertest API boundaries (model stubs) rejects path traversal in attachment filenames | PASSED |

### `tests/unit/components.test.jsx`

| Expected behaviour / test | Actual |
|---|---|
| modal keeps focus on the input as the parent rerenders while typing | PASSED |
| modal escape closes and restores focus to its invoker | PASSED |
| dialog traps keyboard focus without selecting hidden file inputs | PASSED |
| tabs implement arrow, Home and End keyboard controls | PASSED |
| attachment limits reject unsupported, empty and oversized documents | PASSED |
| CSV exports neutralise formula injection and escape embedded quotes | PASSED |
| calendar and phone validation handle boundaries | PASSED |
| dropdown keyboard navigation restores focus on Escape | PASSED |
| local-storage hook rejects corrupt shapes and does not confirm a failed write | PASSED |

### `tests/unit/demo-service.test.js`

| Expected behaviour / test | Actual |
|---|---|
| demo data boundary regressions rejects malformed registration in the service, not only the page | PASSED |
| demo data boundary regressions normalises registration email consistently | PASSED |
| demo data boundary regressions never returns another student for an unknown account | PASSED |
| demo data boundary regressions does not repopulate an intentionally empty student directory | PASSED |
| demo data boundary regressions rejects expired and malformed persisted sessions | PASSED |
| demo data boundary regressions rejects duplicate student roll numbers | PASSED |
| demo data boundary regressions rejects invalid student emails and numeric limits | PASSED |
| demo data boundary regressions keeps notification mutations scoped to the signed-in account | PASSED |
| demo data boundary regressions does not persist invalid support status or forged submission status | PASSED |
| demo data boundary regressions rejects empty and oversized messages | PASSED |
| demo data boundary regressions does not corrupt a saved record after a rejected storage write | PASSED |
| demo data boundary regressions attendance correction is idempotent and uses actual subject totals | PASSED |

### `tests/unit/timetable.test.jsx`

| Expected behaviour / test | Actual |
|---|---|
| timetable renders a loading state before its asynchronous data exists | PASSED |

## Explicitly blocked / not implemented

Successful real MongoDB CRUD/seed/index/concurrency/encryption round trips; wired frontend/REST journey; real binary/media upload and provider delivery; full per-student academic model; student deletion/pagination/full conflict detection; branded and non-Chromium browsers; actual screen readers/audio/real devices; production deployment/load/backup/retention. See open defect ledger O01–O13 in QA-REPORT.md. None are counted as passes.
