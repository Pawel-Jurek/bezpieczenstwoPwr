import type { BotDetector } from "./bot-detector";
import type { SimpleLogger } from "./logger";

declare global {
  interface Window {
    bbotd?: BotDetector;
    SimpleLogger: SimpleLogger;
  }
}

export { };
