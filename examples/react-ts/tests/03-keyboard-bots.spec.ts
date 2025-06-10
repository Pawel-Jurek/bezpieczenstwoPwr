import { test, expect, Page } from "@playwright/test";

// Bot typing modes with their characteristics
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

// Custom typing function that simulates bot behavior
async function typeWithBotBehavior(
  page: Page,
  selector: string,
  text: string,
  mode: TypingMode,
): Promise<void> {
  const element = await page.locator(selector);
  await element.focus();

  for (const char of text) {
    const holdTime = generateTiming(mode.holdTime);
    const interval = generateTiming(mode.interval);

    // Press key down
    await page.keyboard.down(char);

    // Hold for calculated time
    await page.waitForTimeout(holdTime);

    // Release key
    await page.keyboard.up(char);

    // Wait interval before next character
    if (interval > 0) {
      await page.waitForTimeout(interval);
    }
  }
}

// Test data - using 15+ character strings as required
const TEST_STRINGS = [
  "John\nSmith\njohn.smith@example.com",
  "Hazel E.\nJordan\nHazelEJordan@teleworm.us",
  "Peter\nJohnson\nPeterJohnson@jourrapide.com",
  "Phyllis\nWhite\nphylliswhite@dayrep.com",
  "Edwardo\nRichey\nedwardo.richey@armyspy.com",
];

const botOverlayVisible = async (page: Page) => {
  await expect(page.locator('div:has-text("Bot Detected")')).toBeVisible();
};

// Test suite for each bot mode
BOT_MODES.forEach((mode) => {
  test.describe(`Bot Detection Tests - ${mode.name} mode`, () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to your test page
      await page.goto("http://localhost:5173");
      await expect(page).toHaveTitle("bbotd - React + TypeScript example");
    });

    TEST_STRINGS.forEach((testString) => {
      test(`should detect bot when typing "${testString}" with ${mode.name} behavior`, async ({
        page,
      }) => {
        // Test typing in firstname field
        await typeWithBotBehavior(page, "#firstname", testString, mode);

        // Verify the text was entered correctly
        // await expect(page.locator("#firstname")).toHaveValue(testString);

        // Check if bot detection overlay appears
        await botOverlayVisible(page);

        // Optional: Clear field and test lastname
        // await page.locator("#firstname").clear();
        // await typeWithBotBehavior(page, "#lastname", testString, mode);
        // await expect(page.locator("#lastname")).toHaveValue(testString);

        // Check bot detection again after lastname typing
        await botOverlayVisible(page);
      });
    });

    test(`should detect bot when navigating between fields using Tab - ${mode.name}`, async ({
      page,
    }) => {
      const firstname = TEST_STRINGS[0];
      const lastname = TEST_STRINGS[1];

      // Type in firstname
      await typeWithBotBehavior(page, "#firstname", firstname, mode);

      // Tab to lastname
      await page.keyboard.press("Tab");

      // Type in lastname
      await typeWithBotBehavior(page, "#lastname", lastname, mode);

      // Verify both fields
      await expect(page.locator("#firstname")).toHaveValue(firstname);
      await expect(page.locator("#lastname")).toHaveValue(lastname);

      // Check if bot detection overlay appears
      await botOverlayVisible(page);
    });

    test(`should detect bot during form submission with ${mode.name} typing`, async ({
      page,
    }) => {
      const firstname = TEST_STRINGS[2];
      const lastname = TEST_STRINGS[3];

      // Fill form with bot behavior
      await typeWithBotBehavior(page, "#firstname", firstname, mode);
      await page.keyboard.press("Tab");
      await typeWithBotBehavior(page, "#lastname", lastname, mode);

      // Check for bot detection before submission
      await botOverlayVisible(page);

      // Note: Commenting out form submission as bot should be detected before this point
      // await page.click('button[type="submit"]');
      // await expect(page.locator(".success-message")).toBeVisible();
    });
  });
});

// Test to verify bot detection triggers for different modes
test.describe("Bot Detection Verification", () => {
  BOT_MODES.forEach((mode) => {
    test(`should consistently detect ${mode.name} mode as bot behavior`, async ({
      page,
    }) => {
      await page.goto("http://localhost:5173");

      const testString = "TestingBotDetection123";

      // Type with bot behavior
      await typeWithBotBehavior(page, "#firstname", testString, mode);

      // Verify text input worked
      await expect(page.locator("#firstname")).toHaveValue(testString);

      // Most importantly, verify bot detection triggered
      await botOverlayVisible(page);

      console.log(`✓ Bot detection triggered for ${mode.name} mode`);
    });
  });
});

// Comparative test to ensure all bot modes trigger detection
test.describe("Bot Mode Detection Consistency", () => {
  test("should detect all bot modes as suspicious behavior", async ({
    page,
  }) => {
    const testString = "ConsistencyTestString";
    const detectionResults: Record<string, boolean> = {};

    for (const mode of BOT_MODES) {
      await page.goto("http://localhost:5173");

      // Clear any previous state
      await page.locator("#firstname").clear();

      // Type with current bot mode
      await typeWithBotBehavior(page, "#firstname", testString, mode);

      // Verify text was entered
      await expect(page.locator("#firstname")).toHaveValue(testString);

      // Check if bot was detected
      try {
        await botOverlayVisible(page);
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
});

// Test to verify detection timing
test.describe("Bot Detection Timing", () => {
  test("should detect bot behavior within reasonable time", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173");

    const mode = BOT_MODES[0]; // Use regular mode
    const testString = "TimingTestString";

    const startTime = Date.now();

    // Type with bot behavior
    await typeWithBotBehavior(page, "#firstname", testString, mode);

    // Check how quickly bot detection triggers
    await botOverlayVisible(page);

    const detectionTime = Date.now() - startTime;
    console.log(`Bot detected in ${detectionTime}ms`);

    // Verify detection happened in reasonable time (adjust threshold as needed)
    expect(detectionTime).toBeLessThan(10000); // 10 seconds max
  });
});

// Declare global types for TypeScript
declare global {
  interface Window {
    keystrokeData: Array<{
      type: string;
      key?: string;
      timestamp: number;
    }>;
  }
}
