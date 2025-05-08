# API Endpoint Implementation Plan: DELETE /api/journeys/{id}

## 1. Przegląd punktu końcowego
Endpoint umożliwia usunięcie podanej podróży wraz z jej powiązanymi rekordami (notatkami/planami). Operacja jest dostępna tylko dla uwierzytelnionych użytkowników, którzy są właścicielami rekordu.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** /api/journeys/{id}
- **Parametry:**
  - **Wymagane:** 
    - id (identyfikator podróży typu BIGSERIAL przesyłany w ścieżce)
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **JourneyDTO:** Reprezentuje strukturę danych podróży pobraną z bazy (definiowany w types.ts).

## 4. Szczegóły odpowiedzi
- **Status 200 OK:**  
  Potwierdzenie prawidłowego usunięcia rekordu.
- **Przykładowa struktura odpowiedzi:**
  ```json
  {
    "message": "Podróż została pomyślnie usunięta."
  }
  ```
- **Inne kody statusu:**
  - 400 – Błędny format lub nieprawidłowe dane (np. id nie jest liczbą)
  - 401 – Użytkownik nieautoryzowany
  - 404 – Rekord nie znaleziony lub nie należący do użytkownika
  - 500 – Błąd po stronie serwera

## 5. Przepływ danych
1. Klient wysyła żądanie DELETE na /api/journeys/{id} z odpowiednim identyfikatorem.
2. Middleware autoryzacyjne sprawdza, czy użytkownik jest zalogowany.
3. Endpoint pobiera id z parametrów ścieżki, waliduje jego format i autentyczność.
4. Wywoływana jest funkcja serwisowa (np. journeyService.deleteJourney), która:
   - Sprawdza, czy rekord istnieje i należy do zalogowanego użytkownika.
   - Wykonuje zapytanie do bazy przy użyciu SupabaseClient, korzystając z mechanizmu RLS.
5. W przypadku sukcesu rekord jest usuwany, a system automatycznie kasuje powiązane dane dzięki ON DELETE CASCADE.
6. Odpowiedź 200 OK z potwierdzeniem zostaje wysłana do klienta.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint dostępny tylko dla zalogowanych użytkowników.
- Autoryzacja: Sprawdzenie, czy rekord, który chcemy usunąć, należy do wywołującego użytkownika (poprzez RLS lub dodatkową walidację w service).
- Walidacja danych: Walidacja formatu id (np. sprawdzenie, czy jest liczbą).
- Ochrona przed błędami: Użycie guard clauses i wczesnych zwrotów dla nieprawidłowych stanów.

## 7. Obsługa błędów
- **400 – Błędne dane wejściowe:**  
  - Odpowiedź: "Nieprawidłowy format identyfik

atora

."
- **401 – Nieautoryzowany dostęp:**  
  - Odpowiedź: "Użytkownik nie jest zalogowany."
- **404 – Nie znaleziono rekordu:**  
  - Odpowiedź: "Podróż o podanym identyfikatorze nie została znaleziona lub nie należy do użytkownika."
- **500 – Błąd serwera:**  
  - Odpowiedź: "Wystąpił błąd po stronie serwera. Spróbuj ponownie później."
- Dodatkowe logowanie błędów w systemie monitoringu lub loggerze.

## 8. Rozważania dotyczące wydajności
- Operacja usunięcia jest wykonywana na indeksie (PRIMARY KEY), co gwarantuje szybkie wyszukanie rekordu.
- Wykorzystanie ON DELETE CASCADE minimalizuje dodatkowe zapytania dla usunięcia powiązanych rekordów.
- Upewnienie się, że zapytania w warstwie serwisowej są zoptymalizowane oraz zabezpieczone przed atakami.

## 9. Etapy wdrożenia
1. **Middleware autoryzacyjne:**
   - Potwierdzenie, że middleware w `./src/middleware/index.ts` poprawnie weryfikuje użytkownika.
2. **Implementacja logiki w warstwie serwisowej:**
   - Utworzenie/rozszerzenie funkcji w `./src/lib/services/journeyService.ts` (np. funkcja deleteJourney) obsługującej usunięcie rekordu.
   - Walidacja formatu id oraz sprawdzenie własności rekordu.
3. **Endpoint API:**
   - Utworzenie pliku `./src/pages/api/journeys/[id].ts`.
   - Implementacja handlera DELETE, który:
     a) Pobiera id z parametrów ścieżki.
     b) Waliduje id oraz sprawdza autoryzację.
     c) Wywołuje funkcję serwisową deleteJourney.
     d) Zwraca odpowiedź 200 OK po sukcesie lub odpowiedni kod błędu.
4. **Walidacja i logowanie błędów:**
   - Integracja z zod w celu walidacji identyfikatora.
   - Zapewnienie mechanizmu logowania błędów.
5. **Testy:**
   - Utworzenie testów jednostkowych i integracyjnych sprawdzających:
     a) Usunięcie rekordu.
     b) Obsługę nieautoryzowanego dostępu.
     c) Odpowiedź przy błędnym formacie id oraz przy braku rekordu.
6. **Code review:**
   - Przegląd kodu przez zespół i refaktoryzacja w razie potrzeby.
