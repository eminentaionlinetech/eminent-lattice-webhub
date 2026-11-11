import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { buildProductSourceArchive } from "@/lib/source-package";
import { products } from "@/lib/products";

describe("buyer website source packages", () => {
  it("generates complete, site-specific ZIP downloads with safe Korapay guidance", async () => {
    const archive = await buildProductSourceArchive("lattice-elite-fashion");
    const zip = await JSZip.loadAsync(archive);
    const names = Object.keys(zip.files).sort();
    const html = await zip.file("index.html")?.async("string");
    const readme = await zip.file("README.md")?.async("string");

    expect(names).toEqual(["README.md", "index.html", "script.js", "styles.css"]);
    expect(html).toContain("Lattice Elite Fashion Portal");
    expect(html).toContain("Lookbook gallery");
    expect(readme).toContain("Korapay integration guide");
    expect(readme).toContain("Never put a Korapay secret in browser JavaScript");
  });

  it("creates a valid four-file archive for every marketplace listing", async () => {
    for (const product of products) {
      const archive = await buildProductSourceArchive(product.id);
      const zip = await JSZip.loadAsync(archive);
      const html = await zip.file("index.html")?.async("string");
      const readme = await zip.file("README.md")?.async("string");
      const javascript = await zip.file("script.js")?.async("string");

      expect(Object.keys(zip.files).sort(), product.title).toEqual([
        "README.md",
        "index.html",
        "script.js",
        "styles.css",
      ]);
      expect(html, product.title).toContain(product.title);
      expect(readme, product.title).toContain("Korapay integration guide");
      expect(javascript, product.title).toContain("addEventListener");
    }
  });

  it("rejects unknown listings instead of generating an unrelated package", async () => {
    await expect(buildProductSourceArchive("unknown-site")).rejects.toThrow(
      "Source package is not available for this listing.",
    );
  });
});