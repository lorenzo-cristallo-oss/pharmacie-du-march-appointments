import { Link } from "@tanstack/react-router";
import { Cross, Phone, Menu } from "lucide-react";
import { useState } from "react";
import { PHARMACY } from "@/lib/pharmacy-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/vaccins", label: "Vaccins" },
  { to: "/prestations", label: "Prestations" },
  { to: "/infos", label: "Infos & accès" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cross className="size-5" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold text-foreground">
              {PHARMACY.name}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {PHARMACY.city}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={PHARMACY.phoneHref}
            className="ml-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:text-primary"
          >
            <Phone className="size-4" /> {PHARMACY.phone}
          </a>
          <Link
            to="/rendez-vous"
            className="ml-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Prendre rendez-vous
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-md border border-border md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/rendez-vous"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
          >
            Prendre rendez-vous
          </Link>
          <a
            href={PHARMACY.phoneHref}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground"
          >
            {PHARMACY.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
