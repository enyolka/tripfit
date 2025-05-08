import { z } from "zod";

export const updatePreferenceSchema = z.object({
  preference: z.string()
    .min(1, "Preferencja nie może być pusta")
    .max(100, "Preferencja nie może być dłuższa niż 100 znaków"),
  level: z.number()
    .int("Poziom musi być liczbą całkowitą")
    .min(1, "Poziom musi być między 1 a 5")
    .max(5, "Poziom musi być między 1 a 5")
});

export type UpdatePreferenceFormData = z.infer<typeof updatePreferenceSchema>;