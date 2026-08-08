import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[+\d\s()-]{10,15}$/, "Enter a valid phone number"),
  message: z.string().min(10, "Please share a bit more detail (min 10 characters)"),
  productId: z.string().min(1),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6, "Enter the 6-digit code"),
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
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  featured: z.boolean(),
  inStock: z.boolean(),
  metaTitle: z.string().min(2),
  metaDescription: z.string().min(10),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  metaTitle: z.string().min(2),
  metaDescription: z.string().min(10),
});

export const offerFormSchema = z.object({
  title: z.string().min(2),
  discountText: z.string().min(2),
  description: z.string().min(10),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  active: z.boolean(),
});

export const blogFormSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().min(10),
  content: z.string().min(20),
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
