# TODO — Fix: Teams Page Always Shows Wolf Cubs

## Root cause

`getTeamDetail()` in `mockApi.ts` **ignores its `_teamId` argument** and always
returns the single hardcoded `MOCK_TEAM_DETAIL` object, which is Wolf Cubs.
Every team link therefore loads the same data regardless of which team was clicked.

---

## Tasks

- [ ] **1 — Add per-team detail data to `mockData.ts`**

  - [ ] 1.1 — Define a new `MOCK_TEAM_DETAILS` constant:
    - [ ] 1.1a Declare it as `export const MOCK_TEAM_DETAILS: Record<string, TeamDetailDto> = { ... }`.
    - [ ] 1.1b Place it immediately after the existing `MOCK_TEAMS` block for discoverability.

  - [ ] 1.2 — Wire in the existing Wolf Cubs data:
    - [ ] 1.2a Use the existing `MOCK_TEAM_DETAIL` object as the value for the `"wolf-cubs"` key.
    - [ ] Option A: Keep `MOCK_TEAM_DETAIL` and also reference it inside `MOCK_TEAM_DETAILS["wolf-cubs"]`.
    - [ ] Option B: Inline the existing object into `MOCK_TEAM_DETAILS` and remove `MOCK_TEAM_DETAIL` if it’s no longer needed.

  - [ ] 1.3 — Create full detail entries for the other teams:
    - [ ] 1.3a `"pixel-wolves"` — copy Wolf Cubs structure, update:
      - [ ] 1.3b `id`, `name`, `icon`, `colour`, `hub`, `game`, `description`.
      - [ ] 1.3c Member list: at least 3–4 members with realistic badge and module progress.
    - [ ] 1.3d `"neon-bees"` — as above, with their own theme / hub / game.
    - [ ] 1.3e `"iron-circuit"` — as above, matching their summary data.

  - [ ] 1.4 — Keep data consistent with `MOCK_TEAMS`:
    - [ ] 1.4a Ensure each `TeamDetailDto.id` matches the `id` in `MOCK_TEAMS`.
    - [ ] 1.4b Ensure `name`, `icon`, `colour`, `hub`, and `game` line up with the corresponding `TeamSummaryDto`.
    - [ ] 1.4c Make sure each member’s `teamId` matches the team key (e.g. `"pixel-wolves"`).

  - [ ] 1.5 — Export and type-check:
    - [ ] 1.5a Confirm `MOCK_TEAM_DETAILS` is exported from `mockData.ts`.
    - [ ] 1.5b Fix any type errors from `TeamDetailDto` / `TeamMemberDto` shape mismatches.

---

- [ ] **2 — Fix `getTeamDetail()` in `mockApi.ts` to use `teamId`**

  - [ ] 2.1 — Import the new mock map:
    - [ ] 2.1a Add `MOCK_TEAM_DETAILS` to the import list from `./mockData`.

  - [ ] 2.2 — Update the function signature:
    - [ ] 2.2a Rename `_teamId` to `teamId` to reflect that it’s actually used.

  - [ ] 2.3 — Implement lookup with fallback:
    - [ ] 2.3a Replace the hardcoded return with:
      ```ts
      return MOCK_TEAM_DETAILS[teamId] ?? MOCK_TEAM_DETAIL;
      ```
    - [ ] 2.3b Keep [await delay();](http://_vscodecontentref_/1) as-is so network timing stays consistent.

  - [ ] 2.4 — Optional: handle unknown team IDs more explicitly
    - [ ] Decide whether returning [MOCK_TEAM_DETAIL](http://_vscodecontentref_/2) is acceptable, or if you’d rather:
      - [ ] Throw an [ApiError](http://_vscodecontentref_/3) 404 for unknown slugs, **or**
      - [ ] Return a minimal “unknown team” payload.
    - [ ] If behaviour changes, update any comments / docs that describe [getTeamDetail](http://_vscodecontentref_/4).

---

- [ ] **3 — Verify [useTeamDetail](http://_vscodecontentref_/5) passes [teamId](http://_vscodecontentref_/6) correctly**

  - [ ] 3.1 — Check the route params usage in [StudentTeamDetail.tsx](http://_vscodecontentref_/7):
    - [ ] 3.1a Confirm it calls [useParams<{ teamId: string }>()](http://_vscodecontentref_/8).
    - [ ] 3.1b Confirm it destructures `{ teamId }` (not `{ id }` or `{ slug }`).

  - [ ] 3.2 — Check the hook call:
    - [ ] 3.2a Confirm it passes [teamId](http://_vscodecontentref_/9) directly to [useTeamDetail(teamId)](http://_vscodecontentref_/10).
    - [ ] 3.2b Confirm [useTeamDetail](http://_vscodecontentref_/11) accepts [teamId: string | undefined](http://_vscodecontentref_/12).

  - [ ] 3.3 — Check the hook implementation in [useTeamDetail.ts](http://_vscodecontentref_/13):
    - [ ] 3.3a Ensure the guard `if (teamId == null) return;` is present.
    - [ ] 3.3b Ensure it calls [getTeamDetail(teamId!)](http://_vscodecontentref_/14) (or equivalent) inside the `try` block.
    - [ ] 3.3c Ensure errors from [ApiError](http://_vscodecontentref_/15) are surfaced as a readable message.

  - [ ] 3.4 — Manual test:
    - [ ] 3.4a Start the app with mocks enabled.
    - [ ] 3.4b Click each team in the Teams list.
    - [ ] 3.4c Confirm the detail page changes per team and no errors are logged.

---

- [ ] **4 — Verify route param name matches [useParams](http://_vscodecontentref_/16) key**

  - [ ] 4.1 — Inspect student routes in [App.tsx](http://_vscodecontentref_/17):
    - [ ] Confirm there is a route like:
      ```tsx
      <Route path="teams/:teamId" element={<StudentTeamDetail />} />
      ```
    - [ ] Ensure it’s nested under the `/student` layout route.

  - [ ] 4.2 — Align param name and usage:
    - [ ] If the route uses `:teamId`, [useParams](http://_vscodecontentref_/18) must read [teamId](http://_vscodecontentref_/19).
    - [ ] If the route uses a different param (e.g. `:id` or `:slug`), either:
      - [ ] Rename the route segment to `:teamId`, **or**
      - [ ] Update [useParams](http://_vscodecontentref_/20) and the hook to use the matching key consistently.

  - [ ] 4.3 — End-to-end sanity check:
    - [ ] Navigate from the student dashboard to Teams.
    - [ ] Click a team, verify the URL shape: `/student/teams/<team-slug>`.
    - [ ] Refresh the page on a team detail URL; confirm it still loads correctly.
