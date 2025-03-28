import * as tf from "@tensorflow/tfjs";

export class Model {
  #model: tf.LayersModel | tf.GraphModel | undefined;

  constructor(private readonly manifestUrl: string) { }

  async load(): Promise<tf.GraphModel | tf.LayersModel> {
    try {
      this.#model = await tf.loadLayersModel(this.manifestUrl);

      return this.#model;
    } catch (error) {
      throw new Error(`Couldn't load model ${error}`);
    }
  }

  /**
   * @throws {}
   */
  async get(): Promise<tf.LayersModel | tf.GraphModel> {
    if (this.#model !== undefined) {
      return this.#model;
    }

    try {
      this.#model = await tf.loadLayersModel(this.manifestUrl);

      return this.#model;
    } catch (error) {
      throw new Error(`Couldn't load model ${error}`);
    }
  }

  /**
   * @example
   * @throws {}
   */
  predict(input: tf.Tensor | tf.Tensor[]): "bot" | "human" {
    // TODO: change ReturnType
    if (this.#model === undefined) {
      throw new Error("Model is not loaded yet.");
    }

    const prediction = this.#model.predict(input) as tf.Tensor;
    const result = prediction.arraySync();

    tf.dispose([input, prediction]);

    console.log("result", result);

    return Math.random() < 0.9 ? "human" : "bot";
  }
}
