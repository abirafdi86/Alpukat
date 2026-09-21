import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { WorkspaceMembership } from '../../shared/types/auth'

const WORKSPACE_STORAGE_KEY = 'workspace_id'

function readStoredWorkspaceId(): string | null {
  try { return sessionStorage.getItem(WORKSPACE_STORAGE_KEY) }
  catch { return null }
}

function persistWorkspaceId(workspaceId: string | null): void {
  try {
    if (workspaceId) sessionStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId)
    else sessionStorage.removeItem(WORKSPACE_STORAGE_KEY)
  } catch { /* Storage may be unavailable in privacy-restricted contexts. */ }
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const availableMemberships = ref<WorkspaceMembership[]>([])
  const selectedWorkspaceId = ref<string | null>(readStoredWorkspaceId())
  const selectedWorkspace = computed(() => availableMemberships.value.find(membership => membership.workspaceId === selectedWorkspaceId.value) ?? null)

  function clearWorkspace() {
    selectedWorkspaceId.value = null
    persistWorkspaceId(null)
  }

  function setAvailableMemberships(memberships: WorkspaceMembership[]) {
    availableMemberships.value = memberships.filter(membership => membership.status === 'ACTIVE')
    if (selectedWorkspaceId.value && !selectedWorkspace.value) clearWorkspace()
  }

  function selectWorkspace(workspaceId: string): boolean {
    const membership = availableMemberships.value.find(candidate => candidate.workspaceId === workspaceId)
    if (!membership) return false
    selectedWorkspaceId.value = membership.workspaceId
    persistWorkspaceId(membership.workspaceId)
    return true
  }

  return { availableMemberships, selectedWorkspaceId, selectedWorkspace, setAvailableMemberships, selectWorkspace, clearWorkspace }
})
