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

test.describe("Duplicate product name detection", () => {
  test("Confirm replaces the entire name field instead of appending", async ({ page }) => {
    const requestedNames: string[] = [];

    await page.route("**/api/admin/products/check-duplicate-name**", async (route) => {
      const url = new URL(route.request().url());
      const name = url.searchParams.get("name") ?? "";
      requestedNames.push(name);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isDuplicate: true,
          baseName: "Dining Chair",
          suggestedName: "Dining Chair DC-02",
          suggestedSlug: "dining-chair-dc-02",
        }),
      });
    });

    await login(page);
    await page.goto("/admin/products/new");
    await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();
    await expect(page.locator("#categoryId")).not.toHaveValue("");

    await page.locator("#name").fill("Dining Chair");
    const dialog = page.getByTestId("duplicate-name-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/A product named .Dining Chair. already exists/);
    await expect(dialog).toContainText(/Suggested name: .Dining Chair DC-02./);

    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("#name")).toHaveValue("Dining Chair DC-02");
    await expect(page.locator("#slug")).toHaveValue("dining-chair-dc-02");
    await expect(page.locator("#name")).not.toHaveValue(/Dining Chair DC-02 DC-2/);

    await page.locator("#name").fill("Dining Chair DC-02 extra");
    await expect(dialog).toBeVisible();
    expect(requestedNames).toContain("Dining Chair");
    expect(requestedNames).toContain("Dining Chair DC-02 extra");
  });
});
