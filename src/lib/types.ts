export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  /** Null/undefined = top-level (one of the 11 main categories). */
  parentId?: string | null;
  parent?: Pick<Category, "id" | "name" | "slug"> | null;
  children?: Category[];
  _count?: { products: number };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string | null;
  images: string[];
  categoryId: string;
  isActive?: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  published?: boolean;
  publishedAt: string | null;
  createdAt?: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string | null;
  discountText: string | null;
  linkUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt?: string;
};

export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  id: string;
  productId: string | null;
  name: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  /** @deprecated Customer opens WhatsApp themselves; not shown in admin. */
  whatsappSent?: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user?: {
    id: string;
    name: string;
    phone: string;
    isVerified: boolean;
  } | null;
};

export type StaticPage = {
  id: string;
  key: string;
  title: string;
  content: string;
  updatedAt?: string;
};

export type SiteInfo = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  whatsapp: string;
  mapEmbedUrl: string;
  establishedYear: string;
};

export type ImportAction = "create" | "update";

export type ImportPreviewError = {
  row: number;
  sheet: string;
  field?: string;
  message: string;
};

export type ImportPreviewCategory = {
  rowNumber: number;
  name: string;
  slug: string;
  action: ImportAction;
  existingId?: string | null;
};

export type ImportPreviewProduct = {
  rowNumber: number;
  name: string;
  slug: string;
  categoryName: string;
  price?: number | null;
  action: ImportAction;
  existingId?: string | null;
};

export type ImportPreviewSummary = {
  categoriesToCreate: number;
  categoriesToUpdate: number;
  productsToCreate: number;
  productsToUpdate: number;
  errorCount: number;
};

export type ImportPreviewResult = {
  importId: string;
  fileName: string;
  expiresAt: string;
  summary: ImportPreviewSummary;
  categories: ImportPreviewCategory[];
  products: ImportPreviewProduct[];
  errors: ImportPreviewError[];
};
