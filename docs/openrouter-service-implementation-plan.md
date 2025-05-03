# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter umożliwia integrację z interfejsem API OpenRouter, które wspiera czaty oparte na dużych modelach językowych (LLM). Celem usługi jest uzupełnienie czatów o generowane odpowiedzi przy zachowaniu struktury komunikatów (systemowy, użytkownika), ustrukturyzowanych odpowiedzi (response_format), konfiguracji nazwy modelu oraz parametrów modelu. Usługa jest dostosowana do stacku technologicznego (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui) oraz backendu opartego na Supabase.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje:
- Ładowanie konfiguracji (klucze API, adresy endpointów) z pliku `.env`.
- Ustawienia domyślne dla komunikatów systemowych i użytkownika.
- Domyślne parametry modelu, w tym nazwę modelu oraz parametry takie jak `max_tokens`, `temperature` itd.
- Inicjalizację klienta HTTP do komunikacji z API OpenRouter.

## 3. Publiczne metody i pola
1. **sendChatRequest(payload: ChatPayload): Promise\<ChatResponse\>**  
   - Odpowiada za wysłanie żądania do OpenRouter API.
   - Łączy komunikat systemowy, komunikat użytkownika oraz inne parametry wywołania.
2. **setModelConfig(config: ModelConfig): void**  
   - Umożliwia modyfikację domyślnej konfiguracji modelu.
3. **response_format** (pole)  
   - Utrzymuje schemat JSON dla strukturalnej odpowiedzi, np.:  
     `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: "string", metadata: { duration: "number" } } } }`.
4. **modelName** (pole)  
   - Przechowuje nazwę używanego modelu, np. "gpt-3.5-turbo".
5. **modelParameters** (pole)  
   - Zestaw parametrów modelu, np. `{ max_tokens: 150, temperature: 0.7 }`.

## 4. Prywatne metody i pola
1. **buildRequestBody(payload: ChatPayload): RequestBody**  
   - Tworzy poprawnie sformatowany obiekt żądania, łącząc przekazane dane z domyślnymi ustawieniami (komunikaty systemowy, użytkownika, response_format, modelName, modelParameters).
2. **parseResponse(response: any): ChatResponse**  
   - Waliduje oraz konwertuje odpowiedź API do oczekiwanego formatu na podstawie zdefiniowanego response_format.
3. **handleError(error: any): never**  
   - Centralna metoda do obsługi błędów, która interpretuje błędy komunikacyjne, walidacyjne lub po stronie API i loguje je zgodnie z najlepszymi praktykami.
4. **httpClient** (pole prywatne)  
   - Klient HTTP odpowiedzialny za wysyłanie zapytań do OpenRouter API.

## 5. Obsługa błędów
Potencjalne scenariusze błędów:
1. **Błąd połączenia/Network Error**  
   - Może wystąpić przy przerwanym połączeniu z API.
2. **Błąd walidacji żądania**  
   - Błędny format lub niekompletne dane wejściowe.
3. **Błędy odpowiedzi API**  
   - Odpowiedź zawiera komunikat o błędzie (np. nieprawidłowy klucz API, przekroczony limit).
4. **Błąd parsowania/Deserializacji**  
   - Odpowiedź nie spełnia wymaganego schematu response_format.

Dla każdego z powyższych scenariuszy należy:
- Wykorzystać wczesne zwroty (guard clauses) oraz dedykowane komunikaty błędów.
- Logować pełne informacje o błędzie do systemu monitoringu lub pliku logów.
- Zaimplementować mechanizm ponownych prób (retry) w przypadku problemów z połączeniem.

## 6. Kwestie bezpieczeństwa
1. **Przechowywanie kluczy API**  
   - Klucze, takie jak OPENROUTER_API_KEY, muszą być bezpiecznie przechowywane w pliku `.env` oraz niewidoczne w kodzie źródłowym.
2. **Obsługa wyjątków**  
   - Custom error types oraz centralna funkcja `handleError` do spójnej obsługi błędów.
3. **Bezpieczne logowanie**  
   - Logi nie powinny zawierać wrażliwych danych. Należy stosować maskowanie danych, np. kluczy API.

## 7. Plan wdrożenia krok po kroku
### Krok 1: Konfiguracja środowiska
- Upewnij się, że plik `.env` zawiera prawidłowe wartości dla SUPABASE_URL, SUPABASE_KEY oraz OPENROUTER_API_KEY.
- Zainstaluj wszystkie zależności zdefiniowane w stacku technologicznym (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui).

### Krok 2: Implementacja klienta API
- Utwórz w `src/lib/services` plik, np. `openrouter.service.ts`, zawierający konstruktor, prywatne metody (`buildRequestBody`, `parseResponse`, `handleError`) oraz publiczne metody (`sendChatRequest`, `setModelConfig`).
- Skonfiguruj klienta HTTP, dbając o mechanizmy retry i timeout.

### Krok 3: Definicja schematu response_format
- Zdefiniuj schemat JSON dla odpowiedzi, zgodnie z wzorem:  
  `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: "string", metadata: { duration: "number" } } } }`.  
- Umieść schemat we wspólnych typach w `src/types.ts`.

### Krok 4: Budowa ciała żądania (request body)
- Połącz dane wejściowe (komunikat użytkownika) z domyślnym komunikatem systemowym, response_format, nazwą modelu oraz parametrami modelu.
- Zaimplementuj dedykowaną metodę `buildRequestBody` w celu ujednolicenia formatu żądania.

### Krok 5: Parsowanie odpowiedzi
- Utwórz metodę `parseResponse`, która waliduje odpowiedź na podstawie zdefiniowanego schematu.
- Upewnij się, że obsługa odpowiedzi uwzględnia przypadki, gdy odpowiedź różni się od oczekiwanego formatu.

### Krok 6: Obsługa błędów i logowanie
- Zaimplementuj metodę `handleError`, która wychwytuje wszystkie błędy (sieciowe, walidacyjne, API) oraz zapewnia:
  1. Wczesne wykrywanie problemów.
  2. Mechanizm retry w przypadku błędów połączeniowych.
  3. Spójne i czytelne logowanie.
  4. Odpowiednie komunikaty zwrotne dla użytkownika i developerów.

### Krok 7: Integracja z front-endem
- Udostępnij interfejs usługi tak, aby komponenty czatu w Astro/React mogły z niej korzystać.
- Zapewnij, że dane wprowadzone przez użytkownika są walidowane przed wysłaniem żądania oraz że odpowiedzi są poprawnie wyświetlane.

