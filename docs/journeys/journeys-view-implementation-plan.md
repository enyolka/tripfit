# Plan implementacji widoku Widok Podróży

## 1. Przegląd
Widok Podróży umożliwia użytkownikowi przeglądanie listy utworzonych podróży z opcjami filtrowania i sortowania. Użytkownik może dodać nową podróż poprzez otwarcie modala z formularzem, a także usunąć istniejącą podróż – po kliknięciu przycisku usuwania, otwierany jest modal potwierdzający operację. Interfejs zapewnia informację zwrotną (spinner, toast) oraz bezpieczne pobieranie danych z API.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/journeys` – widok dostępny wyłącznie po zalogowaniu.

## 3. Struktura komponentów
- **JourneysView**  
  ├── **FilterControls**  
  ├── **JourneyList**  
  │      └── **JourneyItem** (dla każdej podróży, zawiera przycisk usunięcia)  
  ├── **AddJourneyButton**  
  ├── **NewJourneyModal** (modal do tworzenia nowej podróży)  
  └── **DeleteConfirmationModal** (modal do potwierdzania usunięcia podróży)

## 4. Szczegóły komponentów

### JourneysView
- **Opis:** Główny kontener widoku, odpowiedzialny za pobranie danych z API oraz zarządzanie stanem listy podróży.
- **Główne elementy:**  
  - Kontener z wyrenderowanymi komponentami filtrów, listy podróży, przycisku dodania nowej podróży.
  - Widżet ładowania (spinner) oraz globalne powiadomienia toast.
  - Zarządzanie stanem modali (NewJourneyModal i DeleteConfirmationModal).
- **Obsługiwane interakcje:**  
  - Pobieranie listy podróży (GET /api/journeys).
  - Inicjowanie usunięcia podróży: otwarcie DeleteConfirmationModal oraz wywołanie żądania DELETE po potwierdzeniu.
  - Otwarcie modala do dodania nowej podróży.
- **Walidacja:** Sprawdzenie poprawności danych przy pobieraniu i usuwaniu.
- **Typy:** Użycie typu JourneyViewModel (bazującego na JourneyDTO).
- **Propsy:** Ewentualne przekazywanie metod odświeżających dane.

### FilterControls
- **Opis:** Umożliwia filtrowanie i sortowanie listy podróży.
- **Główne elementy:**  
  - Lista rozwijana lub przyciski do sortowania (np. według daty, statusu, nazwy).
  - Input do szybkiego wyszukiwania.
- **Obsługiwane interakcje:**  
  - Zmiana opcji filtra/sortowania, przekazywana do rodzica.
- **Walidacja:** Sprawdzenie poprawności wybranych opcji.
- **Typy:** Interfejs FilterOptions.
- **Propsy:** Callback onFilterChange przekazujący aktualne ustawienia filtrów.

### JourneyList
- **Opis:** Komponent renderujący listę/siatkę podróży.
- **Główne elementy:**  
  - Iteracja po tablicy danych i renderowanie komponentów JourneyItem.
- **Obsługiwane interakcje:**  
  - Reagowanie na zmiany wynikające z filtrów.
- **Walidacja:** Przekazywanie poprawnie sformatowanych danych.
- **Typy:** Lista elementów typu JourneyViewModel.
- **Propsy:** Dane podróży oraz funkcje aktualizacji stanu listy.

### JourneyItem
- **Opis:** Reprezentacja pojedynczej podróży w liście.
- **Główne elementy:**  
  - Wyświetlanie nazwy, dat wyjazdu i powrotu, statusu generacji.
  - Przycisk usunięcia, który inicjuje otwarcie DeleteConfirmationModal.
- **Obsługiwane interakcje:**  
  - Kliknięcie przycisku usunięcia – otwarcie DeleteConfirmationModal z danymi danej podróży.
  - Kliknięcie na element podróży – przekierowanie do widoku szczegółów.
- **Walidacja:** Weryfikacja identyfikatora podróży przy wywołaniu usunięcia.
- **Typy:** JourneyViewModel.
- **Propsy:** Dane pojedynczej podróży, callback onDelete (do otwarcia modala) oraz onSelect do przekierowania.

### AddJourneyButton
- **Opis:** Przycisk inicjujący proces dodania nowej podróży.
- **Główne elementy:**  
  - Przycisk umieszczony u góry strony.
- **Obsługiwane interakcje:**  
  - Kliknięcie powoduje otwarcie modala NewJourneyModal.
- **Propsy:** Callback onOpenModal.

### NewJourneyModal
- **Opis:** Modal z formularzem umożliwiającym dodanie nowej podróży.
- **Główne elementy:**  
  - Formularz z polami: destination, departure_date, return_date, activities, additional_notes.
  - Przycisk zatwierdzenia („Zapisz”) i przycisk anulowania.
- **Obsługiwane interakcje:**  
  - Walidacja formularza – departure_date musi być wcześniejsza niż return_date.
  - Wysyłanie danych do POST /api/journeys.
  - Po sukcesie – przekierowanie do widoku szczegółów nowej podróży.
- **Walidacja:**  
  - Sprawdzenie, czy wszystkie wymagane pola są uzupełnione.
  - Walidacja dat (departure_date < return_date).
- **Typy:**  
  - JourneyCreateDTO zawierający: destination (string), departure_date (string), return_date (string), activities (string), additional_notes (string[]).
  - ViewModel formularza, rozszerzenie JourneyCreateDTO z polami statusu walidacji.
- **Propsy:** Callback onSuccess (przekazanie utworzonego obiektu) oraz onClose do zamknięcia modala.

### DeleteConfirmationModal
- **Opis:** Modal potwierdzający operację usunięcia podróży.
- **Główne elementy:**  
  - Treść informująca o konsekwencjach usunięcia podróży.
  - Dwa przyciski: potwierdzenie usunięcia („Tak, usuń”) oraz anulowanie.
- **Obsługiwane interakcje:**  
  - Kliknięcie potwierdzenia wywołuje żądanie DELETE /api/journeys/{id}.
  - Kliknięcie anulowania zamyka modal bez wykonania operacji.
- **Walidacja:**  
  - Sprawdzenie, czy przekazany identyfikator podróży jest poprawny.
- **Typy:**  
  - Parametr: id (string) podróży do usunięcia.
- **Propsy:** Callback onConfirm do wykonania usunięcia oraz onClose do zamknięcia modala.

## 5. Typy
- **JourneyDTO:**  
  - id: string  
  - destination: string  
  - departure_date: string  
  - return_date: string  
  - activities: string  
  - additional_notes: string[]  
  - status: string (np. status generacji planu)

- **JourneyViewModel:** Rozszerzenie JourneyDTO z polami pomocniczymi dla UI (np. isDeleting: boolean).

- **JourneyCreateDTO:**  
  - destination: string  
  - departure_date: string  
  - return_date: string  
  - activities: string  
  - additional_notes: string[]

- **FilterOptions:**  
  - sortBy: 'date' | 'status' | 'name' 
  - searchQuery: string

## 6. Zarządzanie stanem
- Utworzenie custom hooka (useJourneys) zarządzającego:  
  - Stanem listy podróży, loading oraz error.
  - Aktualizacją listy po dodaniu lub usunięciu podróży.
  - Przechowywaniem ustawień filtrów.
- Stan otwarcia modali (NewJourneyModal i DeleteConfirmationModal) zarządzany lokalnie za pomocą useState.

## 7. Integracja API
- **Pobieranie podróży:**  
  - Metoda GET /api/journeys.  
  - Odpowiedź: 200 OK z listą obiektów typu JourneyDTO.
- **Usuwanie podróży:**  
  - Metoda DELETE /api/journeys/{id}.  
  - Odpowiedź: 200 OK – potwierdzenie usunięcia.
- **Tworzenie nowej podróży:**  
  - Metoda POST /api/journeys.  
  - Request JSON zgodny z typem JourneyCreateDTO.  
  - Walidacja: departure_date < return_date, oraz poprawność pól.
  - Po sukcesie, odpowiedź 201 Created z danymi nowej podróży, następnie przekierowanie do widoku szczegółów.

## 8. Interakcje użytkownika
- Użytkownik wchodzi na widok `/journeys` i widzi listę swoich podróży.
- Możliwość zmiany ustawień filtrów sortowania, które dynamicznie aktualizują widok listy.
- Kliknięcie przycisku usunięcia w komponencie JourneyItem otwiera modal DeleteConfirmationModal.
- W DeleteConfirmationModal użytkownik klika „Tak, usuń” aby potwierdzić usunięcie lub anulację aby zamknąć modal.
- Kliknięcie przycisku dodania nowej podróży otwiera modal NewJourneyModal.
- Po wypełnieniu formularza i zatwierdzeniu, dane są wysyłane do API; przy sukcesie użytkownik jest przekierowywany do szczegółów nowo utworzonej podróży.
- W trakcie operacji (pobieranie, usuwanie, dodawanie) wyświetlane są spinnery i powiadomienia toast.

## 9. Warunki i walidacja
- Formularz w NewJourneyModal musi walidować:  
  - Wszystkie pola wymagane (destination, departure_date, return_date, activities) są niepuste.  
  - Data wyjazdu (departure_date) musi być wcześniejsza niż data powrotu (return_date).
- Przed usunięciem podróży, DeleteConfirmationModal weryfikuje poprawność przekazanego id.
- W przypadku odpowiedzi 400 z API, wyświetlany jest komunikat błędu.

## 10. Obsługa błędów
- W przypadku niepowodzenia wywołań API (GET, POST, DELETE) wyświetlane są powiadomienia toast z odpowiednim komunikatem.
- Modal DeleteConfirmationModal zostanie zamknięty i wyświetlony komunikat błędu, jeśli usunięcie nie powiedzie się.
- Błędy walidacji formularza są komunikowane użytkownikowi przed wysłaniem żądania.

## 11. Kroki implementacji
1. Utworzyć nowy widok `/journeys` w systemie routingu Astro, zabezpieczając dostęp widoku (tylko po zalogowaniu).
2. Stworzyć główny komponent JourneysView, integrujący custom hook useJourneys i zarządzanie stanem modali.
3. Utworzyć komponent JourneyList iterujący po liście podróży i renderujący komponenty JourneyItem.
4. Zbudować komponent FilterControls z funkcjonalnością filtrowania i sortowania, przekazując zmiany do JourneysView.
5. W komponencie JourneyItem dodać przycisk usunięcia, który wywołuje callback otwierający modal DeleteConfirmationModal oraz umożliwia przekierowanie do widoku szczegółów przy kliknięciu na element.
6. Utworzyć komponent AddJourneyButton, który otwiera modal NewJourneyModal.
7. Zbudować formularz w NewJourneyModal z walidacją pól (szczególnie dat) oraz integracją z API (POST /api/journeys). Po sukcesie wywołać callback przekierowujący do widoku szczegółów nowo utworzonej podróży.
8. Zaimplementować nowy komponent DeleteConfirmationModal, który:
   - Wyświetla komunikat potwierdzający usunięcie podróży.
   - Udostępnia przyciski potwierdzenia usunięcia oraz anulowania.
   - Po potwierdzeniu wywołuje żądanie DELETE /api/journeys/{id} oraz aktualizuje listę podróży.
9. Zaimplementować w widoku stan ładowania i obsługę błędów przy operacjach asynchronicznych, wyświetlając spinner oraz toast notifications.
10. Przetestować interakcje (filtry, dodawanie, usuwanie) oraz weryfikację walidacji formularza.
11. Zintegrować UI z backend API, przestrzegając zasad dostępu i zabezpieczeń, a następnie wdrożyć widok.
