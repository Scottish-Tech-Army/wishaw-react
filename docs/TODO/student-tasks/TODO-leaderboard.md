# Student Leaderboard — Feature TODO

Each task below is self-contained and can be picked up in a separate chat.
The existing leaderboard lives in `src/components/portal/student/StudentLeaderboard.tsx`.

---

## Tasks

- [x] **1. Time Period Filter**
  - Add a segmented control / button group with options: `All Time`, `This Month`, `This Week`.
  - Filtering should re-rank the player list based on XP/stats earned within the chosen window.
  - Highlight the active period button visually (active style matches the portal colour scheme).
  - The selected period should be stored in local component state (`useState`).

- [x] **2. Game Filter (Dropdown)**
  - Add a `<select>` or custom dropdown that lists every unique game present in the player data (e.g. Valorant, Rocket League, Fortnite …) plus an `All Games` default option.
  - When a game is selected, the leaderboard only shows players whose `topGame` matches.
  - The dropdown should be visually consistent with the existing portal card/input styles.

- [x] **3. Sort By Control**
  - Add a sort control with four options: `XP`, `Level`, `Games Played`, `Win Rate`.
  - Default sort is `XP` (descending).
  - Changing the sort re-orders the displayed list and updates the visible rank numbers accordingly.
  - The active sort option should be visually distinguished.

- [ ] **4. Podium for Top 3**
  - Render a podium section above the main table showing ranks 1, 2, and 3.
  - Layout: 2nd place (left, medium height), 1st place (centre, tallest), 3rd place (right, shortest).
  - Each podium card shows: avatar, name, rank medal (🥇 🥈 🥉), level, and XP.
  - The podium should respond to the active filters/sort — it always reflects the current top 3 of the filtered+sorted list.

- [x] **5. "My Rank" Highlight Card**
  - Show a sticky or pinned card just above the full table that displays the current user's rank, name, XP, level, and win rate.
  - The card uses a distinct highlight colour (e.g. accent border/background) so it stands out.
  - If the current user is already in the top 3 podium, the card can still be shown for quick reference.
  - The card updates when filters or sort change (the user's rank may shift).

- [x] **6. Full Stats Table**
  - Extend the existing table to include all columns: `Rank`, `Player`, `Level`, `XP`, `Games Played`, `Wins`, `Win Rate`, `Top Game`, `Badges`.
  - Column headers should be clickable to trigger sorting (ties back to task 3).
  - The current user's row should be highlighted (e.g. accent background or bold text).
  - Add alternating row shading for readability.

- [x] **7. Search by Player Name**
  - Add a text input above the table with a search icon (🔍).
  - Typing filters the table rows in real-time (case-insensitive match on `name` or `username`).
  - If no players match, show a friendly empty state message (e.g. "No players found").
  - Search works on top of the active game filter and time period — all three are combinable.

- [x] **8a. Replace Data Model with Learning Stats**
  - Remove all game-related fields (`topGame`, `gamesPlayed`, `wins`, `winRate`) from the mock player data.
  - Add the following fields to each player: `totalXP` (level score), `badgeXP` (XP earned from badges), `completedModules` (number), `badgesCompleted` (number).
  - Assign each player a `centre` field (e.g. `"London"`, `"Manchester"`, `"Birmingham"`, `"Global"`) for use in the centre filter.
  - Update the `Player` TypeScript type/interface to reflect the new shape.
  - Ensure the mock data has enough variety across centres and stats to make filters meaningful.

- [ ] **8b. Replace Game Filter with Centre Filter**
  - Remove the existing Game Filter dropdown (task 2).
  - Add a new Centre filter dropdown with options: `All Centres` (global leaderboard) plus one option per unique centre in the data.
  - When a centre is selected, only players from that centre are shown.
  - Selecting `All Centres` shows every player (global view).
  - The dropdown should be visually consistent with the existing portal card/input styles.

- [x] **8c. Update Sort Options to Learning Columns**
  - Remove the old sort options (`Games Played`, `Win Rate`) from the Sort By control (task 3).
  - Replace with: `XP` (badgeXP), `Level` (totalXP), `Completed Modules`, `Badges Completed`.
  - Default sort remains `XP` (badgeXP, descending).
  - Clickable column headers in the table should map to the same four sort keys.

- [ ] **8d. Update Full Stats Table Columns**
  - Remove columns: `Games Played`, `Wins`, `Win Rate`, `Top Game`.
  - Replace with: `Rank`, `Player`, `Level` (totalXP), `XP` (badgeXP), `Completed Modules`, `Badges Completed`.
  - Column headers remain clickable for sorting (ties back to task 8c).
  - Keep current-user row highlight and alternating row shading.

- [x] **8e. Update "My Rank" Card and Podium for New Data**
  - Update the My Rank highlight card (task 5) to show: rank, name, Level (totalXP), XP (badgeXP), Completed Modules, Badges Completed — removing win rate.
  - Update the Podium (task 4) cards to show: avatar, name, rank medal, Level, and XP (badgeXP).
  - Both should continue to respond to the active Centre filter, time filter, sort, and search.

---

## Notes

- All tasks share the same component file: `src/components/portal/student/StudentLeaderboard.tsx`.
- Filters, sort, and search should all compose together — the displayed list is always the result of applying **time filter → centre filter → sort → search** in that order.
- Mock/static data is already in the component; no API integration is needed for these tasks.
- Follow the existing portal colour variables defined in `src/portal.css`.
