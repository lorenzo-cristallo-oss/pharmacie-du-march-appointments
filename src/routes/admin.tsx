import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, LogOut, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { CONSULTATIONS, VACCINES, slotsForDate } from "@/lib/pharmacy-data";
import {
  adminAddBlock,
  adminCreateReservation,
  getUnavailableSlots,
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
      if (!ok) {
        toast.error("Mot de passe incorrect.");
        return;
      }
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
  const [creating, setCreating] = useState(false);

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
    if (!blockDate) {
      toast.error("Choisissez une date.");
      return;
    }
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
          <div className="flex flex-wrap items-center gap-2"><button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm"><Plus className="size-4" /> Ajouter un rendez-vous</button><button onClick={() => void load()} className="rounded-md border p-2" title="Actualiser"><RefreshCw className="size-4" /></button><button onClick={onLogout} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><LogOut className="size-4" /> Déconnexion</button></div>
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
      {creating && <NewAppointmentDialog password={password} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); void load(); }} />}
    </div>
  );
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

/** Créneaux du jour, hors pause de midi en semaine (identique au formulaire public). */
function adminSlotsForDate(date: string) {
  const all = slotsForDate(date);
  if (!date) return all;
  const day = new Date(`${date}T12:00:00`).getDay();
  if (day < 1 || day > 5) return all;
  return all.filter((slot) => {
    const [h = 0, m = 0] = slot.split(":").map(Number);
    const mins = h * 60 + m;
    return mins < 12 * 60 + 15 || mins >= 13 * 60 + 45;
  });
}

function NewAppointmentDialog({ password, onClose, onCreated }: { password: string; onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<"vaccin" | "prestation">("vaccin");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const options = type === "vaccin" ? VACCINES : CONSULTATIONS;
  const baseSlots = useMemo(() => adminSlotsForDate(date), [date]);
  const slots = useMemo(() => baseSlots.filter((s) => !unavailable.includes(s)), [baseSlots, unavailable]);

  const refreshSlots = useCallback(async (d: string) => {
    if (!d) { setUnavailable([]); return; }
    setLoadingSlots(true);
    try {
      // Une seule salle : on cumule les indisponibilités des deux types.
      const [a, b] = await Promise.all([getUnavailableSlots("vaccin", d), getUnavailableSlots("prestation", d)]);
      setUnavailable([...new Set([...(a ?? []), ...(b ?? [])])]);
    } catch { toast.error("Impossible de charger les disponibilités."); }
    finally { setLoadingSlots(false); }
  }, []);

  useEffect(() => { void refreshSlots(date); }, [date, refreshSlots]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !date || !time || !firstName || !lastName || !phone) {
      toast.error("Merci de compléter tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await adminCreateReservation(password, { type, service, date, time, firstName, lastName, phone, email, notes });
      toast.success("Rendez-vous ajouté et confirmé.");
      onCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("créneau")) {
        toast.error("Ce créneau vient d’être pris. Choisissez une autre heure.");
        setTime("");
        void refreshSlots(date);
      } else if (message.toLowerCase().includes("mot de passe")) {
        toast.error("Session expirée, reconnectez-vous.");
      } else {
        toast.error("Impossible d’ajouter ce rendez-vous.");
      }
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Rendez-vous par téléphone ou sur place</p><h2 className="mt-1 font-serif text-2xl font-semibold">Ajouter un rendez-vous</h2></div>
          <button type="button" onClick={onClose}><X /></button>
        </div>

        <label className="mt-6 block text-sm font-medium">Type</label>
        <div className="mt-2 flex gap-2">
          {([{ k: "vaccin", label: "Vaccination" }, { k: "prestation", label: "Prestation santé" }] as const).map((o) => (
            <button key={o.k} type="button" onClick={() => { setType(o.k); setService(""); }} className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${type === o.k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{o.label}</button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium">{type === "vaccin" ? "Vaccin" : "Prestation"}</label>
        <select value={service} onChange={(e) => setService(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">— Choisir —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="mt-4 block text-sm font-medium">Date</label>
        <input type="date" min={todayStr()} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />

        <p className="mt-4 text-sm font-medium">Heure</p>
        {!date && <p className="mt-1 text-sm text-muted-foreground">Choisissez d’abord une date.</p>}
        {date && loadingSlots && <p className="mt-1 text-sm text-muted-foreground">Chargement des créneaux…</p>}
        {date && !loadingSlots && baseSlots.length === 0 && <p className="mt-1 text-sm text-destructive">La pharmacie est fermée ce jour-là.</p>}
        {date && !loadingSlots && baseSlots.length > 0 && slots.length === 0 && <p className="mt-1 text-sm text-destructive">Aucun créneau disponible ce jour-là.</p>}
        {!loadingSlots && slots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((s) => <button key={s} type="button" onClick={() => setTime(s)} className={`rounded-md border px-3 py-1.5 text-sm tabular-nums ${time === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>{s}</button>)}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Prénom<input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm">Nom<input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm">Téléphone<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm">E-mail (facultatif)<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
        </div>

        <label className="mt-4 block text-sm">Remarque (facultatif)<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>

        <button disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"><Check className="size-4" /> {saving ? "Enregistrement…" : "Créer le rendez-vous (confirmé)"}</button>
      </form>
    </div>
  );
}

function Status({ status }: { status: ReservationStatus }) { return <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status === "accepted" ? "bg-primary/10 text-primary" : status === "refused" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}>{status === "accepted" ? "Acceptée" : status === "refused" ? "Refusée" : "En attente"}</span>; }
function Info({label,value}:{label:string;value:string}) { return <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>; }
function formatDate(date:string) { return new Date(`${date}T12:00:00`).toLocaleDateString("fr-CH", { day:"2-digit", month:"2-digit", year:"numeric" }); }
