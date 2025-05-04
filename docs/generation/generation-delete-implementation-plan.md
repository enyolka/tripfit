# API Endpoint Implementation Plan: DELETE /api/generations/{id}

## 1. Przegląd punktu końcowego
Endpoint służy do usunięcia konkretnego rekordu generacji planu podróży. Po poprawnym usunięciu zwracane jest potwierdzenie z kodem 200 OK, a w sytuacji, gdy rekord nie zostanie znaleziony, zwracany jest błąd 404 Not Found.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE  
- **Struktura URL:** /api/generations/{id}  
- **Parametry:**
  - **Wymagane:**  
    - `id` – identyfikator rekordu generacji (BIGSERIAL) przekazywany jako parametr ścieżki.
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **GenerationDTO** – używany głównie przy mapowaniu lub potwierdzeniu usunięcia (choć odpowiedź nie wymaga pełnego obiektu, warto mieć ten typ spójny z innymi endpointami).

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**  
  Zwracane jest potwierdzenie operacji w postaci komunikatu lub pustej odpowiedzi.
- **Błędy:**
  - **404 Not Found:** Jeśli rekord generacji o podanym `id` nie istnieje.
  - **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych
1. **Przyjęcie żądania:**  
   Klient wysyła zapytanie DELETE do `/api/generations/{id}` z poprawnym tokenem autoryzacyjnym.
2. **Walidacja wejścia:**  
   - Middleware lub walidacja w kontrolerze sprawdza, czy `id` jest poprawnym numerem.
3. **Autoryzacja:**  
   Sprawdzenie, czy użytkownik jest uprawniony do usunięcia rekordu (poprzez RLS i mechanizmy Supabase Auth).
4. **Interakcja z bazą danych:**  
   - Serwis (np. `GenerationService`) wykonuje zapytanie usuwające rekord z tabeli `generations` na podstawie `id`.
   - Jeśli rekord nie zostanie znaleziony, przetwarzany jest błąd 404.
5. **Odpowiedź:**  
   Po pomyślnym usunięciu serwis zwraca potwierdzenie z kodem 200 OK.

## 6. Względy bezpieczeństwa
- **Autoryzacja:**  
  Użycie tokenów Supabase Auth oraz RLS, aby zapewnić, że użytkownik może usuwać tylko własne rekordy.
- **Walidacja danych:**  
  Weryfikacja formatu `id` przy użyciu Zod lub dedykowanej logiki walidacji, by zapobiec próbom iniekcji lub nieprawidłowym żądaniom.
- **Bezpieczny transport:**  
  Wymaganie HTTPS, aby zapewnić bezpieczną komunikację między klientem a serwerem.

## 7. Obsługa błędów
- **404 Not Found:**  
  Zwracany, gdy rekord o podanym `id` nie istnieje w bazie.
- **500 Internal Server Error:**  
  Zwracany w przypadku nieoczekiwanych błędów podczas operacji usunięcia.
- Dodatkowo:
  - Logowanie wszelkich nieoczekiwanych błędów, aby umożliwić szybką diagnozę problemów.

## 8. Rozważania dotyczące wydajności
- **Operacja na pojedynczym rekordzie:**  
  Usunięcie dotyczy jednego rekordu, co minimalizuje obciążenie bazy.
- **Indeksowanie:**  
  Kolumna `id` jest indeksowana, co przyspiesza wyszukiwanie rekordu do usunięcia.
- **Monitorowanie:**  
  Wdrożenie logowania i monitorowania operacji usunięcia dla szybkiego reagowania na potencjalne problemy.

## 9. Etapy wdrożenia
1. **Walidacja i autoryzacja:**  
   - Zaimplementować walidację parametru `id` w middleware lub kontrolerze.
   - Upewnić się, że token autoryzacyjny jest poprawnie weryfikowany, a RLS zapewnia dostęp tylko do właściwych danych.
2. **Implementacja usługi:**  
   - Rozbudować lub utworzyć metodę w `GenerationService` do usuwania rekordu na podstawie `id`.
   - Zapewnić, by metoda zwracała odpowiedni komunikat lub kod 404, gdy rekord nie istnieje.
3. **Integracja z bazą danych:**  
   - Wykonać zapytanie DELETE w bazie przy użyciu odpowiedniego klienta Supabase.
4. **Obsługa odpowiedzi:**  
   - Zapewnić, że odpowiedź zwraca 200 OK po pomyślnym usunięciu.
5. **Testy:**  
   - Napisać testy jednostkowe i integracyjne, które sprawdzą:
     - Prawidłową walidację `id`.
     - Autoryzację użytkownika.
     - Pomyślną operację usunięcia (200 OK).
     - Odpowiedź 404, gdy rekord nie zostaje znaleziony.
     - Obsługę błędów serwera (500 Internal Server Error).
6. **Logowanie i monitorowanie:**  
   - Zaimplementować logowanie błędów przy nieoczekiwanych wyjątkach.
7. **Dokumentacja:**  
   - Zaktualizować dokumentację API, uwzględniając nowe informacje dotyczące endpointu DELETE.
8. **Wdrożenie:**  
   - Wdrożyć endpoint na środowisku testowym, przeprowadzić testy manualne oraz automatyczne, a po zatwierdzeniu wdrożyć rozwiązanie do produkcji.