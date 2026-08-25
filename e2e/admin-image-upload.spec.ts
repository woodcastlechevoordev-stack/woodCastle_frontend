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

test.describe("ADM-23 — Cloudinary signed WebP upload", () => {
  test("sends format=webp and shows original → converted size", async ({ page }) => {
    const signatureBodies: unknown[] = [];
    const cloudinaryBodies: string[] = [];

    await page.route("**/api/admin/upload/signature", async (route) => {
      const raw = route.request().postData() || "{}";
      try {
        signatureBodies.push(JSON.parse(raw));
      } catch {
        signatureBodies.push(raw);
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cloudName: "demo",
          apiKey: "123",
          timestamp: 1755000000,
          signature: "test-sig",
          folder: "products",
          format: "webp",
        }),
      });
    });

    await page.route("https://api.cloudinary.com/**", async (route) => {
      cloudinaryBodies.push(route.request().postData() || "");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          secure_url: "https://res.cloudinary.com/demo/image/upload/sample.webp",
          bytes: 348_160,
        }),
      });
    });

    await login(page);
    await page.goto("/admin/products/new");
    await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();

    const fileInput = page.getByTestId("cloudinary-file-input");
    await fileInput.setInputFiles({
      name: "chair.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(2_516_582, 1),
    });

    await expect(page.getByTestId("upload-size-label")).toContainText(
      "2.4 MB → 340 KB (86% smaller)"
    );
    await expect(page.locator('img[src$=".webp"]')).toBeVisible();

    expect(signatureBodies).toEqual(
      expect.arrayContaining([expect.objectContaining({ folder: "products" })])
    );

    const multipart = cloudinaryBodies.join("\n");
    expect(multipart).toMatch(/name="format"/);
    expect(multipart).toMatch(/webp/);
    expect(multipart).toMatch(/name="folder"/);
    expect(multipart).toMatch(/products/);
    expect(multipart).toMatch(/name="signature"/);
    expect(multipart).toMatch(/test-sig/);
  });
});
