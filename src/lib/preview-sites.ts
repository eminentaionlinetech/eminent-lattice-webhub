import fashionImage from "@/assets/previews/fashion-editorial.jpg";
import fitnessImage from "@/assets/previews/wellness-training.jpg";
import storeImage from "@/assets/previews/smart-store-products.jpg";
import corporateImage from "@/assets/previews/corporate-architecture.jpg";
import foodImage from "@/assets/previews/food-bakery.jpg";
import mediaImage from "@/assets/previews/media-editorial.jpg";

export type PreviewKind = "fashion" | "fitness" | "store" | "corporate" | "food" | "media";

export type PreviewSite = {
  productId: string;
  slug: string;
  kind: PreviewKind;
  name: string;
  brand: string;
  eyebrow: string;
  headline: string;
  description: string;
  image: string;
  imageAlt: string;
  nav: string[];
};

export const previewSites: PreviewSite[] = [
  {
    productId: "lattice-elite-fashion",
    slug: "fashion",
    kind: "fashion",
    name: "Lattice Elite Fashion Portal",
    brand: "LATTICE / ATELIER",
    eyebrow: "THE LAGOS EDIT · 2026",
    headline: "Presence,\nperfected.",
    description: "Considered pieces for the way you move through the world. Discover the new season, made for your own point of view.",
    image: fashionImage,
    imageAlt: "Model in a sculptural cobalt and ivory outfit in a sunlit studio",
    nav: ["New arrivals", "Clothing", "The journal"],
  },
  {
    productId: "aerofit-wellness",
    slug: "fitness",
    kind: "fitness",
    name: "AeroFit Wellness Portal",
    brand: "AEROFIT / STUDIO",
    eyebrow: "MOVE WELL. LIVE FULLY.",
    headline: "Find your\nstrong.",
    description: "Expert-led training that meets you where you are. Build momentum with thoughtful coaching, real community, and a plan that fits your life.",
    image: fitnessImage,
    imageAlt: "Athlete training with a dumbbell in a light-filled modern gym",
    nav: ["Training", "Our coaches", "Membership"],
  },
  {
    productId: "omnivendor-smart-store",
    slug: "omnivendor",
    kind: "store",
    name: "OmniVendor Smart Store",
    brand: "COMMON / OBJECTS",
    eyebrow: "GOOD THINGS, THOUGHTFULLY FOUND",
    headline: "Everyday,\nbetter made.",
    description: "Useful objects for slower mornings, clearer thinking, and the little rituals that make a space your own.",
    image: storeImage,
    imageAlt: "Curated home and personal tech objects on a clean tabletop",
    nav: ["Shop all", "Audio", "Home & living"],
  },
  {
    productId: "apex-corporate-hub",
    slug: "corporate",
    kind: "corporate",
    name: "Apex Corporate Hub",
    brand: "APEX / PARTNERS",
    eyebrow: "STRATEGY · DESIGN · DELIVERY",
    headline: "Built for\nwhat’s next.",
    description: "We partner with ambitious teams to turn complex challenges into confident, enduring businesses.",
    image: corporateImage,
    imageAlt: "Contemporary glass and concrete office surrounded by tropical landscaping",
    nav: ["What we do", "Our work", "The firm"],
  },
  {
    productId: "bitespeed-food-bakery",
    slug: "food",
    kind: "food",
    name: "BiteSpeed Food & Bakery Delivery",
    brand: "MORNING / CRUMB",
    eyebrow: "BAKED FRESH IN LAGOS · EST. 2018",
    headline: "A little\nmore morning.",
    description: "Slow-fermented loaves, flaky things, and small-batch favourites—made with care and ready for your table.",
    image: foodImage,
    imageAlt: "Fresh golden croissants, bread, and pastries at a Lagos bakery",
    nav: ["The bakery", "Our menu", "Find us"],
  },
  {
    productId: "lattice-chronicle-media",
    slug: "media",
    kind: "media",
    name: "Lattice Chronicle Media Blog",
    brand: "THE / CHRONICLE",
    eyebrow: "ISSUE 08 · CULTURE IN MOTION",
    headline: "Stories that\nstay with us.",
    description: "Notes on the people, ideas, and places shaping a more thoughtful African creative culture.",
    image: mediaImage,
    imageAlt: "Nigerian writer reading a journal in a sunlit Lagos studio",
    nav: ["Culture", "People", "Dispatches"],
  },
];

export function getPreviewSiteBySlug(slug: string) {
  return previewSites.find((site) => site.slug === slug) ?? null;
}

export function getPreviewSiteByProductId(productId: string) {
  return previewSites.find((site) => site.productId === productId) ?? null;
}