# 🚀 Pierwsze kroki

Witamy w **bezpieczenstwoPwr** — projekcie open-source stworzonym do wykrywania anomalii oraz zachowań przypominających boty na stronach internetowych w czasie rzeczywistym.

To monorepo zostało zaprojektowane jako modularne, przyjazne dla deweloperów i łatwe do rozbudowy. Zawiera pakiety oraz aplikacje przykładowe.

## 🧱 Struktura projektu

Poniżej ogólny przegląd zawartości repozytorium:

```bash
bezpieczenstwoPwr/
├── packages/ # Główne pakiety, np. bbotd (publikowane na npm)
├── examples/ # Przykładowe aplikacje (np. React)
├── public/ # Statyczne zasoby (np. wytrenowane modele)
├── docs/ # Dokumentacja zbudowana na VitePress
└── README.md
```

## 🧪 Uruchomienie lokalne

1. Serwowanie plików statycznych (potrzebne do ładowania modeli ML)

   Niektóre funkcje (np. wczytywanie modelu) wymagają lokalnego serwowania katalogu public/:

   ```bash
   npx serve public
   ```

   To udostępni zasoby takie jak modele pod adresem:

   ```bash
   http://localhost:3000/models/1/model.json
   ```

2. Uruchomienie projektu demonstracyjnego
   Polecamy rozpocząć od przykładu z React i TypeScript:

   cd examples/react-ts
   npm install
   npm run dev

   Aplikacja będzie dostępna pod adresem:

   ```bash
   http://localhost:5173
   ```
