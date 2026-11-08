import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Hexagon, Layers3, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canPurchaseProduct, products, type MarketplaceProduct } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eminent Lattice Web-Hub | Digital Marketplace" },
      {
        name: "description",
        content:
          "Explore turnkey websites and digital assets for Nigerian businesses at Eminent Lattice Web-Hub.",
      },
      { property: "og:title", content: "Eminent Lattice Web-Hub" },
      {
        property: "og:description",
        content: "Turnkey websites and digital assets for Nigerian businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <a href="#top" className="group flex min-w-0 items-center gap-3" aria-label="Eminent Lattice Web-Hub home">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Hexagon size={20} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="truncate font-display text-sm font-semibold sm:text-base">Eminent Lattice <span className="text-muted-foreground">Web-Hub</span></span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-8">
            <a className="transition-colors hover:text-foreground" href="#explore">Explore</a>
            <a className="hidden transition-colors hover:text-foreground sm:inline" href="#how-it-works">How It Works</a>
            <a className="transition-colors hover:text-foreground" href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Digital commerce · Nigeria
          </div>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.06] sm:text-6xl lg:text-7xl">
            Eminent Lattice <span className="text-primary">Web-Hub</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Instant Turnkey Websites and Digital Assets for Nigerian Businesses. Pay securely via Korapay and receive your admin login credentials instantly.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-sm px-5 font-semibold">
              <a href="#explore">Explore the collection <ArrowRight aria-hidden="true" /></a>
            </Button>
            <a href="#how-it-works" className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How it works <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/70 pt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-primary" aria-hidden="true" /> Secure payment</span>
            <span className="inline-flex items-center gap-2"><Zap size={15} className="text-electric-blue" aria-hidden="true" /> Instant access</span>
            <span className="inline-flex items-center gap-2"><Layers3 size={15} className="text-primary" aria-hidden="true" /> Ready-to-own sites</span>
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
          <div className="absolute -left-4 top-8 h-px w-[18%] bg-primary/60" />
          <div className="absolute -right-3 bottom-12 h-px w-[24%] bg-electric-blue/60" />
          <div className="border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" /> EMINENT / WEB-HUB
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">EL—001</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-8 py-9 sm:py-12">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Digital, ready</div>
                <div className="mt-3 font-display text-4xl font-semibold leading-none sm:text-5xl">OWN<br />YOUR<br /><span className="text-primary">NEXT.</span></div>
              </div>
              <div className="flex flex-col justify-between border-l border-border pl-4 text-right font-mono text-[10px] text-muted-foreground sm:pl-6">
                <span>NGN</span><span>WEB</span><span>ACCESS</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/80 pt-4">
              <span className="text-xs text-muted-foreground">Turnkey digital assets</span>
              <ArrowUpRight size={16} className="text-primary" />
            </div>
          </div>
          <div className="ml-auto mt-3 flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-electric-blue" /> Built for business
          </div>
        </div>
      </section>

      <section id="explore" className="border-y border-border/70 bg-secondary/40">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">01 / The marketplace</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Find your next starting point.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">A growing collection of ready-to-own digital assets for businesses in Nigeria.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-10">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">02 / The process</p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
        </div>
        <div className="grid border-y border-border/70 sm:grid-cols-3">
          {["Choose your website", "Pay securely with Korapay", "Receive your admin access"].map((step, index) => (
            <div key={step} className="flex gap-4 border-b border-border/70 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
              <span className="font-mono text-xs text-primary">0{index + 1}</span>
              <div>
                <h3 className="text-sm font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Details will be available as listings are added.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-border/70 bg-secondary/40">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div>
            <div className="font-display text-sm font-semibold">Eminent Lattice Web-Hub</div>
            <p className="mt-1 text-sm text-muted-foreground">Marketplace contact details coming soon.</p>
          </div>
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({ product }: { product: MarketplaceProduct }) {
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const isAvailable = canPurchaseProduct(product.isSold);

  return (
    <article className={`relative flex min-w-0 flex-col border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5 ${product.isSold ? "opacity-75" : ""}`}>
      <div className={`product-preview relative flex aspect-[1.58] items-center justify-center overflow-hidden border border-border/70 bg-secondary ${product.isSold ? "grayscale" : ""}`}>
        <div className="preview-window w-[75%] border border-border bg-background">
          <div className="flex h-6 items-center gap-1.5 border-b border-border/70 px-2.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/50" /><span className="size-1.5 rounded-full bg-muted-foreground/30" /><span className="size-1.5 rounded-full bg-muted-foreground/20" />
            <span className="ml-2 h-1 w-1/3 bg-muted/80" />
          </div>
          <div className="grid grid-cols-[1fr_0.7fr] gap-3 p-3 sm:p-4">
            <div className="space-y-2 py-1"><div className="h-1.5 w-3/4 bg-muted-foreground/20" /><div className="h-1.5 w-1/2 bg-muted-foreground/10" /><div className="mt-3 h-4 w-1/3 bg-primary/20" /></div>
            <div className="aspect-[1.2] border border-dashed border-border bg-secondary/70" />
          </div>
        </div>
        <span className="absolute bottom-2.5 right-3 font-mono text-[10px] text-muted-foreground/70">PREVIEW / {product.id.slice(0, 2).toUpperCase()}</span>
        {product.isSold && <span className="absolute inset-0 flex items-center justify-center bg-background/65"><span className="border border-muted-foreground/50 bg-secondary px-5 py-2 font-mono text-lg font-bold tracking-[0.12em] text-muted-foreground">SOLD</span></span>}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Digital asset / {product.id}</p>
            <h3 className="mt-2 font-display text-xl font-semibold">{product.title}</h3>
          </div>
          <span className="shrink-0 border border-border px-2 py-1 text-[10px] text-muted-foreground">{product.category}</span>
        </div>
        <ul className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5"><Check size={14} className="shrink-0 text-primary" aria-hidden="true" />{feature}</li>
          ))}
        </ul>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Price</p>
            <p className="mt-1 font-display text-2xl font-semibold">{product.price}</p>
          </div>
          <Button
            variant={isAvailable ? "default" : "outline"}
            disabled={!isAvailable}
            onClick={() => setCheckoutNotice(true)}
            className="h-9 rounded-sm border-border px-3 text-xs"
          >
            {isAvailable ? "Buy now" : "Sold"}
          </Button>
        </div>
        {checkoutNotice && isAvailable && (
          <p role="status" className="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
            Korapay checkout is not connected yet. Please check back soon.
          </p>
        )}
      </div>
    </article>
  );
}
