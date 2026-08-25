import { test, expect, type Page } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(ADMIN_USER);
  await page.getByLabel("Password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

test.describe("Admin pages editor", () => {
  test("loads title and Tiptap content from GET /api/admin/pages/:key before the editor renders", async ({
    page,
  }) => {
    let aboutGetCount = 0;

    await page.route("**/api/admin/pages/about", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      aboutGetCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          key: "about",
          title: "Our Story",
          content: "<p>Fetched about content from API</p>",
        }),
      });
    });

    await login(page);
    await page.goto("/admin/pages");
    await expect(page.getByRole("heading", { name: "Pages" })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByTestId("page-editor-loading")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Edit About Us" })).toBeVisible();

    const form = page.getByTestId("page-editor-form");
    await expect(form).toBeVisible();
    await expect(page.getByTestId("page-editor-loading")).toHaveCount(0);
    await expect(page.locator("#page-title")).toHaveValue("Our Story");
    await expect(page.locator("#page-content .ProseMirror")).toContainText(
      "Fetched about content from API"
    );
    expect(aboutGetCount).toBeGreaterThan(0);
  });
});
