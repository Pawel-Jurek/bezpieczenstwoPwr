# 🚀 Getting Started {#gettings-started}

Welcome to **bezpieczenstwoPwr** — an open-source project aimed at detecting anomalous or bot-like behavior on websites in real time.

This monorepo is structured into reusable packages and example applications. It’s designed to be modular and developer-friendly.

## 🧱 Project structure {#project-structure}

Here's a high-level overview of the repository:

```bash
bezpieczenstwoPwr/
├── docs/                        # VitePress-powered documentation
│   ├── .vitepress/              # VitePress config files
│   │   └── config.ts
│   ├── index.md                 # Home page
│   ├── guide/                   # Guide section
│   │   ├── index.md
│   │   └── installation.md
│   └── assets/                  # Static assets like images
│       └── logo.svg
├── examples/                    # Example applications (React, etc.)
│   └── react-example/
├── packages/                    # Core packages like bbotd (published to npm)
│   ├── bbotd/
│   └── model/
├── .github/                     # GitHub-specific configuration
│   └── workflows/
│       └── deploy.yml
└── README.md

```

## 🧪 Running locally {#running-locally}

1. Serve Static Files (for ML model access)
   Some features (like model loading) require serving the `packages/model/public/` directory locally:

   ```bash
   npx serve public
   ```

   This will make assets like models accessible at `localhost:3000/models/model.json`

2. Run a demo project

   We recommend starting with the React TypeScript example:

   ```bash
   cd examples/react-ts
   npm install
   npm run dev
   ```

   You can now view the app in your browser at [localhost:5173](http://localhost:5173)

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
