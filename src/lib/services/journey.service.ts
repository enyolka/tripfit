import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateJourneyCommand, JourneyDTO, UpdateJourneyCommand } from "../../types";
import type { Database } from "../../db/database.types";

class JourneyServiceError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "JourneyServiceError";
    }
}

export class JourneyService {
    constructor(private readonly supabase: SupabaseClient<Database>) {
        if (!supabase) {
            throw new JourneyServiceError("Supabase client is not initialized", "INITIALIZATION_ERROR");
        }

        if (!supabase.auth) {
            throw new JourneyServiceError("Supabase auth is not initialized", "INITIALIZATION_ERROR");
        }
    }

    private async getUserId(): Promise<string> {
        try {
            const {
                data: { user },
                error,
            } = await this.supabase.auth.getUser();

            if (error) {
                throw new JourneyServiceError("Failed to get authenticated user", "UNAUTHORIZED", error);
            }

            if (!user) {
                throw new JourneyServiceError("User not authenticated", "UNAUTHORIZED");
            }

            return user.id;
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError("Failed to verify authentication", "UNAUTHORIZED", error);
        }
    }

    async createJourney(data: Omit<CreateJourneyCommand, "user_id">): Promise<JourneyDTO> {
        try {
            const userId = await this.getUserId();

            const { data: createdData, error } = await this.supabase
                .from("journeys")
                .insert({
                    destination: data.destination,
                    departure_date: data.departure_date,
                    return_date: data.return_date,
                    activities: data.activities,
                    additional_notes: data.additional_notes || [],
                    user_id: userId,
                })
                .select()
                .single();

            if (error) {
                // Handle specific database errors
                switch (error.code) {
                    case "23505": // unique_violation
                        throw new JourneyServiceError(
                            "A journey with these details already exists",
                            "DUPLICATE_JOURNEY",
                            error
                        );
                    case "23503": // foreign_key_violation
                        throw new JourneyServiceError(
                            "Referenced user does not exist",
                            "INVALID_USER_REFERENCE",
                            error
                        );
                    case "23514": // check_violation
                        throw new JourneyServiceError(
                            "Journey data violates database constraints",
                            "CONSTRAINT_VIOLATION",
                            error
                        );
                    default:
                        throw new JourneyServiceError("Failed to create journey", "DATABASE_ERROR", error);
                }
            }

            if (!createdData) {
                throw new JourneyServiceError("No data returned after journey creation", "NO_DATA_RETURNED");
            }

            return {
                ...createdData,
                additional_notes: Array.isArray(createdData.additional_notes) ? createdData.additional_notes : [],
            };
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError(
                "An unexpected error occurred while creating the journey",
                "UNEXPECTED_ERROR",
                error
            );
        }
    }

    async getJourneys(): Promise<JourneyDTO[]> {
        try {
            const userId = await this.getUserId();

            const { data, error } = await this.supabase
                .from("journeys")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                throw new JourneyServiceError("Failed to fetch journeys", "DATABASE_ERROR", error);
            }

            // Always return an array, empty if no data
            return (data || []).map((journey: Database["public"]["Tables"]["journeys"]["Row"]) => ({
                ...journey,
                additional_notes: Array.isArray(journey.additional_notes) ? journey.additional_notes : [],
            }));
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError(
                "An unexpected error occurred while fetching journeys",
                "UNEXPECTED_ERROR",
                error
            );
        }
    }

    async getJourney(journeyId: number): Promise<JourneyDTO> {
        try {
            const userId = await this.getUserId();

            const { data, error } = await this.supabase
                .from("journeys")
                .select("*")
                .eq("id", journeyId)
                .eq("user_id", userId)
                .single();

            if (error) {
                throw new JourneyServiceError("Failed to fetch journey", "DATABASE_ERROR", error);
            }

            if (!data) {
                throw new JourneyServiceError("Journey not found or access denied", "NOT_FOUND");
            }

            return {
                ...data,
                additional_notes: Array.isArray(data.additional_notes) ? data.additional_notes : [],
            };
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError(
                "An unexpected error occurred while fetching the journey",
                "UNEXPECTED_ERROR",
                error
            );
        }
    }

    async deleteJourney(journeyId: number): Promise<void> {
        try {
            const userId = await this.getUserId();

            // First check if journey exists and belongs to user
            const { data: journey, error: checkError } = await this.supabase
                .from("journeys")
                .select("id")
                .eq("id", journeyId)
                .eq("user_id", userId)
                .single();

            if (checkError || !journey) {
                throw new JourneyServiceError("Journey not found or access denied", "NOT_FOUND");
            }

            // Delete the journey (related records will be deleted via ON DELETE CASCADE)
            const { error: deleteError } = await this.supabase
                .from("journeys")
                .delete()
                .eq("id", journeyId)
                .eq("user_id", userId);

            if (deleteError) {
                throw new JourneyServiceError("Failed to delete journey", "DATABASE_ERROR", deleteError);
            }
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError(
                "An unexpected error occurred while deleting the journey",
                "UNEXPECTED_ERROR",
                error
            );
        }
    }

    async updateJourney(journeyId: number, command: UpdateJourneyCommand): Promise<JourneyDTO> {
        try {
            const userId = await this.getUserId();

            // First get the current journey data
            const { data: currentJourney, error: getError } = await this.supabase
                .from("journeys")
                .select("*")
                .eq("id", journeyId)
                .eq("user_id", userId)
                .single();

            if (getError || !currentJourney) {
                throw new JourneyServiceError("Journey not found or access denied", "NOT_FOUND");
            }

            // Update only the fields that are provided in the command
            const updateData = {
                ...(command.destination !== undefined && { destination: command.destination }),
                ...(command.departure_date !== undefined && { departure_date: command.departure_date }),
                ...(command.return_date !== undefined && { return_date: command.return_date }),
                ...(command.activities !== undefined && { activities: command.activities }),
                ...(command.additional_notes !== undefined && { additional_notes: command.additional_notes }),
            };

            const { data: updatedData, error: updateError } = await this.supabase
                .from("journeys")
                .update(updateData)
                .eq("id", journeyId)
                .eq("user_id", userId)
                .select()
                .single();

            if (updateError) {
                switch (updateError.code) {
                    case "23514": // check_violation
                        throw new JourneyServiceError(
                            "Journey data violates database constraints",
                            "CONSTRAINT_VIOLATION",
                            updateError
                        );
                    case "23503": // foreign_key_violation
                        throw new JourneyServiceError(
                            "Referenced user does not exist",
                            "INVALID_USER_REFERENCE",
                            updateError
                        );
                    default:
                        throw new JourneyServiceError("Failed to update journey", "DATABASE_ERROR", updateError);
                }
            }

            if (!updatedData) {
                throw new JourneyServiceError("Journey not found or access denied", "NOT_FOUND");
            }

            return {
                ...updatedData,
                additional_notes: Array.isArray(updatedData.additional_notes) ? updatedData.additional_notes : [],
            };
        } catch (error) {
            if (error instanceof JourneyServiceError) {
                throw error;
            }

            throw new JourneyServiceError(
                "An unexpected error occurred while updating the journey",
                "UNEXPECTED_ERROR",
                error
            );
        }
    }
}
