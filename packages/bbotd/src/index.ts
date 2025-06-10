import { BotDetector } from "./bot-detector";
import { SimpleLogger } from "./logger";
import "./ui";

(async () => {
  try {
    const globalDetector = new BotDetector();
    await globalDetector.initialize();
    globalDetector.startListening();

    window.bbotd = globalDetector;
    window.SimpleLogger = SimpleLogger;
  } catch (error) {
    console.error("Bot detector auto-initialization failed:", error);
  }
})();
