import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
    .object({
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const recoverSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RecoverFormData = z.infer<typeof recoverSchema>;
