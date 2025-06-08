import * as tf from "@tensorflow/tfjs";
import mouseScalerConfig from "../models/mouse/mouse_scaler.json";
import keyboardScalerConfig from "../models/keyboard/keyboard_scaler.json";

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

  static async loadModel(
    modelName: "keyboard" | "mouse",
  ): Promise<tf.GraphModel> {
    try {
      const modelUrl = `${this.MODEL_BASE_PATH}/${modelName}/model.json`;

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
      if (modelName === "keyboard") {
        return keyboardScalerConfig as T;
      } else if (modelName === "mouse") {
        return mouseScalerConfig as T;
      } else {
        throw new Error("DUPA");
      }

      const scalerUrl = `${this.MODEL_BASE_PATH}/${modelName}/${modelName}_scaler.json`;
      const response = await fetch(scalerUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response text first to debug
      const responseText = await response.text();
      console.log(
        "Raw scaler response:",
        responseText.substring(0, 200) + "...",
      );

      // Check if response is empty
      if (!responseText.trim()) {
        throw new Error("Scaler file is empty");
      }

      const scalerData = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log(`Scaler ${modelName} loaded successfully`);
      }

      return scalerData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load ${modelName} scaler: ${error.message}`);
      }
      throw error;
    }
  }
}
