/** Static brand facts — hardcoded per frontend spec §3.8 (not CMS-managed). */

export const brand = {
  yearsOfLegacy: 44,
  establishedYear: "1982",
  customersLabel: "10 Lakh+",
  material: "100% Teak Wood",
  tagline: "Kerala's Best Furniture",
  locationShort: "Chevoor, Thrissur",
  locationFull: "Chevoor, Thrissur, Kerala",
  legacyLine: "44 Years of Trusted Craftsmanship — Chevoor, Thrissur, Kerala",
  originStory:
    "One of the first furniture shops in Thrissur's Chevoor, crafting solid teak pieces for Kerala homes for over four decades.",
} as const;

export const brandStats = [
  {
    value: "44",
    label: "Years of Legacy",
    detail: "Trusted craftsmanship since 1982",
  },
  {
    value: "100%",
    label: "Teak Wood",
    detail: "Solid teak in every piece we build",
  },
  {
    value: "10 Lakh+",
    label: "Happy Customers",
    detail: "Homes furnished across Kerala & beyond",
  },
  {
    value: "Since 1982",
    label: "Chevoor, Thrissur",
    detail: "One of the first furniture shops in the area",
  },
] as const;
