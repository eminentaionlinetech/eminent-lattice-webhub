import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Hexagon,
  Layers3,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  createKorapayCheckout,
  getMarketplaceCatalog,
  verifyKorapayPayment,
} from "@/lib/korapay.functions";
import type { KorapayPaymentMethod } from "@/lib/korapay-payment";
import type { MarketplaceProduct } from "@/lib/products";
import { getProductPreviewUrl } from "@/lib/products";
import { getPreviewSiteByProductId } from "@/lib/preview-sites";

const marketplaceQueryOptions = queryOptions({
  queryKey: ["marketplace-catalog"],
  queryFn: () => getMarketplaceCatalog(),
  staleTime: 5_000,
  refetchInterval: 15_000,
  refetchIntervalInBackground: true,
});

type DeliveredCredentials = {
  productId: string;
  adminUrl: string;
  username: string;
  password: string;
  hosting: string;
  domains: string;
};

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(marketplaceQueryOptions),
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
  const { data: catalog } = useSuspenseQuery(marketplaceQueryOptions);
  const products = catalog.products;
  const queryClient = useQueryClient();
  const verifyPayment = useServerFn(verifyKorapayPayment);
  const verificationStarted = useRef(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<DeliveredCredentials | null>(null);
  const [sourceZip, setSourceZip] = useState<{ url: string; filename: string } | null>(null);
  const [sourceZipStatus, setSourceZipStatus] = useState<"idle" | "preparing" | "ready" | "failed">("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const productId = url.searchParams.get("checkout");
    if (!productId) return;
    setCheckoutProductId(productId);
    url.searchParams.delete("checkout");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  useEffect(() => {
    if (verificationStarted.current) return;

    const url = new URL(window.location.href);
    const reference = url.searchParams.get("payment_reference");
    if (!reference) return;

    const tokenKey = `marketplace-claim:${reference}`;
    const claimToken = window.sessionStorage.getItem(tokenKey);
    url.searchParams.delete("payment_reference");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);

    if (!claimToken) {
      setVerificationMessage("We couldn’t find this checkout session. Please contact the marketplace owner for help.");
      setCredentialsOpen(true);
      return;
    }

    verificationStarted.current = true;
    void verifyPayment({ data: { reference, claimToken } })
      .then(async (result) => {
        if (!result.ok) {
          setVerificationMessage(result.message);
          setCredentialsOpen(true);
          return;
        }

        window.sessionStorage.removeItem(tokenKey);
        setCredentials(result.credentials);
        setCredentialsOpen(true);
        await queryClient.invalidateQueries({ queryKey: ["marketplace-catalog"] });
      })
      .catch(() => {
        setVerificationMessage("Your payment is still being confirmed. Please check again shortly.");
        setCredentialsOpen(true);
      });
  }, [queryClient, verifyPayment]);

  useEffect(() => {
    if (!credentials) {
      setSourceZip(null);
      setSourceZipStatus("idle");
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setSourceZip(null);
    setSourceZipStatus("preparing");

    void import("@/lib/source-package")
      .then(({ buildProductSourceArchive }) => buildProductSourceArchive(credentials.productId))
      .then((archive) => {
        if (cancelled) return;
        const blob = new Blob([archive], { type: "application/zip" });
        objectUrl = URL.createObjectURL(blob);
        setSourceZip({ url: objectUrl, filename: `${credentials.productId}-source-code.zip` });
        setSourceZipStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setSourceZipStatus("failed");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [credentials]);

  async function copyCredential(value: string, field: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(""), 1800);
    } catch {
      setCopiedField("");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <a href="#top" className="group flex min-w-0 items-center gap-3" aria-label="Eminent Lattice Web-Hub home">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Hexagon size={20} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="truncate font-display text-sm font-semibold sm:text-base">
              Eminent Lattice <span className="text-muted-foreground">Web-Hub</span>
            </span>
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
          {catalog.error && <p role="status" className="mb-5 text-sm text-destructive">{catalog.error}</p>}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} openForCheckout={checkoutProductId === product.id} />
            ))}
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
                <p className="mt-2 text-sm text-muted-foreground">
                  {index === 0
                    ? "Pick a ready-to-own website for your business."
                    : index === 1
                      ? "Complete your payment on Korapay’s secure checkout."
                      : "Receive the website’s admin access after your payment is confirmed."}
                </p>
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

      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent>
          {credentials ? (
            <>
              <DialogHeader>
                <DialogTitle>Thank you for your purchase!</DialogTitle>
                <DialogDescription>Here are your admin credentials. Please log in immediately, change the admin email to your own, and update the password.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <CredentialRow label="Admin Login URL" value={credentials.adminUrl} copied={copiedField === "url"} onCopy={() => copyCredential(credentials.adminUrl, "url")} />
                <CredentialRow label="Username" value={credentials.username} copied={copiedField === "username"} onCopy={() => copyCredential(credentials.username, "username")} />
                <CredentialRow label="Temporary Password" value={credentials.password} copied={copiedField === "password"} onCopy={() => copyCredential(credentials.password, "password")} />
              </div>
              <div className="border-t border-border pt-4">
                {sourceZipStatus === "ready" && sourceZip ? (
                  <Button asChild className="w-full rounded-sm">
                    <a href={sourceZip.url} download={sourceZip.filename}>
                      <Download aria-hidden="true" /> Download Source Code (.zip)
                    </a>
                  </Button>
                ) : (
                  <Button type="button" className="w-full rounded-sm" disabled>
                    <Download aria-hidden="true" />
                    {sourceZipStatus === "failed" ? "Source ZIP unavailable" : "Preparing source ZIP…"}
                  </Button>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Includes the website starter files and Korapay setup guide.
                </p>
              </div>
              <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                <p>{credentials.hosting}</p>
                <p className="mt-2">{credentials.domains}</p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Payment confirmation</DialogTitle>
                <DialogDescription>{verificationMessage || "Checking your payment securely with Korapay…"}</DialogDescription>
              </DialogHeader>
              {!verificationMessage && <p role="status" className="text-sm text-muted-foreground">This may take a few moments. Keep this page open.</p>}
            </>
          )}
        </DialogContent>
      </Dialog>

    </main>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border border-border p-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all text-sm font-medium">{value}</p>
      </div>
      <Button type="button" variant="outline" size="icon" title={`Copy ${label}`} aria-label={`Copy ${label}`} onClick={onCopy}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
    </div>
  );
}

function ProductCard({
  product,
  openForCheckout,
}: {
  product: MarketplaceProduct & { isReserved: boolean };
  openForCheckout: boolean;
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<KorapayPaymentMethod>("card");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCheckout = useServerFn(createKorapayCheckout);
  const isAvailable = !product.isSold && !product.isReserved;

  useEffect(() => {
    if (openForCheckout && isAvailable) setCheckoutOpen(true);
  }, [isAvailable, openForCheckout]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError("");
    setIsSubmitting(true);

    try {
      const result = await createCheckout({ data: { productId: product.id, email, paymentMethod } });
      if (!result.ok) {
        setCheckoutError(result.message);
        return;
      }

      window.sessionStorage.setItem(`marketplace-claim:${result.reference}`, result.claimToken);
      window.location.assign(result.checkoutUrl);
    } catch {
      setCheckoutError("We could not start checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className={`relative flex min-w-0 flex-col border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5 ${product.isSold ? "opacity-75" : ""}`}>
      <div className={`product-preview relative flex aspect-[1.58] items-center justify-center overflow-hidden border border-border/70 bg-secondary ${product.isSold ? "grayscale" : ""}`}>
        {(() => {
          const demo = getPreviewSiteByProductId(product.id);
          return demo ? <>
            <img src={demo.image} alt={`${product.title} website preview`} loading="lazy" width={1024} height={768} className="absolute inset-0 size-full object-cover transition-transform duration-500 hover:scale-105" />
            <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/5 to-background/10 ${demo.kind === "fitness" ? "mix-blend-multiply" : ""}`} />
            <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground drop-shadow sm:inset-x-5 sm:top-5">
              <span>{demo.brand}</span><span className="border border-primary-foreground/50 px-2 py-1">LIVE DEMO</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-primary-foreground sm:bottom-5 sm:left-5">
              <p className="text-[9px] uppercase tracking-[0.12em] opacity-80">{demo.eyebrow}</p>
              <p className="mt-1 font-display text-xl font-semibold leading-tight sm:text-2xl">{demo.headline.replace("\n", " ")}</p>
            </div>
          </> : null;
        })()}
        {getProductPreviewUrl(product.id) && (
          <Button asChild size="sm" variant="secondary" className="absolute bottom-2 left-3 z-10 h-8 rounded-sm px-2.5 text-[11px]">
            <Link to="/preview/$slug" params={{ slug: getPreviewSiteByProductId(product.id)?.slug ?? "fashion" }} aria-label={`Live Preview: ${product.title}`}>
              <ExternalLink aria-hidden="true" /> Live Preview
            </Link>
          </Button>
        )}
        {product.isSold && <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/65"><span className="border border-muted-foreground/50 bg-secondary px-5 py-2 font-mono text-lg font-bold tracking-[0.12em] text-muted-foreground">SOLD</span></span>}
        {!product.isSold && product.isReserved && <span className="absolute inset-0 flex items-center justify-center bg-background/65"><span className="border border-border bg-secondary px-4 py-2 font-mono text-sm font-semibold text-muted-foreground">CHECKOUT IN PROGRESS</span></span>}
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
        <div className="mt-6 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
          <p>Free, fully functional cloud hosting included.</p>
          <p>Link your own .com, .ng, or .com.ng domain at takeover.</p>
        </div>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Price</p>
            <p className="mt-1 font-display text-2xl font-semibold">{product.price}</p>
          </div>
          <Button
            variant={isAvailable ? "default" : "outline"}
            disabled={!isAvailable}
            onClick={() => {
              setCheckoutError("");
              setCheckoutOpen(true);
            }}
            className="h-9 rounded-sm border-border px-3 text-xs"
          >
            {product.isSold ? "Sold" : product.isReserved ? "Reserved" : "Buy now"}
          </Button>
        </div>
      </div>
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Secure Korapay checkout</DialogTitle>
            <DialogDescription>
              Pay {product.price} for {product.title}. Free cloud hosting is included; link your own domain when you take ownership.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor={`email-${product.id}`}>Email address</Label>
              <Input
                id={`email-${product.id}`}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Payment method</legend>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as KorapayPaymentMethod)} className="gap-2">
                <PaymentMethodOption value="card" label="Card" />
                <PaymentMethodOption value="bank_transfer" label="Bank transfer" />
                <PaymentMethodOption value="pay_with_bank" label="Pay with bank" />
              </RadioGroup>
            </fieldset>
            {checkoutError && <p role="alert" className="text-sm text-destructive">{checkoutError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !isAvailable} className="rounded-sm">
                {isSubmitting ? "Connecting…" : "Continue to Korapay"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function PaymentMethodOption({ value, label }: { value: KorapayPaymentMethod; label: string }) {
  const id = `payment-${value}`;
  return (
    <Label htmlFor={id} className="flex cursor-pointer items-center gap-3 border border-border px-3 py-3 text-sm font-normal">
      <RadioGroupItem id={id} value={value} />
      <span>{label}</span>
    </Label>
  );
}