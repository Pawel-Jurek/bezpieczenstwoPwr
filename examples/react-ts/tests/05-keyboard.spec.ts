import { test, expect, Page } from "@playwright/test";

interface TypingMode {
  name: string;
  holdTime: { mean: number; stdDev?: number; range?: [number, number] };
  interval: { mean: number; stdDev?: number; range?: [number, number] };
}

const BOT_MODES: TypingMode[] = [
  {
    name: "regular",
    holdTime: { mean: 100, stdDev: 0 },
    interval: { mean: 150, stdDev: 0 },
  },
  {
    name: "fast",
    holdTime: { mean: 80, stdDev: 5 },
    interval: { mean: 100, stdDev: 10 },
  },
  {
    name: "humanlike",
    holdTime: { mean: 120, stdDev: 20 },
    interval: { mean: 180, stdDev: 30 },
  },
  {
    name: "chaotic",
    holdTime: { mean: 150, stdDev: 50 },
    interval: { mean: 200, stdDev: 80 },
  },
  {
    name: "precise",
    holdTime: { mean: 90, range: [-2, 2] },
    interval: { mean: 130, range: [-2, 2] },
  },
];

// Utility functions for random number generation
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function uniformRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

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

async function pressKey(page: Page, mode: TypingMode, key: string) {
  const holdTime = generateTiming(mode.holdTime);
  const interval = generateTiming(mode.interval);

  // Press key down
  await page.keyboard.down(key);

  // Hold for calculated time
  await page.waitForTimeout(holdTime);

  // Release key
  await page.keyboard.up(key);

  // Wait interval before next character
  await page.waitForTimeout(interval);
}

async function typeWithBotBehavior(
  page: Page,
  text: string,
  mode: TypingMode,
): Promise<void> {
  const inputs = text.split("|");

  for (const input of inputs) {
    for (const char of input) {
      await pressKey(page, mode, char);
    }
    await pressKey(page, mode, "Tab");
  }
}

const TEST_STRINGS = [
  "John|Smith|john.smith@example.com",
  "Hazel E.|Jordan|HazelEJordan@teleworm.us",
  "Peter|Johnson|PeterJohnson@jourrapide.com",
  "Phyllis|White|phylliswhite@dayrep.com",
  "Edwardo|Richey|edwardo.richey@armyspy.com",
];

const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';
const FIRSTNAME_SELECTOR = "#firstname";

BOT_MODES.forEach((mode) => {
  test.describe(`Bot Detection Tests - ${mode.name} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("http://localhost:5173");
    });

    test(`should detect bot for all test strings with ${mode.name} behavior`, async ({
      page,
    }) => {
      for (const testString of TEST_STRINGS) {
        await page.locator(FIRSTNAME_SELECTOR).clear();
        await page.locator(FIRSTNAME_SELECTOR).focus();
        const typingPromise = typeWithBotBehavior(page, testString, mode);
        const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
          state: "visible",
        });

        await Promise.race([typingPromise, overlayPromise]);

        await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

        if (TEST_STRINGS.indexOf(testString) < TEST_STRINGS.length - 1) {
          await page.reload();
        }
      }
    });
  });
});
