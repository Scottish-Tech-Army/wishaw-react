import usersData from './data/users.json';
import centresData from './data/centres.json';
import badgesData from './data/badges.json';
import modulesData from './data/modules.json';
import tournamentsData from './data/tournaments.json';
import type {
  AuthResponse, User, Profile, Centre, Group, MainBadge, SubBadge,
  UserBadgeProgress, Module, Sport, Tournament, Participant, Match,
  LeaderboardEntry, Notification, PlayerStats, AdminDashboard, SpreadsheetImportResult,
} from '../types';

function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function generateToken(): string {
  return `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const DEFAULT_SPORT_ICON = '\u{1F3CF}';

function resolveSportIcon(icon?: string): string {
  return typeof icon === 'string' && icon.trim().length > 0 ? icon.trim() : DEFAULT_SPORT_ICON;
}

let currentUserId: string | null = null;

const notifications: Notification[] = [
  { id: 'n1', type: 'TOURNAMENT', title: 'New Tournament', message: 'Wishaw Rocket League Cup is now open for registration!', isRead: false, createdAt: '2026-03-25T12:00:00Z', linkTo: '/tournaments/t1' },
  { id: 'n2', type: 'BADGE', title: 'Badge Earned!', message: 'You earned the Skill Evaluation sub-badge!', isRead: false, createdAt: '2026-03-24T15:00:00Z' },
  { id: 'n3', type: 'MODULE', title: 'Module Update', message: 'Road to Diamond module week 8 is coming up.', isRead: true, createdAt: '2026-03-23T09:00:00Z', linkTo: '/modules/m1' },
];

export const mockApi = {
  /* ── Auth ──────────────────────────── */
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    const u = usersData.users.find((x) => x.email === email && x.password === password);
    if (!u) throw new Error('Invalid email or password');
    currentUserId = u.id;
    const profile = usersData.profiles[u.id as keyof typeof usersData.profiles] as unknown as Profile;
    return { accessToken: generateToken(), refreshToken: generateToken(), user: { id: u.id, email: u.email, role: u.role as User['role'], centreId: u.centreId }, profile };
  },

  async register(data: { email: string; password: string; displayName: string; firstName: string; lastName: string }): Promise<AuthResponse> {
    await delay();
    const id = `u${Date.now()}`;
    currentUserId = id;
    const user: User = { id, email: data.email, role: 'PLAYER', centreId: 'c1' };
    const profile: Profile = { displayName: data.displayName, firstName: data.firstName, lastName: data.lastName, bio: '', photoUrl: undefined, overlayTemplate: undefined, privacy: { showInPublicList: true, allowSocialSharing: true } };
    return { accessToken: generateToken(), refreshToken: generateToken(), user, profile };
  },

  async logout(): Promise<void> {
    await delay(50);
    currentUserId = null;
  },

  async getMe(): Promise<{ user: User; profile: Profile }> {
    await delay();
    const u = usersData.users.find((x) => x.id === currentUserId) ?? usersData.users[1];
    currentUserId = u.id;
    const profile = usersData.profiles[u.id as keyof typeof usersData.profiles] as unknown as Profile;
    return { user: { id: u.id, email: u.email, role: u.role as User['role'], centreId: u.centreId }, profile };
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    await delay(50);
    return { accessToken: generateToken(), refreshToken: generateToken() };
  },

  /* ── Profile ──────────────────────── */
  async getProfile(): Promise<Profile> {
    await delay();
    const uid = currentUserId ?? 'u2';
    return usersData.profiles[uid as keyof typeof usersData.profiles] as unknown as Profile;
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    await delay();
    const uid = currentUserId ?? 'u2';
    const existing = usersData.profiles[uid as keyof typeof usersData.profiles] as unknown as Profile;
    return { ...existing, ...data };
  },

  async uploadPhoto(_file: File): Promise<{ photoUrl: string }> {
    await delay(300);
    return { photoUrl: '/mock-avatar.png' };
  },

  async uploadSpreadsheetImport(file: File, options: { dropExisting?: boolean } = {}): Promise<SpreadsheetImportResult> {
    await delay(600);
    return {
      importRunId: Date.now(),
      workbookName: file.name || 'uploaded-workbook',
      dropExisting: options.dropExisting ?? true,
      importedSheets: 1,
      importedRows: 12,
      sheets: [
        {
          sheetName: 'Sheet1',
          tableName: 'IMPORT_SHEET1',
          headerRowNumber: 1,
          dataRowCount: 12,
        },
      ],
      message: 'Mock spreadsheet import completed successfully',
    };
  },

  async setOverlay(template: string): Promise<{ overlayTemplate: string }> {
    await delay();
    return { overlayTemplate: template };
  },

  /* ── Centres & Groups ─────────────── */
  async getCentres(): Promise<Centre[]> {
    await delay();
    return centresData.centres as Centre[];
  },

  async getGroups(centreId?: string): Promise<Group[]> {
    await delay();
    const groups = centresData.groups as Group[];
    return centreId ? groups.filter((g) => g.centreId === centreId) : groups;
  },

  /* ── Badges ────────────────────────── */
  async getMainBadges(): Promise<MainBadge[]> {
    await delay();
    return badgesData.mainBadges as MainBadge[];
  },

  async getSubBadges(moduleId?: string): Promise<SubBadge[]> {
    await delay();
    const subs = badgesData.subBadges as SubBadge[];
    return moduleId ? subs.filter((s) => s.moduleId === moduleId) : subs;
  },

  async getUserBadgeProgress(userId: string): Promise<UserBadgeProgress[]> {
    await delay();
    return (badgesData.userBadgeProgress as Record<string, UserBadgeProgress[]>)[userId] ?? [];
  },

  async awardSubBadge(_userId: string, _subBadgeId: string): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  /* ── Modules ───────────────────────── */
  async getModules(): Promise<Module[]> {
    await delay();
    const mods = modulesData.modules as unknown as Module[];
    return mods.map((m) => ({ ...m, subBadges: (badgesData.subBadges as SubBadge[]).filter((s) => s.moduleId === m.id) }));
  },

  async getModule(id: string): Promise<Module | undefined> {
    await delay();
    const m = (modulesData.modules as unknown as Module[]).find((x) => x.id === id);
    if (!m) return undefined;
    return { ...m, subBadges: (badgesData.subBadges as SubBadge[]).filter((s) => s.moduleId === id) };
  },

  /* ── Sports ────────────────────────── */
  async getSports(): Promise<Sport[]> {
    await delay();
    return tournamentsData.sports as unknown as Sport[];
  },

  async createSport(data: Partial<Sport>): Promise<Sport> {
    await delay();
    return { id: `s${Date.now()}`, name: '', description: '', scoreFields: [], rankingPoints: { win: 3, draw: 1, loss: 0 }, ...data, icon: resolveSportIcon(data.icon) } as Sport;
  },

  async updateSport(id: string, data: Partial<Sport>): Promise<Sport> {
    await delay();
    const s = (tournamentsData.sports as unknown as Sport[]).find((x) => x.id === id);
    return { ...s, ...data, icon: resolveSportIcon(data.icon ?? s?.icon) } as Sport;
  },

  async deleteSport(_id: string): Promise<void> {
    await delay();
  },

  /* ── Tournaments ───────────────────── */
  async getTournaments(_filters?: Record<string, string>): Promise<{ tournaments: Tournament[]; total: number }> {
    await delay();
    const list = tournamentsData.tournaments as unknown as Tournament[];
    return { tournaments: list, total: list.length };
  },

  async getTournament(id: string): Promise<Tournament | undefined> {
    await delay();
    return (tournamentsData.tournaments as unknown as Tournament[]).find((t) => t.id === id);
  },

  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    await delay();
    return { id: `t${Date.now()}`, status: 'DRAFT', participantCount: 0, ...data } as Tournament;
  },

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
    await delay();
    const t = (tournamentsData.tournaments as unknown as Tournament[]).find((x) => x.id === id);
    return { ...t, ...data } as Tournament;
  },

  async publishTournament(id: string): Promise<Tournament> {
    await delay();
    const t = (tournamentsData.tournaments as unknown as Tournament[]).find((x) => x.id === id);
    return { ...t, status: 'PUBLISHED' } as Tournament;
  },

  async cancelTournament(id: string): Promise<Tournament> {
    await delay();
    const t = (tournamentsData.tournaments as unknown as Tournament[]).find((x) => x.id === id);
    return { ...t, status: 'CANCELLED' } as Tournament;
  },

  async completeTournament(id: string): Promise<Tournament> {
    await delay();
    const t = (tournamentsData.tournaments as unknown as Tournament[]).find((x) => x.id === id);
    return { ...t, status: 'COMPLETED' } as Tournament;
  },

  async joinTournament(_id: string): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async leaveTournament(_id: string): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async getParticipants(tournamentId: string): Promise<Participant[]> {
    await delay();
    return ((tournamentsData.participants as Record<string, Participant[]>)[tournamentId]) ?? [];
  },

  /* ── Matches ───────────────────────── */
  async getMatches(tournamentId: string): Promise<Match[]> {
    await delay();
    return ((tournamentsData.matches as unknown as Record<string, Match[]>)[tournamentId]) ?? [];
  },

  async getMatch(id: string): Promise<Match | undefined> {
    await delay();
    for (const arr of Object.values(tournamentsData.matches as unknown as Record<string, Match[]>)) {
      const m = arr.find((x) => x.id === id);
      if (m) return m;
    }
    return undefined;
  },

  async createMatch(data: Partial<Match>): Promise<Match> {
    await delay();
    return { id: `match${Date.now()}`, status: 'SCHEDULED', participants: [], ...data } as Match;
  },

  async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    await delay();
    return { id, ...data } as Match;
  },

  async submitScore(_matchId: string, _data: unknown): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async markAttendance(_matchId: string, _records: unknown): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  /* ── Leaderboard ───────────────────── */
  async getLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]> {
    await delay();
    return ((tournamentsData.leaderboard as unknown as Record<string, LeaderboardEntry[]>)[tournamentId]) ?? [];
  },

  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay();
    return (tournamentsData.leaderboard as unknown as Record<string, LeaderboardEntry[]>)['t1'] ?? [];
  },

  /* ── Badges (LTC-style) ───────────── */
  async getBadges(): Promise<{ id: string; name: string; icon: string; description: string }[]> {
    await delay();
    return badgesData.mainBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon, description: b.description }));
  },

  async createBadge(data: { name: string; icon: string; description: string }): Promise<{ id: string; name: string; icon: string; description: string }> {
    await delay();
    return { id: `badge${Date.now()}`, ...data };
  },

  async assignBadge(_data: { badgeId: string; userId: string }): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async getUserBadges(_userId: string): Promise<{ id: string; name: string; icon: string; earnedAt: string }[]> {
    await delay();
    return [
      { id: 'mb1', name: 'Game Mastery', icon: '🎮', earnedAt: '2026-03-01T00:00:00Z' },
      { id: 'mb2', name: 'Teamwork', icon: '🤝', earnedAt: '2026-03-05T00:00:00Z' },
    ];
  },

  /* ── Notifications ─────────────────── */
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    await delay();
    return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(50);
    const n = notifications.find((x) => x.id === id);
    if (n) n.isRead = true;
  },

  async markAllNotificationsRead(): Promise<void> {
    await delay(50);
    notifications.forEach((n) => { n.isRead = true; });
  },

  /* ── Stats ─────────────────────────── */
  async getPlayerStats(_userId: string): Promise<PlayerStats> {
    await delay();
    return {
      tournamentsJoined: 3, activeTournaments: 1, completedTournaments: 2,
      matchesPlayed: 12, wins: 7, losses: 3, draws: 2, attendanceRate: 92,
      badges: [
        { id: 'mb1', name: 'Game Mastery', icon: '🎮', earnedAt: '2026-03-01T00:00:00Z' },
        { id: 'mb2', name: 'Teamwork', icon: '🤝', earnedAt: '2026-03-05T00:00:00Z' },
      ],
      tournaments: tournamentsData.tournaments as unknown as Tournament[],
    };
  },

  async getAdminDashboard(): Promise<AdminDashboard> {
    await delay();
    return {
      totalTournaments: 2, activeTournaments: 2, totalPlayers: 30, totalMatches: 15,
      registrationsByTournament: [{ name: 'RL Cup', count: 8 }, { name: 'Fortnite', count: 12 }],
      attendanceTrend: [{ date: 'Week 1', rate: 88 }, { date: 'Week 2', rate: 92 }, { date: 'Week 3', rate: 85 }],
      topPerformers: [{ displayName: 'Player One', wins: 7 }, { displayName: 'Player Two', wins: 4 }],
      recentScores: [{ matchLabel: 'R1-M1', score: '3-1', time: '2h ago' }],
    };
  },

  async logCalories(_data: unknown): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async getUserCalories(_userId: string): Promise<{ total: number; bySport: Record<string, number> }> {
    await delay();
    return { total: 1250, bySport: { 'Rocket League': 500, 'Fortnite': 750 } };
  },

  /* ── Teams ─────────────────────────── */
  async getTeams(_tournamentId: string): Promise<{ id: string; name: string; members: { userId: string; displayName: string }[] }[]> {
    await delay();
    return [
      { id: 'team1', name: 'Team Alpha', members: [{ userId: 'u2', displayName: 'Player One' }] },
    ];
  },

  async createTeam(data: { name: string; tournamentId: string }): Promise<{ id: string; name: string; members: never[] }> {
    await delay();
    return { id: `team${Date.now()}`, name: data.name, members: [] };
  },

  async addTeamMember(_teamId: string, _userId: string): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async removeTeamMember(_teamId: string, _userId: string): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  /* ── Announcements / Gallery / Share ── */
  async createAnnouncement(_data: unknown): Promise<{ success: boolean }> {
    await delay();
    return { success: true };
  },

  async getAnnouncements(_tournamentId: string): Promise<{ title: string; message: string; createdAt: string }[]> {
    await delay();
    return [{ title: 'Welcome!', message: 'Tournament begins soon.', createdAt: '2026-03-30T12:00:00Z' }];
  },

  async getGallery(_tournamentId: string): Promise<never[]> {
    await delay();
    return [];
  },

  async getShareData(_type: string, _id: string): Promise<{ title: string; description: string; url: string }> {
    await delay();
    return { title: 'Tournament', description: 'Check out this tournament!', url: window.location.href };
  },

  async getScore(_matchId: string): Promise<null> {
    await delay();
    return null;
  },

  async getScoreAudit(_matchId: string): Promise<never[]> {
    await delay();
    return [];
  },
};
