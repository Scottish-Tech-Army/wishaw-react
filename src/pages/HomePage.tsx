import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Trophy,
  Upload,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Loading } from '../components/ui';
import api from '../services/api';
import { useAuthStore } from '../store/auth-store';
import type { Tournament, UserBadgeProgress } from '../types';
import { BADGE_LEVEL_COLORS, getBadgeLevel } from '../utils/badge-levels';

type FeatureSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
  glowClassName: string;
  highlights: { label: string; value: string }[];
  bullets: string[];
  ctaLabel?: string;
  ctaPath?: string;
  adminOnly?: boolean;
};

export default function HomePage() {
  const { user, profile, isAdmin } = useAuthStore();
  const [badgeProgress, setBadgeProgress] = useState<UserBadgeProgress[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const isUserAdmin = isAdmin();

  useEffect(() => {
    let cancelled = false;

    const loadHomePage = async () => {
      setLoading(true);
      setError(null);

      try {
        const badgePromise = user ? api.getUserBadgeProgress(user.id) : Promise.resolve([]);
        const tournamentPromise = api.getTournaments().then((response) => response.tournaments.slice(0, 4));

        const [badgeData, tournamentData] = await Promise.all([badgePromise, tournamentPromise]);

        if (cancelled) {
          return;
        }

        setBadgeProgress(badgeData);
        setTournaments(tournamentData);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error('Error fetching homepage data:', loadError);
        setError("Sorry, we couldn't load the dashboard data. Please try again.");
        setBadgeProgress([]);
        setTournaments([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHomePage();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalPoints = badgeProgress.reduce((sum, badge) => sum + badge.totalPoints, 0);
  const activeBadges = badgeProgress.filter((badge) => badge.level !== 'None').length;
  const earnedSubBadges = badgeProgress.reduce((sum, badge) => sum + badge.earnedSubBadges.length, 0);
  const publishedTournaments = tournaments.filter((tournament) => tournament.status === 'PUBLISHED').length;

  const featureSlides: FeatureSlide[] = [
    {
      id: 'progress-engine',
      eyebrow: 'Player Growth Engine',
      title: 'Badges, modules, and XP now move as one system',
      description:
        'Players can track growth at a glance, earn sub-badges through modules, and carry progress into competitive play.',
      icon: Award,
      accentClassName: 'from-amber-400/30 via-orange-400/10 to-transparent',
      glowClassName: 'bg-amber-400/15 text-amber-200 border-amber-300/20',
      highlights: [
        { label: 'Total XP', value: String(totalPoints) },
        { label: 'Active badge tracks', value: String(activeBadges) },
        { label: 'Sub-badges earned', value: String(earnedSubBadges) },
      ],
      bullets: [
        'Badge levels are visible from the dashboard and badge journey views.',
        'Modules feed directly into sub-badge progress instead of living in a separate silo.',
        'Players always have a clear next step between learning, attendance, and recognition.',
      ],
      ctaLabel: 'See Badge Journey',
      ctaPath: '/badges',
    },
    {
      id: 'competition-control',
      eyebrow: 'Competition Control',
      title: 'Tournament flows are tighter, safer, and role-aware',
      description:
        'Publishing is locked to admins, successful actions disable duplicate clicks, and participant counts stay aligned to registered players.',
      icon: ShieldCheck,
      accentClassName: 'from-cyan-400/30 via-sky-400/10 to-transparent',
      glowClassName: 'bg-cyan-400/15 text-cyan-200 border-cyan-300/20',
      highlights: [
        { label: 'Admin publishing', value: 'Role-locked' },
        { label: 'Join state', value: 'Auto-disabled' },
        { label: 'Live competitions', value: String(publishedTournaments) },
      ],
      bullets: [
        'Admins control launch and status transitions without exposing publish actions to players.',
        'Buttons lock after successful actions so users do not double-submit tournament state changes.',
        'Participant totals ignore withdrawn entries and stay aligned to registered users.',
      ],
      ctaLabel: 'Browse Tournaments',
      ctaPath: '/tournaments',
    },
    {
      id: 'ops-import',
      eyebrow: 'Admin Ops And Data',
      title: 'Import Lab pushes spreadsheet uploads straight into H2',
      description:
        'Admins can upload spreadsheets from the app, trigger the migration flow from the UI, and review the imported sheet summary without leaving the dashboard.',
      icon: Upload,
      accentClassName: 'from-emerald-400/30 via-teal-400/10 to-transparent',
      glowClassName: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/20',
      highlights: [
        { label: 'Upload source', value: 'Spreadsheet-ready' },
        { label: 'Migration target', value: 'H2 tables' },
        { label: 'Access', value: 'Admin-only' },
      ],
      bullets: [
        'Import Lab lives in the admin navigation and sends files straight to the migration service.',
        'The backend now reuses the same spreadsheet import logic for startup imports and browser uploads.',
        'Role checks block player access to import actions while keeping the admin workflow fast.',
      ],
      ctaLabel: 'Open Import Lab',
      ctaPath: '/admin/import-lab',
      adminOnly: true,
    },
  ];

  const visibleSlides = isUserAdmin ? featureSlides : featureSlides.filter((slide) => !slide.adminOnly);

  useEffect(() => {
    if (visibleSlides.length === 0) {
      if (activeSlide !== 0) {
        setActiveSlide(0);
      }
      return;
    }

    if (activeSlide >= visibleSlides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, visibleSlides.length]);

  useEffect(() => {
    if (visibleSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % visibleSlides.length);
    }, 7000);

    return () => {
      window.clearInterval(interval);
    };
  }, [visibleSlides.length]);

  const goToSlide = (index: number) => setActiveSlide(index);
  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + visibleSlides.length) % visibleSlides.length);
  };
  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % visibleSlides.length);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="text-xl font-semibold text-white">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.displayName || 'Player'}!</h1>
        <p className="mt-1 text-surface-400">Track your badges, modules, and esports progress.</p>
      </div>

      {visibleSlides.length > 0 && (
        <section className="relative overflow-hidden rounded-[28px] border border-surface-700/60 bg-surface-800/90 shadow-2xl shadow-black/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_28%)]" />

          <div className="relative border-b border-surface-700/60 px-5 py-4 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-300/80">Platform Highlights</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Strongest features across player and admin flows</h2>
                <p className="mt-2 max-w-2xl text-sm text-surface-400">
                  Swipe through the badge engine, tournament controls, and the admin data pipeline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPreviousSlide}
                  className="rounded-xl border border-surface-600 bg-surface-900/70 p-2 text-surface-300 transition hover:border-surface-500 hover:text-white"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={showNextSlide}
                  className="rounded-xl border border-surface-600 bg-surface-900/70 p-2 text-surface-300 transition hover:border-surface-500 hover:text-white"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex h-[28rem] flex-col justify-between p-5 pt-6 md:h-auto md:flex-row md:p-7">
            {visibleSlides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <div
                  key={slide.id}
                  className={`w-full transition-opacity duration-500 ease-in-out ${
                    index === activeSlide ? 'opacity-100' : 'pointer-events-none absolute opacity-0'
                  }`}
                >
                  {index === activeSlide && (
                    <div className="grid h-full grid-cols-1 items-start gap-x-12 gap-y-6 md:grid-cols-2">
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${slide.glowClassName}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary-300/70">{slide.eyebrow}</p>
                          </div>
                          <h3 className="mt-4 text-3xl font-bold text-white">{slide.title}</h3>
                          <p className="mt-3 text-base text-surface-300">{slide.description}</p>
                        </div>

                        {slide.ctaPath && (
                          <div className="hidden md:block">
                            <Link
                              to={slide.ctaPath}
                              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-5 py-3 text-sm font-semibold text-primary-300 ring-1 ring-inset ring-primary-500/20 transition-colors hover:bg-primary-500/20"
                            >
                              {slide.ctaLabel}
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="relative h-full rounded-2xl border border-surface-700/60 bg-surface-900/60 p-6">
                        <div className={`absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${slide.accentClassName}`} />
                        <div className="relative space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            {slide.highlights.map((highlight) => (
                              <div key={highlight.label}>
                                <p className="text-3xl font-bold text-white">{highlight.value}</p>
                                <p className="mt-1 text-xs text-surface-400">{highlight.label}</p>
                              </div>
                            ))}
                          </div>

                          <div className="pt-4">
                            <ul className="space-y-2 text-sm text-surface-300">
                              {slide.bullets.map((bullet) => (
                                <li key={bullet} className="flex items-start gap-2.5">
                                  <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary-400/60" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {slide.ctaPath && (
                        <div className="md:hidden">
                          <Link
                            to={slide.ctaPath}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-5 py-3 text-sm font-semibold text-primary-300 ring-1 ring-inset ring-primary-500/20 transition-colors hover:bg-primary-500/20"
                          >
                            {slide.ctaLabel}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-surface-700/60 px-5 py-3 md:px-7">
            <div className="flex gap-2">
              {visibleSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    activeSlide === index ? 'bg-primary-400' : 'bg-surface-600 hover:bg-surface-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="text-xs uppercase tracking-[0.18em] text-surface-500">
              {activeSlide + 1} / {visibleSlides.length}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-surface-300">Total Points</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{totalPoints}</p>
        </div>

        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-surface-300">Active Badges</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{activeBadges}</p>
        </div>

        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-surface-300">Sub-Badges Earned</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{earnedSubBadges}</p>
        </div>

        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-surface-300">Live Tournaments</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{publishedTournaments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Award className="h-5 w-5 text-amber-400" />
            Your Badge Progress
          </h3>
          <div className="mt-4 space-y-4">
            {badgeProgress.length > 0 ? (
              badgeProgress.map((badge) => (
                <div key={badge.mainBadgeId}>
                  <div className="flex justify-between text-sm font-medium">
                    <p className="text-surface-300">{badge.mainBadgeName}</p>
                    <p className={`font-semibold ${BADGE_LEVEL_COLORS[getBadgeLevel(badge.totalPoints)]}`}>
                      {getBadgeLevel(badge.totalPoints)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-surface-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                      style={{ width: `${Math.min(100, (badge.totalPoints / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-400">No badge progress yet. Start completing modules.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-cyan-400" />
            Upcoming Tournaments
          </h3>
          <div className="mt-4 space-y-3">
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="block rounded-lg p-3 transition-colors hover:bg-surface-700/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{tournament.name}</p>
                    <p className="text-xs font-medium text-surface-400">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-surface-400">{tournament.description}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-surface-400">No upcoming tournaments scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}