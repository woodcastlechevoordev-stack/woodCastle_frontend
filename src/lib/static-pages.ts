/** StaticPage.key values from the backend spec — not the public URL slugs. */
export const STATIC_PAGE_PUBLIC_PATH: Record<string, string> = {
  about: "/about",
  terms: "/terms-and-conditions",
  contact: "/contact",
};

export function staticPageCacheTag(key: string) {
  return `static-page-${key}`;
}
