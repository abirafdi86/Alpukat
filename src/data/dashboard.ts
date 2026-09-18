import { Trees, Leaf, Sprout, CalendarDays, ClipboardList, Wallet } from 'lucide-vue-next'
import type { DashboardStat } from '@/types/dashboard'

/** Static demo snapshot. Replace with a dashboard service when the API is available. */
export const dashboardStats: DashboardStat[] = [
  { id: 'total-trees', label: 'Total Trees', value: '1,248', description: '+24 this month', tone: 'positive', icon: Trees },
  { id: 'productive-trees', label: 'Productive Trees', value: '892', description: '71.5% of total trees', icon: Leaf },
  { id: 'monthly-harvest', label: 'Harvest This Month', value: '4,820', unit: 'kg', description: '+12.4% from last month', tone: 'positive', icon: Sprout },
  { id: 'estimated-harvest', label: 'Estimated Harvest', value: '6,250', unit: 'kg', icon: CalendarDays },
  { id: 'activities', label: 'Farm Activities', value: '8', unit: 'Scheduled', description: '3 need attention', tone: 'warning', icon: ClipboardList },
  { id: 'monthly-expenses', label: 'Monthly Expenses', prefix: 'Rp', value: '18.450.000', icon: Wallet },
]
