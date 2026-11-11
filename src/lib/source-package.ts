import JSZip from "jszip";

type SiteTemplate = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  accent: string;
  features: string[];
  sections: Array<{ eyebrow: string; title: string; body: string }>;
};

const templates: Record<string, SiteTemplate> = {
  "lattice-elite-fashion": {
    id: "lattice-elite-fashion",
    name: "Lattice Elite Fashion Portal",
    category: "Fashion & Retail",
    tagline: "A considered wardrobe, made for your next chapter.",
    accent: "#de8e9c",
    features: ["Lookbook gallery", "Size and color variants", "Instagram feed integration", "Korapay-ready checkout guide"],
    sections: [
      { eyebrow: "The new collection", title: "Wear what moves you.", body: "Discover considered pieces, thoughtful details, and a lookbook made to inspire your everyday wardrobe." },
      { eyebrow: "Made to be worn", title: "Find your fit.", body: "Showcase product photography, available sizes, colors, and care notes in one clear shopping experience." },
    ],
  },
  "aerofit-wellness": {
    id: "aerofit-wellness",
    name: "AeroFit Wellness Portal",
    category: "Fitness & Gym",
    tagline: "Build strength. Find your rhythm. Feel the difference.",
    accent: "#73c6bc",
    features: ["Booking schedule calendar", "Fitness product store", "Transformation tracker UI", "Video tutorial hub"],
    sections: [
      { eyebrow: "Your next session", title: "Progress, on your terms.", body: "Explore coaching, book a session, and find a training rhythm that fits real life." },
      { eyebrow: "Training library", title: "A stronger routine starts here.", body: "Bring coaching videos, class schedules, and practical wellness tools together in one place." },
    ],
  },
  "omnivendor-smart-store": {
    id: "omnivendor-smart-store",
    name: "OmniVendor Smart Store",
    category: "General E-Commerce",
    tagline: "Everything you need, in one easy place.",
    accent: "#88b7ee",
    features: ["Quick checkout buttons", "WhatsApp ordering fallback", "Inventory count banners"],
    sections: [
      { eyebrow: "Shop the collection", title: "Good finds. Fast checkout.", body: "Make it easy to discover products, check availability, and choose how to place an order." },
      { eyebrow: "Here to help", title: "Shop with confidence.", body: "Clear product details and a helpful WhatsApp contact keep every purchase moving." },
    ],
  },
  "apex-corporate-hub": {
    id: "apex-corporate-hub",
    name: "Apex Corporate Hub",
    category: "Professional Services",
    tagline: "Clear thinking. Trusted expertise. Better outcomes.",
    accent: "#85c3a2",
    features: ["Quote request forms", "Floating WhatsApp support", "Client testimonials layout"],
    sections: [
      { eyebrow: "Professional services", title: "Make your next move with confidence.", body: "A focused introduction to your expertise, approach, and the outcomes your clients value." },
      { eyebrow: "Trusted by clients", title: "Good work speaks for itself.", body: "Share client stories and make it simple for prospective customers to request a tailored quote." },
    ],
  },
  "bitespeed-food-bakery": {
    id: "bitespeed-food-bakery",
    name: "BiteSpeed Food & Bakery Delivery",
    category: "Restaurant & Catering",
    tagline: "Freshly made, ready when you are.",
    accent: "#edaa65",
    features: ["Interactive digital menu", "Delivery fee calculator UI", "Instant order notification UI"],
    sections: [
      { eyebrow: "From our kitchen", title: "A little joy in every order.", body: "Browse a fresh, easy-to-read menu and find something made for your table." },
      { eyebrow: "Order your way", title: "Good food, delivered simply.", body: "Show delivery details, service areas, and clear next steps from menu to order." },
    ],
  },
  "lattice-chronicle-media": {
    id: "lattice-chronicle-media",
    name: "Lattice Chronicle Media Blog",
    category: "Content & Media",
    tagline: "Stories and ideas worth spending time with.",
    accent: "#a89ce4",
    features: ["AdSense-ready layout area", "Newsletter subscription form", "Lightweight responsive pages"],
    sections: [
      { eyebrow: "The latest stories", title: "A fresh perspective, every day.", body: "Build an editorial home for your reporting, essays, interviews, and community." },
      { eyebrow: "Stay in the loop", title: "The stories come to you.", body: "Invite readers to subscribe and make it easy to discover more of what they love." },
    ],
  },
};

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function buildHtml(site: SiteTemplate) {
  const sections = site.sections
    .map(
      (section, index) => `
        <section class="story ${index === 0 ? "story-featured" : ""}" id="${index === 0 ? "about" : "details"}">
          <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
          ${index === 0 ? `<a class="text-link" href="#highlights">Discover what we offer <span aria-hidden="true">→</span></a>` : ""}
        </section>`,
    )
    .join("");
  const features = site.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("\n          ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(site.tagline)}" />
    <meta name="theme-color" content="#111715" />
    <title>${escapeHtml(site.name)}</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="script.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <a class="wordmark" href="#top" aria-label="${escapeHtml(site.name)} home">${escapeHtml(site.name)}</a>
      <nav aria-label="Main navigation"><a href="#about">About</a><a href="#highlights">Highlights</a><a href="#contact">Contact</a></nav>
    </header>
    <main id="top">
      <section class="masthead">
        <p class="eyebrow">${escapeHtml(site.category)} <span aria-hidden="true">/</span> Eminent Lattice</p>
        <h1>${escapeHtml(site.name)}</h1>
        <p class="lede">${escapeHtml(site.tagline)}</p>
        <a class="button-link" href="#highlights">Explore the experience <span aria-hidden="true">→</span></a>
      </section>
      <div class="story-grid">${sections}
      </div>
      <section class="highlights" id="highlights">
        <div><p class="eyebrow">The experience</p><h2>Thoughtful details.<br />Made for real people.</h2></div>
        <ul>${features}</ul>
      </section>
      <section class="contact" id="contact">
        <p class="eyebrow">Let’s connect</p><h2>Have a question?</h2>
        <p>Tell us what you are looking for and our team will be happy to help.</p>
        <form id="contact-form">
          <label for="email">Your email address</label>
          <div class="form-row"><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required /><button type="submit">Send a message</button></div>
          <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>
    <footer><span>${escapeHtml(site.name)}</span><a href="#top">Back to top ↑</a></footer>
  </body>
</html>
`;
}

function buildStyles(site: SiteTemplate) {
  return `:root {
  color-scheme: dark;
  --page: #111715;
  --surface: #19211e;
  --ink: #f3f4ed;
  --muted: #adb8b0;
  --line: #34403a;
  --accent: ${site.accent};
  font-family: Inter, "Segoe UI", sans-serif;
  font-synthesis: none;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--page); color: var(--ink); }
a { color: inherit; }
.site-header, main, footer { width: min(1120px, calc(100% - 48px)); margin-inline: auto; }
.site-header { min-height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 24px; border-bottom: 1px solid var(--line); }
.wordmark { max-width: 60%; font-size: 14px; font-weight: 700; text-decoration: none; }
nav { display: flex; gap: clamp(14px, 3vw, 32px); }
nav a, footer a { color: var(--muted); font-size: 13px; text-decoration: none; }
nav a:hover, footer a:hover, .text-link:hover { color: var(--accent); }
.masthead { padding: clamp(72px, 12vw, 140px) 0 88px; border-bottom: 1px solid var(--line); }
.eyebrow { color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
h1, h2, p { margin-top: 0; }
h1 { max-width: 850px; margin-bottom: 24px; font-size: clamp(42px, 8vw, 86px); line-height: 1.04; }
.lede { max-width: 580px; color: var(--muted); font-size: clamp(17px, 2.3vw, 22px); line-height: 1.7; }
.button-link, button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 12px; border: 1px solid var(--accent); background: var(--accent); color: var(--page); font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; padding: 0 18px; }
.button-link { margin-top: 20px; }
.story-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid var(--line); }
.story { padding: 48px clamp(20px, 5vw, 60px) 52px 0; }
.story + .story { border-left: 1px solid var(--line); padding-left: clamp(20px, 5vw, 60px); padding-right: 0; }
.story h2, .highlights h2, .contact h2 { max-width: 540px; margin-bottom: 18px; font-size: clamp(28px, 4.2vw, 46px); line-height: 1.15; }
.story > p:not(.eyebrow), .contact > p:not(.eyebrow) { color: var(--muted); line-height: 1.8; }
.text-link { display: inline-flex; gap: 10px; margin-top: 12px; color: var(--accent); font-size: 14px; font-weight: 700; text-decoration: none; }
.highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 72px 0; border-bottom: 1px solid var(--line); }
.highlights ul { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.highlights li { padding: 15px 0; border-bottom: 1px solid var(--line); color: var(--muted); }
.highlights li::before { content: "+"; margin-right: 14px; color: var(--accent); }
.contact { max-width: 700px; padding: 72px 0 80px; }
.contact form { margin-top: 28px; }
.contact label { display: block; margin-bottom: 10px; font-size: 13px; }
.form-row { display: flex; gap: 10px; }
input { width: 100%; min-width: 0; min-height: 46px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 0 14px; font: inherit; }
.form-status { min-height: 22px; margin-top: 12px; color: var(--accent); font-size: 13px; }
footer { display: flex; justify-content: space-between; gap: 20px; padding: 24px 0; border-top: 1px solid var(--line); font-size: 13px; }
@media (max-width: 650px) {
  .site-header, main, footer { width: min(100% - 32px, 1120px); }
  .site-header { min-height: 68px; align-items: flex-start; flex-direction: column; justify-content: center; gap: 8px; padding-block: 12px; }
  nav { gap: 18px; }
  .wordmark { max-width: 100%; }
  .story-grid, .highlights { grid-template-columns: 1fr; }
  .story { padding: 36px 0; }
  .story + .story { border-top: 1px solid var(--line); border-left: 0; padding: 36px 0; }
  .highlights { gap: 20px; padding: 52px 0; }
  .form-row { flex-direction: column; }
  .form-row button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;
}

function buildScript(site: SiteTemplate) {
  const encodedSiteName = JSON.stringify(site.name);
  return `"use strict";

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  if (!email) return;
  if (status) {
    status.textContent = "Thanks for reaching out to " + ${encodedSiteName} + ". Connect this form to your own secure email or CRM service to receive real submissions.";
  }
  form.reset();
});
`;
}

function buildReadme(site: SiteTemplate) {
  return `# ${site.name}

Starter website package for **${site.category}**. It contains the requested HTML, CSS, JavaScript, and this setup guide.

## Run locally

1. Extract the ZIP archive into a folder.
2. Open index.html in a modern browser, or serve this folder with your preferred static web host.
3. Edit the page text and product details in index.html. Adjust the visual theme in styles.css.

## Included starter sections

${site.features.map((feature) => `- ${feature}`).join("\n")}

The contact form currently provides a front-end confirmation only. Connect it to a service you control before relying on it for customer submissions.

## Korapay integration guide

This starter does not initiate or verify real payments. It intentionally contains no API key, secret, live checkout endpoint, or payment credentials. Never put a Korapay secret in browser JavaScript or a public static file.

For a live payment flow:

1. Create a private server endpoint that accepts a product identifier and customer email, then validates both against your own product catalogue and price records.
2. Keep your Korapay secret in your hosting provider's private server environment. From the server only, initialize the charge with the fixed NGN amount, a unique order reference, and the selected supported payment channel.
3. Return only the provider's validated HTTPS checkout URL to the browser and send the customer to Korapay's hosted checkout.
4. Configure a server-side webhook receiver. Verify each event with Korapay's documented verification method and independently fetch/verify the charge on the server. Match order reference, exact amount, currency, and final successful status before fulfilling an order.
5. Make fulfillment idempotent: atomically mark the order paid and the listing sold once. Never treat a browser return URL as proof of payment.
6. Test with Korapay's supported test environment and consult its current merchant documentation before production launch.

The sample contact form is not a checkout form. Add the server endpoints, database order tracking, webhook verification, and production configuration in infrastructure you control before accepting payments.

## Included files

- index.html — semantic, responsive page content
- styles.css — mobile-friendly visual theme
- script.js — contact-form demonstration behavior
- README.md — setup and payment-integration guidance
`;
}

export async function buildProductSourceArchive(productId: string) {
  const site = templates[productId];
  if (!site) throw new Error("Source package is not available for this listing.");

  const zip = new JSZip();
  zip.file("index.html", buildHtml(site));
  zip.file("styles.css", buildStyles(site));
  zip.file("script.js", buildScript(site));
  zip.file("README.md", buildReadme(site));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}