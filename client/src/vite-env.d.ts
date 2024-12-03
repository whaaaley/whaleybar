/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PREFIX: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
