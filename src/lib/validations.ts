import { stripHtml } from "./utils";
import { z } from "zod";

function htmlMin(min: number, message: string) {
  return z.string().refine((html) => stripHtml(html).length >= min, message);
}

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[+\d\s()-]{10,15}$/, "Enter a valid phone number"),
  message: z.string().min(10, "Please share a bit more detail (min 10 characters)"),
  productId: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const totpSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit authenticator code"),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: htmlMin(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  featured: z.boolean(),
  inStock: z.boolean(),
  metaTitle: z.string().trim().min(2, "Meta title is required"),
  metaDescription: z.string().trim().min(10, "Meta description must be at least 10 characters"),
});

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().optional(),
  parentId: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  metaTitle: z.string().trim().min(2, "Meta title is required"),
  metaDescription: z.string().trim().min(10, "Meta description must be at least 10 characters"),
});

export const offerFormSchema = z.object({
  title: z.string().min(2),
  discountText: z.string().min(2),
  description: z.string().min(10),
  bannerImage: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  active: z.boolean(),
});

export const blogFormSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().min(10),
  content: htmlMin(20, "Content must be at least 20 characters"),
  coverImage: z.string().optional(),
  metaTitle: z.string().min(2),
  metaDescription: z.string().min(10),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
