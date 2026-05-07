# TODO — Evidence Submission: Backend Integration

> **Status:** `EvidenceSubmission.tsx` uses a hardcoded badge list (`STATIC_BADGE_OPTIONS`)
> and a simulated `setTimeout` submission. No component may read badge data from that
> static list once the backend is live.
> This checklist tracks every step needed to wire the Evidence Submission page to the
> Java Spring Boot backend.

---

## 1. Add API DTOs to `src/api/types.ts`

Add the following TypeScript interfaces that mirror the Java backend DTOs.
Field names must be **camelCase** (Jackson's `LOWER_CAMEL_CASE` strategy).

- [ ] **`EvidenceSubmissionDto`** — a single submission record returned by the backend
  ```ts
  interface EvidenceSubmissionDto {
    id: number;
    badgeName: string;
    subBadgeName: string;
    subBadgeIcon: string;       // emoji, e.g. "🎯"
    fileName: string;
    notes: string;
    submittedAt: string;        // display string, e.g. "22 Mar 2026"
    status: "pending" | "approved" | "rejected";
  }
  ```

- [ ] **`EvidenceSubmissionRequestDto`** — the request body for a new submission
  ```ts
  interface EvidenceSubmissionRequestDto {
    subBadgeId: number;
    notes: string;
    // File is sent separately as multipart/form-data — not included in this DTO
  }
  ```

---

## 2. Add API functions to `src/api/studentApi.ts`

- [ ] **`getEvidenceSubmissions(studentId)`** — fetches the student's submission history
  ```ts
  // Backend endpoint: GET /api/v1/students/{studentId}/evidence
  // Auth: Bearer JWT required
  export async function getEvidenceSubmissions(studentId: number): Promise<EvidenceSubmissionDto[]>
  ```

- [ ] **`submitEvidence(studentId, subBadgeId, notes, file)`** — posts a new submission
  ```ts
  // Backend endpoint: POST /api/v1/students/{studentId}/evidence
  // Body: multipart/form-data with fields: subBadgeId, notes, file
  // Auth: Bearer JWT required
  // Returns: EvidenceSubmissionDto (the newly created record)
  // Note: must NOT use apiFetch — use raw fetch() with FormData (same pattern as uploadAvatar)
  export async function submitEvidence(
    studentId: number,
    subBadgeId: number,
    notes: string,
    file: File,
  ): Promise<EvidenceSubmissionDto>
  ```

---

## 3. Add `useEvidenceSubmissions` hook — `src/hooks/useEvidenceSubmissions.ts`

- [ ] Create the hook following the same pattern as `useTeams` / `useStudentProfile`
  ```ts
  // Fetches GET /api/v1/students/{studentId}/evidence
  // Exposes: { data: EvidenceSubmissionDto[] | null, loading, error, refresh }
  export function useEvidenceSubmissions(studentId: number | null | undefined): UseEvidenceSubmissionsState
  ```
- [ ] Guard against `null` / `undefined` `studentId` (do not fetch until it is known)
- [ ] Handle `401` / `403` with `"Session expired. Please log in again."`
- [ ] Handle network failures with `"Could not connect to the server. Check your network connection."`

---

## 4. Wire `EvidenceSubmission.tsx` to live badge data

- [ ] Remove `STATIC_BADGE_OPTIONS` entirely from the file
- [ ] Read badge catalogue from `useBadgeCatalogueContext` (already imported)
  — call `useBadgeCatalogue(studentId)` inside the component, or consume the context
- [ ] Map `MainBadgeDetailDto[]` to the badge picker `<select>` options
- [ ] Filter sub-badges to `!sub.earned` dynamically (same logic as the old static list)
- [ ] Display the selected sub-badge's `criteria` and `xpReward` in the challenge-info block

---

## 5. Wire `handleSubmit` to the real backend

- [ ] Replace the `setTimeout` simulation block with a call to `submitEvidence()`
- [ ] Set `status` to `"submitting"` before the call and reset it on error
- [ ] On success:
  - Call `refresh()` from `useEvidenceSubmissions` to reload the submissions list
  - Call `refreshBadges()` from `useBadgeCatalogueContext` (already in place)
  - Set `status` to `"submitted"` to show the success state
- [ ] Remove `INITIAL_SUBMISSIONS` constant and replace the `useState` initial value with `null`
  (the hook handles the initial empty state)
- [ ] Show a loading skeleton or spinner in the "My Submissions" panel while the hook is loading

---

## 6. Wire `AuthContext.tsx` — Forgot credentials

- [ ] **`forgotUsername(email)`** in `src/api/studentApi.ts`
  ```ts
  // Backend endpoint: POST /api/v1/auth/forgot-username
  // Body: { email: string }
  // Returns: { username: string } on success, throws ApiError 404 when not found
  export async function forgotUsername(email: string): Promise<{ username: string }>
  ```

- [ ] **`forgotPassword(username)`** in `src/api/studentApi.ts`
  ```ts
  // Backend endpoint: POST /api/v1/auth/forgot-password
  // Body: { username: string }
  // Returns: { hint: string } on success, throws ApiError 404 when not found
  export async function forgotPassword(username: string): Promise<{ hint: string }>
  ```

- [ ] Replace `lookupUsername()` stub in `AuthContext.tsx` — call `forgotUsername()` and
  return `{ found: true, username }` or `{ found: false }` based on the result
- [ ] Replace `lookupPassword()` stub in `AuthContext.tsx` — call `forgotPassword()` and
  return `{ found: true, hint }` or `{ found: false }` based on the result
- [ ] Both functions must be async — update the `AuthContextType` interface signatures
  from synchronous to `Promise`-returning
- [ ] Update `ForgotModal` in `App.tsx` to `await` the calls (currently calls them synchronously)
