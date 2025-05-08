import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  preference: z.string(),
  level: z.number().int().min(1).max(5)
});