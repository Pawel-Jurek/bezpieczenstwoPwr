import { Model } from "./lib/tfjs";
import { Data } from "./utils/data";

export class App {
  private model: Model;
  private data: Data;

  private isProcessing: boolean = false;

  constructor(
    manifestUrl: string,
    private readonly target: EventTarget = window,
  ) {
    this.model = new Model(manifestUrl);
    this.data = new Data(target);
  }

  async init() {
    console.log("Loading model...");
    await this.model.load();
    console.log("Model loaded successfully");
    this.startTracking();
  }

  startTracking() {
    this.data.addListeners();
    setInterval(() => this.processData(), 2000);
  }

  async processData() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const tensor = this.data.toTensor();

      if (tensor.shape[1] !== 75) {
        this.isProcessing = false;
        return;
      }

      const result = await this.model.predict(tensor);
      console.log(
        "Prediction:",
        result > 0.5 ? "bot" : "human",
        `${(result * 100.0).toFixed(2)}%`,
      );

      // Clear queue after processing to avoid duplicate predictions
      this.data.clear();
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  stopTracking() {
    this.data.removeListeners();
  }
}
