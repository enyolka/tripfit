import type { Database, Json } from "./db/database.types";

/**
 * Profile DTO based on the profiles table.
 */
export type ProfileDTO = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Command model for updating a profile.
 * Expects the client's updated preferences and level.
 */
export type UpdateProfileCommand = {
  preferences: Json;
  level: number;
};

/**
 * Journey DTO based on the journeys table.
 */
export type JourneyDTO = Database["public"]["Tables"]["journeys"]["Row"];

/**
 * Command model for creating a new journey.
 * Excludes auto-generated and system-managed fields.
 */
export type CreateJourneyCommand = Omit<
  Database["public"]["Tables"]["journeys"]["Insert"],
  "id" | "created_at" | "updated_at" | "user_id"
>;

/**
 * Command model for updating an existing journey.
 * Allows partial update of journey fields.
 */
export type UpdateJourneyCommand = Partial<
  Omit<Database["public"]["Tables"]["journeys"]["Update"], "id" | "created_at" | "updated_at" | "user_id">
>;

/**
 * Enumeration of valid generation statuses.
 */
export type GenerationStatus = "generated" | "accepted_unedited" | "accepted_edited" | "rejected";

/**
 * Generation DTO based on the generations table.
 */
export type GenerationDTO = Database["public"]["Tables"]["generations"]["Row"];

/**
 * Command model for creating a new generation.
 * Represents input to generate a travel plan,
 * including optional plan preferences.
 */
export type CreateGenerationCommand = {
  plan_preferences?: Json;
};

/**
 * Command model for updating an existing generation.
 * Allows updating the edited text and setting a new status.
 */
export type UpdateGenerationCommand = {
  edited_text?: string | null;
  status: GenerationStatus;
};

/**
 * Generation Error Log DTO based on the generation_error_logs table.
 */
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_logs"]["Row"];
