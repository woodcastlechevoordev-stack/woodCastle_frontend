import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

async function unwrapItems<T>(data: unknown): Promise<T[]> {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

async function cleanupQaCategories(page: Page) {
  const res = await page.request.get("/api/admin/categories");
  const items = await unwrapItems<{ id: string; name: string; children?: { id: string; name: string }[] }>(
    await res.json()
  );
  const toDelete: { id: string; name: string }[] = [];
  for (const main of items) {
    if (/^QA Meta Sub/.test(main.name)) toDelete.push(main);
    for (const child of main.children || []) {
      if (/^QA Meta Sub/.test(child.name)) toDelete.push(child);
    }
  }
  for (const cat of toDelete) {
    await page.request.delete(`/api/admin/categories/${cat.id}`);
  }
}

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(ADMIN_USER);
  await page.getByLabel("Password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

async function copyMetaFromPublicTab(context: BrowserContext, path = "/about") {
  const tab = await context.newPage();
  await tab.goto(path);
  const meta = await tab.evaluate(() => {
    const title = document.title;
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "Handcrafted teak furniture from Chevoor, Thrissur — 44 years of Woodcastle craftsmanship.";
    return { title, description };
  });
  await tab.close();
  return meta;
}

async function selectParentByLabel(page: Page, label: string) {
  const parent = page.locator("#cat-parent");
  await parent.evaluate((el, optionLabel) => {
    const select = el as HTMLSelectElement;
    const opt = [...select.options].find((o) => o.text === optionLabel);
    if (!opt) throw new Error(`Parent option not found: ${optionLabel}`);
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      "value"
    );
    descriptor?.set?.call(select, opt.value);
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, label);
  await expect(parent).not.toHaveValue("");
}

async function pasteInto(page: Page, selector: string, text: string) {
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill("");
  // Simulate a real clipboard paste (newlines/whitespace from another tab).
  await locator.evaluate((el, value) => {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    input.focus();
    const dt = new DataTransfer();
    dt.setData("text/plain", `\n${value}\n`);
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true }));
    input.value = value.trim();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, text);
}

async function mockCloudinary(page: Page) {
  await page.route("**/api/admin/upload/signature", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cloudName: "demo",
        apiKey: "123",
        timestamp: 1,
        signature: "test",
        folder: "woodcastle/products",
      }),
    });
  });
  await page.route("https://api.cloudinary.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        secure_url:
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      }),
    });
  });
}

test.describe("ADM-15 — copy meta from another tab, then save", () => {
  test("subcategory: opening a new tab to copy metadata still saves and leaves the admin UI usable", async ({
    page,
    context,
  }) => {
    const name = `QA Meta Sub ${Date.now()}`;
    await login(page);
    await page.goto("/admin/categories");
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Kids Furniture" })).toBeVisible();
    await cleanupQaCategories(page);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Kids Furniture" })).toBeVisible();

    await page.getByTestId("add-category").click();
    await expect(page.getByTestId("category-modal")).toBeVisible();
    await expect(page.locator("#cat-parent option", { hasText: "Kids Furniture" })).toHaveCount(1);

    await page.locator("#cat-name").fill(name);
    await page.locator("#cat-name").blur();
    await expect(page.locator("#cat-slug")).not.toHaveValue("");

    const parent = page.locator("#cat-parent");
    await selectParentByLabel(page, "Kids Furniture");
    const parentValue = await parent.inputValue();
    expect(parentValue).toBeTruthy();

    const meta = await copyMetaFromPublicTab(context, "/about");
    await expect(page.getByTestId("category-modal")).toBeVisible();
    await expect(parent).toHaveValue(parentValue);

    await pasteInto(page, "#cat-meta-title", meta.title);
    await pasteInto(page, "#cat-meta-desc", meta.description);
    await expect(parent).toHaveValue(parentValue);

    await page.getByTestId("category-save").click();
    await expect(page.getByTestId("category-modal")).toHaveCount(0, { timeout: 20_000 });

    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);

    const parentCard = page
      .locator("div.rounded-xl")
      .filter({ has: page.getByRole("heading", { name: "Kids Furniture" }) });
    await expect(parentCard.locator("li").filter({ hasText: name })).toBeVisible();

    await expect(page.getByRole("link", { name: "Products" })).toBeEnabled();
    await page.getByTestId("add-category").click();
    await expect(page.getByTestId("category-modal")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("category-modal")).toHaveCount(0);

    const row = parentCard.locator("li").filter({ hasText: name });
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
  });

  test("product: opening a new tab to copy metadata still saves and leaves the list usable", async ({
    page,
    context,
  }) => {
    const name = `QA Meta Product ${Date.now()}`;
    await mockCloudinary(page);
    await login(page);
    await page.goto("/admin/products/new");
    await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();

    await page.locator("#name").fill(name);
    await page.locator("#name").blur();
    await page.locator("#description").fill("Solid teak test piece for meta copy-paste flow.");
    await page.locator("#price").fill("15000");

    const categorySelect = page.locator("#categoryId");
    await expect(categorySelect.locator("option")).not.toHaveCount(0);
    const firstLeaf = await categorySelect.evaluate((el) => {
      const select = el as HTMLSelectElement;
      return [...select.options].find((o) => o.value)?.value || "";
    });
    if (firstLeaf) await categorySelect.selectOption(firstLeaf);

    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: "qa.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(page.getByRole("button", { name: "Remove" })).toBeVisible({ timeout: 20_000 });

    const meta = await copyMetaFromPublicTab(context, "/");
    await pasteInto(page, "#metaTitle", meta.title);
    await pasteInto(page, "#metaDescription", meta.description);

    await page.getByTestId("product-save").click();
    await page.waitForURL("**/admin/products", { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();

    await expect(page.getByRole("link", { name: "Add product" })).toBeVisible();
    await page.getByRole("link", { name: "Categories" }).click();
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
    await page.goto("/admin/products");

    const row = page.locator("tr").filter({ hasText: name });
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
