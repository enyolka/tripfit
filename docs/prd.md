# Dokument wymagań produktu (PRD) - TripFit

## 1. Przegląd produktu
TripFit to aplikacja webowa ułatwiająca planowanie podróży przez integrację atrakcji turystycznych z aktywnościami fizycznymi. Aplikacja skierowana jest do osób ceniących aktywny wypoczynek, dla których ważne jest zachowanie ulubionych aktywności fizycznych podczas podróży. Głównym atutem produktu jest wykorzystanie sztucznej inteligencji do generowania dziennych planów, które uwzględniają elementy takie jak aktywny poranek, atrakcje dnia oraz momenty regeneracji. Interfejs użytkownika opiera się na intuicyjnym i estetycznym formacie, który jest przystępny w swojej prostocie.

## 2. Problem użytkownika
Użytkownicy mają trudności z planowaniem podróży w sposób, który jednocześnie uwzględniałby zarówno atrakcje turystyczne, jak i ich ulubione aktywności fizyczne. Standardowe narzędzia skoncentrowane są wyłącznie na zwiedzaniu, natomiast pomijają aspekty związane z aktywnością fizyczną. Zmusza to użytkowników do ręcznego wyszukiwania dodatkowych informacji o możliwościach uprawiania sportu. Brak zintegrowanego podejścia prowadzi do rezygnacji z aktywności fizycznych podczas wakacji, obniżając jakość doświadczenia wypoczynkowego.

## 3. Wymagania funkcjonalne
- Rejestracja, logowanie i zarządzanie kontem użytkownika, umożliwiające bezpieczny dostęp do aplikacji.
- Obszar w profilu użytkownika przeznaczony na określenie ulubionych aktywności fizycznych wraz z poziomem zaawansowania, które będą automatycznie brane pod uwagę przy generowaniu wszystkich planów podróży.
- Lista podróży, gdzie każdy plan podróży jest tworzony jako osobna jednostka.
- W ramach każdej podróży użytkownik może tworzyć notatki zawierające:
  - Informacje o lokalizacji podróży.
  - Datę wyjazdu.
  - Możliwość wyboru preferowanego typu aktywności na dany wyjazd.
  - Pomysły i dodatkowe informacje dotyczące spędzenia czasu w miejscu docelowym.
- Możliwość edycji oraz kasowania notatek, przy czym wszystkie zmiany są zapisywane w bazie danych.
- Integracja z modułem AI, umożliwiająca generowanie propozycji planu podróży opartą na danych z notatki oraz preferencjach użytkownika zapisanych w profilu. Składa się na niego:
  - Plan dzienny (aktywny poranek, atrakcja dnia, regeneracja),
  - Propozycje lokalizacji do aktywności, takich jak parki, plenerowe siłownie, trasy spacerowe.
  - Wygenerowany plan prezentowany jest w stałym, czytelnym szablonie z wyróżnieniem kluczowych aktywności.
- Mechanizm potwierdzania wyboru planu – użytkownik może zaakceptować, zapisać, edytować lub usunąć wygenerowany plan. Istnieje również możliwość wygenerowania nowej wersji planu.
- Zabezpieczenie danych użytkownika przy użyciu standardowych praktyk (autentykacja, autoryzacja, RLS) oraz bezpieczne przechowywanie notatek, planów i ustawień preferencji w bazie danych.
- Możliwość usunięcia konta i powiązanych z nim notatek na życzenie.

## 4. Granice produktu
- Aplikacja nie umożliwia rezerwacji noclegów, wycieczek ani transportu.
- Funkcjonalność współdzielenia planów w społeczności użytkowników nie jest wdrożona w tej wersji.
- Nie przewidziano na tym etapie mechanizmów oceny atrakcji, komentarzy ani recenzji.
- Brak rozbudowanej obsługi oraz analizy multimediów, takich jak zdjęcia czy filmy.
- Funkcjonalności przywracania odrzuconego planu lub zaawansowanej edycji interfejsu (np. tryb ciemny) będą rozważane w przyszłych iteracjach.
- Brak wersji aplikacji mobilnej.

## 5. Historyjki użytkowników

US-001  
Tytuł: Rejestracja i uwierzytelnianie  
Opis: Jako nowy użytkownik chcę mieć możliwość rejestracji konta oraz logowania się, aby uzyskać bezpieczny dostęp do aplikacji.  
Kryteria akceptacji:  
- Użytkownik musi podać adres e-mail, hasło i potwierdzenie hasła podczas rejestracji.  
- Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
- System powinien umożliwić logowanie za pomocą zarejestrowanych danych.  

US-002
Tytuł: Logowanie do aplikacji
Opis: Jako zarejestrowany użytkownik chcę móc się zalogować, aby mieć dostęp do profilu wraz z notatkami i wygenerowanymi planami. Niezalogowani użytkownicy mają dostęp tylko do storny logowania/rejestracji.
Kryteria akceptacji:
- Logowanie wymaga podania adresu email i hasła.
- Po podaniu prawidłowych danych logowania użytkownik zostaje przekierowany do widoku listy podróży.
- Błędne dane logowania wyświetlają komunikat o nieprawidłowych danych.
- Dane dotyczące logowania przechowywane są w bezpieczny sposób.
- Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
- Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-003).
- Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
- Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
- Odzyskiwanie hasła powinno być możliwe.

US-003  
Tytuł: Zarządzanie preferencjami w profilu  
Opis: Jako zarejestrowany użytkownik chcę mieć możliwość określenia moich ulubionych aktywności fizycznych w profilu, aby były one automatycznie brane pod uwagę przy generowaniu planów podróży.  
Kryteria akceptacji:  
- Użytkownik ma dedykowany obszar w profilu do wprowadzania preferencji dotyczących aktywności fizycznych.  
- Preferencje te są widoczne i mogą być edytowane w dowolnym momencie.  
- Zmiany są zapisywane w bazie danych.

US-004  
Tytuł: Dostęp do listy podróży i tworzenie nowej podróży
Opis: Jako użytkownik chcę móc stworzyć nowy plan podróży poprzez dodanie nowej zakładki na liście podróży.  
Kryteria akceptacji:  
- Użytkownik ma dedykowaną przestrzeń do przeglądania listy z podróżami.
- Użytkownik tworzy nowy obiekt na liście podróży poprzez otwarcie modalu do tworzenia podróży i wprowadzenia podstawowych informacji. 
- Stworzona zostaje nowa przestrzeń dla podróży, gdzie mogą zostać dodane nowe notatki. 
- Dana podróż może być usuwana, a wszystkie dane z nią związane zostaną usunięte z bazy danych.

US-005  
Tytuł: Tworzenie notatek do podróży
Opis: Jako użytkownik chcę móc stworzyć nowy plan podróży poprzez dodanie notatki zawierającej informacje o lokalizacji, dacie wyjazdu oraz opcjonalnym wyborze preferowanego typu aktywności, aby móc później wygenerować na jej podstawie plan podróży.  
Kryteria akceptacji:  
- Użytkownik tworzy notatkę w polu podróży, podając lokalizację, datę wyjazdu i ewentualny wybór preferowanego typu aktywności.  
- Użytkownik może dodawać pomysły i dodatkowe opisy, które będą brane pod uwagę podczas generacji planu.  
- Notatki mogą być edytowane lub usuwane, a wszystkie operacje są zapisywane w bazie danych.

US-006  
Tytuł: Generowanie planu podróży  
Opis: Jako użytkownik chcę wygenerować plan podróży na podstawie danych zawartych w notatce oraz moich preferencji z profilu, korzystając z API modelu LLM, aby otrzymać spersonalizowaną propozycję planu.  
Kryteria akceptacji:  
- Użytkownik wybiera opcję "generuj plan" w zakładce podróży.  
- Aplikacja komunikuje się z API modelu LLM i wyświetla wygenerowany plan zawierający propozycje atrakcji turystycznych i aktywności fizycznych.  
- Plan prezentowany jest w stałym szablonie z wyróżnieniem kluczowych aktywności.  
- Użytkownik może zaakceptować lub usunąć stworzony plan oraz generować nowe wersje.
- W przypadku problemów z API lub braku odpowiedzi modelu użytkownik zobaczy stosowny komunikat o błędzie.

US-007  
Tytuł: Przeglądanie i edycja zapisanych planów  
Opis: Jako użytkownik chcę przeglądać listę zapisanych planów podróży oraz mieć możliwość ich edycji lub usuwania, aby móc wprowadzać zmiany zgodnie z moimi potrzebami.  
Kryteria akceptacji:  
- Użytkownik ma dostęp do listy zapisanych planów w obrębie danej podróży.  
- Każdy zapisany plan może zostać edytowany lub usunięty.  
- Zmiany są natychmiast zapisywane w bazie danych.

## 6. Metryki sukcesu
- 90% użytkowników zapisuje wygenerowany plan podróży.
- 70% użytkowników generuje więcej niż jeden plan w ramach danej podróży.
- 80% wygenerowanych planów zawiera elementy aktywności fizycznej zgodne z preferencjami ustawionymi w profilu.
- Sukces mierzy się poprzez analizę logów operacji, w tym liczby wygenerowanych, zaakceptowanych, edytowanych i usuniętych planów oraz notatek.
