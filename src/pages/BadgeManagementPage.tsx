import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '../api/badgeManagementApi'
import type { BadgeTree, ChallengeDto } from '../api/badgeManagementApi'

// ─── Local view-model types (derived from API DTOs) ──────────────────────────

type ChallengeItem = {
  id: string
  title: string
  description: string
  pts: number
}

type SubBadgeItem = {
  id: string
  title: string
  description: string
  xp: number
  challenges: ChallengeItem[]
}

type BadgeCategoryItem = {
  id: string
  title: string
  description: string
  icon: string
  sequentialUnlock: boolean
  subBadges: SubBadgeItem[]
}

type ModalState =
  | { type: 'none' }
  | { type: 'add-badge' }
  | { type: 'edit-badge'; badgeId: string }
  | { type: 'delete-badge'; badgeId: string }
  | { type: 'add-sub'; badgeId: string }
  | { type: 'edit-sub'; badgeId: string; subId: string }
  | { type: 'delete-sub'; badgeId: string; subId: string }
  | { type: 'add-challenge'; badgeId: string; subId: string }
  | { type: 'edit-challenge'; badgeId: string; subId: string; challengeId: string }
  | { type: 'delete-challenge'; badgeId: string; subId: string; challengeId: string }

// ─── Map API tree into local view-model ──────────────────────────────────────

function mapTree(tree: BadgeTree[]): BadgeCategoryItem[] {
  return tree.map((b) => ({
    id: b.badgeId,
    title: b.title,
    description: b.description,
    icon: b.icon || 'military_tech',
    sequentialUnlock: b.sequentialUnlock,
    subBadges: (b.subBadges || []).map((s) => ({
      id: s.subBadgeId,
      title: s.title,
      description: s.description || s.info || 'No description added yet.',
      xp: s.xp,
      challenges: (s.challenges || []).map((c: ChallengeDto) => ({
        id: c.challengeId,
        title: c.title,
        description: c.description,
        pts: c.pts,
      })),
    })),
  }))
}

export default function BadgeManagementPage() {
  const [categories, setCategories] = useState<BadgeCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('all')

  const [badgeForm, setBadgeForm] = useState({ title: '', description: '', icon: 'military_tech', sequentialUnlock: true })
  const [subForm, setSubForm] = useState({ title: '', description: '', xp: 0 })
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', pts: 0 })

  // ─── Load full badge tree from API ──────────────────────────────────────────
  const fetchTree = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const tree = await api.loadFullBadgeTree()
      setCategories(mapTree(tree))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load badges')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const totals = useMemo(() => {
    const totalSubBadges = categories.reduce((sum, badge) => sum + badge.subBadges.length, 0)
    const totalChallenges = categories.reduce(
      (sum, badge) => sum + badge.subBadges.reduce((subSum, sub) => subSum + sub.challenges.length, 0),
      0,
    )
    const totalPoints = categories.reduce(
      (sum, badge) => sum + badge.subBadges.reduce((subSum, sub) => subSum + sub.challenges.reduce((chSum, ch) => chSum + ch.pts, 0), 0),
      0,
    )

    return {
      totalBadges: categories.length,
      totalSubBadges,
      totalChallenges,
      totalPoints,
    }
  }, [categories])

  const openAddBadge = () => {
    setBadgeForm({ title: '', description: '', icon: 'military_tech', sequentialUnlock: true })
    setModal({ type: 'add-badge' })
  }

  const openEditBadge = (badgeId: string) => {
    const badge = categories.find((b) => b.id === badgeId)
    if (!badge) return
    setBadgeForm({
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      sequentialUnlock: badge.sequentialUnlock,
    })
    setModal({ type: 'edit-badge', badgeId })
  }

  const saveBadge = async () => {
    if (!badgeForm.title.trim()) return
    setSaving(true)
    try {
      if (modal.type === 'add-badge') {
        await api.createBadge({
          title: badgeForm.title.trim(),
          description: badgeForm.description.trim() || 'Badge category description not added yet.',
          icon: badgeForm.icon.trim() || 'military_tech',
          sequentialUnlock: badgeForm.sequentialUnlock,
        })
      }

      if (modal.type === 'edit-badge') {
        await api.updateBadge(modal.badgeId, {
          title: badgeForm.title.trim(),
          description: badgeForm.description.trim() || 'Badge category description not added yet.',
          icon: badgeForm.icon.trim() || 'military_tech',
          sequentialUnlock: badgeForm.sequentialUnlock,
        })
      }

      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBadge = async (badgeId: string) => {
    setSaving(true)
    try {
      await api.deleteBadge(badgeId)
      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const openAddSubBadge = (badgeId: string) => {
    setSubForm({ title: '', description: '', xp: 0 })
    setModal({ type: 'add-sub', badgeId })
  }

  const openEditSubBadge = (badgeId: string, subId: string) => {
    const badge = categories.find((b) => b.id === badgeId)
    const sub = badge?.subBadges.find((s) => s.id === subId)
    if (!sub) return

    setSubForm({
      title: sub.title,
      description: sub.description,
      xp: sub.xp,
    })
    setModal({ type: 'edit-sub', badgeId, subId })
  }

  const saveSubBadge = async () => {
    if (!subForm.title.trim()) return
    setSaving(true)
    try {
      if (modal.type === 'add-sub') {
        await api.createSubBadge(modal.badgeId, {
          title: subForm.title.trim(),
          description: subForm.description.trim() || 'No description added yet.',
          xp: Number(subForm.xp) || 0,
        })
      }

      if (modal.type === 'edit-sub') {
        await api.updateSubBadge(modal.badgeId, modal.subId, {
          title: subForm.title.trim(),
          description: subForm.description.trim() || 'No description added yet.',
          xp: Number(subForm.xp) || 0,
        })
      }

      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubBadge = async (badgeId: string, subId: string) => {
    setSaving(true)
    try {
      await api.deleteSubBadge(badgeId, subId)
      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const moveSubBadge = async (badgeId: string, subId: string, direction: 'up' | 'down') => {
    const badge = categories.find((b) => b.id === badgeId)
    if (!badge) return

    const index = badge.subBadges.findIndex((s) => s.id === subId)
    if (index < 0) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= badge.subBadges.length) return

    // Optimistic local reorder
    const next = [...badge.subBadges]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)

    setCategories((prev) =>
      prev.map((b) => (b.id === badgeId ? { ...b, subBadges: next } : b)),
    )

    try {
      await api.reorderSubBadges(badgeId, next.map((s) => s.id))
    } catch {
      await fetchTree() // revert on failure
    }
  }

  const openAddChallenge = (badgeId: string, subId: string) => {
    setChallengeForm({ title: '', description: '', pts: 0 })
    setModal({ type: 'add-challenge', badgeId, subId })
  }

  const openEditChallenge = (badgeId: string, subId: string, challengeId: string) => {
    const badge = categories.find((b) => b.id === badgeId)
    const sub = badge?.subBadges.find((s) => s.id === subId)
    const challenge = sub?.challenges.find((c) => c.id === challengeId)
    if (!challenge) return

    setChallengeForm({
      title: challenge.title,
      description: challenge.description,
      pts: challenge.pts,
    })
    setModal({ type: 'edit-challenge', badgeId, subId, challengeId })
  }

  const saveChallenge = async () => {
    if (!challengeForm.title.trim()) return
    setSaving(true)
    try {
      if (modal.type === 'add-challenge') {
        await api.createChallenge(modal.badgeId, modal.subId, {
          title: challengeForm.title.trim(),
          description: challengeForm.description.trim() || 'No challenge notes added yet.',
          pts: Number(challengeForm.pts) || 0,
        })
      }

      if (modal.type === 'edit-challenge') {
        await api.updateChallenge(modal.badgeId, modal.subId, modal.challengeId, {
          title: challengeForm.title.trim(),
          description: challengeForm.description.trim() || 'No challenge notes added yet.',
          pts: Number(challengeForm.pts) || 0,
        })
      }

      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteChallenge = async (badgeId: string, subId: string, challengeId: string) => {
    setSaving(true)
    try {
      await api.deleteChallenge(badgeId, subId, challengeId)
      setModal({ type: 'none' })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSequential = async (badgeId: string, current: boolean) => {
    try {
      await api.updateBadge(badgeId, { sequentialUnlock: !current })
      await fetchTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="badge-mgmt">
      <header className="badge-mgmt-topbar">
        <h1>YMCA ESports</h1>
        <div className="badge-mgmt-topbar-right">
          <button className="admin-icon-btn" aria-label="Notifications" type="button">
            <span className="material-symbol">notifications</span>
          </button>
          <button className="admin-icon-btn" aria-label="Settings" type="button">
            <span className="material-symbol">settings</span>
          </button>
          <div className="admin-avatar" aria-hidden="true">A</div>
        </div>
      </header>

      <main className="badge-mgmt-main">
        <section className="badge-mgmt-header">
          <div className="badge-mgmt-header-text">
            <span className="badge-mgmt-kicker">Hierarchy Management</span>
            <h2 className="badge-mgmt-title">BADGE SYSTEM</h2>
          </div>

          <button className="badge-mgmt-btn badge-mgmt-btn--outline" onClick={openAddBadge} type="button">
            <span className="material-symbol">add_circle</span>
            Add Badge Category
          </button>
        </section>

        {error && (
          <div className="badge-mgmt-error" role="alert">
            <span className="material-symbol">error</span>
            {error}
            <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setError(null)} type="button">dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="badge-mgmt-loading">
            <span className="material-symbol spin">progress_activity</span>
            Loading badges…
          </div>
        ) : (
          <>
            <section className="badge-filter">
              <label className="badge-filter-label">
                <span className="material-symbol">filter_list</span>
                Filter by badge
              </label>
              <div className="badge-filter-chips">
                <button
                  className={`badge-filter-chip ${selectedBadgeId === 'all' ? 'badge-filter-chip--active' : ''}`}
                  onClick={() => setSelectedBadgeId('all')}
                  type="button"
                >
                  All ({categories.length})
                </button>
                {categories.map((badge) => (
                  <button
                    key={badge.id}
                    className={`badge-filter-chip ${selectedBadgeId === badge.id ? 'badge-filter-chip--active' : ''}`}
                    onClick={() => setSelectedBadgeId(badge.id)}
                    type="button"
                  >
                    <span className="material-symbol" style={{ fontSize: '16px' }}>{badge.icon}</span>
                    {badge.title}
                  </button>
                ))}
              </div>
            </section>

        {categories.filter((b) => selectedBadgeId === 'all' || b.id === selectedBadgeId).map((badge) => (
          <section key={badge.id} className="badge-cat">
            <div className="badge-cat-header">
              <div className="badge-cat-header-left">
                <div className="badge-cat-icon">
                  <span className="material-symbol">{badge.icon}</span>
                </div>
                <div className="badge-cat-info">
                  <h3>{badge.title}</h3>
                  <p>{badge.subBadges.length} Sub-Badges</p>
                </div>
              </div>

              <div className="badge-cat-actions">
                <div className="toggle-group">
                  <button
                    className={`toggle ${badge.sequentialUnlock ? 'toggle--on' : ''}`}
                    aria-label="Toggle sequential unlock"
                    type="button"
                    onClick={() => handleToggleSequential(badge.id, badge.sequentialUnlock)}
                  />
                  <span className="toggle-label">Sequential Unlock</span>
                </div>

                <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => openEditBadge(badge.id)} type="button">
                  <span className="material-symbol">edit</span>
                </button>
                <button className="badge-mgmt-btn badge-mgmt-btn--danger" onClick={() => setModal({ type: 'delete-badge', badgeId: badge.id })} type="button">
                  <span className="material-symbol">delete</span>
                </button>
              </div>
            </div>

            <div className="badge-cat-body">
              {badge.subBadges.map((sub, index) => (
                <article key={sub.id} className="sub-badge">
                  <div className="sub-badge-top">
                    <div className="sub-badge-left">
                      <div className="sub-badge-order">
                        <button onClick={() => moveSubBadge(badge.id, sub.id, 'up')} aria-label="Move up" type="button">
                          <span className="material-symbol">expand_less</span>
                        </button>
                        <span className="order-num">{String(index + 1).padStart(2, '0')}</span>
                        <button onClick={() => moveSubBadge(badge.id, sub.id, 'down')} aria-label="Move down" type="button">
                          <span className="material-symbol">expand_more</span>
                        </button>
                      </div>

                      <div className="sub-badge-meta">
                        <h4>
                          {sub.title}
                          <span className="sub-badge-xp-tag">{sub.xp} XP</span>
                        </h4>
                        <p className="sub-badge-desc">{sub.description}</p>
                      </div>
                    </div>

                    <div>
                      <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => openEditSubBadge(badge.id, sub.id)} type="button">
                        <span className="material-symbol">edit</span>
                        Edit Sub-Badge
                      </button>
                      <button className="badge-mgmt-btn badge-mgmt-btn--danger" onClick={() => setModal({ type: 'delete-sub', badgeId: badge.id, subId: sub.id })} type="button">
                        <span className="material-symbol">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="challenges-list">
                    {sub.challenges.map((challenge) => (
                      <div key={challenge.id} className="challenge-row">
                        <div className="challenge-row-left">
                          <span className="material-symbol">drag_indicator</span>
                          <div className="challenge-row-info">
                            <p>{challenge.title}</p>
                            <p>{challenge.description}</p>
                          </div>
                        </div>
                        <div className="challenge-row-right">
                          <span className="challenge-pts">{challenge.pts} PTS</span>
                          <button
                            className="badge-mgmt-btn badge-mgmt-btn--ghost"
                            onClick={() => openEditChallenge(badge.id, sub.id, challenge.id)}
                            type="button"
                          >
                            <span className="material-symbol">edit</span>
                          </button>
                          <button
                            className="badge-mgmt-btn badge-mgmt-btn--danger"
                            onClick={() => setModal({ type: 'delete-challenge', badgeId: badge.id, subId: sub.id, challengeId: challenge.id })}
                            type="button"
                          >
                            <span className="material-symbol">close</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => openAddChallenge(badge.id, sub.id)} type="button">
                      <span className="material-symbol">add</span>
                      Add Challenge
                    </button>
                  </div>
                </article>
              ))}

              <button className="add-placeholder" onClick={() => openAddSubBadge(badge.id)} type="button">
                <span className="material-symbol">add_circle</span>
                <span>Add New Sub-Badge</span>
              </button>
            </div>
          </section>
        ))}

        <section className="badge-mgmt-stats">
          <article className="badge-mgmt-stat-card">
            <span className="material-symbol bg-icon">workspace_premium</span>
            <h4>Total Badges</h4>
            <div className="value">{totals.totalBadges}</div>
            <p className="desc">Active badge categories</p>
          </article>

          <article className="badge-mgmt-stat-card">
            <span className="material-symbol bg-icon">extension</span>
            <h4>Total Sub-Badges</h4>
            <div className="value">{totals.totalSubBadges}</div>
            <p className="desc">Progress modules across categories</p>
          </article>

          <article className="badge-mgmt-stat-card">
            <span className="material-symbol bg-icon">flag</span>
            <h4>Challenges</h4>
            <div className="value">{totals.totalChallenges}</div>
            <p className="desc">{totals.totalPoints} total points assignable</p>
          </article>
        </section>
          </>
        )}
      </main>

      {modal.type === 'add-badge' || modal.type === 'edit-badge' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">military_tech</span>
              {modal.type === 'add-badge' ? 'Create Badge Category' : 'Edit Badge Category'}
            </h3>

            <label>
              Badge title
              <input
                value={badgeForm.title}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Game Mastery"
              />
            </label>

            <label>
              Description
              <textarea
                value={badgeForm.description}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What this badge category covers for players"
              />
            </label>

            <label>
              Material icon name
              <input
                value={badgeForm.icon}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="sports_esports"
              />
            </label>

            <div className="toggle-group">
              <button
                className={`toggle ${badgeForm.sequentialUnlock ? 'toggle--on' : ''}`}
                onClick={() => setBadgeForm((prev) => ({ ...prev, sequentialUnlock: !prev.sequentialUnlock }))}
                type="button"
                aria-label="Toggle sequential unlock"
              />
              <span className="toggle-label">Sequential Unlock</span>
            </div>

            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--primary" onClick={saveBadge} disabled={saving} type="button">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal.type === 'add-sub' || modal.type === 'edit-sub' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">extension</span>
              {modal.type === 'add-sub' ? 'Create Sub-Badge' : 'Edit Sub-Badge'}
            </h3>

            <label>
              Sub-badge title
              <input
                value={subForm.title}
                onChange={(e) => setSubForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Advanced Mechanics"
              />
            </label>

            <label>
              Description
              <textarea
                value={subForm.description}
                onChange={(e) => setSubForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Explain what players do to complete this"
              />
            </label>

            <label>
              XP value
              <input
                type="number"
                min={0}
                value={subForm.xp}
                onChange={(e) => setSubForm((prev) => ({ ...prev, xp: Number(e.target.value) }))}
              />
            </label>

            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--primary" onClick={saveSubBadge} disabled={saving} type="button">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal.type === 'add-challenge' || modal.type === 'edit-challenge' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">flag</span>
              {modal.type === 'add-challenge' ? 'Create Challenge' : 'Edit Challenge'}
            </h3>

            <label>
              Challenge title
              <input
                value={challengeForm.title}
                onChange={(e) => setChallengeForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Perfect Timing Challenge"
              />
            </label>

            <label>
              Challenge description
              <textarea
                value={challengeForm.description}
                onChange={(e) => setChallengeForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What the player must complete"
              />
            </label>

            <label>
              Points
              <input
                type="number"
                min={0}
                value={challengeForm.pts}
                onChange={(e) => setChallengeForm((prev) => ({ ...prev, pts: Number(e.target.value) }))}
              />
            </label>

            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--primary" onClick={saveChallenge} disabled={saving} type="button">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal.type === 'delete-badge' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal badge-modal--danger" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">delete</span>
              Delete Badge Category
            </h3>
            <p>This will remove the badge category and all its sub-badges and challenges.</p>
            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--danger-fill" onClick={() => handleDeleteBadge(modal.badgeId)} disabled={saving} type="button">{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal.type === 'delete-sub' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal badge-modal--danger" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">delete</span>
              Delete Sub-Badge
            </h3>
            <p>This will remove the sub-badge and all linked challenges.</p>
            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--danger-fill" onClick={() => handleDeleteSubBadge(modal.badgeId, modal.subId)} disabled={saving} type="button">{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal.type === 'delete-challenge' ? (
        <div className="badge-modal-backdrop" onClick={() => setModal({ type: 'none' })}>
          <div className="badge-modal badge-modal--danger" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>
              <span className="material-symbol">delete</span>
              Delete Challenge
            </h3>
            <p>This challenge and its points value will be removed.</p>
            <div className="badge-modal-actions">
              <button className="badge-mgmt-btn badge-mgmt-btn--ghost" onClick={() => setModal({ type: 'none' })} type="button">Cancel</button>
              <button className="badge-mgmt-btn badge-mgmt-btn--danger-fill" onClick={() => handleDeleteChallenge(modal.badgeId, modal.subId, modal.challengeId)} disabled={saving} type="button">{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
