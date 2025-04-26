# Architektura UI dla TripFit

## 1. Przegląd struktury UI

Aplikacja TripFit składa się z modułów autoryzacji, dashboardu podróży, widoku szczegółów podróży oraz profilu użytkownika. Główna struktura opiera się na pojedynczej, responsywnej stronie głównej, zawierającej dynamiczne sekcje. Interakcje użytkownika są wzbogacone o animacje, powiadomienia toast oraz modale do edycji. Całość integruje funkcjonalności API (m.in. pobieranie danych podróży, generowanie planów oraz aktualizację profilu) przy użyciu Context API do zarządzania stanem.

## 2. Lista widoków

### Widok Autoryzacji
- **Ścieżka widoku:** `/auth`
- **Główny cel:** Umożliwienie rejestracji, logowania oraz resetowania hasła za pomocą Supabase Auth.
- **Kluczowe informacje do wyświetlenia:**
  - Formularz logowania z opcją resetu hasła („Forgot your password?”).
  - Formularz rejestracji z polem potwierdzenia hasła.
- **Kluczowe komponenty widoku:** 
  - Formularze (logowania, rejestracji, resetowania hasła).
  - Przełącznik widoków (taby lub przyciski).
  - Komponenty walidacji i komunikatów błędów.
- **UX, dostępność i względy bezpieczeństwa:** 
  - Responsywny design, dostępność poprzez ARIA (role, aria-live).
  - Bezpieczne przetwarzanie danych użytkownika i walidacja wejścia.

### Dashboard
- **Ścieżka widoku:** `/dashboard` (dostępne po autoryzacji)
- **Główny cel:** Prezentacja listy utworzonych podróży z opcjami filtrowania i sortowania.
- **Kluczowe informacje do wyświetlenia:**
  - Lista podróży (nazwa, daty, status generacji).
  - Kontrolki filtrów (sortowanie według daty, statusu).
- **Kluczowe komponenty widoku:** 
  - Lista/siatka podróży.
  - Komponenty filtrujące i sortujące.
  - Ikony statusu oraz dynamiczne powiadomienia (toasty).
- **UX, dostępność i względy bezpieczeństwa:** 
  - Szybkie wyszukiwanie i prosta nawigacja.
  - Informacje zwrotne o operacjach asynchronicznych (spinner, toast).
  - Bezpieczne pobieranie danych przez API.

### Widok Szczegółów Podróży
- **Ścieżka widoku:** `/journeys/{id}`
- **Główny cel:** Prezentacja pełnych szczegółów danej podróży, w tym notatek, danych podróży i wygenerowanych planów.
- **Kluczowe informacje do wyświetlenia:**
  - Dane podróży pobrane z API (lokalizacja, daty, aktywności, dodatkowe notatki).
  - Sekcja generowania planów – przycisk „Generuj plan” oraz lista wygenerowanych planów.
  - Edycja planu poprzez modal z opcją zapisu lub anulowania zmian.
- **Kluczowe komponenty widoku:** 
  - Sekcja edycji danych podróży.
  - Komponent przycisku „Generuj plan” z dynamicznym spinnerem.
  - Lista planów z opcją edycji (przez modal).
  - Komponent obsługi toastów dla komunikatów o sukcesie i błędach.
- **UX, dostępność i względy bezpieczeństwa:** 
  - Płynna nawigacja inline z rozsuwanymi/zwijalnymi sekcjami.
  - ARIA dla dynamicznych elementów (alerty, role dialogu).
  - Spójne komunikaty o błędach (bez wyświetlania szczegółów technicznych).

### Widok Profilu Użytkownika
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Zarządzanie preferencjami oraz danymi użytkownika.
- **Kluczowe informacje do wyświetlenia:**
  - Podstawowe dane użytkownika (nazwa, email).
  - Sekcja preferencji aktywności fizycznych z poziomem zaawansowania.
- **Kluczowe komponenty widoku:** 
  - Formularz edycji danych i preferencji.
  - Przycisk zapisu zmian.
- **UX, dostępność i względy bezpieczeństwa:** 
  - Formularze z walidacją i przejrzystymi komunikatami.
  - ARIA dla formularzy, dynamicznych komunikatów typu toast.
  - Bezpieczne przesyłanie danych do API.

## 3. Mapa podróży użytkownika

1. **Wejście do systemu:**
   - Użytkownik odwiedza stronę autoryzacji.
   - Rejestracja lub logowanie za pomocą formularzy.
2. **Przejście do dashboardu:**
   - Po pomyślnym logowaniu użytkownik przekierowywany jest do dashboardu.
   - Użytkownik może przeglądać listę swoich podróży oraz używać filtrów.
3. **Szczegóły podróży:**
   - Kliknięcie na wybraną podróż przekierowuje użytkownika do widoku szczegółów.
   - Użytkownik przegląda dane podróży, generuje nowy plan lub edytuje istniejący.
4. **Edycja planu:**
   - Klikając „Edytuj” konkretny plan, użytkownik otwiera modal z możliwością modyfikacji.
   - Po zatwierdzeniu zmian, plan jest aktualizowany poprzez API.
5. **Zarządzanie profilem:**
   - Użytkownik wchodzi w widok profilu, aby zaktualizować swoje preferencje.
   - Zmiany są automatycznie zapisywane i wpływają na przyszłe generowanie planów.
6. **Powiadomienia:**
   - Podczas operacji (np. reset hasła, zapis zmian) pojawiają się toast notifications informujące o wyniku akcji.

## 4. Układ i struktura nawigacji

- **Menu główne:** 
  - Umieszczone w nagłówku, dostępne z każdej strony.
  - Linki do: Dashboard, Profil, Ewentualnie pomoc oraz wylogowanie.
  - Dynamiczne podświetlenie aktywnego linku poprzez zmianę koloru/pogrubienie.
- **Nawigacja wewnętrzna:**
  - W widoku szczegółów podróży – zakładki/sekcje dla danych podróży, generowania planów, edycji notatek.
  - Responsywne układy menu dla urządzeń mobilnych (np. hamburger menu).

## 5. Kluczowe komponenty

- **Formularze autoryzacji:** 
  - Komponenty logowania, rejestracji i resetowania hasła, z walidacją i wsparciem ARIA.
- **Lista podróży:** 
  - Komponent listy z filtrowaniem i sortowaniem.
- **Komponent planu podróży:** 
  - Prezentacja wygenerowanego planu, z opcjami edycji (otwieranie modala).
- **Toast notifications:** 
  - Globalny system powiadomień informujący o sukcesie lub błędzie operacji.
- **Spinnery i animacje:** 
  - Komponenty informujące o stanie ładowania i operacjach asynchronicznych (fade, slide, shimmer).
- **Modal edycji:** 
  - Dynamiczne okno do inline edycji elementów interfejsu z opcjami zapisu lub anulowania zmian.
- **Nawigacja menu:** 
  - Intuicyjny pasek nawigacyjny z dynamicznym podświetleniem aktywnego widoku.
