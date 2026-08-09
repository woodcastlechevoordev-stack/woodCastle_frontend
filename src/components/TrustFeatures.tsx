import { brandStats } from "@/lib/brand";

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
      <ul className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-14">
        {brandStats.map(({ value, label, detail }) => (
          <li key={label} className="text-center sm:text-left">
            <p
              className={
                isDark
                  ? "font-heading text-3xl text-gold sm:text-4xl"
                  : "font-heading text-3xl text-brown-dark sm:text-4xl"
              }
            >
              {value}
            </p>
            <p
              className={
                isDark
                  ? "mt-2 text-sm font-semibold uppercase tracking-wider text-cream"
                  : "mt-2 text-sm font-semibold uppercase tracking-wider text-brown-dark"
              }
            >
              {label}
            </p>
            <p
              className={
                isDark ? "mt-1 text-xs text-cream/55" : "mt-1 text-xs text-brown-mid"
              }
            >
              {detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
