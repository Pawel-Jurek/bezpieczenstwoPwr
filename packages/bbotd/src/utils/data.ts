import * as tf from "@tensorflow/tfjs";
export type ButtonType = "NoButton" | "Left" | "Right";
export type State = "Pressed" | "Released" | "Move" | "Drag";

export type DataRecord = {
  timestamp: number;
  eventType: "mousemove" | "mouseup" | "mousedown";
  x: number;
  y: number;
};

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
 */
const BUTTON_MAP = Object.freeze<Record<ButtonType, number>>({
  NoButton: 0,
  Left: 1,
  Right: 2,
});

const STATE_MAP = Object.freeze<Record<State, number>>({
  Pressed: 0,
  Released: 1,
  Move: 2,
  Drag: 3,
});

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

class Queue<T> {
  #queue: T[] = [];

  /**
   * @param [maxSize=100]
   */
  constructor(private readonly maxSize: number = 75) { }

  enqueue(el: T) {
    if (this.#queue.length >= this.maxSize) {
      this.#queue.shift();
    }

    this.#queue.push(el);
  }

  dequeue() {
    return this.#queue.shift();
  }

  clear() {
    this.#queue.length = 0;
  }

  length() {
    return this.#queue.length;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.#queue[Symbol.iterator]();
  }
}

export class Data {
  #isButtonDown: boolean = false;

  #queue: Queue<DataRecord> = new Queue();

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
  addListeners() {
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
    const tensor = tf.tensor2d(
      q.map((record) => [
        normalizeEventType(record.eventType),
        normalizeCoord(record.x),
        normalizeCoord(record.y),
        normalizeTimestamp(record.timestamp),
      ]),
      [q.length, 4],
    );

    return tensor.reshape([1, q.length, 4]);
  }

  clear(): void {
    this.#queue.clear();
  }
}

function normalizeEventType(eventType: string) {
  return SMTH_MAP[eventType] ?? -1;
}

const normalizeTimestamp = (function() {
  let prevTimestamp: number | undefined;

  return (timestamp: number) => {
    const diff = timestamp - (prevTimestamp ?? timestamp);
    prevTimestamp = timestamp;
    return diff;
  };
})();

function normalizeCoord(value: number) {
  return value / window.innerWidth;
}
