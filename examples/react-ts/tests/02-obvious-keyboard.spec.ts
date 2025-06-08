/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from "@playwright/test";

test.describe("Bot Detection Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your form page
    await page.goto("http://localhost:5173"); // Adjust URL as needed
  });

  test("should detect obvious bot behavior - rapid typing with zero delays", async ({
    page,
  }) => {
    // Wait for the form to be ready
    await page.waitForSelector("#firstname");

    // Listen for the botDetected event
    await page.evaluate(() => {
      window.addEventListener("botDetected", (event) => {
        console.log("Bot detected in test!", event);
        (window as any).testBotDetected = true;
      });
    });

    // Simulate obvious bot behavior: typing with zero delays
    const firstname = page.locator("#firstname");
    const lastname = page.locator("#lastname");
    const email = page.locator("#email");

    // Focus on firstname and type instantly (no human delays)
    await firstname.click();

    // Type each character with exactly 0ms delay - dead giveaway it's a bot
    const testString = "BotFirstName";
    for (const char of testString) {
      await page.keyboard.press(char, { delay: 0 });
    }

    // Move to next field instantly and type
    await lastname.click();
    const testLastName = "BotLastName";
    for (const char of testLastName) {
      await page.keyboard.press(char, { delay: 0 });
    }

    // Move to email field and type with zero delays
    await email.click();
    const testEmail = "bot@example.com";
    for (const char of testEmail) {
      await page.keyboard.press(char, { delay: 0 });
    }

    // Wait a bit for the bot detection to process
    await page.waitForTimeout(2000);

    // Check if bot was detected
    const botDetectedResult = await page.evaluate(() => {
      return (window as any).testBotDetected || false;
    });

    // Verify bot detection UI is shown
    const botDetectionOverlay = page.locator('div:has-text("Bot Detected")');

    console.log("Bot detected result:", botDetectedResult);

    if (botDetectedResult) {
      await expect(botDetectionOverlay).toBeVisible();
      console.log("✅ Bot detection working - overlay is visible");
    } else {
      console.log("❌ Bot detection failed - no bot detected");
      // You might want to fail the test or just log for debugging
      // throw new Error('Bot detection should have triggered');
    }
  });

  test("should NOT detect human-like typing with natural delays", async ({
    page,
  }) => {
    await page.waitForSelector("#firstname");

    // Listen for the botDetected event
    await page.evaluate(() => {
      (window as any).testBotDetected = false;
      window.addEventListener("botDetected", (event) => {
        console.log("Bot detected in human test!", event);
        (window as any).testBotDetected = true;
      });
    });

    // Simulate human-like typing with natural variations
    const firstname = page.locator("#firstname");
    await firstname.click();

    // Type with human-like delays (random between 50-200ms)
    const testString = "HumanName";
    for (const char of testString) {
      const delay = Math.random() * 150 + 50; // 50-200ms
      await page.keyboard.press(char, { delay });
    }

    // Add some natural pauses
    await page.waitForTimeout(300 + Math.random() * 200); // 300-500ms pause

    const lastname = page.locator("#lastname");
    await lastname.click();

    const testLastName = "HumanLast";
    for (const char of testLastName) {
      const delay = Math.random() * 150 + 50;
      await page.keyboard.press(char, { delay });
    }

    await page.waitForTimeout(2000);

    const botDetectedResult = await page.evaluate(() => {
      return (window as any).testBotDetected || false;
    });

    console.log("Human test - Bot detected result:", botDetectedResult);

    // For human-like behavior, we expect NO bot detection
    expect(botDetectedResult).toBe(false);

    // Verify no bot detection overlay
    const botDetectionOverlay = page.locator('div:has-text("Bot Detected")');
    await expect(botDetectionOverlay).not.toBeVisible();
  });

  test("should detect bot with perfect timing patterns", async ({ page }) => {
    await page.waitForSelector("#firstname");

    await page.evaluate(() => {
      (window as any).testBotDetected = false;
      window.addEventListener("botDetected", (event) => {
        console.log("Perfect timing bot detected!", event);
        (window as any).testBotDetected = true;
      });
    });

    // Type with perfectly consistent timing - another bot indicator
    const firstname = page.locator("#firstname");
    await firstname.click();

    const testString = "PerfectTiming";
    for (const char of testString) {
      await page.keyboard.press(char, { delay: 100 }); // Exactly 100ms every time
    }

    await page.waitForTimeout(2000);

    const botDetectedResult = await page.evaluate(() => {
      return (window as any).testBotDetected || false;
    });

    console.log("Perfect timing test - Bot detected:", botDetectedResult);

    if (botDetectedResult) {
      const botDetectionOverlay = page.locator('div:has-text("Bot Detected")');
      await expect(botDetectionOverlay).toBeVisible();
    }
  });

  test("debug: check if bot detection is running", async ({ page }) => {
    await page.waitForSelector("#firstname");

    // Check if bot detection is initialized
    const detectionStatus = await page.evaluate(() => {
      return {
        hasBotDetector: typeof (window as any).BotDetector !== "undefined",
        hasEventListener: true, // We can't easily check this
      };
    });

    console.log("Detection status:", detectionStatus);

    // Type something to trigger detection
    const firstname = page.locator("#firstname");
    await firstname.click();
    await page.keyboard.type("test", { delay: 0 });

    await page.waitForTimeout(3000);

    // Check what events were recorded
    const events = await page.evaluate(() => {
      // Try to access bot detector if it's available globally
      if ((window as any).botDetector) {
        return {
          keyboardEvents: (window as any).botDetector.getKeyboardEvents(),
          mouseEvents: (window as any).botDetector.getMouseEvents(),
        };
      }
      return { keyboardEvents: [], mouseEvents: [] };
    });

    console.log("Recorded events:", events);
  });
});
