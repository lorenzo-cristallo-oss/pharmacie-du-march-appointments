import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  CONSULTATIONS,
  PHARMACY,
  VACCINES,
  slotsForDate,
} from "@/lib/pharmacy-data";
import { cn } from "@/lib/utils";
import {
  createReservation,
  getUnavailableSlots,
} from "@/lib/booking-api";

const searchSchema = z.object({
  type: z.enum(["vaccin", "prestation"]).optional(),
});

export const Route = createFileRoute("/rendez-vous")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title:
          "Prendre rendez-vous en ligne — Pharmacie Du Marché Carouge",
      },
      {
        name: "description",
        content:
          "Réservez en ligne votre vaccination ou votre prestation de santé à la Pharmacie Du Marché Carouge : choisissez la prestation, la date et l’heure.",
      },
      {
        property: "og:title",
        content: "Prendre rendez-vous — Pharmacie Du Marché Carouge",
      },
      {
        property: "og:description",
        content:
          "Réservation en ligne des vaccins et prestations santé à Carouge.",
      },
    ],
  }),
  component: BookingPage,
});

type Kind = "vaccin" | "prestation";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function BookingPage() {
  const search = Route.useSearch();

  const [kind, setKind] = useState<Kind>(search.type ?? "vaccin");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [confirmed, setConfirmed] = useState<null | {
    service: string;
    date: string;
    time: string;
  }>(null);

  const options = kind === "vaccin" ? VACCINES : CONSULTATIONS;

  const baseSlots = useMemo(() => {
    const allSlots = slotsForDate(date);

    if (!date) {
      return allSlots;
    }

    const selectedDate = new Date(`${date}T12:00:00`);
    const day = selectedDate.getDay();

    // 1 = lundi, 5 = vendredi
    const isWeekday = day >= 1 && day <= 5;

    if (!isWeekday) {
      return allSlots;
    }

    // Pause pharmacie :
    // lundi à vendredi, de 12h15 à 13h45.
    return allSlots.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);

      const slotMinutes = hours * 60 + minutes;

      const pauseStart = 12 * 60 + 15;
      const pauseEnd = 13 * 60 + 45;

      return slotMinutes < pauseStart || slotMinutes >= pauseEnd;
    });
  }, [date]);

  const slots = useMemo(
    () => baseSlots.filter((slot) => !unavailable.includes(slot)),
    [baseSlots, unavailable],
  );

  const originalSlots = useMemo(() => slotsForDate(date), [date]);

  const closed = Boolean(date) && originalSlots.length === 0;

  useEffect(() => {
    if (!date) {
      setUnavailable([]);
      return;
    }

    let cancelled = false;

    setLoadingSlots(true);

    getUnavailableSlots(kind, date)
      .then((items) => {
        if (!cancelled) {
          setUnavailable(items ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Impossible de charger les disponibilités.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !service ||
      !date ||
      !time ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      toast.error("Merci de compléter tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);

    try {
      await createReservation({
        type: kind,
        service,
        date,
        time,
        firstName,
        lastName,
        phone,
        email,
        notes,
      });

      setConfirmed({
        service,
        date,
        time,
      });

      toast.success("Demande de rendez-vous enregistrée !");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      if (message.toLowerCase().includes("créneau")) {
        toast.error(
          "Ce créneau n’est plus disponible. Choisissez une autre heure.",
        );

        getUnavailableSlots(kind, date)
          .then(setUnavailable)
          .catch(() => undefined);

        setTime("");
      } else {
        toast.error(
          "Impossible d’enregistrer la réservation. Réessayez.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <main className="mx-auto max-w-2xl px-5 py-20">
          <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-7" />
            </span>

            <h1 className="mt-5 font-serif text-3xl font-semibold text-foreground">
              Demande enregistrée
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              Merci {firstName}, nous vous confirmons votre créneau par
              téléphone dans les meilleurs délais.
            </p>

            <dl className="mt-8 space-y-3 rounded-xl border border-border bg-background p-5 text-left text-sm">
              <Row label="Prestation" value={confirmed.service} />

              <Row
                label="Date"
                value={new Date(
                  `${confirmed.date}T12:00:00`,
                ).toLocaleDateString("fr-CH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />

              <Row label="Heure" value={confirmed.time} />

              <Row
                label="Patient"
                value={`${firstName} ${lastName}`}
              />

              <Row label="Téléphone" value={phone} />

              {email && <Row label="E-mail" value={email} />}
            </dl>

            <p className="mt-6 text-xs text-muted-foreground">
              Une question ? Appelez-nous au{" "}
              <a
                className="font-semibold text-primary"
                href={PHARMACY.phoneHref}
              >
                {PHARMACY.phone}
              </a>
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          Prendre rendez-vous
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Prenez rendez-vous en ligne avec la {PHARMACY.name} Carouge
          pour vos prestations de santé en pharmacie et vos
          vaccinations.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]"
        >
          <div className="space-y-8">
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                1. Type de rendez-vous
              </legend>

              <div className="mt-3 flex gap-3">
                {(
                  [
                    {
                      k: "vaccin",
                      label: "Vaccination",
                    },
                    {
                      k: "prestation",
                      label: "Prestation santé",
                    },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => {
                      setKind(o.k);
                      setService("");
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-semibold transition-colors",
                      kind === o.k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                2.{" "}
                {kind === "vaccin"
                  ? "Choix du vaccin"
                  : "Choix de la prestation"}
              </legend>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((o) => (
                  <label
                    key={o}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                      service === o
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={o}
                      checked={service === o}
                      onChange={() => setService(o)}
                      className="mt-1 accent-[var(--primary)]"
                    />

                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                3. Date et heure
              </legend>

              <div className="mt-3 max-w-xs">
                <Field label="Date">
                  <input
                    type="date"
                    min={todayStr()}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime("");
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </div>

              {closed && (
                <p className="mt-3 text-sm text-destructive">
                  La pharmacie est fermée ce jour-là. Merci de choisir
                  une autre date.
                </p>
              )}

              {loadingSlots && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Chargement des créneaux…
                </p>
              )}

              {!loadingSlots &&
                !closed &&
                baseSlots.length > 0 &&
                slots.length === 0 && (
                  <p className="mt-3 text-sm text-destructive">
                    Aucun créneau n’est disponible ce jour-là.
                  </p>
                )}

              {!loadingSlots && slots.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTime(s)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors",
                        time === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-secondary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                4. Vos coordonnées
              </legend>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Prénom *">
                  <input
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Nom *">
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Téléphone *">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="E-mail">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Remarque (ordonnance, allergies, etc.)">
                    <textarea
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </Field>
                </div>
              </div>
            </fieldset>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-secondary/40 p-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Récapitulatif
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <Row
                label="Type"
                value={
                  kind === "vaccin"
                    ? "Vaccination"
                    : "Prestation santé"
                }
              />

              <Row
                label="Prestation"
                value={service || "—"}
              />

              <Row label="Date" value={date || "—"} />

              <Row label="Heure" value={time || "—"} />
            </dl>

            <button
              type="submit"
              disabled={submitting || loadingSlots}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarCheck className="size-4" />

              {submitting
                ? "Enregistrement…"
                : "Confirmer la demande"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="mt-0.5 size-3.5 shrink-0" />
              Votre demande est confirmée par l’équipe avant le
              rendez-vous.
            </p>

            <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <Phone className="mt-0.5 size-3.5 shrink-0" />

              <a
                href={PHARMACY.phoneHref}
                className="hover:text-primary"
              >
                {PHARMACY.phone}
              </a>
            </p>
          </aside>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>

      {children}
    </label>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>

      <dd className="max-w-[60%] text-right font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
