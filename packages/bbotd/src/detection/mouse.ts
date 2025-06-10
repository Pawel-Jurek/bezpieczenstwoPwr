import type { ScalerData } from "../lib/model-loader";
import { BaseDetector } from "./base";

type MouseEvent = {
  x: number;
  y: number;
  timestamp: number;
};

export class MouseDetector extends BaseDetector<ScalerData> {
  private mouseEvents: MouseEvent[] = [];
  private eventListener?: (event: globalThis.MouseEvent) => void;
  private readonly MIN_WINDOW = 6000;
  private readonly MAX_WINDOW = 12000;
  private readonly SAMPLE_INTERVAL = 16; // ms
  private currentMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private readonly DETECTION_WINDOW = this.MIN_WINDOW; // Trigger detection at MIN_WINDOW seconds
  private samplingInterval: NodeJS.Timeout | undefined = undefined;
  private PROBABILITY_THRESHOLD: number = 0.9;

  constructor() {
    super("mouse");
  }

  startListening(): void {
    this.eventListener = (event: globalThis.MouseEvent) => {
      this.currentMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    this.samplingInterval = setInterval(() => {
      const currentTime = Date.now();

      this.mouseEvents.push({
        x: this.currentMousePosition.x,
        y: this.currentMousePosition.y,
        timestamp: currentTime,
      });

      const oldestEvent = this.mouseEvents[0];
      if (
        oldestEvent &&
        currentTime - oldestEvent.timestamp >= this.DETECTION_WINDOW
      ) {
        console.log;
        this.detectBot().then((probability) => {
          if (probability > this.PROBABILITY_THRESHOLD) {
            this.dispatchBotDetectedEvent("mouse", probability);
            console.warn("Bot detected based on mouse events!");
          }

          this.mouseEvents = [];
        });
      }
    }, this.SAMPLE_INTERVAL);

    document.addEventListener("mousemove", this.eventListener);
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.MAX_WINDOW;
    this.mouseEvents = this.mouseEvents.filter((e) => e.timestamp > cutoff);
  }

  stopListening(): void {
    if (this.eventListener) {
      document.removeEventListener("mousemove", this.eventListener);
      this.eventListener = undefined;
    }
  }

  private transformToFeatures(events: MouseEvent[]): number[] {
    if (events.length < 2) return [0, 0, 0, 0, 0, 0, 0, 0, 0];

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

    const startTime = events[0]!.timestamp;
    const endTime = events[events.length - 1]!.timestamp;
    const duration = endTime - startTime;

    if (duration < this.MIN_WINDOW) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const xDiffs = movements.map((m) => m.x_diff);
    const yDiffs = movements.map((m) => m.y_diff);

    const xSum = xDiffs.reduce((a, b) => a + b, 0);
    const ySum = yDiffs.reduce((a, b) => a + b, 0);
    const xMean = xSum / xDiffs.length;
    const yMean = ySum / yDiffs.length;

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
