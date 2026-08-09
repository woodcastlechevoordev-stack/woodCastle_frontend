import { siteInfo } from "@/lib/api";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const ALT =
  "Woodcastle Furniture logo — WC monogram with chair and cabinet in wood and gold";

type SiteLogoProps = {
  /** header = cream nav bar; footer = dark brand column with cream badge */
  variant?: "header" | "footer";
  href?: string;
  className?: string;
  priority?: boolean;
};

export function SiteLogo({
  variant = "header",
  href = "/",
  className,
  priority = false,
}: SiteLogoProps) {
  const isFooter = variant === "footer";

  const image = (
    <Image
      src="/brand/logo.png"
      alt={ALT}
      width={865}
      height={479}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain",
        isFooter ? "h-16 sm:h-[4.5rem]" : "h-12 sm:h-14 lg:h-16",
        className
      )}
      sizes={isFooter ? "180px" : "(max-width: 640px) 140px, 180px"}
    />
  );

  return (
    <Link
      href={href}
      aria-label={`${siteInfo.name} home`}
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        isFooter &&
          "rounded-xl bg-cream/95 px-3.5 py-2.5 shadow-sm ring-1 ring-cream/20"
      )}
    >
      {image}
    </Link>
  );
}
