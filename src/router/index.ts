import { createRouter, createWebHistory } from 'vue-router'
import { installAuthGuards } from './guards'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    layout?: 'auth' | 'default' | 'public'
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/views/public/LandingView.vue'), meta: { layout: 'public' } },
    { path: '/login', name: 'login', component: () => import('@/pages/login.vue'), meta: { title: 'Login', layout: 'auth', guestOnly: true } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/auth/ForgotPasswordView.vue'), meta: { title: 'Forgot password', layout: 'auth', guestOnly: true } },
    { path: '/reset-password', name: 'reset-password', component: () => import('@/views/auth/ResetPasswordView.vue'), meta: { title: 'Reset password', layout: 'auth', guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('@/pages/register.vue'), meta: { title: 'Register', layout: 'auth', guestOnly: true } },
    { path: '/privacy', name: 'privacy', component: () => import('@/views/public/PublicPlaceholderView.vue'), meta: { title: 'Privacy', layout: 'auth' } },
    { path: '/terms', name: 'terms', component: () => import('@/views/public/PublicPlaceholderView.vue'), meta: { title: 'Terms', layout: 'auth' } },
    { path: '/help', name: 'help', component: () => import('@/views/public/PublicPlaceholderView.vue'), meta: { title: 'Help', layout: 'auth' } },
    { path: '/select-workspace', name: 'workspace-selection', component: () => import('@/views/auth/WorkspaceSelectView.vue'), meta: { title: 'Select workspace', layout: 'auth', requiresAuth: true } },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/pages/dashboard.vue'), meta: { title: 'Dashboard', layout: 'default', requiresAuth: true } },
    { path: '/farms', name: 'farms', component: () => import('@/pages/farms.vue'), meta: { title: 'Farms', layout: 'default', requiresAuth: true } },
    { path: '/farms/:farmId', name: 'farm-detail', component: () => import('@/pages/farms.vue'), meta: { title: 'Farm detail', layout: 'default', requiresAuth: true } },
    { path: '/blocks', name: 'blocks', component: () => import('@/pages/blocks.vue'), meta: { title: 'Blocks', layout: 'default', requiresAuth: true } },
    { path: '/blocks/:blockId', name: 'block-detail', component: () => import('@/pages/blocks.vue'), meta: { title: 'Block detail', layout: 'default', requiresAuth: true } },
    { path: '/trees', name: 'trees', component: () => import('@/pages/trees.vue'), meta: { title: 'Trees', layout: 'default', requiresAuth: true } },
    { path: '/trees/:treeId', name: 'tree-detail', component: () => import('@/pages/trees.vue'), meta: { title: 'Tree detail', layout: 'default', requiresAuth: true } },
    { path: '/harvest', name: 'harvest', component: () => import('@/pages/harvest.vue'), meta: { title: 'Harvest', layout: 'default', requiresAuth: true } },
    { path: '/harvest/:harvestId', name: 'harvest-detail', component: () => import('@/pages/harvest.vue'), meta: { title: 'Harvest detail', layout: 'default', requiresAuth: true } },
    { path: '/activities', name: 'activities', component: () => import('@/pages/activities.vue'), meta: { title: 'Activities', layout: 'default', requiresAuth: true } },
    { path: '/activities/:activityId', name: 'activity-detail', component: () => import('@/pages/activities.vue'), meta: { title: 'Activity detail', layout: 'default', requiresAuth: true } },
    { path: '/inventory', name: 'inventory', component: () => import('@/pages/inventory.vue'), meta: { title: 'Inventory', layout: 'default', requiresAuth: true } },
    { path: '/sales', name: 'sales', component: () => import('@/pages/sales.vue'), meta: { title: 'Sales', layout: 'default', requiresAuth: true } },
    { path: '/sales/new', name: 'sales-new', component: () => import('@/pages/sales-new.vue'), meta: { title: 'New Sale', layout: 'default', requiresAuth: true } },
    { path: '/sales/:id', name: 'sale-detail', component: () => import('@/pages/sales-detail.vue'), meta: { title: 'Sales detail', layout: 'default', requiresAuth: true } },
    { path: '/customers', name: 'customers', component: () => import('@/pages/customers.vue'), meta: { title: 'Customers', layout: 'default', requiresAuth: true } },
    { path: '/customers/:customerId', name: 'customer-detail', component: () => import('@/pages/customers.vue'), meta: { title: 'Customer detail', layout: 'default', requiresAuth: true } },
    { path: '/sales-stock', name: 'salesStock', component: () => import('@/pages/sales-stock.vue'), meta: { title: 'Price & Stock', layout: 'default', requiresAuth: true } },
    { path: '/expenses', name: 'expenses', component: () => import('@/pages/expenses.vue'), meta: { title: 'Expenses', layout: 'default', requiresAuth: true } },
    { path: '/expenses/:expenseId', name: 'expense-detail', component: () => import('@/pages/expenses.vue'), meta: { title: 'Expense detail', layout: 'default', requiresAuth: true } },
    { path: '/reports', name: 'reports', component: () => import('@/pages/reports.vue'), meta: { title: 'Reports', layout: 'default', requiresAuth: true } },
    { path: '/users', name: 'users', component: () => import('@/pages/users.vue'), meta: { title: 'Users', layout: 'default', requiresAuth: true } },
    { path: '/settings', name: 'settings', component: () => import('@/pages/settings.vue'), meta: { title: 'Settings', layout: 'default', requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

installAuthGuards(router)

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | KebunHub` : 'KebunHub'
})

export default router
