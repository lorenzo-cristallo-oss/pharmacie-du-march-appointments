import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, HeartPulse, Syringe, Clock, MapPin, Languages } from "lucide-react";

import heroImage from "@/assets/pharmacie-hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EXPERTISE, HOURS, PHARMACY, VACCINES, CONSULTATIONS } from "@/lib/pharmacy-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pharmacie Du Marché Carouge — Vaccins & rendez-vous santé" },
      {
        name: "description",
        content:
          "Pharmacie spécialisée en vaccination et santé pharmaceutique à Carouge. Réservez en ligne votre vaccin ou votre rendez-vous : CardioTest, glycémie, tension, dépistages.",
      },
      { property: "og:title", content: "Pharmacie Du Marché Carouge — Vaccins & rendez-vous" },
      {
        property: "og:description",
        content:
          "Vaccinations et prestations de santé sur place à Carouge. Prise de rendez-vous en ligne.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Syringe className="size-3.5" /> Centre de vaccination
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.1] font-semibold text-foreground sm:text-5xl">
              Pharmacie spécialisée en vaccins et santé pharmaceutique
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Une équipe chaleureuse et attentive, à votre service depuis plus de 20 ans au cœur de
              Carouge. Réservez en quelques clics votre vaccination ou votre rendez-vous santé sur
              place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/rendez-vous"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <CalendarCheck className="size-4" /> Prendre rendez-vous
              </Link>
              <Link
                to="/vaccins"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Voir les {VACCINES.length} vaccins
              </Link>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              <Fact icon={Clock} label="Lun – Ven" value="08:00 – 18:30" />
              <Fact icon={MapPin} label="Adresse" value="Place du Marché 1" />
              <Fact icon={Languages} label="Langues" value="5 langues parlées" />
            </dl>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img
              src={heroImage}
              alt="Équipe de la Pharmacie Du Marché à Carouge accueillant un patient"
              width={1600}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            icon={Syringe}
            title="Vaccinations"
            text={`${VACCINES.length} vaccins réalisés directement en pharmacie, sur rendez-vous et sans attente.`}
            to="/vaccins"
            cta="Liste des vaccins"
          />
          <Card
            icon={HeartPulse}
            title="Prestations santé"
            text={`${CONSULTATIONS.length} rendez-vous sur place : CardioTest, dépistages, mesures et conseils.`}
            to="/prestations"
            cta="Nos prestations"
          />
          <Card
            icon={CalendarCheck}
            title="Réservation en ligne"
            text="Choisissez la prestation, la date et l’heure. Nous confirmons votre créneau par téléphone."
            to="/rendez-vous"
            cta="Réserver"
          />
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-serif text-3xl font-semibold text-foreground">Notre expertise</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Des prestations pharmaceutiques spécialisées, réalisées par des pharmaciens formés et
            habilités.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERTISE.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
        <article>
          <h2 className="font-serif text-2xl font-semibold text-foreground">CardioTest</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Le CardioTest vous permet de déterminer votre risque personnel d’infarctus du myocarde
            et d’accident vasculaire cérébral (AVC). Le test dure 30 minutes et comprend :
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {[
              "Un court questionnaire",
              "Une analyse du cholestérol",
              "Un test de glycémie",
              "Une mesure de la tension artérielle",
              "Une mesure du tour de taille",
            ].map((i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {i}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Vaccination contre la grippe
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Avec une seule injection, protégez-vous dès maintenant contre la grippe. Ce vaccin est
            remboursé sur présentation d’une ordonnance pour les patients âgés de plus de 65 ans ou
            pour les patients à risque.
          </p>
          <p className="mt-4 rounded-lg border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
            Tous les vaccins sont remboursés sur présentation d’une ordonnance, sauf dans certains
            cas. L’acte de vaccination, facturé <strong className="text-foreground">30 CHF</strong>,
            n’est pas pris en charge par l’assurance.
          </p>
        </article>
      </section>

      <section className="border-t border-border bg-primary/5">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Prendre rendez-vous
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Prenez rendez-vous en ligne avec la {PHARMACY.name} Carouge pour vos prestations de
              santé en pharmacie et vos vaccinations, ou appelez-nous au {PHARMACY.phone}.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/rendez-vous"
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Réserver en ligne
            </Link>
            <a
              href={PHARMACY.phoneHref}
              className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              Appeler
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Horaires d’ouverture</h2>
        <dl className="mt-6 grid max-w-xl gap-2">
          {HOURS.map((h) => (
            <div
              key={h.day}
              className="flex justify-between border-b border-border/70 pb-2 text-sm last:border-0"
            >
              <dt className="text-muted-foreground">{h.day}</dt>
              <dd className="tabular-nums text-foreground">{h.hours}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SiteFooter />
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  text,
  to,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  to: "/vaccins" | "/prestations" | "/rendez-vous";
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-background p-6">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <Link to={to} className="mt-4 text-sm font-semibold text-primary hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
