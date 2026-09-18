import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    layout?: 'auth' | 'default'
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: () => import('@/pages/login.vue'), meta: { title: 'Login', layout: 'auth' } },
    { path: '/register', name: 'register', component: () => import('@/pages/register.vue'), meta: { title: 'Register', layout: 'auth' } },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/pages/dashboard.vue'), meta: { title: 'Dashboard', layout: 'default' } },
    { path: '/farms', name: 'farms', component: () => import('@/pages/farms.vue'), meta: { title: 'Farms', layout: 'default' } },
    { path: '/farms/:farmId', name: 'farm-detail', component: () => import('@/pages/farms.vue'), meta: { title: 'Farm detail', layout: 'default' } },
    { path: '/blocks', name: 'blocks', component: () => import('@/pages/blocks.vue'), meta: { title: 'Blocks', layout: 'default' } },
    { path: '/blocks/:blockId', name: 'block-detail', component: () => import('@/pages/blocks.vue'), meta: { title: 'Block detail', layout: 'default' } },
    { path: '/trees', name: 'trees', component: () => import('@/pages/trees.vue'), meta: { title: 'Trees', layout: 'default' } },
    { path: '/trees/:treeId', name: 'tree-detail', component: () => import('@/pages/trees.vue'), meta: { title: 'Tree detail', layout: 'default' } },
    { path: '/harvest', name: 'harvest', component: () => import('@/pages/harvest.vue'), meta: { title: 'Harvest', layout: 'default' } },
    { path: '/harvest/:harvestId', name: 'harvest-detail', component: () => import('@/pages/harvest.vue'), meta: { title: 'Harvest detail', layout: 'default' } },
    { path: '/activities', name: 'activities', component: () => import('@/pages/activities.vue'), meta: { title: 'Activities', layout: 'default' } },
    { path: '/activities/:activityId', name: 'activity-detail', component: () => import('@/pages/activities.vue'), meta: { title: 'Activity detail', layout: 'default' } },
    { path: '/inventory', name: 'inventory', component: () => import('@/pages/inventory.vue'), meta: { title: 'Inventory', layout: 'default' } },
    { path: '/sales', name: 'sales', component: () => import('@/pages/sales.vue'), meta: { title: 'Sales', layout: 'default' } },
    { path: '/sales/new', name: 'sales-new', component: () => import('@/pages/sales-new.vue'), meta: { title: 'New Sale', layout: 'default' } },
    { path: '/sales/:id', name: 'sale-detail', component: () => import('@/pages/sales-detail.vue'), meta: { title: 'Sales detail', layout: 'default' } },
    { path: '/customers', name: 'customers', component: () => import('@/pages/customers.vue'), meta: { title: 'Customers', layout: 'default' } },
    { path: '/customers/:customerId', name: 'customer-detail', component: () => import('@/pages/customers.vue'), meta: { title: 'Customer detail', layout: 'default' } },
    { path: '/sales-stock', name: 'salesStock', component: () => import('@/pages/sales-stock.vue'), meta: { title: 'Price & Stock', layout: 'default' } },
    { path: '/expenses', name: 'expenses', component: () => import('@/pages/expenses.vue'), meta: { title: 'Expenses', layout: 'default' } },
    { path: '/expenses/:expenseId', name: 'expense-detail', component: () => import('@/pages/expenses.vue'), meta: { title: 'Expense detail', layout: 'default' } },
    { path: '/reports', name: 'reports', component: () => import('@/pages/reports.vue'), meta: { title: 'Reports', layout: 'default' } },
    { path: '/users', name: 'users', component: () => import('@/pages/users.vue'), meta: { title: 'Users', layout: 'default' } },
    { path: '/settings', name: 'settings', component: () => import('@/pages/settings.vue'), meta: { title: 'Settings', layout: 'default' } },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.layout !== 'auth' && !useAuthStore().isAuthenticated) return '/login'
  if (to.path.startsWith('/users') && useAuthStore().user?.role !== 'OWNER') return '/dashboard'
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | AFMS` : 'Avocado Farm Management System (AFMS)'
})

export default router
