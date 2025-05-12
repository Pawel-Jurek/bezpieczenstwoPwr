import { Model } from "./lib/tfjs";
import { Data } from "./utils/data";
import { KeyboardData } from "./utils/keyboardData";

import { throttleDebounce } from "./utils/debounce";

const processMouseData = async (data: Data, model: Model) => {
  console.log("call mouse process");

  try {
    const len = data.length();

    console.log("length", len);

    if (len < 5) return;

    const tensor = data.toTensor();

    const result = await model.predict(tensor);

    console.log(
      "(mouse) Prediction:",
      result > 0.5 ? "bot" : "human",
      " | ",
      result,
    );

    // Clear queue after processing to avoid duplicate predictions
    data.clear();
  } catch (error) {
    console.error("Prediction error: ", error);
  }
};

const processKeyboardData = async (data: KeyboardData, model: Model) => {
  console.log("call keyboard process");
  try {
    const len = data.length();

    console.log("k len", len);

    if (len < 26) return;

    const tensor = data.toTensor();

    const result = await model.predict(tensor);

    console.log("(keyboard) Prediction: ", result > 0.5 ? "bot" : "human");
    data.clear();
  } catch (error) {
    console.error("prediction error: ", error);
  }
};

export class App {
  private mouseModel: Model;
  private keyboardModel: Model;
  private mouseData: Data;
  private keyboardData: KeyboardData;

  // private isProcessing: boolean = false;

  constructor(private readonly target: EventTarget = window) {
    this.mouseModel = new Model("mouse");
    this.keyboardModel = new Model("keyboard");
    this.mouseData = new Data(this.target);
    this.keyboardData = new KeyboardData(this.target);
  }

  async init() {
    console.log("Loading mouse model...");
    await this.mouseModel.load();
    console.log("mouse model loaded successfully");

    console.log("Loading keyboard model...");
    await this.keyboardModel.load();
    console.log("keyboard model loaded successfully");

    this.startTracking();
  }

  startTracking() {
    const fn = throttleDebounce(processMouseData);
    this.mouseData.addListeners(() => {
      fn(this.mouseData, this.mouseModel);
    });

    const fn2 = throttleDebounce(processKeyboardData);

    this.keyboardData.addListeners(() => {
      fn2(this.keyboardData, this.keyboardModel);
    });
  }

  // async processData() {
  //   if (this.isProcessing) return;
  //
  //   try {
  //     const len = this.data.length();
  //     if (len < 100) return;
  //
  //     this.isProcessing = true;
  //     const tensor = this.data.toTensor();
  //
  //     const result = await this.model.predict(tensor);
  //
  //     console.log(
  //       "Prediction:",
  //       result > 0.5 ? "bot" : "human",
  //       `${(result * 100.0).toFixed(2)}%`,
  //     );
  //
  //     // Clear queue after processing to avoid duplicate predictions
  //     this.data.clear();
  //   } catch (error) {
  //     console.error("Prediction error:", error);
  //   } finally {
  //     this.isProcessing = false;
  //   }
  // }

  stopTracking() {
    this.mouseData.removeListeners();
    this.keyboardData.removeListeners();
  }
}
