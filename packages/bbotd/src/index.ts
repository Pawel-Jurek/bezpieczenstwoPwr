// import { App } from "./app";
//
// const app = new App();
//
// app.init();
//
import { BotDetector } from "./bot-detector";

export { BotDetector };

if (typeof window !== "undefined") {
  (window as any).bbotd = { BotDetector };
}
