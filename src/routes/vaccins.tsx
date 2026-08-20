import { createFileRoute, Link } from "@tanstack/react-router";
import { Syringe } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VACCINES } from "@/lib/pharmacy-data";

export const Route = createFileRoute("/vaccins")({
  head: () => ({
    meta: [
      { title: "Vaccins disponibles — Pharmacie Du Marché Carouge" },
      {
        name: "description",
        content:
          "16 vaccins réalisés en pharmacie à Carouge : grippe, Covid-19, hépatite A/B, dTpa, HPV, zona, FSME, VRS et plus. Réservation en ligne.",
      },
      { property: "og:title", content: "Vaccins disponibles — Pharmacie Du Marché Carouge" },
      {
        property: "og:description",
        content: "Tous les vaccins réalisés en pharmacie à Carouge, sur rendez-vous.",
      },
    ],
  }),
  component: VaccinsPage,
});

function VaccinsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-serif text-4xl font-semibold text-foreground">Nos vaccinations</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Nous réalisons les vaccinations suivantes directement en pharmacie, sur rendez-vous. Tous
          les vaccins sont remboursés sur présentation d’une ordonnance, sauf dans certains cas.
          L’acte de vaccination, facturé 30 CHF, n’est pas pris en charge par l’assurance.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VACCINES.map((v) => (
            <li
              key={v}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Syringe className="size-4" />
              </span>
              <span className="text-sm font-medium text-foreground">{v}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/rendez-vous"
            search={{ type: "vaccin" }}
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Réserver une vaccination
          </Link>
          <Link
            to="/prestations"
            className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Voir les prestations
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
