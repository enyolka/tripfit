import type { Database } from "./db/database.types";
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from './db/supabase.client';

// ------------------------------------------------------------------------------------------------
// 1. Preferences: Main DTO oparty o model bazy oraz interfejsy dla create/update
// ------------------------------------------------------------------------------------------------
// Główny model oparty o typ z bazy danych.
export type PreferenceDTO = Database["public"]["Tables"]["preferences"]["Row"];

// Interfejsy dla operacji update (polegają wyłącznie na interfejsach)
export interface UpdatePreferenceCommand {
	preference: string;
	level: number;
}

// (Jeśli potrzebny, można dodać CreatePreferenceCommand zdefiniowany "ręcznie") 

// ------------------------------------------------------------------------------------------------
// 2. Journeys: Main DTO oparty o model bazy z transformacją oraz interfejsy dla create/update
// ------------------------------------------------------------------------------------------------
export type JourneyDTO = Omit<Database["public"]["Tables"]["journeys"]["Row"], "additional_notes"> & {
	// Transformacja: additional_notes z bazy jako string zmieniamy na string[]
	additional_notes: string[];
};

// Interfejs dla tworzenia – definiowany niezależnie od bazy (pomijamy pola generowane automatycznie)
export interface CreateJourneyCommand {
	departure_date: string;
	return_date: string;
	destination: string;
	user_id: string;
	activities?: string | null;
	additional_notes: string[];
}

// Interfejs dla aktualizacji – częściowa aktualizacja
export interface UpdateJourneyCommand extends Partial<CreateJourneyCommand> {}

// ------------------------------------------------------------------------------------------------
// 3. Generations: Main DTO oparty o model bazy z transformacją oraz interfejsy dla create/update
// ------------------------------------------------------------------------------------------------
export type GenerationDTO = Omit<
	Database["public"]["Tables"]["generations"]["Row"],
	"accepted_edited_count" | "accepted_unedited_count" | "generated_count"
> & {
	// Dodajemy pola wymagane przez API
	generated_text: string;
	edited_text?: string;
	status: "generated" | "accepted_unedited" | "accepted_edited" | "rejected";
};

// Interfejs dla tworzenia generacji – oparty wyłącznie na interfejsie
export interface CreateGenerationCommand {
	plan_preferences?: Record<string, any>;
	// Jeśli wymagane są dodatkowe pola, można je dodać "ręcznie"
}

// Interfejs dla aktualizacji generacji – edycja tekstu zawsze ustawia status na accepted_edited
export interface UpdateGenerationCommand {
	edited_text: string;
	status: "accepted_edited";  // zawsze ta wartość przy edycji
}

// ------------------------------------------------------------------------------------------------
// 4. Generation Error Logs: Main DTO oparty o model bazy
// ------------------------------------------------------------------------------------------------
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// ------------------------------------------------------------------------------------------------
// 5. Authentication State: Types for authentication state
// ------------------------------------------------------------------------------------------------
export interface AuthState {
  user: User | null;
  redirectTo?: string;
}

declare global {
  interface Locals {
    user: User | null;
    supabase: SupabaseClient;
  }
}
