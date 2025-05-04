# Plan implementacji widoku Szczegółów Podróży

## 1. Przegląd
Widok Szczegółów Podróży (`/journeys/{id}`) ma na celu wyświetlenie kompleksowych informacji o konkretnej podróży, w tym jej podstawowych danych (cel, daty, aktywności, notatki) oraz listy wygenerowanych przez AI planów podróży. Umożliwia użytkownikowi edycję danych podróży, generowanie nowych planów oraz przeglądanie, edytowanie i usuwanie istniejących planów. Interakcje te odbywają się za pomocą modalnych okien dialogowych i są wspierane przez komunikaty toastowe informujące o sukcesie lub błędzie operacji.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/journeys/[id].astro`. Parametr `id` z URL będzie wykorzystywany do pobrania odpowiednich danych podróży i generacji.

## 3. Struktura komponentów
Komponenty zostaną zaimplementowane w React i osadzone w stronie Astro (`.astro`) przy użyciu dyrektywy `client:load`.

```
/src/pages/journeys/[id].astro (Strona Astro)
└── /src/components/journeys/JourneyDetailsView.tsx (Główny komponent React)
    ├── /src/components/journeys/JourneyInfoSection.tsx (Sekcja informacji o podróży)
    │   └── Shadcn Button (Otwiera JourneyEditModal)
    ├── /src/components/journeys/GenerationsSection.tsx (Sekcja generacji planów)
    │   ├── /src/components/journeys/GeneratePlanButton.tsx (Przycisk generowania)
    │   │   └── Shadcn Button
    │   │   └── Shadcn Spinner (opcjonalnie)
    │   └── /src/components/journeys/GenerationList.tsx (Lista generacji)
    │       └── /src/components/journeys/GenerationItem.tsx (Pojedynczy element generacji)
    │           └── Shadcn Card
    │           └── Shadcn Button (Otwiera GenerationEditModal)
    │           └── Shadcn Button (Usuwa generację)
    ├── /src/components/journeys/JourneyEditModal.tsx (Modal edycji podróży)
    │   └── Shadcn Dialog
    │   └── Shadcn Input, Textarea, Button
    └── /src/components/journeys/GenerationEditModal.tsx (Modal edycji generacji)
        └── Shadcn Dialog
        └── Shadcn Textarea, Button
    └── (Globalny sonner.tsx dla toastów)
```

## 4. Szczegóły komponentów

### `JourneyDetailsView.tsx`
- **Opis komponentu:** Główny kontener widoku. Odpowiedzialny za pobieranie danych podróży i generacji na podstawie `id` z URL, zarządzanie stanem całego widoku (ładowanie, błędy, stan modalów) oraz koordynację akcji między komponentami podrzędnymi.
- **Główne elementy:** Renderuje `JourneyInfoSection` i `GenerationsSection`. Zarządza otwieraniem/zamykaniem `JourneyEditModal` i `GenerationEditModal`.
- **Obsługiwane interakcje:** Pobieranie danych przy montowaniu, obsługa zapisywania podróży, generowania planu, zapisywania edycji planu, usuwania planu.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, deleguje do modalów.
- **Typy:** `JourneyDTO`, `GenerationDTO[]`, `JourneyDetailsViewModel` (stan wewnętrzny).
- **Propsy:** `journeyId: number` (przekazany z Astro).

### `JourneyInfoSection.tsx`
- **Opis komponentu:** Wyświetla statyczne informacje o podróży (cel, daty, aktywności, notatki dodatkowe). Zawiera przycisk do otwarcia modala edycji. Może być częścią komponentu `Accordion` dla lepszej organizacji.
- **Główne elementy:** Elementy tekstowe (`<p>`, `<h2>`), Shadcn `Button`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Edytuj".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `JourneyDTO`.
- **Propsy:** `journey: JourneyDTO`, `onEdit: () => void`.

### `JourneyEditModal.tsx`
- **Opis komponentu:** Modal (Shadcn `Dialog`) zawierający formularz do edycji danych podróży. Pola formularza są pre-populowane danymi bieżącej podróży. Umożliwia zapisanie zmian lub anulowanie.
- **Główne elementy:** Shadcn `Dialog`, `Input`, `Textarea`, `Button`. Potencjalnie `DatePicker` lub walidowane `Input` dla dat.
- **Obsługiwane interakcje:** Wprowadzanie danych w polach formularza, kliknięcie "Zapisz", kliknięcie "Anuluj".
- **Obsługiwana walidacja:**
    - `destination`: Wymagane, niepuste.
    - `departure_date`: Wymagane, format YYYY-MM-DD.
    - `return_date`: Wymagane, format YYYY-MM-DD.
    - `departure_date` musi być wcześniejsza lub równa `return_date`.
    - `additional_notes`: Konwertowane na/z tablicy stringów (np. przez podział/łączenie nowymi liniami w `Textarea`).
- **Typy:** `JourneyDTO` (dane początkowe), `UpdateJourneyCommand` (dane do wysłania).
- **Propsy:** `isOpen: boolean`, `journey: JourneyDTO`, `onSave: (data: UpdateJourneyCommand) => Promise<void>`, `onClose: () => void`, `isSaving: boolean`.

### `GenerationsSection.tsx`
- **Opis komponentu:** Kontener dla przycisku generowania planu i listy istniejących generacji. Może być częścią komponentu `Accordion`.
- **Główne elementy:** Renderuje `GeneratePlanButton` i `GenerationList`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Generuj plan", akcje edycji/usuwania z listy generacji (delegowane w górę).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO[]`.
- **Propsy:** `generations: GenerationDTO[]`, `onGenerate: () => Promise<void>`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => Promise<void>`, `isGenerating: boolean`.

### `GeneratePlanButton.tsx`
- **Opis komponentu:** Przycisk (Shadcn `Button`) inicjujący proces generowania nowego planu podróży. Wyświetla wskaźnik ładowania (np. Shadcn `Spinner`) podczas trwania operacji. Jest nieaktywny, gdy generowanie jest w toku.
- **Główne elementy:** Shadcn `Button`, opcjonalnie `Spinner`.
- **Obsługiwane interakcje:** Kliknięcie przycisku.
- **Obsługiwana walidacja:** Sprawdza stan `isGenerating`. Może wymagać sprawdzenia stanu rate limiting.
- **Typy:** Brak.
- **Propsy:** `onClick: () => void`, `isLoading: boolean`.

### `GenerationList.tsx`
- **Opis komponentu:** Renderuje listę komponentów `GenerationItem` na podstawie przekazanej tablicy generacji.
- **Główne elementy:** Mapuje tablicę `generations` na komponenty `GenerationItem`.
- **Obsługiwane interakcje:** Deleguje zdarzenia z `GenerationItem` do rodzica (`GenerationsSection`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO[]`.
- **Propsy:** `generations: GenerationDTO[]`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => void`.

### `GenerationItem.tsx`
- **Opis komponentu:** Wyświetla podsumowanie pojedynczej generacji planu (np. data utworzenia, status, fragment tekstu) w formie karty (Shadcn `Card`). Zawiera przyciski akcji "Edytuj" i "Usuń".
- **Główne elementy:** Shadcn `Card`, elementy tekstowe, Shadcn `Button`.
- **Obsługiwane interakcje:** Kliknięcie "Edytuj", kliknięcie "Usuń".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO`.
- **Propsy:** `generation: GenerationDTO`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => void`.

### `GenerationEditModal.tsx`
- **Opis komponentu:** Modal (Shadcn `Dialog`) do przeglądania i edycji treści wygenerowanego planu. Wyświetla `generated_text` (tylko do odczytu) i pozwala na edycję w polu `edited_text` (Shadcn `Textarea`). Umożliwia zapisanie zmian lub anulowanie.
- **Główne elementy:** Shadcn `Dialog`, `Textarea`, `Button`.
- **Obsługiwane interakcje:** Wprowadzanie tekstu w `Textarea`, kliknięcie "Zapisz", kliknięcie "Anuluj".
- **Obsługiwana walidacja:** Pole `edited_text` nie może być puste przy zapisie.
- **Typy:** `GenerationDTO` (dane początkowe), `UpdateGenerationCommand` (dane do wysłania).
- **Propsy:** `isOpen: boolean`, `generation: GenerationDTO`, `onSave: (generationId: number, data: UpdateGenerationCommand) => Promise<void>`, `onClose: () => void`, `isSaving: boolean`.

## 5. Typy
Główne typy danych będą importowane z `src/types.ts`:
- **`JourneyDTO`**: Do wyświetlania danych podróży i edycji.
  ```typescript
  type JourneyDTO = Omit<Database["public"]["Tables"]["journeys"]["Row"], "additional_notes"> & {
      additional_notes: string[]; // Konwersja z stringa w bazie
  };
  ```
- **`GenerationDTO`**: Do wyświetlania listy generacji i edycji.
  ```typescript
  type GenerationDTO = Omit<
      Database["public"]["Tables"]["generations"]["Row"],
      "accepted_edited_count" | "accepted_unedited_count" | "generated_count"
  > & {
      generated_text: string;
      edited_text?: string;
      status: "generated" | "accepted_unedited" | "accepted_edited" | "rejected";
  };
  ```
- **`UpdateJourneyCommand`**: Do wysyłania żądania PATCH `/api/journeys/{id}`.
  ```typescript
  interface UpdateJourneyCommand extends Partial<CreateJourneyCommand> {}
  // Gdzie CreateJourneyCommand zawiera pola: departure_date, return_date, destination, user_id, activities?, additional_notes
  ```
- **`CreateGenerationCommand`**: Do wysyłania żądania POST `/api/journeys/{id}/generations`.
  ```typescript
  interface CreateGenerationCommand {
      plan_preferences?: Record<string, any>;
  }
  ```
- **`UpdateGenerationCommand`**: Do wysyłania żądania PATCH `/api/generations/{id}`.
  ```typescript
  interface UpdateGenerationCommand {
      edited_text: string;
      status: "accepted_edited"; // Status jest wymuszony przez API przy edycji
  }
  ```

Dodatkowo, komponent `JourneyDetailsView` będzie zarządzał wewnętrznym stanem widoku, który można opisać jako `JourneyDetailsViewModel`:
- **`JourneyDetailsViewModel`** (struktura stanu wewnętrznego):
  ```typescript
  interface JourneyDetailsViewModel {
      journey: JourneyDTO | null;
      generations: GenerationDTO[];
      isLoadingJourney: boolean;
      isLoadingGenerations: boolean;
      isGeneratingPlan: boolean;
      isEditingJourney: boolean; // Kontroluje JourneyEditModal
      editingGeneration: GenerationDTO | null; // Kontroluje GenerationEditModal i przechowuje dane
      isSavingJourney: boolean;
      isSavingGeneration: boolean;
      isDeletingGenerationId: number | null; // ID generacji w trakcie usuwania
      error: string## 4. Szczegóły komponentów

### `JourneyDetailsView.tsx`
- **Opis komponentu:** Główny kontener widoku. Odpowiedzialny za pobieranie danych podróży i generacji na podstawie `id` z URL, zarządzanie stanem całego widoku (ładowanie, błędy, stan modalów) oraz koordynację akcji między komponentami podrzędnymi.
- **Główne elementy:** Renderuje `JourneyInfoSection` i `GenerationsSection`. Zarządza otwieraniem/zamykaniem `JourneyEditModal` i `GenerationEditModal`.
- **Obsługiwane interakcje:** Pobieranie danych przy montowaniu, obsługa zapisywania podróży, generowania planu, zapisywania edycji planu, usuwania planu.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, deleguje do modalów.
- **Typy:** `JourneyDTO`, `GenerationDTO[]`, `JourneyDetailsViewModel` (stan wewnętrzny).
- **Propsy:** `journeyId: number` (przekazany z Astro).

### `JourneyInfoSection.tsx`
- **Opis komponentu:** Wyświetla statyczne informacje o podróży (cel, daty, aktywności, notatki dodatkowe). Zawiera przycisk do otwarcia modala edycji. Może być częścią komponentu `Accordion` dla lepszej organizacji.
- **Główne elementy:** Elementy tekstowe (`<p>`, `<h2>`), Shadcn `Button`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Edytuj".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `JourneyDTO`.
- **Propsy:** `journey: JourneyDTO`, `onEdit: () => void`.

### `JourneyEditModal.tsx`
- **Opis komponentu:** Modal (Shadcn `Dialog`) zawierający formularz do edycji danych podróży. Pola formularza są pre-populowane danymi bieżącej podróży. Umożliwia zapisanie zmian lub anulowanie.
- **Główne elementy:** Shadcn `Dialog`, `Input`, `Textarea`, `Button`. Potencjalnie `DatePicker` lub walidowane `Input` dla dat.
- **Obsługiwane interakcje:** Wprowadzanie danych w polach formularza, kliknięcie "Zapisz", kliknięcie "Anuluj".
- **Obsługiwana walidacja:**
    - `destination`: Wymagane, niepuste.
    - `departure_date`: Wymagane, format YYYY-MM-DD.
    - `return_date`: Wymagane, format YYYY-MM-DD.
    - `departure_date` musi być wcześniejsza lub równa `return_date`.
    - `additional_notes`: Konwertowane na/z tablicy stringów (np. przez podział/łączenie nowymi liniami w `Textarea`).
- **Typy:** `JourneyDTO` (dane początkowe), `UpdateJourneyCommand` (dane do wysłania).
- **Propsy:** `isOpen: boolean`, `journey: JourneyDTO`, `onSave: (data: UpdateJourneyCommand) => Promise<void>`, `onClose: () => void`, `isSaving: boolean`.

### `GenerationsSection.tsx`
- **Opis komponentu:** Kontener dla przycisku generowania planu i listy istniejących generacji. Może być częścią komponentu `Accordion`.
- **Główne elementy:** Renderuje `GeneratePlanButton` i `GenerationList`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Generuj plan", akcje edycji/usuwania z listy generacji (delegowane w górę).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO[]`.
- **Propsy:** `generations: GenerationDTO[]`, `onGenerate: () => Promise<void>`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => Promise<void>`, `isGenerating: boolean`.

### `GeneratePlanButton.tsx`
- **Opis komponentu:** Przycisk (Shadcn `Button`) inicjujący proces generowania nowego planu podróży. Wyświetla wskaźnik ładowania (np. Shadcn `Spinner`) podczas trwania operacji. Jest nieaktywny, gdy generowanie jest w toku.
- **Główne elementy:** Shadcn `Button`, opcjonalnie `Spinner`.
- **Obsługiwane interakcje:** Kliknięcie przycisku.
- **Obsługiwana walidacja:** Sprawdza stan `isGenerating`. Może wymagać sprawdzenia stanu rate limiting.
- **Typy:** Brak.
- **Propsy:** `onClick: () => void`, `isLoading: boolean`.

### `GenerationList.tsx`
- **Opis komponentu:** Renderuje listę komponentów `GenerationItem` na podstawie przekazanej tablicy generacji.
- **Główne elementy:** Mapuje tablicę `generations` na komponenty `GenerationItem`.
- **Obsługiwane interakcje:** Deleguje zdarzenia z `GenerationItem` do rodzica (`GenerationsSection`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO[]`.
- **Propsy:** `generations: GenerationDTO[]`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => void`.

### `GenerationItem.tsx`
- **Opis komponentu:** Wyświetla podsumowanie pojedynczej generacji planu (np. data utworzenia, status, fragment tekstu) w formie karty (Shadcn `Card`). Zawiera przyciski akcji "Edytuj" i "Usuń".
- **Główne elementy:** Shadcn `Card`, elementy tekstowe, Shadcn `Button`.
- **Obsługiwane interakcje:** Kliknięcie "Edytuj", kliknięcie "Usuń".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `GenerationDTO`.
- **Propsy:** `generation: GenerationDTO`, `onEdit: (generationId: number) => void`, `onDelete: (generationId: number) => void`.

### `GenerationEditModal.tsx`
- **Opis komponentu:** Modal (Shadcn `Dialog`) do przeglądania i edycji treści wygenerowanego planu. Wyświetla `generated_text` (tylko do odczytu) i pozwala na edycję w polu `edited_text` (Shadcn `Textarea`). Umożliwia zapisanie zmian lub anulowanie.
- **Główne elementy:** Shadcn `Dialog`, `Textarea`, `Button`.
- **Obsługiwane interakcje:** Wprowadzanie tekstu w `Textarea`, kliknięcie "Zapisz", kliknięcie "Anuluj".
- **Obsługiwana walidacja:** Pole `edited_text` nie może być puste przy zapisie.
- **Typy:** `GenerationDTO` (dane początkowe), `UpdateGenerationCommand` (dane do wysłania).
- **Propsy:** `isOpen: boolean`, `generation: GenerationDTO`, `onSave: (generationId: number, data: UpdateGenerationCommand) => Promise<void>`, `onClose: () => void`, `isSaving: boolean`.

## 5. Typy
Główne typy danych będą importowane z `src/types.ts`:
- **`JourneyDTO`**: Do wyświetlania danych podróży i edycji.
  ```typescript
  type JourneyDTO = Omit<Database["public"]["Tables"]["journeys"]["Row"], "additional_notes"> & {
      additional_notes: string[]; // Konwersja z stringa w bazie
  };
  ```
- **`GenerationDTO`**: Do wyświetlania listy generacji i edycji.
  ```typescript
  type GenerationDTO = Omit<
      Database["public"]["Tables"]["generations"]["Row"],
      "accepted_edited_count" | "accepted_unedited_count" | "generated_count"
  > & {
      generated_text: string;
      edited_text?: string;
      status: "generated" | "accepted_unedited" | "accepted_edited" | "rejected";
  };
  ```
- **`UpdateJourneyCommand`**: Do wysyłania żądania PATCH `/api/journeys/{id}`.
  ```typescript
  interface UpdateJourneyCommand extends Partial<CreateJourneyCommand> {}
  // Gdzie CreateJourneyCommand zawiera pola: departure_date, return_date, destination, user_id, activities?, additional_notes
  ```
- **`CreateGenerationCommand`**: Do wysyłania żądania POST `/api/journeys/{id}/generations`.
  ```typescript
  interface CreateGenerationCommand {
      plan_preferences?: Record<string, any>;
  }
  ```
- **`UpdateGenerationCommand`**: Do wysyłania żądania PATCH `/api/generations/{id}`.
  ```typescript
  interface UpdateGenerationCommand {
      edited_text: string;
      status: "accepted_edited"; // Status jest wymuszony przez API przy edycji
  }
  ```

Dodatkowo, komponent `JourneyDetailsView` będzie zarządzał wewnętrznym stanem widoku, który można opisać jako `JourneyDetailsViewModel`:
- **`JourneyDetailsViewModel`** (struktura stanu wewnętrznego):
  ```typescript
  interface JourneyDetailsViewModel {
      journey: JourneyDTO | null;
      generations: GenerationDTO[];
      isLoadingJourney: boolean;
      isLoadingGenerations: boolean;
      isGeneratingPlan: boolean;
      isEditingJourney: boolean; // Kontroluje JourneyEditModal
      editingGeneration: GenerationDTO | null; // Kontroluje GenerationEditModal i przechowuje dane
      isSavingJourney: boolean;
      isSavingGeneration: boolean;
      isDeletingGenerationId: number | null; // ID generacji w trakcie usuwania
      error: string