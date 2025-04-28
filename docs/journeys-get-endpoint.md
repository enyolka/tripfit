# API Endpoint Implementation Plan: GET /api/journeys

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie listy podróży (journeys) przypisanych do aktualnie zalogowanego użytkownika. Ma na celu prezentację danych w sposób bezpieczny i zgodny z polityką RLS w bazie danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** /api/journeys  
- **Parametry:**  
  - Brak dodatkowych parametrów wymaganych w specyfikacji.  
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **JourneyDTO:** Definiowany w pliku types.ts. Służy do reprezentacji danych wyciągniętych z tabeli journeys (transformacja pola additional_notes na string[]).
- **CreateJourneyCommand / UpdateJourneyCommand:** Nie są używane dla operacji GET, lecz są dostępne przy innych operacjach na zasobie.

## 4. Szczegóły odpowiedzi
- **Status 200 OK:**  
  Zwrócona zostanie lista obiektów typu JourneyDTO.
- **Przykładowa struktura odpowiedzi:**
  ```json
  {
    "journeys": [
      {
        "id": 123,
        "destination": "Berlin",
        "departure_date": "2023-07-01",
        "return_date": "2023-07-10",
        "activities": "sightseeing",
        "additional_notes": ["note 1", "note 2"],
        "user_id": "uuid-1234"
      }
    ]
  }
  ```
- **Inne możliwe statusy:**  
  - 401 — Użytkownik nie jest zalogowany (nieautoryzowany dostęp).  
  - 500 — Błąd po stronie serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie GET na /api/journeys.
2. Middleware autoryzacyjne w Astro weryfikuje, czy użytkownik jest zalogowany (przy użyciu Supabase authentication).
3. Handler endpointu wykorzystuje SupabaseClient z context.locals do pobrania listy journeys, filtrując dane po user_id.
4. Warstwa serwisowa (np. moduł w `src/lib/services/journeyService.ts`) wykonuje zapytanie do bazy, korzystając z indeksu na kolumnie user_id.
5. Pobierane rekordy są mapowane na JourneyDTO (transformacja additional_notes).
6. Odpowiedź (lista obiektów JourneyDTO) jest zwracana klientowi z kodem 200.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint dostępny tylko dla użytkowników zalogowanych, korzystając z mechanizmu Supabase Auth.
- Autoryzacja: Wykorzystanie RLS w tabeli journeys w celu ograniczenia dostępu tylko do danych danego użytkownika.
- Walidacja: Choć brak jest danych wejściowych, zabezpieczenie przed nieoczekiwanymi danymi z middleware.
- Użycie zaufanego SupabaseClient (importowany z `src/db/supabase.client.ts`) oraz stosowanie najlepszych praktyk w zarządzaniu środowiskiem.

## 7. Obsługa błędów
- **Nieautoryzowany dostęp:**  
  - Status: 401  
  - Komunikat: "Użytkownik nie jest zalogowany."
- **Błąd serwera:**  
  - Status: 500  
  - Komunikat: "Wystąpił problem po stronie serwera. Spróbuj ponownie później."
- Dodatkowe logowanie błędów: Implementacja loggera w przypadku wystąpienia nieoczekiwanych błędów.

## 8. Rozważania dotyczące wydajności
- Wykorzystanie istniejących indeksów w tabeli journeys (szczególnie indeks na kolumnie user_id) dla szybkiego wyszukiwania.
- Przemyślenie cache’owania wyników w przypadku wysokiego obciążenia.
- Minimalizacja narzutu dzięki bezpośredniej integracji z Supabase.

## 9. Etapy wdrożenia
1. **Middleware autoryzacyjne:**  
   - Upewnić się, że middleware w `./src/middleware/index.ts` prawidłowo weryfikuje uwierzytelnienie użytkownika.
2. **Implementacja warstwy serwisowej:**  
   - Utworzyć lub rozszerzyć moduł w `./src/lib/services/journeyService.ts`, który będzie zawierał funkcję pobierającą journeys dla danego user_id.
3. **Endpoint API:**  
   - Utworzyć plik `./src/pages/api/journeys.ts`.
   - Zaimportować SupabaseClient z `src/db/supabase.client.ts` oraz odpowiedni serwis.
   - Zaimplementować handler GET, który:  
     a) Weryfikuje autoryzację,  
     b) Wywołuje funkcję serwisową,  
     c) Mapuje dane do JourneyDTO,  
     d) Zwraca odpowiedź 200.
4. **Walidacja i logowanie:**  
   - Zaimplementować prostą walidację oraz logowanie błędów.
5. **Testy:**  
   - Napisać testy integracyjne i jednostkowe, sprawdzające:  
     a) Poprawność pobierania danych,  
     b) Reakcję na nieautoryzowane żądania,  
     c) Obsługę błędów.
6. **Code review i optymalizacja:**  
   - Przeprowadzić przegląd kodu przez zespół oraz dokonać niezbędnych optymalizacji przed wdrożeniem do produkcji.
