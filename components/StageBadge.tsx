import { stageBadgeClasses, stageName } from '@/lib/football'

export function StageBadge({ stage, className = '' }: { stage: string; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${stageBadgeClasses(
        stage
      )} ${className}`}
    >
      {stageName(stage)}
    </span>
  )
}
