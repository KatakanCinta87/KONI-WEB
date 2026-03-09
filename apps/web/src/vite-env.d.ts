/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string
    readonly VITE_PUBLIC_DATA_MODE?: 'demo' | 'live'
    readonly VITE_VERCEL_ENV?: string
    readonly VITE_VERCEL_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
