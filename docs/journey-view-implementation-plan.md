# Plan implementacji widoku Szczegółów Podróży

## 1. Przegląd
Widok Szczegółów Podróży prezentuje pełne informacje o wybranej podróży, w tym notatki, daty, lokalizację oraz wygenerowane plany. Umożliwia edycję danych podróży i planów oraz generowanie nowych planów przy użyciu przycisku "Generuj plan".

## 2. Routing widoku
Widok dostępny będzie pod ścieżką: `/journeys/{id}`

## 3. Struktura komponentów
```
JourneyDetails
├─ JourneyEditSection
├─ GenerationSection
│   ├─ GeneratePlanButton (z spinnerem)
│   └─ PlanList
│       └─ PlanItem (otwiera ModalEditPlan)
└─ ToastNotifications
└─ ModalEditPlan
```

## 4. Szczegóły komponentów

### JourneyDetails
- **Opis:** Główny komponent, pobiera dane podróży z API, zarządza stanem i przekazuje dane do pozostałych komponentów.
- **Główne elementy:** Pobieranie danych (useEffect), obsługa stanu loading i error, dystrybucja danych.
- **Obsługiwane interakcje:** Inicjalne pobranie danych, aktualizacja po edycji.
- **Warunki walidacji:** Sprawdzenie poprawności danych (obecność wymaganych pól).
- **Typy:** JourneyDTO.
- **Propsy:** Parametr id pobrany z URL.

### JourneyEditSection
- **Opis:** Formularz umożliwiający edycję danych podróży, takich jak destination, daty, activities, additional_notes.
- **Główne elementy:** Kontrolowane inputy, przycisk "Zapisz zmiany".
- **Obsługiwane interakcje:** Aktualizacja pól, walidacja formatu dat (YYYY-MM-DD), wysyłka danych przez PUT.
- **Warunki walidacji:** Obowiązkowe pola, poprawny format dat.
- **Typy:** CreateJourneyCommand / UpdateJourneyCommand.
- **Propsy:** journeyData, onUpdateJourney callback.

### GenerationSection
- **Opis:** Sekcja odpowiedzialna za uruchomienie generowania planu podróży oraz wyświetlanie listy planów.
- **Główne elementy:** Przycisk "Generuj plan" (ze spinnerem) oraz lista wygenerowanych planów.
- **Obsługiwane interakcje:** Kliknięcie przycisku inicjuje wywołanie API, wyświetlenie spinnera, aktualizacja listy po otrzymaniu odpowiedzi.
- **Warunki walidacji:** Weryfikacja statusu odpowiedzi API, obsługa błędów.
- **Typy:** GenerationDTO.
- **Propsy:** journeyId, onNewGeneration callback.

### PlanList / PlanItem
- **Opis:** Komponent wyświetlający listę wygenerowanych planów. Każdy element umożliwia edycję poprzez otwarcie modala.
- **Główne elementy:** Wyświetlanie tekstu planu, przycisk edycji.
- **Obsługiwane interakcje:** Kliknięcie planu otwiera ModalEditPlan.
- **Warunki walidacji:** Sprawdzenie zgodności danych planu.
- **Typy:** GenerationDTO.
- **Propsy:** generationData, onEdit callback.

### ModalEditPlan
- **Opis:** Modal umożliwiający edycję wybranego planu podróży.
- **Główne elementy:** Formularz edycji planu, przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje:** Edycja danych, zatwierdzenie lub anulowanie zmian.
- **Warunki walidacji:** Sprawdzenie poprawności edytowanego tekstu (np. niepusty).
- **Typy:** UpdateGenerationCommand.
- **Propsy:** generationData, onSave, onCancel.

### ToastNotifications
- **Opis:** Komponent odpowiedzialny za wyświetlanie komunikatów błędu i sukcesu.
- **Główne elementy:** Lista toastów, automatyczne zamykanie komunikatów.
- **Obsługiwane interakcje:** Dynamiczne dodawanie i usuwanie komunikatów.
- **Warunki walidacji:** Brak specyficznych reguł, jedynie typ komunikatu.
- **Typy:** Custom Toast (np. { id: string, message: string, type: "error" | "success" }).
- **Propsy:** messages.

## 5. Typy
- **JourneyDTO:** Typ pobierany z types.ts, zawiera dane podróży.
- **CreateJourneyCommand / UpdateJourneyCommand:** Typy dla wysyłki danych podczas edycji.
- **GenerationDTO:** Typ reprezentujący wygenerowany plan podróży.
- **UpdateGenerationCommand:** Typ przekazywany podczas edycji istniejącego planu.
- **Custom Toast type:** Struktura dla komunikatów toast (id, message, type).

## 6. Zarządzanie stanem
- **Zmienne stanu:** 
  - journeyData (dane podróży),
  - loading (stan pobierania danych),
  - error (błędy podczas pobierania/aktualizacji),
  - generationLoading (stan generowania planu),
  - showModal (widoczność modala),
  - editingState (stan formularza).
- **Custom hook:** useJourneyDetails do obsługi pobierania i aktualizacji danych podróży.
- **Lokalne useState:** Dla pól formularzy i zarządzania stanem interakcji.

## 7. Integracja API
- **GET /api/journeys/{id}:** Pobiera dane podróży jako JourneyDTO.
- **PUT /api/journeys/{id}:** Aktualizuje dane podróży na podstawie obiektu CreateJourneyCommand/UpdateJourneyCommand.
- **Typy żądania i odpowiedzi:** Zgodne z JourneyDTO oraz UpdateJourneyCommand.
- **Frontendowe akcje:** Aktualizacja stanu po otrzymaniu danych, obsługa spinnera oraz wyświetlanie komunikatów toast.

## 8. Interakcje użytkownika
- Pobranie i wyświetlenie danych podróży przy otwarciu widoku.
- Edycja danych w JourneyEditSection z automatyczną walidacją.
- Kliknięcie przycisku "Generuj plan" uruchamia wywołanie API z wyświetleniem spinnera, a następnie aktualizację listy planów.
- Wybór konkretnego planu otwiera ModalEditPlan umożliwiający edycję.
- Powiadomienia o sukcesie lub błędach wyświetlane są przez ToastNotifications.

## 9. Warunki i walidacja
- Walidacja formularza edycji: obowiązkowe pola, poprawność formatu dat (YYYY-MM-DD).
- Sprawdzanie odpowiedzi API (status 200) i odpowiednia obsługa błędów.
- Weryfikacja poprawności danych wejściowych przed wysłaniem żądania PUT.

## 10. Obsługa błędów
- Wyświetlanie toastów z komunikatami o błędach podczas pobierania lub aktualizacji danych.
- Obsługa błędów sieciowych oraz timeoutów w wywołaniach API.
- Prezentowanie przyjaznych komunikatów bez ujawniania szczegółów technicznych.

## 11. Kroki implementacji
1. Utworzyć główny komponent JourneyDetails i zaimplementować pobieranie danych z GET /api/journeys/{id}.
2. Implementować komponent JourneyEditSection z formularzem edycji danych podróży oraz walidacją pól.
3. Utworzyć komponent GenerationSection zawierający przycisk "Generuj plan" z dynamicznym spinnerem oraz integrację wywołania API.
4. Zaimplementować komponent PlanList i powiązane PlanItem do wyświetlania wygenerowanych planów oraz otwierania modala edycji.
5. Zbudować ModalEditPlan umożliwiający edycję wybranego planu, z obsługą przycisków "Zapisz" i "Anuluj".
6. Zintegrować komponent ToastNotifications do wyświetlania komunikatów błędu i sukcesu.
7. Połączyć komponenty w widoku JourneyDetails i wdrożyć przepływ stanu oraz aktualizację danych po edycji.
8. Zaimplementować wywołania PUT dla aktualizacji danych podróży.
9. Przeprowadzić testy manualne i unit testy komponentów oraz dokonać niezbędnych poprawek.
10. Uzupełnić dokumentację i zadbać o zgodność z wytycznymi dotyczącymi dostępności (ARIA) i bezpieczeństwa.
