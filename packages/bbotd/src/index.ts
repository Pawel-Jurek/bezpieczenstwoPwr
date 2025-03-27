import { debounce } from "./utils/debounce";
import type { ButtonType, State, DataRecord } from "./types";
import * as tf from "@tensorflow/tfjs";

// check if script is being run in the browser
if (globalThis.window === undefined) {
  throw new Error(
    "Bot detection installed in non-browser environment. Disabling.",
  );
}

const MIN_QUEUE_SIZE = 50;

let model: tf.LayersModel | undefined;

const MODEL_BASE_URL = "/models/tfjs_mouse_user_model";
const MODEL_MANIFEST_URL = `${MODEL_BASE_URL}/model.json`;

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
 */
const buttonMap = new Map<number, ButtonType>([
  [0, "Left"],
  [2, "Right"],
]);

const stateMap: Record<string, State> = {
  mousemove: "Move",
  mousedown: "Pressed",
  mouseup: "Released",
};

function processData(records: DataRecord[]): tf.Tensor {
  return tf.tensor2d(
    records.map((record) => record.toTensorLike()),
    [1, records.length],
  );
}

async function _simulatedRunCheck(
  data: DataRecord[],
): Promise<{ type: "bot" | "human" }> {
  try {
    if (!model) {
      model = await tf.loadLayersModel(MODEL_MANIFEST_URL, {
        onProgress: (progress) => {
          console.log(`Model loading progress: ${Math.round(progress * 100)}%`);
        },
      });
      console.log("Model loaded successfully");
    }

    const input = processData(data);
    const prediction = model.predict(input) as tf.Tensor;
    const result = prediction.arraySync();

    console.log("Raw prediction result: ", result);

    tf.dispose([input, prediction]);

    return {
      type: Math.random() < 0.9 ? "human" : "bot",
    };
  } catch (error) {
    console.error("Error during model operation: ", error);
    // fallback mechanism
    return {
      type: "bot",
    };
  }
}

(function() {
  let isButtonDown: boolean = false;
  const queue: DataRecord[] = [];

  const testOverlay = createTestOverlay();

  const fn = debounce(async (data: DataRecord[]) => {
    const res = await _simulatedRunCheck(data);

    console.log(`You're ${res.type}`);
    if (res.type === "bot") {
      testOverlay.style.display = "unset";
    }
    data.length = 0;
  }, 1000);

  const callback = (mouseEvent: MouseEvent): void => {
    const _state = stateMap[mouseEvent.type];

    // if Event.type doesn't map to our data type, don't include the event
    if (_state === undefined) {
      return;
    }

    const data: DataRecord = {
      timestamp: Date.now(),
      button: isButtonDown
        ? (buttonMap.get(mouseEvent.button) ?? "NoButton")
        : "NoButton",
      state: _state,
      x: mouseEvent.x,
      y: mouseEvent.y,
      toTensorLike() {
        return [
          this.timestamp,
          this.button === "Left" ? 1 : 0, // TODO: change that
          this.state === "Drag" ? 1 : 0, // TODO: change that
          this.x,
          this.y,
        ];
      },
    };

    if (queue.length > MIN_QUEUE_SIZE) {
      queue.length = 0;
    }

    queue.push(data);

    fn(queue);
  };

  window.addEventListener("mousemove", callback);
  window.addEventListener("mousedown", (e) => {
    isButtonDown = true;
    callback(e);
  });
  window.addEventListener("mouseup", (e) => {
    callback(e);
    isButtonDown = false;
  });
})();

function createTestOverlay(): HTMLDivElement {
  const testOverlay = document.createElement("div");
  const styles: Partial<CSSStyleDeclaration> = {
    display: "none",
    position: "fixed",
    inset: "0",
    backgroundColor: "red",
  };

  Object.assign(testOverlay.style, styles);

  document.body.appendChild(testOverlay);

  return testOverlay;
}
