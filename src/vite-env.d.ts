/// <reference types="vite/client" />

declare module 'vuejs-paginate-next' {
  import type { DefineComponent } from 'vue'
  const Paginate: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default Paginate
}
