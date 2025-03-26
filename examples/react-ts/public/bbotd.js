var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { debounce } from "./utils/debounce.js";
// check if script is being run in the browser
if (globalThis.window === undefined) {
    throw new Error("Bot detection installed in non-browser environment. Disabling.");
}
const MIN_QUEUE_SIZE = 50;
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
 */
const buttonMap = {
    "0": "Left",
    "2": "Right",
};
const stateMap = {
    mousemove: "Move",
    mousedown: "Pressed",
    mouseup: "Released",
};
// TODO: change to real function, I currently assume it takes 250ms to check data with model
// and assume "human" in 9 out of 10 calls
function _simulatedRunCheck(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(() => {
            resolve({ type: Math.random() > 0.9 ? "human" : "bot" });
        }, 250));
    });
}
(function () {
    let isButtonDown = false;
    const queue = [];
    const testOverlay = createTestOverlay();
    const fn = debounce((data) => __awaiter(this, void 0, void 0, function* () {
        const res = yield _simulatedRunCheck(data);
        console.log(`You're ${res.type}`);
        if (res.type === "bot") {
            testOverlay.style.display = "unset";
        }
        data.length = 0;
    }), 1000);
    const callback = (mouseEvent) => {
        var _a;
        const _state = stateMap[mouseEvent.type];
        // if Event.type doesn't map to our data type, don't include the event
        if (_state === undefined) {
            return;
        }
        const data = {
            timestamp: Date.now(),
            button: isButtonDown
                ? (_a = buttonMap[mouseEvent.button]) !== null && _a !== void 0 ? _a : "NoButton"
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
function createTestOverlay() {
    const testOverlay = document.createElement("div");
    const styles = {
        display: "none",
        position: "fixed",
        inset: "0",
        backgroundColor: "red",
    };
    Object.assign(testOverlay.style, styles);
    document.body.appendChild(testOverlay);
    return testOverlay;
}
//# sourceMappingURL=index.js.map