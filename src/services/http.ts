import axios from 'axios'
import { useWorkspaceStore } from '@/stores/workspace.store'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const path = config.url ?? ''
  const isAuthRequest = path.startsWith('/sanctum/') || path.startsWith('/api/auth/')
  if (!isAuthRequest) {
    const workspaceId = useWorkspaceStore().selectedWorkspace?.workspaceId
    if (workspaceId) config.headers.set('X-Workspace-ID', workspaceId)
  }
  return config
})

export default http
