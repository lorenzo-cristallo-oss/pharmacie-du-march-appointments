import { Link } from "@tanstack/react-router";
import { HOURS, PHARMACY } from "@/lib/pharmacy-data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">{PHARMACY.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Place du Marché 1<br />
            1227 Carouge
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a className="hover:text-primary" href={PHARMACY.phoneHref}>
              {PHARMACY.phone}
            </a>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Consultations en {PHARMACY.languages.join(", ").toLowerCase()}.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Horaires
          </h3>
          <dl className="mt-4 space-y-1.5 text-sm">
            {HOURS.map((h) => (
              <div key={h.day} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{h.day}</dt>
                <dd className="tabular-nums text-foreground">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/vaccins" className="hover:text-primary">
                Vaccins
              </Link>
            </li>
            <li>
              <Link to="/prestations" className="hover:text-primary">
                Prestations & expertises
              </Link>
            </li>
            <li>
              <Link to="/rendez-vous" className="hover:text-primary">
                Prendre rendez-vous
              </Link>
            </li>
            <li>
              <Link to="/infos" className="hover:text-primary">
                Infos & accès
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {PHARMACY.name} — Carouge, Genève
        <span className="mx-2">·</span>
        <Link to="/admin" className="opacity-40 transition-opacity hover:opacity-100">Administration</Link>
      </div>
    </footer>
  );
}
