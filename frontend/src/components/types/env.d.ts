/// <reference types="astro/client" />
/// <reference types="@material-tailwind/react" />

interface ImportMetaEnv {
    readonly PUBLIC_URL_BACKEND: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}