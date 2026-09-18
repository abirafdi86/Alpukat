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
import { mockFarms } from "@/data/farms";
import { mockBlocks } from "@/data/blocks";
import type { Block, BlockStatus } from "@/data/blocks";
import type { StatusTone } from "@/types/ui";
import { useLocale } from "@/composables/useLocale";
const { t } = useLocale();

interface BlockForm {
  name: string;
  farmId: string;
  area: string;
  trees: string;
  variety: string;
  plantingYear: string;
  status: BlockStatus;
  notes: string;
}

const blocks = ref<Block[]>(
  mockBlocks.map((block) => ({
    ...block,
    health: { ...block.health },
    activities: [...block.activities],
  })),
);

const route = useRoute();
const router = useRouter();
const search = ref("");
const farmFilter = ref("all");
const varietyFilter = ref("all");
const statusFilter = ref("all");
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
const form = reactive<BlockForm>({
  name: "",
  farmId: mockFarms[0].id,
  area: "",
  trees: "",
  variety: "Hass",
  plantingYear: "",
  status: "Active",
  notes: "",
});

const selectedBlock = computed(() =>
  blocks.value.find((block) => block.id === route.params.blockId),
);
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const farmOptions = [
  { label: "All farms", value: "all" },
  ...mockFarms.map((farm) => ({ label: farm.name, value: farm.id })),
];
const formFarmOptions = mockFarms.map((farm) => ({
  label: farm.name,
  value: farm.id,
}));
const varieties = ["Hass", "Fuerte", "Reed"];
const varietyOptions = [
  { label: "All varieties", value: "all" },
  ...varieties.map((variety) => ({ label: variety, value: variety })),
];
const formVarietyOptions = varieties.map((variety) => ({
  label: variety,
  value: variety,
}));
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Planning", value: "Planning" },
  { label: "Inactive", value: "Inactive" },
];
const formStatusOptions = statusOptions.slice(1);
const filteredBlocks = computed(() =>
  blocks.value.filter((block) => {
    const query = search.value.trim().toLowerCase();
    const farm = farmById(block.farmId);
    const matchesSearch =
      !query ||
      `${block.id} ${block.name} ${farm?.name || ""}`
        .toLowerCase()
        .includes(query);
    return (
      matchesSearch &&
      (farmFilter.value === "all" || block.farmId === farmFilter.value) &&
      (varietyFilter.value === "all" ||
        block.variety === varietyFilter.value) &&
      (statusFilter.value === "all" || block.status === statusFilter.value)
    );
  }),
);
const statusTone: Record<BlockStatus, StatusTone> = {
  Active: "success",
  Planning: "warning",
  Inactive: "neutral",
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
function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
function resetForm() {
  Object.assign(form, {
    name: "",
    farmId: mockFarms[0].id,
    area: "",
    trees: "",
    variety: "Hass",
    plantingYear: "",
    status: "Active",
    notes: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(block: Block) {
  Object.assign(form, {
    name: block.name,
    farmId: block.farmId,
    area: String(block.area),
    trees: String(block.trees),
    variety: block.variety,
    plantingYear: String(block.plantingYear),
    status: block.status,
    notes: block.notes,
  });
  modalMode.value = "edit";
  modalOpen.value = true;
}
function saveBlock() {
  if (
    !form.name.trim() ||
    !form.farmId ||
    !form.area ||
    !form.trees ||
    !form.plantingYear
  ) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const values = {
    name: form.name.trim(),
    farmId: form.farmId,
    area: Number(form.area),
    trees: Number(form.trees),
    variety: form.variety,
    plantingYear: Number(form.plantingYear),
    status: form.status,
    notes: form.notes.trim() || "No notes provided.",
  };
  if (modalMode.value === "edit" && selectedBlock.value) {
    Object.assign(selectedBlock.value, values);
    showToast("Block updated", `${values.name} has been updated.`);
  } else {
    const id = `BLK-${String(blocks.value.length + 1).padStart(3, "0")}`;
    blocks.value.unshift({
      id,
      ...values,
      harvestThisMonth: 0,
      health: { healthy: 0, attention: 0, sick: 0 },
      activities: [],
    });
    showToast("Block added", `${values.name} is now in your block list.`);
  }
  modalOpen.value = false;
}
function deleteBlock() {
  if (!selectedBlock.value) return;
  const blockName = selectedBlock.value.name;
  blocks.value = blocks.value.filter(
    (block) => block.id !== selectedBlock.value?.id,
  );
  confirmOpen.value = false;
  router.push("/blocks");
  showToast("Block deleted", `${blockName} was removed from the block list.`);
}
</script>

<template>
  <div class="@container">
    <template v-if="selectedBlock">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/blocks"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All blocks</RouterLink
          >
          <h1 class="page-title">{{ selectedBlock.name }}</h1>
          <p class="secondary-text mt-2">
            {{ farmById(selectedBlock.farmId)?.name }}
            <span class="mx-1 text-slate-300">|</span> {{ selectedBlock.id }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="openEditModal(selectedBlock)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Block</UiButton
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
          title="Block information"
          description="Planting area profile and notes."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Block ID
              </p>
              <p class="mt-1 font-medium text-slate-900">
                {{ selectedBlock.id }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Farm
              </p>
              <p class="mt-1 text-slate-700">
                {{ farmById(selectedBlock.farmId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Area
              </p>
              <p class="mt-1 text-slate-700">{{ selectedBlock.area }} ha</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Variety
              </p>
              <p class="mt-1 text-slate-700">{{ selectedBlock.variety }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Planting year
              </p>
              <p class="mt-1 text-slate-700">
                {{ selectedBlock.plantingYear }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Status
              </p>
              <div class="mt-1">
                <UiBadge :tone="statusTone[selectedBlock.status]">{{
                  selectedBlock.status
                }}</UiBadge>
              </div>
            </div>
            <div class="sm:col-span-2">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Notes
              </p>
              <p class="mt-1 leading-6 text-slate-700">
                {{ selectedBlock.notes }}
              </p>
            </div>
          </div></UiCard
        ><UiCard
          title="Block statistics"
          description="Current block performance."
          ><div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-green-50 p-4">
              <Trees :size="18" class="text-green-700" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ formatNumber(selectedBlock.trees) }}
              </p>
              <p class="text-xs text-slate-500">Number of trees</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-4">
              <Sprout :size="18" class="text-amber-700" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ selectedBlock.harvestThisMonth }} kg
              </p>
              <p class="text-xs text-slate-500">Harvest this month</p>
            </div>
          </div></UiCard
        >
      </section>
      <section
        class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]"
      >
        <UiCard
          title="Tree health summary"
          description="Health assessment across this block."
          ><div class="space-y-5">
            <div
              v-for="item in [
                {
                  label: 'Healthy',
                  value: selectedBlock.health.healthy,
                  color: 'bg-green-600',
                },
                {
                  label: 'Needs attention',
                  value: selectedBlock.health.attention,
                  color: 'bg-amber-500',
                },
                {
                  label: 'Sick',
                  value: selectedBlock.health.sick,
                  color: 'bg-red-500',
                },
              ]"
              :key="item.label"
            >
              <div class="mb-1.5 flex justify-between text-sm">
                <span class="flex items-center gap-2 text-slate-600"
                  ><span class="size-2 rounded-full" :class="item.color" />{{
                    item.label
                  }}</span
                ><strong class="text-slate-900">{{ item.value }} trees</strong>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full"
                  :class="item.color"
                  :style="{
                    width: `${selectedBlock.trees ? (item.value / selectedBlock.trees) * 100 : 0}%`,
                  }"
                />
              </div>
            </div></div></UiCard
        ><UiCard
          title="Recent activities"
          description="Latest work scheduled for this block."
          ><div
            v-if="selectedBlock.activities.length"
            class="divide-y divide-slate-100"
          >
            <div
              v-for="activity in selectedBlock.activities"
              :key="`${activity.name}-${activity.date}`"
              class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700"
                ><CalendarDays :size="17" aria-hidden="true"
              /></span>
              <p class="min-w-0 flex-1 font-medium text-slate-800">
                {{ activity.name }}
              </p>
              <span class="text-xs text-slate-500">{{ activity.date }}</span>
            </div>
          </div>
          <UiEmptyState
            v-else
            title="No recent activities"
            description="Activities for this block will appear here."
        /></UiCard>
      </section>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('blocks.title') }}</h1>
          <p class="secondary-text mt-2">{{ t('blocks.subtitle') }}</p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >{{ t('blocks.add') }}</UiButton
        >
      </header>
      <section class="mt-8" aria-label="Block list">
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="sm:col-span-2 xl:col-span-1">
            <UiInput
              v-model="search"
              :label="t('common.search')"
              type="search"
              :placeholder="t('blocks.subtitle')"
              ><template #trailing
                ><Search
                  :size="17"
                  class="text-slate-400"
                  aria-hidden="true" /></template
            ></UiInput>
          </div>
          <UiSelect
            v-model="farmFilter"
            :label="t('blocks.farm')"
            :options="farmOptions"
          /><UiSelect
            v-model="varietyFilter"
            :label="t('blocks.variety')"
            :options="varietyOptions"
          /><UiSelect
            v-model="statusFilter"
            :label="t('farms.status')"
            :options="statusOptions"
          />
        </div>
        <div
          v-if="isLoading"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="item in 3"
            :key="item"
            class="ui-card h-64 animate-pulse bg-slate-100"
            aria-label="Loading block"
          />
        </div>
        <UiEmptyState
          v-else-if="!filteredBlocks.length"
          :title="t('blocks.noData')"
          :description="
            search ||
            farmFilter !== 'all' ||
            varietyFilter !== 'all' ||
            statusFilter !== 'all'
              ? t('common.noData')
              : t('blocks.subtitle')
          "
          ><UiButton
            v-if="
              !search &&
              farmFilter === 'all' &&
              varietyFilter === 'all' &&
              statusFilter === 'all'
            "
            @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >{{ t('blocks.add') }}</UiButton
          ><UiButton
            v-else
            variant="secondary"
            @click="
              search = '';
              farmFilter = 'all';
              varietyFilter = 'all';
              statusFilter = 'all';
            "
            >{{ t('common.reset') }}</UiButton
          ></UiEmptyState
        >
        <div
          v-else
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="block in filteredBlocks"
            :key="block.id"
            class="ui-card flex min-w-0 flex-col p-5 transition-shadow hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  {{ block.id }}
                </p>
                <h2 class="mt-1 truncate text-lg font-semibold text-slate-900">
                  {{ block.name }}
                </h2>
                <p
                  class="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500"
                >
                  <MapPin :size="15" class="shrink-0" aria-hidden="true" />{{
                    farmById(block.farmId)?.name
                  }}
                </p>
              </div>
              <UiBadge :tone="statusTone[block.status]">{{
                block.status
              }}</UiBadge>
            </div>
            <div
              class="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4"
            >
              <div>
                <p class="text-xs text-slate-500">{{ t('blocks.area') }}</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ block.area }} ha
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">{{ t('blocks.trees') }}</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ formatNumber(block.trees) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">{{ t('blocks.variety') }}</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ block.variety }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500">{{ t('blocks.plantingYear') }}</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ block.plantingYear }}
                </p>
              </div>
            </div>
            <div class="mt-5 flex items-center justify-between gap-3">
              <RouterLink
                :to="`/blocks/${block.id}`"
                class="text-sm font-medium text-green-700 hover:text-green-800"
                >{{ t('common.details') }} <span aria-hidden="true">&rarr;</span></RouterLink
              ><button
                type="button"
                class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                :aria-label="`Edit ${block.name}`"
                @click="openEditModal(block)"
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
      :title="t(modalMode === 'add' ? 'blocks.add' : 'common.edit')"
      :description="
        modalMode === 'add'
          ? t('blocks.subtitle')
          : t('blocks.subtitle')
      "
      ><form id="block-form" class="space-y-4" @submit.prevent="saveBlock">
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.name"
            :label="t('blocks.name')"
            placeholder="e.g. Block A"
            required
          /><UiSelect
            v-model="form.farmId"
            :label="t('blocks.farm')"
            :options="formFarmOptions"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="form.area"
            :label="`${t('blocks.area')} (ha)`"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            required
          /><UiInput
            v-model="form.trees"
            :label="t('blocks.trees')"
            type="number"
            min="0"
            placeholder="0"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.variety"
            :label="t('blocks.variety')"
            :options="formVarietyOptions"
          /><UiInput
            v-model="form.plantingYear"
            :label="t('blocks.plantingYear')"
            type="number"
            min="1900"
            max="2100"
            placeholder="2024"
            required
          />
        </div>
        <UiSelect
          v-model="form.status"
          :label="t('blocks.status')"
          :options="formStatusOptions"
        />
        <div class="space-y-1.5">
          <label for="block-notes" class="ui-label">{{ t('activities.notes') }}</label
          ><textarea
            id="block-notes"
            v-model="form.notes"
            class="ui-field min-h-24 resize-y"
            placeholder="Add block notes."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >{{ t('common.cancel') }}</UiButton
        ><UiButton type="submit" form="block-form">{{
          modalMode === "add" ? t('blocks.add') : t('common.save')
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete block?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedBlock?.name
        }}</strong
        >? This block record will be removed from the mock workspace.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteBlock"
          >Delete Block</UiButton
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
