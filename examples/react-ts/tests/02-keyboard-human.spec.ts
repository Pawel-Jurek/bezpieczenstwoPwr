import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const files = [
  "keystroke-data-1749400546677.json",
  "keystroke-data-1749400871513.json",
  "keystroke-data-1749400818431.json",
  "keystroke-data-1749401054801.json",
];

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __dirname = import.meta.dirname;

// Types for the keystroke data
interface KeystrokeData {
  char: string;
  holdTime: number;
  interval: number;
  timestamp: number;
}

interface TypingSession {
  selector: string;
  keystrokes: KeystrokeData[];
  startTime: number;
  endTime?: number;
}

interface HumanTypingData {
  sessions: TypingSession[];
  generatedAt: string;
  description: string;
  usage: string;
}

// Helper function to load human keystroke data
function loadHumanTypingData(filename: string): HumanTypingData {
  const dataPath = path.join(__dirname, "data", filename);
  const rawData = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(rawData);
}

// Enhanced typing function that simulates human behavior from captured data
async function typeWithHumanBehavior(
  page: Page,
  session: TypingSession,
): Promise<void> {
  const element = page.locator(session.selector);
  await element.focus();

  // Wait a bit after focusing (simulating human delay)
  await page.waitForTimeout(100);

  for (const keystroke of session.keystrokes) {
    const { char, holdTime, interval } = keystroke;

    // Skip Tab keys as they're handled separately
    if (char === "Tab") {
      await page.keyboard.press("Tab");
      if (interval > 0) {
        await page.waitForTimeout(interval);
      }
      continue;
    }

    // Handle special keys
    if (["Backspace", "Delete", "Enter"].includes(char)) {
      await page.keyboard.press(char);
      if (interval > 0) {
        await page.waitForTimeout(interval);
      }
      continue;
    }

    // Handle regular characters with human timing
    await page.keyboard.down(char);
    await page.waitForTimeout(holdTime);
    await page.keyboard.up(char);

    // Wait interval before next character
    if (interval > 0) {
      await page.waitForTimeout(interval);
    }
  }
}

// Helper function to check if bot detection is NOT visible
const expectBotNotDetected = async (page: Page) => {
  await expect(page.locator('div:has-text("Bot Detected")')).not.toBeVisible();
};

test.describe("Human Typing Behavior Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your form page
    await page.goto("http://localhost:5173"); // Adjust URL as needed
  });

  test("should not trigger bot detection with human keystroke data", async ({
    page,
  }) => {
    const humanData = loadHumanTypingData(files[0]);

    // Type in each field using human behavior data
    for (const session of humanData.sessions) {
      await typeWithHumanBehavior(page, session);

      // Verify bot detection doesn't trigger after each field
      await expectBotNotDetected(page);
    }

    // Fill email field (if not in captured data)
    const emailFilled = humanData.sessions.some((s) => s.selector === "#email");
    if (!emailFilled) {
      await page.fill("#email", "melody.tristin@example.com");
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Final check - bot should not be detected
    await expectBotNotDetected(page);
  });

  test("should handle multiple human typing sessions", async ({ page }) => {
    const humanData = loadHumanTypingData(files[2]);

    // Process each session separately to simulate real user behavior
    for (const session of humanData.sessions) {
      console.log(
        `Typing in ${session.selector} with ${session.keystrokes.length} keystrokes`,
      );

      await typeWithHumanBehavior(page, session);

      // Add small delay between fields (human-like)
      await page.waitForTimeout(200);

      // Verify no bot detection during typing
      await expectBotNotDetected(page);
    }
  });

  test("should preserve human timing characteristics", async ({ page }) => {
    const humanData = loadHumanTypingData(files[1]);

    for (const session of humanData.sessions) {
      const startTime = Date.now();
      await typeWithHumanBehavior(page, session);
      const endTime = Date.now();

      // Calculate expected duration from human data
      const expectedDuration = session.keystrokes.reduce((total, keystroke) => {
        return total + keystroke.holdTime + keystroke.interval;
      }, 0);

      const actualDuration = endTime - startTime;

      // Allow some tolerance for test execution overhead
      expect(actualDuration).toBeGreaterThanOrEqual(expectedDuration * 0.8);
      expect(actualDuration).toBeLessThanOrEqual(expectedDuration * 1.5);

      await expectBotNotDetected(page);
    }
  });

  // test("should handle backspace and corrections naturally", async ({
  //   page,
  // }) => {
  //   // Simulate typing with corrections
  //   const element = page.locator("#firstname");
  //   await element.focus();
  //
  //   // Type with human-like errors and corrections
  //   await page.keyboard.down("M");
  //   await page.waitForTimeout(52);
  //   await page.keyboard.up("M");
  //   await page.waitForTimeout(83);
  //
  //   await page.keyboard.down("e");
  //   await page.waitForTimeout(69);
  //   await page.keyboard.up("e");
  //   await page.waitForTimeout(79);
  //
  //   await page.keyboard.down("l");
  //   await page.waitForTimeout(46);
  //   await page.keyboard.up("l");
  //   await page.waitForTimeout(114);
  //
  //   // Simulate typo correction
  //   await page.keyboard.press("Backspace");
  //   await page.waitForTimeout(200);
  //
  //   await page.keyboard.down("l");
  //   await page.waitForTimeout(46);
  //   await page.keyboard.up("l");
  //   await page.waitForTimeout(106);
  //
  //   await page.keyboard.down("o");
  //   await page.waitForTimeout(46);
  //   await page.keyboard.up("o");
  //
  //   await expectBotNotDetected(page);
  // });

  test("should work with different human typing speeds", async ({ page }) => {
    // Test with faster typing data (if available)
    const humanData = loadHumanTypingData(files[0]);

    // Modify timing to simulate faster typing
    const fasterSessions = humanData.sessions.map((session) => ({
      ...session,
      keystrokes: session.keystrokes.map((keystroke) => ({
        ...keystroke,
        holdTime: Math.max(10, keystroke.holdTime * 0.5),
        interval: Math.max(5, keystroke.interval * 0.5),
      })),
    }));

    for (const session of fasterSessions) {
      await typeWithHumanBehavior(page, session);
      await expectBotNotDetected(page);
    }
  });

  test("should handle pauses and hesitations", async ({ page }) => {
    const humanData = loadHumanTypingData(files[1]);

    for (const session of humanData.sessions) {
      await page.locator(session.selector).focus();

      // Add random pauses to simulate thinking/hesitation
      for (let i = 0; i < session.keystrokes.length; i++) {
        const keystroke = session.keystrokes[i];

        // Add pause every few characters
        if (i > 0 && i % 3 === 0) {
          await page.waitForTimeout(Math.random() * 500 + 200);
        }

        if (keystroke.char !== "Tab") {
          await page.keyboard.down(keystroke.char);
          await page.waitForTimeout(keystroke.holdTime);
          await page.keyboard.up(keystroke.char);
          await page.waitForTimeout(keystroke.interval);
        }
      }

      await expectBotNotDetected(page);
    }
  });
});

test.describe("Bot Detection Validation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });
});
