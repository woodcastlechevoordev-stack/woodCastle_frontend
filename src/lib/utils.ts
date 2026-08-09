import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export { FALLBACK_IMAGE, safeImageUrl, safeImageUrls } from "./images";
