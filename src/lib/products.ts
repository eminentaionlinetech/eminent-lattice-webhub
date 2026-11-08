export type MarketplaceProduct = {
  id: string;
  title: string;
  category: string;
  price: string;
  features: string[];
  isSold: boolean;
};

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

export function getProductPurchaseState(isSold: boolean) {
  return isSold ? "sold" : "available";
}