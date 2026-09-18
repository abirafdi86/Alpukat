<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UserX,
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
import { useAuthStore } from "@/stores/auth";
import { mockManagedUsers } from "@/data/users";
import type { ManagedUser, UserRole, UserStatus } from "@/data/users";
import type { StatusTone } from "@/types/ui";
import { useLocale } from "@/composables/useLocale";
import { usePagination } from "@/composables/usePagination";
const { t } = useLocale();

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}
const auth = useAuthStore();
const users = ref<ManagedUser[]>(mockManagedUsers.map((user) => ({ ...user })));
const search = ref("");
const statusFilter = ref("all");
const roleFilter = ref("all");
const isLoading = ref(true);
const modalOpen = ref(false);
const confirmOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selectedUser = ref<ManagedUser | null>(null);
const formError = ref("");
const toast = ref<{
  title: string;
  description: string;
  tone: StatusTone;
} | null>(null);
const form = reactive<UserForm>({
  name: "",
  email: "",
  phone: "",
  role: "WORKER",
  status: "Active",
});

const canManageUsers = computed(() => auth.user?.role === "OWNER");
const roleOptions = [
  { label: "All roles", value: "all" },
  { label: "OWNER", value: "OWNER" },
  { label: "WORKER", value: "WORKER" },
];
const formRoleOptions = roleOptions.slice(1);
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];
const formStatusOptions = statusOptions.slice(1);
const filteredUsers = computed(() =>
  users.value.filter((user) => {
    const query = search.value.trim().toLowerCase();
    return (
      (!query ||
        `${user.name} ${user.email} ${user.phone}`
          .toLowerCase()
          .includes(query)) &&
      (roleFilter.value === "all" || user.role === roleFilter.value) &&
      (statusFilter.value === "all" || user.status === statusFilter.value)
    );
  }),
);
const { page, pageSize, paginatedItems: paginatedUsers } = usePagination(filteredUsers);
const statusTone: Record<UserStatus, StatusTone> = {
  Active: "success",
  Inactive: "neutral",
};
const roleTone: Record<UserRole, StatusTone> = {
  OWNER: "success",
  WORKER: "info",
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
    email: "",
    phone: "",
    role: "WORKER",
    status: "Active",
  });
  formError.value = "";
}
function openAddModal() {
  resetForm();
  modalMode.value = "add";
  modalOpen.value = true;
}
function openEditModal(user: ManagedUser) {
  selectedUser.value = user;
  Object.assign(form, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  });
  modalMode.value = "edit";
  formError.value = "";
  modalOpen.value = true;
}
function saveUser() {
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
    formError.value = "Complete all required fields before saving.";
    return;
  }
  const values = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    role: form.role,
    status: form.status,
  };
  if (modalMode.value === "edit" && selectedUser.value) {
    Object.assign(selectedUser.value, values);
    showToast("User updated", `${values.name} has been updated.`);
  } else {
    const id = `USR-${String(users.value.length + 1).padStart(4, "0")}`;
    users.value.unshift({ id, ...values, joinedDate: "Sep 17, 2026" });
    showToast("User added", `${values.name} can now access the workspace.`);
  }
  modalOpen.value = false;
}
function askDeactivate(user: ManagedUser) {
  if (user.email === auth.user?.email) return;
  selectedUser.value = user;
  confirmOpen.value = true;
}
function deactivateUser() {
  if (!selectedUser.value) return;
  selectedUser.value.status = "Inactive";
  confirmOpen.value = false;
  showToast(
    "User deactivated",
    `${selectedUser.value.name} no longer has workspace access.`,
  );
}
</script>

<template>
  <div class="@container">
    <template v-if="canManageUsers">
      <header
        class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="page-title">{{ t('users.title') }}</h1>
          <p class="secondary-text mt-2">
            Manage owners and workers who access your farm workspace.
          </p>
        </div>
        <UiButton class="shrink-0 self-start" @click="openAddModal"
          ><template #leading><Plus :size="18" aria-hidden="true" /></template
          >Add User</UiButton
        >
      </header>
      <section
        class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-label="User summary"
      >
        <div class="ui-card p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Total users</p>
            <UserRound :size="18" class="text-green-700" aria-hidden="true" />
          </div>
          <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
            {{ users.length }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Workspace members</p>
        </div>
        <div class="ui-card p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Active workers</p>
            <ShieldCheck :size="18" class="text-blue-700" aria-hidden="true" />
          </div>
          <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
            {{
              users.filter(
                (user) => user.role === "WORKER" && user.status === "Active",
              ).length
            }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Currently enabled</p>
        </div>
        <div class="ui-card p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Inactive users</p>
            <UserX :size="18" class="text-slate-500" aria-hidden="true" />
          </div>
          <p class="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
            {{ users.filter((user) => user.status === "Inactive").length }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Access disabled</p>
        </div>
      </section>
      <section class="mt-8" aria-label="User list">
        <div class="mb-5 flex flex-col gap-3 sm:flex-row">
          <div class="min-w-0 flex-1">
            <UiInput
              v-model="search"
              label="Search users"
              type="search"
              placeholder="Name, email, or phone"
              ><template #trailing
                ><Search
                  :size="17"
                  class="text-slate-400"
                  aria-hidden="true" /></template
            ></UiInput>
          </div>
          <div class="sm:w-48">
            <UiSelect
              v-model="roleFilter"
              label="Role"
              :options="roleOptions"
            />
          </div>
          <div class="sm:w-48">
            <UiSelect
              v-model="statusFilter"
              label="Status"
              :options="statusOptions"
            />
          </div>
        </div>
        <div
          v-if="isLoading"
          class="ui-card h-80 animate-pulse bg-slate-100"
          aria-label="Loading users"
        />
        <UiEmptyState
          v-else-if="!filteredUsers.length"
          title="No users found"
          description="Try adjusting your search or filters, or add a new user."
          ><UiButton @click="openAddModal"
            ><template #leading><Plus :size="16" aria-hidden="true" /></template
            >Add User</UiButton
          ></UiEmptyState
        ><UiTable v-else caption="Workspace users"
          ><template #head
            ><tr>
              <th>User</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined date</th>
              <th><span class="sr-only">Actions</span></th>
            </tr></template
          >
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>
              <div>
                <p class="font-medium text-slate-800">{{ user.name }}</p>
                <p class="text-xs text-slate-500">{{ user.email }}</p>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ user.phone }}</td>
            <td>
              <UiBadge :tone="roleTone[user.role]">{{ user.role }}</UiBadge>
            </td>
            <td>
              <UiBadge :tone="statusTone[user.status]">{{
                user.status
              }}</UiBadge>
            </td>
            <td class="whitespace-nowrap">{{ user.joinedDate }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  :aria-label="`Edit ${user.name}`"
                  @click="openEditModal(user)"
                >
                  <Edit3 :size="16" aria-hidden="true" /></button
                ><button
                  v-if="
                    user.status === 'Active' && user.email !== auth.user?.email
                  "
                  type="button"
                  class="rounded-md p-1.5 text-amber-700 hover:bg-amber-50"
                  :aria-label="`Deactivate ${user.name}`"
                  @click="askDeactivate(user)"
                >
                  <UserX :size="17" aria-hidden="true" /></button
                ><MoreHorizontal
                  v-else
                  :size="18"
                  class="text-slate-300"
                  aria-hidden="true"
                />
              </div>
            </td></tr
        ></UiTable><UiPagination v-if="filteredUsers.length" v-model:page="page" v-model:page-size="pageSize" :total="filteredUsers.length" />
      </section>
    </template>
    <UiCard v-else class="mt-8"
      ><UiEmptyState
        title="Access restricted"
        description="User Management is available to OWNER accounts only. Your WORKER account can continue using farm operations and reports."
    /></UiCard>
    <UiModal
      v-model="modalOpen"
      :title="modalMode === 'add' ? 'Add user' : 'Edit user'"
      :description="
        modalMode === 'add'
          ? 'Create a workspace account for an owner or worker.'
          : 'Update this workspace account.'
      "
      ><form id="user-form" class="space-y-4" @submit.prevent="saveUser">
        <UiInput
          v-model="form.name"
          label="Name"
          placeholder="Full name"
          required
        /><UiInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          required
        /><UiInput
          v-model="form.phone"
          label="Phone"
          type="tel"
          placeholder="+62 812-0000-0000"
          required
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSelect
            v-model="form.role"
            label="Role"
            :options="formRoleOptions"
          /><UiSelect
            v-model="form.status"
            label="Status"
            :options="formStatusOptions"
          />
        </div>
        <p v-if="formError" class="text-sm text-red-700" role="alert">
          {{ formError }}
        </p>
      </form>
      <template #footer
        ><UiButton variant="secondary" @click="modalOpen = false"
          >Cancel</UiButton
        ><UiButton type="submit" form="user-form">{{
          modalMode === "add" ? "Add User" : "Save Changes"
        }}</UiButton></template
      ></UiModal
    >
    <UiModal
      v-model="confirmOpen"
      title="Deactivate user?"
      description="This user will no longer be able to access the workspace."
      ><p class="text-sm leading-6 text-slate-600">
        Are you sure you want to deactivate
        <strong class="font-semibold text-slate-900">{{
          selectedUser?.name
        }}</strong
        >?
      </p>
      <template #footer
        ><UiButton variant="secondary" @click="confirmOpen = false"
          >Cancel</UiButton
        ><UiButton variant="danger" @click="deactivateUser"
          >Deactivate User</UiButton
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
