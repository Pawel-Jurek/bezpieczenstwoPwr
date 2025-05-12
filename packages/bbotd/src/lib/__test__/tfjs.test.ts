import { Model } from "../../lib/tfjs";
import * as tf from "@tensorflow/tfjs";

describe("@tensorflow/tfjs integration", () => {
  const LOCAL_MODEL_NAME = "mouse";

  it("should load mouse model from local manifest", async () => {
    const model = new Model(LOCAL_MODEL_NAME);

    const m = (await model.load()) as tf.GraphModel;
    expect(m).toBeDefined();

    const dummyInput = tf.randomNormal([1, 75, 4]);

    const result = await m.executeAsync(dummyInput);

    expect(result).toBeInstanceOf(tf.Tensor);
  });

  it("should handle missing model", async () => {
    const model = new Model(LOCAL_MODEL_NAME);
    await expect(model.load()).rejects.toThrow();
  });
});
