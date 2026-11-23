# Technical audit strategy — 22 November 2026

## Scope and evidence rules
Audit the existing application; preserve its identity and role workspaces. Inventory every first-party source/config/test/documentation file. Generated bundles, node_modules and lockfile transitive implementation are machine-checked, not represented as manually reviewed source. Record actual execution and blockers. Do not infer database integration from local demo workflows or mock API tests.

## Architecture baseline
- React 18 / JavaScript / Vite / Tailwind, lazy React Router routes.
- LocalStorage demo service → Auth/Data contexts → role pages, shared shell and common controls.
- Separate Express/Mongoose API with JWTs, Zod allowlists, AES-GCM support fields and role/ownership checks.
- No frontend-to-REST adapter; no configured MongoDB service. These are deployment acceptance blockers, not passing integrations.

## Execution order
1. Read source, inspect dependency/import graph and run existing build/security/route/workflow/axe baselines.
2. ESLint all JS/JSX, including hooks, undefined identifiers, duplicate keys and list keys. Document/remove unused imports with safe automated fixes only.
3. Reproduce boundary failures before changes: identity fallbacks, corrupt persistence, profile save failure, empty lists, invalid records, user-scoped notifications, unsupported/oversized files, duplicate and failed operations.
4. Add Vitest + Testing Library/Jest DOM regression coverage and Supertest authenticated API tests. Attempt isolated MongoDB integration; if binary/service unavailable, report blocked, not a mocked integration pass.
5. Playwright: all routes/roles; critical positive/negative journeys; responsive matrix at 320,375,425,768,1024,1280,1440,1920; keyboard dialogs/menus/tabs; console/network observations.
6. axe A/AA checks, light/dark/high-contrast states and modal/forms; manual keyboard interactions. Real screen-reader/audio/OS browser testing is reported separately when unavailable.
7. Lighthouse against a production preview, record exact browser/version/viewport, throttling and measured scores. Dependency audit and OWASP-oriented code/API review.
8. Fix confirmed issues in place, rerun regression, write evidence-indexed QA report with remaining risks and deployment decision.

## Tooling and reporting
- Existing Node security suite and Playwright scripts retained.
- ESLint 9 selected because react lint plugin does not support ESLint 10; no forced peer resolution.
- Vitest, React Testing Library, Jest DOM, Supertest, axe-core and Lighthouse added.
- Results saved under ignored test-results; durable summary and defect tables under docs.
- Counts refer to explicit assertions/test cases in each suite; do not count browser/viewport combinations as independent browser engines.
