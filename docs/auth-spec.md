# Specyfikacja modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1. Warstwa prezentacji (frontend)
- **Strony Astro:**  
  - Utworzenie nowych stron:  
    - `/login` – strona logowania (umożliwia logowanie z przekazywaniem komunikatów o błędach, przekierowanie do listy podróży po zalogowaniu). Jest to strona startowa dla niezalogowanych użytkowników. Użytkownik ma możliwość przełączenia widoku na formularz rejestracji lub odzyskiwania hasła
    - `/register` – strona rejestracji (formularz rejestracyjny z polami: email, hasło, potwierdzenie hasła oraz komunikaty walidacyjne).
    - `/recover` – strona odzyskiwania hasła (formularz do podania adresu email).
  - **Layout główny (@Layout.astro):**  
    - Dla niezalogowanych użytkowników centralnymi elementami są przyciski „Zaloguj się” oraz „Zarejestruj się”, które kierują do odpowiedniej strony (na której widoki formularzy są przełączalne).
    - Dla zalogowanych użytkowników wyświetlany jest przycisk „Wyloguj się” (zgodnie z implementacją w Navigation.tsx).
    - Mechanizm warunkowego renderowania elementów zależnie od stanu autentykacji.

- **Komponenty Client-side (React):**  
  - **Formularze:**  
    - Dynamiczne formularze rejestracji i logowania, wykorzystujące walidację po stronie klienta przy użyciu hooków (np. `useState`, `useEffect`).
    - Użycie biblioteki formularzy (np. react-hook-form) dla lepszej obsługi walidacji.
  - **Walidacja i komunikaty błędów:**  
    - Walidacja pól: sprawdzenie formatu adresu email, zgodności hasła i potwierdzenia, minimalnej długości hasła.
    - Wyświetlanie komunikatów błędów bezpośrednio w formularzu oraz responsywnych komunikatów przy błędach zwróconych przez backend (np. niepoprawne dane logowania).
  
- **Scenariusze użytkownika:**  
  - **Rejestracja (US-001):**  
    - Użytkownik wchodzi na stronę rejestracji, wypełnia formularz (email, hasło, potwierdzenie hasła).  
    - Po stronie klienta odbywa się wstępna walidacja — błędy (np. brak wypełnionego pola, niezgodne hasła) powodują natychmiastowe wyświetlenie komunikatów.
    - Po wysłaniu formularza następuje żądanie do API rejestracji.
    - Po pozytywnej walidacji po stronie serwera konto użytkwonika jest aktywowane (możliwe wysłanie odpowiedzi e-mail – opcjonalnie, zależy od konfiguracji Supabase).
  
  - **Logowanie (US-002):**  
    - Użytkownik przechodzi na stronę logowania, podaje adres email oraz hasło.
    - Również następuje walidacja pól (wymagane wartości, poprawny format email).
    - W przypadku błędnych danych wyświetlony zostanie komunikat o nieprawidłowych danych logowania.
    - Po pomyślnym logowaniu użytkownik zostaje przekierowany do widoku listy podróży.

  - **Odzyskiwanie hasła:**  
    - Użytkownik korzysta z formularza odzyskiwania hasła dostępnego z poziomu strony logowania.
    - Po podaniu adresu email oraz wysłaniu formularza, wywoływane jest żądanie do API odpowiedzialnego za reset hasła.
    - Użytkownik po pozytywnej weryfikacji otrzymuje komunikat o wysłaniu instrukcji resetu.

## 2. Logika backendowa

### 2.1. Struktura endpointów API
- Utworzenie nowych endpointów w folderze `./src/pages/api`:
  - **Rejestracja:**  
    - Endpoint: `POST /api/auth/register`  
    - Odpowiedzialność: Przyjmowanie danych rejestracyjnych (email, hasło, potwierdzenie), walidacja oraz rejestracja użytkownika poprzez Supabase Auth.
  
  - **Logowanie:**  
    - Endpoint: `POST /api/auth/login`  
    - Odpowiedzialność: Weryfikacja danych logowania, obsługa sesji oraz przekierowanie odpowiedzi do klienta.
  
  - **Odzyskiwanie hasła:**  
    - Endpoint: `POST /api/auth/recover`  
    - Odpowiedzialność: Przyjmowanie emaila i wywołanie mechanizmu Supabase do wysłania instrukcji resetu hasła.
  
### 2.2. Walidacja danych wejściowych
- Użycie bibliotek typu Zod do walidacji danych wejściowych:
  - Schemat dla rejestracji (walidacja email, hasło, potwierdzenie hasła oraz sprawdzenie, czy hasła są zgodne).
  - Schemat dla logowania (sprawdzenie poprawności emaila i niepustego pola hasła).
  - Schemat dla odzyskiwania hasła (sprawdzenie formatu emaila).

### 2.3. Obsługa wyjątków i błędów
- Implementacja mechanizmu try-catch w endpointach w celu wychwytywania błędów.
- W przypadku błędów (np. błąd Supabase, niepoprawne dane wejściowe) zwracanie odpowiednich kodów HTTP (400 dla walidacji, 401 dla nieautoryzowanych prób, 500 dla błędów serwera).
- Logowanie błędów do dedykowanego systemu logowania (np. przy pomocy konsoli serwerowej lub zewnętrznego serwisu).

### 2.4. Renderowanie stron
- Użycie serwerowego renderowania stron zgodnie z konfiguracją w `astro.config.mjs` (tryb `server` i adapter `node`).
- Przekazywanie stanu sesji do stron Astro w celu warunkowego renderowania elementów (np. dostęp do opcji wylogowania, ochrona zawartości profilu).

## 3. System autentykacji

### 3.1. Integracja z Supabase Auth
- **Rejestracja:**  
  - Bezpośrednio lub poprzez API, wykorzystanie metod Supabase do utworzenia konta użytkownika.
  - Dane wprowadzone przez użytkownika są przekazywane do Supabase, gdzie odbywa się dodatkowa weryfikacja bezpieczeństwa, a następnie tworzone zostaje konto.
  
- **Logowanie i wylogowywanie:**  
  - Użycie metod Supabase Auth do logowania użytkownika (np. `supabase.auth.signInWithPassword`) oraz wylogowywania (np. `supabase.auth.signOut`).
  - Utrzymywanie sesji użytkownika poprzez mechanizmy cookies lub context przekazywany przez Astro.
  
- **Odzyskiwanie hasła:**  
  - Wywołanie odpowiedniego mechanizmu Supabase do wysyłania e-maila resetującego hasło.
  
### 3.2. Kontrakt i moduły
- **Moduł autoryzacji (service):**  
  - Utworzenie serwisu w folderze `./src/lib/services/auth.ts` odpowiedzialnego za komunikację z Supabase.
  - Serwis zawiera metody: `registerUser`, `loginUser`, `recoverPassword`, które ujednolica komunikację z backendem.
  
- **Middleware:**  
  - Rozszerzenie istniejącego middleware (w `./src/middleware/index.ts`) o sprawdzanie stanu sesji i autentykacji przed udostępnieniem chronionych zasobów.
  
- **Modele danych i typy (TypeScript):**  
  - Zdefiniowanie typów danych użytkownika oraz odpowiedzi z API w pliku `./src/types.ts` celem zapewnienia spójności kontraktów między frontendem a backendem.

## Kluczowe wnioski:
- **Separacja odpowiedzialności:**  
  - Strony Astro obsługują routing, renderowanie i integrację z backendem, natomiast dynamiczne formularze logiki (rejestracja/logowanie) są zarządzane przez komponenty React.
  
- **Solidna walidacja danych:**  
  - Walidacja odbywa się zarówno po stronie klienta (form validation), jak i po stronie serwera (przy użyciu Zod), co zapewnia bezpieczny przepływ danych.
  
- **Bezpieczeństwo:**  
  - Użycie Supabase Auth oraz mechanizmów sesyjnych gwarantuje bezpieczeństwo przechowywanych danych i ich jednolitą obsługę.
  
- **Feedback użytkownika:**  
  - Komunikaty błędów są wyświetlane na etapie walidacji w formularzach oraz po otrzymaniu odpowiedzi z serwera, co zwiększa komfort użytkownika.
  
- **Integracja z istniejącą architekturą:**  
  - Nowe endpointy API oraz moduł autentykacji są zgodne z aktualną konfiguracją Astro (`astro.config.mjs`) oraz stosowanym stackiem technologicznym, co pozwala zachować spójność całej aplikacji.
