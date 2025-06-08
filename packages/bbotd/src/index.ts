import { BotDetector } from "./bot-detector";
import "./ui";

(async () => {
  try {
    const globalDetector = new BotDetector();
    await globalDetector.initialize();
    globalDetector.startListening();

    window.bbotd = globalDetector;
  } catch (error) {
    console.error("Bot detector auto-initialization failed:", error);
  }
})();
