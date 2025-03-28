import { Model } from "../../lib/tfjs";
import * as tf from "@tensorflow/tfjs";

describe("@tensorflow/tfjs integration", () => {
  const LOCAL_MODEL_URL = "http://localhost:3000/models/tfjs_model/model.json";

  it("should load model from local manifest", async () => {
    const model = new Model(LOCAL_MODEL_URL);

    await expect(model.load()).resolves.toBeDefined();

    const dummyInput = tf.tensor2d([[1, 2, 3]]);
    const result = model.predict(dummyInput);

    expect(result).toMatch(/bot|human/);
  });

  it("should handle missing model", async () => {
    const model = new Model("http://localhost:3000/missing/model.json");
    await expect(model.load()).rejects.toThrow();
  });
});
