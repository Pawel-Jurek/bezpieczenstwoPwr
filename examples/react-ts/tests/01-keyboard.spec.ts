import { test, expect, Page } from "@playwright/test";

// Test configuration
const TEST_URL = "http://localhost:5173"; // Adjust to your app's URL

// Helper function to add random delays between keystrokes
const humanLikeDelay = () => Math.random() * 100 + 50; // 50-150ms
const botLikeDelay = () => 10; // Very consistent, fast typing

// Helper function to simulate human-like typing with occasional mistakes
async function humanLikeTyping(page: Page, selector: string, text: string) {
  await page.focus(selector);

  for (let i = 0; i < text.length; i++) {
    // Occasionally make a typo and correct it (5% chance)
    if (Math.random() < 0.05 && i > 0) {
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(humanLikeDelay());
      await page.keyboard.type(text[i - 1]);
      await page.waitForTimeout(humanLikeDelay());
    }

    await page.keyboard.type(text[i]);
    await page.waitForTimeout(humanLikeDelay());
  }
}

// Helper function to simulate bot-like typing (consistent, fast)
async function botLikeTyping(page: Page, selector: string, text: string) {
  await page.focus(selector);

  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(botLikeDelay());
  }
}

// Helper function to simulate copy-paste behavior
async function copyPasteBehavior(page: Page, selector: string, text: string) {
  await page.focus(selector);

  // Simulate Ctrl+A, then paste
  await page.keyboard.press("Control+a");
  await page.waitForTimeout(50);

  // Simulate pasting text all at once
  await page.keyboard.insertText(text);
}

test.describe.skip("Bot Detection - Human-like Keyboard Patterns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test("Human-like typing with natural delays and corrections", async ({
    page,
  }) => {
    // Simulate realistic human typing patterns
    await humanLikeTyping(page, "#firstname", "John");
    await page.waitForTimeout(200 + Math.random() * 300); // Natural pause between fields

    await humanLikeTyping(page, "#lastname", "Doe");
    await page.waitForTimeout(150 + Math.random() * 250);

    await humanLikeTyping(page, "#email", "john.doe@example.com");

    // Natural pause before submission
    await page.waitForTimeout(500 + Math.random() * 1000);

    await page.click('button[type="submit"]');

    // Variable speed human behavior should be allowed
    await expect(page.locator("body")).not.toHaveText(
      /bot detected|suspicious activity|access denied/i
    );

    // Human-like behavior with corrections should be allowed
    await expect(page.locator("body")).not.toHaveText(
      /bot detected|suspicious activity|access denied/i
    );

    // Perfect timing should be suspicious
    // await expect(page).toHaveText(/bot detected|suspicious activity|access denied/i);

    // Copy-paste behavior should be flagged
    // await expect(page).toHaveText(/bot detected|suspicious activity|access denied/i);

    // Bot-like behavior should be blocked
    // await expect(page).toHaveText(/bot detected|suspicious activity|access denied/i);

    // Human-like behavior should be allowed through
    // await expect(page).not.toHaveText('Bot detected');
    // await expect(page).not.toHaveText('Suspicious activity');
  });

  test("Human-like typing with backspace corrections", async ({ page }) => {
    // Simulate typing with mistakes and corrections
    await page.focus("#firstname");
    await page.keyboard.type("Johm"); // Intentional typo
    await page.waitForTimeout(200);
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(100);
    await page.keyboard.type("n");

    await page.waitForTimeout(300);

    await page.focus("#lastname");
    await page.keyboard.type("Smtih"); // Another typo
    await page.waitForTimeout(150);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(100);
    await page.keyboard.type("ith");

    await page.waitForTimeout(250);

    await humanLikeTyping(page, "#email", "john.smith@example.com");

    await page.waitForTimeout(400);
    await page.click('button[type="submit"]');
  });

  test("Variable typing speed with natural pauses", async ({ page }) => {
    // Simulate variable typing speeds
    const variableSpeedTyping = async (selector: string, text: string) => {
      await page.focus(selector);

      for (const char of text) {
        await page.keyboard.type(char);
        // Variable delays: sometimes fast, sometimes slow
        const delay =
          Math.random() < 0.3
            ? Math.random() * 200 + 100 // Slower thinking
            : Math.random() * 80 + 30; // Normal speed
        await page.waitForTimeout(delay);
      }
    };

    await variableSpeedTyping("#firstname", "Alice");
    await page.waitForTimeout(400);

    await variableSpeedTyping("#lastname", "Johnson");
    await page.waitForTimeout(300);

    await variableSpeedTyping("#email", "alice.johnson@example.com");

    await page.waitForTimeout(600);
    await page.click('button[type="submit"]');
  });
});

test.describe.skip("Bot Detection - Suspicious Keyboard Patterns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test("Extremely fast, consistent typing (bot-like)", async ({ page }) => {
    // Simulate bot-like behavior: very fast, consistent timing
    await botLikeTyping(page, "#firstname", "BotUser");
    await page.waitForTimeout(10);

    await botLikeTyping(page, "#lastname", "AutoFill");
    await page.waitForTimeout(10);

    await botLikeTyping(page, "#email", "bot.user@example.com");
    await page.waitForTimeout(10);

    await page.click('button[type="submit"]');
  });

  test("Instant form completion (copy-paste pattern)", async ({ page }) => {
    // Simulate copy-paste behavior across all fields
    await copyPasteBehavior(page, "#firstname", "Instant");
    await page.waitForTimeout(50);

    await copyPasteBehavior(page, "#lastname", "Filler");
    await page.waitForTimeout(50);

    await copyPasteBehavior(page, "#email", "instant.filler@example.com");
    await page.waitForTimeout(50);

    await page.click('button[type="submit"]');
  });

  test("Perfect typing with no corrections", async ({ page }) => {
    // Simulate perfect typing with exact timing
    const perfectTyping = async (selector: string, text: string) => {
      await page.focus(selector);

      for (const char of text) {
        await page.keyboard.type(char);
        await page.waitForTimeout(75); // Exactly 75ms between each character
      }
    };

    await perfectTyping("#firstname", "Perfect");
    await page.waitForTimeout(100); // Exactly 100ms between fields

    await perfectTyping("#lastname", "Typer");
    await page.waitForTimeout(100);

    await perfectTyping("#email", "perfect.typer@example.com");
    await page.waitForTimeout(100);

    await page.click('button[type="submit"]');
  });

  test("Immediate form submission without interaction", async ({ page }) => {
    // Simulate form filling without any mouse movement or focus events
    await page.fill("#firstname", "Automated");
    await page.fill("#lastname", "Script");
    await page.fill("#email", "automated.script@example.com");

    // Immediate submission
    await page.click('button[type="submit"]');

    // Automated script behavior should be blocked
    await expect(page.locator("body")).toHaveText(
      /bot detected|suspicious activity|access denied/i
    );
  });
});

test.describe.skip("Bot Detection - Edge Cases and Mixed Patterns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test("Mixed behavior: human-like then bot-like", async ({ page }) => {
    // Start with human-like behavior
    await humanLikeTyping(page, "#firstname", "Mixed");
    await page.waitForTimeout(300);

    // Switch to bot-like behavior
    await botLikeTyping(page, "#lastname", "Pattern");
    await page.waitForTimeout(10);

    await botLikeTyping(page, "#email", "mixed.pattern@example.com");

    await page.waitForTimeout(200);
    await page.click('button[type="submit"]');
  });

  test("Keyboard navigation patterns", async ({ page }) => {
    // Simulate tab navigation
    await page.focus("#firstname");
    await humanLikeTyping(page, "#firstname", "Tab");

    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    await humanLikeTyping(page, "#lastname", "Navigator");

    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    await humanLikeTyping(page, "#email", "tab.navigator@example.com");

    // Submit using Enter key
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    await page.keyboard.press("Enter");
  });

  test("Form validation trigger patterns", async ({ page }) => {
    // Trigger validation by submitting empty form first
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);

    // Then fill form after validation errors
    await humanLikeTyping(page, "#firstname", "Validator");
    await page.waitForTimeout(200);

    await humanLikeTyping(page, "#lastname", "Tester");
    await page.waitForTimeout(200);

    await humanLikeTyping(page, "#email", "validator.tester@example.com");

    await page.waitForTimeout(300);
    await page.click('button[type="submit"]');
  });

  test("Multiple attempt patterns", async ({ page }) => {
    // Simulate multiple attempts with slight variations
    for (let attempt = 1; attempt <= 3; attempt++) {
      await page.reload();

      if (attempt === 1) {
        // First attempt: human-like
        await humanLikeTyping(page, "#firstname", `User${attempt}`);
        await page.waitForTimeout(200);
        await humanLikeTyping(page, "#lastname", "Attempt");
        await page.waitForTimeout(200);
        await humanLikeTyping(
          page,
          "#email",
          `user${attempt}.attempt@example.com`
        );
      } else {
        // Subsequent attempts: increasingly bot-like
        await botLikeTyping(page, "#firstname", `User${attempt}`);
        await page.waitForTimeout(50);
        await botLikeTyping(page, "#lastname", "Attempt");
        await page.waitForTimeout(50);
        await botLikeTyping(
          page,
          "#email",
          `user${attempt}.attempt@example.com`
        );
      }

      await page.waitForTimeout(attempt === 1 ? 400 : 50);
      await page.click('button[type="submit"]');

      // Wait before next attempt
      await page.waitForTimeout(1000);
    }
  });
});

test.describe.skip("Bot Detection - Timing Analysis", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test("Measure and verify typing timing patterns", async ({ page }) => {
    const timings: number[] = [];
    let lastTime = Date.now();

    // Custom typing function that records timings
    const timedTyping = async (selector: string, text: string) => {
      await page.focus(selector);

      for (const char of text) {
        const currentTime = Date.now();
        timings.push(currentTime - lastTime);
        lastTime = currentTime;

        await page.keyboard.type(char);
        await page.waitForTimeout(humanLikeDelay());
      }
    };

    await timedTyping("#firstname", "Timed");
    await page.waitForTimeout(300);

    await timedTyping("#lastname", "User");
    await page.waitForTimeout(300);

    await timedTyping("#email", "timed.user@example.com");

    // Analyze timing patterns
    const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
    const variance =
      timings.reduce(
        (acc, timing) => acc + Math.pow(timing - avgTiming, 2),
        0
      ) / timings.length;

    console.log(`Average keystroke timing: ${avgTiming}ms`);
    console.log(`Timing variance: ${variance}`);
    console.log(`Min timing: ${Math.min(...timings)}ms`);
    console.log(`Max timing: ${Math.max(...timings)}ms`);

    // Assert reasonable human-like timing variance
    expect(variance).toBeGreaterThan(100); // Human typing should have some variance
    expect(avgTiming).toBeGreaterThan(50); // Humans don't type faster than 50ms per character

    await page.click('button[type="submit"]');
  });
});
