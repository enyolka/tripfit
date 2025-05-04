# API Endpoint Implementation Plan: PATCH /api/generations/{id}

## 1. Przegląd punktu końcowego
Endpoint umożliwia modyfikację istniejącego rekordu generacji planu podróży. Użytkownik może zaktualizować treść edytowaną (edited_text) oraz zmienić status na jedną z dozwolonych wartości, takich jak 'accepted_unedited', 'accepted_edited', czy 'rejected'. Po udanej operacji zwracane są zaktualizowane dane rekordu.

## 2. Szczegóły żądania
- **Metoda HTTP:** PATCH  
- **Struktura URL:** /api/generations/{id}  
- **Parametry:**
  - **Wymagane:**  
    - `id` – identyfikator rekordu generacji (BIGSERIAL) jako parametr ścieżki.
- **Request Body:**  
  JSON zawierający:
  - `edited_text` (opcjonalny): string, treść edytowana przez użytkownika.
  - `status` (opcjonalny): string, jedna z wartości 'accepted_unedited', 'accepted_edited', 'rejected'.  
    (Użytkownik może aktualizować jedynie jedno lub oba pola zgodnie z potrzebą.)

## 3. Wykorzystywane typy
- **GenerationDTO** – struktura danych rekordu generacji, zgodnie z definicjami w `src/types.ts`.
- **UpdateGenerationCommand** – interfejs definiujący obiekt aktualizacji, zawierający opcjonalne właściwości `edited_text` oraz `status`.

## 4. Przepływ danych
1. **Przyjęcie żądania:**  
   Klient wysyła żądanie PATCH do `/api/generations/{id}` z poprawnym tokenem autoryzacyjnym oraz JSON zawierającym nowe wartości.
2. **Walidacja wejścia:**  
   - Middleware lub dedykowana funkcja waliduje parametr `id` (sprawdza, czy jest liczbą).
   - Zod (lub inna biblioteka) waliduje treść żądania — typ danych i dopuszczalne wartości dla `status`.
3. **Autoryzacja:**  
   Sprawdzenie, czy użytkownik posiada uprawnienia do modyfikacji danego rekordu zgodnie z zasadami RLS i Supabase Auth.
4. **Przetwarzanie w usłudze:**  
   - Serwis (np. `GenerationService`) pobiera rekord z bazy danych.
   - W przypadku, gdy rekord nie został znaleziony, zwracany jest błąd 404.
   - Następnie aktualizowane są pola `edited_text` i/lub `status`.
   - Zaktualizowany rekord jest zapisywany w bazie.
5. **Odpowiedź:**  
   Zwrócony rekord mapowany na DTO jest wysyłany jako JSON z kodem 200 OK.

## 5. Względy bezpieczeństwa
- **Autoryzacja:**  
  Weryfikacja tokena autoryzacyjnego i stosowanie RLS, aby upewnić się, że użytkownik edytuje tylko własne dane.
- **Walidacja danych:**  
  Użycie Zod do walidacji zarówno ID, jak i treści JSON, aby zapobiec wprowadzeniu niepoprawnych danych.
- **Ochrona przed atakami:**  
  Zapewnienie komunikacji poprzez HTTPS oraz stosowanie zabezpieczeń Supabase.

## 6. Obsługa błędów
- **400 Bad Request:**  
  W przypadku nieprawidłowego formatu danych wejściowych lub wartości poza dozwolonym zakresem.
- **401 Unauthorized:**  
  Gdy token autoryzacyjny jest nieprawidłowy lub nieobecny.
- **404 Not Found:**  
  Jeżeli rekord generacji o podanym `id` nie istnieje.
- **500 Internal Server Error:**  
  W przypadku nieoczekiwanych wyjątków podczas aktualizacji.
- Dodatkowo: logowanie błędów przez system monitorowania, co ułatwi diagnozowanie problemów.

## 7. Rozważania dotyczące wydajności
- **Operacja na pojedynczym rekordzie:**  
  Aktualizacja dotyczy jednego rekordu, co nie stanowi obciążenia bazy.
- **Indeksowanie:**  
  Skorzystanie z indeksu na kolumnie `id` umożliwia szybkie wyszukiwanie rekordu.
- **Optymalizacja:**  
  Upewnienie się, że zapytanie aktualizujące jest zoptymalizowane oraz stosowanie monitoringu wydajności.

## 8. Etapy wdrożenia
1. **Walidacja wejścia i autoryzacja:**  
   - Stworzyć Zod schema do walidacji JSON.
   - Zaimplementować middleware (lub logikę w kontrolerze) do walidacji parametru `id` oraz tokena autoryzacyjnego.
2. **Implementacja usługi:**  
   - Rozbudować lub utworzyć `GenerationService` z metodą do aktualizacji rekordu.
   - Pobranie rekordu, walidacja istnienia i autoryzacja użytkownika.
3. **Aktualizacja rekordu w bazie:**  
   - Mapowanie JSON na obiekt UpdateGenerationCommand.
   - Wykonanie zapytania aktualizującego.
4. **Mapowanie i zwrócenie odpowiedzi:**  
   - Mapowanie zaktualizowanego rekordu na GenerationDTO.
   - Wysyłka odpowiedzi JSON z kodem 200.
5. **Testy:**  
   - Napisanie testów jednostkowych i integracyjnych sprawdzających poprawność walidacji, autoryzacji i aktualizacji.
   - Testy przypadków brzegowych dla błędnych danych (400), nieautoryzowanego dostępu (401), braku rekordu (404) oraz błędów serwera (500).
6. **Logowanie i monitorowanie błędów:**  
   - Dodanie logowania dla nieoczekiwanych wyjątków.
   - Opcjonalnie: integracja z systemem monitoringu.
7. **Dokumentacja:**  
   - Uaktualnienie dokumentacji API o nowy endpoint oraz informację o walidacjach i kodach błędów.
8. **Wdrożenie:**  
   - Wdrożenie na środowisko testowe, walidacja poprzez testy manualne oraz automatyczne, a następnie wdrożenie do produkcji.
