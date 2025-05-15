import { z } from "zod";

export const createPreferenceSchema = z.object({
    activity_name: z
        .string()
        .min(1, "Nazwa aktywności nie może być pusta")
        .max(100, "Nazwa aktywności nie może być dłuższa niż 100 znaków"),
    level: z
        .number()
        .int("Poziom musi być liczbą całkowitą")
        .min(1, "Poziom musi być między 1 a 5")
        .max(5, "Poziom musi być między 1 a 5"),
});

export const updatePreferenceSchema = createPreferenceSchema;

export type CreatePreferenceFormData = z.infer<typeof createPreferenceSchema>;
export type UpdatePreferenceFormData = z.infer<typeof updatePreferenceSchema>;
