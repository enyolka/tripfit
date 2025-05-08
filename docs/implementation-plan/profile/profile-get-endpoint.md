# API Endpoint Implementation Plan: GET /api/profile

## 1. Przegląd punktu końcowego
Endpoint ma za zadanie pobranie profilu zalogowanego użytkownika. Wymaga uwierzytelnienia, a w przypadku braku autoryzacji zwraca błąd 401.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/profile`
- **Parametry:**
  - **Wymagane:** Brak dodatkowych parametrów – autoryzacja realizowana na podstawie kontekstu (np. z tokenu w cookies lub nagłówkach)
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **ProfileDTO:** Definiowany w `src/types.ts` i odzwierciedlający strukturę danych tabeli `profiles`.

## 4. Szczegóły odpowiedzi
- **Kod 200:** Zwraca dane profilu w formacie ProfileDTO.
- **Kod 401:** Jeśli użytkownik nie jest uwierzytelniony.
- **Kod 500:** W przypadku nieoczekiwanych błędów po stronie serwera.

## 5. Przepływ danych
1. Zapytanie do endpointu `/api/profile` przychodzące od klienta.
2. Sprawdzenie autoryzacji – weryfikacja obiektu `user` z kontekstu (`context.locals.user`).
3. Jeśli użytkownik jest zalogowany, wywoływany jest serwis, który odpyta bazę danych w poszukiwaniu rekordu profilu powiązanego z identyfikatorem użytkownika.
4. Przekształcenie danych (jeśli konieczne) zgodnie z ProfileDTO i odesłanie odpowiedzi.
5. W przypadku błędu (np. brak profilu lub błąd bazy danych) odpowiednie kody statusu (401 lub 500) są zwracane.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint sprawdza, czy użytkownik jest uwierzytelniony, korzystając z danych zapisanych w kontekście (`context.locals.user`).
- **Bazy Danych:** Wykorzystanie wbudowanych zasad RLS (Row Level Security) w Supabase dla tabeli `profiles`.
- **Walidacja:** Brak dodatkowych danych wejściowych, więc walidacja polega głównie na obecności poprawnego obiektu użytkownika.
- **Bezpieczeństwo danych:** Zapytanie do bazy danych musi zwracać dane tylko dla właściwego użytkownika.

## 7. Obsługa błędów
- **401 Unauthorized:** Zwracane, gdy `context.locals.user` jest `null` lub nieważny.
- **500 Internal Server Error:** W przypadku problemów z bazą danych lub innych nieoczekiwanych błędów.
- **Logowanie błędów:** Każdy problem powinien być zarejestrowany przy użyciu centralnego mechanizmu logowania błędów, aby ułatwić debugowanie.

## 8. Rozważania dotyczące wydajności
- Zapytanie do bazy danych powinno być zoptymalizowane poprzez wykorzystanie indeksu na kolumnie `user_id` (zgodnie z dokumentacją planu bazy danych).
- Endpoint powinien obsługiwać tylko dane bieżącego użytkownika, dzięki czemu ilość danych przetwarzanych przez serwer jest minimalna.
- W przypadku rosnącej liczby użytkowników rozważyć implementację cache’owania profili (np. przy użyciu Redis).

## 9. Etapy wdrożenia
1. **Stworzenie pliku endpointu:** Utworzenie pliku w katalogu `./src/pages/api/profile` (np. `index.ts`).
2. **Implementacja uwierzytelniania:** Dodanie sprawdzania autoryzacji, pobierania obiektu `user` z `context.locals`.
3. **Integracja z bazą danych:** Utworzenie lub wykorzystanie istniejącego serwisu, który pobierze dane profilu powiązanego z identyfikatorem użytkownika.
4. **Obsługa odpowiedzi:** Implementacja logiki zwracającej ProfileDTO lub odpowiedni błąd (401/500).
5. **Testy jednostkowe:** Napisanie testów, które obejmą zarówno scenariusz autoryzowanego dostępu, jak i nieautoryzowanego.
6. **Przegląd kodu i walidacja:** Weryfikacja zgodności z wytycznymi dotyczącymi obsługi błędów, bezpieczeństwa i wydajności.
7. **Wdrożenie i monitoring:** Wdrożenie endpointu na środowisku testowym, monitorowanie błędów oraz zbieranie feedbacku przed wdrożeniem na produkcję.