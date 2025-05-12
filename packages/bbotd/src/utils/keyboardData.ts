import * as tf from "@tensorflow/tfjs";

interface Data {
  addListeners(cb?: () => void): void;
  removeListeners(): void;
  toTensor(): tf.Tensor;
  clear(): void;
}

export class KeyboardData implements Data {
  #pressTimes: number[] = [];
  #releaseTimes: number[] = [];
  #cb: (() => void) | undefined = undefined;

  constructor(private readonly target: EventTarget = window) { }

  private onKeyDown() {
    if (this.#pressTimes.length < 13) {
      this.#pressTimes.push(Date.now());
    }
    this.#cb?.();
  }

  private onKeyUp() {
    if (this.#releaseTimes.length < 13) {
      this.#releaseTimes.push(Date.now());
    }
    this.#cb?.();
  }

  addListeners(cb?: () => void) {
    this.#cb = cb;
    this.target.addEventListener("keydown", this.onKeyDown.bind(this));
    this.target.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  removeListeners(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
  }

  toTensor(): tf.Tensor {
    const holdTimes = this.#pressTimes.map((press, i) =>
      this.#releaseTimes[i] !== undefined ? this.#releaseTimes[i] - press : 0,
    );

    const pressDiffs = this.#pressTimes.map((press, i) =>
      i > 0 ? press - this.#pressTimes[i - 1]! : 0,
    );
    const releaseDiffs = this.#releaseTimes.map((release, i) =>
      i > 0 ? release - this.#releaseTimes[i - 1]! : 0,
    );

    const features: number[] = [];

    for (let i = 0; i < 13; i++) {
      if (holdTimes[i]) {
        features.push(holdTimes[i]!);
      }
      if (i > 0) {
        if (pressDiffs[i]) {
          features.push(pressDiffs[i]!);
        }
        if (pressDiffs[i]) {
          features.push(releaseDiffs[i]!);
        }
      }
    }

    const tensor = tf.tensor2d([features], [1, 35]);

    return tensor;
  }

  clear(): void {
    this.#pressTimes.length = 0;
    this.#releaseTimes.length = 0;
  }

  length(): number {
    return this.#pressTimes.length + this.#releaseTimes.length;
  }
}
