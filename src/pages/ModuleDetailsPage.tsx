import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { EvidenceUploader } from '../components/EvidenceUploader'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'

export function ModuleDetailsPage() {
  const { moduleId } = useParams()
  const authUser = useAuthStore((state) => state.user)
  const users = useAppStore((state) => state.users)
  const modules = useAppStore((state) => state.modules)
  const progress = useAppStore((state) => state.progress)
  const evidence = useAppStore((state) => state.evidence)
  const markSubBadgeComplete = useAppStore((state) => state.markSubBadgeComplete)

  const module = modules.find((entry) => entry.id === moduleId)

  const playerProgress = useMemo(() => {
    if (!authUser) {
      return undefined
    }
    return progress.find((entry) => entry.userId === authUser.id)
  }, [authUser, progress])

  if (!module || !authUser) {
    return <p className="card">Module not found.</p>
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </header>

      <section className="card stack-sm">
        <h3>Learning Outcomes</h3>
        <ul>
          {module.learningOutcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>

      <section className="card stack-sm">
        <h3>Session Resources</h3>
        <ul>
          {module.resources.map((resource) => (
            <li key={resource.id}>
              <a href={resource.url} target="_blank" rel="noreferrer">
                {resource.title} ({resource.type.toUpperCase()})
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack-sm">
        <h3>Sub-badges and Challenges</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sub-badge</th>
                <th>Points / XP</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {module.subBadges.map((subBadge) => {
                const complete = playerProgress?.completedSubBadgeIds.includes(subBadge.id) ?? false
                const subEvidence = evidence.find(
                  (item) => item.moduleId === module.id && item.subBadgeId === subBadge.id && item.userId === authUser.id,
                )

                return (
                  <tr key={subBadge.id}>
                    <td>{subBadge.title}</td>
                    <td>
                      {subBadge.points} pts / {subBadge.xp} XP
                    </td>
                    <td>{subBadge.skills.join(', ')}</td>
                    <td>
                      <span className={`status-chip ${complete ? 'ok' : 'pending'}`}>
                        {complete ? 'Complete' : 'In progress'}
                      </span>
                      {subEvidence ? (
                        <span className={`status-chip ${subEvidence.status === 'approved' ? 'ok' : 'pending'}`}>
                          Evidence: {subEvidence.status}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {authUser.role !== 'user' ? (
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            const player = users.find((candidate) => candidate.role === 'user' && candidate.centreId === authUser.centreId)
                            if (player) {
                              markSubBadgeComplete(player.id, subBadge.id)
                            }
                          }}
                        >
                          Mark complete
                        </button>
                      ) : (
                        'User view'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {authUser.role === 'user' ? (
        <section className="card stack-sm">
          <h3>Evidence Upload</h3>
          <p>Upload images, documents, and links for admin approval.</p>
          {module.subBadges.map((subBadge) => (
            <details key={subBadge.id}>
              <summary>{subBadge.title}</summary>
              <EvidenceUploader userId={authUser.id} moduleId={module.id} subBadgeId={subBadge.id} />
            </details>
          ))}
        </section>
      ) : null}
    </section>
  )
}
