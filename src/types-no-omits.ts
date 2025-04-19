
import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// 1. Profile DTO & Command Model
// ------------------------------------------------------------------------------------------------
export interface ProfileDTO {
	created_at: string;
	id: string;
	level: number;
	preferences: string;
	updated_at: string;
}

export interface UpdateProfileCommand {
	preferences: string;
	level: number;
}

// ------------------------------------------------------------------------------------------------
// 2. Journey DTO & Command Models
// ------------------------------------------------------------------------------------------------
// Przykładowa struktura tabeli journeys:
// {
//   activities: string | null;
//   additional_notes: string;       // z bazy
//   created_at: string;
//   departure_date: string;
//   destination: string;
//   generation_ids: number[] | null;
//   id: number;
//   return_date: string;
//   updated_at: string;
//   user_id: string;
// }
export interface JourneyDTO {
	activities: string | null;
	// transformujemy additional_notes z stringa na string[]
	additional_notes: string[];
	created_at: string;
	departure_date: string;
	destination: string;
	generation_ids: number[] | null;
	id: number;
	return_date: string;
	updated_at: string;
	user_id: string;
}

export interface CreateJourneyCommand {
	// pomijamy: id, created_at, updated_at, generation_ids
	activities: string | null;
	additional_notes: string[];
	departure_date: string;
	destination: string;
	return_date: string;
	user_id: string;
}

export interface UpdateJourneyCommand {
	activities?: string | null;
	additional_notes?: string[];
	departure_date?: string;
	destination?: string;
	return_date?: string;
	user_id?: string;
}

// ------------------------------------------------------------------------------------------------
// 3. Generation DTO & Command Models
// ------------------------------------------------------------------------------------------------
// Przykładowa struktura tabeli generations (część pól):
// {
//   accepted_edited_count: number;
//   accepted_unedited_count: number;
//   created_at: string;
//   edited_at: string;
//   generated_count: number;
//   id: number;
//   journey_id: number;
//   model: string;
//   source_text_hash: string;
//   source_text_length: number;
// }
export interface GenerationDTO {
	accepted_edited_count: number;
	accepted_unedited_count: number;
	created_at: string;
	edited_at: string;
	generated_count: number;
	id: number;
	journey_id: number;
	model: string;
	source_text_hash: string;
	source_text_length: number;
	// API spec fields:
	generated_text: string;
	edited_text?: string;
	status: "generated" | "accepted_unedited" | "accepted_edited" | "rejected";
}

// Przyjmujemy, że do stworzenia generacji potrzebujemy następujących pól (oprócz tych wyliczonych automatycznie):
export interface CreateGenerationCommand {
	// Dodatkowe ustawienia dla generacji
	plan_preferences?: Record<string, any>;
	// Wymagane pola według modelu bazy mogą być też dodane, jeśli konieczne:
	// journey_id: number;
	// model: string;
	// source_text_hash: string;
	// source_text_length: number;
}

export interface UpdateGenerationCommand {
	edited_text?: string;
	status: "accepted_unedited" | "accepted_edited" | "rejected";
}

// ------------------------------------------------------------------------------------------------
// 4. Generation Error Log DTO
// ------------------------------------------------------------------------------------------------
// Przykładowa struktura tabeli generation_error_logs:
// {
//  error_code: string;
//  error_message: string;
//  error_timestamp: string;
//  id: number;
//  journey_id: number;
//  model: string;
//  source_text_hash: string;
//  source_text_length: number;
//  user_id: string;
// }
export interface GenerationErrorLogDTO {
	error_code: string;
	error_message: string;
	error_timestamp: string;
	id: number;
	journey_id: number;
	model: string;
	source_text_hash: string;
	source_text_length: number;
	user_id: string;
}

// ... inne definicje lub kod niezmieniony ...
