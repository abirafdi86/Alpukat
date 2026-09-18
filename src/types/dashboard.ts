import type { LucideIcon } from 'lucide-vue-next'

export interface DashboardStat {
  id: string
  label: string
  value: string
  prefix?: string
  unit?: string
  description?: string
  tone?: 'positive' | 'warning' | 'neutral'
  icon: LucideIcon
}
