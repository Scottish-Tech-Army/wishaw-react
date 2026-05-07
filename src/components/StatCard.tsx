interface StatCardProps {
  label: string
  value: string
  subtext?: string
}

export function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <article className="card stat-card">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      {subtext ? <p>{subtext}</p> : null}
    </article>
  )
}
