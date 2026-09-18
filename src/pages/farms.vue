<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  LandPlot,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Sprout,
  Trash2,
  Trees,
} from "lucide-vue-next";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiEmptyState,
  UiInput,
  UiModal,
  UiSelect,
  UiToast,
} from "@/components/ui";
import type { Farm, FarmStatus } from "@/data/farms";
import { mockFarms } from "@/data/farms";
import type { StatusTone } from "@/types/ui";
import { useLocale } from "@/composables/useLocale";
const { t } = useLocale();

type ModalMode = "add" | "edit";

interface FarmForm {
  name: string;
  location: string;
  totalArea: string;
  description: string;
  totalBlocks: string;
  totalTrees: string;
  status: FarmStatus;
}

const farms = ref<Farm[]>(
  mockFarms.map((farm) => ({
    ...farm,
    blocks: [...farm.blocks],
    recentHarvest: [...farm.recentHarvest],
    upcomingActivities: [...farm.upcomingActivities],
  })),
);

const route = useRoute();
const router = useRouter();
const search = ref("");
const statusFilter = ref("all");
const isLoading = ref(true);
const modalOpen = ref(false);
const confirmOpen = ref(false);
const modalMode = ref<ModalMode>("add");
const formError = ref("");
const toast = ref<{
  title: string;
  description: string;
  tone: StatusTone;
} | null>(null);
const form = reactive<FarmForm>({
  name: "",
  location: "",
  totalArea: "",
  description: "",
  totalBlocks: "",
  totalTrees: "",
  status: "Active",
});

const selectedFarm = computed(() =>
  farms.value.find((farm) => farm.id === route.params.farmId),
);
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Planning", value: "Planning" },
  { label: "Inactive", value: "Inactive" },
];
const formStatusOptions = statusOptions.slice(1);
const filteredFarms = computed(() =>
  farms.value.filter((farm) => {
    const query = search.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${farm.name} ${farm.location} ${farm.id}`.toLowerCase().includes(query);
    return (
      matchesSearch &&
      (statusFilter.value === "all" || farm.status === statusFilter.value)
    );
  }),
);
const statusTone: Record<FarmStatus, StatusTone> = {
  Active: "success",
  Planning: "warning",
  Inactive: "neutral",
};
const gradeTone: Record<string, StatusTone> = {
  "Grade A": "success",
  "Grade B": "info",
  "Grade C": "warning",
  Rejected: "danger",
};

onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);

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
    name: "",
    location: "",
    totalArea: "",
    description: "",
    totalBlocks: "",
    totalTrees: "",
    status: "Active",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(farm: Farm) {
  Object.assign(form, {
    name: farm.name,
    location: farm.location,
    totalArea: String(farm.totalArea),
    description: farm.description,
    totalBlocks: String(farm.totalBlocks),
    totalTrees: String(farm.totalTrees),
    status: farm.status,
  });
  modalMode.value = "edit";
  modalOpen.value = true;
}
function saveFarm() {
  if (
    !form.name.trim() ||
    !form.location.trim() ||
    !form.totalArea ||
    !form.totalBlocks ||
    !form.totalTrees
  ) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const values = {
    name: form.name.trim(),
    location: form.location.trim(),
    totalArea: Number(form.totalArea),
    description: form.description.trim() || "No description provided.",
    totalBlocks: Number(form.totalBlocks),
    totalTrees: Number(form.totalTrees),
    status: form.status,
  };
  if (modalMode.value === "edit" && selectedFarm.value) {
    Object.assign(selectedFarm.value, values);
    showToast("Farm updated", `${values.name} has been updated.`);
  } else {
    const id = `FRM-${String(farms.value.length + 1).padStart(3, "0")}`;
    farms.value.unshift({
      id,
      ...values,
      createdDate: "Sep 17, 2026",
      harvestThisMonth: 0,
      blocks: [],
      recentHarvest: [],
      upcomingActivities: [],
    });
    showToast("Farm added", `${values.name} is now in your farm list.`);
  }
  modalOpen.value = false;
}
function askDelete() {
  confirmOpen.value = true;
}
function deleteFarm() {
  if (!selectedFarm.value) return;
  const farmName = selectedFarm.value.name;
  farms.value = farms.value.filter(
    (farm) => farm.id !== selectedFarm.value?.id,
  );
  confirmOpen.value = false;
  router.push("/farms");
  showToast("Farm deleted", `${farmName} was removed from the farm list.`);
}
function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
</script>

<template>
  <div class="@container">
    <template v-if="selectedFarm">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/farms"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All farms</RouterLink
          >
          <h1 class="page-title">{{ selectedFarm.name }}</h1>
          <p class="secondary-text mt-2">
            {{ selectedFarm.location }}
            <span class="mx-1 text-slate-300">|</span> {{ selectedFarm.id }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="openEditModal(selectedFarm)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Farm</UiButton
          ><UiButton variant="danger" @click="askDelete"
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
          title="General information"
          description="Farm profile and operational details."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Farm ID
              </p>
              <p class="mt-1 font-medium text-slate-900">
                {{ selectedFarm.id }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Created date
              </p>
              <p class="mt-1 text-slate-700">{{ selectedFarm.createdDate }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Location
              </p>
              <p class="mt-1 text-slate-700">{{ selectedFarm.location }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Status
              </p>
              <div class="mt-1">
                <UiBadge :tone="statusTone[selectedFarm.status]">{{
                  selectedFarm.status
                }}</UiBadge>
              </div>
            </div>
            <div class="sm:col-span-2">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Description
              </p>
              <p class="mt-1 leading-6 text-slate-700">
                {{ selectedFarm.description }}
              </p>
            </div>
          </div></UiCard
        ><UiCard
          title="Farm statistics"
          description="Current production snapshot."
          ><div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-green-50 p-4">
              <Trees :size="18" class="text-green-700" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ formatNumber(selectedFarm.totalTrees) }}
              </p>
              <p class="text-xs text-slate-500">Total trees</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <LandPlot :size="18" class="text-slate-600" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ selectedFarm.totalArea }} ha
              </p>
              <p class="text-xs text-slate-500">Total area</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <MapPin :size="18" class="text-slate-600" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ selectedFarm.totalBlocks }}
              </p>
              <p class="text-xs text-slate-500">Total blocks</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-4">
              <Sprout :size="18" class="text-amber-700" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ formatNumber(selectedFarm.harvestThisMonth) }} kg
              </p>
              <p class="text-xs text-slate-500">Harvest this month</p>
            </div>
          </div></UiCard
        >
      </section>
      <section
        class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]"
      >
        <UiCard title="Blocks" description="Production areas within this farm."
          ><div v-if="selectedFarm.blocks.length" class="overflow-x-auto">
            <table class="ui-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Variety</th>
                  <th class="numeric">Trees</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="block in selectedFarm.blocks" :key="block.name">
                  <td class="font-medium text-slate-800">{{ block.name }}</td>
                  <td>{{ block.variety }}</td>
                  <td class="numeric">{{ formatNumber(block.trees) }}</td>
                  <td>
                    <UiBadge :tone="statusTone[block.status]">{{
                      block.status
                    }}</UiBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <UiEmptyState
            v-else
            title="No blocks yet"
            description="Blocks will appear here once they are added to this farm." /></UiCard
        ><UiCard title="Upcoming activities" description="Next scheduled work."
          ><div
            v-if="selectedFarm.upcomingActivities.length"
            class="divide-y divide-slate-100"
          >
            <div
              v-for="activity in selectedFarm.upcomingActivities"
              :key="`${activity.name}-${activity.date}`"
              class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700"
                ><CalendarDays :size="17" aria-hidden="true"
              /></span>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-slate-800">{{ activity.name }}</p>
                <p class="text-xs text-slate-500">{{ activity.block }}</p>
              </div>
              <span class="text-xs font-medium text-slate-500">{{
                activity.date
              }}</span>
            </div>
          </div>
          <UiEmptyState
            v-else
            title="No upcoming activities"
            description="This farm has no work scheduled."
        /></UiCard>
      </section>
      <UiCard
        title="Recent harvest"
        description="Latest harvest records from this farm."
        class="mt-6"
        ><div v-if="selectedFarm.recentHarvest.length" class="overflow-x-auto">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Block</th>
                <th>Weight</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="harvest in selectedFarm.recentHarvest"
                :key="`${harvest.date}-${harvest.block}`"
              >
                <td>{{ harvest.date }}</td>
                <td>{{ harvest.block }}</td>
                <td>{{ harvest.weight }}</td>
                <td>
                  <UiBadge :tone="gradeTone[harvest.grade] || 'neutral'">{{
                    harvest.grade
                  }}</UiBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <UiEmptyState
          v-else
          title="No harvest records"
          description="Harvest records will appear here after the first collection."
      /></UiCard>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('farms.title') }}</h1>
          <p class="secondary-text mt-2">
            Manage farms, growing areas, and production performance.
          </p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >Add Farm</UiButton
        >
      </header>
      <section class="mt-8" aria-label="Farm list">
        <div class="mb-5 flex flex-col gap-3 sm:flex-row">
          <div class="min-w-0 flex-1">
            <UiInput
              v-model="search"
              label="Search farms"
              type="search"
              placeholder="Search by farm name, location, or ID"
              ><template #trailing
                ><Search
                  :size="17"
                  class="text-slate-400"
                  aria-hidden="true" /></template
            ></UiInput>
          </div>
          <div class="sm:w-52">
            <UiSelect
              v-model="statusFilter"
              label="Status filter"
              :options="statusOptions"
            />
          </div>
        </div>
        <div
          v-if="isLoading"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="item in 3"
            :key="item"
            class="ui-card h-72 animate-pulse bg-slate-100"
            aria-label="Loading farm"
          />
        </div>
        <UiEmptyState
          v-else-if="!filteredFarms.length"
          title="No farms found"
          :description="
            search || statusFilter !== 'all'
              ? 'Try adjusting your search or status filter.'
              : 'Add your first farm to start managing your growing areas.'
          "
          ><UiButton
            v-if="!search && statusFilter === 'all'"
            @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Add Farm</UiButton
          ><UiButton
            v-else
            variant="secondary"
            @click="
              search = '';
              statusFilter = 'all';
            "
            >Clear filters</UiButton
          ></UiEmptyState
        >
        <div
          v-else
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="farm in filteredFarms"
            :key="farm.id"
            class="ui-card flex min-w-0 flex-col p-5 transition-shadow hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  {{ farm.id }}
                </p>
                <h2 class="mt-1 truncate text-lg font-semibold text-slate-900">
                  {{ farm.name }}
                </h2>
                <p
                  class="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500"
                >
                  <MapPin :size="15" class="shrink-0" aria-hidden="true" />{{
                    farm.location
                  }}
                </p>
              </div>
              <UiBadge :tone="statusTone[farm.status]">{{
                farm.status
              }}</UiBadge>
            </div>
            <div
              class="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-slate-100 py-4"
            >
              <div>
                <p class="text-xs text-slate-500">Area</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ farm.totalArea }} ha
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Total blocks</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ farm.totalBlocks }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Total trees</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ formatNumber(farm.totalTrees) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Harvest this month</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ formatNumber(farm.harvestThisMonth) }} kg
                </p>
              </div>
            </div>
            <div class="mt-5 flex items-center justify-between gap-3">
              <RouterLink
                :to="`/farms/${farm.id}`"
                class="text-sm font-medium text-green-700 hover:text-green-800"
                >View details <span aria-hidden="true">&rarr;</span></RouterLink
              ><button
                type="button"
                class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                :aria-label="`Edit ${farm.name}`"
                @click="openEditModal(farm)"
              >
                <MoreHorizontal :size="18" aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Add farm' : 'Edit farm'"
      :description="
        modalMode === 'add'
          ? 'Add a farm to your management workspace.'
          : 'Update the farm profile and operational details.'
      "
      ><form id="farm-form" class="space-y-4" @submit.prevent="saveFarm">
        <UiInput
          v-model="form.name"
          label="Farm name"
          placeholder="e.g. Sungai Hijau Estate"
          required
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.location"
            label="Location"
            placeholder="City, province"
            required
          /><UiInput
            v-model="form.totalArea"
            label="Total area (ha)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.totalBlocks"
            label="Total blocks"
            type="number"
            min="0"
            placeholder="0"
            required
          /><UiInput
            v-model="form.totalTrees"
            label="Total trees"
            type="number"
            min="0"
            placeholder="0"
            required
          />
        </div>
        <UiSelect
          v-model="form.status"
          label="Status"
          :options="formStatusOptions"
        />
        <div class="space-y-1.5">
          <label for="farm-description" class="ui-label">Description</label
          ><textarea
            id="farm-description"
            v-model="form.description"
            class="ui-field min-h-24 resize-y"
            placeholder="Describe the farm and its focus."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="farm-form">{{
          modalMode === "add" ? "Add Farm" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete farm?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedFarm?.name
        }}</strong
        >? All farm profile data in this mock workspace will be removed.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteFarm"
          >Delete Farm</UiButton
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
