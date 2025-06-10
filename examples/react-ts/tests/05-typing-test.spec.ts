import { test, expect, Page } from "@playwright/test";
import { BOT_MODES } from "./utils/bot";
import { TypingMode } from "./utils/bot";
import { normalRandom, uniformRandom } from "./utils/rand";

const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';
const TYPING_TEST_URL =
  "https://pawel-jurek.github.io/bezpieczenstwoPwr/typing-test/";

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

    // Check if bot detection overlay appears
    const botDetected = await page
      .locator(OVERLAY_SELECTOR)
      .isVisible()
      .catch(() => false);
    if (botDetected) {
      console.log(`Bot detected after typing ${i + 1} characters`);
      break;
    }
  }
}

// Bot Detection Tests - race condition approach
BOT_MODES.forEach((mode) => {
  test.describe(`Bot Detection - ${mode.name} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(TYPING_TEST_URL);

      // Wait for page to load and paragraph to be generated
      await expect(page.locator(".typing-text p")).toBeVisible();
      await expect(page.locator(".input-field")).toBeVisible();
    });

    test(`should detect bot behavior for ${mode.name} mode`, async ({
      page,
    }) => {
      // Get the paragraph text to type
      const paragraphText = await getParagraphText(page);
      console.log(
        `Testing ${mode.name} mode with ${paragraphText.length} characters`,
      );

      // Race between typing completion and bot detection overlay
      const typingPromise = typeWithBotBehavior(page, paragraphText, mode);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
      });

      await Promise.race([typingPromise, overlayPromise]);

      // Verify bot detection overlay is visible
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();
      console.log(`✓ Bot detection triggered for ${mode.name} mode`);
    });
  });
});

// Declare global types for TypeScript
declare global {
  interface Window {
    typingTestData?: {
      paragraphs: string[];
      currentParagraph: string;
    };
  }
}
