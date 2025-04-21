# API Endpoint Implementation Plan: POST /api/journeys

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowej podróży na podstawie danych przesłanych w ciele żądania. Utworzona podróż zostaje zapisana w tabeli journeys, a następnie zwracana użytkownikowi.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/journeys
- Parametry:
  - Brak parametrów URL
  - Request Body (JSON):
    {
      "destination": "string",
      "departure_date": "YYYY-MM-DD",
      "return_date": "YYYY-MM-DD",
      "activities": "string", // opcjonalne
      "additional_notes": ["string"]
    }

## 3. Wykorzystywane typy
- DTO: JourneyDTO (zdefiniowany w src/types.ts)
- Command Model: CreateJourneyCommand (pole user_id do pobrania z tokena, pozostałe z ciała żądania)

## 4. Szczegóły odpowiedzi
- Sukces:
  - Kod: 201 Created – zwraca obiekt stworzonej podróży
- Błędy:
  - 400 Bad Request – błędy walidacji (np. departure_date > return_date)
  - 401 Unauthorized – niepoprawny lub brak tokena autoryzacyjnego
  - 500 Internal Server Error – błąd serwera

## 5. Przepływ danych
1. **Autoryzacja i weryfikacja tokena przez middleware (tymczasowo domyślny klient Supabase Auth)**  
  Po otrzymaniu żądania, middleware przeprowadza weryfikację tokena autoryzacyjnego dostarczonego w nagłówkach żądania. Token jest sprawdzany pod kątem poprawności, ważności oraz zgodności z wymaganiami aplikacji. W przypadku niepowodzenia, żądanie zostaje odrzucone z odpowiednim kodem błędu (np. 401 Unauthorized). W obecnej implementacji używany jest domyślny klient Supabase Auth, który zostanie zastąpiony w kolejnych krokach.

2. **Walidacja ciała żądania przy użyciu Zod (sprawdzanie wymaganych pól oraz reguły biznesowej: departure_date <= return_date)**  
  Dane przesłane w ciele żądania są walidowane za pomocą biblioteki Zod. Proces ten obejmuje sprawdzenie obecności wymaganych pól (np. destination, departure_date, return_date) oraz ich zgodności z oczekiwanymi typami danych. Dodatkowo, walidowane są reguły biznesowe, takie jak upewnienie się, że data wyjazdu (departure_date) nie jest późniejsza niż data powrotu (return_date). W przypadku błędów walidacyjnych zwracany jest kod 400 Bad Request z informacją o problemie.

3. **Wstrzyknięcie user_id z danych autoryzacyjnych**  
  - Pobranie `user_id` z tokena autoryzacyjnego.  
  - Dodanie `user_id` do obiektu `CreateJourneyCommand`.  

4. **Wstawienie nowego rekordu do tabeli journeys używając danych wejściowych**  
  Na podstawie zwalidowanych danych wejściowych oraz user_id, tworzony jest nowy rekord w tabeli journeys w bazie danych. Operacja ta jest wykonywana z użyciem domyślnego klienta Supabase, co zapewnia bezpieczne i wydajne zarządzanie danymi. W przypadku wystąpienia błędu podczas zapisu, odpowiedni kod błędu (np. 500 Internal Server Error) zostaje zwrócony.

5. **Zwrócenie nowo utworzonego rekordu jako odpowiedź**  
  Po pomyślnym zapisaniu danych w bazie, nowo utworzony rekord podróży jest zwracany w odpowiedzi do klienta. Odpowiedź zawiera kod statusu 201 Created oraz dane podróży w formacie JSON, co umożliwia klientowi dalsze wykorzystanie tych informacji.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie tokenem oraz autoryzacja z użyciem RLS w bazie danych.
- Walidacja danych wejściowych aby zapobiec atakom przez błędne lub złośliwe dane.
- Wymuszenie HTTPS oraz stosowanie bezpiecznych nagłówków.

## 7. Obsługa błędów
- Błędy walidacyjne zwracają 400 Bad Request z informacją o problemie.
- Brak autoryzacji skutkuje 401 Unauthorized.
- Wewnętrzne błędy serwera powodują 500 Internal Server Error wraz z logowaniem szczegółów błędu.

## 8. Rozważania dotyczące wydajności
- Użycie indeksów (np. idx_journeys_user_id) przy wyszukiwaniu podróży.
- Optymalizacja operacji bazodanowych przy wstawianiu nowego rekordu.
- Asynchroniczne operacje (np. logowanie, dodatkowe walidacje) gdzie możliwe.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointu w ./src/pages/api/journeys.ts i ustawienie export const prerender = false.
2. Implementacja walidacji wejścia (Zod) dla pól: destination, departure_date, return_date, activities, additional_notes.
3. Pobranie user_id z kontekstu autoryzacji (np. z tokena) i włączenie go do CreateJourneyCommand.
4. Wstawienie rekordu do bazy danych i zwrócenie odpowiedzi 201 Created.
5. Implementacja obsługi błędów (try-catch) z odpowiednimi kodami HTTP.
6. Testowanie endpointu dla scenariuszy poprawnych oraz błędnych (np. niewłaściwe daty, brak autoryzacji).
7. Zaktualizowanie dokumentacji i przekazanie planu do zespołu.
