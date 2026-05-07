import type {
  Badge,
  Centre,
  EvidenceSubmission,
  Group,
  LevelDefinition,
  Module,
  User,
  UserProgress,
} from '../types/domain'

export const levelDefinitions: LevelDefinition[] = [
  { name: 'Bronze', minXp: 0 },
  { name: 'Silver', minXp: 300 },
  { name: 'Gold', minXp: 700 },
  { name: 'Platinum', minXp: 1200 },
  { name: 'Emerald', minXp: 1800 },
  { name: 'Diamond', minXp: 2600 },
]

export const badges: Badge[] = [
  {
    id: 'badge-game-mastery',
    title: 'Game Mastery',
    description: 'Technical understanding, strategy and decision making in gameplay.',
  },
  {
    id: 'badge-teamwork',
    title: 'Teamwork',
    description: 'Collaboration, communication and shared accountability.',
  },
  {
    id: 'badge-citizen',
    title: 'Esports Citizen',
    description: 'Respectful behaviour, digital wellbeing and sportsmanship.',
  },
  {
    id: 'badge-personal',
    title: 'Personal Development',
    description: 'Resilience, growth mindset and confidence building.',
  },
  {
    id: 'badge-digital',
    title: 'Digital Skills',
    description: 'Creative tools, editing, analysis and digital literacy.',
  },
]

export const modules: Module[] = [
  {
    id: 'module-strategy-fundamentals',
    badgeId: 'badge-game-mastery',
    title: 'Strategy Fundamentals',
    description: 'Learn map control, tempo and strategic adaptation.',
    learningOutcomes: [
      'Apply map awareness principles in matches',
      'Build round-by-round adaptation plans',
      'Use VOD review to identify decision quality',
    ],
    subBadges: [
      {
        id: 'sb-map-awareness',
        title: 'Map Awareness',
        points: 60,
        xp: 120,
        skills: ['Positioning', 'Decision making'],
      },
      {
        id: 'sb-adaptation-plan',
        title: 'Adaptive Planning',
        points: 70,
        xp: 140,
        skills: ['Planning', 'Analysis'],
      },
      {
        id: 'sb-vod-review',
        title: 'VOD Reflection',
        points: 50,
        xp: 100,
        skills: ['Self-review', 'Improvement tracking'],
      },
    ],
    resources: [
      {
        id: 'res-1',
        type: 'pdf',
        title: 'Strategy Fundamentals Workbook',
        url: 'https://example.org/strategy-workbook.pdf',
      },
      {
        id: 'res-2',
        type: 'video',
        title: 'Map Control Workshop',
        url: 'https://example.org/map-control-video',
      },
    ],
  },
  {
    id: 'module-comms-leadership',
    badgeId: 'badge-teamwork',
    title: 'Comms and Leadership',
    description: 'Build clear communication and leadership under pressure.',
    learningOutcomes: [
      'Deliver concise in-game communication',
      'Use positive feedback loops within teams',
      'Lead post-match reflection sessions',
    ],
    subBadges: [
      {
        id: 'sb-clear-comms',
        title: 'Clear Comms',
        points: 55,
        xp: 110,
        skills: ['Communication', 'Confidence'],
      },
      {
        id: 'sb-constructive-feedback',
        title: 'Constructive Feedback',
        points: 65,
        xp: 130,
        skills: ['Listening', 'Coaching mindset'],
      },
      {
        id: 'sb-lead-review',
        title: 'Review Leadership',
        points: 80,
        xp: 160,
        skills: ['Leadership', 'Facilitation'],
      },
    ],
    resources: [
      {
        id: 'res-3',
        type: 'ppt',
        title: 'Team Communication Slides',
        url: 'https://example.org/team-comms.ppt',
      },
      {
        id: 'res-4',
        type: 'link',
        title: 'Feedback Framework',
        url: 'https://example.org/feedback-framework',
      },
    ],
  },
  {
    id: 'module-digital-wellbeing',
    badgeId: 'badge-citizen',
    title: 'Digital Wellbeing and Conduct',
    description: 'Promote healthy, respectful and inclusive esports behaviour.',
    learningOutcomes: [
      'Identify positive online behaviours',
      'Apply practical anti-toxicity techniques',
      'Build personal wellbeing routines',
    ],
    subBadges: [
      {
        id: 'sb-positive-play',
        title: 'Positive Play',
        points: 40,
        xp: 80,
        skills: ['Digital citizenship'],
      },
      {
        id: 'sb-conflict-resolution',
        title: 'Conflict Resolution',
        points: 60,
        xp: 120,
        skills: ['Empathy', 'Communication'],
      },
      {
        id: 'sb-wellbeing-routine',
        title: 'Wellbeing Routine',
        points: 65,
        xp: 130,
        skills: ['Self-management'],
      },
    ],
    resources: [
      {
        id: 'res-5',
        type: 'pdf',
        title: 'Healthy Play Checklist',
        url: 'https://example.org/healthy-play.pdf',
      },
    ],
  },
  {
    id: 'module-growth-mindset',
    badgeId: 'badge-personal',
    title: 'Growth Mindset in Competition',
    description: 'Improve resilience and confidence through reflective practice.',
    learningOutcomes: [
      'Set measurable weekly goals',
      'Reflect on setbacks productively',
      'Design confidence routines before tournaments',
    ],
    subBadges: [
      {
        id: 'sb-weekly-goals',
        title: 'Goal Setting',
        points: 50,
        xp: 100,
        skills: ['Planning'],
      },
      {
        id: 'sb-resilience-practice',
        title: 'Resilience Practice',
        points: 75,
        xp: 150,
        skills: ['Mindset', 'Perseverance'],
      },
      {
        id: 'sb-confidence-routine',
        title: 'Confidence Routine',
        points: 65,
        xp: 130,
        skills: ['Self-belief', 'Preparation'],
      },
    ],
    resources: [
      {
        id: 'res-6',
        type: 'video',
        title: 'Mindset Coach Session',
        url: 'https://example.org/mindset-video',
      },
    ],
  },
  {
    id: 'module-content-creation',
    badgeId: 'badge-digital',
    title: 'Content and Analytics Basics',
    description: 'Develop practical digital production and insight skills.',
    learningOutcomes: [
      'Create short highlight reels',
      'Use basic analytics to improve training',
      'Prepare simple presentation reports',
    ],
    subBadges: [
      {
        id: 'sb-highlight-edit',
        title: 'Highlight Editing',
        points: 70,
        xp: 140,
        skills: ['Editing', 'Storytelling'],
      },
      {
        id: 'sb-training-analytics',
        title: 'Training Analytics',
        points: 85,
        xp: 170,
        skills: ['Data literacy'],
      },
      {
        id: 'sb-report-presentation',
        title: 'Performance Reporting',
        points: 65,
        xp: 130,
        skills: ['Presentation', 'Communication'],
      },
    ],
    resources: [
      {
        id: 'res-7',
        type: 'ppt',
        title: 'Analytics Deck Template',
        url: 'https://example.org/analytics-template.ppt',
      },
    ],
  },
]

export const centres: Centre[] = [
  { id: 'centre-glasgow', name: 'Glasgow Central', region: 'West' },
  { id: 'centre-edinburgh', name: 'Edinburgh North', region: 'East' },
]

export const groups: Group[] = [
  { id: 'group-gc-u16', centreId: 'centre-glasgow', name: 'GC U16' },
  { id: 'group-gc-u18', centreId: 'centre-glasgow', name: 'GC U18' },
  { id: 'group-en-u16', centreId: 'centre-edinburgh', name: 'EN U16' },
]

export const users: User[] = [
  {
    id: 'u-main-admin',
    username: 'mainadmin',
    password: 'Password123',
    displayName: 'Main Admin',
    role: 'main_admin',
    centreId: 'centre-glasgow',
  },
  {
    id: 'u-centre-admin',
    username: 'centreadmin',
    password: 'Password123',
    displayName: 'Centre Admin',
    role: 'centre_admin',
    centreId: 'centre-glasgow',
  },
  {
    id: 'u-player-1',
    username: 'player1',
    password: 'Password123',
    displayName: 'Alex Player',
    role: 'user',
    centreId: 'centre-glasgow',
    groupId: 'group-gc-u16',
  },
  {
    id: 'u-player-2',
    username: 'player2',
    password: 'Password123',
    displayName: 'Sam Gamer',
    role: 'user',
    centreId: 'centre-edinburgh',
    groupId: 'group-en-u16',
  },
]

export const progress: UserProgress[] = [
  {
    userId: 'u-player-1',
    activeModuleIds: ['module-comms-leadership', 'module-digital-wellbeing'],
    completedModuleIds: ['module-strategy-fundamentals'],
    completedSubBadgeIds: ['sb-map-awareness', 'sb-adaptation-plan', 'sb-vod-review', 'sb-clear-comms'],
  },
  {
    userId: 'u-player-2',
    activeModuleIds: ['module-growth-mindset'],
    completedModuleIds: [],
    completedSubBadgeIds: ['sb-weekly-goals'],
  },
]

export const evidenceSubmissions: EvidenceSubmission[] = [
  {
    id: 'ev-1',
    userId: 'u-player-1',
    moduleId: 'module-comms-leadership',
    subBadgeId: 'sb-clear-comms',
    links: ['https://example.org/match-clip-123'],
    fileNames: ['clear-comms-reflection.docx'],
    imageNames: ['team-review.png'],
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]
