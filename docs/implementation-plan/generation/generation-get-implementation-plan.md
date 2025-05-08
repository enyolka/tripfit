# API Endpoint Implementation Plan: GET /api/generations/{id}

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółów jednej generacji planu podróży. Zwracane dane obejmują takie pola jak generated_text, edited_text, status, a także pozostałe informacje powiązane z rekordem generacji.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** /api/generations/{id}  
- **Parametry:**
  - **Wymagane:**  
    - `id` – identyfikator generacji (BIGSERIAL), wprowadzany jako parametr ścieżki.
  - **Opcjonalne:** Brak dodatkowych parametrów.
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **GenerationDTO** – definiuje strukturę danych odpowiedzi, zgodnie z definicją w pliku `src/types.ts`.
- **UpdateGenerationCommand** – nie jest używany, ale może być przydatny w rozbudowie funkcjonalności edycji.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**  
  Zwraca obiekt GenerationDTO w formacie JSON, przykładowo:
  ```json
  {
    "id": 1,
    "journey_id": 123,
    "model": "example_model",
    "generated_text": "Przykładowy wygenerowany tekst",
    "edited_text": "Przykładowy edytowany tekst",
    "status": "generated",
    "source_text_hash": "abc123def456",
    "source_text_length": 256,
    "created_at": "2025-05-02T00:00:00Z",
    "edited_at": "2025-05-02T00:00:00Z"
  }