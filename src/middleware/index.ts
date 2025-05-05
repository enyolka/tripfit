import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Ścieżki publiczne, dostępne dla niezalogowanych użytkowników
const PUBLIC_PATHS = ["/login", "/register", "/recover"];

// Ścieżki dostępne tylko dla zalogowanych użytkowników
const PROTECTED_PATHS = ["/journeys", "/journey"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, request } = context;

  const supabase = createSupabaseServerInstance({ 
    cookies,
    headers: request.headers 
  });

  const { data: { user } } = await supabase.auth.getUser();
  const currentPath = url.pathname;

  // Przekieruj zalogowanego użytkownika z publicznych ścieżek na /journeys
  if (user && PUBLIC_PATHS.some(path => currentPath.startsWith(path))) {
    return context.redirect('/journeys');
  }

  // Przekieruj niezalogowanego użytkownika z chronionych ścieżek na /login
  if (!user && PROTECTED_PATHS.some(path => currentPath.startsWith(path))) {
    return context.redirect('/login?redirect_to=' + encodeURIComponent(currentPath));
  }

  // Przekieruj niezalogowanego użytkownika z root path na /login
  if (!user && currentPath === '/') {
    return context.redirect('/login');
  }

  // Przekieruj zalogowanego użytkownika z root path na /journeys
  if (user && currentPath === '/') {
    return context.redirect('/journeys');
  }

  // Ustaw user w locals jeśli jest zalogowany
  if (user) {
    context.locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  return next();
});