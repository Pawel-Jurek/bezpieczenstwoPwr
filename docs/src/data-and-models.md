# 📊 Data & Models

This section covers how behavioral data is used to train machine learning models in **bezpieczenstwoPwr**, as well as how those models are integrated and run in the browser.

## 📁 Data Source

The machine learning models are trained using anonymized user behavior data, primarily from:

- [Kaggle datasets](https://www.kaggle.com/) related to **mouse movement**, **bot detection**, or **human-computer interaction**
- Custom-collected data from real users and simulation tools (e.g., puppeteer)

Typical features include:

- Mouse speed and acceleration
- Click patterns and hesitation times
- Pointer trajectory shapes
- Keystroke intervals and input dynamics

> 🧠 All data is anonymized before any storage or model training. No personally identifiable information is collected.

## 🛠 Data Preprocessing

Before feeding data into the model, we perform several preprocessing steps:

- **Normalization** of coordinates and timing
- **Sequence padding** or trimming to ensure consistent input shape
- **Feature extraction** such as velocity, direction changes, or dwell time
- **Noise filtering** to remove accidental or edge-case inputs

You can find preprocessing code inside the training pipeline scripts (not yet published, ask us if you want early access).

## 🧠 Model Architecture

Models are designed for lightweight, in-browser inference using [TensorFlow.js](https://www.tensorflow.org/js/).

We experimented with:

- LSTM / GRU networks for time-sequence analysis
- 1D CNNs for spatial-temporal patterns
- Ensemble methods trained offline and distilled into TensorFlow.js format

The final model is selected based on size, accuracy, and inference speed in the browser.

> ⚠️ Models are kept under `public/models/` for now. Expect a proper versioning system and CDN-hosted models in future updates.

## 📦 Loading Models

The `bbotd` package automatically loads a model from a given URL:

```js
bbotd.loadModel("https://yourdomain.com/models/1/model.json").then((model) => {
  const prediction = model.predict(userData);
});
```
