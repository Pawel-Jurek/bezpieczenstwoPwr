import { Model } from "./lib/tfjs";
import { Data } from "./utils/data";

import { throttleDebounce } from "./utils/debounce";

const processData2 = async (data: Data, model: Model) => {
  console.log("call fn");

  try {
    const len = data.length();

    if (len < 5) return;

    const tensor = data.toTensor();

    const result = await model.predict(tensor);

    console.log(
      "Prediction:",
      result > 0.5 ? "bot" : "human",
      `${(result * 100.0).toFixed(2)}%`,
    );

    // Clear queue after processing to avoid duplicate predictions
    data.clear();
  } catch (error) {
    console.error("Prediction error:", error);
  }
};

export class App {
  private model: Model;
  private data: Data;

  // private isProcessing: boolean = false;

  constructor(private readonly target: EventTarget = window) {
    this.model = new Model("mouse");
    this.data = new Data(this.target);
  }

  async init() {
    console.log("Loading model...");
    await this.model.load();
    console.log("Model loaded successfully");
    this.startTracking();
  }

  startTracking() {
    const fn = throttleDebounce(processData2);
    this.data.addListeners(() => {
      fn(this.data, this.model);
    });
    // setInterval(() => this.processData(), 2000);
  }

  // async processData() {
  //   if (this.isProcessing) return;
  //
  //   try {
  //     const len = this.data.length();
  //     if (len < 100) return;
  //
  //     this.isProcessing = true;
  //     const tensor = this.data.toTensor();
  //
  //     const result = await this.model.predict(tensor);
  //
  //     console.log(
  //       "Prediction:",
  //       result > 0.5 ? "bot" : "human",
  //       `${(result * 100.0).toFixed(2)}%`,
  //     );
  //
  //     // Clear queue after processing to avoid duplicate predictions
  //     this.data.clear();
  //   } catch (error) {
  //     console.error("Prediction error:", error);
  //   } finally {
  //     this.isProcessing = false;
  //   }
  // }

  stopTracking() {
    this.data.removeListeners();
  }
}
