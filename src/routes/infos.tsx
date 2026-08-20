import { createFileRoute } from "@tanstack/react-router";
import { Bus, Car, MapPin, Phone, TramFront } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HOURS, MAP_EMBED, MAP_LINK, PHARMACY } from "@/lib/pharmacy-data";

export const Route = createFileRoute("/infos")({
  head: () => ({
    meta: [
      { title: "Horaires, adresse et accès — Pharmacie Du Marché Carouge" },
      {
        name: "description",
        content:
          "Place du Marché 1, 1227 Carouge. Horaires, plan, accès en tram 12/18, bus 7 et 11, parking Sardaigne. Téléphone 022 342 00 44.",
      },
      { property: "og:title", content: "Horaires & accès — Pharmacie Du Marché Carouge" },
      {
        property: "og:description",
        content: "Adresse, plan et moyens d’accès à la Pharmacie Du Marché à Carouge.",
      },
    ],
  }),
  component: InfosPage,
});

function InfosPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-serif text-4xl font-semibold text-foreground">Infos & accès</h1>

        <section className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Présentation de l’établissement
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Nous sommes une équipe chaleureuse et attentive, dédiée à vous offrir un accueil
              personnalisé et de qualité. Depuis plus de 20 ans, nous sommes à votre service afin de
              vous garantir la meilleure prise en charge possible de votre santé.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              La {PHARMACY.name} Carouge propose des consultations en allemand, portugais, français,
              anglais et italien.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <MapPin className="size-4 text-primary" /> {PHARMACY.address}
              </p>
              <p className="flex items-center gap-2 text-foreground">
                <Phone className="size-4 text-primary" />
                <a className="hover:text-primary" href={PHARMACY.phoneHref}>
                  {PHARMACY.phone}
                </a>
              </p>
            </div>

            <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Horaires
            </h3>
            <dl className="mt-4 max-w-sm space-y-2 text-sm">
              {HOURS.map((h) => (
                <div
                  key={h.day}
                  className="flex justify-between border-b border-border/70 pb-2 last:border-0"
                >
                  <dt className="text-muted-foreground">{h.day}</dt>
                  <dd className="tabular-nums text-foreground">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Plan d’accès — Pharmacie Du Marché, Place du Marché 1, 1227 Carouge"
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full border-0"
              />
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Ouvrir dans Google Maps →
            </a>

            <h2 className="mt-10 font-serif text-2xl font-semibold text-foreground">
              Comment se rendre à la Pharmacie du Marché ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Située au cœur de Carouge, la pharmacie est facilement accessible en transports
              publics.
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              <Access icon={TramFront} title="En tram">
                Lignes 12 et 18, arrêt Carouge Marché.
              </Access>
              <Access icon={Bus} title="En bus">
                Ligne 7, arrêt Fontenette, et ligne 11, arrêt Carouge Marché.
              </Access>
              <Access icon={Car} title="En voiture">
                Le parking Sardaigne se trouve à seulement quelques mètres. Des places réservées aux
                taxis sont également disponibles juste devant l’entrée.
              </Access>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Access({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span>
        <strong className="block text-foreground">{title}</strong>
        <span className="text-muted-foreground">{children}</span>
      </span>
    </li>
  );
}
