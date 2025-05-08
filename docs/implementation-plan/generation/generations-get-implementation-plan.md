# API Endpoint Implementation Plan: GET /api/journeys/{id}/generations

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie wszystkich rekordów generacji planów podróży dla danej podróży. Pozwala on użytkownikowi otrzymać listę generacji (GenerationDTO) zawierającą pola takie jak generated_text, edited_text, status, itp.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /api/journeys/{id}/generations
- **Parametry:**
  - **Wymagane:**
    - `id` (w ścieżce): identyfikator podróży (BIGSERIAL), który musi być poprawnie sformatowany.
  - **Opcjonalne:** Brak dodatkowych parametrów
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **JourneyDTO** – reprezentuje rekord podróży (używany do weryfikacji istnienia i autoryzacji).
- **GenerationDTO** – reprezentuje rekordy generacji pobierane z bazy, zgodnie z definicją w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**
  - Zwraca tablicę obiektów GenerationDTO, np.:
    ```json
    [
      {
        "id": 1,
        "journey_id": 123,
        "model": "model_name",
        "generated_text": "text",
        "edited_text": "optional_text",
        "status": "generated",
        "source_text_hash": "hash",
        "source_text_length": 100,
        "created_at": "2025-05-02T00:00:00Z",
        "edited_at": "2025-05-02T00:00:00Z"
      }
    ]
    ```
- **Błędy:**
  - **400:** Nieprawidłowy format parametru (np. id jest niepoprawny).
  - **401:** Nieautoryzowany dostęp – użytkownik nie ma uprawnień do żądanej podróży.
  - **404:** Podróż lub powiązane rekordy generacji nie zostały znalezione.
  - **500:** Błąd serwera – nieoczekiwany wyjątek.

## 5. Przepływ danych
1. **Przyjęcie żądania:** Klient wysyła zapytanie GET do endpointu `/api/journeys/{id}/generations` z podanym id.
2. **Walidacja:** Middleware lub kontroler waliduje format parametru id oraz sprawdza autoryzację użytkownika.
3. **Interakcja z bazą danych:** Usługa (np. GenerationsService) wykonuje zapytanie do bazy, pobierając wszystkie rekordy z tabeli `generations`, gdzie `journey_id` odpowiada podanemu id.
4. **Transformacja danych:** Rekordy są mapowane na obiekty GenerationDTO – przekształcenie pól (daty, opcjonalnych wartości) według typów z `src/types.ts`.
5. **Odpowiedź:** Wynik zapytania jest zwracany jako JSON z odpowiednim kodem statusu.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint musi upewnić się, że użytkownik wykonujący żądanie jest właścicielem podróży – stosowanie RLS (Row-Level Security) w bazie.
- **Walidacja danych:** Identyfikator podróży powinien być sprawdzony pod kątem poprawności i zgodności z typem BIGSERIAL.
- **Ograniczenie dostępu:** Dostęp do danych generacji powinien być możliwy tylko dla autoryzowanych użytkowników.

## 7. Obsługa błędów
- **Walidacja (400):** Jeśli parametr `id` jest nieprawidłowy, zwrócić błąd z komunikatem informującym o błędnym formacie.
- **Autoryzacja (401):** W przypadku braku uprawnień użytkownika do żądanej podróży.
- **Nie znaleziono zasobów (404):** Gdy żadna podróż lub rekordy generacji nie odpowiadają podanemu id.
- **Błąd serwera (500):** Rejestrowanie wszystkich nieoczekiwanych wyjątków, aby umożliwić ich analizę oraz zwrócenie ogólnego komunikatu błędu.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie:** Zapytanie korzysta z indeksu na kolumnie `journey_id` w tabeli `generations`.
- **Optymalizacja zapytań:** Upewnić się, że zapytanie do bazy jest zoptymalizowane, aby minimalizować obciążenie przy dużej liczbie rekordów.
- **Skalowalność:** W przyszłości rozważyć wprowadzenie paginacji, jeśli liczba rekordów wzrośnie znacząco.

## 9. Etapy wdrożenia
1. **Walidacja i autoryzacja:**
   - Zaimplementować middleware lub logikę w kontrolerze sprawdzającą poprawność id oraz autoryzację użytkownika (RLS).
2. **Implementacja usługi:**
   - Utworzyć lub rozszerzyć istniejącą usługę (GenerationsService) odpowiedzialną za pobieranie rekordów generacji z bazy na podstawie journey_id.
3. **Interakcja z bazą danych:**
   - Wykonać zapytanie SELECT do tabeli `generations` z odpowiednim filtrowaniem i indeksami.
4. **Mapowanie danych:**
   - Przekształcić dane z bazy na obiekty GenerationDTO zgodnie z definicją w `src/types.ts`.
5. **Testy:**
   - Napisać testy jednostkowe i integracyjne sprawdzające poprawność walidacji, autoryzacji i przepływu danych – obejmujące zarówno przypadki sukcesu, jak i błędów (400, 401, 404, 500).
6. **Logika błędów:**
   - Zapewnić mechanizmy logowania błędów, aby system mógł monitorować i rejestrować nieoczekiwane wyjątki.
7. **Dokumentacja i wdrożenie:**
   - Zaktualizować dokumentację API oraz wdrożyć endpoint w środowisku testowym, a następnie produkcyjnym po pomyślnym przeprowadzeniu testów.
