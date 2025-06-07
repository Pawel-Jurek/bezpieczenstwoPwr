import * as tf from "@tensorflow/tfjs";

export class ModelLoader {
  private static readonly MODEL_BASE_PATH = "./models";

  static async loadModel(
    modelName: "keyboard" | "mouse",
  ): Promise<tf.GraphModel> {
    try {
      const modelUrl = `${this.MODEL_BASE_PATH}/${modelName}/model.json`;
      const model = await tf.loadGraphModel(modelUrl);
      return model;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load ${modelName} model: ${error.message}`);
      }
      throw error;
    }
  }
}
