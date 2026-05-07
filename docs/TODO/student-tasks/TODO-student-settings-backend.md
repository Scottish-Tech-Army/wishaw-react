# TODO — Student Settings Backend Integration

**Scope:** `src/components/portal/student/StudentSettings.tsx`

The goal is to remove all hardcoded data from the Settings page and wire it fully to the Java Spring Boot backend — loading the student's current profile via the API and persisting changes (profile fields + password) through dedicated endpoints.

---

## 1. Define backend DTOs and API types

**Current state**
- `src/api/types.ts` has no types for settings-related requests or responses.
- `src/api/studentApi.ts` has no functions for fetching or updating student profile/password.

**Tasks**

- [x] **1.1** Add `StudentProfileDto` to `src/api/types.ts`
  - This DTO mirrors what `GET /api/v1/students/{studentId}/profile` returns.
  - Fields required by the Settings page:
    ```ts
    export interface StudentProfileDto {
      studentId: number;
      username: string;       // e.g. "@alex_gamer"
      gamertag: string;       // display name / in-game name
      bio: string;
      avatarUrl: string | null;
    }
    ```

- [x] **1.2** Add `UpdateProfileRequestDto` to `src/api/types.ts`
  - Body sent to `PATCH /api/v1/students/{studentId}/profile`.
  - Only editable fields; `studentId` comes from the URL path:
    ```ts
    export interface UpdateProfileRequestDto {
      username: string;
      gamertag: string;
      bio: string;
    }
    ```

- [x] **1.3** Add `ChangePasswordRequestDto` to `src/api/types.ts`
  - Body sent to `POST /api/v1/students/{studentId}/change-password`.
    ```ts
    export interface ChangePasswordRequestDto {
      currentPassword: string;
      newPassword: string;
    }
    ```

---

## 2. Add API functions to `studentApi.ts`

**Tasks**

- [x] **2.1** Add `getStudentProfile(studentId: number): Promise<StudentProfileDto>`
  - `GET /api/v1/students/{studentId}/profile`
  - Attach the JWT Bearer token via the existing `apiFetch` helper (already handled automatically).

- [x] **2.2** Add `updateStudentProfile(studentId: number, body: UpdateProfileRequestDto): Promise<StudentProfileDto>`
  - `PATCH /api/v1/students/{studentId}/profile`
  - Method: `PATCH`, body: `JSON.stringify(body)`.
  - Returns the updated `StudentProfileDto` so the component can reflect any server-side normalisations.

- [x] **2.3** Add `changePassword(studentId: number, body: ChangePasswordRequestDto): Promise<void>`
  - `POST /api/v1/students/{studentId}/change-password`
  - Expects `204 No Content` on success (already handled by `apiFetch` returning `undefined as T`).
  - On `401` the backend will throw an `ApiError` with `status: 401` — surface this as a wrong-password error in the UI.

---

## 3. Create a `useStudentProfile` hook

**Current state**
- No hook exists for loading or mutating a student's profile fields.

**Tasks**

- [x] **3.1** Create `src/hooks/useStudentProfile.ts`
  - Accept `studentId: number | null` as the argument (mirrors the pattern used by `useDashboard`).
  - Expose:
    ```ts
    {
      data: StudentProfileDto | null;
      loading: boolean;
      error: string | null;
      refresh: () => void;
    }
    ```
  - Call `getStudentProfile(studentId)` inside a `useEffect` whenever `studentId` changes.
  - Guard against `null` studentId — return early without fetching.
  - Derive a human-readable `error` string from `ApiError.message` (see how `useDashboard` does it).

---

## 4. Rewrite `StudentSettings.tsx` — Profile section

**Current state**
- The `INITIAL` constant hard-codes `username`, `gamertag`, and `bio` as string literals.
- `handleProfileSave` has a `// TODO: persist to backend` comment and does nothing.

**Tasks**

- [x] **4.1** Remove the `INITIAL` hardcoded constant entirely.

- [x] **4.2** Read `studentId` from `AuthContext`

- [x] **4.3** Load profile data on mount via `useStudentProfile`

- [x] **4.4** Add a loading skeleton for the profile form

- [x] **4.5** Add an error state for the profile fetch

- [x] **4.6** Wire `handleProfileSave` to `updateStudentProfile`

---

## 5. Rewrite `StudentSettings.tsx` — Password section

**Current state**
- `handlePasswordSave` only does client-side validation then resets fields with a `// TODO: call auth API` comment.

**Tasks**

- [x] **5.1** Wire `handlePasswordSave` to `changePassword`

- [x] **5.2** Keep all existing client-side validation

---

## 6. Guard: redirect if unauthenticated or not a student

**Current state**
- `StudentSettings` assumes a logged-in student; there is no auth guard.
- `StudentLayout` already guards the shell, but `StudentSettings` itself has no safety net if rendered standalone.

**Tasks**

- [x] **6.1** Add a `useEffect` redirect guard

- [x] **6.2** Guard `studentId` before any fetch or mutation

---

## 7. (Optional) Avatar upload / change

**Current state**
- The Settings page has no avatar section; avatar is only shown read-only in `StudentLayout` and `StudentProfile`.

**Tasks**

- [x] **7.1** Add an Avatar subsection to the Profile form (UI only first)

- [x] **7.2** Add `uploadAvatar(studentId, file: File): Promise<StudentProfileDto>` to `studentApi.ts`

- [x] **7.3** Call `uploadAvatar` on file selection

---

## 8. Clean up & QA

**Tasks**

- [x] **8.1** Confirm `studentData.ts` has zero remaining references in `StudentSettings.tsx`
  - Verified: `grep` for `studentData` in `StudentSettings.tsx` returns zero matches. ✅
  - All four touched files (`StudentSettings.tsx`, `studentApi.ts`, `types.ts`, `useStudentProfile.ts`) compile with no TypeScript errors. ✅

- [ ] **8.2** End-to-end smoke test *(requires live backend)*

- [ ] **8.3** Verify settings changes propagate to `StudentLayout` topbar and `StudentProfile` *(requires live backend)*
