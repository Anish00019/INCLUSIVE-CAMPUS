# QA file inventory — 22 November 2026

108 first-party source/test/config/static paths inventoried. Hashes are SHA-256 prefixes of the final audited content; line counts are newline counts. Paths/coverage identify inspection and machine-check scope, not a claim that every runtime branch or every control was manually exercised.

Generated `dist/`, `node_modules/`, local credentials, `.git/`, downloaded browser/database binaries and raw `test-results/` are intentionally excluded. Documentation is reviewed as documentation and linked from QA-REPORT.md; it is not included in this self-referential content hash list.

| File | Lines | SHA-256 prefix | Inspection / verification scope |
|---|---:|---|---|
| `.env.example` | 7 | `ff7236cb09744180` | Configuration/static review; build/lint/dependency checks where applicable |
| `.gitignore` | 10 | `fb9f007cc6b55e3f` | Configuration/static review; build/lint/dependency checks where applicable |
| `eslint.config.js` | 13 | `c69cc694ad7ce342` | Configuration/static review; build/lint/dependency checks where applicable |
| `index.html` | 13 | `93c0e5769afa0f55` | Configuration/static review; build/lint/dependency checks where applicable |
| `package-lock.json` | 10726 | `bb93d48735feb1cc` | Machine-parsed lockfile; dependency audit (not manual transitive source review) |
| `package.json` | 68 | `979d9565b9906b10` | Configuration/static review; build/lint/dependency checks where applicable |
| `postcss.config.js` | 1 | `08910ce1d5cd87d2` | Configuration/static review; build/lint/dependency checks where applicable |
| `public/robots.txt` | 8 | `083d3bd6252befa0` | Configuration/static review; build/lint/dependency checks where applicable |
| `server/app.js` | 31 | `dfd520ddcfbc7991` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/index.js` | 13 | `6c5ac774db1354bc` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/middleware/auth.js` | 13 | `f155267dc15fa806` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/models/index.js` | 52 | `a47447fd3649b3a6` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/routes/api.js` | 281 | `eecb182042a804ab` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/security.js` | 27 | `148edd363e3cbe0c` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `server/seed.js` | 22 | `a979028a933c87c5` | Source/security review; Node/Supertest boundaries; successful MongoDB paths BLOCKED |
| `src/App.jsx` | 128 | `87200b39641e0649` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `src/components/accessibility/A11yControls.jsx` | 117 | `8cd18e5c5f4bf57d` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/accessibility/AccessibilityToolbar.jsx` | 92 | `de4d307257645be8` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/accessibility/SpeakButton.jsx` | 31 | `47021c37d634a8a9` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/accessibility/VoiceNavigation.jsx` | 33 | `5b119db45a0eb8d7` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/charts/index.jsx` | 189 | `885e042fb5118278` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/ConfirmDialog.jsx` | 23 | `4c90feacf251193a` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/Dropdown.jsx` | 42 | `75d2f0dc13958472` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/ErrorBoundary.jsx` | 10 | `c0f5794716f5b7ac` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/Modal.jsx` | 64 | `8b503208412bbc32` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/PageHeader.jsx` | 42 | `a3e97d7c256daefc` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/RecordManager.jsx` | 43 | `392c354a560811aa` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/SearchInput.jsx` | 20 | `2145900a5ba886fb` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/common/ui.jsx` | 214 | `3a093fbb0969954e` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/dashboard/InstitutionOverview.jsx` | 48 | `c543fd21d9b8f555` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/dashboard/RequestCard.jsx` | 60 | `32313e1ff921c9ff` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/dashboard/Timeline.jsx` | 61 | `9023bdd71900766f` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/forms/RequestForm.jsx` | 186 | `062d280f5ca13efb` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/AppLayout.jsx` | 43 | `ea8f0f46506b251b` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/GlobalSearch.jsx` | 119 | `74e414eccf0f8593` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/NotificationBell.jsx` | 83 | `997214835935c153` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/ProtectedRoute.jsx` | 21 | `486186558e6409ce` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/Sidebar.jsx` | 138 | `d549d8a19e830253` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/components/layout/Topbar.jsx` | 87 | `dfab434fd29c403d` | Shared component review; ESLint/build; selected RTL/keyboard/axe/browser regressions |
| `src/context/AccessibilityContext.jsx` | 95 | `bf06277b7c6aa6d9` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/context/AuthContext.jsx` | 76 | `868f5596bd987f3e` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/context/DataContext.jsx` | 96 | `c5ed3bd5837170d7` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/context/ToastContext.jsx` | 62 | `dac8d15978a68d14` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/hooks/useDebounce.js` | 10 | `cd742dd4e404e886` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/hooks/useDocumentTitle.js` | 9 | `19e4a45199ff889f` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/hooks/useLocalStorage.js` | 20 | `637d349a88b56964` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/hooks/useMediaQuery.js` | 13 | `dbe6fd801bbf5b43` | State/effect/persistence review; ESLint hooks; selected unit/browser regressions |
| `src/main.jsx` | 34 | `28190b1dc1950868` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `src/pages/About.jsx` | 14 | `e0dc012a1db8d664` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/AccessibilitySettings.jsx` | 122 | `5e39a239a6e17f2a` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/Landing.jsx` | 416 | `0bae7d41715fa5c3` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/Messages.jsx` | 262 | `370a8b318b3a4546` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/NotFound.jsx` | 23 | `548f58827f8c2ff5` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/Notifications.jsx` | 137 | `6afc0de692716717` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/Profile.jsx` | 277 | `736f2b83016dfc41` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/Settings.jsx` | 202 | `073e129a0dc13998` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Courses.jsx` | 3 | `ad4d9395d3bb9541` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Dashboard.jsx` | 2 | `ade4b246a22e9b54` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Departments.jsx` | 3 | `65ad000927104c74` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Reports.jsx` | 2 | `3a5477296618dc95` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Students.jsx` | 3 | `2b256ad541c61f13` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/admin/Users.jsx` | 3 | `c43091811eb00625` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/auth/Login.jsx` | 171 | `6cf4bd14ae5150f4` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/auth/Register.jsx` | 263 | `4936fadd50e60f6a` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Assignments.jsx` | 204 | `371ebdd42909ddaa` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Attendance.jsx` | 165 | `92c3aa940113e5d2` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Dashboard.jsx` | 205 | `c2f5870639957a2c` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Materials.jsx` | 167 | `e4937f4eefeebd61` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Requests.jsx` | 166 | `89a0ff5df9a6fefa` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/faculty/Students.jsx` | 198 | `0fb99484fc56fe73` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Academics.jsx` | 212 | `f75680b22c1137c8` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Assignments.jsx` | 226 | `af093662dd64733b` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/AssistiveHub.jsx` | 407 | `7ae5fe4d09fc2cfb` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Attendance.jsx` | 207 | `73bbd8be0d46e745` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Dashboard.jsx` | 303 | `b68bc90c2fce9027` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Examinations.jsx` | 197 | `a7c507422a2daab9` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/StudyMaterials.jsx` | 253 | `1b1bbfd274f1638e` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/SupportRequests.jsx` | 170 | `98acb4b585dd5ea5` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/SupportTracking.jsx` | 212 | `ec1a59d152c6f90b` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/student/Timetable.jsx` | 170 | `451c90198727c322` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Dashboard.jsx` | 2 | `6df4bd3639321203` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Reports.jsx` | 2 | `fe789e73b0ec42d7` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Requests.jsx` | 69 | `4e8eebf9a0919aa1` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Resources.jsx` | 3 | `7da0fef779ef4ffb` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Staff.jsx` | 3 | `39dae67f6210ea90` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/pages/support/Students.jsx` | 3 | `fe477babd6dd48d8` | Source/import review; production build; route/responsive/axe smoke (see matrix); selected controls only |
| `src/services/api.js` | 392 | `3d3a4b356171b35d` | Source/data-contract review; demo service regressions and workflows; not real API integration |
| `src/services/mockData.js` | 247 | `2e70a4e2906d04db` | Source/data-contract review; demo service regressions and workflows; not real API integration |
| `src/styles/index.css` | 170 | `b76e60e343a3642c` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `src/utils/helpers.js` | 71 | `a0250b05d894294b` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `src/utils/navigation.js` | 170 | `63bdaca58be4ddf5` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `src/utils/validation.js` | 36 | `924569a2d62cfe1b` | Source/config/style review; ESLint where applicable; build and selected regression checks |
| `tailwind.config.js` | 19 | `3ebfba8629cd1bac` | Configuration/static review; build/lint/dependency checks where applicable |
| `tests/a11y.mjs` | 14 | `4f8cd41e7fe69d90` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/audit-matrix.mjs` | 34 | `4bfff44d9ca80e49` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/browser.mjs` | 29 | `ae4b6cf91dffd1b1` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/controls.mjs` | 54 | `76e6608a132b2b71` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/performance.mjs` | 35 | `7e7f26d6d9119e40` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/security.test.mjs` | 55 | `ba1ba0cac6e2f0de` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/smoke.mjs` | 23 | `afd1d6154ea6438c` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/unit/api.test.js` | 53 | `8201bb99bbd8f8d6` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/unit/components.test.jsx` | 49 | `908cb22791d8cf96` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/unit/demo-service.test.js` | 55 | `9b6c8bbbab97e12b` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/unit/setup.js` | 4 | `7f0f83013db906ea` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `tests/unit/timetable.test.jsx` | 7 | `98e7f7b4af389d7c` | Executable QA source; ESLint; null-data loading RTL regression |
| `tests/workflows.mjs` | 31 | `4872c6ff4d8ecbc0` | Executable QA source; ESLint; execution scope/results in QA-TEST-MATRIX.md |
| `vite.config.js` | 12 | `4c5049ccebabdcc8` | Configuration/static review; build/lint/dependency checks where applicable |
| `vitest.config.js` | 3 | `7b68d52e18e10c8e` | Configuration/static review; build/lint/dependency checks where applicable |
