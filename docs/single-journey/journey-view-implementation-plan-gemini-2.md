# Plan implementacji widoku Szczegółów Podróży

## 1. Przegląd
Widok Szczegółów Podróży (`/journeys/{id}`) ma na celu prezentację kompleksowych informacji o konkretnej podróży. Umożliwia użytkownikom przeglądanie i edycję danych podróży (lokalizacja, daty, aktywności, dodatkowe notatki), generowanie planów podróży przy użyciu AI oraz zarządzanie wygenerowanymi planami (przeglądanie, edycja, usuwanie). Widok integruje się z API backendu w celu pobierania, aktualizacji i generowania danych.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/journeys/{id}`, gdzie `{id}` to unikalny identyfikator podróży. Strona powinna być renderowana po stronie serwera (SSR) lub statycznie z dynamicznym pobieraniem danych po stronie klienta, w zależności od strategii Astro. Biorąc pod uwagę dynamiczny charakter danych, preferowane jest SSR lub CSR z SWR (stale-while-revalidate).

## 3. Struktura komponentów
```
/journeys/{id} (Astro Page)
└── JourneyDetailsView (React Component - Główny kontener)
    ├── JourneyInfoSection (React Component)
    │   ├── JourneyDataForm (React Component - Formularz danych podróży, z trybem edycji/odczytu)
    │   └── ActionButtons (React Component - Przyciski Edytuj/Zapisz/Anuluj)
    ├── AdditionalNotesSection (React Component)
    │   ├── AddNoteButton (React Component)
    │   └── NoteCard (React Component - Wyświetlanie/edycja pojedynczej notatki) [+]
    ├── PlanGenerationSection (React Component)
    │   └── GeneratePlanButton (React Component - Przycisk z obsługą stanu ładowania)
    └── GeneratedPlansList (React Component)
        ├── PlanItem (React Component - Wyświetlanie/edycja pojedynczego planu)
        │   ├── PlanContent (React Component - Wyświetlanie/edycja tekstu planu)
        │   └── PlanActions (React Component - Przyciski Edytuj/Zapisz/Usuń)
        └── DeleteConfirmationModal (React Component - Modal potwierdzający usunięcie planu)
```
*(+) oznacza listę komponentów*

## 4. Szczegóły komponentów

### JourneyDetailsView
- **Opis:** Główny komponent kontenera dla widoku szczegółów podróży. Odpowiedzialny za pobranie danych podróży i wygenerowanych planów na podstawie `id` z URL, zarządzanie stanem widoku oraz koordynację interakcji między komponentami podrzędnymi.
- **Główne elementy:** Zawiera `JourneyInfoSection`, `AdditionalNotesSection`, `PlanGenerationSection`, `GeneratedPlansList`.
- **Obsługiwane interakcje:** Pobieranie danych przy montowaniu, przekazywanie danych i funkcji do komponentów podrzędnych.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, deleguje do komponentów podrzędnych.
- **Typy:** `JourneyDTO`, `GenerationDTO[]`, `JourneyDetailsViewModel` (stan wewnętrzny).
- **Propsy:** `journeyId: number` (z parametrów URL strony Astro).

### JourneyInfoSection
- **Opis:** Sekcja wyświetlająca i umożliwiająca edycję podstawowych danych podróży (miejsce docelowe, daty, preferowane aktywności).
- **Główne elementy:** Zawiera `JourneyDataForm` i `ActionButtons`. Zarządza stanem edycji (`isEditing`).
- **Obsługiwane interakcje:** Przełączanie trybu edycji po kliknięciu przycisku "Edytuj". Zapisywanie zmian po kliknięciu "Zapisz" (wywołuje `PATCH /api/journeys/{id}`). Anulowanie zmian po kliknięciu "Anuluj".
- **Obsługiwana walidacja:** Walidacja pól formularza w `JourneyDataForm` przed zapisem (np. daty, wymagane pola).
- **Typy:** `JourneyDTO`, `UpdateJourneyCommand`.
- **Propsy:** `journeyData: JourneyDTO`, `onUpdateJourney: (data: UpdateJourneyCommand) => Promise<void>`.

### JourneyDataForm
- **Opis:** Formularz do wyświetlania i edycji danych podróży. Pola stają się edytowalne w trybie edycji.
- **Główne elementy:** Pola `Input` (destination), `DatePicker` (departure_date, return_date), `Select` lub `Input` (activities).
- **Obsługiwane interakcje:** Aktualizacja stanu formularza przy zmianie wartości pól.
- **Obsługiwana walidacja:**
    - `destination`: Wymagane, niepuste.
    - `departure_date`, `return_date`: Wymagane, poprawne daty, `departure_date <= return_date`.
    - `activities`: Opcjonalne.
- **Typy:** `JourneyDTO` (do inicjalizacji), pola formularza.
- **Propsy:** `initialData: JourneyDTO`, `isEditing: boolean`, `onFormChange: (field: string, value: any) => void`.

### ActionButtons
- **Opis:** Komponent zawierający przyciski akcji dla `JourneyInfoSection`.
- **Główne elementy:** `Button` ("Edytuj", "Zapisz", "Anuluj").
- **Obsługiwane interakcje:** Kliknięcie przycisków wywołuje odpowiednie funkcje przekazane przez propsy (`onEdit`, `onSave`, `onCancel`). Wyświetla odpowiednie przyciski w zależności od trybu (`isEditing`).
- **Obsługiwana walidacja:** Przycisk "Zapisz" może być nieaktywny, jeśli formularz jest niepoprawny.
- **Typy:** Brak specyficznych typów.
- **Propsy:** `isEditing: boolean`, `isSaving: boolean`, `canSave: boolean`, `onEdit: () => void`, `onSave: () => void`, `onCancel: () => void`.

### AdditionalNotesSection
- **Opis:** Sekcja do zarządzania dodatkowymi notatkami do podróży.
- **Główne elementy:** Przycisk `AddNoteButton`, lista komponentów `NoteCard`.
- **Obsługiwane interakcje:** Dodawanie nowej, pustej notatki (nowy `NoteCard` w trybie edycji). Edycja i usuwanie istniejących notatek poprzez akcje w `NoteCard`. Zapisanie wszystkich notatek odbywa się razem z głównymi danymi podróży (`PATCH /api/journeys/{id}`).
- **Obsługiwana walidacja:** Notatka nie może być pusta przy zapisie.
- **Typy:** `string[]` (dla `additional_notes`).
- **Propsy:** `notes: string[]`, `onNotesChange: (notes: string[]) => void`.

### AddNoteButton
- **Opis:** Przycisk inicjujący dodanie nowej notatki.
- **Główne elementy:** `Button` ("Dodaj notatkę").
- **Obsługiwane interakcje:** Kliknięcie wywołuje funkcję dodającą nową notatkę do stanu w `AdditionalNotesSection`.
- **Typy:** Brak.
- **Propsy:** `onClick: () => void`.

### NoteCard
- **Opis:** Komponent wyświetlający pojedynczą notatkę z opcją edycji inline i usunięcia.
- **Główne elementy:** `Card` (z Shadcn/ui), `Textarea` (w trybie edycji) lub `p` (w trybie odczytu), przyciski z ikonami "Edytuj", "Zapisz", "Anuluj", "Usuń".
- **Obsługiwane interakcje:** Przełączanie trybu edycji/odczytu. Aktualizacja tekstu notatki w trybie edycji. Zapisanie zmian (aktualizuje stan w `AdditionalNotesSection`). Anulowanie edycji. Usunięcie notatki (aktualizuje stan w `AdditionalNotesSection`).
- **Obsługiwana walidacja:** Tekst notatki nie może być pusty przy zapisie.
- **Typy:** `string` (tekst notatki).
- **Propsy:** `note: string`, `index: number`, `onUpdate: (index: number, newNote: string) => void`, `onDelete: (index: number) => void`.

### PlanGenerationSection
- **Opis:** Sekcja zawierająca przycisk do generowania nowego planu podróży.
- **Główne elementy:** `GeneratePlanButton`.
- **Obsługiwane interakcje:** Inicjowanie generowania planu.
- **Obsługiwana walidacja:** Przycisk może być nieaktywny, jeśli dane podróży są niekompletne lub trwa już generowanie.
- **Typy:** Brak specyficznych typów.
- **Propsy:** `journeyId: number`, `onGeneratePlan: () => Promise<void>`, `isGenerating: boolean`.

### GeneratePlanButton
- **Opis:** Przycisk "Generuj plan" z obsługą stanu ładowania (spinner).
- **Główne elementy:** `Button` z dynamiczną zawartością (tekst lub `Spinner`).
- **Obsługiwane interakcje:** Kliknięcie wywołuje `POST /api/journeys/{id}/generations`. Wyświetla spinner podczas generowania.
- **Obsługiwana walidacja:** Przycisk jest nieaktywny (`disabled`) podczas generowania.
- **Typy:** Brak.
- **Propsy:** `onClick: () => Promise<void>`, `isLoading: boolean`.

### GeneratedPlansList
- **Opis:** Wyświetla listę wygenerowanych planów dla danej podróży. Umożliwia edycję i usuwanie planów.
- **Główne elementy:** Lista komponentów `PlanItem`, `DeleteConfirmationModal`.
- **Obsługiwane interakcje:** Wyświetlanie planów. Zarządzanie stanem modala potwierdzającego usunięcie. Przekazywanie funkcji edycji i usuwania do `PlanItem`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO[]`.
- **Propsy:** `plans: GenerationDTO[]`, `onUpdatePlan: (id: number, data: UpdateGenerationCommand) => Promise<void>`, `onDeletePlan: (id: number) => Promise<void>`.

### PlanItem
- **Opis:** Reprezentuje pojedynczy wygenerowany plan na liście. Umożliwia edycję tekstu planu inline i inicjuje proces usuwania.
- **Główne elementy:** `Card`, `PlanContent`, `PlanActions`. Zarządza stanem edycji (`isEditingPlan`).
- **Obsługiwane interakcje:** Przełączanie trybu edycji/odczytu dla tekstu planu. Zapisywanie edytowanego tekstu (`PATCH /api/generations/{id}`). Inicjowanie usuwania (otwiera `DeleteConfirmationModal`).
- **Obsługiwana walidacja:** Edytowany tekst planu nie może być pusty.
- **Typy:** `GenerationDTO`, `UpdateGenerationCommand`.
- **Propsy:** `plan: GenerationDTO`, `onUpdate: (id: number, data: UpdateGenerationCommand) => Promise<void>`, `onDeleteRequest: (id: number) => void` (funkcja otwierająca modal).

### PlanContent
- **Opis:** Wyświetla lub pozwala edytować tekst planu (`generated_text` lub `edited_text`).
- **Główne elementy:** `Textarea` (w trybie edycji) lub `div`/`p` (w trybie odczytu) do wyświetlania sformatowanego tekstu.
- **Obsługiwane interakcje:** Aktualizacja stanu edytowanego tekstu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `string`.
- **Propsy:** `text: string`, `isEditing: boolean`, `onChange: (newText: string) => void`.

### PlanActions
- **Opis:** Przyciski akcji dla pojedynczego planu ("Edytuj", "Zapisz", "Anuluj", "Usuń").
- **Główne elementy:** `Button` z ikonami lub tekstem.
- **Obsługiwane interakcje:** Kliknięcie przycisków wywołuje odpowiednie funkcje (`onEdit`, `onSave`, `onCancel`, `onDelete`). Wyświetla odpowiednie przyciski w zależności od trybu (`isEditingPlan`).
- **Obsługiwana walidacja:** Przycisk "Zapisz" może być nieaktywny, jeśli edytowany tekst jest pusty.
- **Typy:** Brak.
- **Propsy:** `isEditing: boolean`, `isSaving: boolean`, `canSave: boolean`, `onEdit: () => void`, `onSave: () => void`, `onCancel: () => void`, `onDelete: () => void`.

### DeleteConfirmationModal
- **Opis:** Modal wyświetlany przed usunięciem wygenerowanego planu.
- **Główne elementy:** Komponent `Dialog` (z Shadcn/ui) z tekstem potwierdzenia i przyciskami "Potwierdź usunięcie", "Anuluj".
- **Obsługiwane interakcje:** Potwierdzenie usunięcia (wywołuje `DELETE /api/generations/{id}`). Anulowanie i zamknięcie modala.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** `isOpen: boolean`, `onClose: () => void`, `onConfirm: () => Promise<void>`, `isDeleting: boolean`.

## 5. Typy
- **JourneyDTO:** (z `src/types.ts`) Główny obiekt danych podróży.
  ```typescript
  type JourneyDTO = Omit<Database["public"]["Tables"]["journeys"]["Row"], "additional_notes"> & {
      additional_notes: string[];
  };
  ```
- **GenerationDTO:** (z `src/types.ts`) Główny obiekt danych wygenerowanego planu.
  ```typescript
  type GenerationDTO = Omit<Database["public"]["Tables"]["generations"]["Row"], "accepted_edited_count" | "accepted_unedited_count" | "generated_count"> & {
      generated_text: string;
      edited_text?: string;
      status: "generated" | "accepted_unedited" | "accepted_edited" | "rejected";
  };
  ```
- **UpdateJourneyCommand:** (z `src/types.ts`) Obiekt do aktualizacji danych podróży.
  ```typescript
  interface UpdateJourneyCommand extends Partial<CreateJourneyCommand> {}
  // Gdzie CreateJourneyCommand zawiera pola: departure_date, return_date, destination, user_id, activities, additional_notes
  ```
- **UpdateGenerationCommand:** (z `src/types.ts`) Obiekt do aktualizacji wygenerowanego planu (edycja tekstu).
  ```typescript
  interface UpdateGenerationCommand {
      edited_text: string;
      status: "accepted_edited";
  }
  ```
- **JourneyDetailsViewModel:** (Niestandardowy typ dla stanu komponentu `JourneyDetailsView`)
  ```typescript
  interface JourneyDetailsViewModel {
      journey: JourneyDTO | null;
      generations: GenerationDTO[];
      isLoadingJourney: boolean;
      isLoadingGenerations: boolean;
      isGeneratingPlan: boolean;
      isUpdatingJourney: boolean;
      isUpdatingPlan: number | null; // ID planu w trakcie aktualizacji
      isDeletingPlan: number | null; // ID planu w trakcie usuwania
      planToDeleteId: number | null; // ID planu do usunięcia (dla modala)
      error: string | null; // Ogólny błąd widoku
  }
  ```

## 6. Zarządzanie stanem
- **Główny stan:** Zarządzany w komponencie `JourneyDetailsView` przy użyciu hooka `useState` lub `useReducer` dla `JourneyDetailsViewModel`.
- **Dane podróży i plany:** Pobierane asynchronicznie i przechowywane w stanie `JourneyDetailsView`.
- **Stan edycji (JourneyInfoSection, NoteCard, PlanItem):** Lokalny stan `isEditing` w odpowiednich komponentach, zarządzany przez `useState`.
- **Stan formularzy:** Zarządzany lokalnie w `JourneyDataForm`, `NoteCard` (tryb edycji), `PlanContent` (tryb edycji).
- **Stan ładowania/zapisu/usuwania:** Zarządzany w `JourneyDetailsView` (`isGeneratingPlan`, `isUpdatingJourney`, `isUpdatingPlan`, `isDeletingPlan`) i przekazywany do odpowiednich przycisków/komponentów jako propsy (`isLoading`, `isSaving`, `isDeleting`).
- **Custom Hook:** Można rozważyć stworzenie customowego hooka `useJourneyDetails(journeyId)` hermetyzującego logikę pobierania danych, aktualizacji, generowania, usuwania i zarządzania stanem ładowania/błędów dla całego widoku. To uprościłoby komponent `JourneyDetailsView`.
  ```typescript
  // Przykład sygnatury hooka
  const {
    journey,
    generations,
    isLoadingJourney,
    isLoadingGenerations,
    isGeneratingPlan,
    isUpdatingJourney,
    isUpdatingPlan,
    isDeletingPlan,
    planToDeleteId,
    error,
    fetchJourneyDetails, // Funkcja do pobrania/odświeżenia danych
    updateJourney,
    generatePlan,
    updatePlan,
    deletePlan,
    requestDeletePlan, // Ustawia planToDeleteId
    cancelDeletePlan, // Zeruje planToDeleteId
    confirmDeletePlan // Wywołuje deletePlan i zeruje planToDeleteId
  } = useJourneyDetails(journeyId);
  ```

## 7. Integracja API
- **Pobieranie danych podróży:**
    - `GET /api/journeys/{id}`
    - Wywoływane przy montowaniu `JourneyDetailsView`.
    - Odpowiedź: `JourneyDTO`.
- **Aktualizacja danych podróży:**
    - `PATCH /api/journeys/{id}`
    - Wywoływane przez `JourneyInfoSection` po kliknięciu "Zapisz" w trybie edycji.
    - Żądanie: `UpdateJourneyCommand` (zawiera zmienione pola, w tym `additional_notes`).
    - Odpowiedź: Zaktualizowany `JourneyDTO`.
- **Pobieranie wygenerowanych planów:**
    - `GET /api/journeys/{id}/generations`
    - Wywoływane przy montowaniu `JourneyDetailsView`.
    - Odpowiedź: `GenerationDTO[]`.
- **Generowanie nowego planu:**
    - `POST /api/journeys/{id}/generations`
    - Wywoływane przez `GeneratePlanButton`.
    - Żądanie: `{ plan_preferences?: Record<string, any> }` (opcjonalne).
    - Odpowiedź: Nowy `GenerationDTO`. Po sukcesie należy odświeżyć listę planów.
- **Aktualizacja (edycja) planu:**
    - `PATCH /api/generations/{id}`
    - Wywoływane przez `PlanItem` po zapisaniu edytowanego tekstu.
    - Żądanie: `UpdateGenerationCommand` (`{ edited_text: "...", status: "accepted_edited" }`).
    - Odpowiedź: Zaktualizowany `GenerationDTO`. Po sukcesie należy zaktualizować plan na liście.
- **Usuwanie planu:**
    - `DELETE /api/generations/{id}`
    - Wywoływane po potwierdzeniu w `DeleteConfirmationModal`.
    - Odpowiedź: Potwierdzenie (np. 200 OK lub 204 No Content). Po sukcesie należy usunąć plan z listy.

## 8. Interakcje użytkownika
- **Wyświetlanie danych:** Użytkownik widzi szczegóły podróży i listę planów po załadowaniu widoku.
- **Edycja danych podróży:**
    1. Użytkownik klika "Edytuj" w `JourneyInfoSection`.
    2. Pola formularza w `JourneyDataForm` stają się aktywne. Przyciski zmieniają się na "Zapisz" i "Anuluj".
    3. Użytkownik modyfikuje dane.
    4. Użytkownik klika "Zapisz": Walidacja -> `PATCH /api/journeys/{id}` -> Aktualizacja UI / Komunikat toast.
    5. Użytkownik klika "Anuluj": Zmiany są odrzucane, formularz wraca do trybu odczytu.
- **Zarządzanie notatkami:**
    1. Użytkownik klika "Dodaj notatkę": Nowy `NoteCard` pojawia się w trybie edycji.
    2. Użytkownik klika ikonę "Edytuj" na `NoteCard`: Notatka przechodzi w tryb edycji.
    3. Użytkownik edytuje tekst i klika "Zapisz" (ikona): Zmiana zapisywana w stanie `AdditionalNotesSection`.
    4. Użytkownik klika "Anuluj" (ikona) w trybie edycji: Zmiany odrzucane.
    5. Użytkownik klika ikonę "Usuń" na `NoteCard`: Notatka usuwana ze stanu `AdditionalNotesSection`.
    6. *Ważne:* Zmiany w notatkach są finalnie zapisywane na serwerze dopiero przy zapisie całej sekcji `JourneyInfoSection`.
- **Generowanie planu:**
    1. Użytkownik klika "Generuj plan".
    2. Przycisk pokazuje spinner, staje się nieaktywny.
    3. Wywoływane jest `POST /api/journeys/{id}/generations`.
    4. Po odpowiedzi serwera (sukces/błąd): Spinner znika, przycisk staje się aktywny. W przypadku sukcesu lista planów jest odświeżana, pojawia się komunikat toast. W przypadku błędu, pojawia się komunikat toast o błędzie.
- **Edycja planu:**
    1. Użytkownik klika ikonę "Edytuj" na `PlanItem`.
    2. `PlanContent` przechodzi w tryb edycji (textarea), pojawiają się przyciski "Zapisz", "Anuluj".
    3. Użytkownik modyfikuje tekst planu.
    4. Użytkownik klika "Zapisz": Walidacja -> `PATCH /api/generations/{id}` -> Aktualizacja UI / Komunikat toast.
    5. Użytkownik klika "Anuluj": Zmiany są odrzucane, plan wraca do trybu odczytu.
- **Usuwanie planu:**
    1. Użytkownik klika ikonę "Usuń" na `PlanItem`.
    2. Otwiera się `DeleteConfirmationModal`.
    3. Użytkownik klika "Potwierdź usunięcie": Wywoływane jest `DELETE /api/generations/{id}` -> Aktualizacja UI / Komunikat toast. Modal się zamyka.
    4. Użytkownik klika "Anuluj": Modal się zamyka, nic się nie dzieje.

## 9. Warunki i walidacja
- **Formularz danych podróży (`JourneyDataForm`):**
    - `destination`: Wymagane, niepuste. Komunikat błędu przy próbie zapisu pustego pola. Przycisk "Zapisz" w `ActionButtons` nieaktywny.
    - `departure_date`, `return_date`: Wymagane, poprawne daty. `departure_date` musi być wcześniejsza lub równa `return_date`. Komunikaty błędów przy niepoprawnych wartościach. Przycisk "Zapisz" nieaktywny.
- **Notatka (`NoteCard`):**
    - Tekst notatki nie może być pusty przy zapisie (w trybie edycji). Przycisk "Zapisz" (ikona) nieaktywny.
- **Edycja planu (`PlanItem`):**
    - Edytowany tekst planu (`edited_text`) nie może być pusty. Przycisk "Zapisz" w `PlanActions` nieaktywny.
- **Generowanie planu (`GeneratePlanButton`):**
    - Przycisk nieaktywny, jeśli trwa już generowanie (`isGenerating`).
    - Opcjonalnie: Przycisk nieaktywny, jeśli brakuje kluczowych danych podróży (np. `destination`, daty).
- **Przyciski Zapisz/Aktualizuj:** Generalnie powinny być nieaktywne (`disabled`), jeśli trwa już operacja zapisu/aktualizacji (`isSaving`, `isUpdatingPlan`) lub jeśli dane są niepoprawne.

## 10. Obsługa błędów
- **Błędy API:**
    - Każde wywołanie API (fetch, update, generate, delete) powinno być opakowane w `try...catch`.
    - W przypadku błędu sieciowego lub odpowiedzi serwera innej niż 2xx:
        - Wyświetlić komunikat błędu użytkownikowi za pomocą komponentu `Sonner` (toast). Komunikat powinien być ogólny, np. "Nie udało się zaktualizować podróży. Spróbuj ponownie." lub "Błąd podczas generowania planu.".
        - Zalogować szczegóły błędu w konsoli deweloperskiej.
        - Zresetować stany ładowania (np. `setIsUpdatingJourney(false)`).
    - Specyficzne błędy (np. 404 Not Found, 400 Bad Request z walidacji backendu, 429 Rate Limit Exceeded): Można wyświetlić bardziej szczegółowe komunikaty, jeśli są zrozumiałe dla użytkownika (np. "Nie znaleziono podróży.", "Przekroczono limit generowania planów.").
- **Błędy walidacji frontendu:** Obsługiwane przez wyświetlanie komunikatów przy odpowiednich polach formularza i dezaktywację przycisków zapisu.
- **Stan braku danych:** Jeśli `GET /api/journeys/{id}` zwróci 404 lub błąd, wyświetlić komunikat "Nie znaleziono podróży" lub "Wystąpił błąd podczas ładowania danych".
- **Pusta lista planów:** Wyświetlić informację typu "Brak wygenerowanych planów. Kliknij 'Generuj plan', aby stworzyć pierwszy." zamiast pustej listy.
- **Dostępność:** Używać `aria-live="polite"` dla komunikatów toast i `aria-live="assertive"` dla krytycznych błędów. Modale powinny poprawnie zarządzać focusem i mieć odpowiednie role (`role="dialog"`, `aria-modal="true"`). Przyciski w stanie ładowania powinny mieć odpowiedni `aria-label` lub `aria-busy="true"`.

## 11. Kroki implementacji
1.  **Struktura plików:** Utwórz stronę Astro `/src/pages/journeys/[id].astro`. Utwórz foldery i pliki dla komponentów React w `/src/components/journeys/details/` (lub podobnej ścieżce): `JourneyDetailsView.tsx`, `JourneyInfoSection.tsx`, `JourneyDataForm.tsx`, `ActionButtons.tsx`, `AdditionalNotesSection.tsx`, `NoteCard.tsx`, `PlanGenerationSection.tsx`, `GeneratePlanButton.tsx`, `GeneratedPlansList.tsx`, `PlanItem.tsx`, `PlanContent.tsx`, `PlanActions.tsx`, `DeleteConfirmationModal.tsx`.
2.  **Routing i pobieranie danych:** W stronie Astro pobierz `id` z parametrów. Przekaż `id` do `JourneyDetailsView`. W `JourneyDetailsView` (lub w customowym hooku `useJourneyDetails`), zaimplementuj pobieranie danych (`GET /api/journeys/{id}` i `GET /api/journeys/{id}/generations`) przy użyciu `useEffect` i `fetch`. Obsłuż stany ładowania i błędy.
3.  **Komponent `JourneyDetailsView`:** Zaimplementuj główny layout widoku, przekazując pobrane dane i callbacki do komponentów podrzędnych. Zdefiniuj `JourneyDetailsViewModel` i zarządzaj stanem.
4.  **Komponent `JourneyInfoSection` i podkomponenty:** Zaimplementuj wyświetlanie danych podróży. Dodaj logikę przełączania trybu edycji (`isEditing`), walidację formularza w `JourneyDataForm` i obsługę przycisków "Edytuj", "Zapisz", "Anuluj" w `ActionButtons`. Zintegruj z `PATCH /api/journeys/{id}`.
5.  **Komponent `AdditionalNotesSection` i `NoteCard`:** Zaimplementuj wyświetlanie listy notatek. Dodaj funkcjonalność dodawania nowej notatki. W `NoteCard` zaimplementuj edycję inline (textarea, przyciski zapisu/anulowania) i usuwanie. Pamiętaj, że stan notatek jest zarządzany lokalnie i wysyłany do API razem z `JourneyInfoSection`.
6.  **Komponent `PlanGenerationSection` i `GeneratePlanButton`:** Zaimplementuj przycisk generowania planu z obsługą stanu ładowania (spinner). Zintegruj z `POST /api/journeys/{id}/generations`. Dodaj odświeżanie listy planów po sukcesie.
7.  **Komponent `GeneratedPlansList` i podkomponenty:** Zaimplementuj wyświetlanie listy planów. W `PlanItem` dodaj logikę edycji inline (`PlanContent`, `PlanActions`) i integrację z `PATCH /api/generations/{id}`. Dodaj przycisk usuwania inicjujący modal.
8.  **Komponent `DeleteConfirmationModal`:** Zaimplementuj modal potwierdzający usunięcie. Zintegruj z `DELETE /api/generations/{id}`. Zarządzaj stanem `isOpen` i `isDeleting` z poziomu `GeneratedPlansList` lub `JourneyDetailsView`.
9.  **Obsługa błędów i Toastów:** Zintegruj komponent `Sonner` do wyświetlania komunikatów o sukcesie i błędach dla wszystkich operacji API.
10. **Stylowanie i Dostępność:** Zastosuj Tailwind i Shadcn/ui do stylowania. Upewnij się, że wszystkie interaktywne elementy są dostępne (ARIA, zarządzanie focusem).
11. **Testowanie:** Przetestuj wszystkie przepływy użytkownika, walidację, obsługę błędów i przypadki brzegowe.
12. **Refaktoryzacja (Opcjonalnie):** Rozważ wydzielenie logiki zarządzania stanem i API do customowego hooka `useJourneyDetails`.

