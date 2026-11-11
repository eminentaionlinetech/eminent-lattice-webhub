import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { buildProductSourceArchive } from "@/lib/source-package";

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

  it("rejects unknown listings instead of generating an unrelated package", async () => {
    await expect(buildProductSourceArchive("unknown-site")).rejects.toThrow(
      "Source package is not available for this listing.",
    );
  });
});