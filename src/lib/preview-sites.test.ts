import { describe, expect, it } from "vitest";

import { getPreviewSiteByProductId, getPreviewSiteBySlug, previewSites } from "@/lib/preview-sites";

describe("website demos", () => {
  it("provides one dedicated demo route for each of the six marketplace products", () => {
    expect(previewSites.map(({ slug, productId }) => [slug, productId])).toEqual([
      ["fashion", "lattice-elite-fashion"],
      ["fitness", "aerofit-wellness"],
      ["omnivendor", "omnivendor-smart-store"],
      ["corporate", "apex-corporate-hub"],
      ["food", "bitespeed-food-bakery"],
      ["media", "lattice-chronicle-media"],
    ]);
  });

  it("returns no demo for unknown product or route identifiers", () => {
    expect(getPreviewSiteBySlug("unknown")).toBeNull();
    expect(getPreviewSiteByProductId("unknown")).toBeNull();
  });
});