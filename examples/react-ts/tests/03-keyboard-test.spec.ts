import { test, expect, Page } from "@playwright/test";
import { BOT_MODES } from "./utils/bot";
import { TypingMode } from "./utils/bot";
import { normalRandom, uniformRandom } from "./utils/rand";

function generateTiming(
  config: TypingMode["holdTime"] | TypingMode["interval"],
): number {
  if (config.stdDev !== undefined) {
    return Math.max(0, normalRandom(config.mean, config.stdDev));
  } else if (config.range) {
    return config.mean + uniformRandom(config.range[0], config.range[1]);
  }
  return config.mean;
}

// Get the paragraph text that needs to be typed
async function getParagraphText(page: Page): Promise<string> {
  const paragraphElement = page.locator(".typing-text p");
  await expect(paragraphElement).toBeVisible();

  // Get text content from all spans within the paragraph
  const spans = paragraphElement.locator("span");
  const spanCount = await spans.count();

  let text = "";
  for (let i = 0; i < spanCount; i++) {
    const spanText = await spans.nth(i).textContent();
    text += spanText || "";
  }

  return text;
}

// Custom typing function that simulates bot behavior for typing test
async function typeWithBotBehavior(
  page: Page,
  text: string,
  mode: TypingMode,
): Promise<void> {
  const inputField = page.locator(".input-field");
  await inputField.focus();

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const holdTime = generateTiming(mode.holdTime);
    const interval = generateTiming(mode.interval);

    // Press key down
    await page.keyboard.down(char);

    // Hold for calculated time
    await page.waitForTimeout(holdTime);

    // Release key
    await page.keyboard.up(char);

    // Wait interval before next character
    if (interval > 0 && i < text.length - 1) {
      await page.waitForTimeout(interval);
    }

    // Check if bot detection overlay appears (if implemented)
    const botDetected = await page
      .locator('div:has-text("Bot Detected")')
      .isVisible()
      .catch(() => false);
    if (botDetected) {
      console.log(`Bot detected after typing ${i + 1} characters`);
      break;
    }
  }
}

// Helper function to check if bot detection overlay is visible
const botOverlayVisible = async (page: Page): Promise<boolean> => {
  try {
    await expect(page.locator('div:has-text("Bot Detected")')).toBeVisible({
      timeout: 1000,
    });
    return true;
  } catch {
    return false;
  }
};

// Helper function to get typing stats
async function getTypingStats(page: Page) {
  const wpm = await page.locator(".wpm span").textContent();
  const cpm = await page.locator(".cpm span").textContent();
  const mistakes = await page.locator(".mistake span").textContent();
  const timeLeft = await page.locator(".time span b").textContent();

  return {
    wpm: parseInt(wpm || "0"),
    cpm: parseInt(cpm || "0"),
    mistakes: parseInt(mistakes || "0"),
    timeLeft: parseInt(timeLeft || "60"),
  };
}

// Test suite for each bot mode
BOT_MODES.forEach((mode) => {
  test.describe(`Typing Speed Test - ${mode.name} mode`, () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to your typing test page
      await page.goto(
        "https://pawel-jurek.github.io/bezpieczenstwoPwr/typing-test",
      ); // Adjust URL as needed

      // Wait for page to load and paragraph to be generated
      await expect(page.locator(".typing-text p")).toBeVisible();
      await expect(page.locator(".input-field")).toBeVisible();
    });

    test(`should complete typing test with ${mode.name} behavior`, async ({
      page,
    }) => {
      // Get the paragraph text to type
      const paragraphText = await getParagraphText(page);
      console.log(`Paragraph length: ${paragraphText.length} characters`);

      // Get initial stats
      const initialStats = await getTypingStats(page);
      expect(initialStats.wpm).toBe(0);
      expect(initialStats.cpm).toBe(0);
      expect(initialStats.mistakes).toBe(0);
      expect(initialStats.timeLeft).toBe(60);

      // Start typing with bot behavior
      const startTime = Date.now();
      await typeWithBotBehavior(page, paragraphText, mode);
      const endTime = Date.now();

      console.log(`Typing completed in ${endTime - startTime}ms`);

      // Get final stats
      const finalStats = await getTypingStats(page);
      console.log(`Final stats for ${mode.name}:`, finalStats);

      // Verify that typing progressed
      expect(finalStats.cpm).toBeGreaterThan(0);

      // Check if bot detection was triggered
      const botDetected = await botOverlayVisible(page);
      if (botDetected) {
        console.log(`✓ Bot detection triggered for ${mode.name} mode`);
      } else {
        console.log(`✗ Bot detection NOT triggered for ${mode.name} mode`);
      }
    });

    test(`should track WPM and CPM accurately with ${mode.name} typing`, async ({
      page,
    }) => {
      const paragraphText = await getParagraphText(page);

      // Type first portion of text (about 25% to see progress)
      const partialText = paragraphText.substring(
        0,
        Math.floor(paragraphText.length * 0.25),
      );
      await typeWithBotBehavior(page, partialText, mode);

      // Wait a moment for calculations to update
      await page.waitForTimeout(1000);

      const stats = await getTypingStats(page);

      // Verify stats are reasonable
      expect(stats.cpm).toBeGreaterThan(0);
      expect(stats.wpm).toBeGreaterThanOrEqual(0);
      expect(stats.timeLeft).toBeLessThan(60);

      console.log(`Partial typing stats for ${mode.name}:`, stats);
    });

    test(`should handle mistakes correctly with ${mode.name} typing`, async ({
      page,
    }) => {
      const paragraphText = await getParagraphText(page);

      // Intentionally type wrong characters for first few positions
      const inputField = page.locator(".input-field");
      await inputField.focus();

      // Type a few wrong characters
      await page.keyboard.type("zzz");
      await page.waitForTimeout(500);

      // Check that mistakes are counted
      const statsWithMistakes = await getTypingStats(page);
      expect(statsWithMistakes.mistakes).toBeGreaterThan(0);

      console.log(
        `Mistakes counted correctly for ${mode.name}:`,
        statsWithMistakes.mistakes,
      );
    });

    test(`should handle backspace correctly with ${mode.name} behavior`, async ({
      page,
    }) => {
      const paragraphText = await getParagraphText(page);

      // Type some characters
      const inputField = page.locator(".input-field");
      await inputField.focus();

      // Type first 10 characters
      const firstChars = paragraphText.substring(0, 10);
      await typeWithBotBehavior(page, firstChars, mode);

      // Backspace a few characters
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");

      await page.waitForTimeout(500);

      // Continue typing
      const remainingChars = paragraphText.substring(7, 20);
      await typeWithBotBehavior(page, remainingChars, mode);

      const stats = await getTypingStats(page);
      console.log(`Stats after backspace handling for ${mode.name}:`, stats);

      // Verify typing still works after backspace
      expect(stats.cpm).toBeGreaterThan(0);
    });
  });
});

// Test to verify bot detection triggers for different modes
// test.describe("Bot Detection Verification", () => {
//   BOT_MODES.forEach((mode) => {
//     test(`should test bot detection for ${mode.name} mode`, async ({
//       page,
//     }) => {
//       await page.goto(
//         "https://pawel-jurek.github.io/bezpieczenstwoPwr/typing-test",
//       );
//
//       const paragraphText = await getParagraphText(page);
//
//       // Type with bot behavior
//       await typeWithBotBehavior(page, paragraphText.substring(0, 50), mode);
//
//       // Check if bot detection triggered
//       const botDetected = await botOverlayVisible(page);
//
//       if (botDetected) {
//         console.log(`✓ Bot detection triggered for ${mode.name} mode`);
//       } else {
//         console.log(`✗ Bot detection NOT triggered for ${mode.name} mode`);
//       }
//
//       // Get final stats regardless of bot detection
//       const finalStats = await getTypingStats(page);
//       console.log(`Final stats for ${mode.name}:`, finalStats);
//     });
//   });
// });

// Test timer functionality
test.describe("Timer Functionality", () => {
  test("should start timer when typing begins", async ({ page }) => {
    await page.goto(
      "https://pawel-jurek.github.io/bezpieczenstwoPwr/typing-test",
    );

    const paragraphText = await getParagraphText(page);

    // Get initial time
    const initialStats = await getTypingStats(page);
    expect(initialStats.timeLeft).toBe(60);

    // Start typing
    await typeWithBotBehavior(
      page,
      paragraphText.substring(0, 5),
      BOT_MODES[0],
    );

    // Wait a bit for timer to tick
    await page.waitForTimeout(2000);

    // Check that timer has started
    const statsAfterTyping = await getTypingStats(page);
    expect(statsAfterTyping.timeLeft).toBeLessThan(60);

    console.log(
      `Timer started: ${60 - statsAfterTyping.timeLeft} seconds elapsed`,
    );
  });
});

// Performance test - complete typing test
test.describe("Complete Typing Test", () => {
  test("should complete full typing test with regular mode", async ({
    page,
  }) => {
    await page.goto(
      "https://pawel-jurek.github.io/bezpieczenstwoPwr/typing-test",
    );

    const paragraphText = await getParagraphText(page);
    console.log(
      `Starting full typing test with ${paragraphText.length} characters`,
    );

    const startTime = Date.now();

    // Type the entire paragraph
    await typeWithBotBehavior(page, paragraphText, BOT_MODES[0]);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Get final stats
    const finalStats = await getTypingStats(page);

    console.log(`Full typing test completed in ${totalTime}ms`);
    console.log(`Final stats:`, finalStats);
    console.log(
      `Effective typing speed: ${(((paragraphText.length / (totalTime / 1000)) * 60) / 5).toFixed(2)} WPM`,
    );

    // Verify completion
    expect(finalStats.cpm).toBeGreaterThan(0);

    // Check if bot was detected during full test
    const botDetected = await botOverlayVisible(page);
    console.log(
      `Bot detection during full test: ${botDetected ? "YES" : "NO"}`,
    );
  });
});

// Declare global types for TypeScript (if needed for custom properties)
declare global {
  interface Window {
    // Add any custom window properties if needed
    typingTestData?: {
      paragraphs: string[];
      currentParagraph: string;
    };
  }
}
