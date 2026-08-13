import type { Category } from "./types";

/**
 * Woodcastle's Phase 1 catalog taxonomy (frontend spec §3.1 / §3.3).
 * Used for mega-menu ordering and reference; live data still comes from the API.
 */
export const MAIN_CATEGORY_ORDER = [
  "Sofa & Sofa Sets",
  "Chairs",
  "Tables",
  "Dining Furniture",
  "Bedroom Furniture",
  "Living Room Furniture",
  "Storage Furniture",
  "Office Furniture",
  "Outdoor Furniture",
  "Kids Furniture",
  "Home Décor & Accessories",
] as const;

export const MAIN_CATEGORY_SLUGS = [
  "sofa-sofa-sets",
  "chairs",
  "tables",
  "dining-furniture",
  "bedroom-furniture",
  "living-room-furniture",
  "storage-furniture",
  "office-furniture",
  "outdoor-furniture",
  "kids-furniture",
  "home-decor-accessories",
] as const;

/** Example subcategories per main category (spec §3.3); backend is source of truth. */
export const CATEGORY_TAXONOMY: Record<string, string[]> = {
  chairs: ["Dining Chair", "Arm Chair", "Lounge Chair", "Office Chair"],
  "sofa-sofa-sets": ["Sofa Sets", "L-Shaped Sofa", "Recliners", "Sofa Cum Bed"],
  tables: ["Coffee Table", "Side Table", "Console Table", "Study Table"],
  "dining-furniture": ["Dining Table", "Dining Set", "Sideboard"],
  "bedroom-furniture": ["Beds", "Wardrobes", "Dressers", "Bedside Tables"],
  "living-room-furniture": ["TV Units", "Display Cabinets", "Center Tables"],
  "storage-furniture": ["Almirahs", "Book Shelves", "Shoe Racks"],
  "office-furniture": ["Office Desk", "Office Chair", "Filing Cabinets"],
  "outdoor-furniture": ["Outdoor Bench", "Patio Set", "Garden Chair"],
  "kids-furniture": ["Kids Bed", "Study Desk", "Kids Chair"],
  "home-decor-accessories": ["Mirrors", "Wall Shelves", "Decor Accents"],
};

function taxonomyIndex(nameOrSlug: string): number {
  const needle = nameOrSlug.toLowerCase();
  const byName = MAIN_CATEGORY_ORDER.findIndex((n) => n.toLowerCase() === needle);
  if (byName >= 0) return byName;
  const bySlug = MAIN_CATEGORY_SLUGS.findIndex((s) => s === needle);
  return bySlug >= 0 ? bySlug : Number.MAX_SAFE_INTEGER;
}

export function sortCategoriesByTaxonomy(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const diff = taxonomyIndex(a.slug) - taxonomyIndex(b.slug);
    if (diff !== 0) return diff;
    const nameDiff = taxonomyIndex(a.name) - taxonomyIndex(b.name);
    if (nameDiff !== 0) return nameDiff;
    return a.name.localeCompare(b.name);
  });
}

/** Attach children arrays and resolve parent refs from a flat or nested category list. */
export function nestCategories(categories: Category[]): Category[] {
  const flat = flattenShallow(categories);
  const byId = new Map(flat.map((c) => [c.id, { ...c, children: [] as Category[] }]));

  for (const cat of byId.values()) {
    if (cat.parentId && byId.has(cat.parentId)) {
      const parent = byId.get(cat.parentId)!;
      cat.parent = { id: parent.id, name: parent.name, slug: parent.slug };
      parent.children!.push(cat);
    }
  }

  const roots = [...byId.values()].filter((c) => !c.parentId || !byId.has(c.parentId));
  for (const root of roots) {
    root.children = sortCategoriesByTaxonomy(root.children || []);
  }
  return sortCategoriesByTaxonomy(roots);
}

function flattenShallow(categories: Category[]): Category[] {
  const byId = new Map<string, Category>();
  function walk(list: Category[], parent?: Category) {
    for (const c of list) {
      const { children, ...rest } = c;
      const node: Category = {
        ...rest,
        parentId: rest.parentId ?? parent?.id ?? null,
        parent:
          rest.parent ??
          (parent
            ? { id: parent.id, name: parent.name, slug: parent.slug }
            : rest.parent ?? null),
      };
      byId.set(c.id, node);
      if (children?.length) walk(children, node);
    }
  }
  walk(categories);
  return [...byId.values()];
}

export function getTopLevelCategories(categories: Category[]): Category[] {
  const nested = categories.some((c) => (c.children?.length ?? 0) > 0)
    ? categories.filter((c) => !c.parentId)
    : nestCategories(categories);
  const tops = nested.filter((c) => !c.parentId);
  return tops.length ? sortCategoriesByTaxonomy(tops) : sortCategoriesByTaxonomy(categories);
}

export function getCategoryChildren(
  categories: Category[],
  parent: Category
): Category[] {
  if (parent.children?.length) return parent.children;
  return categories.filter((c) => c.parentId === parent.id);
}

/**
 * Leaf categories only (have a parent) — products must be assigned here,
 * not to a top-level main category.
 */
export function getLeafCategories(categories: Category[]): Category[] {
  const tree = nestCategories(categories);
  const leaves: Category[] = [];
  for (const main of tree) {
    if (main.children?.length) {
      leaves.push(...main.children);
    }
  }
  return leaves;
}

export function subcategoryGroups(
  categories: Category[]
): { main: string; children: Category[] }[] {
  const tree = nestCategories(categories);
  return tree
    .filter((main) => (main.children?.length ?? 0) > 0)
    .map((main) => ({ main: main.name, children: main.children! }));
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  for (const top of categories) {
    if (top.slug === slug) return top;
    const child = top.children?.find((c) => c.slug === slug);
    if (child) return child;
  }
  const nested = nestCategories(categories);
  for (const top of nested) {
    if (top.slug === slug) return top;
    const child = top.children?.find((c) => c.slug === slug);
    if (child) return child;
  }
  return undefined;
}

/** Flatten a nested category tree (or mixed list) into a unique list by id. */
export function flattenCategories(categories: Category[]): Category[] {
  return flattenShallow(categories);
}

/** Client-side category name match for search suggestions (spec §3.1a). */
export function matchCategoriesByQuery(
  categories: Category[],
  query: string,
  limit = 3
): Category[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const nested = categories.some((c) => (c.children?.length ?? 0) > 0)
    ? categories
    : nestCategories(categories);
  return flattenCategories(nested)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    )
    .slice(0, limit);
}
