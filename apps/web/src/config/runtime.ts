const vercelEnvironment = import.meta.env.VITE_VERCEL_ENV
const vercelDeploymentUrl = import.meta.env.VITE_VERCEL_URL
const configuredPublicDataMode = import.meta.env.VITE_PUBLIC_DATA_MODE

export const isVercelDeployment = Boolean(vercelEnvironment || vercelDeploymentUrl)

export const publicDataMode =
    configuredPublicDataMode === 'demo' || configuredPublicDataMode === 'live'
        ? configuredPublicDataMode
        : isVercelDeployment
            ? 'demo'
            : 'live'

export const isDemoPublishMode = publicDataMode === 'demo'
