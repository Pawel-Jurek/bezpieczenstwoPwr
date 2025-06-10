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

// Test suite for each bot mode - Bot Detection Tests
BOT_MODES.forEach((mode) => {
  test.describe.skip(`Bot Detection Tests - ${mode.name} mode`, () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to your typing test page
      await page.goto("http://localhost:3000"); // Adjust URL as needed

      // Wait for page to load and paragraph to be generated
      await expect(page.locator(".typing-text p")).toBeVisible();
      await expect(page.locator(".input-field")).toBeVisible();
    });

    test(`2. should detect bot when typing with ${mode.name} behavior`, async ({
      page,
    }) => {
      // Get the paragraph text to type
      const paragraphText = await getParagraphText(page);
      console.log(
        `Testing bot detection with ${mode.name} mode, paragraph length: ${paragraphText.length} characters`,
      );

      const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';

      // Race between typing and bot detection overlay appearing
      const typingPromise = typeWithBotBehavior(page, paragraphText, mode);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
      });

      await Promise.race([typingPromise, overlayPromise]);

      // Verify bot detection overlay is visible
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

      console.log(`✓ Bot detection triggered for ${mode.name} mode`);
    });

    test(`2. should detect bot with partial typing using ${mode.name} behavior`, async ({
      page,
    }) => {
      const paragraphText = await getParagraphText(page);
      const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';

      // Type first portion of text to trigger bot detection
      const partialText = paragraphText.substring(
        0,
        Math.floor(paragraphText.length * 0.5),
      );

      const typingPromise = typeWithBotBehavior(page, partialText, mode);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
      });

      await Promise.race([typingPromise, overlayPromise]);
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

      console.log(
        `✓ Bot detection triggered during partial typing for ${mode.name} mode`,
      );
    });
  });

  // Bot Detection Verification - Test all modes together
  test.describe.skip(`Bot Detection Verification ${mode.name}`, () => {
    test("2. should consistently detect all bot modes", async ({ page }) => {
      const detectionResults: Record<string, boolean> = {};

      for (const mode of BOT_MODES) {
        await page.goto("http://localhost:3000");
        await expect(page.locator(".typing-text p")).toBeVisible();

        const paragraphText = await getParagraphText(page);
        const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';

        console.log(`Testing bot detection for ${mode.name} mode...`);

        try {
          const typingPromise = typeWithBotBehavior(page, paragraphText, mode);
          const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
            state: "visible",
            timeout: 30000, // 30 second timeout
          });

          await Promise.race([typingPromise, overlayPromise]);
          await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

          detectionResults[mode.name] = true;
          console.log(`✓ ${mode.name} mode: Bot detected`);
        } catch (error) {
          detectionResults[mode.name] = false;
          console.log(`✗ ${mode.name} mode: Bot NOT detected`);
        }
      }

      // Verify that all modes triggered bot detection
      Object.entries(detectionResults).forEach(([modeName, detected]) => {
        expect(detected).toBe(true);
      });

      console.log("Detection summary:", detectionResults);
    });

    BOT_MODES.forEach((mode) => {
      test(`2. should detect ${mode.name} mode as bot behavior`, async ({
        page,
      }) => {
        await page.goto("http://localhost:3000");
        await expect(page.locator(".typing-text p")).toBeVisible();

        const paragraphText = await getParagraphText(page);
        const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';

        // Race between typing and bot detection
        const typingPromise = typeWithBotBehavior(page, paragraphText, mode);
        const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
          state: "visible",
        });

        await Promise.race([typingPromise, overlayPromise]);

        // Most importantly, verify bot detection triggered
        await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

        console.log(`✓ Bot detection triggered for ${mode.name} mode`);
      });
    });
  });

  // Bot Detection Timing Test
  test.describe.skip(`Bot Detection Timing ${mode.name}`, () => {
    test("2. should detect bot behavior within reasonable time", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000");
      await expect(page.locator(".typing-text p")).toBeVisible();

      const mode = BOT_MODES[0]; // Use regular mode
      const paragraphText = await getParagraphText(page);
      const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';

      const startTime = Date.now();

      // Race between typing and bot detection
      const typingPromise = typeWithBotBehavior(page, paragraphText, mode);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
      });

      await Promise.race([typingPromise, overlayPromise]);

      // Check how quickly bot detection triggers
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

      const detectionTime = Date.now() - startTime;
      console.log(`Bot detected in ${detectionTime}ms`);

      // Verify detection happened in reasonable time (adjust threshold as needed)
      expect(detectionTime).toBeLessThan(30000); // 30 seconds max
    });
  });
});
