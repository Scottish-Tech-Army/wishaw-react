# Task 3 — User Management

**File(s):** `src/components/portal/admin/AdminUsers.tsx`

---

## TODOs

- [ ] **3.1** User list table
  - Columns: Name, Username, Centre, Group, Level, Total XP, Badges Earned, Joined Date
  - Render from a mock data array of user objects
  - Sortable columns (at minimum by XP and Name)

- [ ] **3.2** Search + filters bar
  - Text input: search by name or username (client-side filter)
  - Dropdown: filter by Centre
  - Dropdown: filter by Group (dependent on selected centre, or show all)
  - Clear filters button

- [ ] **3.3** Add User modal
  - Fields: Username, Display Name, Group Assignment (dropdown), Centre (dropdown)
  - No personal data (no email/phone) per brief
  - Submit adds user to local mock state
  - Cancel / close button

- [ ] **3.4** Edit User (inline)
  - Clicking a row's edit icon puts Username and Group columns into inline edit mode
  - Save icon commits the change to local state
  - Cancel icon discards changes

- [ ] **3.5** Remove User
  - Delete icon on each row
  - Opens a confirmation modal ("Are you sure you want to remove [name]?")
  - Confirm removes user from local state

- [ ] **3.6** View User panel / drawer
  - Clicking a user's name opens a right-side drawer (or modal)
  - Read-only summary: badge progress (per main badge), completed modules list, recent activity feed for that user
  - Close button / click-outside dismisses

---

## Status: 🔄 In Progress
