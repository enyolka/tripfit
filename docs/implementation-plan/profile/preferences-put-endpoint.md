# API Endpoint Implementation Plan: PUT /api/profile

## 1. Przegląd punktu końcowego
Endpoint umożliwia aktualizację preferencji profilu bieżącego, uwierzytelnionego użytkownika. Kluczowym celem jest zapewnienie poprawnej walidacji danych oraz bezpieczeństwa operacji aktualizacji w bazie danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT  
- **Struktura URL:** `/api/profile`  
- **Parametry:**  
  - **Wymagane:**  
    - Żaden parametr w URL  
    - JSON Request Body zawierający:  
      - `preference`: string (opis preferencji użytkownika)  
      - `level`: liczba (wymagane, wartość pomiędzy 1 a 5)
  - **Opcjonalne:** Żadnych  
- **Request Body:**  
  ```json
  {
    "preference": "string",
    "level": number
  }
  ```

## 3. Wykorzystywane typy
- **ProfileDTO:** Definiowany w `src/types.ts` i odpowiadający modelowi w tabeli `profiles`.
- **UpdateProfileCommand:** Interfejs określający strukturę danych wejściowych dla aktualizacji, zdefiniowany w `src/types.ts` (uwzględniający, że `preferences` to string).

## 4. Szczegóły odpowiedzi
- **200 OK:** Zwraca zaktualizowany obiekt profilu w formacie ProfileDTO.
- **400 Bad Request:** W przypadku błędu walidacji, np. gdy `level` nie mieści się w przedziale 1-5.
- **401 Unauthorized:** Jeśli użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwera lub bazy danych.

## 5. Przepływ danych
1. Klient wysyła żądanie PUT do `/api/profile` z odpowiednim JSON-em w treści.
2. Middleware lub bezpośrednio endpoint pobiera informacje o użytkowniku z `context.locals.user` (uzyskanych poprzez Supabase Auth).
3. Dane wejściowe są walidowane przy użyciu Zod (lub innego narzędzia) – weryfikacja m.in. że `preferences` jest stringiem, a `level` mieści się w zakresie 1-5.
4. Logika biznesowa – umieszczona w dedykowanym serwisie w `src/lib/services` – aktualizuje rekord w tabeli `profiles` przy użyciu Supabase, respektując zasady RLS.
5. Zaktualizowany rekord jest mapowany do struktury ProfileDTO i wysyłany w odpowiedzi.

## 6. Względy bezpieczeństwa
- **Autoryzacja i uwierzytelnienie:** Weryfikacja, że `context.locals.user` istnieje; w przeciwnym razie zwracany jest błąd 401 Unauthorized.
- **Walidacja:** Użycie Zod do sprawdzenia poprawności danych wejściowych (np. `preferences` jako string, `level` jako liczba w zakresie 1-5).
- **Row Level Security (RLS):** Zapewnienie, że tylko odpowiedni użytkownik może aktualizować swój profil.
- **Bezpieczne logowanie:** Błędy powinny być logowane zgodnie z centralnym systemem, bez ujawniania poufnych informacji.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy walidacja danych wejściowych zawiedzie (np. niepoprawna wartość dla `level`).
- **401 Unauthorized:** Gdy nie odnaleziono informacji o zalogowanym użytkowniku.
- **500 Internal Server Error:** W przypadku problemów przy aktualizacji w bazie danych lub innych nieoczekiwanych błędów.
- **Logowanie:** Każdy błąd powinien być przekazywany do centralnego systemu logowania (np. w `src/lib/services/errorLogger.ts`) w celu ułatwienia diagnozy.

## 8. Rozważania dotyczące wydajności
- Aktualizacja dotyczy pojedynczego rekordu, wyszukiwanego na podstawie indeksu `user_id`.
- Minimalna logika w endpoint – operacja jest szybka i wydajna.
- Opcjonalnie: rozważenie implementacji cache’owania wyników, jeśli operacje aktualizacji występują bardzo często.

## 9. Etapy wdrożenia
1. **Utworzenie Endpointu:**  
   - Stworzenie pliku API w katalogu `./src/pages/api/profile/index.ts`.
2. **Walidacja i Autoryzacja:**  
   - Implementacja walidacji danych wejściowych przy użyciu Zod, upewniając się, że `preferences` jest stringiem oraz `level` jest liczbą w zakresie 1-5.
   - Weryfikacja obecności `context.locals.user` i zwracanie 401, jeśli użytkownik nie jest zalogowany.
3. **Integracja z Bazą Danych i Logika Biznesowa:**  
   - Wyodrębnienie logiki aktualizacji profilu do dedykowanego serwisu (np. `src/lib/services/profileService.ts`).
   - Wykorzystanie Supabase do wykonania operacji aktualizacji w tabeli `profiles` z uwzględnieniem RLS.
4. **Mapowanie Wyników:**  
   - Przekształcenie wyników z bazy danych do formatu ProfileDTO przed wysłaniem odpowiedzi.
5. **Obsługa Błędów i Logowanie:**  
   - Implementacja mechanizmów obsługi błędów, które rejestrują incydenty i zwracają odpowiednie kody statusu.
6. **Testy:**  
   - Napisanie testów jednostkowych i integracyjnych obejmujących:  
     - Pomyślną aktualizację profilu (200 OK).
     - Błędy walidacji danych wejściowych (400 Bad Request).
     - Brak odpowiedniego uwierzytelnienia (401 Unauthorized).
7. **Przegląd i Deployment:**  
   - Code review oraz wdrożenie endpointu na środowisko testowe, monitorowanie logów błędów i zbieranie feedbacku przed wdrożeniem na produkcję.