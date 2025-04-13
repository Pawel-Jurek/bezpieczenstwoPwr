# 📦 Pakiety

To monorepo zawiera wielokrotnie wykorzystywane pakiety, które znajdują się w katalogu `packages/`. Każdy pakiet jest zaprojektowany tak, aby można go było niezależnie budować, testować i — jeśli to możliwe — publikować na npm.

## Dostępne pakiety

### [`bbotd`](https://www.npmjs.com/package/bbotd)

Biblioteka do wykrywania anomalii stworzona z myślą o przeglądarkach, służąca do identyfikowania zachowań podobnych do botów na stronach internetowych przy użyciu danych w czasie rzeczywistym i lekkich modeli uczenia maszynowego.

#### ✨ Główne cechy

- Działa bezpośrednio w przeglądarce
- Wykrywa podejrzane zachowania użytkownika przy użyciu wstępnie wytrenowanych modeli ML
- Zbudowana zgodnie z nowoczesnymi standardami ES6
- Lekka i przyjazna dla zależności

#### 🚀 Szybki start

Dodaj poniższy kod do swojej strony HTML:

```html{2-3}
<body>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bbotd/dist/index.min.js"></script>
<!-- twój kod -->
</body>
```
