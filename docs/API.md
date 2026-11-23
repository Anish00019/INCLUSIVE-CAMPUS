# REST API reference

Base path: `/api`. JSON requests and responses. All endpoints except registration, login and health require `Authorization: Bearer <token>`. Successful creation returns 201; successful updates with no body return 204. Errors are JSON `{ "error": "..." }`, with `fields` on input-validation failures.

This API uses MongoDB ObjectId strings and normalised relationships. It is **separate from** the frontend's local-storage data contract; a mapping adapter is required before using these responses in the current UI. There is no live API-mode toggle.

## Authentication

| Method | Path | Behaviour |
|---|---|---|
| GET | `/health` | 200 if MongoDB is connected, 503 otherwise |
| POST | `/auth/register` | Student-only registration: `name`, `email`, `password` (at least 10 characters; at most 72 UTF-8 bytes), `department` (ObjectId), optional `course` (ObjectId) |
| POST | `/auth/login` | `email`, `password`; returns `{user, token}` |
| GET | `/auth/me` | Current public user |
| PATCH | `/auth/me` | Update `name` only; no role/password mass assignment |
| POST | `/auth/password` | `currentPassword`, `password`; revokes existing tokens |
| POST | `/auth/logout` | Revokes all outstanding tokens for the current account |

Registration never accepts `role`; it rejects extra keys. Provision staff through an authenticated administrator. Use a development seed or deployment provisioning procedure to create the first administrator.

## Academic records

| Method | Path | Access |
|---|---|---|
| GET | `/students` | Own profile for student; assigned roster for faculty; academic records for admin; accommodation coordination for support |
| PATCH | `/students/:id` | Admin: `department`, `course`, `year`, `semester`, `rollNo` |
| GET | `/students/:id/accessibility` | Student owner or support staff only; logged |
| PATCH | `/students/:id/accessibility` | Support only: `accommodations` array and optional `accessibilityNotes`; logged |
| PATCH | `/students/me/sharing` | Student: `shareAccommodations` boolean |
| GET | `/departments`, `/courses`, `/subjects`, `/examinations` | Authenticated; subjects/exams scoped to enrolment or teaching assignment |
| POST | `/departments`, `/courses`, `/subjects`, `/examinations` | Admin only; strict schema per model |
| PATCH | `/departments/:id`, `/courses/:id`, `/subjects/:id`, `/examinations/:id` | Admin only |
| GET | `/users` | Admin: public directory only |
| POST | `/users` | Admin: `name`, `email`, `password`, `role`; creates login, not an academic profile |
| PATCH | `/users/:id` | Admin: `active`, `role`; revokes sessions; cannot modify own access |

Faculty accommodations are included only when the student has enabled `shareAccommodations`. Confidential notes, diagnosis-like information and phone numbers are absent from academic roster responses. Profiles created by administrators still need their course/department relationships configured.

### Attendance

- `GET /attendance`: own records (student), assigned subjects (faculty), institution (admin).
- `POST /attendance`: faculty only. Payload: `{subject, date: "YYYY-MM-DD", marks: [{student, status}]}`. Status: `Present`, `Absent`, `Excused`. Subject and roster ownership are checked. A unique student/subject/date index makes corrections idempotent.

### Assignments

- `GET /assignments`: scoped by subject/course. Students see only their own submissions.
- `POST /assignments`: faculty only: `{title, description, subject, due: <ISO datetime>, maxMarks}`.
- `POST /assignments/:id/submit`: student in the course: `{text}`. Duplicate submissions return 409.
- `PATCH /assignments/:id/grade`: assigned faculty: `{student, marks, feedback}`. Marks cannot exceed the assignment maximum. Creates an in-app notification.

### Study materials

- `GET /study-materials`: enrolment/teaching scoped.
- `POST /study-materials`: assigned faculty: `{title, subject, type, content, transcript?, captions?}`. Recorded Video/Audio requires a non-empty transcript. This endpoint stores text, not a binary media stream. Do not claim that automatic caption generation or media transcoding is provided.

## Accessibility support

- `GET /support-requests?status=Approved`: own requests (student), assigned-student summaries (faculty), confidential cases (support), metadata-only coordination (admin).
- `POST /support-requests`: student: `{category, description, priority?}`. Description 10–10,000 chars. Student identity and initial status are set on the server.
- `PATCH /support-requests/:id`: support only: `{status, note, assignedTo?}`. Status and note required; assignee must be an active support user. Appends timeline, creates student notification and audit event.

Categories: Assistive Technology; Examination Accommodations; Accessible Classroom; Learning Materials; Mobility Assistance; Note-taking Assistance; Communication Support; Other.

Statuses: Submitted; Under Review; Approved; In Progress; Completed; Rejected.

### Confidential documents

- `POST /support-requests/:id/documents`: request owner or support user. `{name, mime, data}` where `data` is base64. Maximum 1 MB decoded; PDF, PNG, JPEG or plain text; maximum three files per request. MIME signatures and safe filenames are validated. Returns document metadata only.
- `GET /support-requests/:id/documents/:documentId`: same ownership check. Returns a forced binary download, never a public object URL. Access is audited. Faculty and college administrators are denied.

Document bytes are encrypted with AES-256-GCM. Production deployments additionally need malware scanning, storage quotas, content review, retention, key rotation and monitoring. Signature checks alone are **not** malware scanning.

## Communication and preferences

- `GET /messages`: messages where the user is sender or recipient, latest 200.
- `POST /messages`: `{recipient, text}`. Students may contact faculty/support; faculty may contact assigned students.
- `PATCH /messages/:id/read`: recipient only.
- `GET /notifications`: current user's notifications only.
- `PATCH /notifications/read`: `{id?}`. No ID marks all current user's notifications read.
- `DELETE /notifications`: clears current user's notification list only.
- `GET /accessibility-preferences`, `PUT /accessibility-preferences`: current user's preferences only. PUT allowlist: `fontScale` (0.85–1.5), `theme`, `highContrast`, `dyslexic`, `highlightLinks`, `reduceMotion`, `readingMode`, `visualAlerts`.

## Analytics and auditing

- `GET /reports?department=<ObjectId>&year=3&status=Approved`: support/admin, aggregate counts by status/category; never confidential descriptions/documents.
- `GET /audit-logs`: admin, latest 200 metadata-only audit events.

List endpoints have conservative result caps. Cursor pagination, production-scale analytics indexes, explicit staff case-assignment policies and institutional enrolment management should be added for a full deployment.

## Audit limitations (22 November 2026)

HTTP middleware/ownership tests use explicit model stubs. Successful database persistence, unique indexes, concurrent requests, encryption round trips from MongoDB, and multi-write atomicity have not been verified against a live database. The upload limit differs from demo metadata (5 MB versus API 1 MB); the adapter must enforce the API contract. See `QA-REPORT.md` before deployment.
