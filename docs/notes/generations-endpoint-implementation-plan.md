# API Endpoint Implementation Plan: POST /api/journeys/{id}/generations

## 1. Przegląd punktu końcowego
Celem endpointu jest generowanie nowego planu podróży za pomocą zewnętrznej usługi AI. Użytkownik wysyła żądanie POST na ścieżce `/api/journeys/{id}/generations` (gdzie `{id}` to identyfikator podróży). Endpoint generuje plan, zapisuje wynik w bazie danych (tabela `generations`) ze statusem `generated` i w razie błędu (np. problem z usługą AI) zapisuje wpis do tabeli `generation_error_logs`.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/journeys/{id}/generations`
- **Parametry:**
  - **Wymagane:** 
    - `id` (ścieżkowy parametr – identyfikator podróży; typ bigint)
  - **Opcjonalne:**
    - Żaden dodatkowy parametr w URL; opcjonalne dane przekazywane w ciele żądania.
- **Request Body:**  
  ```json
  {
    "plan_preferences": { ... } // opcjonalny, dodatkowy obiekt preferencji
  }
  ```
  Jeśli wartość `plan_preferences` nie zostanie przekazana, system powinien użyć domyślnych ustawień generowania planu.

## 3. Wykorzystywane typy
- **DTO:**  
  - `GenerationDTO` – reprezentuje rekord wygenerowanego planu podróży.
- **Command Model:**  
  - `CreateGenerationCommand` – zawiera pole `plan_preferences?: Record<string, any>`.

## 4. Przepływ danych
1. **Weryfikacja uwierzytelnienia:**  
   - Sprawdzenie tokenu autoryzacji (np. Supabase Auth). 
   - Upewnij się, że użytkownik jest zalogowany. W razie braku lub nieprawidłowego tokenu – zwróć 401.
2. **Walidacja i pobranie zasobu podróży:**  
   - Zweryfikuj, czy istnieje rekord podróży o przekazanym `id` oraz że należy on do aktualnie uwierzytelnionego użytkownika (RLS oraz sprawdzenie `user_id`).
   - Jeśli podróż nie została znaleziona – zwróć 404.
3. **Walidacja danych wejściowych:**  
   - Użyj Zod lub innej biblioteki walidacji, aby sprawdzić strukturę `request body`.  
   - Ponieważ `plan_preferences` jest opcjonalny, upewnij się, że jeśli występuje, jest obiektem.
4. **Wywołanie zewnętrznej usługi AI:**  
   - Przekaż do usługi niezbędne dane, np. szczegóły podróży oraz preferencje (jeśli podano).
   - Odebranie odpowiedzi zawierającej wygenerowany tekst planu (pole `generated_text`).
5. **Zapis do bazy danych:**  
   - Wstaw nowy rekord do tabeli `generations` z kolumnami:
     - `journey_id` – przekazany `id`
     - `generated_text` – wynik odebrany z zewnętrznej usługi AI
     - `status` – ustawiony jako `generated`
     - Inne wymagane pola jak `source_text_hash`, `source_text_length` (wynikające z statusu wejścia, np. hash generowanego tekstu)
6. **Logowanie błędów:**  
   - W sytuacji niepowodzenia (np. zewnętrzna usługa AI zwraca błąd) – utwórz wpis w tabeli `generation_error_logs` z informacjami o błędzie.
7. **Odpowiedź:**  
   - W przypadku sukcesu – zwróć kod 201 Created wraz z danymi nowo utworzonej generacji.
   - W przypadku błędów walidacji – odpowiedź 400.
   - W przypadku błędu serwera – odpowiedź 500.

## 5. Względy bezpieczeństwa
- **Autoryzacja i uwierzytelnienie:**  
  - Wykorzystanie tokenów (Supabase Auth). Sprawdzenie, czy zasób podróży należy do aktualnego użytkownika.
- **Kontrola dostępu:**  
  - Zastosowanie polityk RLS w bazie danych na tabeli `journeys` oraz `generations`.
- **Walidacja danych:**  
  - Zabezpieczenie przed atakami Iniekcji poprzez walidację wszystkich danych wejściowych.
- **Obsługa danych wrażliwych:**  
  - Rejestracja i maskowanie informacji w logach, aby nie wyciekały dane szczegółowe.

## 6. Obsługa błędów
- **Kod 400 – Nieprawidłowe dane wejściowe:**  
  - Błędy walidacji payloadu – np. niepoprawny format `plan_preferences`.
- **Kod 401 – Brak uwierzytelnienia:**  
  - Błąd występuje, gdy token autoryzacyjny jest nieobecny lub nieważny.
- **Kod 404 – Nie znaleziono zasobu:**  
  - Żądana podróż (`id`) nie została znaleziona lub nie należy do użytkownika.
- **Kod 500 – Błąd serwera:**  
  - Problemy z połączeniem z zewnętrzną usługą AI lub błąd zapisu do bazy danych.
- **Logika logowania błędów:**  
  - W przypadku błędów przy wywołaniu usługi AI – zapis szczegółów błędu do tabeli `generation_error_logs` (uwzględniając `error_code`, `error_message`, itd.).

## 7. Rozważania dotyczące wydajności
- **Asynchroniczne wywołania:**  
  - Rozważ użycie asynchronicznych operacji przy wywołaniu zewnętrznej usługi AI, aby nie blokować głównego wątku.
- **Caching:**  
  - W sytuacjach, gdy dane podróży nie ulegają częstym zmianom, rozważ mechanizmy cache’owania wyników.
- **Optymalizacja zapytań do bazy:**  
  - Zapewnienie właściwych indeksów (np. `idx_generations_journey_id`) dla szybkiego wyszukiwania powiązanych rekordów.
  
## 8. Etapy wdrożenia
1. **Przygotowanie walidacji danych:**  
   - Utworzenie schematu Zod dla `CreateGenerationCommand` w celu walidacji `request body`.
2. **Rozbudowa logiki uwierzytelnienia:**  
   - Upewnić się, że endpoint korzysta z kontekstu Supabase (np. `context.locals.supabase`) do identyfikacji użytkownika.
3. **Pobranie i weryfikacja podróży:**  
   - Pobranie rekordu podróży z bazy i weryfikacja, że należy do aktualnie uwierzytelnionego użytkownika.
4. **Integracja z usługą AI:**  
   - Utworzenie/bądź wykorzystanie istniejącego modułu/service’u w `src/lib/services` do kontaktu z zewnętrzną usługą AI.
   - Implementacja obsługi odpowiedzi oraz błędów.
5. **Zapis nowej generacji do bazy danych:**  
   - Implementacja logiki insercji rekordu w tabeli `generations`, uwzględniając wymagane pola (hash, długość tekstu itp.).
6. **Implementacja logiki logowania błędów:**  
   - W sytuacji błędu podczas wywołania usługi AI – dodanie wpisu do tabeli `generation_error_logs`.
7. **Testowanie endpointu:**  
   - Unit testy i testy integracyjne dla scenariuszy: poprawnej generacji, błędów walidacji, błędów autoryzacyjnych oraz błędów komunikacji z usługą AI.
8. **Dokumentacja:**  
   - Aktualizacja dokumentacji API (np. plik api-plan.md) oraz wewnętrznych dokumentów opisujących logikę backendu.
9. **Review i wdrożenie:**  
   - Code review oraz wdrożenie zmian na środowisko testowe przed ostatecznym wdrożeniem na produkcję.

```

