import { KeyboardDetector } from "./detection/keyboard";
import { MouseDetector } from "./detection/mouse";

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  source: "keyboard" | "mouse" | "combined";
  timestamp: number;
}

interface BotDetectorConfig {
  checkInterval?: number; // milliseconds between checks
  minKeyboardEvents?: number; // minimum keyboard events before checking
  minMouseEvents?: number; // minimum mouse events before checking
  onBotDetected?: (result: BotDetectionResult) => void;
  onProbabilityUpdate?: (
    keyboard: number,
    mouse: number,
    combined: number
  ) => void;
  enablePeriodicChecking?: boolean;
  enableEventThresholdChecking?: boolean;
}

class BotDetector {
  private keyboardDetector = new KeyboardDetector();
  private mouseDetector = new MouseDetector();
  // private periodicCheckInterval?: NodeJS.Timeout;
  // private config: Required<BotDetectorConfig>;

  constructor() {
    // this.config = DEFAULT_CONFIG;
    // Set up event callbacks for threshold-based checking
    // this.keyboardDetector.setEventCallback(() => {
    //   this.keyboardEventCount++;
    //   if (
    //     this.config.enableEventThresholdChecking &&
    //     this.keyboardEventCount >= this.config.minKeyboardEvents
    //   ) {
    //     this.checkForBots("keyboard");
    //     this.keyboardEventCount = 0; // Reset counter
    //   }
    // });
    // this.mouseDetector.setEventCallback(() => {
    //   this.mouseEventCount++;
    //   if (
    //     this.config.enableEventThresholdChecking &&
    //     this.mouseEventCount >= this.config.minMouseEvents
    //   ) {
    //     this.checkForBots("mouse");
    //     this.mouseEventCount = 0; // Reset counter
    //   }
    // });
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.keyboardDetector.initialize(),
      this.mouseDetector.initialize(),
    ]);
  }

  startListening(): void {
    this.keyboardDetector.startListening();
    this.mouseDetector.startListening();
  }

  stopListening(): void {
    this.keyboardDetector.stopListening();
    this.mouseDetector.stopListening();
  }

  async detectKeyboardBot(): Promise<number> {
    return this.keyboardDetector.detectBot();
  }

  async detectMouseBot(): Promise<number> {
    return this.mouseDetector.detectBot();
  }

  async getKeyboardBotProbability(): Promise<number> {
    return this.keyboardDetector.getBotProbability();
  }

  async getMouseBotProbability(): Promise<number> {
    return this.mouseDetector.getBotProbability();
  }

  async detectBot(): Promise<boolean> {
    const [isKeyboardBot, isMouseBot] = await Promise.all([
      this.detectKeyboardBot(),
      this.detectMouseBot(),
    ]);

    // FIXME: XD
    return Boolean(isKeyboardBot || isMouseBot);
  }

  async getBotProbability(): Promise<number> {
    const [keyboardProb, mouseProb] = await Promise.all([
      this.getKeyboardBotProbability(),
      this.getMouseBotProbability(),
    ]);

    return (keyboardProb + mouseProb) / 2;
  }

  getKeyboardEvents() {
    return this.keyboardDetector.getCurrentEvents();
  }
  getMouseEvents() {
    return this.mouseDetector.getCurrentEvents();
  }
}

export { BotDetector, KeyboardDetector, MouseDetector };
