/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The URL of the Supabase project instance. */
  readonly VITE_SUPABASE_URL: string;
  /** Public anonymous Supabase key, safe for client-side use. */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** GA4 measurement id ("G-XXXXXXXXXX"). Empty/absent disables analytics. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
