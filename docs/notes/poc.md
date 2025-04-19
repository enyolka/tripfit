Celem PoC jest weryfikacja podstawowej funkcjonalności generowania planu podróży z uwzględnieniem aktywności fizycznej przy użyciu modułu AI, zgodnie z wymaganiami MVP.

Zakres PoC obejmuje:

Przyjmowanie danych wejściowych: informacje dotyczące lokalizacji, daty wyjazdu oraz preferowanego typu aktywności (np. informacja w notatce podróży).
Wykorzystanie modułu AI do generowania propozycji planu podróży, który zawiera:
Aktywny poranek, atrakcję dnia oraz element regeneracji
Wskazówki dotyczące lokalizacji umożliwiających realizację aktywności fizycznej (takich jak parki, plenerowe siłownie itp.)
Prezentację wygenerowanego planu w prostym, czytelnym szablonie.
Mechanizm potwierdzania wygenerowanego planu (akceptacja lub odrzucenie) – opcjonalny na etapie PoC.
Technologiczny stack (wg tech-stack):

Frontend: Astro 5 z React 19, TypeScript 5 oraz Tailwind 4, Shadcn/ui
AI: Integracja z Openrouter.ai dla komunikacji z API modeli AI
Szczegóły wykonania:

Planowanie: Przygotuj szczegółowy plan prac obejmujący podział zadań, harmonogram oraz wymagane elementy backendowe i frontendowe. Proszę przedstawić ten plan do zatwierdzenia przed rozpoczęciem implementacji.
Implementacja: Po zatwierdzeniu planu, przystąp do stworzenia minimalnej funkcjonalności generowania planu podróży na podstawie danych wejściowych i odpowiedzi z API AI.
Demo: Przygotuj interfejs umożliwiający wprowadzenie danych przez użytkownika oraz prezentację wygenerowanego planu w prostym formacie.
Ważne: Wyklucz wszystkie nadmiarowe funkcje (np. rejestracja, edycja notatek, zarządzanie użytkownikiem) i skup się tylko na podstawowej funkcjonalności generowania planu podróży z aktywnością fizyczną.