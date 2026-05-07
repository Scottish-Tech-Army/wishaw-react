# Frontend Design
## Wishaw YMCA Esports - Login App
### React SPA

## 1. Purpose
This document defines the React frontend for the authenticated Esports Login App.

The frontend is:
- Esports-styled
- Authenticated only
- Focused on progression, XP, and challenges

## 2. Application Type
- React Single Page Application
- Communicates only with backend APIs
- No server-side rendering required

## 3. Visual Direction (Esports)
Mandatory characteristics:
- Dark theme
- High contrast accent colours
- Card-based layout
- Prominent XP bars and level indicators
- Game identity via icons (no licensed art)

Language rules:
- Use: Player, Challenge, Module, XP, Level, Coach note
- Avoid: Lesson, Course, Assessment, Evidence upload

## 4. App Structure
Recommended module layout:

```text
src/
  auth/
    LoginPage.tsx
    AuthContext.tsx
  dashboard/
    PlayerDashboard.tsx
    BadgeOverview.tsx
    ModuleList.tsx
  challenges/
    ChallengeCard.tsx
    SubmitNoteModal.tsx
  admin/
    AdminDashboard.tsx
    SubmissionReview.tsx
  leaderboard/
    LeaderboardView.tsx
  api/
    client.ts
```

## 5. Authentication Handling
- Login form posts to POST /auth/login
- Auth state stored in AuthContext
- Backend controls authorisation
- Frontend hides or shows features based on role

No registration screens.

## 6. Player Experience

### 6.1 Dashboard
- Avatar
- Five badge cards
- XP bars and current level
- Next level indicator

### 6.2 Modules
- Active modules only
- Module goal visible
- Challenges listed in sort order

### 6.3 Challenges
- Status: Not Started, Submitted, Approved
- Submit text note only
- Submission confirmation shown

## 7. Admin Experience (Centre Admin)
- View players in centre
- Review submitted challenge notes
- Approve or reject
- Optional reviewer comment
- XP updates automatically after approval

## 8. Leaderboards
- Default: centre leaderboard
- Optional: global leaderboard

Views:
- Total XP
- Per badge category (optional toggle)

Display:
- Username or pseudonym
- No cross-centre browsing beyond leaderboard rows

## 9. Error Handling
- Clear inline validation
- Explicit permission errors
- No stack traces or technical error dumps to users

## 10. Frontend Constraints (Hard Rules)
- No registration UI
- No upload components
- No email fields
- No cross-centre browsing
- No public pages

## 11. Intended GitHub Copilot Usage
This document should guide Copilot to:
- Generate React components
- Structure API clients
- Respect role-based rendering
- Avoid inventing flows outside scope

Copilot must not invent:
- Signup flows
- File uploads
- Parent views
- Non-esports UI language
