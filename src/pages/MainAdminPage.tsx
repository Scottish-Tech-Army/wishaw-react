import { FormEvent, useState } from 'react'
import { DataTable } from '../components/DataTable'
import { useAppStore } from '../store/appStore'

export function MainAdminPage() {
  const centres = useAppStore((state) => state.centres)
  const groups = useAppStore((state) => state.groups)
  const modules = useAppStore((state) => state.modules)
  const badges = useAppStore((state) => state.badges)
  const users = useAppStore((state) => state.users)
  const createCentre = useAppStore((state) => state.createCentre)
  const createGroup = useAppStore((state) => state.createGroup)
  const createBadge = useAppStore((state) => state.createBadge)
  const createModule = useAppStore((state) => state.createModule)
  const assignCentreAdmin = useAppStore((state) => state.assignCentreAdmin)

  const [centreName, setCentreName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [badgeName, setBadgeName] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [selectedCentreAdmin, setSelectedCentreAdmin] = useState('')
  const [selectedCentreId, setSelectedCentreId] = useState(centres[0]?.id ?? '')

  const onCreateCentre = (event: FormEvent) => {
    event.preventDefault()
    if (!centreName.trim()) {
      return
    }

    createCentre({ id: `centre-${crypto.randomUUID()}`, name: centreName.trim(), region: 'Unknown' })
    setCentreName('')
  }

  const onCreateGroup = (event: FormEvent) => {
    event.preventDefault()
    if (!groupName.trim() || !selectedCentreId) {
      return
    }

    createGroup({ id: `group-${crypto.randomUUID()}`, centreId: selectedCentreId, name: groupName.trim() })
    setGroupName('')
  }

  const onCreateBadge = (event: FormEvent) => {
    event.preventDefault()
    if (!badgeName.trim()) {
      return
    }

    createBadge({
      id: `badge-${crypto.randomUUID()}`,
      title: badgeName.trim(),
      description: 'New badge category',
    })
    setBadgeName('')
  }

  const onCreateModule = (event: FormEvent) => {
    event.preventDefault()
    const firstBadgeId = badges[0]?.id
    if (!moduleName.trim() || !firstBadgeId) {
      return
    }

    createModule({
      id: `module-${crypto.randomUUID()}`,
      badgeId: firstBadgeId,
      title: moduleName.trim(),
      description: 'New module',
      learningOutcomes: ['Define learning outcomes'],
      subBadges: [],
      resources: [],
    })
    setModuleName('')
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h2>Main Admin Dashboard</h2>
        <p>Create and manage centres, groups, modules, badges, and centre admins.</p>
      </header>

      <div className="card-grid two-up">
        <form className="card stack-sm" onSubmit={onCreateCentre}>
          <h3>Create Centre</h3>
          <input value={centreName} onChange={(event) => setCentreName(event.target.value)} placeholder="Centre name" />
          <button type="submit" className="button">
            Add Centre
          </button>
        </form>

        <form className="card stack-sm" onSubmit={onCreateGroup}>
          <h3>Create Group</h3>
          <select value={selectedCentreId} onChange={(event) => setSelectedCentreId(event.target.value)}>
            {centres.map((centre) => (
              <option key={centre.id} value={centre.id}>
                {centre.name}
              </option>
            ))}
          </select>
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Group name" />
          <button type="submit" className="button">
            Add Group
          </button>
        </form>

        <form className="card stack-sm" onSubmit={onCreateBadge}>
          <h3>Create Badge</h3>
          <input value={badgeName} onChange={(event) => setBadgeName(event.target.value)} placeholder="Badge title" />
          <button type="submit" className="button">
            Add Badge
          </button>
        </form>

        <form className="card stack-sm" onSubmit={onCreateModule}>
          <h3>Create Module</h3>
          <input value={moduleName} onChange={(event) => setModuleName(event.target.value)} placeholder="Module title" />
          <button type="submit" className="button">
            Add Module
          </button>
        </form>
      </div>

      <section className="card stack-sm">
        <h3>Manage Centre Admins</h3>
        <label>
          Select admin
          <select value={selectedCentreAdmin} onChange={(event) => setSelectedCentreAdmin(event.target.value)}>
            <option value="">Choose centre admin</option>
            {users
              .filter((user) => user.role === 'centre_admin')
              .map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.displayName}
                </option>
              ))}
          </select>
        </label>
        <label>
          Assign to centre
          <select value={selectedCentreId} onChange={(event) => setSelectedCentreId(event.target.value)}>
            {centres.map((centre) => (
              <option key={centre.id} value={centre.id}>
                {centre.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button"
          onClick={() => {
            if (selectedCentreAdmin) {
              assignCentreAdmin(selectedCentreAdmin, selectedCentreId)
            }
          }}
        >
          Update Admin Centre
        </button>
      </section>

      <DataTable
        title="Centres"
        rows={centres.map((centre) => ({ name: centre.name, region: centre.region, id: centre.id }))}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'region', label: 'Region' },
          { key: 'id', label: 'ID' },
        ]}
      />
      <DataTable
        title="Groups"
        rows={groups.map((group) => ({ name: group.name, centreId: group.centreId, id: group.id }))}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'centreId', label: 'Centre ID' },
          { key: 'id', label: 'ID' },
        ]}
      />
      <DataTable
        title="Modules"
        rows={modules.map((module) => ({ title: module.title, badgeId: module.badgeId, id: module.id }))}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'badgeId', label: 'Badge ID' },
          { key: 'id', label: 'ID' },
        ]}
      />
      <DataTable
        title="Badges"
        rows={badges.map((badge) => ({ title: badge.title, description: badge.description, id: badge.id }))}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'id', label: 'ID' },
        ]}
      />
    </section>
  )
}
