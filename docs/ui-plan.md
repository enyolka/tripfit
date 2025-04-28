# Architektura UI dla TripFit

## 1. Przegląd struktury UI

Aplikacja TripFit składa się z modułów autoryzacji, widoku podróży, widoku szczegółów podróży oraz profilu użytkownika. Główna struktura opiera się na pojedynczej, responsywnej stronie głównej, zawierającej dynamiczne sekcje. Interakcje użytkownika są wzbogacone o animacje, powiadomienia toast oraz modale do edycji. Całość integruje funkcjonalności API (m.in. pobieranie danych podróży, generowanie planów oraz aktualizację profilu) przy użyciu Context API do zarządzania stanem. Widoki podróży, szczegółów podróży i profilu są dostępne wyłącznie po zalogowaniu.

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

### Widok Podróży
- **Ścieżka widoku:** `/journeys` (dostępne po zalogowaniu)
- **Główny cel:** Prezentacja listy utworzonych podróży z opcjami filtrowania i sortowania oraz umożliwienie dodania nowej podróży.
- **Kluczowe informacje do wyświetlenia:**
  - Lista podróży (nazwa, daty, status generacji).
  - Kontrolki filtrów (sortowanie według daty, statusu).
  - Przycisk dodawania nowej podróży, umieszczony u góry listy.
- **Kluczowe komponenty widoku:** 
  - Lista/siatka podróży.
  - Komponenty filtrujące i sortujące.
  - Ikony statusu oraz dynamiczne powiadomienia (toasty).
  - Przycisk do dodania nowej podróży, który otwiera modal z formularzem tworzenia nowej podróży.
- **UX, dostępność i względy bezpieczeństwa:** 
  - Szybkie wyszukiwanie i prosta nawigacja.
  - Informacje zwrotne o operacjach asynchronicznych (spinner, toast).
  - Bezpieczne pobieranie danych przez API.
- **Dodatkowa funkcjonalność:**  
  - Po wypełnieniu formularza w modalu i poprawnym zapisaniu danych do bazy (tworząc nowy obiekt podróży), nastąpi przekierowanie użytkownika do widoku szczegółów nowej podróży, gdzie będzie można edytować i dodawać kolejne dane.

### Widok Szczegółów Podróży
- **Ścieżka widoku:** `/journeys/{id}`
- **Główny cel:** Prezentacja pełnych szczegółów danej podróży, w tym notatek, danych podróży i wygenerowanych planów.
- **Kluczowe informacje do wyświetlenia:**
  - Dane podróży pobrane z API (lokalizacja, daty, aktywności, dodatkowe notatki).
  - Sekcja generowania planów – przycisk „Generuj plan” oraz lista wygenerowanych planów.
  - Możliwość edycji danych podróży oraz edycji samego planu przez otwarcie modala z opcją zapisu lub anulowania zmian.
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
2. **Przejście do widoku podróży:**
   - Po pomyślnym logowaniu użytkownik przekierowywany jest do widoku podróży (`/journeys`).
   - Użytkownik przegląda listę swoich podróży oraz korzysta z filtrów i opcji sortowania.
   - Użytkownik może dodać nową podróż, klikając przycisk umożliwiający otwarcie modalu.
3. **Tworzenie nowej podróży:**
   - Modal zawiera formularz do wpisania wszystkich wymaganych danych zgodnie z API.
   - Po zatwierdzeniu formularza dane są wysyłane do bazy w celu utworzenia nowego obiektu podróży.
   - Po pomyślnym zapisaniu następuje przekierowanie do widoku szczegółów tej nowej podróży.
4. **Szczegóły podróży:**
   - Kliknięcie na dowolną podróż lub przekierowanie po utworzeniu nowej podróży prowadzi do widoku szczegółów (`/journeys/{id}`).
   - Użytkownik przegląda dane podróży, generuje nowy plan lub edytuje istniejący.
5. **Edycja planu oraz danych podróży:**
   - Klikając „Edytuj” konkretne dane lub plan, użytkownik otwiera modal z możliwością modyfikacji.
   - Po zatwierdzeniu zmian, dane są aktualizowane przy użyciu odpowiednich endpointów API.
6. **Zarządzanie profilem:**
   - Użytkownik przechodzi do widoku profilu, aby zaktualizować swoje preferencje.
   - Zmiany są zapisywane i wpływają na przyszłe generowanie planów.
7. **Powiadomienia:**
   - Podczas operacji (np. reset hasła, zapis zmian) pojawiają się toast notifications informujące o wyniku akcji.

## 4. Układ i struktura nawigacji

- **Menu główne:** 
  - Umieszczone w nagłówku, dostępne z każdej strony po zalogowaniu.
  - Linki do: Widoku Podróży (`/journeys`), Profilu (`/profile`), oraz opcji wylogowania.
  - Dynamiczne podświetlenie aktywnego linku poprzez zmianę koloru lub pogrubienie.
- **Nawigacja wewnętrzna:**
  - W widoku szczegółów podróży – zakładki lub sekcje dla danych podróży, generowania planów i edycji notatek.
  - Responsywne układy menu dla urządzeń mobilnych (np. hamburger menu).

## 5. Kluczowe komponenty

- **Formularze autoryzacji:** 
  - Komponenty logowania, rejestracji i resetowania hasła, z walidacją i wsparciem ARIA.
- **Lista podróży:** 
  - Komponent listy z filtrowaniem i sortowaniem, wraz z przyciskiem dodania nowej podróży.
- **Modal tworzenia podróży:** 
  - Okno modalne zawierające formularz do wprowadzania wszystkich wymaganych danych podróży. Po zatwierdzeniu formularza następuje wysłanie danych do API i przekierowanie do nowego widoku szczegółów.
- **Komponent planu podróży:** 
  - Prezentacja wygenerowanego planu, z opcjami edycji (otwieranie modala).
- **Toast notifications:** 
  - Globalny system powiadomień informujący o sukcesie lub błędzie operacji.
- **Spinnery i animacje:** 
  - Komponenty informujące o stanie ładowania i operacjach asynchronicznych (fade, slide, shimmer).
- **Modal edycji:** 
  - Dynamiczne okno do inline edycji elementów interfejsu z opcjami zapisu lub anulowania zmian.
- **Formularze edycji preferencji i danych podróży**
  - Komponenty dodawania i edytowania preferencji oraz poszczególnych danych podróży z osobna.
- **Nawigacja menu:** 
  - Intuicyjny pasek nawigacyjny z dynamicznym podświetleniem aktywnego widoku.
