import * as tf from "@tensorflow/tfjs";
export type ButtonType = "NoButton" | "Left" | "Right";
export type State = "Pressed" | "Released" | "Move" | "Drag";
import { Queue } from "./queue";

export type DataRecord = {
  timestamp: number;
  eventType: "mousemove" | "mouseup" | "mousedown";
  x: number;
  y: number;
};

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
 */

const SMTH_MAP = Object.freeze<Record<string, number>>({
  mousedown: 0,
  mouseup: 1,
  mousemove: 2,
});

const ALLOWED_EVENT_TYPES: Readonly<string[]> = [
  "mousemove",
  "mousedown",
  "mouseup",
] as const;

function isMouseEvent(e: Event): e is MouseEvent {
  return ALLOWED_EVENT_TYPES.includes(e.type);
}

function minMaxScaler(arr: number[], value: number): number {
  const max = (arr: number[]) => Math.max(...arr);
  const min = (arr: number[]) => Math.min(...arr);

  const _min = min(arr);
  const _max = max(arr);

  return (value - _min) / (_max - _min);
}

export class Data {
  #isButtonDown: boolean = false;

  #queue: Queue<DataRecord> = new Queue();
  #cb: (() => void) | undefined = undefined;

  constructor(private readonly target: EventTarget = window) { }

  private onMouseMove(e: Event) {
    if (!isMouseEvent(e)) return;

    const _state = SMTH_MAP[e.type];

    if (_state === undefined) {
      return;
    }

    const record: DataRecord = {
      timestamp: Date.now(),
      eventType: e.type as DataRecord["eventType"],
      x: e.x,
      y: e.y,
    };

    this.#queue.enqueue(record);
    if (this.#cb) {
      this.#cb();
    }
  }

  private onMouseDown(e: Event) {
    this.#isButtonDown = true;
    this.onMouseMove(e);
  }

  private onMouseUp(e: Event) {
    this.onMouseMove(e);
    this.#isButtonDown = false;
  }

  /**
   * Starts tracking mouse events on window
   */
  addListeners(cb?: () => void) {
    this.#cb = cb;
    this.target.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.target.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.target.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  /**
   * disposes references, preventing memory leaks
   */
  removeListeners() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  toTensor(): tf.Tensor {
    const q = Array.from(this.#queue);

    if (q.length < 2) {
      throw new Error("Not enough data to compute features");
    }

    const xs = q.map((r) => r.x);
    const ys = q.map((r) => r.y);
    const times = q.map((r) => r.timestamp);

    // Deltas
    const timeDiffs = times.slice(1).map((t, i) => t - times[i]!);
    const xDiffs = xs.slice(1).map((x, i) => x - xs[i]!);
    const yDiffs = ys.slice(1).map((y, i) => y - ys[i]!);

    // X - Xmin / Xmax - Xmin

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr: number[], avg = mean(arr)) =>
      Math.sqrt(mean(arr.map((x) => (x - avg) ** 2)));
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const max = (arr: number[]) => Math.max(...arr);
    // const min = (arr: number[]) => Math.min(...arr);

    const features = [
      // min(xs),
      // max(xs),
      // min(ys),
      // max(ys),
      minMaxScaler(timeDiffs, mean(timeDiffs)),
      minMaxScaler(timeDiffs, std(timeDiffs)),
      minMaxScaler(timeDiffs, sum(timeDiffs)),
      minMaxScaler(timeDiffs, max(timeDiffs)),

      minMaxScaler(xDiffs, mean(xDiffs)),
      minMaxScaler(xDiffs, std(xDiffs)),
      minMaxScaler(xDiffs, sum(xDiffs)),

      minMaxScaler(yDiffs, mean(yDiffs)),
      minMaxScaler(yDiffs, std(yDiffs)),
      minMaxScaler(yDiffs, sum(yDiffs)),
    ];

    console.log("(mouse) features", features);

    const tensor = tf.tensor2d([features], [1, features.length]);

    return tensor;
  }

  clear(): void {
    this.#queue.clear();
  }

  length(): number {
    return this.#queue.length();
  }
}
