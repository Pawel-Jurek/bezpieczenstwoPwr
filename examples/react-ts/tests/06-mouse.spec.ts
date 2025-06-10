import { test, expect, Page } from "@playwright/test";

const OVERLAY_SELECTOR = 'div:has-text("Bot Detected")';
const REACTION_TEST_URL =
  "https://pawel-jurek.github.io/bezpieczenstwoPwr/accuracy-test/"; // Adjust URL as needed

interface BotReactionMode {
  name: string;
  reactionTime: {
    min: number; // minimum reaction time in ms
    max: number; // maximum reaction time in ms
    consistency: number; // how consistent the times are (0-1, lower = more consistent)
  };
  clickAccuracy: {
    offsetRange: number; // pixel offset from center (0 = perfect center)
  };
  description: string;
}

// Different bot behavior modes for reaction testing
const BOT_REACTION_MODES: BotReactionMode[] = [
  {
    name: "Perfect Bot",
    reactionTime: { min: 50, max: 80, consistency: 0.1 },
    clickAccuracy: { offsetRange: 0 },
    description: "Impossibly fast and accurate reactions",
  },
  {
    name: "Superhuman Bot",
    reactionTime: { min: 80, max: 120, consistency: 0.2 },
    clickAccuracy: { offsetRange: 2 },
    description: "Consistently superhuman reaction times",
  },
  {
    name: "Mechanical Bot",
    reactionTime: { min: 150, max: 200, consistency: 0.05 },
    clickAccuracy: { offsetRange: 1 },
    description: "Too consistent, mechanical timing",
  },
  {
    name: "Speed Bot",
    reactionTime: { min: 100, max: 150, consistency: 0.15 },
    clickAccuracy: { offsetRange: 3 },
    description: "Suspiciously fast but slightly varied",
  },
  {
    name: "Precision Bot",
    reactionTime: { min: 200, max: 300, consistency: 0.3 },
    clickAccuracy: { offsetRange: 0 },
    description: "Perfect accuracy with reasonable timing",
  },
];

function generateReactionTime(mode: BotReactionMode): number {
  const { min, max, consistency } = mode.reactionTime;
  const baseTime = min + Math.random() * (max - min);

  // Add consistency factor - lower consistency means less variation
  const variation = (1 - consistency) * 50; // max 50ms variation
  const actualVariation = (Math.random() - 0.5) * variation;

  return Math.max(min, baseTime + actualVariation);
}

function generateClickOffset(mode: BotReactionMode): { x: number; y: number } {
  const { offsetRange } = mode.clickAccuracy;

  if (offsetRange === 0) {
    return { x: 0, y: 0 };
  }

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * offsetRange;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

async function waitForShape(
  page: Page,
): Promise<{ element: any; shape: string }> {
  // Wait for either box or circle to appear
  const boxSelector =
    "#box[style*='display: block'], #box[style*='display:block']";
  const circleSelector =
    "#circle[style*='display: block'], #circle[style*='display:block']";

  try {
    // Wait for either shape to become visible
    await Promise.race([
      page.locator(boxSelector).waitFor({ state: "visible", timeout: 10000 }),
      page
        .locator(circleSelector)
        .waitFor({ state: "visible", timeout: 10000 }),
    ]);

    // Check which one is visible
    const boxVisible = await page
      .locator(boxSelector)
      .isVisible()
      .catch(() => false);
    const circleVisible = await page
      .locator(circleSelector)
      .isVisible()
      .catch(() => false);

    if (boxVisible) {
      return { element: page.locator("#box"), shape: "box" };
    } else if (circleVisible) {
      return { element: page.locator("#circle"), shape: "circle" };
    } else {
      throw new Error("No shape became visible");
    }
  } catch (error) {
    throw new Error(`Timeout waiting for shape to appear: ${error}`);
  }
}

async function clickShapeWithBotBehavior(
  page: Page,
  element: any,
  mode: BotReactionMode,
): Promise<void> {
  const reactionTime = generateReactionTime(mode);
  const clickOffset = generateClickOffset(mode);

  // Wait for the calculated reaction time
  await page.waitForTimeout(reactionTime);

  // Get element bounding box for precise clicking
  const boundingBox = await element.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get element bounding box");
  }

  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;

  // Click with offset
  await page.mouse.click(centerX + clickOffset.x, centerY + clickOffset.y);
}

async function performBotReactionTest(
  page: Page,
  mode: BotReactionMode,
  clickCount: number = 10,
): Promise<void> {
  console.log(`Starting ${mode.name} test with ${clickCount} clicks`);

  for (let i = 0; i < clickCount; i++) {
    try {
      // Wait for shape to appear
      const { element, shape } = await waitForShape(page);
      console.log(`Click ${i + 1}: ${shape} appeared`);

      // Click with bot behavior
      await clickShapeWithBotBehavior(page, element, mode);

      // Wait a moment for the next shape
      await page.waitForTimeout(100);

      // Check if bot detection triggered
      const botDetected = await page
        .locator(OVERLAY_SELECTOR)
        .isVisible()
        .catch(() => false);

      if (botDetected) {
        console.log(`Bot detected after ${i + 1} clicks`);
        break;
      }
    } catch (error) {
      console.log(`Error on click ${i + 1}:`, error);
      break;
    }
  }
}

// Bot Detection Tests for Reaction Time Challenge
BOT_REACTION_MODES.forEach((mode) => {
  test.describe(`Reaction Time Bot Detection - ${mode.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(REACTION_TEST_URL);

      // Wait for page to load
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("#currentTime")).toBeVisible();

      // Wait for initial shape to potentially appear
      await page.waitForTimeout(1000);
    });

    test(`should detect bot behavior for ${mode.name}`, async ({ page }) => {
      console.log(`Testing ${mode.name}: ${mode.description}`);

      // Race between bot clicking and detection overlay
      const botTestPromise = performBotReactionTest(page, mode, 15);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
        timeout: 30000, // Give enough time for multiple clicks
      });

      await Promise.race([botTestPromise, overlayPromise]);

      // Verify bot detection overlay is visible
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();
      console.log(`✓ Bot detection triggered for ${mode.name}`);

      // Log final reaction stats if available
      const sampleSize = await page
        .locator("#sampleSize")
        .textContent()
        .catch(() => "0");
      const reactionAverage = await page
        .locator("#reactionAverage")
        .textContent()
        .catch(() => "0");
      console.log(
        `Final stats - Sample size: ${sampleSize}, Average: ${reactionAverage}s`,
      );
    });

    test(`should detect ${mode.name} with fewer clicks`, async ({ page }) => {
      console.log(`Testing ${mode.name} with aggressive detection`);

      // Test with fewer clicks to see if detection is faster
      const botTestPromise = performBotReactionTest(page, mode, 5);
      const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
        state: "visible",
        timeout: 15000,
      });

      await Promise.race([botTestPromise, overlayPromise]);

      // Verify bot detection overlay is visible
      await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();
      console.log(`✓ Quick bot detection triggered for ${mode.name}`);
    });
  });
});

// Test rapid consecutive clicks (another bot pattern)
test.describe("Reaction Time Bot Detection - Rapid Clicking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REACTION_TEST_URL);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("should detect rapid consecutive clicking pattern", async ({ page }) => {
    console.log("Testing rapid clicking bot pattern");

    const rapidClickPromise = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          const { element } = await waitForShape(page);
          // Click immediately without realistic reaction time
          await element.click();
          await page.waitForTimeout(50); // Very short delay
        } catch (error) {
          console.log(`Rapid click ${i + 1} failed:`, error);
          break;
        }
      }
    };

    const overlayPromise = page.locator(OVERLAY_SELECTOR).waitFor({
      state: "visible",
      timeout: 20000,
    });

    await Promise.race([rapidClickPromise(), overlayPromise]);

    // Verify bot detection overlay is visible
    await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();
    console.log("✓ Rapid clicking bot pattern detected");
  });
});

// Declare global types for TypeScript
declare global {
  interface Window {
    reactionTestData?: {
      totals: number[];
      createdTime: number;
      clickedTime: number;
    };
  }
}
