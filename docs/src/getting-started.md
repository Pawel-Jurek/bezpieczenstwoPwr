# 🚀 Getting Started

Welcome to **bezpieczenstwoPwr** — an open-source project aimed at detecting anomalous or bot-like behavior on websites in real time.

This monorepo is structured into reusable packages and example applications. It’s designed to be modular, developer-friendly, and scalable.

## 🧱 Project structure

Here's a high-level overview of the repository:

```bash
bezpieczenstwoPwr/
├── packages/ # Core packages like bbotd (published to npm)
├── examples/ # Example applications (React, etc.)
├── public/ # Static assets (e.g., trained models)
├── docs/ # VitePress-powered documentation
└── README.md
```

## 🧪 Running locally

1. Serve Static Files (for ML model access)
   Some features (like model loading) require serving the `public/` directory locally:

   ```bash
   npx serve public
   ```

   This will make assets like models accessible at:

   ```bash
   http://localhost:3000/models/1/model.json
   ```

2. Run a demo project
   We recommend starting with the React TypeScript example:

   ```bash
   cd examples/react-ts
   npm install
   npm run dev
   ```

   You can now view the app in your browser at:

   ```md
   http://localhost:5173
   ```

3. Try the package directly (Optional)
   To test bbotd standalone:

   ```bash
   cd packages/bbotd
   npm install
   npm run test
   ```

## 🔍 Where to go next?

- Want to understand the ML side? -> Visit [Machine Learning](./data-and-models)
- Need package details? -> Explore [Packages](./packages)
