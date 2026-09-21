/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AUTH_MODE?: 'api' | 'mock'
  readonly VITE_DEMO_MODE?: 'api' | 'mock'
  readonly VITE_AUTH_MOCK_DEMO_SCENARIO?: 'success' | 'unavailable' | 'rate-limit' | 'network'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vuejs-paginate-next' {
  import type { DefineComponent } from 'vue'
  const Paginate: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default Paginate
}
