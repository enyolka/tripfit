# API Endpoint Implementation Plan: POST /api/journeys/{id}/generations

## 1. Przegląd punktu końcowego
Celem endpointu jest generowanie nowego planu podróży za pomocą zewnętrznej usługi AI. Użytkownik wysyła żądanie POST na ścieżce `/api/journeys/{id}/generations` (gdzie `{id}` to identyfikator podróży). Wykorzystuje dane podróży z tabeli journeys (np. destination, departure_date, additional_notes) oraz opcjonalne preferencje przesłane w ciele żądania, zapewniając spójność danych. Endpoint generuje plan, zapisuje wynik w bazie danych (tabela `generations`) ze statusem `generated`.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/journeys/{id}/generations`
- **Parametry:**
  - *Wymagane:* 
    - `id` (journey ID) – w parametrze ścieżki
  - *Opcjonalne:* 
    - `plan_preferences` – obiekt, przekazywany w body requestu
- **Request Body:**
  ```json
  {
    "plan_preferences": { ... } // opcjonalne dodatkowe preferencje
  }
  ```
   Jeśli wartość `plan_preferences` nie zostanie przekazana, system powinien użyć domyślnych ustawień generowania planu.

## 3. Wykorzystywane typy
- **DTO:** GenerationDTO (określony w types.ts)
- **Command Model:** CreateGenerationCommand (z opcjonalnym polem plan_preferences)

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - Kod: 201 Created
  - Treść: Obiekt zawierający szczegóły wygenerowanego planu (m.in. generated_text, status "generated")
- **Błędy:**
  - 400 Bad Request – błędy walidacji (np. nieprawidłowy format danych)
  - 401 Unauthorized – brak lub niepoprawny token autoryzacyjny
  - 404 Not Found – brak zasobu journey o podanym ID lub brak dostępu do niego
  - 500 Internal Server Error – błąd serwera, np. awaria zewnętrznego serwisu AI

## 5. Przepływ danych
1. **Autoryzacja & Weryfikacja:**
   - Użytkownik wysyła żądanie z tokenem autoryzacyjnym.
   - Middleware weryfikuje token oraz pobiera dane użytkownika.
2. **Walidacja wejścia:**
   - Walidacja parametru `id` w URL i opcjonalnego obiektu `plan_preferences` w ciele żądania (z wykorzystaniem zod).
3. **Pobranie danych z bazy:**
   - Weryfikacja, czy journey o podanym ID istnieje i należy do aktualnie zalogowanego użytkownika (RLS).
   - Pobranie danych journey (destination, departure_date, additional_notes, itd.).
4. **Wywołanie serwisu AI:**
   - Przekazanie pobranych danych wraz z opcjonalnymi preferencjami do zewnętrznego serwisu AI.
   - Otrzymanie wyniku – tekst generowanego planu.
5. **Zapis do bazy:**
   -  Wstaw nowy rekord do tabeli `generations` z kolumnami:
     - `journey_id` – przekazany `id`
     - `generated_text` – wynik odebrany z zewnętrznej usługi AI
     - `status` – ustawiony jako `generated`
     - Inne wymagane pola jak `source_text_hash`, `source_text_length` (wynikające z statusu wejścia, np. hash generowanego tekstu)
6. **Logowanie błędów:**  
   -  W sytuacji niepowodzenia (np. zewnętrzna usługa AI zwraca błąd) – utwórz wpis w tabeli `generation_error_logs` z informacjami o błędzie.
7. **Odpowiedź:**
   - W przypadku sukcesu – zwróć kod 201 Created wraz z danymi nowo utworzonej generacji.
   - W przypadku błędów walidacji – odpowiedź 400.
   - W przypadku błędu serwera – odpowiedź 500.

## 6. Względy bezpieczeństwa
- **Autentykacja:** Użycie tokenu (np. Supabase Auth) w nagłówku Authorization.
- **Autoryzacja:** Sprawdzenie, czy journey o podanym ID należy do zalogowanego użytkownika (mechanizmy RLS).
- **Walidacja danych:** Walidacja formatu dat, poprawności opcjonalnych preferencji oraz ograniczeń biznesowych.
- **Bezpieczeństwo komunikacji:** Wymuszenie HTTPS dla transmisji wrażliwych danych.

## 7. Obsługa błędów
- **Walidacja wejścia:** Jeśli dane wejściowe nie spełniają wymagań, zwrócić 400 Bad Request z opisem błędu.
- **Brak zasobu:** Jeśli journey o podanym ID nie istnieje lub nie należy do użytkownika, zwrócić 404 Not Found.
- **Autoryzacja:** Jeśli token nie jest dostarczony lub jest nieprawidłowy, zwrócić 401 Unauthorized.
- **Błąd serwera:** Jeśli wywołanie zewnętrznego serwisu AI się nie powiedzie, zwrócić 500 Internal Server Error.
- **Logowanie błędów:** W przypadku niepowodzenia wywołania AI lub innych błędów serwerowych, zapisywać szczegóły błędu do tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności
- **Konsolidacja zapytań:** Upewnić się, że pobranie journey z bazy odbywa się przy użyciu indeksów (np. idx_journeys_user_id).
- **Asynchroniczność:** Rozważyć asynchroniczne wywołania do zewnętrznego serwisu AI, żeby nie blokować wątków serwera.
- **Cache'owanie:** W przypadku często powtarzających się żądań dla tego samego journey rozważyć cache'owanie odpowiedzi lub wyników AI (jeśli to uzasadnione).
- **Ograniczenia serwisów zewnętrznych:** Monitorować opóźnienia wywołań AI i implementować timeouty oraz retry logic.

## 9. Etapy wdrożenia
1. **Konfiguracja routingu:**
   - Utworzyć plik API endpointu w `./src/pages/api/journeys/[id]/generations.ts`.
   - Ustawić `export const prerender = false`.
2. **Walidacja wejścia:**
   - Zdefiniować schematy walidacyjne dla parametrów URL i body przy użyciu Zod.
3. **Autoryzacja i kontrola dostępu:**
   - Zapewnić weryfikację tokena autoryzacyjnego oraz sprawdzanie własności journey.
4. **Logika biznesowa:**
   - Utworzyć lub rozszerzyć serwis (np. `src/lib/services/generationService.ts`) odpowiedzialny za:
     - Pobranie danych journey z bazy.
     - Wywołanie zewnętrznego serwisu AI.
     - Zapis wygenerowanego planu do tabeli `generations`.
     - Obsługę błędów i logowanie problemów do `generation_error_logs`.
5. **Wywołanie zewnętrznego serwisu AI:**
   - Zaimplementować logikę komunikacji z serwisem AI.
   - Dodać timeout i obsługę błędów.
6. **Zapis do bazy danych:**
   - Wykonać zapytanie insert do tabeli `generations` z wykorzystaniem odpowiednich typów i wartości domyślnych.
7. **Obsługa błędów:**
   - Implementacja bloków try-catch - dodanie wpisu do tabeli `generation_error_logs`.
   - Zwracanie odpowiednich kodów statusu HTTP przy błędach.
