import { Link } from 'react-router-dom'
import type { Module } from '../types/domain'

interface ModuleCardProps {
  module: Module
  isCompleted: boolean
}

export function ModuleCard({ module, isCompleted }: ModuleCardProps) {
  return (
    <article className="card module-card">
      <div className="card-head">
        <h3>{module.title}</h3>
        <span className={`status-chip ${isCompleted ? 'ok' : 'pending'}`}>{isCompleted ? 'Completed' : 'Active'}</span>
      </div>
      <p>{module.description}</p>
      <Link className="button" to={`/modules/${module.id}`}>
        View Module
      </Link>
    </article>
  )
}
