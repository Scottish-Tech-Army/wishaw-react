import { Info } from 'lucide-react'

interface TooltipProps {
  text: string
}

export function Tooltip({ text }: TooltipProps) {
  return (
    <span className="tooltip" tabIndex={0} aria-label={text}>
      <Info size={14} />
      <span className="tooltip-content">{text}</span>
    </span>
  )
}
