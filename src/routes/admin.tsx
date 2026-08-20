import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, LogOut, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminAddBlock,
  adminBlocks,
  adminDeleteBlock,
  adminLogin,
  adminReservations,
  adminSetStatus,
  type BlockedSlot,
  type Reservation,
  type ReservationStatus,
} from "@/lib/booking-api";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration — Pharmacie Du Marché" }] }),
  component: AdminPage,
});

const SESSION_KEY = "pharmacie-admin-password";

function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    adminLogin(saved).then((ok) => {
      if (ok) {
        setPassword(saved);
        setLoggedIn(true);
      } else sessionStorage.removeItem(SESSION_KEY);
    }).catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    try {
      const ok = await adminLogin(password);
      if (!ok) return toast.error("Mot de passe incorrect.");
      sessionStorage.setItem(SESSION_KEY, password);
      setLoggedIn(true);
    } catch {
      toast.error("Impossible de se connecter.");
    } finally { setChecking(false); }
  }

  if (!loggedIn) return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-sm">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Retour au site</Link>
        <h1 className="mt-5 font-serif text-2xl font-semibold">Administration</h1>
        <p className="mt-2 text-sm text-muted-foreground">Accès réservé à l’équipe de la pharmacie.</p>
        <label className="mt-6 block text-sm font-medium">Mot de passe</label>
        <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2" />
        <button disabled={checking} className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">{checking ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );

  return <Dashboard password={password} onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); setPassword(""); }} />;
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<"all" | ReservationStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [blockType, setBlockType] = useState<"vaccin" | "prestation" | "all">("vaccin");
  const [blockDate, setBlockDate] = useState("");
  const [wholeDay, setWholeDay] = useState(true);
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([adminReservations(password), adminBlocks(password)]);
      setReservations(r ?? []); setBlocks(b ?? []);
    } catch { toast.error("Impossible de charger les données."); }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => reservations.filter((r) => filter === "all" || r.status === filter), [reservations, filter]);

  async function changeStatus(id: string, status: ReservationStatus) {
    try {
      await adminSetStatus(password, id, status);
      toast.success(status === "accepted" ? "Rendez-vous accepté." : status === "refused" ? "Rendez-vous refusé, créneau libéré." : "Statut modifié.");
      setSelected(null); await load();
    } catch { toast.error("Modification impossible."); }
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!blockDate) return toast.error("Choisissez une date.");
    try {
      await adminAddBlock(password, { type: blockType, date: blockDate, startTime: wholeDay ? null : startTime, endTime: wholeDay ? null : endTime, reason });
      toast.success("Indisponibilité ajoutée."); setReason(""); await load();
    } catch { toast.error("Impossible d’ajouter cette indisponibilité."); }
  }

  async function deleteBlock(id: string) {
    try { await adminDeleteBlock(password, id); toast.success("Indisponibilité supprimée."); await load(); }
    catch { toast.error("Suppression impossible."); }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div><p className="text-xs uppercase tracking-[.16em] text-muted-foreground">Pharmacie Du Marché</p><h1 className="font-serif text-2xl font-semibold">Administration</h1></div>
          <div className="flex gap-2"><button onClick={() => void load()} className="rounded-md border p-2" title="Actualiser"><RefreshCw className="size-4" /></button><button onClick={onLogout} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><LogOut className="size-4" /> Déconnexion</button></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl font-semibold">Réservations</h2><div className="flex flex-wrap gap-1">{(["pending","accepted","refused","all"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs ${filter===f ? "bg-primary text-primary-foreground" : "bg-card"}`}>{f === "pending" ? "En attente" : f === "accepted" ? "Acceptées" : f === "refused" ? "Refusées" : "Toutes"}</button>)}</div></div>
          <div className="mt-4 overflow-hidden rounded-xl border bg-card">
            {loading ? <p className="p-6 text-sm text-muted-foreground">Chargement…</p> : visible.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Aucune réservation.</p> : visible.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className="grid w-full gap-2 border-b p-4 text-left last:border-0 hover:bg-secondary/50 sm:grid-cols-[120px_1fr_auto]">
                <div><p className="font-semibold tabular-nums">{formatDate(r.appointment_date)}</p><p className="text-sm text-primary">{r.start_time.slice(0,5)}</p></div>
                <div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-sm text-muted-foreground">{r.service}</p></div>
                <Status status={r.status} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold">Bloquer des créneaux</h2>
          <form onSubmit={addBlock} className="mt-4 rounded-xl border bg-card p-5">
            <label className="text-sm font-medium">Concerne</label><select value={blockType} onChange={(e)=>setBlockType(e.target.value as typeof blockType)} className="mt-1 w-full rounded-md border bg-background px-3 py-2"><option value="vaccin">Vaccinations</option><option value="prestation">Prestations santé</option><option value="all">Les deux</option></select>
            <label className="mt-4 block text-sm font-medium">Date</label><input type="date" value={blockDate} onChange={(e)=>setBlockDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={wholeDay} onChange={(e)=>setWholeDay(e.target.checked)} /> Bloquer toute la journée</label>
            {!wholeDay && <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-sm">De<input type="time" step="1800" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm">À<input type="time" step="1800" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label></div>}
            <label className="mt-4 block text-sm font-medium">Raison (facultatif)</label><input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Ex. pharmacien absent" className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground"><Ban className="size-4" /> Bloquer</button>
          </form>
          <h3 className="mt-7 font-semibold">Indisponibilités</h3><div className="mt-3 space-y-2">{blocks.map((b)=><div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"><div><p className="font-medium">{formatDate(b.blocked_date)} · {b.type === "all" ? "Tout" : b.type === "vaccin" ? "Vaccins" : "Prestations"}</p><p className="text-muted-foreground">{b.start_time ? `${b.start_time.slice(0,5)} – ${b.end_time?.slice(0,5)}` : "Journée entière"}{b.reason ? ` · ${b.reason}` : ""}</p></div><button onClick={()=>void deleteBlock(b.id)} className="p-2 text-destructive"><Trash2 className="size-4" /></button></div>)}</div>
        </section>
      </main>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-card p-6 shadow-xl"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Détails de la réservation</p><h2 className="mt-1 font-serif text-2xl font-semibold">{selected.first_name} {selected.last_name}</h2></div><button onClick={()=>setSelected(null)}><X /></button></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><Info label="Date" value={`${formatDate(selected.appointment_date)} à ${selected.start_time.slice(0,5)}`} /><Info label="Type" value={selected.type === "vaccin" ? "Vaccination" : "Prestation santé"} /><Info label="Prestation" value={selected.service} /><Info label="Téléphone" value={selected.phone} /><Info label="E-mail" value={selected.email || "—"} /><Info label="Statut" value={selected.status === "pending" ? "En attente" : selected.status === "accepted" ? "Acceptée" : "Refusée"} />{selected.notes && <div className="sm:col-span-2"><Info label="Remarque" value={selected.notes} /></div>}</dl><div className="mt-7 grid gap-2 sm:grid-cols-2"><button onClick={()=>void changeStatus(selected.id,"accepted")} className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground"><Check className="size-4" /> Accepter</button><button onClick={()=>void changeStatus(selected.id,"refused")} className="flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-3 font-semibold text-destructive-foreground"><X className="size-4" /> Refuser</button></div><a href={`tel:${selected.phone.replace(/\s/g,"")}`} className="mt-3 flex items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold">Téléphoner au patient</a></div></div>}
    </div>
  );
}

function Status({ status }: { status: ReservationStatus }) { return <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status === "accepted" ? "bg-primary/10 text-primary" : status === "refused" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}>{status === "accepted" ? "Acceptée" : status === "refused" ? "Refusée" : "En attente"}</span>; }
function Info({label,value}:{label:string;value:string}) { return <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>; }
function formatDate(date:string) { return new Date(`${date}T12:00:00`).toLocaleDateString("fr-CH", { day:"2-digit", month:"2-digit", year:"numeric" }); }
