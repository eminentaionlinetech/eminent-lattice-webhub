import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Menu, Plus, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPreviewSiteBySlug, previewSites, type PreviewSite } from "@/lib/preview-sites";

export const Route = createFileRoute("/preview/$slug")({
  beforeLoad: ({ params }) => {
    if (!getPreviewSiteBySlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const site = getPreviewSiteBySlug(params.slug);
    const title = site ? `${site.name} — Live Demo` : "Website Demo — Eminent Lattice Web-Hub";
    const description = site ? `Explore the live interactive ${site.name} website demo.` : "Explore a live website demo from Eminent Lattice Web-Hub.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: PreviewPage,
  notFoundComponent: () => <main className="flex min-h-screen items-center justify-center bg-background p-8 text-center"><div><p className="font-mono text-xs uppercase text-primary">Demo not found</p><h1 className="mt-3 font-display text-3xl">This website demo is unavailable.</h1><a className="mt-6 inline-flex items-center gap-2 text-sm text-primary" href="/">Return to marketplace <ArrowRight size={16} /></a></div></main>,
});

function PreviewPage() {
  const { slug } = Route.useParams();
  const site = getPreviewSiteBySlug(slug);
  const [activeNav, setActiveNav] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notice, setNotice] = useState("");
  if (!site) return null;

  const buy = () => { window.location.assign(`/?checkout=${encodeURIComponent(site.productId)}#explore`); };
  const jumpToContent = () => document.getElementById("demo-content")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className={`demo-page demo-${site.kind} min-h-screen text-foreground`}>
      <div className="demo-ribbon fixed inset-x-0 top-0 z-50 flex min-h-14 items-center justify-between gap-3 border-b border-border px-4 sm:px-7">
        <a href="/" className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex"><ArrowLeft size={15} /> Marketplace</a>
        <p className="mx-auto flex items-center gap-2 text-center text-[11px] font-semibold sm:text-xs"><span className="size-1.5 animate-pulse rounded-full bg-primary" /> Live Demo Preview <span className="hidden text-muted-foreground sm:inline">— Eminent Lattice Web-Hub</span></p>
        <Button size="sm" onClick={() => void buy()} className="h-9 shrink-0 rounded-sm px-3 text-xs sm:px-4">Buy This Website <ArrowUpRight size={14} /></Button>
      </div>

      <div className="demo-store-shell mx-auto max-w-[1480px] px-5 pb-20 pt-14 sm:px-8 lg:px-14">
        <header className="relative z-10 flex min-h-[84px] items-center justify-between border-b border-current/15">
          <a href="#top" className="font-display text-base font-semibold tracking-[0.06em] sm:text-lg">{site.brand}</a>
          <nav className={`demo-nav ${menuOpen ? "demo-nav-open" : ""}`} aria-label={`${site.brand} navigation`}>
            {site.nav.map((item, index) => <button key={item} type="button" onClick={() => { setActiveNav(index); setMenuOpen(false); jumpToContent(); }} className={`demo-nav-link ${activeNav === index ? "demo-nav-active" : ""}`}>{item}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            {(site.kind === "fashion" || site.kind === "store" || site.kind === "food") && <button type="button" onClick={() => setNotice(cartCount ? `${cartCount} item${cartCount === 1 ? "" : "s"} in your bag` : "Your bag is ready for something good.")} aria-label={`Shopping bag, ${cartCount} items`} className="relative grid size-10 place-items-center"><ShoppingBag size={18} />{cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{cartCount}</span>}</button>}
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid size-10 place-items-center md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </header>

        <DemoHero site={site} onExplore={jumpToContent} />

        <section id="demo-content" className="demo-content scroll-mt-24 border-t border-current/15 py-16 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div><p className="demo-eyebrow">{contentEyebrow(site, activeNav)}</p><h2 className="demo-section-title mt-3">{contentTitle(site, activeNav)}</h2></div>
            <span className="demo-count">{site.kind === "media" ? "THE LATEST STORIES" : site.kind === "corporate" ? "SELECTED WORK" : "A CURATED COLLECTION"} <ArrowDown size={13} className="ml-2 inline" /></span>
          </div>

          {site.kind === "fitness" && <div className="mb-9 flex flex-wrap gap-2">{["All", "Strength", "Mobility", "Conditioning"].map((filter) => <button key={filter} onClick={() => setSelectedFilter(filter)} className={`demo-filter ${selectedFilter === filter ? "demo-filter-active" : ""}`}>{filter}</button>)}</div>}
          {site.kind === "food" && <div className="mb-9 flex flex-wrap gap-2">{["All", "Pastries", "Bread", "Drinks"].map((filter) => <button key={filter} onClick={() => setSelectedFilter(filter)} className={`demo-filter ${selectedFilter === filter ? "demo-filter-active" : ""}`}>{filter}</button>)}</div>}

          {site.kind === "fashion" && <FashionContent onAdd={() => setCartCount((count) => count + 1)} selectedSize={selectedSize} setSelectedSize={setSelectedSize} />}
          {site.kind === "fitness" && <FitnessContent filter={selectedFilter} onSelect={(value) => setNotice(value)} />}
          {site.kind === "store" && <StoreContent onAdd={() => setCartCount((count) => count + 1)} />}
          {site.kind === "corporate" && <CorporateContent onSelect={(value) => setNotice(value)} />}
          {site.kind === "food" && <FoodContent filter={selectedFilter} onAdd={() => setCartCount((count) => count + 1)} />}
          {site.kind === "media" && <MediaContent onSelect={(value) => setNotice(value)} />}
        </section>
        <DemoFooter site={site} onBuy={() => void buy()} />
      </div>
      {notice && <div role="status" className="demo-toast fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-current/20 px-4 py-3 text-sm shadow-xl"><Check size={16} />{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification" className="ml-2"><X size={15} /></button></div>}
    </main>
  );
}

function DemoHero({ site, onExplore }: { site: PreviewSite; onExplore: () => void }) {
  return <section id="top" className={`demo-hero demo-hero-${site.kind}`}>
    <div className="demo-hero-copy">
      <p className="demo-eyebrow">{site.eyebrow}</p>
      <h1 className="demo-headline">{site.headline.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
      <p className="demo-description">{site.description}</p>
      <Button onClick={onExplore} className="demo-cta mt-8 rounded-sm">{heroCta(site)} <ArrowRight size={16} /></Button>
      {site.kind === "food" && <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.1em] opacity-65">Same-day delivery · Lagos Mainland & Island</p>}
      {site.kind === "fitness" && <div className="mt-7 flex gap-7 text-xs"><span><b className="mr-1 text-base">4.9</b> member rating</span><span><b className="mr-1 text-base">1.2k</b> strong together</span></div>}
    </div>
    <div className="demo-hero-visual"><img src={site.image} alt={site.imageAlt} width={1024} height={768} fetchPriority="high"/><span className="demo-image-caption">{site.kind === "fashion" ? "THE NEW SEASON / 01" : site.kind === "media" ? "PEOPLE · PLACES · IDEAS" : site.kind === "food" ? "FRESH FROM THE OVEN" : site.brand}</span></div>
    <div className="demo-hero-foot"><span>SCROLL TO EXPLORE</span><span>01 — 06</span></div>
  </section>;
}

function FashionContent({ onAdd, selectedSize, setSelectedSize }: { onAdd: () => void; selectedSize: string; setSelectedSize: (size: string) => void }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[
    ["The sculpted set", "₦84,000", "COBALT / IVORY"], ["Soft structure blazer", "₦68,500", "WARM SAND"], ["Everyday statement", "₦42,000", "MIDNIGHT"],
  ].map(([name, price, color], index) => <article key={name} className="demo-product"><div className="demo-product-image"><img src={index === 0 ? previewSites[0]?.image : previewSites[0]?.image} alt="Lattice Elite seasonal fashion collection" loading="lazy" width={1024} height={768}/><span className="demo-product-number">0{index + 1}</span></div><div className="mt-4 flex justify-between gap-3"><div><h3>{name}</h3><p className="demo-small-label mt-1">{color}</p></div><span className="font-medium">{price}</span></div><div className="mt-4 flex items-center justify-between gap-3"><div className="flex gap-1.5">{["XS", "S", "M", "L"].map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`demo-size ${selectedSize === size ? "demo-size-active" : ""}`}>{size}</button>)}</div><button onClick={onAdd} className="demo-add-button">Add to bag <Plus size={14}/></button></div></article>)}</div>;
}

function FitnessContent({ filter, onSelect }: { filter: string; onSelect: (value: string) => void }) {
  const classes = [["Strength foundations", "TUE · 7:00 AM", "Coach Amara", "STRENGTH"], ["Reset & restore", "WED · 6:30 PM", "Coach Tolu", "MOBILITY"], ["Power hour", "SAT · 9:00 AM", "Coach Femi", "CONDITIONING"]];
  const visible = filter === "All" ? classes : classes.filter((item) => item[3] === filter.toUpperCase());
  return <div className="grid gap-4 md:grid-cols-3">{visible.map(([name, time, coach, category], index) => <article key={name} className="demo-session"><div className="flex items-center justify-between"><span className="demo-session-index">0{index + 1} / {category}</span><ArrowUpRight size={17}/></div><h3 className="mt-12 font-display text-2xl">{name}</h3><p className="mt-2 text-sm opacity-65">A focused, coach-led session for every level.</p><div className="mt-7 flex items-center justify-between border-t border-current/15 pt-4 text-xs"><span>{time} · {coach}</span><button onClick={() => onSelect(`${name} added to your booking list.`)} className="demo-link-button">Reserve <ArrowRight size={14}/></button></div></article>)}</div>;
}

function StoreContent({ onAdd }: { onAdd: () => void }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[["Studio headphones", "₦92,000"], ["Everyday camera", "₦146,000"], ["Field notes set", "₦12,500"]].map(([name, price], index) => <article key={name} className="demo-product"><div className={`demo-store-swatch demo-store-swatch-${index}`}><img src={previewSites[2]?.image} alt="Curated Common Objects collection" loading="lazy" width={1024} height={768}/><span className="demo-product-number">SELECTED / 0{index + 1}</span></div><div className="mt-4 flex justify-between gap-3"><div><h3>{name}</h3><p className="demo-small-label mt-1">OBJECTS FOR DAILY LIVING</p></div><span className="font-medium">{price}</span></div><button onClick={onAdd} className="demo-store-add mt-4">Add to basket <Plus size={15}/></button></article>)}</div>;
}

function CorporateContent({ onSelect }: { onSelect: (value: string) => void }) {
  return <div className="grid gap-5 md:grid-cols-2">{[["01 / DEFINE", "Business strategy", "Find clarity in complexity and build a roadmap made for the long view."], ["02 / CREATE", "Brand & digital", "Bring your next chapter to life with a distinctive identity and digital experience."], ["03 / DELIVER", "Growth partnerships", "Turn intent into lasting momentum with the right people alongside you."]].map(([number, title, body]) => <button key={title} onClick={() => onSelect(`${title}: our team would love to hear what you are building.`)} className="demo-service text-left"><span className="demo-small-label">{number}</span><h3 className="mt-8 font-display text-2xl">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 opacity-65">{body}</p><span className="demo-link-button mt-6">Explore the work <ArrowRight size={14}/></span></button>)}</div>;
}

function FoodContent({ filter, onAdd }: { filter: string; onAdd: () => void }) {
  const menu = [["Butter croissant", "₦2,800", "PASTRIES"], ["Country sourdough", "₦6,500", "BREAD"], ["Cinnamon morning bun", "₦3,200", "PASTRIES"], ["House ginger fizz", "₦2,400", "DRINKS"]];
  const visible = filter === "All" ? menu : menu.filter((item) => item[2] === filter.toUpperCase());
  return <div className="grid gap-4 md:grid-cols-2">{visible.map(([name, price, category], index) => <article key={name} className="demo-menu-item"><div className="demo-menu-thumb"><img src={previewSites[4]?.image} alt="Fresh bakery selection" loading="lazy" width={1024} height={768}/></div><div className="min-w-0 flex-1"><p className="demo-small-label">{category} · MADE TODAY</p><h3 className="mt-1 font-display text-lg">{name}</h3><p className="mt-1 text-sm opacity-65">Baked in small batches, with the very best ingredients.</p><div className="mt-3 flex items-center justify-between"><b>{price}</b><button onClick={onAdd} aria-label={`Add ${name} to order`} className="demo-round-action"><Plus size={16}/></button></div></div><span className="demo-menu-number">0{index + 1}</span></article>)}</div>;
}

function MediaContent({ onSelect }: { onSelect: (value: string) => void }) {
  return <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]"><button type="button" className="demo-feature-story text-left" onClick={() => onSelect("Opening story: The art of making room for new voices.")}><img src={previewSites[5]?.image} alt="Lagos creative reading a journal" loading="lazy" width={1024} height={768}/><span className="demo-story-overlay"><span className="demo-small-label">CULTURE · 8 MIN READ</span><span className="mt-3 block max-w-xl font-display text-3xl sm:text-4xl">The art of making room for new voices</span><span className="mt-4 inline-flex items-center gap-2 text-sm">Read the story <ArrowRight size={15}/></span></span></button><div className="grid gap-4">{[["PEOPLE", "A new generation of makers is changing the conversation"], ["DISPATCHES", "On finding the quiet corners of Lagos"], ["IDEAS", "Why the stories we keep matter"]].map(([category, title], index) => <button key={title} onClick={() => onSelect(`${category}: ${title}`)} className="demo-story-link text-left"><span className="demo-small-label">0{index + 1} / {category}</span><span className="mt-3 block font-display text-xl">{title}</span><span className="mt-3 inline-flex items-center gap-2 text-xs">Read story <ArrowRight size={13}/></span></button>)}</div></div>;
}

function DemoFooter({ site, onBuy }: { site: PreviewSite; onBuy: () => void }) {
  return <footer className="demo-footer border-t border-current/15 pt-8"><div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><p className="font-display text-lg font-semibold">{site.brand}</p><p className="mt-2 max-w-sm text-sm opacity-60">A complete website experience, designed for the next generation of Nigerian businesses.</p></div><Button variant="outline" onClick={onBuy} className="w-fit rounded-sm border-current/30">Make it yours <ArrowRight size={15}/></Button></div><div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-current/15 pt-4 text-[10px] uppercase tracking-[0.1em] opacity-50"><span>© 2026 {site.brand}</span><span>Built for what’s next / Lagos, Nigeria</span></div></footer>;
}

function contentEyebrow(site: PreviewSite, active: number) {
  if (site.kind === "fitness") return `TRAINING / ${active === 0 ? "FIND YOUR SESSION" : site.nav[active]?.toUpperCase()}`;
  if (site.kind === "corporate") return "HOW WE MOVE BUSINESS FORWARD";
  if (site.kind === "food") return `THE MENU / ${active === 0 ? "FRESH TODAY" : site.nav[active]?.toUpperCase()}`;
  if (site.kind === "media") return `EDITOR'S PICKS / ${site.nav[active]?.toUpperCase()}`;
  return `SELECTED / ${site.nav[active]?.toUpperCase()}`;
}

function contentTitle(site: PreviewSite, active: number) {
  if (site.kind === "fitness") return "A plan that moves with you.";
  if (site.kind === "corporate") return "Good work changes things.";
  if (site.kind === "food") return "The good stuff, today.";
  if (site.kind === "media") return "The stories on our mind.";
  if (site.kind === "fashion") return active === 1 ? "Made for your own rhythm." : "Pieces with a point of view.";
  return active === 1 ? "Made for everyday living." : "The objects we come back to.";
}

function heroCta(site: PreviewSite) {
  if (site.kind === "fitness") return "Explore the sessions";
  if (site.kind === "corporate") return "See what we do";
  if (site.kind === "food") return "Order something good";
  if (site.kind === "media") return "Read the latest";
  return "Explore the collection";
}