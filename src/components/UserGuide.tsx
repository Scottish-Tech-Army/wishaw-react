import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const roleGuides = {
  USER: {
    heading: 'Player guide',
    intro: 'Use the app to track badge progress, work through modules, and keep an eye on your standing.',
    quickStart: [
      'Open Dashboard to check your XP, completed challenges, and recent progress.',
      'Use Badges to review badge categories and see which sub-badges you have already earned.',
      'Open Modules to browse learning content and complete the next module in your path.',
      'Visit My Profile when you need your account details or a fuller progress view.',
      'Check Leaderboard to compare your progress with other players.',
    ],
    pages: [
      { to: '/', label: 'Dashboard', description: 'See your XP, completed challenges, and overall progress.' },
      { to: '/profile', label: 'My Profile', description: 'Review your user details and personal progress.' },
      { to: '/badges', label: 'Badges', description: 'Browse badge categories and earned sub-badges.' },
      { to: '/modules', label: 'Modules', description: 'Open modules and continue your learning activities.' },
      { to: '/leaderboard', label: 'Leaderboard', description: 'See how your progress compares with others.' },
    ],
    tips: [
      'If the app returns a 401 response, you will be signed out and sent back to login.',
      'If content is missing, refresh the page after confirming the backend is available.',
      'Use this guide button any time you need a quick reminder of where to go next.',
    ],
  },
  CENTRE_ADMIN: {
    heading: 'Centre admin guide',
    intro: 'You can manage users and centre activity while still using the same progress views available to players.',
    quickStart: [
      'Use Dashboard for a quick snapshot of progress and activity.',
      'Open Users to create or update players for your centre.',
      'Manage Modules, Sub-Badges, Groups, and Award Progress from the Admin section.',
      'Use Leaderboard and Profiles to confirm changes are reflected for your players.',
      'Keep your own centre data accurate because your admin tools are scoped to that centre.',
    ],
    pages: [
      { to: '/', label: 'Dashboard', description: 'Monitor progress and recent activity.' },
      { to: '/admin/users', label: 'Admin Users', description: 'Create players, update roles, and manage centre assignments.' },
      { to: '/admin/modules', label: 'Admin Modules', description: 'Create or maintain modules for your centre.' },
      { to: '/admin/sub-badges', label: 'Admin Sub-Badges', description: 'Maintain sub-badge content tied to badges and modules.' },
      { to: '/admin/groups', label: 'Admin Groups', description: 'Create groups and manage membership.' },
      { to: '/admin/progress', label: 'Award Progress', description: 'Complete sub-badges and keep learner progress current.' },
      { to: '/leaderboard', label: 'Leaderboard', description: 'Check centre performance and player rankings.' },
    ],
    tips: [
      'Centre admins can manage users and content for their own centre, not every centre in the platform.',
      'Use the player-facing pages too, especially when checking how data appears after an admin update.',
      'Groups and progress tools are usually the fastest route for day-to-day operational changes.',
    ],
  },
  MAIN_ADMIN: {
    heading: 'Main admin guide',
    intro: 'You have full platform access across centres, users, badge structures, learning content, and levels.',
    quickStart: [
      'Start with Centres when setting up a new location or checking where users belong.',
      'Use Users to control platform access, roles, and centre ownership.',
      'Configure Modules, Badges, Sub-Badges, and Levels before updating learner progress.',
      'Use Groups and Award Progress for operational management once content is in place.',
      'Review Dashboard and Leaderboard to monitor platform-wide adoption and progress.',
    ],
    pages: [
      { to: '/', label: 'Dashboard', description: 'Get a platform-level snapshot of progress.' },
      { to: '/admin/centres', label: 'Admin Centres', description: 'Create, update, and review centres.' },
      { to: '/admin/users', label: 'Admin Users', description: 'Manage users, roles, and centre assignments.' },
      { to: '/admin/modules', label: 'Admin Modules', description: 'Maintain module content across the platform.' },
      { to: '/admin/badges', label: 'Admin Badges', description: 'Manage top-level badge categories.' },
      { to: '/admin/sub-badges', label: 'Admin Sub-Badges', description: 'Maintain detailed challenge definitions.' },
      { to: '/admin/groups', label: 'Admin Groups', description: 'Create groups and manage members.' },
      { to: '/admin/progress', label: 'Award Progress', description: 'Apply progress updates and completions.' },
      { to: '/admin/levels', label: 'Admin Levels', description: 'Control level thresholds and progression rules.' },
      { to: '/leaderboard', label: 'Leaderboard', description: 'Review rankings and engagement trends.' },
    ],
    tips: [
      'Main admins can work across all centres, so double-check centre selection before saving changes.',
      'Content setup normally flows from centres and users into modules, badges, sub-badges, then levels.',
      'After structural changes, validate the result from player-facing pages to confirm the experience is correct.',
    ],
  },
};

function formatRole(role) {
  return role
    ?.toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function UserGuide({ open, onClose }) {
  const { user } = useAuth();

  if (!open || !user) {
    return null;
  }

  const roleKey = roleGuides[user.role] ? user.role : 'USER';
  const guide = roleGuides[roleKey];

  return (
    <Modal title="User Guide" onClose={onClose} className="guide-modal">
      <div className="user-guide">
        <div className="user-guide-hero">
          <div>
            <div className="user-guide-kicker">Role-based walkthrough</div>
            <h4>{guide.heading}</h4>
            <p>{guide.intro}</p>
          </div>
          <span className="user-guide-role">{formatRole(roleKey)}</span>
        </div>

        <section className="guide-section">
          <h4>Quick start</h4>
          <ol className="guide-step-list">
            {guide.quickStart.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="guide-section">
          <h4>Pages available to you</h4>
          <div className="guide-link-list">
            {guide.pages.map((page) => (
              <Link key={page.to} className="guide-link-card" to={page.to} onClick={onClose}>
                <div>
                  <strong>{page.label}</strong>
                  <p>{page.description}</p>
                </div>
                <span>Open</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="guide-section">
          <h4>Good to know</h4>
          <ul className="guide-tip-list">
            {guide.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}