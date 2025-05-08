import { z } from "zod";

export const updateProfileSchema = z.object({
  preferences: z.string().min(1, "Preferences cannot be empty"),
  level: z.number()
    .min(1, "Level must be between 1 and 5")
    .max(5, "Level must be between 1 and 5")
    .int("Level must be an integer")
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;