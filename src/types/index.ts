/* ── Auth ─────────────────────────────────────── */
export type UserRole = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  centreId?: string;
}

export interface Profile {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  bio?: string;
  photoUrl?: string;
  overlayTemplate?: string;
  privacy: { showInPublicList: boolean; allowSocialSharing: boolean };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  profile: Profile;
}

/* ── Centres & Groups ────────────────────────── */
export interface Centre {
  id: string;
  name: string;
  location: string;
}

export interface Group {
  id: string;
  name: string;
  game: string;
  centreId: string;
  centreName?: string;
  memberCount: number;
}

/* ── Badges ──────────────────────────────────── */
export type MainBadgeName =
  | 'Game Mastery'
  | 'Teamwork'
  | 'Esports Citizen'
  | 'Personal Development'
  | 'Digital Skills';

export type BadgeLevel = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface MainBadge {
  id: string;
  name: MainBadgeName;
  description: string;
  icon: string;
}

export interface SubBadge {
  id: string;
  name: string;
  description: string;
  mainBadgeId: string;
  mainBadgeName: MainBadgeName;
  points: number;
  skills: string[];
  moduleId: string;
}

export interface UserBadgeProgress {
  mainBadgeId: string;
  mainBadgeName: MainBadgeName;
  totalPoints: number;
  level: BadgeLevel;
  earnedSubBadges: string[];
}

/* ── Modules ─────────────────────────────────── */
export interface ModuleSession {
  weekNo: number;
  focus: string;
  subBadgeId?: string;
  sessionPlanUrl?: string;
  slidesUrl?: string;
}

export interface Module {
  id: string;
  name: string;
  game: string;
  description: string;
  durationWeeks: number;
  subBadges: SubBadge[];
  schedule: ModuleSession[];
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT';
}

/* ── Leaderboard ─────────────────────────────── */
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  centreId: string;
  centreName: string;
  totalPoints: number;
  badgeLevels: Record<MainBadgeName, BadgeLevel>;
  completedModules: number;
}

/* ── Sports / Tournaments (from LTC baseline) ── */
export interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
  scoreFields: ScoreField[];
  rankingPoints: { win: number; draw: number; loss: number };
}

export interface ScoreField {
  key: string;
  label: string;
  type: 'number' | 'time' | 'text';
}

export type TournamentStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type TournamentType = 'INDIVIDUAL' | 'TEAM';
export type ParticipantStatus = 'REGISTERED' | 'WITHDRAWN';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'WALKOVER';

export interface Tournament {
  id: string;
  name: string;
  sportId: string;
  sport?: Sport;
  description: string;
  rules?: string;
  venue: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  regStartDate: string;
  regEndDate: string;
  capacity: number;
  participantCount: number;
  minAge?: number;
  maxAge?: number;
  teamMinSize?: number;
  teamMaxSize?: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
}

export interface Participant {
  id: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  photoUrl?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundLabel: string;
  scheduledAt: string;
  venue: string;
  status: MatchStatus;
  participants: MatchParticipant[];
  score?: MatchScore;
}

export interface MatchParticipant {
  userId: string;
  displayName: string;
  attendance?: AttendanceStatus;
}

export interface MatchScore {
  winnerId?: string;
  fields: Record<string, Record<string, number | string>>;
  summary?: string;
}

export interface Team {
  id: string;
  name: string;
  tournamentId: string;
  members: { userId: string; displayName: string }[];
}

/* ── Notifications ───────────────────────────── */
export type NotificationType = 'TOURNAMENT' | 'ANNOUNCEMENT' | 'BADGE' | 'MODULE';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

/* ── Stats ────────────────────────────────────── */
export interface PlayerStats {
  tournamentsJoined: number;
  activeTournaments: number;
  completedTournaments: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  attendanceRate: number;
  badges: { id: string; name: string; icon: string; earnedAt: string }[];
  tournaments: Tournament[];
}

export interface AdminDashboard {
  totalTournaments: number;
  activeTournaments: number;
  totalPlayers: number;
  totalMatches: number;
  registrationsByTournament: { name: string; count: number }[];
  attendanceTrend: { date: string; rate: number }[];
  topPerformers: { displayName: string; wins: number }[];
  recentScores: { matchLabel: string; score: string; time: string }[];
}

/* ── Admin Imports ───────────────────────────── */
export interface SpreadsheetImportSheet {
  sheetName: string;
  tableName: string;
  headerRowNumber: number;
  dataRowCount: number;
}

export interface SpreadsheetImportResult {
  importRunId: number;
  workbookName: string;
  dropExisting: boolean;
  importedSheets: number;
  importedRows: number;
  sheets: SpreadsheetImportSheet[];
  message: string;
}
