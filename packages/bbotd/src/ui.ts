// // Add this interface for the custom event
export interface BotDetectedEventDetail {
  source: "keyboard" | "mouse" | "combined";
  confidence: number;
  timestamp: number;
}

declare global {
  interface WindowEventMap {
    botDetected: CustomEvent<BotDetectedEventDetail>;
  }
}

// Simple bot detection UI handler
export class BotDetectionUI {
  private blockingElement: HTMLDivElement | null = null;

  constructor() {
    this.setupEventListener();
  }

  private setupEventListener(): void {
    window.addEventListener(
      "botDetected",
      (event: CustomEvent<BotDetectedEventDetail>) => {
        console.warn("Bot detected:", event.detail);
        this.showBotDetectedScreen();
      }
    );
  }

  private showBotDetectedScreen(): void {
    // Prevent multiple overlays
    if (this.blockingElement) return;

    this.blockingElement = document.createElement("div");
    this.blockingElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      font-size: 24px;
      z-index: 999999;
      pointer-events: all;
    `;

    this.blockingElement.textContent = "Bot Detected";
    document.body.appendChild(this.blockingElement);
  }

  // Optional: method to manually hide (for testing/debugging)
  hideBotDetectedScreen(): void {
    if (this.blockingElement) {
      document.body.removeChild(this.blockingElement);
      this.blockingElement = null;
    }
  }
}

// Usage example:
// Initialize the UI handler
export const botUI = new BotDetectionUI();
//
// // Initialize and start your bot detector
// const detector = new BotDetector();
// detector.initialize().then(() => {
//   detector.startListening();
//   console.log("Bot detection started");
// });

// The event will automatically trigger the UI when a bot is detected
