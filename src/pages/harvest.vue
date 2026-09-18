<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
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
  ArrowLeft,
  Download,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-vue-next";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiEmptyState,
  UiInput,
  UiModal,
  UiPagination,
  UiSelect,
  UiTable,
  UiToast,
} from "@/components/ui";
import { mockBlocks } from "@/data/blocks";
import { mockFarms } from "@/data/farms";
import { mockTrees } from "@/data/trees";
import { mockHarvests } from "@/data/harvest";
import type {
  GradingResult,
  HarvestRecord,
  QualityGrade,
} from "@/data/harvest";
import type { StatusTone } from "@/types/ui";
import { useSalesStockStore } from "@/stores/salesStock";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
import { useSettingsStore } from "@/stores/settings";

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

interface HarvestForm {
  harvestDate: string;
  farmId: string;
  blockId: string;
  treeId: string;
  variety: string;
  fruits: string;
  totalWeight: string;
  qualityGrade: QualityGrade;
  gradeA: string;
  gradeB: string;
  gradeC: string;
  rejected: string;
  worker: string;
  notes: string;
}
const harvests = ref<HarvestRecord[]>(
  mockHarvests.map((harvest) => ({ ...harvest })),
);
const salesStockStore = useSalesStockStore();
const settingsStore = useSettingsStore();
const { t } = useLocale();
harvests.value.forEach((harvest) =>
  salesStockStore.registerHarvestBaseline(
    harvest.id,
    harvest.variety,
    harvest.gradingResult ?? {
      gradeA: harvest.qualityGrade === "Grade A" ? harvest.totalWeight : 0,
      gradeB: harvest.qualityGrade === "Grade B" ? harvest.totalWeight : 0,
      gradeC: harvest.qualityGrade === "Grade C" ? harvest.totalWeight : 0,
      rejected: harvest.qualityGrade === "Rejected" ? harvest.totalWeight : 0,
    },
    harvest.harvestDate,
  ),
);
const route = useRoute();
const router = useRouter();
const search = ref("");
const dateRange = ref("30");
const farmFilter = ref("all");
const blockFilter = ref("all");
const varietyFilter = ref("all");
const gradeFilter = ref("all");
const isLoading = ref(true);
const modalOpen = ref(false);
const confirmOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const formError = ref("");
const toast = ref<{
  title: string;
  description: string;
  tone: StatusTone;
} | null>(null);
const defaultFarmId = () =>
  settingsStore.settings.farm.defaultFarmId || mockFarms[0].id;
const defaultBlockId = () =>
  mockBlocks.find((block) => block.farmId === defaultFarmId())?.id ??
  mockBlocks[0].id;
const form = reactive<HarvestForm>({
  harvestDate: "2026-09-17",
  farmId: defaultFarmId(),
  blockId: defaultBlockId(),
  treeId: "",
  variety: settingsStore.settings.farm.defaultVariety,
  fruits: "",
  totalWeight: "",
  qualityGrade: "Grade A",
  gradeA: "",
  gradeB: "",
  gradeC: "",
  rejected: "",
  worker: "",
  notes: "",
});

const selectedHarvest = computed(() =>
  harvests.value.find((harvest) => harvest.id === route.params.harvestId),
);
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const blockById = (blockId: string) =>
  mockBlocks.find((block) => block.id === blockId);
const treeById = (treeId?: string) =>
  mockTrees.find((tree) => tree.id === treeId);
const dateRangeOptions = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 6 months", value: "180" },
  { label: "This year", value: "year" },
  { label: "All dates", value: "all" },
];
const farmOptions = [
  { label: "All farms", value: "all" },
  ...mockFarms.map((farm) => ({ label: farm.name, value: farm.id })),
];
const formFarmOptions = mockFarms.map((farm) => ({
  label: farm.name,
  value: farm.id,
}));
const blockOptions = computed(() => [
  { label: "All blocks", value: "all" },
  ...mockBlocks
    .filter(
      (block) =>
        farmFilter.value === "all" || block.farmId === farmFilter.value,
    )
    .map((block) => ({
      label: `${block.name} - ${farmById(block.farmId)?.name}`,
      value: block.id,
    })),
]);
const formBlockOptions = computed(() =>
  mockBlocks
    .filter((block) => block.farmId === form.farmId)
    .map((block) => ({
      label: `${block.name} (${block.id})`,
      value: block.id,
    })),
);
const formTreeOptions = computed(() => [
  { label: "No specific tree", value: "" },
  ...mockTrees
    .filter((tree) => tree.blockId === form.blockId)
    .map((tree) => ({ label: tree.id, value: tree.id })),
]);
const varieties = ["Hass", "Fuerte", "Reed"];
const varietyOptions = [
  { label: "All varieties", value: "all" },
  ...varieties.map((variety) => ({ label: variety, value: variety })),
];
const formVarietyOptions = varieties.map((variety) => ({
  label: variety,
  value: variety,
}));
const gradeOptions = [
  { label: "All grades", value: "all" },
  ...(["Grade A", "Grade B", "Grade C", "Rejected"] as QualityGrade[]).map(
    (grade) => ({ label: grade, value: grade }),
  ),
];
const formGradeOptions = gradeOptions.slice(1);
const gradeTone: Record<QualityGrade, StatusTone> = {
  "Grade A": "success",
  "Grade B": "info",
  "Grade C": "warning",
  Rejected: "danger",
};
const filteredHarvests = computed(() =>
  harvests.value.filter((harvest) => {
    const query = search.value.trim().toLowerCase();
    const date = new Date(`${harvest.harvestDate}T12:00:00`);
    const cutoff = new Date("2026-09-17T12:00:00");
    if (dateRange.value === "year" && date.getFullYear() !== 2026) return false;
    if (dateRange.value !== "all" && dateRange.value !== "year") {
      const days = Number(dateRange.value);
      const start = new Date(cutoff);
      start.setDate(start.getDate() - days + 1);
      if (date < start) return false;
    }
    return (
      (!query || harvest.id.toLowerCase().includes(query)) &&
      (farmFilter.value === "all" || harvest.farmId === farmFilter.value) &&
      (blockFilter.value === "all" || harvest.blockId === blockFilter.value) &&
      (varietyFilter.value === "all" ||
        harvest.variety === varietyFilter.value) &&
      (gradeFilter.value === "all" ||
        harvest.qualityGrade === gradeFilter.value)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedHarvests, rowNumber } = usePagination(filteredHarvests);
const totalWeight = (records: HarvestRecord[]) =>
  records.reduce((total, harvest) => total + harvest.totalWeight, 0);
const todayHarvest = computed(() =>
  harvests.value.filter((harvest) => harvest.harvestDate === "2026-09-17"),
);
const thisWeekHarvest = computed(() =>
  harvests.value.filter((harvest) => harvest.harvestDate >= "2026-09-11"),
);
const thisMonthHarvest = computed(() =>
  harvests.value.filter((harvest) => harvest.harvestDate.startsWith("2026-09")),
);
const thisYearHarvest = computed(() =>
  harvests.value.filter((harvest) => harvest.harvestDate.startsWith("2026")),
);
const trendData = computed(() => {
  const grouped = new Map<string, number>();
  filteredHarvests.value.forEach((harvest) =>
    grouped.set(
      harvest.harvestDate,
      (grouped.get(harvest.harvestDate) || 0) + harvest.totalWeight,
    ),
  );
  const labels = [...grouped.keys()].sort();
  return {
    labels: labels.map(formatDate),
    datasets: [
      {
        label: "Total weight",
        data: labels.map((label) => grouped.get(label) || 0),
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
  };
});
const byFarm = computed(() =>
  aggregateBy(
    filteredHarvests.value,
    (harvest) => farmById(harvest.farmId)?.name || harvest.farmId,
  ),
);
const byVariety = computed(() =>
  aggregateBy(filteredHarvests.value, (harvest) => harvest.variety),
);
const byGrade = computed(() =>
  aggregateBy(filteredHarvests.value, (harvest) => harvest.qualityGrade),
);
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number | null } }) =>
          ` ${context.parsed.y || 0} kg`,
      },
    },
  },
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
      ticks: { color: "#64748b", maxRotation: 0 },
    },
  },
};
const barOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { x: number | null } }) =>
          ` ${context.parsed.x || 0} kg`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: "#e2e8f0" },
      ticks: {
        color: "#64748b",
        callback: (value: string | number) => `${value} kg`,
      },
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
      labels: { usePointStyle: true, padding: 16 },
    },
  },
};

function aggregateBy(
  records: HarvestRecord[],
  key: (harvest: HarvestRecord) => string,
) {
  const grouped = new Map<string, number>();
  records.forEach((harvest) =>
    grouped.set(
      key(harvest),
      (grouped.get(key(harvest)) || 0) + harvest.totalWeight,
    ),
  );
  const labels = [...grouped.keys()];
  return {
    labels,
    datasets: [
      {
        data: labels.map((label) => grouped.get(label) || 0),
        backgroundColor: ["#15803d", "#65a30d", "#eab308", "#ef4444"],
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
function formatWeight(value: number) {
  return `${new Intl.NumberFormat("id-ID").format(value)} kg`;
}
function showToast(
  title: string,
  description: string,
  tone: StatusTone = "success",
) {
  toast.value = { title, description, tone };
  window.setTimeout(() => {
    toast.value = null;
  }, 4000);
}
function resetForm() {
  Object.assign(form, {
    harvestDate: "2026-09-17",
    farmId: defaultFarmId(),
    blockId: defaultBlockId(),
    treeId: "",
    variety: settingsStore.settings.farm.defaultVariety,
    fruits: "",
    totalWeight: "",
    qualityGrade: "Grade A",
    gradeA: "",
    gradeB: "",
    gradeC: "",
    rejected: "",
    worker: "",
    notes: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(harvest: HarvestRecord) {
  const grading = harvest.gradingResult ?? {
    gradeA: harvest.qualityGrade === "Grade A" ? harvest.totalWeight : 0,
    gradeB: harvest.qualityGrade === "Grade B" ? harvest.totalWeight : 0,
    gradeC: harvest.qualityGrade === "Grade C" ? harvest.totalWeight : 0,
    rejected: harvest.qualityGrade === "Rejected" ? harvest.totalWeight : 0,
  };
  Object.assign(form, {
    harvestDate: harvest.harvestDate,
    farmId: harvest.farmId,
    blockId: harvest.blockId,
    treeId: harvest.treeId || "",
    variety: harvest.variety,
    fruits: String(harvest.fruits),
    totalWeight: String(harvest.totalWeight),
    qualityGrade: harvest.qualityGrade,
    gradeA: String(grading.gradeA || ""),
    gradeB: String(grading.gradeB || ""),
    gradeC: String(grading.gradeC || ""),
    rejected: String(grading.rejected || ""),
    worker: harvest.worker,
    notes: harvest.notes,
  });
  modalMode.value = "edit";
  modalOpen.value = true;
}
function saveHarvest() {
  if (
    !form.harvestDate ||
    !form.farmId ||
    !form.blockId ||
    !form.fruits ||
    !form.totalWeight ||
    !form.worker
  ) {
    formError.value = t("harvestIntegration.validation.required");
    return;
  }
  const gradingResult: GradingResult = {
    gradeA: Number(form.gradeA || 0),
    gradeB: Number(form.gradeB || 0),
    gradeC: Number(form.gradeC || 0),
    rejected: Number(form.rejected || 0),
  };
  if (
    Object.values(gradingResult).some((value) => value < 0) ||
    Math.abs(
      Object.values(gradingResult).reduce((sum, value) => sum + value, 0) -
        Number(form.totalWeight),
    ) > 0.001
  ) {
    formError.value = t("harvestIntegration.validation.gradingTotal");
    return;
  }
  const grades: [QualityGrade, number][] = [
    ["Grade A", gradingResult.gradeA],
    ["Grade B", gradingResult.gradeB],
    ["Grade C", gradingResult.gradeC],
    ["Rejected", gradingResult.rejected],
  ];
  const qualityGrade = grades.sort((a, b) => b[1] - a[1])[0][0];
  const values = {
    harvestDate: form.harvestDate,
    farmId: form.farmId,
    blockId: form.blockId,
    treeId: form.treeId || undefined,
    variety: form.variety,
    fruits: Number(form.fruits),
    totalWeight: Number(form.totalWeight),
    qualityGrade,
    gradingResult,
    worker: form.worker.trim(),
    notes: form.notes.trim() || "No notes provided.",
  };
  if (modalMode.value === "edit" && selectedHarvest.value) {
    Object.assign(selectedHarvest.value, values);
    salesStockStore.receiveHarvest(
      selectedHarvest.value.id,
      values.variety,
      gradingResult,
      values.harvestDate,
    );
    showToast(
      t("harvestIntegration.toast.updated"),
      t("harvestIntegration.toast.updatedDescription", {
        id: selectedHarvest.value.id,
      }),
    );
  } else {
    const id = `HRV-2026-0917-${String(harvests.value.length + 1).padStart(2, "0")}`;
    harvests.value.unshift({ id, ...values });
    salesStockStore.receiveHarvest(
      id,
      values.variety,
      gradingResult,
      values.harvestDate,
    );
    showToast(
      t("harvestIntegration.toast.recorded"),
      t("harvestIntegration.toast.stockReceived", { id }),
    );
  }
  modalOpen.value = false;
}
function deleteHarvest() {
  if (!selectedHarvest.value) return;
  const harvestId = selectedHarvest.value.id;
  salesStockStore.removeHarvest(harvestId);
  harvests.value = harvests.value.filter(
    (harvest) => harvest.id !== selectedHarvest.value?.id,
  );
  confirmOpen.value = false;
  router.push("/harvest");
  showToast("Harvest deleted", `${harvestId} was removed from the register.`);
}
function exportRows() {
  return filteredHarvests.value.map((harvest) => ({
    "Harvest ID": harvest.id,
    "Harvest Date": formatDate(harvest.harvestDate),
    Farm: farmById(harvest.farmId)?.name || "",
    Block: blockById(harvest.blockId)?.name || "",
    Tree: harvest.treeId || "-",
    Variety: harvest.variety,
    "Number of Fruits": harvest.fruits,
    "Total Weight": formatWeight(harvest.totalWeight),
    "Quality Grade": harvest.qualityGrade,
    Worker: harvest.worker,
    Notes: harvest.notes,
  }));
}
function downloadCsv() {
  const rows = exportRows();
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers,
    ...rows.map((row) =>
      headers.map((header) =>
        JSON.stringify(row[header as keyof typeof row] ?? ""),
      ),
    ),
  ]
    .map((row) => row.join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "harvest-export.csv");
  showToast("CSV exported", `${rows.length} harvest records exported.`);
}
function downloadExcel() {
  const rows = exportRows();
  const headers = Object.keys(rows[0] || {});
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Harvest"><Table><Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("")}</Row>${rows.map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(String(row[header as keyof typeof row] ?? ""))}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`;
  downloadBlob(
    new Blob([xml], { type: "application/vnd.ms-excel" }),
    "harvest-export.xls",
  );
  showToast("Excel exported", `${rows.length} harvest records exported.`);
}
function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] || character,
  );
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);
</script>

<template>
  <div class="@container">
    <template v-if="selectedHarvest">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/harvest"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All harvests</RouterLink
          >
          <h1 class="page-title">{{ selectedHarvest.id }}</h1>
          <p class="secondary-text mt-2">
            {{ formatDate(selectedHarvest.harvestDate) }}
            <span class="mx-1 text-slate-300">|</span>
            {{ farmById(selectedHarvest.farmId)?.name }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="openEditModal(selectedHarvest)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Harvest</UiButton
          ><UiButton variant="danger" @click="confirmOpen = true"
            ><template #leading
              ><Trash2 :size="16" aria-hidden="true" /></template
            >Delete</UiButton
          >
        </div>
      </header>
      <section
        class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]"
      >
        <UiCard
          title="Harvest information"
          description="Recorded harvest details."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Harvest date
              </p>
              <p class="mt-1 text-slate-700">
                {{ formatDate(selectedHarvest.harvestDate) }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Quality grade
              </p>
              <div class="mt-1">
                <UiBadge :tone="gradeTone[selectedHarvest.qualityGrade]">{{
                  selectedHarvest.qualityGrade
                }}</UiBadge>
              </div>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Farm
              </p>
              <p class="mt-1 text-slate-700">
                {{ farmById(selectedHarvest.farmId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Block
              </p>
              <p class="mt-1 text-slate-700">
                {{ blockById(selectedHarvest.blockId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Tree
              </p>
              <p class="mt-1 text-slate-700">
                {{ selectedHarvest.treeId || "Multiple trees" }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Variety
              </p>
              <p class="mt-1 text-slate-700">{{ selectedHarvest.variety }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Worker
              </p>
              <p class="mt-1 text-slate-700">{{ selectedHarvest.worker }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Notes
              </p>
              <p class="mt-1 text-slate-700">{{ selectedHarvest.notes }}</p>
            </div>
          </div></UiCard
        ><UiCard
          title="Harvest totals"
          description="Output from this collection record."
          ><div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-green-50 p-4">
              <p class="text-2xl font-semibold tabular-nums text-slate-900">
                {{ selectedHarvest.fruits }}
              </p>
              <p class="text-xs text-slate-500">Fruits</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-4">
              <p class="text-2xl font-semibold tabular-nums text-slate-900">
                {{ formatWeight(selectedHarvest.totalWeight) }}
              </p>
              <p class="text-xs text-slate-500">Total weight</p>
            </div>
          </div></UiCard
        >
      </section>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('harvest.title') }}</h1>
          <p class="secondary-text mt-2">
            Record, analyze, and export avocado harvest performance.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="downloadCsv"
            ><template #leading
              ><Download :size="16" aria-hidden="true" /></template
            >CSV</UiButton
          ><UiButton variant="secondary" @click="downloadExcel"
            ><template #leading
              ><Download :size="16" aria-hidden="true" /></template
            >Excel</UiButton
          ><UiButton @click="openAddModal"
            ><template #leading><Plus :size="18" aria-hidden="true" /></template
            >Record Harvest</UiButton
          >
        </div>
      </header>
      <section
        class="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4"
        aria-label="Harvest summary"
      >
        <div
          v-for="summary in [
            { label: 'Today\'s Harvest', value: totalWeight(todayHarvest) },
            { label: 'This Week', value: totalWeight(thisWeekHarvest) },
            { label: 'This Month', value: totalWeight(thisMonthHarvest) },
            { label: 'This Year', value: totalWeight(thisYearHarvest) },
          ]"
          :key="summary.label"
          class="ui-card p-5"
        >
          <p class="text-sm text-slate-500">{{ summary.label }}</p>
          <p class="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            {{ formatWeight(summary.value) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Total weight</p>
        </div>
      </section>
      <section
        class="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.8fr)]"
      >
        <UiCard
          title="Harvest trend"
          description="Harvest weight within the selected filters."
          ><template #actions
            ><UiSelect
              v-model="dateRange"
              label="Date range"
              :options="dateRangeOptions"
          /></template>
          <div class="h-72">
            <Line :data="trendData" :options="lineOptions" /></div></UiCard
        ><UiCard
          title="Harvest by grade"
          description="Quality distribution by weight."
          ><div class="h-72">
            <Doughnut :data="byGrade" :options="doughnutOptions" /></div
        ></UiCard>
      </section>
      <section class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UiCard
          title="Harvest by farm"
          description="Weight contribution by farm."
          ><div class="h-64">
            <Bar :data="byFarm" :options="barOptions" /></div></UiCard
        ><UiCard
          title="Harvest by variety"
          description="Weight contribution by avocado variety."
          ><div class="h-64">
            <Bar :data="byVariety" :options="barOptions" /></div
        ></UiCard>
      </section>
      <section class="mt-8" aria-label="Harvest list">
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div class="sm:col-span-2 xl:col-span-1">
            <UiInput
              v-model="search"
              label="Search Harvest ID"
              type="search"
              placeholder="e.g. HRV-2026"
              ><template #trailing
                ><Search
                  :size="17"
                  class="text-slate-400"
                  aria-hidden="true" /></template
            ></UiInput>
          </div>
          <UiSelect
            v-model="farmFilter"
            label="Farm"
            :options="farmOptions"
          /><UiSelect
            v-model="blockFilter"
            label="Block"
            :options="blockOptions"
          /><UiSelect
            v-model="varietyFilter"
            label="Variety"
            :options="varietyOptions"
          /><UiSelect
            v-model="gradeFilter"
            label="Quality grade"
            :options="gradeOptions"
          />
        </div>
        <div
          v-if="isLoading"
          class="ui-card h-96 animate-pulse bg-slate-100"
          aria-label="Loading harvests"
        />
        <UiEmptyState
          v-else-if="!filteredHarvests.length"
          title="No harvest records found"
          description="Try adjusting the date range or filters, or record a new harvest."
          ><UiButton @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Record Harvest</UiButton
          ></UiEmptyState
        ><UiTable v-else caption="Harvest records"
          ><template #head
            ><tr>
              <th>{{ t('common.number') }}</th>
              <th>Harvest date</th>
              <th>Farm</th>
              <th>Block</th>
              <th>Tree</th>
              <th>Variety</th>
              <th class="numeric">Fruits</th>
              <th class="numeric">Weight</th>
              <th>Grade</th>
              <th>Worker</th>
              <th><span class="sr-only">Actions</span></th>
            </tr></template
          >
          <tr v-for="(harvest, index) in paginatedHarvests" :key="harvest.id" class="cursor-pointer transition-colors hover:bg-green-50/50" tabindex="0" @click="router.push(`/harvest/${harvest.id}`)" @keydown.enter="router.push(`/harvest/${harvest.id}`)">
            <td class="text-slate-500">{{ rowNumber(index) }}</td>
            <td class="whitespace-nowrap">
              {{ formatDate(harvest.harvestDate) }}
            </td>
            <td class="whitespace-nowrap">
              {{ farmById(harvest.farmId)?.name }}
            </td>
            <td>{{ blockById(harvest.blockId)?.name }}</td>
            <td>{{ harvest.treeId || "-" }}</td>
            <td>{{ harvest.variety }}</td>
            <td class="numeric">{{ harvest.fruits }}</td>
            <td class="numeric whitespace-nowrap">
              {{ formatWeight(harvest.totalWeight) }}
            </td>
            <td>
              <UiBadge :tone="gradeTone[harvest.qualityGrade]">{{
                harvest.qualityGrade
              }}</UiBadge>
            </td>
            <td class="whitespace-nowrap">{{ harvest.worker }}</td>
            <td>
              <button
                type="button"
                class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                :aria-label="`Edit ${harvest.id}`"
                @click.stop="openEditModal(harvest)"
              >
                <MoreHorizontal :size="18" aria-hidden="true" />
              </button>
            </td></tr
        ></UiTable><UiPagination v-if="filteredHarvests.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredHarvests.length" />
      </section>
    </template>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Record harvest' : 'Edit harvest'"
      :description="
        modalMode === 'add'
          ? 'Add a new harvest collection record.'
          : 'Update this harvest collection record.'
      "
    >
      <form id="harvest-form" class="space-y-4" @submit.prevent="saveHarvest">
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.harvestDate"
            label="Harvest date"
            type="date"
            required
          /><UiInput
            v-model="form.worker"
            label="Worker"
            placeholder="Worker name"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.farmId"
            label="Farm"
            :options="formFarmOptions"
          /><UiSelect
            v-model="form.blockId"
            label="Block"
            :options="formBlockOptions"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.treeId"
            label="Tree (optional)"
            :options="formTreeOptions"
          /><UiSelect
            v-model="form.variety"
            label="Avocado variety"
            :options="formVarietyOptions"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.fruits"
            label="Number of fruits"
            type="number"
            min="1"
            placeholder="0"
            required
          /><UiInput
            v-model="form.totalWeight"
            label="Total weight (kg)"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            required
          />
        </div>
        <fieldset class="rounded-xl border border-slate-200 p-4">
          <legend class="px-2 text-sm font-semibold text-slate-800">
            {{ t("harvestIntegration.grading.title") }}
          </legend>
          <p class="mb-4 text-sm text-slate-500">
            {{ t("harvestIntegration.grading.description") }}
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <UiInput
              v-model="form.gradeA"
              label="Grade A (kg)"
              type="number"
              min="0"
              step="0.1"
            /><UiInput
              v-model="form.gradeB"
              label="Grade B (kg)"
              type="number"
              min="0"
              step="0.1"
            /><UiInput
              v-model="form.gradeC"
              label="Grade C (kg)"
              type="number"
              min="0"
              step="0.1"
            /><UiInput
              v-model="form.rejected"
              :label="t('harvestIntegration.grading.rejected')"
              type="number"
              min="0"
              step="0.1"
            />
          </div>
          <p class="mt-3 text-xs text-slate-500">
            {{ t("harvestIntegration.grading.sellableHint") }}
          </p>
        </fieldset>
        <div class="space-y-1.5">
          <label for="harvest-notes" class="ui-label">Notes</label
          ><textarea
            id="harvest-notes"
            v-model="form.notes"
            class="ui-field min-h-24 resize-y"
            placeholder="Add harvest notes."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="harvest-form">{{
          modalMode === "add" ? "Record Harvest" : "Save Changes"
        }}</UiButton></template
      >
    </UiModal>
    <UiModal
      v-model="confirmOpen"
      title="Delete harvest?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedHarvest?.id
        }}</strong
        >? This harvest record will be removed from the register.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteHarvest"
          >Delete Harvest</UiButton
        ></template
      ></UiModal
    >
    <div
      v-if="toast"
      class="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
    >
      <UiToast v-bind="toast" @dismiss="toast = null" />
    </div>
  </div>
</template>
