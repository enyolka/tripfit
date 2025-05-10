# Plan Testów dla Projektu TripFit

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie
Niniejszy dokument określa strategię, zakres, podejście oraz zasoby przeznaczone do przeprowadzenia testów aplikacji TripFit. Celem jest zapewnienie wysokiej jakości produktu końcowego, zgodnego z wymaganiami funkcjonalnymi i niefunkcjonalnymi.

### 1.2. Cele testowania
*   Weryfikacja zgodności aplikacji z dokumentacją projektową i wymaganiami użytkownika.
*   Wykrycie i zaraportowanie defektów przed wdrożeniem produkcyjnym.
*   Zapewnienie stabilności, wydajności i bezpieczeństwa aplikacji.
*   Ocena użyteczności i dostępności interfejsu użytkownika.
*   Minimalizacja ryzyka związanego z błędami w oprogramowaniu.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami
*   **Moduł Użytkownika:**
    *   Rejestracja, logowanie, wylogowywanie.
    *   Zarządzanie profilem użytkownika (edycja danych, preferencji - np. endpoint `/api/profile` z [#file:preferences-put-endpoint.md](c:\developer\dev\tripfit\docs\implementation-plan\profile\preferences-put-endpoint.md) i [#file:preferences-get-endpoint.md](c:\developer\dev\tripfit\docs\implementation-plan\profile\preferences-get-endpoint.md)).
    *   Resetowanie hasła.
*   **Moduł Planowania Podróży:**
    *   Tworzenie nowej podróży.
    *   Generowanie planów podróży z wykorzystaniem AI (Openrouter.ai).
    *   Wyświetlanie szczegółów podróży i wygenerowanych planów (np. komponent `GeneratedPlansList` z [#file:journey-view-implementation-plan-single-journey\journey-view-implementation-plan-gemini-2.md](c:\developer\dev\tripfit\docs\implementation-plan\single-journey\journey-view-implementation-plan-gemini-2.md)).
    *   Modyfikacja i usuwanie planów.
    *   Zapisywanie i przeglądanie historii podróży.
*   **Interfejs Użytkownika (UI):**
    *   Nawigacja i układ strony.
    *   Poprawność wyświetlania treści statycznych i dynamicznych.
    *   Responsywność na różnych urządzeniach.
    *   Dostępność (zgodność z ARIA).
*   **API Backendu:**
    *   Wszystkie endpointy w api.
    *   Walidacja danych wejściowych i wyjściowych.
    *   Obsługa błędów.
    *   Autentykacja i autoryzacja.
*   **Integracja z Supabase:**
    *   Operacje CRUD na bazie danych.
    *   Poprawność działania Row Level Security.
    *   Mechanizmy autentykacji.
*   **Integracja z Openrouter.ai:**
    *   Poprawność wysyłania zapytań i odbierania odpowiedzi.
    *   Obsługa błędów komunikacji.

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy)
*   Na obecnym etapie nie przewiduje się wyłączeń, chyba że zostaną zidentyfikowane obszary o bardzo niskim priorytecie i ryzyku, np. tryb ciemny, który jest planowany na przyszłe iteracje ([#file:prd-planing.md](c:\developer\dev\tripfit\docs\notes\prd-planing.md)).

## 3. Typy testów do przeprowadzenia

*   **Testy jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania pojedynczych komponentów, funkcji, modułów w izolacji.
    *   **Zakres:** Funkcje w lib, custom hooki React (hooks), logika endpointów API (bez zależności zewnętrznych), komponenty Astro i React (renderowanie, podstawowe interakcje).
    *   **Narzędzia:** Vitest, React Testing Library.
*   **Testy integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy pomiędzy różnymi modułami i usługami.
    *   **Zakres:**
        *   Integracja komponentów frontendowych z serwisami.
        *   Integracja endpointów API z bazą danych Supabase.
        *   Integracja z API Openrouter.ai.
        *   Działanie middleware Astro.
    *   **Narzędzia:** Vitest, React Testing Library, mockowanie usług (np. MSW - Mock Service Worker), testowa instancja Supabase.
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w całej aplikacji, od interfejsu po bazę danych.
    *   **Zakres:** Kluczowe przepływy użytkownika (rejestracja, logowanie, tworzenie podróży, generowanie planu, zarządzanie profilem).
    *   **Narzędzia:** Playwright lub Cypress.
*   **Testy API:**
    *   **Cel:** Bezpośrednie testowanie endpointów API pod kątem poprawności odpowiedzi, obsługi różnych metod HTTP, walidacji, autentykacji i autoryzacji.
    *   **Zakres:** Wszystkie endpointy w api.
    *   **Narzędzia:** Postman, Newman (do automatyzacji w CI), lub testy pisane w kodzie (np. z użyciem `fetch` w Vitest).
*   **Testy wydajnościowe (Performance Tests):**
    *   **Cel:** Ocena szybkości ładowania stron, czasu odpowiedzi API, obciążenia bazy danych.
    *   **Zakres:** Kluczowe strony i endpointy, szczególnie te generujące dynamiczną treść lub wykonujące złożone operacje.
    *   **Narzędzia:** Lighthouse, WebPageTest, k6 (dla API).
*   **Testy bezpieczeństwa (Security Tests):**
    *   **Cel:** Identyfikacja i eliminacja podatności.
    *   **Zakres:** Ochrona przed OWASP Top 10 (SQLi, XSS, CSRF), poprawność implementacji autentykacji i autoryzacji (RLS w Supabase).
    *   **Narzędzia:** ZAP (OWASP Zed Attack Proxy), manualna weryfikacja, skanery bezpieczeństwa.
*   **Testy użyteczności (Usability Tests):**
    *   **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu.
    *   **Zakres:** Główne funkcjonalności aplikacji.
    *   **Metody:** Testy z użytkownikami, analiza heurystyczna.
*   **Testy dostępności (Accessibility Tests):**
    *   **Cel:** Zapewnienie zgodności z wytycznymi WCAG i poprawności implementacji ARIA.
    *   **Zakres:** Cała aplikacja.
    *   **Narzędzia:** Axe, Wave, manualna weryfikacja z czytnikami ekranu.
*   **Testy regresji wizualnej:**
    *   **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie UI.
    *   **Zakres:** Kluczowe strony i komponenty.
    *   **Narzędzia:** Playwright z porównywaniem screenshotów, Percy, Applitools.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

Przykładowe scenariusze (szczegółowe przypadki testowe zostaną opracowane oddzielnie):

*   **SC001: Rejestracja nowego użytkownika**
    *   Kroki: Wprowadzenie poprawnych danych, akceptacja regulaminu, kliknięcie "Zarejestruj".
    *   Oczekiwany rezultat: Użytkownik zostaje zarejestrowany, zalogowany i przekierowany na stronę główną/profilu.
*   **SC002: Logowanie istniejącego użytkownika**
    *   Kroki: Wprowadzenie poprawnego emaila i hasła, kliknięcie "Zaloguj".
    *   Oczekiwany rezultat: Użytkownik zostaje zalogowany i przekierowany na stronę główną/profilu.
*   **SC003: Tworzenie nowej podróży i generowanie planu**
    *   Kroki: Użytkownik loguje się, przechodzi do sekcji planowania, wprowadza dane podróży (miejsce docelowe, daty, preferencje), inicjuje generowanie planu.
    *   Oczekiwany rezultat: System komunikuje się z Openrouter.ai, generuje plan podróży i wyświetla go użytkownikowi. Plan jest zapisywany w bazie danych.
*   **SC004: Edycja preferencji profilu użytkownika**
    *   Kroki: Użytkownik loguje się, przechodzi do ustawień profilu, modyfikuje swoje preferencje (np. dotyczące podróży), zapisuje zmiany.
    *   Oczekiwany rezultat: Zmiany są zapisywane w bazie danych (endpoint PUT `/api/profile`), interfejs odzwierciedla nowe ustawienia.
*   **SC005: Niepoprawna walidacja danych w formularzu**
    *   Kroki: Użytkownik próbuje przesłać formularz (np. rejestracji, logowania, planowania) z niepoprawnymi lub brakującymi danymi.
    *   Oczekiwany rezultat: Wyświetlane są komunikaty o błędach walidacji przy odpowiednich polach, formularz nie jest przesyłany.
*   **SC006: Dostęp do zasobów bez autoryzacji**
    *   Kroki: Niezalogowany użytkownik próbuje uzyskać dostęp do strony profilu lub innej chronionej sekcji.
    *   Oczekiwany rezultat: Użytkownik jest przekierowywany na stronę logowania, dostęp jest blokowany.
*   **SC007: Wyświetlanie szczegółów podróży**
    *   Kroki: Użytkownik wybiera istniejącą podróż z listy.
    *   Oczekiwany rezultat: Wyświetlane są wszystkie szczegóły podróży, w tym wygenerowane plany (np. przez `GeneratedPlansList`).

## 5. Środowisko testowe

*   **Środowisko deweloperskie (lokalne):** Do testów jednostkowych i wczesnych testów integracyjnych.
*   **Środowisko testowe (staging):** Oddzielna instancja aplikacji wdrożona na DigitalOcean (lub podobnym), zintegrowana z testową instancją Supabase. Służy do testów integracyjnych, E2E, UAT. Powinno być jak najbardziej zbliżone do środowiska produkcyjnego.
*   **Środowisko produkcyjne:** Ograniczone testy typu "smoke tests" po każdym wdrożeniu.

## 6. Narzędzia do testowania

*   **Frameworki testowe:**
    *   Vitest (dla testów jednostkowych i integracyjnych JavaScript/TypeScript)
    *   React Testing Library (dla testowania komponentów React)
*   **Narzędzia E2E:**
    *   Playwright
*   **Testowanie API:**
    *   Postman (manualne i eksploracyjne)
    *   Newman (automatyzacja testów API w CI/CD)
    *   Możliwość pisania testów API w kodzie (np. z `fetch` w Vitest)
*   **Mockowanie:**
    *   MSW (Mock Service Worker) dla mockowania API w testach frontendowych
    *   Wbudowane mechanizmy mockowania w Vitest/Jest
*   **Wydajność:**
    *   Google Lighthouse
    *   WebPageTest
    *   k6
*   **Bezpieczeństwo:**
    *   OWASP ZAP
*   **Dostępność:**
    *   Axe DevTools
    *   Wave Evaluation Tool
    *   Czytniki ekranu (NVDA, VoiceOver)
*   **CI/CD:**
    *   GitHub Actions (do automatycznego uruchamiania testów)
*   **Zarządzanie testami i błędami:**
    *   GitHub Issues (do raportowania i śledzenia błędów)
    *   Możliwość integracji z dedykowanym narzędziem do zarządzania testami (np. TestRail, Xray) w przyszłości.

## 7. Harmonogram testów

Harmonogram testów powinien być zintegrowany z cyklem rozwoju oprogramowania (np. sprintami w Agile).

*   **Testy jednostkowe i integracyjne:** Przeprowadzane ciągle przez deweloperów podczas implementacji nowych funkcjonalności i refaktoryzacji. Muszą być częścią definicji "ukończone" (Definition of Done) dla każdego zadania.
*   **Testy API:** Rozwijane równolegle z implementacją endpointów.
*   **Testy E2E:** Tworzone dla kluczowych przepływów po ustabilizowaniu się interfejsu i funkcjonalności. Uruchamiane regularnie, przynajmniej przed każdym releasem.
*   **Testy regresji:** Uruchamiane przed każdym wdrożeniem na środowisko testowe i produkcyjne.
*   **Testy wydajnościowe, bezpieczeństwa, użyteczności, dostępności:** Planowane cyklicznie, np. raz na iterację/release, lub ad-hoc w przypadku większych zmian w tych obszarach.
*   **User Acceptance Testing (UAT):** Przed wdrożeniem na produkcję, z udziałem interesariuszy/klienta.

Szczegółowy harmonogram będzie zależał od planu wdrożenia poszczególnych funkcji.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia (rozpoczęcia testów)
*   Dostępna dokumentacja wymagań i specyfikacji.
*   Środowisko testowe jest przygotowane i skonfigurowane.
*   Kod został wdrożony na środowisku testowym.
*   Podstawowe "smoke tests" przechodzą pomyślnie.
*   Narzędzia testowe są dostępne i skonfigurowane.

### 8.2. Kryteria wyjścia (zakończenia testów)
*   Wszystkie zaplanowane przypadki testowe zostały wykonane.
*   Określony procent przypadków testowych zakończył się sukcesem (np. 95% dla krytycznych i wysokich priorytetów, 100% dla "smoke tests").
*   Wszystkie krytyczne i o wysokim priorytecie błędy zostały naprawione i przetestowane ponownie (re-test).
*   Pozostałe błędy (średni, niski priorytet) są udokumentowane i zaakceptowane przez Product Ownera/managera projektu do naprawy w przyszłych iteracjach.
*   Raport z testów został przygotowany i zaakceptowany.
*   Pokrycie kodu testami jednostkowymi osiągnęło zdefiniowany próg (np. 70-80%).

## 9. Role i odpowiedzialności w procesie testowania

*   **Deweloperzy:**
    *   Tworzenie i utrzymanie testów jednostkowych i integracyjnych.
    *   Naprawianie błędów wykrytych podczas wszystkich faz testów.
    *   Uczestnictwo w code review, w tym przegląd testów.
*   **Inżynier QA / Tester:**
    *   Projektowanie i utrzymanie planu testów.
    *   Tworzenie i wykonywanie przypadków testowych (manualnych i automatycznych E2E, API).
    *   Raportowanie i śledzenie błędów.
    *   Przygotowywanie raportów z testów.
    *   Koordynacja testów UAT.
    *   Przeprowadzanie testów niefunkcjonalnych (wydajność, bezpieczeństwo, dostępność).
*   **Product Owner / Manager Projektu:**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja błędów.
    *   Akceptacja wyników testów UAT.
    *   Podejmowanie decyzji o wdrożeniu na produkcję.
*   **Użytkownicy / Interesariusze:**
    *   Udział w testach UAT.
    *   Dostarczanie informacji zwrotnej.

## 10. Procedury raportowania błędów

*   **Narzędzie:** GitHub Issues.
*   **Proces zgłaszania błędu:**
    1.  Sprawdzenie, czy błąd nie został już zgłoszony.
    2.  Utworzenie nowego zgłoszenia (Issue) z odpowiednim szablonem.
    3.  **Tytuł:** Krótki, zwięzły opis problemu.
    4.  **Opis:**
        *   Kroki do reprodukcji błędu (szczegółowe i jednoznaczne).
        *   Oczekiwany rezultat.
        *   Rzeczywisty rezultat.
        *   Środowisko testowe (np. przeglądarka, system operacyjny, wersja aplikacji).
        *   Dane testowe użyte do reprodukcji.
        *   Zrzuty ekranu / nagrania wideo (jeśli dotyczy).
    5.  **Priorytet:** (np. Krytyczny, Wysoki, Średni, Niski) - wstępnie określany przez zgłaszającego, weryfikowany przez PO/PM.
    6.  **Etykiety:** (np. `bug`, `frontend`, `backend`, `api`, nazwa modułu).
    7.  Przypisanie do odpowiedniej osoby/zespołu (jeśli znane).
*   **Cykl życia błędu:**
    *   `New/Open`: Nowo zgłoszony błąd.
    *   `In Progress/Assigned`: Błąd jest analizowany lub naprawiany.
    *   `Resolved/Fixed`: Błąd został naprawiony przez dewelopera i jest gotowy do re-testu.
    *   `Ready for Test`: Błąd wdrożony na środowisko testowe.
    *   `Closed`: Błąd został pomyślnie przetestowany i zamknięty.
    *   `Reopened`: Błąd nie został poprawnie naprawiony i jest ponownie otwierany.
    *   `Deferred/Won't Fix`: Naprawa błędu została odłożona lub błąd nie zostanie naprawiony.

Regularne przeglądy zgłoszonych błędów będą przeprowadzane w celu monitorowania postępów i priorytetyzacji.