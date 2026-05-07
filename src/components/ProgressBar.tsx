export default function ProgressBar({ value, max, level, showLabel = false }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const levelClass = level ? level.toLowerCase() : '';
  const isComplete = pct >= 100;

  return (
    <div className={`xp-bar ${levelClass} ${isComplete ? 'xp-bar--complete' : ''}`}>
      <div className="xp-bar__track">
        <div
          className={`xp-bar__fill ${levelClass}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div className="xp-bar__shimmer" />
        </div>
      </div>
      {showLabel && (
        <div className="xp-bar__label">
          <span>{value}</span>
          <span>/</span>
          <span>{max} XP</span>
        </div>
      )}
    </div>
  );
}
