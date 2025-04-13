# bezpieczenstwoPwr

**An application for detecting anomalous behavior on websites.**

This repository is a monorepo containing examples and packages. The main published package is located in the `packages/` folder (e.g., [bbotd on npm](https://www.npmjs.com/package/bbotd)), while example projects (such as the React TypeScript example) live in the `examples/` directory and are deployed via GitHub Pages.

---

## Overview

The goal of **bezpieczenstwoPwr** is to detect suspicious or anomalous activities on web pages—for example, bot activity or challenges similar to CAPTCHA. It is conceived as a real-time authentication tool that leverages machine learning models and rigorous testing to ensure reliability.

---

## Requirements

- **Machine Learning Model**
  - Developed using data from Kaggle (e.g., mouse movement analysis)
- **Testing**
  - _Manual tests_
  - _Automated tests_ (using in-house tools like scikit-learn)
  - _End-to-end (e2e)_ tests
- **Data Handling**
  - Data anonymization from the frontend before sending it to the backend (as an additional feature)
- **Real-Time Processing**
  - The system is designed to operate potentially in real-time

---

## Data

- **Kaggle:**  
  Refer to the [Kaggle dataset](#) used as the basis for our machine learning model.

---

## Phase 2 & Future Work

- **Metrics & Evaluation:**
  - Gather and present meaningful metrics that evaluate the model's performance.
  - Identify edge cases to understand when the model performs well and when it fails.
- **Edge Case Scenarios:**
  - Previous efforts included profiling typing patterns (tracking how input changes over time).
  - In some tests, unconventional scenarios were considered (e.g., simulating a user with a cast on their arm or under the influence of alcohol).
- **Next Steps:**
  - Currently, the focus is on model training and displaying the initial results.
  - Future enhancements may include additional features and real-time processing improvements.
- **Resources:**
  - Access to powerful virtual machines (with many processors and advanced GPUs) might be arranged if needed.

---

## How to Get Started

- **For Package Development:**  
  Navigate to the `packages/bbotd` directory and follow the individual package README instructions.
- **For Example Projects:**  
  Check the `examples/` folder (e.g., `examples/react-ts`) for projects that demonstrate real-world usage, deployed via GitHub Pages.

---

## Contributing

Your contributions and feedback are welcome! Please open an issue or submit a pull request if you find any bugs or have suggestions for improvement.

---

## License

This project is licensed under the MIT License.
