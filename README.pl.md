# bezpieczenstwoPwr

**Aplikacja wykrywająca anomalne zachowania na stronach internetowych**

To repozytorium to monorepo, które zawiera przykłady oraz paczki. Główna paczka publikowana na [npm](https://www.npmjs.com/package/bbotd) znajduje się w folderze `packages/` (np. `packages/bbotd`), natomiast projekty demonstracyjne (takie jak przykład w React + TypeScript) znajdują się w folderze `examples/` i są wdrażane na GitHub Pages.

---

## Dostępne języki

- [English](README.md)
- [Polski](README.pl.md)

## Opis

Celem projektu **bezpieczenstwoPwr** jest wykrywanie podejrzanych lub anomalnych zachowań na stronach internetowych – na przykład aktywności botów lub zachowań przypominających działanie CAPTCHA. Projekt ma być narzędziem do uwierzytelniania w czasie rzeczywistym, wykorzystującym modele uczenia maszynowego oraz szerokie testy, zarówno manualne, jak i automatyczne.

---

## Wymagania

- **Model Uczenia Maszynowego**
  - Wykorzystuje dane z Kaggle, np. analiza ruchów myszy
- **Testy**
  - Testy manualne
  - Testy automatyczne (w oparciu o narzędzia takie jak scikit-learn)
  - Testy end-to-end (e2e)
- **Przetwarzanie Danych**
  - Anonimizacja danych przesyłanych z frontendu do backendu (jako dodatkowa funkcjonalność)
- **Przetwarzanie w Czasie Rzeczywistym**
  - Projekt zakłada możliwość działania w czasie rzeczywistym

---

## Dane

- **Kaggle:**  
  Odwołanie do [zbioru danych Kaggle](#) wykorzystywanego jako podstawa modelu uczenia maszynowego.

---

## Zajęcia 2 / Kolejne Kroki

- **Metryki i Ocena:**
  - Zbiór i przedstawienie odpowiednich metryk oceniających wydajność modelu.
  - Analiza sytuacji brzegowych – co model potrafi, a kiedy nie działa prawidłowo.
- **Sytuacje Brzegowe:**
  - Wcześniejsze podejścia obejmowały profilowanie sposobu wpisywania tekstu (analiza zmian w czasie).
  - Rozważono także nietypowe scenariusze, np. symulację sytuacji, gdy użytkownik ma założony gips lub pod wpływem alkoholu.
- **Następne Kroki:**
  - Na tym etapie skoncentrowano się na treningu modelu oraz prezentacji uzyskanych wyników.
  - W przyszłości planowane są rozszerzenia funkcjonalności i ulepszenia w zakresie przetwarzania w czasie rzeczywistym.
- **Zasoby:**
  - W razie potrzeby można uzyskać dostęp do wirtualnych maszyn z dużą liczbą procesorów (choć z ograniczonym wsparciem dla grafiki).

---

## Jak Zacząć

- **Rozwój Paczek:**  
  Przejdź do folderu `packages/bbotd` i zapoznaj się z instrukcjami zawartymi w README paczki.
- **Projekty Przykładowe:**  
  Zajrzyj do folderu `examples/` (np. `examples/react-ts`), aby zobaczyć działanie projektu wdrożone na GitHub Pages.

---

## Wkład w Projekt

Wszelkie wkłady (np. zgłaszanie błędów, sugestie oraz pull requesty) są mile widziane! Jeśli masz pomysł lub znalazłeś błąd, prosimy o otwarcie issue lub zgłoszenie zmian poprzez pull request.

---

## Licencja

Projekt jest dostępny na licencji MIT.
