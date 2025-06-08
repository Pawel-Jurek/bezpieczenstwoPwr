import type { BotDetector } from "./bot-detector";

declare global {
  interface Window {
    bbotd?: BotDetector;
  }
}

export {};
