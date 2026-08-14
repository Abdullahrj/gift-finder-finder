import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowRight, Bookmark, DollarSign, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-wishlist.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Collect — Personal Wishlist" },
      { name: "description", content: "Track the things you want, their prices, and where to find them." },
      { property: "og:title", content: "Collect — Personal Wishlist" },
      { property: "og:description", content: "Track the things you want, their prices, and where to find them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onImageRef = (img: HTMLImageElement | null) => {
    imageRef.current = img;
    if (img?.complete) setImageLoaded(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-extrabold tracking-tighter text-xl">
            COLLECT.
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-mono text-xs">
                LOG IN
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="font-medium text-xs">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Your personal inventory
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Want it. Price it. Find it.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              A clean, private wishlist for the things you want to buy. Save prices, store links, and keep everything in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="font-medium gap-2">
                  Create your wishlist
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="font-medium">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-in [animation-delay:120ms]">
            <div className="rounded-2xl overflow-hidden ring-1 ring-border bg-muted">
              <img
                ref={onImageRef}
                src={heroImage}
                alt="Curated objects on a clean desk: keyboard, coffee dripper, brass lamp, and notebook"
                width={1440}
                height={912}
                className={`w-full h-auto object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
                loading="eager"
              />
              {!imageLoaded && (
                <div className="aspect-[16/10] bg-muted animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-wishlist-surface">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid sm:grid-cols-3 gap-8">
            <FeatureCard
              icon={<List className="size-5 text-primary" />}
              title="One list"
              description="Keep every item you want in a single, organized collection."
            />
            <FeatureCard
              icon={<DollarSign className="size-5 text-primary" />}
              title="Real prices"
              description="Record the price so you know exactly what you're saving for."
            />
            <FeatureCard
              icon={<Bookmark className="size-5 text-primary" />}
              title="Where to find it"
              description="Attach a store link and name so you never lose the source."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-extrabold tracking-tighter text-xl">COLLECT.</span>
          <p className="text-xs text-muted-foreground font-mono">
            A personal wishlist for the things you want.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-background ring-1 ring-border animate-in">
      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
