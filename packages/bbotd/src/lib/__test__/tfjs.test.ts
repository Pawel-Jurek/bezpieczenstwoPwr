import { Model } from "../../lib/tfjs";
import * as tf from "@tensorflow/tfjs";

describe("@tensorflow/tfjs integration", () => {
  const LOCAL_MODEL_URL = "http://localhost:3000/models/tfjs_model/model.json";

  it("should load model from local manifest", async () => {
    const model = new Model(LOCAL_MODEL_URL);

    const m = (await model.load()) as tf.GraphModel;
    expect(m).toBeDefined();

    const dummyInput = tf.randomNormal([1, 75, 4]);

    const result = await m.executeAsync(dummyInput);

    expect(result).toBeInstanceOf(tf.Tensor);
  });

  it("should handle missing model", async () => {
    const model = new Model("http://localhost:3000/missing/model.json");
    await expect(model.load()).rejects.toThrow();
  });
});
