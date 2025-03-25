import * as tf from "@tensorflow/tfjs";

export class Model {
  #model: tf.GraphModel | undefined;

  constructor(private readonly manifestUrl: string) {
    // FIXME: my browser couldn't load webgl, ideally we'd want to use webgl and fallback to 'cpu'
    tf.setBackend("cpu");
  }

  /**
   * @throws {}
   */
  async load(): Promise<tf.LayersModel | tf.GraphModel> {
    if (this.#model !== undefined) {
      return this.#model;
    }

    this.#model = await tf.loadGraphModel(this.manifestUrl);

    return this.#model;
  }

  /**
   * Returns probability of behavior being bot
   * @example
   * @throws {}
   */
  async predict(input: tf.Tensor): Promise<number> {
    if (this.#model === undefined) {
      throw new Error("Model is not loaded yet.");
    }

    const prediction = (await this.#model.executeAsync(input)) as tf.Tensor;

    const result = (await prediction.array()) as number[][];

    tf.dispose([input, prediction]);

    console.log(result[0]);

    const predictionValue = result[0]?.[0];

    if (!predictionValue) {
      throw new Error("No prediction value somehow");
    }

    return predictionValue;
  }
}
