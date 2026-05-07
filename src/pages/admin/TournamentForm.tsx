import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, Swords, Trophy, Users, WandSparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Loading } from '../../components/ui';
import api from '../../services/api';
import type { Sport, Tournament, TournamentType } from '../../types';
import { shiftDateTimeLocalValue, toDateTimeLocalValue } from '../../utils/date-time';

type TournamentFormState = {
  name: string;
  sportId: string;
  description: string;
  rules: string;
  venue: string;
  type: TournamentType;
  startDate: string;
  endDate: string;
  regStartDate: string;
  regEndDate: string;
  capacity: number;
  minAge: number;
  maxAge: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
};

const DEFAULT_VENUES = [
  'Wishaw YMCA Esports Room 1',
  'Wishaw YMCA Esports Room 2',
  'Wishaw YMCA Main Hall',
  'Wishaw YMCA Studio',
  'Gachibowli Indoor Arena',
  'Community Sports Hall',
  'Online Lobby',
];

function createDefaultForm(): TournamentFormState {
  const now = new Date();
  const startDate = toDateTimeLocalValue(now);
  return {
    name: '',
    sportId: '',
    description: '',
    rules: '',
    venue: DEFAULT_VENUES[0],
    type: 'INDIVIDUAL',
    startDate,
    endDate: shiftDateTimeLocalValue(startDate, 120),
    regStartDate: startDate,
    regEndDate: startDate,
    capacity: 16,
    minAge: 0,
    maxAge: 0,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
  };
}

function getCapacityPresets(sportName: string | undefined, type: TournamentType): number[] {
  const normalizedSport = (sportName || '').toLowerCase();

  if (type === 'TEAM') {
    return normalizedSport.includes('cricket') ? [2, 4, 6, 8] : [4, 8, 12, 16];
  }

  if (normalizedSport.includes('cricket')) {
    return [11, 22, 33, 44];
  }
  if (normalizedSport.includes('rocket')) {
    return [8, 16, 24, 32];
  }
  if (normalizedSport.includes('football') || normalizedSport.includes('fifa') || normalizedSport.includes('soccer')) {
    return [8, 16, 24, 32];
  }

  return [8, 16, 24, 32];
}

function getVenueSuggestions(sportName: string | undefined): string[] {
  const normalizedSport = (sportName || '').toLowerCase();
  if (normalizedSport.includes('cricket')) {
    return ['Gachibowli Indoor Arena', 'Community Sports Hall', 'Outdoor Practice Nets'];
  }
  if (normalizedSport.includes('rocket')) {
    return ['Wishaw YMCA Esports Room 1', 'Wishaw YMCA Esports Room 2', 'Online Lobby'];
  }
  if (normalizedSport.includes('football') || normalizedSport.includes('fifa') || normalizedSport.includes('soccer')) {
    return ['Wishaw YMCA Main Hall', 'Esports Stage Alpha', 'Online Lobby'];
  }
  return DEFAULT_VENUES;
}

export default function TournamentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [existingTournaments, setExistingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TournamentFormState>(createDefaultForm);

  useEffect(() => {
    const load = async () => {
      const [sportsResponse, tournamentResponse, tournament] = await Promise.all([
        api.getSports(),
        api.getTournaments(),
        id ? api.getTournament(id) : Promise.resolve(null),
      ]);

      setSports(sportsResponse);
      setExistingTournaments(tournamentResponse.tournaments);

      if (tournament) {
        setForm({
          name: tournament.name,
          sportId: tournament.sportId,
          description: tournament.description,
          rules: tournament.rules || '',
          venue: tournament.venue,
          type: tournament.type,
          startDate: toDateTimeLocalValue(tournament.startDate),
          endDate: toDateTimeLocalValue(tournament.endDate),
          regStartDate: toDateTimeLocalValue(tournament.regStartDate),
          regEndDate: toDateTimeLocalValue(tournament.regEndDate),
          capacity: tournament.capacity,
          minAge: tournament.minAge ?? 0,
          maxAge: tournament.maxAge ?? 0,
          pointsWin: tournament.pointsWin,
          pointsDraw: tournament.pointsDraw,
          pointsLoss: tournament.pointsLoss,
        });
      }
    };

    load().finally(() => setLoading(false));
  }, [id]);

  const selectedSport = sports.find((sport) => sport.id === form.sportId);

  const venueOptions = useMemo(() => {
    const tournamentVenues = existingTournaments.map((tournament) => tournament.venue).filter(Boolean);
    return Array.from(new Set([...DEFAULT_VENUES, ...getVenueSuggestions(selectedSport?.name), ...tournamentVenues]));
  }, [existingTournaments, selectedSport?.name]);

  const capacityPresets = useMemo(
    () => getCapacityPresets(selectedSport?.name, form.type),
    [selectedSport?.name, form.type],
  );

  const capacityLabel = form.type === 'TEAM' ? 'Maximum teams' : 'Maximum players';
  const capacityHint = form.type === 'TEAM'
    ? `Use team counts for ${selectedSport?.name || 'this sport'} and keep brackets easy to schedule.`
    : `Set the player cap for ${selectedSport?.name || 'this sport'} using the quick presets below.`;

  const setText = (key: keyof TournamentFormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setNumber = (key: keyof TournamentFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setForm((current) => ({ ...current, [key]: Number.isNaN(value) ? 0 : value }));
  };

  const setType = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TournamentType;
    setForm((current) => ({
      ...current,
      type: value,
      capacity: getCapacityPresets(selectedSport?.name, value)[1] || current.capacity,
    }));
  };

  const applySchedulePreset = (preset: 'now' | 'tomorrow' | 'next-week') => {
    const now = new Date();
    const start = new Date(now);
    if (preset === 'tomorrow') {
      start.setDate(start.getDate() + 1);
      start.setHours(18, 0, 0, 0);
    }
    if (preset === 'next-week') {
      start.setDate(start.getDate() + 7);
      start.setHours(18, 0, 0, 0);
    }

    const startDate = toDateTimeLocalValue(start);
    const registrationStart = toDateTimeLocalValue(now);
    const registrationEnd = preset === 'now'
      ? registrationStart
      : toDateTimeLocalValue(new Date(start.getTime() - 24 * 60 * 60000));

    setForm((current) => ({
      ...current,
      startDate,
      endDate: shiftDateTimeLocalValue(startDate, 120),
      regStartDate: registrationStart,
      regEndDate: registrationEnd,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('Tournament end must be after the start time.');
      return;
    }
    if (new Date(form.regEndDate) < new Date(form.regStartDate)) {
      toast.error('Registration deadline must be after registration opens.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        type: form.type,
        capacity: Number(form.capacity),
        minAge: Number(form.minAge) || undefined,
        maxAge: Number(form.maxAge) || undefined,
        pointsWin: Number(form.pointsWin),
        pointsDraw: Number(form.pointsDraw),
        pointsLoss: Number(form.pointsLoss),
      };

      if (id) {
        await api.updateTournament(id, payload);
        toast.success('Tournament updated');
      } else {
        await api.createTournament(payload);
        toast.success('Tournament created');
      }
      navigate('/admin/tournaments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tournament');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-header">{id ? 'Edit Tournament' : 'Create Tournament'}</h1>
          <p className="mt-1 text-sm text-surface-400">
            Configure the schedule, registration window, venue, and bracket size in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={() => applySchedulePreset('now')}>
            <Clock3 className="mr-2 inline h-4 w-4" />
            Start now
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => applySchedulePreset('tomorrow')}>
            <CalendarDays className="mr-2 inline h-4 w-4" />
            Tomorrow evening
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => applySchedulePreset('next-week')}>
            <WandSparkles className="mr-2 inline h-4 w-4" />
            Next week
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="section-title">Tournament basics</h2>
              <p className="text-sm text-surface-400">Name the event, choose the sport, and set how players or teams enter.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Tournament name</label>
              <input className="input" value={form.name} onChange={setText('name')} required placeholder="Spring Rocket League Open" />
            </div>

            <div>
              <label className="label">Sport</label>
              <select className="input" value={form.sportId} onChange={setText('sportId')} required>
                <option value="">Select a sport</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>{sport.icon} {sport.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tournament format</label>
              <div className="relative">
                <select className="input appearance-none pr-10" value={form.type} onChange={setType}>
                  <option value="INDIVIDUAL">Individual entries</option>
                  <option value="TEAM">Team entries</option>
                </select>
                <Swords className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              </div>
            </div>

            <div>
              <label className="label">Venue</label>
              <div className="relative">
                <input
                  list="venue-options"
                  className="input pr-10"
                  value={form.venue}
                  onChange={setText('venue')}
                  required
                  placeholder="Choose or type a venue"
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <datalist id="venue-options">
                  {venueOptions.map((venue) => (
                    <option key={venue} value={venue} />
                  ))}
                </datalist>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {venueOptions.slice(0, 5).map((venue) => (
                  <button
                    key={venue}
                    type="button"
                    className="badge-neutral"
                    onClick={() => setForm((current) => ({ ...current, venue }))}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-28" value={form.description} onChange={setText('description')} placeholder="Tell players what the tournament is about." />
          </div>

          <div>
            <label className="label">Rules and notes</label>
            <textarea className="input min-h-24" value={form.rules} onChange={setText('rules')} placeholder="Bracket format, match rules, check-in guidance, or hardware notes." />
          </div>
        </section>

        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="section-title">Schedule and registration</h2>
              <p className="text-sm text-surface-400">New tournaments default to the current timestamp so you can adjust from a realistic starting point.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Tournament start</label>
              <input type="datetime-local" className="input" value={form.startDate} onChange={setText('startDate')} required />
            </div>
            <div>
              <label className="label">Tournament end</label>
              <input type="datetime-local" className="input" value={form.endDate} min={form.startDate} onChange={setText('endDate')} required />
            </div>
            <div>
              <label className="label">Registration opens</label>
              <input type="datetime-local" className="input" value={form.regStartDate} onChange={setText('regStartDate')} required />
            </div>
            <div>
              <label className="label">Registration deadline</label>
              <input type="datetime-local" className="input" value={form.regEndDate} min={form.regStartDate} onChange={setText('regEndDate')} required />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" className="badge-primary" onClick={() => setForm((current) => ({ ...current, regStartDate: current.startDate }))}>
              Registration opens at tournament start
            </button>
            <button type="button" className="badge-primary" onClick={() => setForm((current) => ({ ...current, regEndDate: shiftDateTimeLocalValue(current.startDate, -60) }))}>
              Deadline 1 hour before start
            </button>
            <button type="button" className="badge-primary" onClick={() => setForm((current) => ({ ...current, endDate: shiftDateTimeLocalValue(current.startDate, 120) }))}>
              Make it a 2 hour event
            </button>
          </div>
        </section>

        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="section-title">Entry limits and scoring</h2>
              <p className="text-sm text-surface-400">Capacity labels and presets adapt to the sport and entry format.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">{capacityLabel}</label>
              <input type="number" min={1} className="input" value={form.capacity} onChange={setNumber('capacity')} required />
              <p className="mt-2 text-xs text-surface-400">{capacityHint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {capacityPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`badge-neutral ${form.capacity === preset ? 'ring-1 ring-primary-400/40' : ''}`}
                    onClick={() => setForm((current) => ({ ...current, capacity: preset }))}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Age restrictions</label>
                <p className="text-xs text-surface-400 mb-2">Set minimum and/or maximum age for participants. Leave at 0 for no restriction.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-400">Minimum age</label>
                    <input type="number" min={0} max={99} className="input" value={form.minAge} onChange={setNumber('minAge')} placeholder="No min" />
                  </div>
                  <div>
                    <label className="text-xs text-surface-400">Maximum age</label>
                    <input type="number" min={0} max={99} className="input" value={form.maxAge} onChange={setNumber('maxAge')} placeholder="No max" />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={`badge-neutral ${form.minAge === 0 && form.maxAge === 0 ? 'ring-1 ring-primary-400/40' : ''}`} onClick={() => setForm((c) => ({ ...c, minAge: 0, maxAge: 0 }))}>Open to all</button>
                  <button type="button" className={`badge-neutral ${form.minAge === 12 && form.maxAge === 17 ? 'ring-1 ring-primary-400/40' : ''}`} onClick={() => setForm((c) => ({ ...c, minAge: 12, maxAge: 17 }))}>Under 18 (12-17)</button>
                  <button type="button" className={`badge-neutral ${form.minAge === 18 && form.maxAge === 0 ? 'ring-1 ring-primary-400/40' : ''}`} onClick={() => setForm((c) => ({ ...c, minAge: 18, maxAge: 0 }))}>Adults only (18+)</button>
                  <button type="button" className={`badge-neutral ${form.minAge === 8 && form.maxAge === 12 ? 'ring-1 ring-primary-400/40' : ''}`} onClick={() => setForm((c) => ({ ...c, minAge: 8, maxAge: 12 }))}>Juniors (8-12)</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Points for win</label>
                <input type="number" className="input" value={form.pointsWin} onChange={setNumber('pointsWin')} />
              </div>
              <div>
                <label className="label">Points for draw</label>
                <input type="number" className="input" value={form.pointsDraw} onChange={setNumber('pointsDraw')} />
              </div>
              <div>
                <label className="label">Points for loss</label>
                <input type="number" className="input" value={form.pointsLoss} onChange={setNumber('pointsLoss')} />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/tournaments')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update tournament' : 'Create tournament')}
          </button>
        </div>
      </form>
    </div>
  );
}