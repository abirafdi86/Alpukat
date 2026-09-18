<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Sprout,
  Trash2,
  Trees as TreesIcon,
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
import type { ProductivityStatus, Tree, TreeHealth } from "@/data/trees";
import type { StatusTone } from "@/types/ui";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
const { t } = useLocale();

interface TreeForm {
  farmId: string;
  blockId: string;
  variety: string;
  plantingDate: string;
  productivityStatus: ProductivityStatus;
  health: TreeHealth;
  notes: string;
}

const trees = ref<Tree[]>(
  mockTrees.map((tree) => ({ ...tree, activities: [...tree.activities] })),
);
const route = useRoute();
const router = useRouter();
const search = ref("");
const farmFilter = ref("all");
const blockFilter = ref("all");
const varietyFilter = ref("all");
const productivityFilter = ref("all");
const healthFilter = ref("all");
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
const form = reactive<TreeForm>({
  farmId: mockFarms[0].id,
  blockId: mockBlocks[0].id,
  variety: "Hass",
  plantingDate: "",
  productivityStatus: "Young Tree",
  health: "Healthy",
  notes: "",
});

const selectedTree = computed(() =>
  trees.value.find((tree) => tree.id === route.params.treeId),
);
const farmById = (farmId: string) =>
  mockFarms.find((farm) => farm.id === farmId);
const blockById = (blockId: string) =>
  mockBlocks.find((block) => block.id === blockId);
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
const varieties = ["Hass", "Fuerte", "Reed"];
const varietyOptions = [
  { label: "All varieties", value: "all" },
  ...varieties.map((variety) => ({ label: variety, value: variety })),
];
const formVarietyOptions = varieties.map((variety) => ({
  label: variety,
  value: variety,
}));
const productivityOptions = [
  { label: "All productivity", value: "all" },
  ...(
    [
      "Productive",
      "Not Productive",
      "Young Tree",
      "Dead",
    ] as ProductivityStatus[]
  ).map((status) => ({ label: status, value: status })),
];
const formProductivityOptions = productivityOptions.slice(1);
const healthOptions = [
  { label: "All health", value: "all" },
  ...(["Healthy", "Needs Attention", "Sick"] as TreeHealth[]).map((health) => ({
    label: health,
    value: health,
  })),
];
const formHealthOptions = healthOptions.slice(1);
const filteredTrees = computed(() =>
  trees.value.filter((tree) => {
    const query = search.value.trim().toLowerCase();
    const farm = farmById(tree.farmId);
    const block = blockById(tree.blockId);
    const matchesSearch = !query || tree.id.toLowerCase().includes(query);
    return (
      matchesSearch &&
      (farmFilter.value === "all" || tree.farmId === farmFilter.value) &&
      (blockFilter.value === "all" || tree.blockId === blockFilter.value) &&
      (varietyFilter.value === "all" || tree.variety === varietyFilter.value) &&
      (productivityFilter.value === "all" ||
        tree.productivityStatus === productivityFilter.value) &&
      (healthFilter.value === "all" || tree.health === healthFilter.value) &&
      (farm || block)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedTrees, rowNumber } = usePagination(filteredTrees);
const productivityTone: Record<ProductivityStatus, StatusTone> = {
  Productive: "success",
  "Not Productive": "warning",
  "Young Tree": "info",
  Dead: "danger",
};
const healthTone: Record<TreeHealth, StatusTone> = {
  Healthy: "success",
  "Needs Attention": "warning",
  Sick: "danger",
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
    farmId: mockFarms[0].id,
    blockId: mockBlocks[0].id,
    variety: "Hass",
    plantingDate: "",
    productivityStatus: "Young Tree",
    health: "Healthy",
    notes: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(tree: Tree) {
  Object.assign(form, {
    farmId: tree.farmId,
    blockId: tree.blockId,
    variety: tree.variety,
    plantingDate: tree.plantingDate,
    productivityStatus: tree.productivityStatus,
    health: tree.health,
    notes: tree.notes,
  });
  modalMode.value = "edit";
  modalOpen.value = true;
}
function saveTree() {
  if (!form.farmId || !form.blockId || !form.variety || !form.plantingDate) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const plantingYear = Number(form.plantingDate.slice(0, 4));
  const values = {
    farmId: form.farmId,
    blockId: form.blockId,
    variety: form.variety,
    plantingDate: form.plantingDate,
    age: Math.max(0, 2026 - plantingYear),
    productivityStatus: form.productivityStatus,
    health: form.health,
    notes: form.notes.trim() || "No notes provided.",
  };
  if (modalMode.value === "edit" && selectedTree.value) {
    Object.assign(selectedTree.value, values);
    showToast("Tree updated", `${selectedTree.value.id} has been updated.`);
  } else {
    const id = `TR-${String(trees.value.length + 1).padStart(4, "0")}`;
    trees.value.unshift({
      id,
      qrCode: `tree:${id}`,
      ...values,
      lastHarvest: "No harvest yet",
      historicalHarvest: 0,
      harvestThisYear: 0,
      averageHarvest: 0,
      activities: [],
    });
    showToast("Tree added", `${id} is now in your tree register.`);
  }
  modalOpen.value = false;
}
function deleteTree() {
  if (!selectedTree.value) return;
  const treeId = selectedTree.value.id;
  trees.value = trees.value.filter(
    (tree) => tree.id !== selectedTree.value?.id,
  );
  confirmOpen.value = false;
  router.push("/trees");
  showToast("Tree deleted", `${treeId} was removed from the tree register.`);
}
function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
</script>

<template>
  <div class="@container">
    <template v-if="selectedTree">
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <RouterLink
            to="/trees"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            ><ArrowLeft :size="16" aria-hidden="true" />All trees</RouterLink
          >
          <h1 class="page-title">{{ selectedTree.id }}</h1>
          <p class="secondary-text mt-2">
            {{ farmById(selectedTree.farmId)?.name }}
            <span class="mx-1 text-slate-300">|</span>
            {{ blockById(selectedTree.blockId)?.name }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton variant="secondary" @click="openEditModal(selectedTree)"
            ><template #leading
              ><Edit3 :size="16" aria-hidden="true" /></template
            >Edit Tree</UiButton
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
          title="General information"
          description="Tree identity and growing location."
          ><div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Tree ID
              </p>
              <p class="mt-1 font-medium text-slate-900">
                {{ selectedTree.id }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Planting date
              </p>
              <p class="mt-1 text-slate-700">{{ selectedTree.plantingDate }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Farm
              </p>
              <p class="mt-1 text-slate-700">
                {{ farmById(selectedTree.farmId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Block
              </p>
              <p class="mt-1 text-slate-700">
                {{ blockById(selectedTree.blockId)?.name }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Variety
              </p>
              <p class="mt-1 text-slate-700">{{ selectedTree.variety }}</p>
            </div>
            <div>
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Age
              </p>
              <p class="mt-1 text-slate-700">{{ selectedTree.age }} years</p>
            </div>
          </div></UiCard
        ><UiCard title="Health" description="Current tree condition."
          ><div class="flex items-center gap-4">
            <span
              class="flex size-12 items-center justify-center rounded-xl bg-green-50 text-green-700"
              ><TreesIcon :size="24" aria-hidden="true"
            /></span>
            <div>
              <UiBadge :tone="healthTone[selectedTree.health]">{{
                selectedTree.health
              }}</UiBadge>
              <p class="mt-2 text-sm text-slate-500">
                Productivity:
                <strong class="font-medium text-slate-700">{{
                  selectedTree.productivityStatus
                }}</strong>
              </p>
            </div>
          </div>
          <div class="mt-6 border-t border-slate-100 pt-5">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Notes
            </p>
            <p class="mt-1 leading-6 text-slate-700">
              {{ selectedTree.notes }}
            </p>
          </div></UiCard
        >
      </section>
      <section class="mt-6">
        <UiCard
          title="Statistics"
          description="Harvest performance for this tree."
          ><div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-lg bg-green-50 p-4">
              <Sprout :size="18" class="text-green-700" aria-hidden="true" />
              <p
                class="mt-4 text-2xl font-semibold tabular-nums text-slate-900"
              >
                {{ selectedTree.harvestThisYear }} kg
              </p>
              <p class="text-xs text-slate-500">Harvest this year</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-lg font-semibold tabular-nums text-slate-900">
                {{ formatNumber(selectedTree.historicalHarvest) }} kg
              </p>
              <p class="mt-1 text-xs text-slate-500">Lifetime harvest</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-lg font-semibold tabular-nums text-slate-900">
                {{ selectedTree.averageHarvest }} kg
              </p>
              <p class="mt-1 text-xs text-slate-500">Average harvest</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-4">
              <CalendarDays
                :size="18"
                class="text-amber-700"
                aria-hidden="true"
              />
              <p class="mt-4 text-sm font-semibold text-slate-900">
                {{ selectedTree.lastHarvest }}
              </p>
              <p class="text-xs text-slate-500">Last harvest</p>
            </div>
          </div></UiCard
        >
      </section>
      <UiCard
        title="Activity timeline"
        description="Recorded work and observations for this tree."
        class="mt-6"
        ><div
          v-if="selectedTree.activities.length"
          class="relative ml-2 border-l border-slate-200 pl-6"
        >
          <div
            v-for="activity in selectedTree.activities"
            :key="`${activity.type}-${activity.date}`"
            class="relative pb-6 last:pb-0"
          >
            <span
              class="absolute -left-[31px] top-0 flex size-2.5 rounded-full border-2 border-white bg-green-600 ring-1 ring-green-200"
            />
            <div class="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 class="font-medium text-slate-800">{{ activity.type }}</h2>
              <time class="text-xs text-slate-500">{{ activity.date }}</time>
            </div>
            <p class="mt-1 text-sm text-slate-600">{{ activity.note }}</p>
          </div>
        </div>
        <UiEmptyState
          v-else
          title="No activities yet"
          description="Tree activities will appear here after they are recorded."
      /></UiCard>
    </template>
    <template v-else>
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('trees.title') }}</h1>
          <p class="secondary-text mt-2">
            Track individual tree health, productivity, and harvest history.
          </p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >Add Tree</UiButton
        >
      </header>
      <section class="mt-8" aria-label="Tree list">
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div class="sm:col-span-2 xl:col-span-1">
            <UiInput
              v-model="search"
              label="Search Tree ID"
              type="search"
              placeholder="e.g. TR-0001"
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
            v-model="productivityFilter"
            label="Productivity"
            :options="productivityOptions"
          /><UiSelect
            v-model="healthFilter"
            label="Health"
            :options="healthOptions"
          />
        </div>
        <div
          v-if="isLoading"
          class="ui-card h-96 animate-pulse bg-slate-100"
          aria-label="Loading trees"
        />
        <UiEmptyState
          v-else-if="!filteredTrees.length"
          title="No trees found"
          :description="
            search ||
            farmFilter !== 'all' ||
            blockFilter !== 'all' ||
            varietyFilter !== 'all' ||
            productivityFilter !== 'all' ||
            healthFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Add your first tree to start the tree register.'
          "
          ><UiButton
            v-if="
              !search &&
              farmFilter === 'all' &&
              blockFilter === 'all' &&
              varietyFilter === 'all' &&
              productivityFilter === 'all' &&
              healthFilter === 'all'
            "
            @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Add Tree</UiButton
          ><UiButton
            v-else
            variant="secondary"
            @click="
              search = '';
              farmFilter = 'all';
              blockFilter = 'all';
              varietyFilter = 'all';
              productivityFilter = 'all';
              healthFilter = 'all';
            "
            >Clear filters</UiButton
          ></UiEmptyState
        ><UiTable v-else caption="Avocado tree register"
          ><template #head
            ><tr>
              <th>{{ t('common.number') }}</th>
              <th>Farm</th>
              <th>Block</th>
              <th>Variety</th>
              <th>Age</th>
              <th>Productivity</th>
              <th>Health</th>
              <th>Last harvest</th>
              <th><span class="sr-only">Actions</span></th>
            </tr></template
          >
          <tr v-for="(tree, index) in paginatedTrees" :key="tree.id" class="cursor-pointer transition-colors hover:bg-green-50/50" tabindex="0" @click="router.push(`/trees/${tree.id}`)" @keydown.enter="router.push(`/trees/${tree.id}`)">
            <td class="text-slate-500">{{ rowNumber(index) }}</td>
            <td class="whitespace-nowrap">{{ farmById(tree.farmId)?.name }}</td>
            <td>{{ blockById(tree.blockId)?.name }}</td>
            <td>{{ tree.variety }}</td>
            <td class="whitespace-nowrap">{{ tree.age }} years</td>
            <td>
              <UiBadge :tone="productivityTone[tree.productivityStatus]">{{
                tree.productivityStatus
              }}</UiBadge>
            </td>
            <td>
              <UiBadge :tone="healthTone[tree.health]">{{
                tree.health
              }}</UiBadge>
            </td>
            <td class="whitespace-nowrap">{{ tree.lastHarvest }}</td>
            <td>
              <button
                type="button"
                class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                :aria-label="`Edit ${tree.id}`"
                @click.stop="openEditModal(tree)"
              >
                <MoreHorizontal :size="18" aria-hidden="true" />
              </button>
            </td></tr
        ></UiTable><UiPagination v-if="filteredTrees.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredTrees.length" />
      </section>
    </template>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Add tree' : 'Edit tree'"
      :description="
        modalMode === 'add'
          ? 'Register an individual avocado tree.'
          : 'Update this tree record.'
      "
      ><form id="tree-form" class="space-y-4" @submit.prevent="saveTree">
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
            v-model="form.variety"
            label="Avocado variety"
            :options="formVarietyOptions"
          /><UiInput
            v-model="form.plantingDate"
            label="Planting date"
            type="date"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.productivityStatus"
            label="Productivity status"
            :options="formProductivityOptions"
          /><UiSelect
            v-model="form.health"
            label="Health"
            :options="formHealthOptions"
          />
        </div>
        <div class="space-y-1.5">
          <label for="tree-notes" class="ui-label">Notes</label
          ><textarea
            id="tree-notes"
            v-model="form.notes"
            class="ui-field min-h-24 resize-y"
            placeholder="Add tree notes."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="tree-form">{{
          modalMode === "add" ? "Add Tree" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete tree?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedTree?.id
        }}</strong
        >? This tree record will be removed from the mock register.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deleteTree"
          >Delete Tree</UiButton
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
