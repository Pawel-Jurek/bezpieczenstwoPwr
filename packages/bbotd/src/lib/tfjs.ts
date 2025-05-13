import * as tf from "@tensorflow/tfjs";

export class Model {
  #model: tf.GraphModel | undefined;

  constructor(private readonly manifestName: "mouse" | "keyboard") {
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

    const modelUrl = `/models/${this.manifestName}/model.json`;
    this.#model = await tf.loadGraphModel(modelUrl);

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

    const prediction = this.#model.execute(input) as tf.Tensor;

    const result = await prediction.data();

    // console.log("result", JSON.stringify(result));

    tf.dispose([input, prediction]);

    // const predictionValue = result[0]?.[0];
    const predictionValue = result.at(0);

    if (predictionValue === undefined) {
      throw new Error("No prediction value somehow");
    }

    return predictionValue;
  }
}
