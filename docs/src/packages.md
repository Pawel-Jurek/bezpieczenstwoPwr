# 📦 Packages

This monorepo contains reusable packages located under the `packages/` directory. Each package is structured to be independently built, tested, and (when applicable) published to npm.

## Available Packages

### [`bbotd`](https://www.npmjs.com/package/bbotd)

A browser-first anomaly detection library designed to identify bot-like behavior on websites using real-time data and lightweight machine learning models.

#### ✨ Features

- Works directly in the browser
- Detects suspicious user behavior using pre-trained ML models
- Built with modern ES6 standards
- Lightweight and dependency-friendly

#### 🚀 Quick Start

Add the following to your HTML page:

```html{2-3}
<body>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bbotd/dist/index.min.js"></script>
<!-- existing code -->
</body>
```
