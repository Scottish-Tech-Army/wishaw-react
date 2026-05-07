import { env } from '../config/env';
import type { SpreadsheetImportResult } from '../types';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/token';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apiBaseUrl;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${getAccessToken()}`;
          response = await fetch(url, { ...options, headers });
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const rt = getRefreshToken();
    if (!rt) return false;
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }),
      });
      if (!response.ok) { clearTokens(); return false; }
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch { clearTokens(); return false; }
  }

  login(email: string, password: string) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
  register(data: unknown) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  logout() { return this.request('/auth/logout', { method: 'POST' }); }
  getMe() { return this.request('/auth/me'); }
  getProfile() { return this.request('/profile'); }
  updateProfile(data: unknown) { return this.request('/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  getSports() { return this.request('/sports'); }
  createSport(data: unknown) { return this.request('/sports', { method: 'POST', body: JSON.stringify(data) }); }
  updateSport(id: string, data: unknown) { return this.request(`/sports/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteSport(id: string) { return this.request(`/sports/${id}`, { method: 'DELETE' }); }
  getTournaments(filters?: Record<string, string>) { const p = filters ? `?${new URLSearchParams(filters)}` : ''; return this.request(`/tournaments${p}`); }
  getTournament(id: string) { return this.request(`/tournaments/${id}`); }
  createTournament(data: unknown) { return this.request('/tournaments', { method: 'POST', body: JSON.stringify(data) }); }
  updateTournament(id: string, data: unknown) { return this.request(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  publishTournament(id: string) { return this.request(`/tournaments/${id}/publish`, { method: 'POST' }); }
  cancelTournament(id: string) { return this.request(`/tournaments/${id}/cancel`, { method: 'POST' }); }
  completeTournament(id: string) { return this.request(`/tournaments/${id}/complete`, { method: 'POST' }); }
  joinTournament(id: string) { return this.request(`/tournaments/${id}/join`, { method: 'POST' }); }
  leaveTournament(id: string) { return this.request(`/tournaments/${id}/leave`, { method: 'DELETE' }); }
  getParticipants(id: string) { return this.request(`/tournaments/${id}/participants`); }
  getMatches(id: string) { return this.request(`/matches/tournament/${id}`); }
  getMatch(id: string) { return this.request(`/matches/${id}`); }
  createMatch(data: unknown) { return this.request('/matches', { method: 'POST', body: JSON.stringify(data) }); }
  updateMatch(id: string, data: unknown) { return this.request(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  submitScore(matchId: string, data: unknown) { return this.request(`/matches/${matchId}/score`, { method: 'POST', body: JSON.stringify(data) }); }
  markAttendance(matchId: string, records: unknown) { return this.request(`/matches/${matchId}/attendance`, { method: 'POST', body: JSON.stringify({ records }) }); }
  getLeaderboard(id: string) { return this.request(`/leaderboard/tournament/${id}`); }
  getBadges() { return this.request('/leaderboard/badges'); }
  createBadge(data: unknown) { return this.request('/leaderboard/badges', { method: 'POST', body: JSON.stringify(data) }); }
  assignBadge(data: unknown) { return this.request('/leaderboard/badges/assign', { method: 'POST', body: JSON.stringify(data) }); }
  getUserBadges(userId: string) { return this.request(`/leaderboard/badges/user/${userId}`); }
  logCalories(data: unknown) { return this.request('/leaderboard/calories', { method: 'POST', body: JSON.stringify(data) }); }
  getUserCalories(userId: string) { return this.request(`/leaderboard/calories/user/${userId}`); }
  getPlayerStats(userId: string) { return this.request(`/stats/player/${userId}`); }
  getAdminDashboard() { return this.request('/stats/admin/dashboard'); }
  getNotifications() { return this.request('/notifications'); }
  markNotificationRead(id: string) { return this.request(`/notifications/${id}/read`, { method: 'PUT' }); }
  markAllNotificationsRead() { return this.request('/notifications/read-all', { method: 'PUT' }); }
  createAnnouncement(data: unknown) { return this.request('/notifications/announcements', { method: 'POST', body: JSON.stringify(data) }); }
  getAnnouncements(id: string) { return this.request(`/notifications/announcements/tournament/${id}`); }
  getTeams(id: string) { return this.request(`/teams/tournament/${id}`); }
  createTeam(data: unknown) { return this.request('/teams', { method: 'POST', body: JSON.stringify(data) }); }
  getModules() { return this.request('/modules'); }
  getModule(id: string) { return this.request(`/modules/${id}`); }
  getMainBadges() { return this.request('/badges/main'); }
  getSubBadges(moduleId?: string) { const p = moduleId ? `?moduleId=${moduleId}` : ''; return this.request(`/badges/sub${p}`); }
  getUserBadgeProgress(userId: string) { return this.request(`/badges/progress/${userId}`); }
  awardSubBadge(userId: string, subBadgeId: string) { return this.request('/badges/award', { method: 'POST', body: JSON.stringify({ userId, subBadgeId }) }); }
  getCentres() { return this.request('/centres'); }
  getGroups(centreId?: string) { const p = centreId ? `?centreId=${centreId}` : ''; return this.request(`/groups${p}`); }
  getGlobalLeaderboard() { return this.request('/leaderboard/global'); }
  getScore(matchId: string) { return this.request(`/matches/${matchId}/score`); }
  getScoreAudit(matchId: string) { return this.request(`/matches/${matchId}/score/audit`); }
  getShareData(type: string, id: string) { return this.request(`/notifications/share/${type}/${id}`); }
  getGallery(id: string) { return this.request(`/notifications/gallery/tournament/${id}`); }
  uploadPhoto(file: File) {
    const fd = new FormData(); fd.append('photo', file);
    const token = getAccessToken();
    return fetch(`${this.baseUrl}/profile/photo`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }).then(r => r.json());
  }
  uploadSpreadsheetImport(file: File, options: { dropExisting?: boolean } = {}): Promise<SpreadsheetImportResult> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('dropExisting', String(options.dropExisting ?? true));
    const token = getAccessToken();
    return fetch(`${this.baseUrl}/admin/imports/spreadsheets`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }).then(async (response) => {
      const data = await response.json().catch(() => ({ error: 'Request failed' }));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    });
  }
  setOverlay(template: string) { return this.request('/profile/photo/overlay', { method: 'POST', body: JSON.stringify({ template }) }); }
}

export const realApi = new ApiClient();
