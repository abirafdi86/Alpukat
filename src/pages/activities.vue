<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit3,
  List,
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
import { mockActivities } from "@/data/activities";
import { mockBlocks } from "@/data/blocks";
import { mockFarms } from "@/data/farms";
import { mockTrees } from "@/data/trees";
import type { Activity, ActivityStatus, ActivityType } from "@/data/activities";
import type { StatusTone } from "@/types/ui";
import { useSettingsStore } from "@/stores/settings";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
const { t } = useLocale();

interface ActivityForm {
  type: ActivityType;
  farmId: string;
  blockId: string;
  treeId: string;
  scheduledDate: string;
  worker: string;
  status: ActivityStatus;
  notes: string;
  cost: string;
}
const activities = ref<Activity[]>(
  mockActivities.map((activity) => ({ ...activity })),
);
const route = useRoute();
const router = useRouter();
const search = ref("");
const typeFilter = ref("all");
const farmFilter = ref("all");
const workerFilter = ref("all");
const statusFilter = ref("all");
const dateFilter = ref("");
const view = ref<"list" | "calendar">("list");
const calendarMonth = ref("2026-09");
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
const settingsStore = useSettingsStore();
const defaultFarmId = () =>
  settingsStore.settings.farm.defaultFarmId || mockFarms[0].id;
const defaultBlockId = () =>
  mockBlocks.find((block) => block.farmId === defaultFarmId())?.id ??
  mockBlocks[0].id;
const form = reactive<ActivityForm>({
  type: "Watering",
  farmId: defaultFarmId(),
  blockId: defaultBlockId(),
  treeId: "",
  scheduledDate: "2026-09-17",
  worker: "",
  status: "Scheduled",
  notes: "",
  cost: "",
});

const selectedActivity = computed(() =>
  activities.value.find((activity) => activity.id === route.params.activityId),
);
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const blockById = (blockId: string) =>
  mockBlocks.find((block) => block.id === blockId);
const activityTypes: ActivityType[] = [
  "Watering",
  "Fertilization",
  "Pruning",
  "Pest Control",
  "Disease Treatment",
  "Cleaning",
  "Harvest Preparation",
  "Other",
];
const activityStatuses: ActivityStatus[] = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];
const workers = [...new Set(mockActivities.map((activity) => activity.worker))];
const typeOptions = [
  { label: "All activity types", value: "all" },
  ...activityTypes.map((type) => ({ label: type, value: type })),
];
const farmOptions = [
  { label: "All farms", value: "all" },
  ...mockFarms.map((farm) => ({ label: farm.name, value: farm.id })),
];
const workerOptions = [
  { label: "All workers", value: "all" },
  ...workers.map((worker) => ({ label: worker, value: worker })),
];
const statusOptions = [
  { label: "All statuses", value: "all" },
  ...activityStatuses.map((status) => ({ label: status, value: status })),
];
const formTypeOptions = activityTypes.map((type) => ({
  label: type,
  value: type,
}));
const formFarmOptions = mockFarms.map((farm) => ({
  label: farm.name,
  value: farm.id,
}));
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
const formStatusOptions = activityStatuses.map((status) => ({
  label: status,
  value: status,
}));
const filteredActivities = computed(() =>
  activities.value.filter((activity) => {
    const query = search.value.trim().toLowerCase();
    return (
      (!query ||
        `${activity.id} ${activity.worker} ${activity.type}`
          .toLowerCase()
          .includes(query)) &&
      (typeFilter.value === "all" || activity.type === typeFilter.value) &&
      (farmFilter.value === "all" || activity.farmId === farmFilter.value) &&
      (workerFilter.value === "all" ||
        activity.worker === workerFilter.value) &&
      (statusFilter.value === "all" ||
        activity.status === statusFilter.value) &&
      (!dateFilter.value || activity.scheduledDate === dateFilter.value)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedActivities, rowNumber } = usePagination(filteredActivities);
const statusTone: Record<ActivityStatus, StatusTone> = {
  Scheduled: "info",
  "In Progress": "warning",
  Completed: "success",
  Cancelled: "neutral",
};
const typeTone: Record<ActivityType, string> = {
  Watering: "bg-blue-50 text-blue-700",
  Fertilization: "bg-green-50 text-green-700",
  Pruning: "bg-amber-50 text-amber-700",
  "Pest Control": "bg-red-50 text-red-700",
  "Disease Treatment": "bg-red-50 text-red-700",
  Cleaning: "bg-slate-100 text-slate-700",
  "Harvest Preparation": "bg-lime-50 text-lime-700",
  Other: "bg-slate-100 text-slate-700",
};
const calendarCells = computed(() => {
  const [year, month] = calendarMonth.value.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) =>
        `${calendarMonth.value}-${String(index + 1).padStart(2, "0")}`,
    ),
    ...Array(Math.max(0, 42 - firstDay - daysInMonth)).fill(null),
  ];
});
const calendarTitle = computed(() =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(`${calendarMonth.value}-01T12:00:00`),
  ),
);
const isOverdue = (activity: Activity) =>
  activity.status !== "Completed" &&
  activity.status !== "Cancelled" &&
  activity.scheduledDate < "2026-09-17";
const activitiesForDate = (date: string) =>
  filteredActivities.value.filter(
    (activity) => activity.scheduledDate === date,
  );

onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
function formatCost(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
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
    type: "Watering",
    farmId: defaultFarmId(),
    blockId: defaultBlockId(),
    treeId: "",
    scheduledDate: "2026-09-17",
    worker: "",
    status: "Scheduled",
    notes: "",
    cost: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(activity: Activity) {
  Object.assign(form, {
    type: activity.type,
    farmId: activity.farmId,
    blockId: activity.blockId,
    treeId: activity.treeId || "",
    scheduledDate: activity.scheduledDate,
    worker: activity.worker,
    status: activity.status,
    notes: activity.notes,
    cost: String(activity.cost),
  });
  modalMode.value = "edit";
  modalOpen.value = true;
}
function saveActivity() {
  if (
    !form.type ||
    !form.farmId ||
    !form.blockId ||
    !form.scheduledDate ||
    !form.worker
  ) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const values = {
    type: form.type,
    farmId: form.farmId,
    blockId: form.blockId,
    treeId: form.treeId || undefined,
    scheduledDate: form.scheduledDate,
    worker: form.worker.trim(),
    status: form.status,
    notes: form.notes.trim() || "No notes provided.",
    cost: Number(form.cost) || 0,
  };
  if (modalMode.value === "edit" && selectedActivity.value) {
    Object.assign(selectedActivity.value, values);
    showToast(
      "Activity updated",
      `${selectedActivity.value.id} has been updated.`,
    );
  } else {
    const id = `ACT-${String(activities.value.length + 1).padStart(4, "0")}`;
    activities.value.unshift({ id, ...values });
    showToast("Activity added", `${id} is now scheduled.`);
  }
  modalOpen.value = false;
}
function completeActivity(activity: Activity) {
  activity.status = "Completed";
  showToast("Activity completed", `${activity.id} was marked as completed.`);
}
function deleteActivity() {
  if (!selectedActivity.value) return;
  const activityId = selectedActivity.value.id;
  activities.value = activities.value.filter(
    (activity) => activity.id !== selectedActivity.value?.id,
  );
  confirmOpen.value = false;
  router.push("/activities");
  showToast("Activity deleted", `${activityId} was removed.`);
}
function changeMonth(offset: number) {
  const [year, month] = calendarMonth.value.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  calendarMonth.value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}
</script>

<template>
  <div class="@container">
    <template v-if="selectedActivity">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/activities"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All
            activities</RouterLink
          >
          <h1 class="page-title">{{ selectedActivity.id }}</h1>
          <p class="secondary-text mt-2">
            {{ selectedActivity.type }}
            <span class="mx-1 text-slate-300">|</span>
            {{ formatDate(selectedActivity.scheduledDate) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton
            v-if="
              selectedActivity.status !== 'Completed' &&
              selectedActivity.status !== 'Cancelled'
            "
            variant="secondary"
            @click="completeActivity(selectedActivity)"
            ><template #leading
              ><Check :size="16" aria-hidden="true" /></template
            >Complete Activity</UiButton
          ><UiButton
            variant="secondary"
            @click="openEditModal(selectedActivity)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Activity</UiButton
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
          title="Activity detail"
          description="Scheduled farm work and assignment details."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Activity type
              </p>
              <div class="mt-1">
                <span
                  class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="typeTone[selectedActivity.type]"
                  >{{ selectedActivity.type }}</span
                >
              </div>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Status
              </p>
              <div class="mt-1">
                <UiBadge :tone="statusTone[selectedActivity.status]">{{
                  selectedActivity.status
                }}</UiBadge
                ><span
                  v-if="isOverdue(selectedActivity)"
                  class="ml-2 text-xs font-medium text-red-700"
                  >Overdue</span
                >
              </div>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Farm
              </p>
              <p class="mt-1 text-slate-700">
                {{ farmById(selectedActivity.farmId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Block
              </p>
              <p class="mt-1 text-slate-700">
                {{ blockById(selectedActivity.blockId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Tree
              </p>
              <p class="mt-1 text-slate-700">
                {{ selectedActivity.treeId || "All trees in block" }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Assigned worker
              </p>
              <p class="mt-1 text-slate-700">{{ selectedActivity.worker }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Scheduled date
              </p>
              <p class="mt-1 text-slate-700">
                {{ formatDate(selectedActivity.scheduledDate) }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Cost
              </p>
              <p class="mt-1 text-slate-700">
                {{ formatCost(selectedActivity.cost) }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Notes
              </p>
              <p class="mt-1 leading-6 text-slate-700">
                {{ selectedActivity.notes }}
              </p>
            </div>
          </div></UiCard
        ><UiCard
          title="Assignment"
          description="Where this activity will be performed."
          ><div class="rounded-lg bg-green-50 p-5">
            <p class="text-sm font-medium text-green-900">
              {{ farmById(selectedActivity.farmId)?.name }}
            </p>
            <p class="mt-1 text-sm text-green-800">
              {{ blockById(selectedActivity.blockId)?.name }}
            </p>
            <p class="mt-4 text-xs text-green-700">
              {{
                selectedActivity.treeId
                  ? `Tree ${selectedActivity.treeId}`
                  : "Block-wide activity"
              }}
            </p>
          </div>
          <div
            v-if="isOverdue(selectedActivity)"
            class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <strong>Overdue activity.</strong> This work was scheduled for
            {{ formatDate(selectedActivity.scheduledDate) }}.
          </div></UiCard
        >
      </section>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('activities.title') }}</h1>
          <p class="secondary-text mt-2">
            Plan and track work across your farms and blocks.
          </p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >Add Activity</UiButton
        >
      </header>
      <section class="mt-8" aria-label="Activity filters">
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div class="sm:col-span-2 xl:col-span-1">
            <UiInput
              v-model="search"
              label="Search activities"
              type="search"
              placeholder="ID, type, worker"
              ><template #trailing
                ><Search
                  :size="17"
                  class="text-slate-400"
                  aria-hidden="true" /></template
            ></UiInput>
          </div>
          <UiSelect
            v-model="typeFilter"
            label="Activity type"
            :options="typeOptions"
          /><UiSelect
            v-model="farmFilter"
            label="Farm"
            :options="farmOptions"
          /><UiSelect
            v-model="workerFilter"
            label="Worker"
            :options="workerOptions"
          /><UiSelect
            v-model="statusFilter"
            label="Status"
            :options="statusOptions"
          /><UiInput v-model="dateFilter" label="Date" type="date" />
        </div>
        <div class="mb-5 flex items-center justify-between gap-3">
          <p class="text-sm text-slate-500">
            {{ filteredActivities.length }} activities
          </p>
          <div
            class="flex gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Activity view"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
              :class="
                view === 'list'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-slate-500'
              "
              :aria-pressed="view === 'list'"
              @click="view = 'list'"
            >
              <List :size="15" aria-hidden="true" />List</button
            ><button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
              :class="
                view === 'calendar'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-slate-500'
              "
              :aria-pressed="view === 'calendar'"
              @click="view = 'calendar'"
            >
              <CalendarDays :size="15" aria-hidden="true" />Calendar
            </button>
          </div>
        </div>
        <div
          v-if="isLoading"
          class="ui-card h-96 animate-pulse bg-slate-100"
          aria-label="Loading activities"
        />
        <UiEmptyState
          v-else-if="!filteredActivities.length"
          title="No activities found"
          description="Try adjusting the filters or add a new activity."
          ><UiButton @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Add Activity</UiButton
          ></UiEmptyState
        ><UiTable v-else-if="view === 'list'" caption="Farm activity records"
          ><template #head
            ><tr>
              <th>{{ t('common.number') }}</th>
              <th>Type</th>
              <th>Farm</th>
              <th>Block</th>
              <th>Tree</th>
              <th>Scheduled date</th>
              <th>Worker</th>
              <th>Status</th>
              <th>Cost</th>
              <th><span class="sr-only">Actions</span></th>
            </tr></template
          >
          <tr
            v-for="(activity, index) in paginatedActivities"
            :key="activity.id"
            :class="[isOverdue(activity) ? 'bg-red-50/60' : undefined, 'cursor-pointer transition-colors hover:bg-green-50/50']"
            tabindex="0"
            @click="router.push(`/activities/${activity.id}`)"
            @keydown.enter="router.push(`/activities/${activity.id}`)"
          >
            <td>
              <span class="text-slate-500">{{ rowNumber(index) }}</span><span
                v-if="isOverdue(activity)"
                class="ml-2 text-xs font-medium text-red-700"
                >Overdue</span
              >
            </td>
            <td>
              <span
                class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                :class="typeTone[activity.type]"
                >{{ activity.type }}</span
              >
            </td>
            <td class="whitespace-nowrap">
              {{ farmById(activity.farmId)?.name }}
            </td>
            <td>{{ blockById(activity.blockId)?.name }}</td>
            <td>{{ activity.treeId || "-" }}</td>
            <td
              class="whitespace-nowrap"
              :class="
                isOverdue(activity) ? 'font-medium text-red-700' : undefined
              "
            >
              {{ formatDate(activity.scheduledDate) }}
            </td>
            <td class="whitespace-nowrap">{{ activity.worker }}</td>
            <td>
              <UiBadge :tone="statusTone[activity.status]">{{
                activity.status
              }}</UiBadge>
            </td>
            <td class="whitespace-nowrap">{{ formatCost(activity.cost) }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  v-if="
                    activity.status !== 'Completed' &&
                    activity.status !== 'Cancelled'
                  "
                  type="button"
                  class="rounded-md p-1.5 text-green-700 hover:bg-green-50"
                  :aria-label="`Complete ${activity.id}`"
                  @click.stop="completeActivity(activity)"
                >
                  <Check :size="17" aria-hidden="true" /></button
                ><button
                  type="button"
                  class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  :aria-label="`Edit ${activity.id}`"
                  @click.stop="openEditModal(activity)"
                >
                  <MoreHorizontal :size="18" aria-hidden="true" />
                </button>
              </div>
            </td></tr></UiTable><UiCard
          v-else
          title="September 2026"
          :description="`${filteredActivities.length} matching activities`"
          ><template #actions
            ><div class="flex items-center gap-2">
              <UiButton variant="ghost" size="sm" @click="changeMonth(-1)"
                >Previous</UiButton
              ><span
                class="min-w-32 text-center text-sm font-medium text-slate-700"
                >{{ calendarTitle }}</span
              ><UiButton variant="ghost" size="sm" @click="changeMonth(1)"
                >Next</UiButton
              >
            </div></template
          >
          <div class="grid grid-cols-7 border-t border-l border-slate-200">
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="border-r border-b border-slate-200 bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500"
            >
              {{ day }}
            </div>
            <div
              v-for="(date, index) in calendarCells"
              :key="date || `empty-${index}`"
              class="min-h-28 border-r border-b border-slate-200 p-2"
              :class="
                date && date === '2026-09-17' ? 'bg-green-50/60' : 'bg-white'
              "
            >
              <template v-if="date"
                ><p
                  class="text-xs font-semibold"
                  :class="
                    date === '2026-09-17' ? 'text-green-700' : 'text-slate-500'
                  "
                >
                  {{ Number(date.slice(-2)) }}
                </p>
                <div class="mt-1 space-y-1">
                  <RouterLink
                    v-for="activity in activitiesForDate(date).slice(0, 3)"
                    :key="activity.id"
                    :to="`/activities/${activity.id}`"
                    class="block truncate rounded px-1.5 py-1 text-left text-[11px] font-medium"
                    :class="
                      isOverdue(activity)
                        ? 'bg-red-100 text-red-800'
                        : typeTone[activity.type]
                    "
                    >{{ activity.type }}</RouterLink
                  >
                  <p
                    v-if="activitiesForDate(date).length > 3"
                    class="text-[11px] text-slate-500"
                  >
                    +{{ activitiesForDate(date).length - 3 }} more
                  </p>
                </div></template
              >
            </div>
          </div></UiCard
        ><UiPagination v-if="view === 'list' && filteredActivities.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredActivities.length" />
      </section>
    </template>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Add activity' : 'Edit activity'"
      :description="
        modalMode === 'add'
          ? 'Schedule work for a farm or block.'
          : 'Update this activity assignment and status.'
      "
      ><form
        id="activity-form"
        class="space-y-4"
        @submit.prevent="saveActivity"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.type"
            label="Activity type"
            :options="formTypeOptions"
          /><UiInput
            v-model="form.scheduledDate"
            label="Scheduled date"
            type="date"
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
          /><UiInput
            v-model="form.worker"
            label="Assigned worker"
            placeholder="Worker name"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.status"
            label="Status"
            :options="formStatusOptions"
          /><UiInput
            v-model="form.cost"
            label="Cost (Rp)"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
        <div class="space-y-1.5">
          <label for="activity-notes" class="ui-label">Notes</label
          ><textarea
            id="activity-notes"
            v-model="form.notes"
            class="ui-field min-h-24 resize-y"
            placeholder="Add activity notes."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="activity-form">{{
          modalMode === "add" ? "Add Activity" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete activity?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedActivity?.id
        }}</strong
        >? This activity will be removed from the schedule.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteActivity"
          >Delete Activity</UiButton
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
