import type { LucideIcon } from 'lucide-vue-next'

export interface NavigationItem {
  labelKey: string
  to: string
  icon: LucideIcon
}
export interface NavigationGroup {
  id: string
  labelKey?: string
  items: NavigationItem[]
}
