import { debounce } from "./utils/debounce.js";

// check if script is being run in the browser
if (globalThis.window === undefined) {
  throw new Error(
    "Bot detection installed in non-browser environment. Disabling."
  );
}

type ButtonType = "NoButton" | "Left" | "Right";
type State = "Pressed" | "Released" | "Move" | "Drag";

const MIN_QUEUE_SIZE = 50;

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
 */
const buttonMap: Record<number, ButtonType> = {
  "0": "Left",
  "2": "Right",
};

const stateMap: Record<string, State> = {
  mousemove: "Move",
  mousedown: "Pressed",
  mouseup: "Released",
};

type DataRecord = {
  timestamp: number;
  button: ButtonType;
  state: State;
  x: number;
  y: number;
} & Pick<Object, "toString">;

// TODO: change to real function, I currently assume it takes 250ms to check data with model
// and assume "human" in 9 out of 10 calls
async function _simulatedRunCheck(
  data: DataRecord[]
): Promise<{ type: "bot" | "human" }> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({ type: Math.random() > 0.9 ? "human" : "bot" });
    }, 250)
  );
}

(function () {
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
        ? buttonMap[mouseEvent.button] ?? "NoButton"
        : "NoButton",
      state: _state,
      x: mouseEvent.x,
      y: mouseEvent.y,
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
