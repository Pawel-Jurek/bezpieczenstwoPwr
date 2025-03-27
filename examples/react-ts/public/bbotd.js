(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@tensorflow/tfjs')) :
    typeof define === 'function' && define.amd ? define(['@tensorflow/tfjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tf));
})(this, (function (tf) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var tf__namespace = /*#__PURE__*/_interopNamespace(tf);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    }
    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const debounce = (callback, delay) => {
      let timeoutTimer;
      return (...args) => {
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(() => {
          callback(...args);
        }, delay);
      };
    };

    // check if script is being run in the browser
    if (globalThis.window === undefined) {
      throw new Error("Bot detection installed in non-browser environment. Disabling.");
    }
    const MIN_QUEUE_SIZE = 50;
    let model;
    const MODEL_BASE_URL = "/models/tfjs_mouse_user_model";
    const MODEL_MANIFEST_URL = `${MODEL_BASE_URL}/model.json`;
    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button} for explanation on numbers representing buttons
     */
    const buttonMap = new Map([[0, "Left"], [2, "Right"]]);
    const stateMap = {
      mousemove: "Move",
      mousedown: "Pressed",
      mouseup: "Released"
    };
    function processData(records) {
      return tf__namespace.tensor2d(records.map(record => record.toTensorLike()), [1, records.length]);
    }
    function _simulatedRunCheck(data) {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          if (!model) {
            model = yield tf__namespace.loadLayersModel(MODEL_MANIFEST_URL, {
              onProgress: progress => {
                console.log(`Model loading progress: ${Math.round(progress * 100)}%`);
              }
            });
            console.log("Model loaded successfully");
          }
          const input = processData(data);
          const prediction = model.predict(input);
          const result = prediction.arraySync();
          console.log("Raw prediction result: ", result);
          tf__namespace.dispose([input, prediction]);
          return {
            type: Math.random() < 0.9 ? "human" : "bot"
          };
        } catch (error) {
          console.error("Error during model operation: ", error);
          // fallback mechanism
          return {
            type: "bot"
          };
        }
      });
    }
    (function () {
      let isButtonDown = false;
      const queue = [];
      const testOverlay = createTestOverlay();
      const fn = debounce(data => __awaiter(this, void 0, void 0, function* () {
        const res = yield _simulatedRunCheck(data);
        console.log(`You're ${res.type}`);
        if (res.type === "bot") {
          testOverlay.style.display = "unset";
        }
        data.length = 0;
      }), 1000);
      const callback = mouseEvent => {
        var _a;
        const _state = stateMap[mouseEvent.type];
        // if Event.type doesn't map to our data type, don't include the event
        if (_state === undefined) {
          return;
        }
        const data = {
          timestamp: Date.now(),
          button: isButtonDown ? (_a = buttonMap.get(mouseEvent.button)) !== null && _a !== void 0 ? _a : "NoButton" : "NoButton",
          state: _state,
          x: mouseEvent.x,
          y: mouseEvent.y,
          toTensorLike() {
            return [this.timestamp, this.button === "Left" ? 1 : 0,
            // TODO: change that
            this.state === "Drag" ? 1 : 0,
            // TODO: change that
            this.x, this.y];
          }
        };
        if (queue.length > MIN_QUEUE_SIZE) {
          queue.length = 0;
        }
        queue.push(data);
        fn(queue);
      };
      window.addEventListener("mousemove", callback);
      window.addEventListener("mousedown", e => {
        isButtonDown = true;
        callback(e);
      });
      window.addEventListener("mouseup", e => {
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
        backgroundColor: "red"
      };
      Object.assign(testOverlay.style, styles);
      document.body.appendChild(testOverlay);
      return testOverlay;
    }

}));
