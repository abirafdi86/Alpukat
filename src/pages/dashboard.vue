<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Line, Doughnut } from 'vue-chartjs'
import { ArcElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js'
import type { ChartData } from 'chart.js'
import { MoreHorizontal, Plus } from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { dashboardStats } from '@/data/dashboard'
import { useLocale } from '@/composables/useLocale'
import SalesPerformance from '@/components/sales/SalesPerformance.vue'

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip)

const harvestRanges = ['7 Days', '30 Days', '3 Months', '6 Months', '1 Year'] as const
const selectedRange = ref<(typeof harvestRanges)[number]>('30 Days')
const { locale, t, formatNumber } = useLocale()
const localizedStats = computed(() => dashboardStats.map((stat) => ({ ...stat, label: ({ 'total-trees': t('dashboard.totalTrees'), 'productive-trees': t('dashboard.productiveTrees'), 'monthly-harvest': t('dashboard.harvestThisMonth'), 'estimated-harvest': t('dashboard.estimatedHarvest'), activities: t('dashboard.farmActivities'), 'monthly-expenses': t('dashboard.monthlyExpenses') }[stat.id] || stat.label), unit: stat.id === 'monthly-harvest' || stat.id === 'estimated-harvest' ? t('common.kg') : stat.unit, description: stat.id === 'activities' ? `3 ${t('dashboard.needsAttention').toLocaleLowerCase()}` : stat.description })))

const harvestData = {
  '7 Days': { labels: ['Sep 11', 'Sep 12', 'Sep 13', 'Sep 14', 'Sep 15', 'Sep 16', 'Sep 17'], values: [118, 142, 128, 176, 154, 189, 204] },
  '30 Days': { labels: ['Aug 19', 'Aug 24', 'Aug 29', 'Sep 03', 'Sep 08', 'Sep 13', 'Sep 17'], values: [620, 740, 688, 910, 842, 1_020, 1_164] },
  '3 Months': { labels: ['Jul', 'Aug', 'Sep'], values: [4_280, 4_610, 4_820] },
  '6 Months': { labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], values: [3_680, 3_940, 4_120, 4_280, 4_610, 4_820] },
  '1 Year': { labels: ['Oct', 'Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Sep'], values: [3_120, 3_360, 3_540, 3_680, 4_120, 4_610, 4_820] },
} as const

const selectedHarvest = computed(() => harvestData[selectedRange.value])
const productionChartData = computed<ChartData<'line'>>(() => ({
  labels: [...selectedHarvest.value.labels],
  datasets: [{
    label: 'Harvest production',
    data: [...selectedHarvest.value.values],
    borderColor: '#15803d',
    backgroundColor: 'rgba(21, 128, 61, 0.11)',
    fill: true,
    tension: 0.38,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBackgroundColor: '#ffffff',
    pointBorderColor: '#15803d',
    pointBorderWidth: 2,
  }],
}))

const productionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (context: { parsed: { y: number | null } }) => ` ${context.parsed.y ?? 0} kg` } },
  },
  scales: {
    y: { beginAtZero: true, border: { display: false }, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b', callback: (value: string | number) => `${value} kg` } },
    x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0 } },
  },
}

const healthChartData = {
  labels: ['Healthy', 'Needs Attention', 'Sick'],
  datasets: [{ data: [78, 15, 7], backgroundColor: ['#15803d', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 5 }],
}

const healthChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context: { label?: string; parsed: number }) => ` ${context.label}: ${context.parsed}%` } } },
}

const activities = [
  { name: 'Fertilization', block: 'Block A', date: 'Today', tone: 'success' as const },
  { name: 'Pruning', block: 'Block C', date: 'Tomorrow', tone: 'info' as const },
  { name: 'Pest Control', block: 'Block B', date: 'Sep 21', tone: 'warning' as const },
]

const recentHarvest = [
  { date: 'Sep 17, 2026', farm: 'Sungai Hijau', block: 'Block A', variety: 'Hass', fruits: '1,248', weight: '204 kg', grade: 'Grade A', worker: 'Dimas P.' },
  { date: 'Sep 16, 2026', farm: 'Bukit Sari', block: 'Block C', variety: 'Fuerte', fruits: '986', weight: '176 kg', grade: 'Grade B', worker: 'Rani W.' },
  { date: 'Sep 15, 2026', farm: 'Sungai Hijau', block: 'Block B', variety: 'Hass', fruits: '1,104', weight: '189 kg', grade: 'Grade A', worker: 'Agus S.' },
  { date: 'Sep 14, 2026', farm: 'Citra Lestari', block: 'Block A', variety: 'Reed', fruits: '742', weight: '128 kg', grade: 'Grade C', worker: 'Nia K.' },
  { date: 'Sep 13, 2026', farm: 'Bukit Sari', block: 'Block B', variety: 'Hass', fruits: '416', weight: '74 kg', grade: 'Rejected', worker: 'Dimas P.' },
]

const gradeTone = { 'Grade A': 'success', 'Grade B': 'info', 'Grade C': 'warning', Rejected: 'danger' } as const
</script>

<template>
  <div class="@container">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="secondary-text mt-2">{{ t('dashboard.subtitle') }}</p>
      </div>
      <RouterLink to="/harvest" class="ui-button ui-button-primary shrink-0 self-start">
        <Plus :size="18" aria-hidden="true" />{{ t('dashboard.recordHarvest') }}
      </RouterLink>
    </header>
    <section class="mt-8" aria-labelledby="farm-overview-title">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 id="farm-overview-title" class="text-sm font-medium text-slate-700">{{ t('dashboard.farmOverview') }}</h2>
        <span class="text-xs text-slate-500">{{ t('common.demoData') }}</span>
      </div>
      <div class="grid grid-cols-1 gap-4 @min-[40rem]:grid-cols-2 @min-[60rem]:grid-cols-3 @min-[88rem]:grid-cols-6">
        <StatCard v-for="stat in localizedStats" :key="stat.id" v-bind="stat" />
      </div>
    </section>

    <section class="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]" aria-label="Farm analytics">
      <UiCard :title="t('dashboard.harvestProduction')" :description="locale === 'id' ? 'Total berat panen dari semua kebun' : 'Total harvested weight across all farms'">
        <template #actions>
          <div class="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" aria-label="Harvest production range" role="group">
            <button
              v-for="range in harvestRanges"
              :key="range"
              type="button"
              class="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3"
              :class="selectedRange === range ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              :aria-pressed="selectedRange === range"
              @click="selectedRange = range"
            >{{ ({ '7 Days': t('dashboard.sevenDays'), '30 Days': t('dashboard.thirtyDays'), '3 Months': t('dashboard.threeMonths'), '6 Months': t('dashboard.sixMonths'), '1 Year': t('dashboard.oneYear') }[range]) }}</button>
          </div>
        </template>
        <div class="h-72 w-full sm:h-80"><Line :data="productionChartData" :options="productionChartOptions" /></div>
        <div class="mt-4 flex items-center gap-2 text-xs text-slate-500"><span class="size-2 rounded-full bg-green-700" aria-hidden="true" />Harvest production <span class="ml-auto font-medium text-slate-700">kg</span></div>
      </UiCard>

      <UiCard :title="t('dashboard.treeHealth')" :description="locale === 'id' ? 'Kesehatan 1.248 pohon saat ini' : 'Current health across 1,248 trees'">
        <div class="relative mx-auto h-52 max-w-[15rem]"><Doughnut :data="healthChartData" :options="healthChartOptions" /><div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong class="text-3xl font-semibold tracking-tight text-slate-900">78%</strong><span class="text-xs text-slate-500">Healthy</span></div></div>
        <div class="mt-5 space-y-3">
          <div v-for="item in [{ label: t('dashboard.healthy'), value: '78%', color: 'bg-green-700' }, { label: t('dashboard.needsAttention'), value: '15%', color: 'bg-amber-500' }, { label: t('dashboard.sick'), value: '7%', color: 'bg-red-500' }]" :key="item.label" class="flex items-center justify-between text-sm"><span class="flex items-center gap-2 text-slate-600"><span class="size-2 rounded-full" :class="item.color" />{{ item.label }}</span><strong class="font-semibold text-slate-900">{{ item.value }}</strong></div>
        </div>
      </UiCard>
    </section>

    <section class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)]">
      <UiCard :title="t('dashboard.upcomingActivities')" :description="locale === 'id' ? 'Pekerjaan terjadwal untuk tim Anda' : 'Scheduled work for your teams'">
        <div class="divide-y divide-slate-100">
          <div v-for="activity in activities" :key="activity.name" class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-sm font-semibold text-green-700">{{ activity.name.charAt(0) }}</span><div class="min-w-0 flex-1"><p class="truncate font-medium text-slate-800">{{ activity.name }}</p><p class="mt-0.5 text-xs text-slate-500">{{ activity.block }}</p></div><UiBadge :tone="activity.tone">{{ activity.date }}</UiBadge></div>
        </div>
        <template #footer><RouterLink to="/activities" class="text-sm font-medium text-green-700 hover:text-green-800">View all activities <span aria-hidden="true">&rarr;</span></RouterLink></template>
      </UiCard>

      <UiTable :caption="t('dashboard.recentHarvest')">
        <template #head><tr><th>Date</th><th>Farm</th><th>Block</th><th>Variety</th><th class="numeric">Fruits</th><th class="numeric">Weight</th><th>Grade</th><th>Worker</th><th><span class="sr-only">Actions</span></th></tr></template>
        <tr v-for="harvest in recentHarvest" :key="`${harvest.date}-${harvest.block}`"><td class="whitespace-nowrap">{{ harvest.date }}</td><td class="whitespace-nowrap font-medium text-slate-800">{{ harvest.farm }}</td><td>{{ harvest.block }}</td><td>{{ harvest.variety }}</td><td class="numeric">{{ harvest.fruits }}</td><td class="numeric whitespace-nowrap">{{ harvest.weight }}</td><td><UiBadge :tone="gradeTone[harvest.grade as keyof typeof gradeTone]">{{ harvest.grade }}</UiBadge></td><td class="whitespace-nowrap">{{ harvest.worker }}</td><td><button type="button" class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" :aria-label="`More actions for ${harvest.date} harvest`"><MoreHorizontal :size="18" aria-hidden="true" /></button></td></tr>
      </UiTable>
    </section>
    <SalesPerformance />
  </div>
</template>
