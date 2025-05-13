export class Queue<T> {
  #queue: T[] = [];

  /**
   * @param [maxSize=100]
   */
  constructor(private readonly maxSize: number = 2000) { }

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
