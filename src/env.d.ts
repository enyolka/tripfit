/// <reference types="astro/client" />
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from './db/supabase.client';

declare global {
  interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_KEY: string;
    readonly OPENROUTER_API_KEY: string;
    // more env variables...
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  namespace App {
    interface Locals {
      user: User | null;
      supabase: SupabaseClient;
    }
  }
}

export {};
