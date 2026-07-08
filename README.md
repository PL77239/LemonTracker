# 🍋 LemonTracker

Aplikacja webowa typu CRUD do zarządzania osobistą biblioteką filmów i seriali, stworzona w ramach projektu zaliczeniowego ma ocene 3.5.

##  Zastosowane technologie
* **Frontend:** HTML5, CSS3 (Flexbox, CSS Grid, CSS Variables, Glassmorphism), Vanilla JavaScript (ES6+).
* **Baza danych:** `localStorage` (Web Storage API).
* **Zewnętrzne API:** REST API z [The Movie Database (TMDB)](https://www.themoviedb.org/).
* **Hosting & CI/CD:** Netlify.

##  Główne funkcjonalności
* **Zarządzanie seansami (CRUD):** Dodawanie, wyświetlanie, edytowanie i usuwanie filmów z podziałem na listę główną (obejrzane) oraz Watchlistę.
* **Automatyczne okładki:** Aplikacja asynchronicznie pobiera i przypisuje oficjalne plakaty filmowe na podstawie wpisanego przez użytkownika tytułu.
* **Interaktywne modale:** Ekranowe nakładki pozwalające na tworzenie i czytanie długich, spersonalizowanych recenzji dla obejrzanych produkcji oraz podgląd szczegółów dla filmów z Watchlisty.
* **Walidacja i UX:** Dynamiczne ukrywanie i blokowanie pól formularza (np. wyłączanie wymogu oceny przy dodawaniu do Watchlisty) oraz responsywny system powiadomień (toast notifications).
* **Lemonmeter:** Algorytm wizualnej oceny (cytryna 🍋 dla ocen >= 60%, limonka 🍋‍🟩 dla niższych).
* **Responsywność (RWD):** Płynne dostosowanie układu siatki i formularzy do urządzeń mobilnych.

##  Najważniejsze rozwiązania w projekcie

### 1. Przeglądarka jako trwała baza danych (Local Storage)
Zamiast wdrażać złożoną infrastrukturę z relacyjną bazą SQL i dedykowanym backendem, aplikacja wykorzystuje wbudowany w przeglądarki mechanizm `localStorage`. Dane przechowywane są w formacie JSON bezpośrednio na urządzeniu użytkownika i przypisane do domeny. Rozwiązanie to w 100% spełnia wymóg trwałego zapisu danych (dane nie znikają po odświeżeniu strony), oferując przy tym błyskawiczne działanie bez opóźnień sieciowych (Client-Side Storage).

### 2. Integracja z zewnętrznym TMDB API
Aby uniknąć topornego UX, polegającego na zmuszaniu użytkownika do ręcznego szukania i wklejania linków do grafik, zaimplementowano zapytania sieciowe (`fetch` / `async/await`) do The Movie Database API. Podczas dodawania lub edycji tytułu, skrypt odpytuje serwery TMDB i automatycznie zapisuje URL precyzyjnie dobranej okładki w lokalnej bazie.

### 3. Serverless Hosting na platformie Netlify
Ponieważ aplikacja opiera się na technologiach statycznych (HTML/CSS/JS) realizujących logikę po stronie klienta, zrezygnowano z tradycyjnych serwerów. Repozytorium z GitHuba zostało spięte z platformą Netlify. Dzięki temu uzyskano ciągłe wdrażanie (bez konieczności uruchamiania komend budujących), a projekt jest hostowany z wymuszonym, bezpiecznym protokołem HTTPS, który jest kluczowy dla bezproblemowego funkcjonowania mechanizmu `localStorage` w nowoczesnych przeglądarkach.

##  Sposób uruchomienia

### Wersja Live (zalecana)
Aplikacja wdrożona na produkcję jest dostępna publicznie pod adresem:
 `(https://lemontracker.netlify.app)`

---
**Autor:** Jan Błaż
**Temat projektu:** Aplikacja internetowa do śledzenia filmów i seriali
