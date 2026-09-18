<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Bar, Doughnut, Line } from "vue-chartjs";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  Download,
  FileBarChart,
  Leaf,
  Sprout,
  Trees as TreesIcon,
  WalletCards,
} from "lucide-vue-next";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiEmptyState,
  UiPagination,
  UiSelect,
  UiTable,
  UiToast,
} from "@/components/ui";
import { mockActivities } from "@/data/activities";
import { mockBlocks } from "@/data/blocks";
import { mockExpenses } from "@/data/expenses";
import { mockFarms } from "@/data/farms";
import { mockHarvests } from "@/data/harvest";
import { mockTrees } from "@/data/trees";
import { exportReport } from "@/utils/reportExport";
import type { ReportRow } from "@/utils/reportExport";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
const { t } = useLocale();

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

type ReportKey = "harvest" | "farm" | "tree" | "expense" | "maintenance";
const activeReport = ref<ReportKey>("harvest");
const dateRange = ref("all");
const farmFilter = ref("all");
const blockFilter = ref("all");
const varietyFilter = ref("all");
const isLoading = ref(true);
const toast = ref<{
  title: string;
  description: string;
  tone: "success" | "danger" | "info";
} | null>(null);
const reportTabs: { key: ReportKey; label: string }[] = [
  { key: "harvest", label: "Harvest Report" },
  { key: "farm", label: "Farm Productivity" },
  { key: "tree", label: "Tree Productivity" },
  { key: "expense", label: "Expense Report" },
  { key: "maintenance", label: "Maintenance Report" },
];
const dateRangeOptions = [
  { label: "All dates", value: "all" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 6 months", value: "180" },
  { label: "This year", value: "year" },
];
const farmOptions = [
  { label: "All farms", value: "all" },
  ...mockFarms.map((farm) => ({ label: farm.name, value: farm.id })),
];
const blockOptions = [
  { label: "All blocks", value: "all" },
  ...mockBlocks.map((block) => ({
    label: `${block.name} - ${mockFarms.find((farm) => farm.id === block.farmId)?.name}`,
    value: block.id,
  })),
];
const varietyOptions = [
  { label: "All varieties", value: "all" },
  ...["Hass", "Fuerte", "Reed"].map((variety) => ({
    label: variety,
    value: variety,
  })),
];
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const blockById = (blockId: string) =>
  mockBlocks.find((block) => block.id === blockId);
const formatCurrency = (value: number) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
const total = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0);
const inDateRange = (dateValue: string) => {
  if (dateRange.value === "all") return true;
  const date = new Date(`${dateValue}T12:00:00`);
  if (dateRange.value === "year") return date.getFullYear() === 2026;
  const start = new Date("2026-09-17T12:00:00");
  start.setDate(start.getDate() - Number(dateRange.value) + 1);
  return date >= start;
};
const matchesLocation = (farmId: string, blockId?: string, variety?: string) =>
  (farmFilter.value === "all" || farmId === farmFilter.value) &&
  (blockFilter.value === "all" || blockId === blockFilter.value) &&
  (varietyFilter.value === "all" || variety === varietyFilter.value);
const filteredHarvests = computed(() =>
  mockHarvests.filter(
    (item) =>
      inDateRange(item.harvestDate) &&
      matchesLocation(item.farmId, item.blockId, item.variety),
  ),
);
const filteredExpenses = computed(() =>
  mockExpenses.filter(
    (item) => inDateRange(item.date) && matchesLocation(item.farmId),
  ),
);
const filteredTrees = computed(() =>
  mockTrees.filter((item) =>
    matchesLocation(item.farmId, item.blockId, item.variety),
  ),
);
const filteredActivities = computed(() =>
  mockActivities.filter(
    (item) =>
      inDateRange(item.scheduledDate) &&
      matchesLocation(item.farmId, item.blockId),
  ),
);
const monthKeys = computed(() =>
  [
    ...new Set(
      filteredHarvests.value.map((item) => item.harvestDate.slice(0, 7)),
    ),
  ].sort(),
);
const harvestTrendData = computed(() => ({
  labels: monthKeys.value.map((key) =>
    new Intl.DateTimeFormat("id-ID", {
      month: "short",
      year: "numeric",
    }).format(new Date(`${key}-01T12:00:00`)),
  ),
  datasets: [
    {
      label: "Harvest",
      data: monthKeys.value.map((key) =>
        total(
          filteredHarvests.value
            .filter((item) => item.harvestDate.startsWith(key))
            .map((item) => item.totalWeight),
        ),
      ),
      borderColor: "#15803d",
      backgroundColor: "rgba(21, 128, 61, 0.1)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#15803d",
      pointBorderWidth: 2,
    },
  ],
}));
const farmChartData = computed(() => {
  const labels = mockFarms.map((farm) => farm.name);
  return {
    labels,
    datasets: [
      {
        data: mockFarms.map((farm) =>
          total(
            filteredHarvests.value
              .filter((item) => item.farmId === farm.id)
              .map((item) => item.totalWeight),
          ),
        ),
        backgroundColor: "#15803d",
        borderRadius: 5,
      },
    ],
  };
});
const treeChartData = computed(() => {
  const labels = ["Productive", "Not Productive", "Young Tree", "Dead"];
  return {
    labels,
    datasets: [
      {
        data: labels.map(
          (status) =>
            filteredTrees.value.filter(
              (tree) => tree.productivityStatus === status,
            ).length,
        ),
        backgroundColor: ["#15803d", "#f59e0b", "#3b82f6", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };
});
const expenseChartData = computed(() => {
  const labels = [
    ...new Set(filteredExpenses.value.map((item) => item.category)),
  ];
  return {
    labels,
    datasets: [
      {
        data: labels.map((label) =>
          total(
            filteredExpenses.value
              .filter((item) => item.category === label)
              .map((item) => item.amount),
          ),
        ),
        backgroundColor: [
          "#15803d",
          "#ef4444",
          "#3b82f6",
          "#f59e0b",
          "#eab308",
          "#0ea5e9",
          "#64748b",
          "#94a3b8",
        ],
        borderWidth: 0,
      },
    ],
  };
});
const maintenanceChartData = computed(() => {
  const labels = ["Scheduled", "In Progress", "Completed", "Cancelled"];
  return {
    labels,
    datasets: [
      {
        data: labels.map(
          (status) =>
            filteredActivities.value.filter(
              (activity) => activity.status === status,
            ).length,
        ),
        backgroundColor: ["#3b82f6", "#f59e0b", "#15803d", "#94a3b8"],
        borderRadius: 5,
      },
    ],
  };
});
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: "#e2e8f0" },
      ticks: {
        color: "#64748b",
        callback: (value: string | number) => `${value} kg`,
      },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: "#64748b" },
    },
  },
};
const barOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: "#e2e8f0" },
      ticks: { color: "#64748b" },
    },
    y: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: "#475569" },
    },
  },
};
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { usePointStyle: true, padding: 14, boxWidth: 8 },
    },
  },
};
const summaryCards = computed(() => {
  if (activeReport.value === "harvest")
    return [
      {
        label: "Total weight",
        value: `${formatNumber(total(filteredHarvests.value.map((item) => item.totalWeight)))} kg`,
        detail: `${filteredHarvests.value.length} harvest records`,
        icon: Sprout,
      },
      {
        label: "Total fruits",
        value: formatNumber(
          total(filteredHarvests.value.map((item) => item.fruits)),
        ),
        detail: "Collected fruits",
        icon: Leaf,
      },
      {
        label: "Average harvest",
        value: `${formatNumber(Math.round(total(filteredHarvests.value.map((item) => item.totalWeight)) / Math.max(filteredHarvests.value.length, 1)))} kg`,
        detail: "Per record",
        icon: FileBarChart,
      },
    ];
  if (activeReport.value === "farm")
    return [
      {
        label: "Farms reporting",
        value: String(
          mockFarms.filter(
            (farm) =>
              farmChartData.value.datasets[0].data[mockFarms.indexOf(farm)] > 0,
          ).length,
        ),
        detail: "With recorded harvest",
        icon: Sprout,
      },
      {
        label: "Total harvest",
        value: `${formatNumber(total(filteredHarvests.value.map((item) => item.totalWeight)))} kg`,
        detail: "Across selected farms",
        icon: Leaf,
      },
      {
        label: "Average per farm",
        value: `${formatNumber(Math.round(total(filteredHarvests.value.map((item) => item.totalWeight)) / Math.max(mockFarms.length, 1)))} kg`,
        detail: "Farm average",
        icon: FileBarChart,
      },
    ];
  if (activeReport.value === "tree")
    return [
      {
        label: "Trees in report",
        value: formatNumber(filteredTrees.value.length),
        detail: "Selected trees",
        icon: TreesIcon,
      },
      {
        label: "Productive trees",
        value: formatNumber(
          filteredTrees.value.filter(
            (tree) => tree.productivityStatus === "Productive",
          ).length,
        ),
        detail: "Currently productive",
        icon: Sprout,
      },
      {
        label: "Average harvest",
        value: `${formatNumber(Math.round(total(filteredTrees.value.map((tree) => tree.averageHarvest)) / Math.max(filteredTrees.value.length, 1)))} kg`,
        detail: "Per tree",
        icon: Leaf,
      },
    ];
  if (activeReport.value === "expense")
    return [
      {
        label: "Total expenses",
        value: formatCurrency(
          total(filteredExpenses.value.map((item) => item.amount)),
        ),
        detail: `${filteredExpenses.value.length} expense records`,
        icon: WalletCards,
      },
      {
        label: "Average expense",
        value: formatCurrency(
          Math.round(
            total(filteredExpenses.value.map((item) => item.amount)) /
              Math.max(filteredExpenses.value.length, 1),
          ),
        ),
        detail: "Per record",
        icon: FileBarChart,
      },
      {
        label: "Top category",
        value: expenseChartData.value.labels[0] || "-",
        detail: "By recorded amount",
        icon: WalletCards,
      },
    ];
  return [
    {
      label: "Total activities",
      value: formatNumber(filteredActivities.value.length),
      detail: "In selected range",
      icon: FileBarChart,
    },
    {
      label: "Completed",
      value: formatNumber(
        filteredActivities.value.filter(
          (activity) => activity.status === "Completed",
        ).length,
      ),
      detail: "Completed work",
      icon: Sprout,
    },
    {
      label: "Total cost",
      value: formatCurrency(
        total(filteredActivities.value.map((activity) => activity.cost)),
      ),
      detail: "Planned and recorded",
      icon: WalletCards,
    },
  ];
});
const tableRows = computed<ReportRow[]>(() => {
  if (activeReport.value === "harvest")
    return filteredHarvests.value.map((item) => ({
      ID: item.id,
      Date: formatDate(item.harvestDate),
      Farm: farmById(item.farmId)?.name || "",
      Block: blockById(item.blockId)?.name || "",
      Variety: item.variety,
      Weight: `${item.totalWeight} kg`,
      Grade: item.qualityGrade,
    }));
  if (activeReport.value === "farm")
    return mockFarms.map((farm) => ({
      Farm: farm.name,
      "Total Trees": farm.totalTrees,
      "Harvest Weight": `${total(filteredHarvests.value.filter((item) => item.farmId === farm.id).map((item) => item.totalWeight))} kg`,
      "Harvest Records": filteredHarvests.value.filter(
        (item) => item.farmId === farm.id,
      ).length,
    }));
  if (activeReport.value === "tree")
    return filteredTrees.value.map((tree) => ({
      "Tree ID": tree.id,
      Farm: farmById(tree.farmId)?.name || "",
      Block: blockById(tree.blockId)?.name || "",
      Variety: tree.variety,
      Productivity: tree.productivityStatus,
      Health: tree.health,
      "Lifetime Harvest": `${tree.historicalHarvest} kg`,
    }));
  if (activeReport.value === "expense")
    return filteredExpenses.value.map((item) => ({
      ID: item.id,
      Date: formatDate(item.date),
      Category: item.category,
      Farm: farmById(item.farmId)?.name || "",
      Description: item.description,
      Amount: formatCurrency(item.amount),
    }));
  return filteredActivities.value.map((item) => ({
    ID: item.id,
    Type: item.type,
    Date: formatDate(item.scheduledDate),
    Farm: farmById(item.farmId)?.name || "",
    Block: blockById(item.blockId)?.name || "",
    Worker: item.worker,
    Status: item.status,
    Cost: formatCurrency(item.cost),
  }));
});
const { page, pageSize, paginatedItems: paginatedRows } = usePagination(tableRows);

onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);
function reportTitle() {
  return (
    reportTabs.find((tab) => tab.key === activeReport.value)?.label || "Report"
  );
}
function notifyExport(format: string) {
  toast.value = {
    title: `${format} exported`,
    description: `${tableRows.value.length} rows exported from ${reportTitle()}.`,
    tone: "success",
  };
}
function exportCurrent(format: "csv" | "excel") {
  exportReport(format, tableRows.value, `${activeReport.value}-report`);
  notifyExport(format === "csv" ? "CSV" : "Excel");
}
</script>

<template>
  <div class="@container">
    <header
      class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 class="page-title">{{ t('reports.title') }}</h1>
        <p class="secondary-text mt-2">
          Review performance and operational data across AFMS.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton variant="secondary" @click="exportCurrent('csv')"
          ><template #leading
            ><Download :size="16" aria-hidden="true" /></template
          >CSV</UiButton
        ><UiButton variant="secondary" @click="exportCurrent('excel')"
          ><template #leading
            ><Download :size="16" aria-hidden="true" /></template
          >Excel</UiButton
        >
      </div>
    </header>
    <nav
      class="mt-8 overflow-x-auto border-b border-slate-200"
      aria-label="Report categories"
    >
      <div class="flex min-w-max gap-1">
        <button
          v-for="tab in reportTabs"
          :key="tab.key"
          type="button"
          class="border-b-2 px-4 py-3 text-sm font-medium"
          :class="
            activeReport === tab.key
              ? 'border-green-700 text-green-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          "
          :aria-current="activeReport === tab.key ? 'page' : undefined"
          @click="activeReport = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>
    <section
      class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Report filters"
    >
      <UiSelect
        v-model="dateRange"
        label="Date range"
        :options="dateRangeOptions"
      /><UiSelect
        v-model="farmFilter"
        label="Farm"
        :options="farmOptions"
      /><UiSelect
        v-model="blockFilter"
        label="Block"
        :options="blockOptions"
      /><UiSelect
        v-model="varietyFilter"
        label="Avocado variety"
        :options="varietyOptions"
      />
    </section>
    <section
      class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
      aria-label="Report summary"
    >
      <div v-for="card in summaryCards" :key="card.label" class="ui-card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <component
            :is="card.icon"
            :size="18"
            class="text-green-700"
            aria-hidden="true"
          />
        </div>
        <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
          {{ card.value }}
        </p>
        <p class="mt-1 text-xs text-slate-500">{{ card.detail }}</p>
      </div>
    </section>
    <template v-if="!isLoading">
      <section
        v-if="activeReport === 'harvest'"
        class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.8fr)]"
      >
        <UiCard
          title="Harvest trend"
          description="Weight produced over the selected period."
          ><div class="h-72">
            <Line
              :data="harvestTrendData"
              :options="lineOptions"
            /></div></UiCard
        ><UiCard
          title="Harvest quality"
          description="Harvest detail is available in the table below."
          ><div
            class="flex h-72 items-center justify-center rounded-lg bg-green-50"
          >
            <Sprout :size="52" class="text-green-700" aria-hidden="true" /></div
        ></UiCard>
      </section>
      <section v-else-if="activeReport === 'farm'" class="mt-6">
        <UiCard title="Farm productivity" description="Harvest weight by farm."
          ><div class="h-80">
            <Bar :data="farmChartData" :options="barOptions" /></div
        ></UiCard>
      </section>
      <section v-else-if="activeReport === 'tree'" class="mt-6">
        <UiCard
          title="Tree productivity distribution"
          description="Productivity status across selected trees."
          ><div class="mx-auto h-80 max-w-md">
            <Doughnut :data="treeChartData" :options="doughnutOptions" /></div
        ></UiCard>
      </section>
      <section v-else-if="activeReport === 'expense'" class="mt-6">
        <UiCard
          title="Expense by category"
          description="Spending distribution from the shared expense records."
          ><div class="mx-auto h-80 max-w-2xl">
            <Doughnut
              :data="expenseChartData"
              :options="doughnutOptions"
            /></div
        ></UiCard>
      </section>
      <section v-else class="mt-6">
        <UiCard
          title="Maintenance activity status"
          description="Activity completion across the selected period."
          ><div class="h-80">
            <Bar :data="maintenanceChartData" :options="barOptions" /></div
        ></UiCard>
      </section>
      <section class="mt-6">
        <UiEmptyState
          v-if="!tableRows.length"
          title="No report data"
          description="Try adjusting the report filters."
        /><UiTable v-else :caption="`${reportTitle()} data table`"
          ><template #head
            ><tr>
              <th v-for="header in Object.keys(tableRows[0])" :key="header">
                {{ header }}
              </th>
            </tr></template
          >
          <tr
            v-for="(row, index) in paginatedRows"
            :key="`${activeReport}-${index}`"
          >
            <td
              v-for="header in Object.keys(row)"
              :key="header"
              class="whitespace-nowrap"
            >
              {{ row[header] }}
            </td>
          </tr></UiTable><UiPagination v-if="tableRows.length" v-model:page="page" v-model:page-size="pageSize" :total="tableRows.length" />
      </section>
    </template>
    <div
      v-else
      class="ui-card mt-6 h-96 animate-pulse bg-slate-100"
      aria-label="Loading report"
    />
    <div
      v-if="toast"
      class="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
    >
      <UiToast v-bind="toast" @dismiss="toast = null" />
    </div>
  </div>
</template>
