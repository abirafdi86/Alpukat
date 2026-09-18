<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  AlertTriangle,
  Box,
  Edit3,
  MoreHorizontal,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
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
import { mockInventory, mockStockTransactions } from "@/data/inventory";
import type {
  InventoryCategory,
  InventoryItem,
  StockTransaction,
  StockTransactionType,
} from "@/data/inventory";
import type { StatusTone } from "@/types/ui";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
const { t } = useLocale();

interface ItemForm {
  name: string;
  category: InventoryCategory;
  currentStock: string;
  unit: string;
  minimumStock: string;
  purchasePrice: string;
  supplier: string;
}
interface TransactionForm {
  itemId: string;
  type: StockTransactionType;
  quantity: string;
  note: string;
}

const inventory = ref<InventoryItem[]>(
  mockInventory.map((item) => ({ ...item })),
);
const transactions = ref<StockTransaction[]>(
  mockStockTransactions.map((transaction) => ({ ...transaction })),
);
const search = ref("");
const categoryFilter = ref("all");
const isLoading = ref(true);
const itemModalOpen = ref(false);
const transactionModalOpen = ref(false);
const confirmOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selectedItem = ref<InventoryItem | null>(null);
const formError = ref("");
const toast = ref<{
  title: string;
  description: string;
  tone: StatusTone;
} | null>(null);
const itemForm = reactive<ItemForm>({
  name: "",
  category: "Fertilizer",
  currentStock: "",
  unit: "pieces",
  minimumStock: "",
  purchasePrice: "",
  supplier: "",
});
const transactionForm = reactive<TransactionForm>({
  itemId: "",
  type: "Stock In",
  quantity: "",
  note: "",
});

const categories: InventoryCategory[] = [
  "Fertilizer",
  "Pesticides",
  "Tools",
  "Packaging",
  "Other",
];
const categoryOptions = [
  { label: "All categories", value: "all" },
  ...categories.map((category) => ({ label: category, value: category })),
];
const formCategoryOptions = categories.map((category) => ({
  label: category,
  value: category,
}));
const itemOptions = computed(() =>
  inventory.value.map((item) => ({
    label: `${item.name} (${item.currentStock} ${item.unit})`,
    value: item.id,
  })),
);
const filteredInventory = computed(() =>
  inventory.value.filter((item) => {
    const query = search.value.trim().toLowerCase();
    return (
      (!query ||
        `${item.id} ${item.name} ${item.supplier}`
          .toLowerCase()
          .includes(query)) &&
      (categoryFilter.value === "all" || item.category === categoryFilter.value)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedInventory, rowNumber } = usePagination(filteredInventory);
const totalItems = computed(() => inventory.value.length);
const lowStock = computed(() =>
  inventory.value.filter(
    (item) => item.currentStock > 0 && item.currentStock <= item.minimumStock,
  ),
);
const outOfStock = computed(() =>
  inventory.value.filter((item) => item.currentStock === 0),
);
const inventoryValue = computed(() =>
  inventory.value.reduce(
    (total, item) => total + item.currentStock * item.purchasePrice,
    0,
  ),
);
const categoryTone: Record<InventoryCategory, StatusTone> = {
  Fertilizer: "success",
  Pesticides: "danger",
  Tools: "info",
  Packaging: "warning",
  Other: "neutral",
};

onMounted(() =>
  window.setTimeout(() => {
    isLoading.value = false;
  }, 350),
);
function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
function formatCurrency(value: number) {
  return `Rp${formatNumber(value)}`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
function stockTone(item: InventoryItem): StatusTone {
  return item.currentStock === 0
    ? "danger"
    : item.currentStock <= item.minimumStock
      ? "warning"
      : "success";
}
function stockLabel(item: InventoryItem) {
  return item.currentStock === 0
    ? "Out of stock"
    : item.currentStock <= item.minimumStock
      ? "Low stock"
      : "In stock";
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
function resetItemForm() {
  Object.assign(itemForm, {
    name: "",
    category: "Fertilizer",
    currentStock: "",
    unit: "pieces",
    minimumStock: "",
    purchasePrice: "",
    supplier: "",
  });
  formError.value = "";
}
function openAddModal() {
  resetItemForm();
  modalMode.value = "add";
  itemModalOpen.value = true;
}
function openEditModal(item: InventoryItem) {
  selectedItem.value = item;
  Object.assign(itemForm, {
    name: item.name,
    category: item.category,
    currentStock: String(item.currentStock),
    unit: item.unit,
    minimumStock: String(item.minimumStock),
    purchasePrice: String(item.purchasePrice),
    supplier: item.supplier,
  });
  modalMode.value = "edit";
  formError.value = "";
  itemModalOpen.value = true;
}
function saveItem() {
  if (
    !itemForm.name.trim() ||
    !itemForm.unit.trim() ||
    !itemForm.currentStock ||
    !itemForm.minimumStock ||
    !itemForm.purchasePrice ||
    !itemForm.supplier.trim()
  ) {
    formError.value = t("validation.required");
    return;
  }
  const values = {
    name: itemForm.name.trim(),
    category: itemForm.category,
    currentStock: Number(itemForm.currentStock),
    unit: itemForm.unit.trim(),
    minimumStock: Number(itemForm.minimumStock),
    purchasePrice: Number(itemForm.purchasePrice),
    supplier: itemForm.supplier.trim(),
    lastUpdated: "2026-09-17",
  };
  if (modalMode.value === "edit" && selectedItem.value) {
    Object.assign(selectedItem.value, values);
    showToast(t("notifications.updated"), values.name);
  } else {
    const id = `INV-${String(inventory.value.length + 1).padStart(4, "0")}`;
    inventory.value.unshift({ id, ...values });
    showToast(t("notifications.saved"), values.name);
  }
  itemModalOpen.value = false;
}
function openTransaction(type: StockTransactionType, item?: InventoryItem) {
  selectedItem.value = item || null;
  Object.assign(transactionForm, {
    itemId: item?.id || inventory.value[0]?.id || "",
    type,
    quantity: "",
    note: "",
  });
  formError.value = "";
  transactionModalOpen.value = true;
}
function saveTransaction() {
  const item = inventory.value.find(
    (candidate) => candidate.id === transactionForm.itemId,
  );
  const quantity = Number(transactionForm.quantity);
  if (!item || !quantity || quantity <= 0) {
    formError.value = t("validation.positive");
    return;
  }
  if (transactionForm.type === "Stock Out" && quantity > item.currentStock) {
    formError.value = `Only ${item.currentStock} ${item.unit} available for stock out.`;
    return;
  }
  item.currentStock +=
    transactionForm.type === "Stock In" ? quantity : -quantity;
  item.lastUpdated = "2026-09-17";
  transactions.value.unshift({
    id: `STX-${String(transactions.value.length + 1).padStart(4, "0")}`,
    itemId: item.id,
    type: transactionForm.type,
    quantity,
    date: "2026-09-17",
    note: transactionForm.note.trim() || `${transactionForm.type} recorded.`,
  });
  transactionModalOpen.value = false;
  showToast(
    `${transactionForm.type} recorded`,
    `${quantity} ${item.unit} updated for ${item.name}.`,
  );
}
function askDelete(item: InventoryItem) {
  selectedItem.value = item;
  confirmOpen.value = true;
}
function deleteItem() {
  if (!selectedItem.value) return;
  const itemName = selectedItem.value.name;
  inventory.value = inventory.value.filter(
    (item) => item.id !== selectedItem.value?.id,
  );
  confirmOpen.value = false;
  showToast(t("notifications.deleted"), itemName);
}
function itemById(itemId: string) {
  return inventory.value.find((item) => item.id === itemId);
}
</script>

<template>
  <div class="@container">
    <header
      class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 class="page-title">{{ t('inventory.title') }}</h1>
        <p class="secondary-text mt-2">
          Manage supplies, tools, and packaging across your farm operations.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton variant="secondary" @click="openTransaction('Stock Out')"
          ><template #leading
            ><TrendingDown :size="16" aria-hidden="true" /></template
          >{{ t('inventory.stockOut') }}</UiButton
        ><UiButton variant="secondary" @click="openTransaction('Stock In')"
          ><template #leading
            ><TrendingUp :size="16" aria-hidden="true" /></template
          >{{ t('inventory.stockIn') }}</UiButton
        ><UiButton @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >{{ t('inventory.add') }}</UiButton
        >
      </div>
    </header>
    <section
      class="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4"
      aria-label="Inventory overview"
    >
      <div class="ui-card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ t('inventory.totalItems') }}</p>
          <Box :size="18" class="text-green-700" aria-hidden="true" />
        </div>
        <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
          {{ totalItems }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Tracked inventory items</p>
      </div>
      <div class="ui-card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ t('inventory.lowStock') }}</p>
          <AlertTriangle :size="18" class="text-amber-600" aria-hidden="true" />
        </div>
        <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
          {{ lowStock.length }}
        </p>
        <p class="mt-1 text-xs text-slate-500">At or below minimum</p>
      </div>
      <div class="ui-card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ t('inventory.outOfStock') }}</p>
          <TrendingDown :size="18" class="text-red-600" aria-hidden="true" />
        </div>
        <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
          {{ outOfStock.length }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Items needing purchase</p>
      </div>
      <div class="ui-card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ t('inventory.inventoryValue') }}</p>
          <PackagePlus :size="18" class="text-blue-700" aria-hidden="true" />
        </div>
        <p class="mt-4 text-xl font-semibold tabular-nums text-slate-900">
          {{ formatCurrency(inventoryValue) }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Current stock valuation</p>
      </div>
    </section>
    <section class="mt-8" aria-label="Inventory table">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row">
        <div class="min-w-0 flex-1">
          <UiInput
            v-model="search"
            :label="t('common.search')"
            type="search"
            placeholder="Search item, ID, or supplier"
            ><template #trailing
              ><Search
                :size="17"
                class="text-slate-400"
                aria-hidden="true" /></template
          ></UiInput>
        </div>
        <div class="sm:w-56">
          <UiSelect
            v-model="categoryFilter"
            :label="t('inventory.category')"
            :options="categoryOptions"
          />
        </div>
      </div>
      <div
        v-if="isLoading"
        class="ui-card h-96 animate-pulse bg-slate-100"
        aria-label="Loading inventory"
      />
      <UiEmptyState
        v-else-if="!filteredInventory.length"
        title="No inventory items found"
        description="Try adjusting your search or category filter, or add a new item."
        ><UiButton @click="openAddModal"
          ><template #leading><Plus :size="16" aria-hidden="true" /></template
          >{{ t('inventory.add') }}</UiButton
        ></UiEmptyState
      ><UiTable v-else caption="Inventory items"
        ><template #head
          ><tr>
            <th>{{ t('common.number') }}</th>
            <th>{{ t('inventory.itemName') }}</th>
            <th>{{ t('inventory.category') }}</th>
            <th class="numeric">{{ t('inventory.currentStock') }}</th>
            <th>{{ t('inventory.unit') }}</th>
            <th class="numeric">{{ t('inventory.minimumStock') }}</th>
            <th class="numeric">{{ t('inventory.purchasePrice') }}</th>
            <th>{{ t('inventory.supplier') }}</th>
            <th>{{ t('inventory.lastUpdated') }}</th>
            <th><span class="sr-only">{{ t('common.actions') }}</span></th>
          </tr></template
        >
        <tr
          v-for="(item, index) in paginatedInventory"
          :key="item.id"
          :class="
            item.currentStock <= item.minimumStock
              ? 'bg-amber-50/40'
              : undefined
          "
        >
          <td class="text-slate-500">{{ rowNumber(index) }}</td>
          <td class="whitespace-nowrap font-medium text-slate-800">
            {{ item.name }}
          </td>
          <td>
            <UiBadge :tone="categoryTone[item.category]">{{
              item.category
            }}</UiBadge>
          </td>
          <td class="numeric">
            <span
              class="font-semibold"
              :class="
                item.currentStock === 0
                  ? 'text-red-700'
                  : item.currentStock <= item.minimumStock
                    ? 'text-amber-700'
                    : 'text-slate-800'
              "
              >{{ formatNumber(item.currentStock) }}</span
            ><span v-if="item.currentStock <= item.minimumStock" class="ml-2"
              ><UiBadge :tone="stockTone(item)">{{
                stockLabel(item)
              }}</UiBadge></span
            >
          </td>
          <td>{{ item.unit }}</td>
          <td class="numeric">{{ formatNumber(item.minimumStock) }}</td>
          <td class="numeric whitespace-nowrap">
            {{ formatCurrency(item.purchasePrice) }}
          </td>
          <td class="whitespace-nowrap">{{ item.supplier }}</td>
          <td class="whitespace-nowrap">{{ formatDate(item.lastUpdated) }}</td>
          <td>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded-md p-1.5 text-green-700 hover:bg-green-50"
                :aria-label="`Stock in ${item.name}`"
                @click="openTransaction('Stock In', item)"
              >
                <TrendingUp :size="16" aria-hidden="true" /></button
              ><button
                type="button"
                class="rounded-md p-1.5 text-amber-700 hover:bg-amber-50"
                :aria-label="`Stock out ${item.name}`"
                @click="openTransaction('Stock Out', item)"
              >
                <TrendingDown :size="16" aria-hidden="true" /></button
              ><button
                type="button"
                class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                :aria-label="`Edit ${item.name}`"
                @click="openEditModal(item)"
              >
                <MoreHorizontal :size="18" aria-hidden="true" /></button
              ><button
                type="button"
                class="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                :aria-label="`Delete ${item.name}`"
                @click="askDelete(item)"
              >
                <Trash2 :size="16" aria-hidden="true" />
              </button>
            </div>
          </td></tr
      ></UiTable><UiPagination v-if="filteredInventory.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredInventory.length" />
    </section>
    <section class="mt-6">
      <UiCard
        title="Recent stock transactions"
        description="Latest stock movements across the inventory."
        ><div v-if="transactions.length" class="overflow-x-auto">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Item</th>
                <th>Type</th>
                <th class="numeric">Quantity</th>
                <th>Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transaction in transactions.slice(0, 5)"
                :key="transaction.id"
              >
                <td class="font-medium text-slate-800">{{ transaction.id }}</td>
                <td>
                  {{ itemById(transaction.itemId)?.name || "Deleted item" }}
                </td>
                <td>
                  <UiBadge
                    :tone="
                      transaction.type === 'Stock In' ? 'success' : 'warning'
                    "
                    >{{ transaction.type }}</UiBadge
                  >
                </td>
                <td class="numeric">
                  {{ formatNumber(transaction.quantity) }}
                  {{ itemById(transaction.itemId)?.unit }}
                </td>
                <td class="whitespace-nowrap">
                  {{ formatDate(transaction.date) }}
                </td>
                <td>{{ transaction.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <UiEmptyState
          v-else
          title="No transactions yet"
          description="Stock movements will appear here after they are recorded."
      /></UiCard>
    </section>
    <UiModal
      v-model="itemModalOpen"
      :title="
        modalMode === 'add' ? 'Add inventory item' : 'Edit inventory item'
      "
      :description="
        modalMode === 'add'
          ? 'Add a supply, tool, or packaging item.'
          : 'Update inventory item details.'
      "
      ><form
        id="inventory-item-form"
        class="space-y-4"
        @submit.prevent="saveItem"
      >
        <UiInput
          v-model="itemForm.name"
          :label="t('inventory.itemName')"
          placeholder="e.g. NPK 16-16-16 Fertilizer"
          required
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="itemForm.category"
            :label="t('inventory.category')"
            :options="formCategoryOptions"
          /><UiInput
            v-model="itemForm.unit"
            :label="t('inventory.unit')"
            placeholder="bags, kg, pieces"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="itemForm.currentStock"
            :label="t('inventory.currentStock')"
            type="number"
            min="0"
            placeholder="0"
            required
          /><UiInput
            v-model="itemForm.minimumStock"
            :label="t('inventory.minimumStock')"
            type="number"
            min="0"
            placeholder="0"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="itemForm.purchasePrice"
            :label="`${t('inventory.purchasePrice')} (Rp)`"
            type="number"
            min="0"
            placeholder="0"
            required
          /><UiInput
            v-model="itemForm.supplier"
            :label="t('inventory.supplier')"
            placeholder="Supplier name"
            required
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="itemModalOpen = false"
          >{{ t('common.cancel') }}</UiButton
        ><UiButton type="submit" form="inventory-item-form">{{
          modalMode === "add" ? "Add Item" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="transactionModalOpen"
      :title="transactionForm.type"
      :description="`Record ${transactionForm.type.toLowerCase()} for an inventory item.`"
      ><form
        id="inventory-transaction-form"
        class="space-y-4"
        @submit.prevent="saveTransaction"
      >
        <UiSelect
          v-model="transactionForm.itemId"
          label="Item"
          :options="itemOptions"
        /><UiInput
          v-model="transactionForm.quantity"
          :label="t('saleDetail.products.quantity')"
          type="number"
          min="1"
          placeholder="0"
          required
        />
        <div class="space-y-1.5">
          <label for="transaction-note" class="ui-label">Note</label
          ><textarea
            id="transaction-note"
            v-model="transactionForm.note"
            class="ui-field min-h-24 resize-y"
            placeholder="Add a transaction note."
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="transactionModalOpen = false"
          >{{ t('common.cancel') }}</UiButton
        ><UiButton type="submit" form="inventory-transaction-form">{{
          transactionForm.type
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Delete inventory item?"
      description="This action cannot be undone."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to delete
        <strong class="font-semibold text-slate-900">{{
          selectedItem?.name
        }}</strong
        >? Its inventory record will be removed.
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >{{ t('common.cancel') }}</UiButton
        ><UiButton variant="danger" @click="deleteItem"
          >{{ t('common.delete') }}</UiButton
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
