import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { DEFAULT_LOGIN_PASSWORD } from '../utils/auth'

export function CentreAdminPage() {
  const authUser = useAuthStore((state) => state.user)
  const users = useAppStore((state) => state.users)
  const modules = useAppStore((state) => state.modules)
  const groups = useAppStore((state) => state.groups)
  const evidence = useAppStore((state) => state.evidence)
  const assignModule = useAppStore((state) => state.assignModule)
  const createPlayer = useAppStore((state) => state.createPlayer)
  const reviewEvidence = useAppStore((state) => state.reviewEvidence)

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id ?? '')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerUsername, setNewPlayerUsername] = useState('')
  const [newPlayerGroupId, setNewPlayerGroupId] = useState('')
  const [createPlayerError, setCreatePlayerError] = useState('')
  const [createPlayerSuccess, setCreatePlayerSuccess] = useState('')
  const [reviewTarget, setReviewTarget] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const centrePlayers = useMemo(() => {
    return users.filter((user) => user.role === 'user' && user.centreId === authUser?.centreId)
  }, [authUser?.centreId, users])

  const pendingEvidence = useMemo(() => {
    return evidence.filter((submission) => submission.status === 'pending')
  }, [evidence])

  const centreGroups = useMemo(() => {
    return groups.filter((group) => group.centreId === authUser?.centreId)
  }, [authUser?.centreId, groups])

  const onCreatePlayer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreatePlayerError('')
    setCreatePlayerSuccess('')

    if (!authUser) {
      setCreatePlayerError('No centre admin profile available.')
      return
    }

    const displayName = newPlayerName.trim()
    const username = newPlayerUsername.trim().toLowerCase()

    if (!displayName || !username) {
      setCreatePlayerError('Enter both display name and username.')
      return
    }

    const usernameExists = users.some((user) => user.username.toLowerCase() === username)
    if (usernameExists) {
      setCreatePlayerError('That username already exists.')
      return
    }

    createPlayer({
      displayName,
      username,
      centreId: authUser.centreId,
      groupId: newPlayerGroupId || undefined,
    })

    setCreatePlayerSuccess(`Player created. Temporary login password: ${DEFAULT_LOGIN_PASSWORD}`)
    setNewPlayerName('')
    setNewPlayerUsername('')
    setNewPlayerGroupId('')
  }

  if (!authUser) {
    return <p className="card">No admin profile available.</p>
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h2>Centre Admin Dashboard</h2>
        <p>Assign modules, review user evidence, and track player progress for your centre.</p>
      </header>

      <section className="card stack-sm">
        <h3>Add New Player</h3>
        <form className="stack-sm" onSubmit={onCreatePlayer}>
          <label>
            Player name
            <input value={newPlayerName} onChange={(event) => setNewPlayerName(event.target.value)} />
          </label>
          <label>
            Username
            <input value={newPlayerUsername} onChange={(event) => setNewPlayerUsername(event.target.value)} />
          </label>
          <label>
            Group (optional)
            <select value={newPlayerGroupId} onChange={(event) => setNewPlayerGroupId(event.target.value)}>
              <option value="">No group selected</option>
              {centreGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="button">
            Add player
          </button>
          {createPlayerError ? <p className="error-text">{createPlayerError}</p> : null}
          {createPlayerSuccess ? <p className="success-text">{createPlayerSuccess}</p> : null}
        </form>
      </section>

      <section className="card stack-sm">
        <h3>Users in Your Centre</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Assign Module</th>
              </tr>
            </thead>
            <tbody>
              {centrePlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.displayName}</td>
                  <td>{player.username}</td>
                  <td>
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        setSelectedUserId(player.id)
                        assignModule(player.id, selectedModuleId)
                      }}
                    >
                      Assign selected module
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <label>
          Module to assign
          <select value={selectedModuleId} onChange={(event) => setSelectedModuleId(event.target.value)}>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </label>
        {selectedUserId ? <p className="success-text">Module assigned to selected user.</p> : null}
      </section>

      <section className="card stack-sm">
        <h3>Evidence Approval Queue</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Module</th>
                <th>Sub-badge</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingEvidence.map((submission) => {
                const user = users.find((item) => item.id === submission.userId)
                const module = modules.find((item) => item.id === submission.moduleId)
                const subBadge = module?.subBadges.find((entry) => entry.id === submission.subBadgeId)
                return (
                  <tr key={submission.id}>
                    <td>{user?.displayName ?? submission.userId}</td>
                    <td>{module?.title ?? submission.moduleId}</td>
                    <td>{subBadge?.title ?? submission.subBadgeId}</td>
                    <td>{submission.status}</td>
                    <td>
                      <button type="button" className="button" onClick={() => setReviewTarget(submission.id)}>
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })}
              {pendingEvidence.length === 0 ? (
                <tr>
                  <td colSpan={5}>No evidence waiting for approval.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={Boolean(reviewTarget)} title="Approve or Reject Evidence" onClose={() => setReviewTarget(null)}>
        <label>
          Feedback (read-only for user)
          <textarea rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)} />
        </label>
        <div className="row-actions">
          <button
            type="button"
            className="button"
            onClick={() => {
              if (reviewTarget) {
                reviewEvidence(reviewTarget, 'approved', feedback)
              }
              setReviewTarget(null)
              setFeedback('')
            }}
          >
            Approve
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => {
              if (reviewTarget) {
                reviewEvidence(reviewTarget, 'rejected', feedback)
              }
              setReviewTarget(null)
              setFeedback('')
            }}
          >
            Reject
          </button>
        </div>
      </Modal>
    </section>
  )
}
