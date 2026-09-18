<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
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
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  WalletCards,
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
import { mockExpenses } from "@/data/expenses";
import { mockFarms } from "@/data/farms";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/data/expenses";
import type { StatusTone } from "@/types/ui";
import { useSettingsStore } from "@/stores/settings";
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

interface ExpenseForm {
  date: string;
  category: ExpenseCategory;
  farmId: string;
  description: string;
  amount: string;
  paymentMethod: PaymentMethod;
  notes: string;
}
const expenses = ref<Expense[]>(
  mockExpenses.map((expense) => ({ ...expense })),
);
const route = useRoute();
const router = useRouter();
const search = ref("");
const dateRange = ref("all");
const farmFilter = ref("all");
const categoryFilter = ref("all");
const isLoading = ref(true);
const modalOpen = ref(false);
const confirmOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selectedExpense = ref<Expense | null>(null);
const formError = ref("");
const toast = ref<{
  title: string;
  description: string;
  tone: StatusTone;
} | null>(null);
const settingsStore = useSettingsStore();
const defaultFarmId = () =>
  settingsStore.settings.farm.defaultFarmId || mockFarms[0].id;
const defaultPaymentMethod = (): PaymentMethod =>
  settingsStore.settings.sales.defaultPaymentMethod === "Other"
    ? "Cash"
    : settingsStore.settings.sales.defaultPaymentMethod;
const form = reactive<ExpenseForm>({
  date: "2026-09-17",
  category: "Fertilizer",
  farmId: defaultFarmId(),
  description: "",
  amount: "",
  paymentMethod: defaultPaymentMethod(),
  notes: "",
});

const selectedDetail = computed(() =>
  expenses.value.find((expense) => expense.id === route.params.expenseId),
);
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const categories: ExpenseCategory[] = [
  "Fertilizer",
  "Pesticide",
  "Labor",
  "Equipment",
  "Transportation",
  "Maintenance",
  "Utilities",
  "Other",
];
const paymentMethods: PaymentMethod[] = ["Cash", "Bank Transfer", "E-wallet"];
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
const categoryOptions = [
  { label: "All categories", value: "all" },
  ...categories.map((category) => ({ label: category, value: category })),
];
const formCategoryOptions = categories.map((category) => ({
  label: category,
  value: category,
}));
const paymentOptions = paymentMethods.map((method) => ({
  label: method,
  value: method,
}));
const filteredExpenses = computed(() =>
  expenses.value.filter((expense) => {
    const query = search.value.trim().toLowerCase();
    const date = new Date(`${expense.date}T12:00:00`);
    const cutoff = new Date("2026-09-17T12:00:00");
    if (dateRange.value === "year" && date.getFullYear() !== 2026) return false;
    if (dateRange.value !== "all" && dateRange.value !== "year") {
      const start = new Date(cutoff);
      start.setDate(start.getDate() - Number(dateRange.value) + 1);
      if (date < start) return false;
    }
    return (
      (!query ||
        `${expense.id} ${expense.description}`.toLowerCase().includes(query)) &&
      (farmFilter.value === "all" || expense.farmId === farmFilter.value) &&
      (categoryFilter.value === "all" ||
        expense.category === categoryFilter.value)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedExpenses, rowNumber } = usePagination(filteredExpenses);
const monthExpenses = computed(() =>
  expenses.value.filter((expense) => expense.date.startsWith("2026-09")),
);
const yearExpenses = computed(() =>
  expenses.value.filter((expense) => expense.date.startsWith("2026")),
);
const totalAmount = (records: Expense[]) =>
  records.reduce((total, expense) => total + expense.amount, 0);
const categoryTone: Record<ExpenseCategory, StatusTone> = {
  Fertilizer: "success",
  Pesticide: "danger",
  Labor: "info",
  Equipment: "neutral",
  Transportation: "warning",
  Maintenance: "warning",
  Utilities: "info",
  Other: "neutral",
};
const monthlyChartData = computed(() => {
  const grouped = new Map<string, number>();
  filteredExpenses.value.forEach((expense) =>
    grouped.set(
      expense.date.slice(0, 7),
      (grouped.get(expense.date.slice(0, 7)) || 0) + expense.amount,
    ),
  );
  const keys = [...grouped.keys()].sort();
  return {
    labels: keys.map((key) =>
      new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "numeric",
      }).format(new Date(`${key}-01T12:00:00`)),
    ),
    datasets: [
      {
        label: "Expenses",
        data: keys.map((key) => grouped.get(key) || 0),
        borderColor: "#15803d",
        backgroundColor: "rgba(21, 128, 61, 0.11)",
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
const categoryChartData = computed(() => {
  const grouped = new Map<ExpenseCategory, number>();
  filteredExpenses.value.forEach((expense) =>
    grouped.set(
      expense.category,
      (grouped.get(expense.category) || 0) + expense.amount,
    ),
  );
  const labels = [...grouped.keys()];
  return {
    labels,
    datasets: [
      {
        data: labels.map((label) => grouped.get(label) || 0),
        backgroundColor: [
          "#15803d",
          "#ef4444",
          "#3b82f6",
          "#64748b",
          "#f59e0b",
          "#eab308",
          "#0ea5e9",
          "#94a3b8",
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };
});
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number | null } }) =>
          ` ${formatCurrency(context.parsed.y || 0)}`,
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
        callback: (value: string | number) =>
          `Rp${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(Number(value))}`,
      },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: "#64748b" },
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
      labels: { usePointStyle: true, padding: 12, boxWidth: 8 },
    },
    tooltip: {
      callbacks: {
        label: (context: { label?: string; parsed: number }) =>
          ` ${context.label}: ${formatCurrency(context.parsed)}`,
      },
    },
  },
};

onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);
function formatCurrency(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
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
    date: "2026-09-17",
    category: "Fertilizer",
    farmId: defaultFarmId(),
    description: "",
    amount: "",
    paymentMethod: defaultPaymentMethod(),
    notes: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(expense: Expense) {
  selectedExpense.value = expense;
  Object.assign(form, {
    date: expense.date,
    category: expense.category,
    farmId: expense.farmId,
    description: expense.description,
    amount: String(expense.amount),
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
  });
  modalMode.value = "edit";
  formError.value = "";
  modalOpen.value = true;
}
function saveExpense() {
  if (
    !form.date ||
    !form.category ||
    !form.farmId ||
    !form.description.trim() ||
    !form.amount ||
    !form.paymentMethod
  ) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const values = {
    date: form.date,
    category: form.category,
    farmId: form.farmId,
    description: form.description.trim(),
    amount: Number(form.amount),
    paymentMethod: form.paymentMethod,
    notes: form.notes.trim() || "No notes provided.",
  };
  if (modalMode.value === "edit" && selectedExpense.value) {
    Object.assign(selectedExpense.value, values);
    showToast(
      "Expense updated",
      `${selectedExpense.value.id} has been updated.`,
    );
  } else {
    const id = `EXP-${String(expenses.value.length + 1).padStart(4, "0")}`;
    expenses.value.unshift({ id, ...values });
    showToast("Expense added", `${id} has been added to the expense register.`);
  }
  modalOpen.value = false;
}
function askDelete(expense: Expense) {
  selectedExpense.value = expense;
  confirmOpen.value = true;
}
function deleteExpense() {
  if (!selectedExpense.value) return;
  const expenseId = selectedExpense.value.id;
  expenses.value = expenses.value.filter(
    (expense) => expense.id !== selectedExpense.value?.id,
  );
  confirmOpen.value = false;
  router.push("/expenses");
  showToast("Expense deleted", `${expenseId} was removed from the register.`);
}
</script>

<template>
  <div class="@container">
    <template v-if="selectedDetail">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/expenses"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All expenses</RouterLink
          >
          <h1 class="page-title">{{ selectedDetail.id }}</h1>
          <p class="secondary-text mt-2">
            {{ formatDate(selectedDetail.date) }}
            <span class="mx-1 text-slate-300">|</span>
            {{ selectedDetail.description }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="openEditModal(selectedDetail)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Expense</UiButton
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
          title="Expense detail"
          description="Recorded farm spending information."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Expense ID
              </p>
              <p class="mt-1 font-medium text-slate-900">
                {{ selectedDetail.id }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Date
              </p>
              <p class="mt-1 text-slate-700">
                {{ formatDate(selectedDetail.date) }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Category
              </p>
              <div class="mt-1">
                <UiBadge :tone="categoryTone[selectedDetail.category]">{{
                  selectedDetail.category
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
                {{ farmById(selectedDetail.farmId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Description
              </p>
              <p class="mt-1 text-slate-700">
                {{ selectedDetail.description }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Payment method
              </p>
              <p class="mt-1 text-slate-700">
                {{ selectedDetail.paymentMethod }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Notes
              </p>
              <p class="mt-1 leading-6 text-slate-700">
                {{ selectedDetail.notes }}
              </p>
            </div>
          </div></UiCard
        ><UiCard title="Amount" description="Total expense recorded."
          ><div class="rounded-lg bg-green-50 p-5">
            <WalletCards :size="22" class="text-green-700" aria-hidden="true" />
            <p class="mt-4 text-3xl font-semibold tabular-nums text-slate-900">
              {{ formatCurrency(selectedDetail.amount) }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              {{ selectedDetail.category }} expense
            </p>
          </div></UiCard
        >
      </section>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('expenses.title') }}</h1>
          <p class="secondary-text mt-2">
            Track farm spending, suppliers, and operational costs.
          </p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >Add Expense</UiButton
        >
      </header>
      <section
        class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-label="Expense summary"
      >
        <div class="ui-card p-5">
          <p class="text-sm text-slate-500">Expenses this month</p>
          <p class="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            {{ formatCurrency(totalAmount(monthExpenses)) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">September 2026</p>
        </div>
        <div class="ui-card p-5">
          <p class="text-sm text-slate-500">Expenses this year</p>
          <p class="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            {{ formatCurrency(totalAmount(yearExpenses)) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">January to September 2026</p>
        </div>
        <div class="ui-card p-5">
          <p class="text-sm text-slate-500">Average monthly expense</p>
          <p class="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            {{ formatCurrency(Math.round(totalAmount(yearExpenses) / 9)) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Based on recorded months</p>
        </div>
      </section>
      <section
        class="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.8fr)]"
      >
        <UiCard
          title="Monthly expense chart"
          description="Spending trend within the selected filters."
          ><template #actions
            ><UiSelect
              v-model="dateRange"
              label="Date range"
              :options="dateRangeOptions"
          /></template>
          <div class="h-72">
            <Line
              :data="monthlyChartData"
              :options="lineOptions"
            /></div></UiCard
        ><UiCard
          title="Expense by category"
          description="Distribution of spending by category."
          ><div class="h-72">
            <Doughnut
              :data="categoryChartData"
              :options="doughnutOptions"
            /></div
        ></UiCard>
      </section>
      <section class="mt-8" aria-label="Expense filters and list">
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <UiInput
              v-model="search"
              label="Search expenses"
              type="search"
              placeholder="Expense ID or description"
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
            v-model="categoryFilter"
            label="Category"
            :options="categoryOptions"
          />
        </div>
        <div
          v-if="isLoading"
          class="ui-card h-96 animate-pulse bg-slate-100"
          aria-label="Loading expenses"
        />
        <UiEmptyState
          v-else-if="!filteredExpenses.length"
          title="No expenses found"
          description="Try adjusting the date range or filters, or add a new expense."
          ><UiButton @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Add Expense</UiButton
          ></UiEmptyState
        ><UiTable v-else caption="Expense records"
          ><template #head
            ><tr>
              <th>{{ t('common.number') }}</th>
              <th>Date</th>
              <th>Category</th>
              <th>Farm</th>
              <th>Description</th>
              <th class="numeric">Amount</th>
              <th>Payment method</th>
              <th><span class="sr-only">Actions</span></th>
            </tr></template
          >
          <tr v-for="(expense, index) in paginatedExpenses" :key="expense.id" class="cursor-pointer transition-colors hover:bg-green-50/50" tabindex="0" @click="router.push(`/expenses/${expense.id}`)" @keydown.enter="router.push(`/expenses/${expense.id}`)">
            <td class="text-slate-500">{{ rowNumber(index) }}</td>
            <td class="whitespace-nowrap">{{ formatDate(expense.date) }}</td>
            <td>
              <UiBadge :tone="categoryTone[expense.category]">{{
                expense.category
              }}</UiBadge>
            </td>
            <td class="whitespace-nowrap">
              {{ farmById(expense.farmId)?.name }}
            </td>
            <td>{{ expense.description }}</td>
            <td class="numeric whitespace-nowrap font-medium text-slate-800">
              {{ formatCurrency(expense.amount) }}
            </td>
            <td class="whitespace-nowrap">{{ expense.paymentMethod }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  :aria-label="`Edit ${expense.id}`"
                  @click.stop="openEditModal(expense)"
                >
                  <MoreHorizontal :size="18" aria-hidden="true" /></button
                ><button
                  type="button"
                  class="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  :aria-label="`Delete ${expense.id}`"
                  @click.stop="askDelete(expense)"
                >
                  <Trash2 :size="16" aria-hidden="true" />
                </button>
              </div>
            </td></tr
        ></UiTable><UiPagination v-if="filteredExpenses.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredExpenses.length" />
      </section>
    </template>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Add expense' : 'Edit expense'"
      :description="
        modalMode === 'add'
          ? 'Record a farm expense in Indonesian Rupiah.'
          : 'Update this expense record.'
      "
      ><form id="expense-form" class="space-y-4" @submit.prevent="saveExpense">
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.date"
            label="Date"
            type="date"
            required
          /><UiSelect
            v-model="form.category"
            label="Category"
            :options="formCategoryOptions"
          />
        </div>
        <UiSelect
          v-model="form.farmId"
          label="Farm"
          :options="farmOptions.slice(1)"
        /><UiInput
          v-model="form.description"
          label="Description"
          placeholder="e.g. Irrigation pump maintenance"
          required
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.amount"
            label="Amount (Rp)"
            type="number"
            min="0"
            placeholder="0"
            required
          /><UiSelect
            v-model="form.paymentMethod"
            label="Payment method"
            :options="paymentOptions"
          />
        </div>
        <div class="space-y-1.5">
          <label for="expense-notes" class="ui-label">Notes</label
          ><textarea
            id="expense-notes"
            v-model="form.notes"
            class="ui-field min-h-24 resize-y"
            placeholder="Add expense notes."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="expense-form">{{
          modalMode === "add" ? "Add Expense" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete expense?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedExpense?.id
        }}</strong
        >? This expense record will be removed.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteExpense"
          >Delete Expense</UiButton
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
