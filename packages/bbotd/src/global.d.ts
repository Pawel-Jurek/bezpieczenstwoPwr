import type { BotDetector } from "./bot-detector";

declare global {
  interface Window {
    bbotd?: {
      BotDetector: typeof BotDetector;
    };
  }
}

export { };
