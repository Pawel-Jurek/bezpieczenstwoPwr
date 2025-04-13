# bbotd

<p align="center"> <a href="https://www.npmjs.com/package/bbotd"> <img alt="npm version" src="https://img.shields.io/npm/v/bbotd?color=blue"> </a> <a href="https://www.npmjs.com/package/bbotd"> <img alt="npm downloads" src="https://img.shields.io/npm/dm/bbotd.svg"> </a> <a href="https://bundlephobia.com/result?p=bbotd"> <img alt="bundle size" src="https://badgen.net/bundlephobia/minzip/bbotd"> </a> <a href="https://github.com/Pawel-Jurek/bezpieczenstwoPwr"> <img alt="monorepo" src="https://img.shields.io/badge/monorepo-bezpieczenstwoPwr-blueviolet"> </a> </p>

**bbotd** is available on [npm](https://www.npmjs.com/package/bbotd), and is intended to be used in the browser via a `<script>` tag. It depends on [@tensorflow/tfjs](www.npmjs.com/package/@tensorflow/tfjs), whichshould also be imported via CDN.

## 🚀 Quick start

Include the following in your HTML:

```html
<body>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bbotd/dist/index.min.js"></script>

  <!-- Your code here -->
</body>
```

> **💡 Note:** This package is intended for use in the browser. If you need Node.js support, let us know by opening an issue.

## 🛠 Development

### Install dependencies

```bash
npm install
```

### Serve static files

Until we implement a better method for serving test assets, you need to serve the `public/` directory locally. This allows access to models and other static resources:

```bash
npx serve public
```

This makes files like `./public/models1/model.json` available at `http://llocalhost:3000/models/1/model.json`

### Run tests

We use [vitest](https://vitest.dev/) as our test runner. It supports interactive features -- like pressing `r` to re-run all test suites during watch mode:

```bash
npm run test
```

## 🏗 Build

We use [Rollup](https://rollupjs.org/) to bundle the package for browsers. Output is build for modern ES6 environments, which ensures compatibility with:

- ~97.7% of browsers globally
- ~99.9% of browsers trached on [Can I Use](https://caniuse.com/?search=es6)

```bash
npm run build
```

## 📦 Publishing

To publish a new version:

1. Update `version` in `package.json`
2. Create PR for a branch
3. Wait for PR to be merged with master branch.
