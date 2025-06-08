import * as tf from "@tensorflow/tfjs";
import { ModelLoader } from "./lib/model-loader";
import type { ScalerData } from "./lib/model-loader";
import type { BotDetectedEventDetail } from "./ui";

interface KeyboardEvent {
  key: string;
  timestamp: number;
  type: "keydown" | "keyup";
}

interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
}

// const BASE_THRESHOLD = 0.5;

abstract class BaseDetector<T> {
  protected model?: tf.GraphModel<string | tf.io.IOHandler>;
  protected scaler?: T;
  // protected threshold = BASE_THRESHOLD;

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

    console.info("features", features);
    const scaledFeatures = this.scaleFeatures(features);
    console.info("scaledFeatures", scaledFeatures);

    const tensor = tf.tensor2d([scaledFeatures]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const probability = await prediction.data();
    console.info("probability", probability);

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

interface KeyboardScaler {
  mean_: number[];
  scale_: number[];
  var_: number[];
  n_features_in_: number;
  feature_names_in_: string | null;
  n_samples_seen: number;
}

class KeyboardDetector extends BaseDetector<KeyboardScaler> {
  // private keyEvents: KeyboardEvent[] = [];
  private pressEvents: KeyboardEvent[] = [];
  private releaseEvents: KeyboardEvent[] = [];
  private eventListener?: (event: KeyboardEvent) => void;
  private readonly MAX_KEYS = 13;

  constructor() {
    super("keyboard");
  }

  startListening(): void {
    this.eventListener = (event: KeyboardEvent) => {
      if (event.type === "keydown") {
        this.pressEvents.push({
          key: event.key,
          timestamp: Date.now(),
          type: event.type,
        });
      } else if (event.type === "keyup") {
        this.releaseEvents.push({
          key: event.key,
          timestamp: Date.now(),
          type: event.type,
        });

        if (this.releaseEvents.length === this.MAX_KEYS) {
          // this.keyEvents = this.keyEvents.slice(-40);

          this.detectBot().then((probability) => {
            console.info("isBot:", probability > 0.5);
            if (probability > 0.5) {
              this.dispatchBotDetectedEvent("keyboard", probability);
              console.warn("Bot detected based on keyboard events!");
            }

            this.pressEvents = [];
            this.releaseEvents = [];
          });
        }
      }
    };

    // @ts-expect-error
    document.addEventListener("keydown", this.eventListener);
    // @ts-expect-error
    document.addEventListener("keyup", this.eventListener);
  }

  stopListening(): void {
    if (this.eventListener) {
      // @ts-expect-error
      document.removeEventListener("keydown", this.eventListener);
      // @ts-expect-error
      document.removeEventListener("keyup", this.eventListener);
      this.eventListener = undefined;
    }
  }

  private transformToFeatures(): number[] {
    if (
      this.pressEvents.length !== this.MAX_KEYS ||
      this.releaseEvents.length !== this.MAX_KEYS
    ) {
      console.warn(
        `Insufficient data: ${this.pressEvents.length} press events, ${this.releaseEvents.length} release events`,
      );
      return [];
    }

    // Convert timestamps to seconds (like the Python code)
    const pressTimes = this.pressEvents.map((e) => e.timestamp / 1000);
    const releaseTimes = this.releaseEvents.map((e) => e.timestamp / 1000);

    // Calculate hold times (in milliseconds, like Python)
    const holdTimes: number[] = [];
    for (let i = 0; i < this.MAX_KEYS; i++) {
      const hold = (releaseTimes[i]! - pressTimes[i]!) * 1000; // Convert to ms
      holdTimes.push(Math.round(hold));
    }

    // Calculate press and release differences (in milliseconds)
    const pressDiffs: number[] = [];
    const releaseDiffs: number[] = [];

    for (let i = 1; i < this.MAX_KEYS; i++) {
      const pressDiff = (pressTimes[i]! - pressTimes[i - 1]!) * 1000;
      const releaseDiff = (releaseTimes[i]! - releaseTimes[i - 1]!) * 1000;
      pressDiffs.push(Math.round(pressDiff));
      releaseDiffs.push(Math.round(releaseDiff));
    }

    // Create feature object matching Python structure
    const sample: Record<string, number> = {};

    // Add hold times
    for (let i = 0; i < this.MAX_KEYS; i++) {
      sample[`hold_time_${i}`] = holdTimes[i] || 0;
    }

    // Add press and release diffs (starting from index 1, like Python)
    for (let i = 1; i < this.MAX_KEYS; i++) {
      sample[`press_diff_${i}`] = pressDiffs[i - 1] || 0;
      sample[`release_diff_${i}`] = releaseDiffs[i - 1] || 0;
    }

    console.log("Raw sample data:", sample);

    // You need to load the feature names from your model
    // For now, let's assume you have them in the expected order
    const expectedFeatures = this.getExpectedFeatureOrder();

    // Convert to array in the correct order
    const features = expectedFeatures.map(
      (featureName) => sample[featureName] || 0,
    );

    console.log("Features array:", features);
    return features;
  }

  // You need to implement this based on your model's expected feature order
  private getExpectedFeatureOrder(): string[] {
    // This should match the order your model expects
    // You might need to load this from a file or hardcode it based on your training
    const features: string[] = [];

    // Add hold_time features
    for (let i = 0; i < this.MAX_KEYS; i++) {
      features.push(`hold_time_${i}`);
    }

    // Add press_diff and release_diff features (starting from 1)
    for (let i = 1; i < this.MAX_KEYS; i++) {
      features.push(`press_diff_${i}`);
      features.push(`release_diff_${i}`);
    }

    return features;
  }

  protected scaleFeatures(features: number[]): number[] {
    if (!this.scaler?.mean_ || !this.scaler?.scale_) {
      return features;
    }

    return features.map((value, i) => {
      const mean = this.scaler!.mean_[i] ?? 0;
      const scale = this.scaler!.scale_[i] ?? 1;
      return (value - mean) / scale;
    });
  }

  async getBotProbability(): Promise<number> {
    const features = this.transformToFeatures();
    return this.predict(features);
  }

  async detectBot(): Promise<number> {
    const probability = await this.getBotProbability();
    return probability;
  }

  getCurrentEvents(): { press: KeyboardEvent[]; release: KeyboardEvent[] } {
    return {
      press: [...this.pressEvents],
      release: [...this.releaseEvents],
    };
  }
}

class MouseDetector extends BaseDetector<ScalerData> {
  private mouseEvents: MouseEvent[] = [];
  private eventListener?: (event: globalThis.MouseEvent) => void;
  private readonly MIN_WINDOW = 6000;
  private readonly MAX_WINDOW = 12000;

  constructor() {
    super("mouse");
  }

  startListening(): void {
    this.eventListener = (event: globalThis.MouseEvent) => {
      this.mouseEvents.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent events (last 30 seconds)
      const cutoff = Date.now() - 30000;
      this.mouseEvents = this.mouseEvents.filter((e) => e.timestamp > cutoff);
    };

    document.addEventListener("mousemove", this.eventListener);
  }

  stopListening(): void {
    if (this.eventListener) {
      document.removeEventListener("mousemove", this.eventListener);
      this.eventListener = undefined;
    }
  }

  private transformToFeatures(events: MouseEvent[]): number[] {
    if (events.length < 2) return [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Calculate movement differences
    const movements = [];
    for (let i = 1; i < events.length; i++) {
      const prev = events[i - 1];
      const curr = events[i];
      movements.push({
        x_diff: Math.abs(curr!.x - prev!.x),
        y_diff: Math.abs(curr!.y - prev!.y),
        timestamp: curr!.timestamp,
      });
    }

    // Create time windows and aggregate
    const startTime = events[0]!.timestamp;
    const endTime = events[events.length - 1]!.timestamp;
    const duration = endTime - startTime;

    if (duration < this.MIN_WINDOW) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Not enough data
    }

    // Simple aggregation for the entire window
    const xDiffs = movements.map((m) => m.x_diff);
    const yDiffs = movements.map((m) => m.y_diff);

    const xMean = xDiffs.reduce((a, b) => a + b, 0) / xDiffs.length;
    const yMean = yDiffs.reduce((a, b) => a + b, 0) / yDiffs.length;
    const xSum = xDiffs.reduce((a, b) => a + b, 0);
    const ySum = yDiffs.reduce((a, b) => a + b, 0);

    const xVariance =
      xDiffs.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) /
      xDiffs.length;
    const yVariance =
      yDiffs.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) /
      yDiffs.length;
    const xStd = Math.sqrt(xVariance);
    const yStd = Math.sqrt(yVariance);

    return [
      xMean,
      xStd,
      xSum,
      yMean,
      yStd,
      ySum,
      xSum + ySum, // xy_total_activity
      xStd + yStd, // xy_std_total
      xMean + yMean, // xy_mean_total
    ];
  }

  protected scaleFeatures(features: number[]): number[] {
    if (!this.scaler?.min_ || !this.scaler?.scale_ || !this.scaler?.data_min_) {
      return features;
    }

    return features.map(
      (value, i) =>
        (value - this.scaler!.data_min_![i]!) * this.scaler?.scale_[i]! +
        this.scaler?.min_[i]!,
    );
  }

  async detectBot(mouseEvents?: MouseEvent[]): Promise<number> {
    const probability = await this.getBotProbability(mouseEvents);
    return probability;
  }

  async getBotProbability(mouseEvents?: MouseEvent[]): Promise<number> {
    const events = mouseEvents || this.mouseEvents;
    const features = this.transformToFeatures(events);
    return this.predict(features);
  }

  getCurrentEvents(): MouseEvent[] {
    return [...this.mouseEvents];
  }
}

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  source: "keyboard" | "mouse" | "combined";
  timestamp: number;
}

interface BotDetectorConfig {
  checkInterval?: number; // milliseconds between checks
  minKeyboardEvents?: number; // minimum keyboard events before checking
  minMouseEvents?: number; // minimum mouse events before checking
  onBotDetected?: (result: BotDetectionResult) => void;
  onProbabilityUpdate?: (
    keyboard: number,
    mouse: number,
    combined: number,
  ) => void;
  enablePeriodicChecking?: boolean;
  enableEventThresholdChecking?: boolean;
}

const DEFAULT_CONFIG: Required<BotDetectorConfig> = {
  checkInterval: 5000, // Check every 5 seconds
  minKeyboardEvents: 10, // Check after 10 keyboard events
  minMouseEvents: 20, // Check after 20 mouse events
  onBotDetected: () => { },
  onProbabilityUpdate: () => { },
  enablePeriodicChecking: true,
  enableEventThresholdChecking: true,
};

class BotDetector {
  private keyboardDetector = new KeyboardDetector();
  private mouseDetector = new MouseDetector();
  // private periodicCheckInterval?: NodeJS.Timeout;
  // private config: Required<BotDetectorConfig>;

  constructor() {
    // this.config = DEFAULT_CONFIG;
    // Set up event callbacks for threshold-based checking
    // this.keyboardDetector.setEventCallback(() => {
    //   this.keyboardEventCount++;
    //   if (
    //     this.config.enableEventThresholdChecking &&
    //     this.keyboardEventCount >= this.config.minKeyboardEvents
    //   ) {
    //     this.checkForBots("keyboard");
    //     this.keyboardEventCount = 0; // Reset counter
    //   }
    // });
    // this.mouseDetector.setEventCallback(() => {
    //   this.mouseEventCount++;
    //   if (
    //     this.config.enableEventThresholdChecking &&
    //     this.mouseEventCount >= this.config.minMouseEvents
    //   ) {
    //     this.checkForBots("mouse");
    //     this.mouseEventCount = 0; // Reset counter
    //   }
    // });
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.keyboardDetector.initialize(),
      this.mouseDetector.initialize(),
    ]);
  }

  startListening(): void {
    this.keyboardDetector.startListening();
    this.mouseDetector.startListening();
  }

  stopListening(): void {
    this.keyboardDetector.stopListening();
    this.mouseDetector.stopListening();
  }

  private startPeriodicCheck(): void {
    this.periodicCheckInterval = setInterval(() => {
      // this.checkForBots("periodic");
      console.log("check");
    }, 10000);
  }

  async detectKeyboardBot(): Promise<number> {
    return this.keyboardDetector.detectBot();
  }

  async detectMouseBot(): Promise<number> {
    return this.mouseDetector.detectBot();
  }

  async getKeyboardBotProbability(): Promise<number> {
    return this.keyboardDetector.getBotProbability();
  }

  async getMouseBotProbability(): Promise<number> {
    return this.mouseDetector.getBotProbability();
  }

  async detectBot(): Promise<boolean> {
    const [isKeyboardBot, isMouseBot] = await Promise.all([
      this.detectKeyboardBot(),
      this.detectMouseBot(),
    ]);

    // FIXME: XD
    return Boolean(isKeyboardBot || isMouseBot);
  }

  async getBotProbability(): Promise<number> {
    const [keyboardProb, mouseProb] = await Promise.all([
      this.getKeyboardBotProbability(),
      this.getMouseBotProbability(),
    ]);

    return (keyboardProb + mouseProb) / 2;
  }

  getKeyboardEvents() {
    return this.keyboardDetector.getCurrentEvents();
  }
  getMouseEvents() {
    return this.mouseDetector.getCurrentEvents();
  }
}

export { BotDetector, KeyboardDetector, MouseDetector };
