import { test, expect, type Page } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const DRAFT_KEY = "woodcastle:admin-product-draft";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(ADMIN_USER);
  await page.getByLabel("Password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

async function expectBlankNewProductForm(page: Page) {
  await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();
  await expect(page.locator("#name")).toHaveValue("");
  await expect(page.locator("#slug")).toHaveValue("");
  await expect(page.locator("#description .ProseMirror")).toHaveText("");
  await expect(page.locator("#metaTitle")).toHaveValue("");
  await expect(page.locator("#metaDescription")).toHaveValue("");
}

test.describe("New product form starts blank", () => {
  test("does not restore a leftover create draft from sessionStorage", async ({ page }) => {
    await login(page);
    await page.goto("/admin");
    await page.evaluate(
      ([key]) => {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            values: {
              name: "Leftover Teak Bench",
              slug: "leftover-teak-bench",
              description: "<p>Previously created product copy</p>",
              price: 25000,
              compareAtPrice: "",
              categoryId: "cat-1",
              featured: false,
              inStock: true,
              metaTitle: "Leftover Teak Bench | Woodcastle",
              metaDescription: "Old meta from the last product we created.",
            },
            images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
          })
        );
      },
      [DRAFT_KEY]
    );

    await page.goto("/admin/products/new");
    await expectBlankNewProductForm(page);
    await expect(page.locator("#name")).not.toHaveValue("Leftover Teak Bench");
    await expect(page.locator("#price")).not.toHaveValue("25000");
  });

  test("navigating away and opening Add product again does not keep typed values", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/products/new");
    await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();

    await page.locator("#name").fill("Temporary Draft Chair");
    await page.locator("#name").blur();
    const descriptionEditor = page.locator("#description .ProseMirror");
    await expect(descriptionEditor).toBeVisible();
    await descriptionEditor.fill("This should not reappear on the next create.");

    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    await page.getByRole("link", { name: "Add product" }).click();
    await expectBlankNewProductForm(page);
    await expect(page.locator("#name")).not.toHaveValue("Temporary Draft Chair");
  });
});
