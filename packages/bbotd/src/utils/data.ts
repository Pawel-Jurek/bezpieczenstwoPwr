import * as tf from "@tensorflow/tfjs";
export type ButtonType = "NoButton" | "Left" | "Right";
export type State = "Pressed" | "Released" | "Move" | "Drag";

export type DataRecord = {
  timestamp: number;
  button: number;
  state: number;
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
  constructor(private readonly maxSize: number = 100) { }

  enqueue(el: T) {
    if (this.#queue.length > this.maxSize) {
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

  [Symbol.iterator](): IterableIterator<T> {
    return this.#queue[Symbol.iterator]();
  }
}

export class Data {
  #isButtonDown: boolean = false;

  #queue: Queue<DataRecord> = new Queue();

  constructor(private readonly target: EventTarget = window) { }

  onMouseMove(e: Event) {
    if (!isMouseEvent(e)) return;

    const _state = STATE_MAP[e.type as State];
    if (_state === undefined) {
      return;
    }

    const record: DataRecord = {
      timestamp: Date.now(),
      button: this.#isButtonDown ? e.button : -1,
      state: _state,
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
    this.target.addEventListener("mousemove", this.onMouseMove);
    this.target.addEventListener("mousedown", this.onMouseDown);
    this.target.addEventListener("mouseup", this.onMouseUp);
  }

  removeListeners() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  toTensor(): tf.Tensor {
    const q = Array.from(this.#queue);
    return tf.tensor2d(
      q.map((record) => [
        record.timestamp,
        record.button,
        record.state,
        record.x,
        record.y,
      ]),
      [q.length, 5],
    );
  }
}
