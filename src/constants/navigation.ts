import { LayoutDashboard, Map, Grid2X2, Trees, Sprout, ClipboardList, Package, Wallet, ChartNoAxesCombined, Users, Settings, ShoppingCart, ContactRound, Tags } from 'lucide-vue-next'
import type { NavigationGroup } from '@/types/navigation'

export const navigationGroups: NavigationGroup[] = [
  { id: 'overview', items: [{ labelKey: 'navigation.dashboard', to: '/dashboard', icon: LayoutDashboard }] },
  { id: 'farms', labelKey: 'navigation.farmManagement', items: [
    { labelKey: 'navigation.farms', to: '/farms', icon: Map },
    { labelKey: 'navigation.blocks', to: '/blocks', icon: Grid2X2 },
    { labelKey: 'navigation.trees', to: '/trees', icon: Trees },
  ] },
  { id: 'operations', labelKey: 'navigation.operations', items: [
    { labelKey: 'navigation.harvest', to: '/harvest', icon: Sprout },
    { labelKey: 'navigation.activities', to: '/activities', icon: ClipboardList },
    { labelKey: 'navigation.inventory', to: '/inventory', icon: Package },
  ] },
  { id: 'sales', labelKey: 'navigation.salesManagement', items: [
    { labelKey: 'navigation.sales', to: '/sales', icon: ShoppingCart },
    { labelKey: 'navigation.customers', to: '/customers', icon: ContactRound },
    { labelKey: 'navigation.salesStock', to: '/sales-stock', icon: Tags },
  ] },
  { id: 'finance', labelKey: 'navigation.finance', items: [{ labelKey: 'navigation.expenses', to: '/expenses', icon: Wallet }] },
  { id: 'analytics', labelKey: 'navigation.analytics', items: [{ labelKey: 'navigation.reports', to: '/reports', icon: ChartNoAxesCombined }] },
  { id: 'management', labelKey: 'navigation.management', items: [
    { labelKey: 'navigation.users', to: '/users', icon: Users },
    { labelKey: 'navigation.settings', to: '/settings', icon: Settings },
  ] },
]

export const navigationItems = navigationGroups.flatMap(group => group.items)
