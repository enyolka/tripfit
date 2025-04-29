# API Endpoint Implementation Plan: PUT /api/journeys/{id}

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji istniejącej podróży. Klient wysyła nowe dane dotyczące destynacji, dat wyjazdu i powrotu, aktywności oraz notatek. Aktualizacja odbywa się tylko dla zasobu, do którego użytkownik ma odpowiednie uprawnienia.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT  
- **Struktura URL:** `/api/journeys/{id}`
- **Parametry:**
  - **Wymagane:** 
    - `id` (parametr ścieżki): identyfikator podróży do aktualizacji.
  - **Opcjonalne:** brak (wszystkie pola w ciele żądania są wymagane według specyfikacji, z możliwym pominięciem 

activities

 jeśli nie dotyczy).
- **Request Body:**  
  ```json
  {
      "destination": "string",
      "departure_date": "YYYY-MM-DD",
      "return_date": "YYYY-MM-DD",
      "activities": "string",
      "additional_notes": ["string"]
  }
  ```

## 3. Wykorzystywane typy
- **JourneyDTO:** Typ reprezentujący rekord podróży (z transformacją additional_notes do tablicy stringów).  
- **UpdateJourneyCommand:** Interfejs częściowej aktualizacji, opierający się na CreateJourneyCommand.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**  
  Zwracany zostanie obiekt zaktualizowanej podróży, zgodny z typem JourneyDTO.
- **Kody stanu:**
  - 200 OK – aktualizacja przebiegła pomyślnie.
  - 400 Bad Request – błąd walidacji (np. departure_date > return_date, błędny format dat).
  - 401 Unauthorized – nieautoryzowany dostęp.
  - 404 Not Found – podróż nie istnieje lub użytkownik nie ma do niej dostępu.
  - 500 Internal Server Error – błąd serwera lub nieoczekiwany wyjątek.

## 5. Przepływ danych
1. Odbiór żądania na endpoint: `PUT /api/journeys/{id}`.
2. Weryfikacja tokena autoryzacyjnego (Supabase) i sprawdzenie własności zasobu.
3. Walidacja ciała żądania przy użyciu Zod lub innej biblioteki walidacyjnej.
4. Wywołanie serwisu (np. `JourneyService.updateJourney`) z przekazanymi danymi i identyfikatorem podróży.
5. Aktualizacja rekordu w bazie danych (zastosowanie ograniczeń bazy, np. CHECK (departure_date <= return_date)).
6. Zwrócenie zaktualizowanego rekordu lub odpowiedniego błędu.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Weryfikacja tokena dostarczanego w nagłówku (Bearer Token) przy użyciu Supabase Auth oraz stosowanie zasad RLS w bazie.
- **Walidacja danych:** Upewnienie się, że dane wejściowe są poprawne zarówno pod względem formatu, jak i logiki biznesowej.
- **Ochrona przed nadużyciem:** Ograniczenie liczby modyfikacji danych i logowanie nietypowych zachowań.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy walidacja danych nie powiedzie się, np. zły format dat, brak wymaganych pól lub violation constraint (departure_date > return_date).
- **401 Unauthorized:** Brak lub nieprawidłowy token autoryzacyjny.
- **404 Not Found:** Brak podróży o podanym identyfikatorze lub brak dostępu do niej.
- **500 Internal Server Error:** Błąd podczas aktualizacji bazy danych lub nieoczekiwany wyjątek.
- **Rejestrowanie błędów:** Możliwość logowania nieudanych operacji w systemie logującym (ewentualnie osobna tabela logów).

## 8. Rozważania dotyczące wydajności
- Operacja aktualizacji dotyczy pojedynczego rekordu; nie przewiduje się znaczących problemów wydajnościowych.
- Warto upewnić się, że zapytania wykorzystują odpowiednie indeksy (np. idx_journeys_user_id) do szybkiej identyfikacji rekordu.

## 9. Etapy wdrożenia
1. **Wstępna konfiguracja:**
   - Zweryfikować autoryzację użytkownika i zasady RLS.
   - Skonfigurować lub zaktualizować schemat walidacji przy użyciu Zod zgodnie ze specyfikacją.
2. **Implementacja serwisu:**
   - Utworzyć lub rozbudować serwis aktualizacji podróży (np. `JourneyService.updateJourney`).
   - Zapewnić wstępną walidację danych wejściowych (sprawdzenie formatu dat, wymaganych pól).
3. **Implementacja endpointu:**
   - Utworzyć nowy handler w folderze `./src/pages/api/journeys/[id].ts` (lub odpowiedni plik).
   - Pobieranie wartości parametru `id` oraz ciała żądania.
   - Wywołanie metody serwisowej do aktualizacji rekordu.
4. **Testowanie:**
   - Utworzyć testy jednostkowe dla serwisu aktualizacji.
   - Utworzyć testy integracyjne dla endpointu, sprawdzając wszystkie scenariusze (sukces, błąd walidacji, brak autoryzacji, brak rekordu).
5. **Dokumentacja:**
   - Zaktualizować dokumentację API, w tym szczegóły implementacji.
   - Dołączyć plan wdrożenia w repozytorium w pliku `docs/journey-put-implementation-plan.md`.
6. **Code review i refaktoryzacja:**
   - Przeprowadzić code review oraz upewnić się, że wszystkie zasady czystego kodu i wydajności są spełnione.

