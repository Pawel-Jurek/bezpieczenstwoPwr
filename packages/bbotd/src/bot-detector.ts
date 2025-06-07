import * as tf from "@tensorflow/tfjs";
import { ModelLoader } from "./lib/model-loader";

class BotDetector {
  private keyboardModel?: tf.GraphModel<string | tf.io.IOHandler>;
  private mouseModel?: tf.GraphModel<string | tf.io.IOHandler>;

  async initialize(): Promise<void> {
    const [keyboardModel, mouseModel] = await Promise.all([
      ModelLoader.loadModel("keyboard"),
      ModelLoader.loadModel("mouse"),
    ]);

    this.keyboardModel = keyboardModel;
    this.mouseModel = mouseModel;
  }

  detectBot(data: unknown) {
    return 0.5;
  }
}

export { BotDetector };
