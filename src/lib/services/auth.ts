import type { LoginFormData, RegisterFormData, RecoverFormData } from "../validations/auth";
import type { AuthState } from "../../types";
import { toast } from 'sonner';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function login(data: LoginFormData): Promise<void> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AuthError(error.error || "Failed to sign in");
  }

  // Browser will handle redirect from server
  return;
}

export async function register(data: RegisterFormData): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AuthError(error.error || "Failed to create account");
  }

  // Browser will handle redirect from server
  return;
}

export async function recover(data: RecoverFormData): Promise<void> {
  const response = await fetch("/api/auth/recover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AuthError(error.error || "Failed to send reset instructions");
  }
}

export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Przekieruj do strony logowania po pomyślnym wylogowaniu
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}