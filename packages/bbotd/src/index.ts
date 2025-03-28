import { Model } from "./lib/tfjs";
import { Data } from "./utils/data";

// check if script is being run in the browser
if (globalThis.window === undefined) {
  throw new Error(
    "Bot detection installed in non-browser environment. Disabling.",
  );
}

const model = new Model("/models/model.json");
model.load();

new Data();
