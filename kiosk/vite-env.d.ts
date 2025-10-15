/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MACHINE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
