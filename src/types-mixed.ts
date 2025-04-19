// src/types.ts

// Zakładamy, że typy z bazy danych są dostępne, np. poprzez import z 'database.types.ts'
import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// 1. Profiles: Main DTO oparty o model bazy oraz interfejsy dla create/update
// ------------------------------------------------------------------------------------------------
// Główny model oparty o typ z bazy danych.
export type ProfileDTO = Database["public"]["Tables"]["profiles"]["Row"];

// Interfejsy dla operacji update (polegają wyłącznie na interfejsach)
export interface UpdateProfileCommand {
	preferences: Record<string, any> | string;
	level: number;
}

// (Jeśli potrzebny, można dodać CreateProfileCommand zdefiniowany "ręcznie") 

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

// Interfejs dla aktualizacji generacji – częściowa aktualizacja
export interface UpdateGenerationCommand {
	edited_text?: string;
	status: "accepted_unedited" | "accepted_edited" | "rejected";
}

// ------------------------------------------------------------------------------------------------
// 4. Generation Error Logs: Main DTO oparty o model bazy
// ------------------------------------------------------------------------------------------------
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_logs"]["Row"];
