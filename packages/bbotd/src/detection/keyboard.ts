import { BaseDetector } from "./base";

export interface KeyboardEvent {
  key: string;
  timestamp: number;
  type: "keydown" | "keyup";
}

interface KeyboardScaler {
  mean_: number[];
  scale_: number[];
  var_: number[];
  n_features_in_: number;
  feature_names_in_: string | null;
  n_samples_seen: number;
}

export class KeyboardDetector extends BaseDetector<KeyboardScaler> {
  private pressEvents: KeyboardEvent[] = [];
  private releaseEvents: KeyboardEvent[] = [];
  private eventListener?: (event: globalThis.KeyboardEvent) => void;
  private readonly MAX_KEYS = 13;
  private readonly DETECTION_THRESHOLD = 0.95;
  private readonly WPM_THRESHOLD = 150;

  constructor() {
    super("keyboard");
  }

  startListening(): void {
    this.eventListener = (event: globalThis.KeyboardEvent) => {
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
      }

      if (
        this.releaseEvents.length >= this.MAX_KEYS &&
        this.pressEvents.length >= this.MAX_KEYS
      ) {
        this.releaseEvents = this.releaseEvents.slice(-this.MAX_KEYS);
        this.pressEvents = this.pressEvents.slice(-this.MAX_KEYS);
        this.detectBot().then((probability) => {
          if (probability > this.DETECTION_THRESHOLD) {
            this.dispatchBotDetectedEvent("keyboard", probability);
            console.warn("Bot detected based on keyboard events!");
          }

          this.pressEvents = [];
          this.releaseEvents = [];
        });
      }
    };

    document.addEventListener("keydown", this.eventListener);
    document.addEventListener("keyup", this.eventListener);
  }

  stopListening(): void {
    if (this.eventListener) {
      document.removeEventListener("keydown", this.eventListener);
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
    const pressTimes = this.pressEvents.map((e) => e.timestamp);
    const releaseTimes = this.releaseEvents.map((e) => e.timestamp);

    const holdTimes: number[] = [];
    for (let i = 0; i < this.MAX_KEYS; i++) {
      const hold = releaseTimes[i]! - pressTimes[i]!;
      holdTimes.push(Math.round(hold));
    }

    // Calculate press and release differences (in milliseconds)
    const pressDiffs: number[] = [];
    const releaseDiffs: number[] = [];

    for (let i = 1; i < this.MAX_KEYS; i++) {
      const pressDiff = pressTimes[i]! - pressTimes[i - 1]!;
      const releaseDiff = releaseTimes[i]! - releaseTimes[i - 1]!;
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

    // You need to load the feature names from your model
    // For now, let's assume you have them in the expected order
    const expectedFeatures = this.getExpectedFeatureOrder();

    // Convert to array in the correct order
    const features = expectedFeatures.map(
      (featureName) => sample[featureName] || 0,
    );

    return features;
  }

  private calculateWPM(): number {
    if (this.pressEvents.length < 2) {
      return 0;
    }

    const firstKeyTime = this.pressEvents[0]!.timestamp;
    const lastKeyTime =
      this.pressEvents[this.pressEvents.length - 1]!.timestamp;
    const timeElapsedMs = lastKeyTime - firstKeyTime;

    if (timeElapsedMs <= 0) {
      return 0;
    }

    const timeElapsedMin = timeElapsedMs / (1000 * 60); // Convert to minutes

    // Assume average word length of 5 characters
    const estimatedWords = this.pressEvents.length / 5;
    const wpm = estimatedWords / timeElapsedMin;

    return wpm;
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
    const wpm = this.calculateWPM();

    // assume it's bot for sure
    // if (wpm > this.WPM_THRESHOLD) {
    //   return 1.0;
    // }

    const features = this.transformToFeatures();
    if (features.length !== this.scaler?.n_features_in_) {
      console.warn(
        `Feature length mismatch: expected ${this.scaler?.n_features_in_}, got ${features.length}`,
      );
    }
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
