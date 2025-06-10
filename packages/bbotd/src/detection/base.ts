import * as tf from "@tensorflow/tfjs";
import { ModelLoader } from "../lib/model-loader";
import type { BotDetectedEventDetail } from "../ui";
import { SimpleLogger } from "../logger";

export abstract class BaseDetector<T> {
  protected model?: tf.GraphModel<string | tf.io.IOHandler>;
  protected scaler?: T;

  constructor(protected modelName: "keyboard" | "mouse") { }

  async initialize(): Promise<void> {
    const [model, scaler] = await Promise.all([
      ModelLoader.loadModel(this.modelName),
      ModelLoader.loadScaler(this.modelName),
    ]);
    this.model = model;
    this.scaler = scaler as T;
  }

  protected async predict(features: number[]): Promise<number> {
    if (!this.model) throw new Error(`${this.modelName} model not initialized`);

    SimpleLogger.log(
      `features (${this.modelName}): ${features
        .map((f) => f.toFixed(5))
        .join(", ")}`,
    );
    const scaledFeatures = this.scaleFeatures(features);
    SimpleLogger.log(
      `scaledFeatures (${this.modelName}): ${scaledFeatures
        .map((f) => f.toFixed(5))
        .join(", ")}`,
    );

    const tensor = tf.tensor2d([scaledFeatures]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const probability = await prediction.data();
    console.info(`${this.modelName} probability: ${probability}`);
    SimpleLogger.log(
      `probability (${this.modelName}): ${Array.from(probability)
        .map((p) => p.toFixed(5))
        .join(", ")}`,
    );

    tensor.dispose();
    prediction.dispose();

    // FIXME: I assume the first value exists
    const result = Array.from(probability)[0]!;

    return result;
  }

  protected dispatchBotDetectedEvent(
    source: "keyboard" | "mouse" | "combined",
    confidence: number,
  ): void {
    const event = new CustomEvent("botDetected", {
      detail: {
        source,
        confidence,
        timestamp: Date.now(),
      } as BotDetectedEventDetail,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(event);
  }

  protected abstract scaleFeatures(features: number[]): number[];
  abstract detectBot(rawData: any[]): Promise<number>;
  abstract getBotProbability(rawData: any[]): Promise<number>;
}
