/**
 * Tournaments.tsx – Tournament Listings & Management
 *
 * Features:
 *   - View upcoming, ongoing, and completed tournaments
 *   - Filter by status and game
 *   - Admin: Create and manage tournaments
 *   - View results and leaderboards
 */

import { useState, useMemo } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Gamepad2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Edit2,
  Medal,
  Play,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import { useAuth } from '../store/authContextCore';
import { useData } from '../store/dataContextCore';
import { computeAge } from '../types';
import { canJoinTournament } from '../store/dataHelpers';
import type { Tournament, TournamentStatus, TournamentFormat, Game } from '../types';

type FilterStatus = 'all' | TournamentStatus;

const STATUS_CONFIG: Record<TournamentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  upcoming: { label: 'Upcoming', color: 'var(--color-info)', icon: <Clock size={14} /> },
  ongoing: { label: 'Live', color: 'var(--color-success)', icon: <Play size={14} /> },
  completed: { label: 'Completed', color: 'var(--color-muted)', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'var(--color-danger)', icon: <XCircle size={14} /> },
};

const FORMATS: TournamentFormat[] = ['Round Robin', 'Single Elimination', 'Double Elimination', 'Swiss'];

const GAMES: Game[] = [
  'Minecraft',
  'Rocket League',
  'Fortnite',
  'Multi / Casual',
  'Broadcast & Podcast',
  'General',
];

export default function Tournaments() {
  const { currentUser, isAdmin } = useAuth();
  const { state, dispatch } = useData();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Expanded tournament
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formGame, setFormGame] = useState<Game>('Rocket League');
  const [formFormat, setFormFormat] = useState<TournamentFormat>('Single Elimination');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMinAge, setFormMinAge] = useState('');
  const [formMaxAge, setFormMaxAge] = useState('');
  const [formError, setFormError] = useState('');

  const centreId = currentUser?.centreId ?? '';

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    let tournaments = state.tournaments;

    // Show tournaments where user's centre is participating or all for admins
    if (!isAdmin) {
      tournaments = tournaments.filter(
        (t) => t.participatingCentreIds.includes(centreId) || t.participatingCentreIds.length === 0
      );
    }

    if (filterStatus !== 'all') {
      tournaments = tournaments.filter((t) => t.status === filterStatus);
    }

    // Sort: ongoing first, then upcoming, then by date
    return tournaments.sort((a, b) => {
      const statusOrder: Record<TournamentStatus, number> = {
        ongoing: 0,
        upcoming: 1,
        completed: 2,
        cancelled: 3,
      };
      const orderDiff = statusOrder[a.status] - statusOrder[b.status];
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [state.tournaments, centreId, isAdmin, filterStatus]);

  // Get centre name
  const getCentreName = (cId: string): string => {
    return state.centres.find((c) => c.id === cId)?.name ?? 'Unknown';
  };

  // Format date
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Toggle expansion
  const toggleExpand = (id: string) => {
    setExpandedTournament(expandedTournament === id ? null : id);
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormGame('Rocket League');
    setFormFormat('Single Elimination');
    setFormStartDate('');
    setFormDescription('');
    setFormMinAge('');
    setFormMaxAge('');
    setFormError('');
    setEditingTournament(null);
  };

  // Open add modal
  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (tournament: Tournament) => {
    setFormName(tournament.name);
    setFormGame(tournament.game);
    setFormFormat(tournament.format);
    setFormStartDate(tournament.startDate.split('T')[0]);
    setFormDescription(tournament.description ?? '');
    setFormMinAge(tournament.minAge !== undefined ? String(tournament.minAge) : '');
    setFormMaxAge(tournament.maxAge !== undefined ? String(tournament.maxAge) : '');
    setFormError('');
    setEditingTournament(tournament);
    setShowModal(true);
  };

  // Save tournament
  const handleSaveTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formStartDate) {
      setFormError('Please fill in all required fields');
      return;
    }

    const minAge = formMinAge ? parseInt(formMinAge, 10) : undefined;
    const maxAge = formMaxAge ? parseInt(formMaxAge, 10) : undefined;

    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      setFormError('Min age cannot be greater than max age');
      return;
    }

    if (editingTournament) {
      dispatch({
        type: 'UPDATE_TOURNAMENT',
        payload: {
          ...editingTournament,
          name: formName.trim(),
          game: formGame,
          format: formFormat,
          startDate: new Date(formStartDate).toISOString(),
          description: formDescription.trim() || undefined,
          minAge,
          maxAge,
        },
      });
    } else {
      dispatch({
        type: 'ADD_TOURNAMENT',
        payload: {
          name: formName.trim(),
          game: formGame,
          format: formFormat,
          status: 'upcoming',
          participatingCentreIds: [centreId],
          createdByAdminId: currentUser?.id ?? '',
          startDate: new Date(formStartDate).toISOString(),
          description: formDescription.trim() || undefined,
          minAge,
          maxAge,
        },
      });
    }

    setShowModal(false);
    resetForm();
  };

  // Update tournament status
  const handleUpdateStatus = (tournament: Tournament, newStatus: TournamentStatus) => {
    dispatch({
      type: 'UPDATE_TOURNAMENT',
      payload: {
        ...tournament,
        status: newStatus,
        endDate: newStatus === 'completed' ? new Date().toISOString() : tournament.endDate,
      },
    });
  };

  return (
    <PageShell title="Tournaments">
      <div className="tournaments animate-fade-in">
        {/* Header */}
        <div className="tournaments__header">
          <div className="tournaments__title-row">
            <h1 className="page-title">
              <Trophy size={24} className="page-title-icon" />
              Tournaments
            </h1>
            <div className="tournaments__actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filter
                <ChevronDown size={14} />
              </button>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                  <Plus size={16} />
                  Create
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="tournaments__filters animate-fade-in-down">
              <div className="tournaments__filter-group">
                <label className="label" htmlFor="filter-tournament-status">Status</label>
                <select
                  id="filter-tournament-status"
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                >
                  <option value="all">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tournament List */}
        <div className="tournaments__list">
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => {
              const statusConfig = STATUS_CONFIG[tournament.status];
              const isExpanded = expandedTournament === tournament.id;
              const sortedResults = tournament.results
                ? [...tournament.results].sort((a, b) => a.position - b.position)
                : [];

              return (
                <div key={tournament.id} className="tournament-card">
                  <div className="tournament-card__main">
                    <div
                      className="tournament-card__status-badge"
                      style={{ backgroundColor: statusConfig.color }}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>

                    <div className="tournament-card__info">
                      <h3 className="tournament-card__name">{tournament.name}</h3>
                      <div className="tournament-card__meta">
                        <span className="tournament-card__game">
                          <Gamepad2 size={14} />
                          {tournament.game}
                        </span>
                        <span className="tournament-card__format">
                          <Trophy size={14} />
                          {tournament.format}
                        </span>
                        <span className="tournament-card__date">
                          <Calendar size={14} />
                          {formatDate(tournament.startDate)}
                        </span>
                        <span className="tournament-card__centres">
                          <MapPin size={14} />
                          {tournament.participatingCentreIds.length} centre
                          {tournament.participatingCentreIds.length !== 1 ? 's' : ''}
                        </span>
                        {(tournament.minAge !== undefined || tournament.maxAge !== undefined) && (
                          <span className="tournament-card__age-badge">
                            <ShieldAlert size={14} />
                            {tournament.minAge !== undefined && tournament.maxAge !== undefined
                              ? `Ages ${tournament.minAge}–${tournament.maxAge}`
                              : tournament.minAge !== undefined
                                ? `Age ${tournament.minAge}+`
                                : `Age ≤${tournament.maxAge}`
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tournament-card__actions">
                      {isAdmin && tournament.status === 'upcoming' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleUpdateStatus(tournament, 'ongoing')}
                          title="Start tournament"
                        >
                          <Play size={14} />
                          Start
                        </button>
                      )}
                      {isAdmin && tournament.status === 'ongoing' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleUpdateStatus(tournament, 'completed')}
                          title="End tournament"
                        >
                          <CheckCircle size={14} />
                          End
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => handleOpenEdit(tournament)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => toggleExpand(tournament.id)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="tournament-card__expanded animate-fade-in-down">
                      {/* Age eligibility warning for non-admin users */}
                      {!isAdmin && currentUser && (() => {
                        const eligible = canJoinTournament(currentUser, tournament);
                        const userAge = computeAge(currentUser.dateOfBirth);
                        if (!eligible) {
                          return (
                            <div className="tournament-card__age-warning">
                              <AlertTriangle size={16} />
                              <span>
                                Age restriction: {tournament.minAge !== undefined && tournament.maxAge !== undefined
                                  ? `${tournament.minAge}–${tournament.maxAge} years`
                                  : tournament.minAge !== undefined
                                    ? `${tournament.minAge}+ years`
                                    : `up to ${tournament.maxAge} years`
                                }.
                                {userAge !== undefined
                                  ? ` You are ${userAge} years old.`
                                  : ' Your age is not set — contact your admin.'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {tournament.description && (
                        <p className="tournament-card__description">{tournament.description}</p>
                      )}

                      <div className="tournament-card__section">
                        <h4 className="tournament-card__section-title">
                          <Users size={16} />
                          Participating Centres
                        </h4>
                        <div className="tournament-card__centres-list">
                          {tournament.participatingCentreIds.map((cId) => (
                            <span key={cId} className="tournament-card__centre-tag">
                              {getCentreName(cId)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {sortedResults.length > 0 && (
                        <div className="tournament-card__section">
                          <h4 className="tournament-card__section-title">
                            <Medal size={16} />
                            Results
                          </h4>
                          <div className="tournament-card__results">
                            {sortedResults.map((result) => (
                              <div
                                key={result.centreId}
                                className={`tournament-result ${result.position <= 3 ? `tournament-result--place-${result.position}` : ''}`}
                              >
                                <span className="tournament-result__position">
                                  {result.position === 1 && '🥇'}
                                  {result.position === 2 && '🥈'}
                                  {result.position === 3 && '🥉'}
                                  {result.position > 3 && `#${result.position}`}
                                </span>
                                <span className="tournament-result__centre">
                                  {getCentreName(result.centreId)}
                                </span>
                                <span className="tournament-result__points">
                                  {result.points} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tournament.status === 'completed' && sortedResults.length === 0 && (
                        <p className="tournament-card__no-results">
                          Results not yet recorded.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Trophy size={48} className="empty-state-icon" />
              <p className="empty-state-title">No tournaments found</p>
              <p className="empty-state-description">
                {filterStatus !== 'all'
                  ? 'Try changing your filter.'
                  : 'Check back soon for upcoming tournaments!'}
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal modal--md animate-scale-in">
              <div className="modal__header">
                <h2 className="modal__title">
                  {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
                </h2>
                <button
                  className="modal__close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTournament} className="modal__body">
                {formError && <div className="form-error">{formError}</div>}

                <div className="form-group">
                  <label className="label label-required" htmlFor="tournament-name">
                    Tournament Name
                  </label>
                  <input
                    id="tournament-name"
                    type="text"
                    className="input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Spring Rocket League Championship"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label label-required" htmlFor="tournament-game">
                      Game
                    </label>
                    <select
                      id="tournament-game"
                      className="select"
                      value={formGame}
                      onChange={(e) => setFormGame(e.target.value as Game)}
                    >
                      {GAMES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label label-required" htmlFor="tournament-format">
                      Format
                    </label>
                    <select
                      id="tournament-format"
                      className="select"
                      value={formFormat}
                      onChange={(e) => setFormFormat(e.target.value as TournamentFormat)}
                    >
                      {FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="tournament-date">
                    Start Date
                  </label>
                  <input
                    id="tournament-date"
                    type="date"
                    className="input"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="tournament-desc">
                    Description
                  </label>
                  <textarea
                    id="tournament-desc"
                    className="textarea"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional description or rules..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="tournament-min-age">
                      Min Age
                    </label>
                    <input
                      id="tournament-min-age"
                      type="number"
                      className="input"
                      value={formMinAge}
                      onChange={(e) => setFormMinAge(e.target.value)}
                      placeholder="e.g. 8"
                      min={1}
                      max={99}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="tournament-max-age">
                      Max Age
                    </label>
                    <input
                      id="tournament-max-age"
                      type="number"
                      className="input"
                      value={formMaxAge}
                      onChange={(e) => setFormMaxAge(e.target.value)}
                      placeholder="e.g. 18"
                      min={1}
                      max={99}
                    />
                  </div>
                </div>
                <p className="form-hint">Leave blank for no age restriction.</p>

                <div className="modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTournament ? 'Save Changes' : 'Create Tournament'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
