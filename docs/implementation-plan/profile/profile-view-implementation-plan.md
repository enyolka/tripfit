# Plan implementacji widoku Profilu Użytkownika

## 1. Przegląd
Widok Profilu Użytkownika ma na celu umożliwienie zalogowanemu użytkownikowi przeglądanie oraz edycję swoich danych (np. nazwa, email) oraz preferencji dotyczących aktywności fizycznych. Kluczowe informacje to podstawowe dane profilu oraz dane dotyczące preferowanych aktywności wraz z poziomem zaawansowania. Widok wspiera walidację formularzy, komunikaty błędów (np. toast) oraz bezpieczną komunikację z API.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/profile`

## 3. Struktura komponentów
- **ProfilePage** – kontener widoku, odpowiedzialny za pobieranie danych i ułożenie podkomponentów.
  - **UserInfoForm** – komponent wyświetlający podstawowe dane użytkownika (nazwa, email); dane mogą być tylko do podglądu lub ewentualnie edytowalne.
  - **PreferencesForm** – formularz do edycji preferencji aktywności, zawierający pole tekstowe dla nazwy preferencji oraz pole liczby dla poziomu (początkujący, średniozaawansowany, zaawansowany).
  - **SaveButton** – przycisk zapisujący zmiany wywołujący akcję aktualizacji danych przez API.
  - **ToastAlert** – komponent komunikatów typu toast wyświetlający powodzenie lub błędy operacji.

## 4. Szczegóły komponentów

### ProfilePage
- **Opis:** Główny kontener widoku profilu, odpowiedzialny za pobranie danych po wejściu na stronę, przechowywanie stanu użytkownika oraz jego preferencji, koordynację komunikacji z API.
- **Główne elementy:** 
  - Pobieranie danych przez GET /api/preferences przy ładowaniu widoku.
  - Renderowanie komponentów UserInfoForm i PreferencesForm.
  - Obsługa stanu ładowania i błędów.
- **Obsługiwane interakcje:** Inicjalizacja, odświeżenie danych po udanym zapisie.
- **Walidacja:** N/A.
- **Typy:** 
  - ViewModel: `UserProfileViewModel` (z polami: email, name, preference, level).
- **Propsy:** Brak – komponent stronicowy.

### UserInfoForm
- **Opis:** Wyświetla podstawowe dane użytkownika (nazwa, email); w razie potrzeby umożliwia edycję (opcjonalnie).
- **Główne elementy:** 
  - Pole tekstowe lub statyczny element dla nazwy.
  - Pole tekstowe lub statyczny element dla email.
- **Obsługiwane interakcje:** Zmiana wartości (jeśli edytowalne) – zdarzenie onChange.
- **Walidacja:** Standardowa walidacja poprawności formatu email.
- **Typy:** 
  - DTO: Typy zdefiniowane w `PreferenceDTO` lub rozbudowany `UserProfileViewModel`.
- **Propsy:** Odbiera dane użytkownika (name, email) od rodzica ProfilePage.

### PreferencesForm
- **Opis:** Formularz umożliwiający edycję preferencji aktywności fizycznych, w tym określenie preferencji (typ aktywności) oraz poziomu zaawansowania.
- **Główne elementy:** 
  - Pole tekstowe do wprowadzenia nazwy preferowanej aktywności.
  - Pole liczby (input type="number") do wprowadzenia poziomu (walidacja: zakres 1–5).
- **Obsługiwane interakcje:** 
  - Zmiana wartości w polach (onChange).
  - Walidacja na poziomie pola przy opuszczeniu pola (onBlur) oraz przy wysłaniu formularza.
- **Walidacja:** 
  - Preferencja: niepusta wartość.
  - Poziom: liczba z zakresu 1–5.
- **Typy:**
  - DTO: `UpdatePreferenceCommand` (z polami preference: string, level: number).
  - Ewentualny ViewModel: `PreferenceViewModel` odzwierciedlający bieżący stan formularza.
- **Propsy:** Odbiera początkowe wartości preferencji oraz funkcję aktualizującą stan w komponencie rodzica.

### SaveButton
- **Opis:** Przycisk inicjujący wysłanie całego formularza danych profilu oraz preferencji.
- **Główne elementy:** 
  - Przycisk HTML (button) z etykietą "Zapisz".
- **Obsługiwane interakcje:** 
  - Kliknięcie – wywołanie funkcji walidującej formularz i aktualizującej dane przez PUT /api/preferences.
- **Walidacja:** Aktywowany, gdy wszystkie dane formularza są poprawne.
- **Typy:** Brak dodatkowych, implementowany jako część logiki formularza.
- **Propsy:** Funkcja onClick wywołująca zapis.

### ToastAlert
- **Opis:** Komponent wyświetlający dynamiczne komunikaty dla użytkownika (sukces, błąd).
- **Główne elementy:** 
  - Obszar wyświetlania komunikatu.
- **Obsługiwane interakcje:** Automatyczne wyświetlanie przy zmianie stanu błędu lub sukcesu.
- **Walidacja:** N/A.
- **Typy:** Prosty string dla treści alertu oraz typ alertu (success, error).
- **Propsy:** Treść komunikatu, typ alertu, opcjonalnie funkcja do zamknięcia.

## 5. Typy
- **UserProfileViewModel:**  
  - name: string  
  - email: string  
  - preference: string  
  - level: number  
- **PreferenceViewModel (jeśli potrzebny):**  
  - preference: string  
  - level: number  
- **UpdatePreferenceCommand (z types.ts):**  
  - preference: string  
  - level: number  

Pozostałe typy (PreferenceDTO) są już zdefiniowane i mogą być wykorzystane w integracji.

## 6. Zarządzanie stanem
- W ProfilePage zostanie zastosowany hook useState do przechowywania stanu użytkownika, preferencji, statusu ładowania oraz komunikatów błędów.
- Możliwa implementacja customowego hooka np. useProfile do obsługi pobierania (GET) oraz aktualizacji (PUT) danych.
- Stany lokalne w PreferencesForm będą synchronizowane z głównym stanem w ProfilePage przy zmianach w formularzu.

## 7. Integracja API
- **GET /api/preferences:**  
  - Pobiera dane profilu użytkownika (używane przy inicjalnym ładowaniu widoku).
  - Oczekiwane odpowiedzi: 200 OK z danymi profilu lub 401 w przypadku braku autentykacji.
- **PUT /api/preferences:**  
  - Wysyła zaktualizowane dane preferencji – dane wysyłane wg schematu:  
    ```json
    {
      "preference": "string",
      "level": number
    }
    ```
  - Oczekiwane odpowiedzi: 200 OK z nowymi danymi lub 400/401 w razie błędów walidacji lub autentykacji.
- Typy żądania i odpowiedzi będą zgodne z [UpdatePreferenceCommand](http://_vscodecontentref_/0) oraz [PreferenceDTO](http://_vscodecontentref_/1) z pliku types.ts.

## 8. Interakcje użytkownika
- Użytkownik odwiedza stronę `/profile` – widok pobiera dane profilu i wyświetla je w UserInfoForm oraz PreferencesForm.
- Wprowadzenie zmian w polach formularza odświeża stan wewnętrzny formularza.
- Kliknięcie przycisku "Zapisz" waliduje dane; w przypadku powodzenia wysyła PUT do API, a po otrzymaniu odpowiedzi aktualizuje stan widoku.
- W przypadku wystąpienia błędów walidacji lub błędów z API, komunikat jest wyświetlany przez ToastAlert.

## 9. Warunki i walidacja
- Walidacja pól w PreferencesForm:  
  - Pole "preference" nie może być puste.
  - Pole "level" musi być liczbą w zakresie 1–5.
- Odpowiedź z API z błędem (status 400/401) powoduje wyświetlenie odpowiedniego komunikatu.
- Formularz nie wysyła danych, dopóki walidacja nie przejdzie pomyślnie.

## 10. Obsługa błędów
- Błędy z API (np. 401 – brak autentykacji, 400 – błąd walidacji) zostaną przechwycone i wyświetlone użytkownikowi za pomocą ToastAlert.
- W przypadku problemów z siecią lub nieoczekiwanych błędów, widok wyświetli komunikat o błędzie i zasugeruje próbę ponownego odświeżenia strony.
- Komponent ProfilePage będzie logował błędy do konsoli oraz zarządzał stanem błędów, aby uniemożliwić użytkownikowi wysłanie niepoprawnych danych.

## 11. Kroki implementacji
1. Utworzyć nową stronę komponentu ProfilePage w katalogu odpowiednich stron (np. `src/pages/profile.astro`).
2. Zaimplementować logikę pobierania danych profilu poprzez GET /api/preferences w ProfilePage.
3. Stworzyć komponent UserInfoForm do wyświetlania danych użytkownika.
4. Opracować komponent PreferencesForm zawierający pola formularza (preference, level) z lokalnym zarządzaniem stanem oraz walidacją.
5. Dodać komponent SaveButton do wysyłki formularza; po kliknięciu wywołać funkcję aktualizacji (PUT /api/preferences).
6. Zaimplementować ToastAlert do wyświetlania dynamicznych komunikatów o sukcesie lub błędzie.
7. Połączyć komponenty w ProfilePage, przekazując odpowiednie dane i funkcje (propsy) między komponentami.
8. Zadbać o pełne testy widoku pod kątem poprawności walidacji, komunikacji z API oraz obsługi błędów.
9. Przeprowadzić testy manualne i automatyczne (np. testy jednostkowe) dla kluczowych funkcji widoku.
10. Zaimplementować zabezpieczenia dostępowe i mechanizmy ładowania danych zgodnie z wytycznymi technologicznymi (Astro, React, Tailwind, Supabase).
