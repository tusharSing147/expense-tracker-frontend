import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'danger' | 'success'
}

const toneClasses: Record<'default' | 'danger' | 'success', string> = {
  default: 'text-foreground',
  danger: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className={cn('mt-1 text-2xl font-semibold tabular-nums', toneClasses[tone])}>
          {value}
        </p>

        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
}
