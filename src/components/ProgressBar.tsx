interface ProgressBarProps {
  label: string
  value: number
  max: number
}

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const safeMax = Math.max(max, 1)
  const percentage = Math.min(100, Math.round((value / safeMax) * 100))

  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemax={max}>
        <div className="progress-value" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
