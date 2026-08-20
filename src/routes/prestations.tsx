import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONSULTATIONS, EXPERTISE } from "@/lib/pharmacy-data";

export const Route = createFileRoute("/prestations")({
  head: () => ({
    meta: [
      { title: "Prestations & expertises — Pharmacie Du Marché Carouge" },
      {
        name: "description",
        content:
          "CardioTest, dépistage du cancer du côlon, test streptocoque, glycémie, tension, contraception d’urgence : nos rendez-vous santé en pharmacie à Carouge.",
      },
      { property: "og:title", content: "Prestations santé — Pharmacie Du Marché Carouge" },
      {
        property: "og:description",
        content: "Consultations et tests pharmaceutiques spécialisés sur rendez-vous à Carouge.",
      },
    ],
  }),
  component: PrestationsPage,
});

function PrestationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          Prestations sur rendez-vous
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Prestations de santé réalisées sur place, dans un espace de consultation confidentiel.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONSULTATIONS.map((c) => (
            <li
              key={c}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Stethoscope className="size-4" />
              </span>
              <span className="text-sm font-medium text-foreground">{c}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-serif text-2xl font-semibold text-foreground">Notre expertise</h2>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERTISE.map((e) => (
            <li key={e} className="rounded-lg bg-secondary/60 px-4 py-3 text-sm text-foreground">
              {e}
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Link
            to="/rendez-vous"
            search={{ type: "prestation" }}
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
