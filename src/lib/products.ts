export type MarketplaceProduct = {
  id: string;
  title: string;
  category: string;
  price: string;
  features: string[];
  isSold: boolean;
};

const productPreviewUrls: Record<string, string> = {
  "lattice-elite-fashion": "/preview/fashion",
  "aerofit-wellness": "/preview/fitness",
  "omnivendor-smart-store": "/preview/omnivendor",
  "apex-corporate-hub": "/preview/corporate",
  "bitespeed-food-bakery": "/preview/food",
  "lattice-chronicle-media": "/preview/media",
};

export function getProductPreviewUrl(productId: string) {
  return productPreviewUrls[productId] ?? null;
}

export const products: MarketplaceProduct[] = [
  {
    id: "lattice-elite-fashion",
    title: "Lattice Elite Fashion Portal",
    category: "Fashion & Retail",
    price: "₦200,000",
    features: [
      "Lookbook gallery",
      "Size/color variant selectors",
      "Instagram feed integration",
      "Korapay ready",
    ],
    isSold: false,
  },
  {
    id: "aerofit-wellness",
    title: "AeroFit Wellness Portal",
    category: "Fitness & Gym",
    price: "₦180,000",
    features: [
      "Booking schedule calendar",
      "Product store",
      "Weight/transformation tracker UI",
      "Video tutorial hub",
    ],
    isSold: false,
  },
  {
    id: "omnivendor-smart-store",
    title: "OmniVendor Smart Store",
    category: "General E-Commerce",
    price: "₦150,000",
    features: [
      "Quick checkout buttons",
      "WhatsApp ordering fallback chat",
      "Inventory count banners",
    ],
    isSold: false,
  },
  {
    id: "apex-corporate-hub",
    title: "Apex Corporate Hub",
    category: "Professional Services",
    price: "₦250,000",
    features: [
      "High-converting quote request forms",
      "Live WhatsApp support floating button",
      "Client testimonials layout",
    ],
    isSold: false,
  },
  {
    id: "bitespeed-food-bakery",
    title: "BiteSpeed Food & Bakery Delivery",
    category: "Restaurant & Catering",
    price: "₦180,000",
    features: [
      "Interactive digital menu",
      "Delivery fee calculator by location",
      "Instant order notifications",
    ],
    isSold: false,
  },
  {
    id: "lattice-chronicle-media",
    title: "Lattice Chronicle Media Blog",
    category: "Content & Media",
    price: "₦100,000",
    features: [
      "Google AdSense monetization layout",
      "Newsletter subscription form",
      "Fast loading speed",
    ],
    isSold: false,
  },
];

export function canPurchaseProduct(isSold: boolean) {
  return !isSold;
}

export function getProductAmountInNaira(price: string) {
  const amount = Number(price.replace(/[^0-9]/g, ""));
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Invalid product price");
  }
  return amount;
}