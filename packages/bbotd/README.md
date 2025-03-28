# Usage

## Development

Install dependencies via [npm](https://www.npmjs.com/)

```bash
npm install
```

Static files must be served locally (until we find better way of providing them for tests).

Serve static files from public directory via `serve`. The files become available under their corresponding paths, so e.g. `./public/models/1/model.json` becomes available under `http://localhost:3000/models/1/model.json`

```bash
npx serve public
```

Run tests. We use `vitest` as runner, it comes with helpful keybindings, e.g. clicking `r` while the vitest watch is running reruns all test suites.

```bash
npm run test
```

### Building package

We utilize [rollup](ttps://rollupjs.org/) so the package is compatible between browsers. We build for [ES6](https://caniuse.com/es6) which makes it compatible with 97.4% users browsers, and 99.9%+ of browsers tracked by [caniuse](https://caniuse.com/).

```bash
npm run build
```
