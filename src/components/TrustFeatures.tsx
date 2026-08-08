import { Hand, MapPin, MessageCircle, Sparkles } from "lucide-react";

const features = [
  {
    icon: Hand,
    title: "Handcrafted Quality",
    description: "Kiln-dried hardwoods and traditional joinery",
  },
  {
    icon: MapPin,
    title: "Pan-India Delivery",
    description: "Careful packing and scheduled delivery",
  },
  {
    icon: MessageCircle,
    title: "Dedicated Support",
    description: "Personal guidance from enquiry to install",
  },
  {
    icon: Sparkles,
    title: "Custom Options",
    description: "Sizes and finishes tailored to your home",
  },
] as const;

export function TrustFeatures({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "border-b border-cream/10 bg-brown-dark"
          : "border-y border-brown-light/40 bg-white"
      }
    >
      <ul className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-12">
        {features.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-4">
            <span
              className={
                isDark
                  ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/40 text-gold"
                  : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brown-light/60 bg-cream text-brown-dark"
              }
            >
              <Icon size={20} strokeWidth={1.5} />
            </span>
            <div>
              <p
                className={
                  isDark
                    ? "text-sm font-semibold text-cream"
                    : "text-sm font-semibold text-brown-dark"
                }
              >
                {title}
              </p>
              <p
                className={
                  isDark ? "mt-1 text-xs text-cream/60" : "mt-1 text-xs text-brown-mid"
                }
              >
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
