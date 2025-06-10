import * as tf from "@tensorflow/tfjs";

export interface ScalerData {
  min_: number[];
  scale_: number[];
  data_min_: number[];
  data_max_: number[];
  data_range_?: number[];
  feature_range: [number, number];
  n_features_in_: number;
  feature_names_in_?: string[];
}

export class ModelLoader {
  private static readonly MODEL_BASE_PATH = "./models";

  private static getAssetUrl(filename: string): string {
    const baseUrl = new URL("../assets/", import.meta.url);
    const assetUrl = new URL(filename, baseUrl);
    return assetUrl.href;
  }

  private static async loadAssetAsText(filename: string): Promise<string> {
    const url = this.getAssetUrl(filename);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load asset: ${filename}`);
    }
    return response.text();
  }

  private static async loadAssetAsJson<T>(filename: string): Promise<T> {
    const text = await this.loadAssetAsText(filename);
    return JSON.parse(text) as T;
  }

  static async loadModel(
    modelName: "keyboard" | "mouse"
  ): Promise<tf.GraphModel> {
    try {
      const modelUrl = this.getAssetUrl(`${modelName}/model.json`);
      const model = await tf.loadGraphModel(modelUrl);

      if (process.env.NODE_ENV === "development") {
        console.info(`Model ${modelName} loaded successfully.`);
      }

      return model;
    } catch (error) {
      console.error(`Detailed error loading ${modelName} model:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to load ${modelName} model: ${error.message}`);
      }
      throw error;
    }
  }

  static async loadScaler<T>(modelName: "keyboard" | "mouse"): Promise<T> {
    try {
      const filename = `${modelName}/${modelName}_scaler.json`;
      return await this.loadAssetAsJson<T>(filename);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
