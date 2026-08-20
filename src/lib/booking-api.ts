const SUPABASE_URL = "https://vszgyltlolxvcallpnbe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzemd5bHRsb2x4dmNhbGxwbmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzM1NzksImV4cCI6MjEwMjgwOTU3OX0.ke2UT8y_HUlRv34r0Juw4d61vomFF627zXdSwJwp6zY";

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur ${response.status}`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export type BookingKind = "vaccin" | "prestation";
export type ReservationStatus = "pending" | "accepted" | "refused";

export type Reservation = {
  id: string;
  type: BookingKind;
  service: string;
  appointment_date: string;
  start_time: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
};

export type BlockedSlot = {
  id: string;
  type: "vaccin" | "prestation" | "all";
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
};

export async function getUnavailableSlots(type: BookingKind, date: string) {
  return rpc<string[]>("get_unavailable_slots", { p_type: type, p_date: date });
}

export async function createReservation(input: {
  type: BookingKind;
  service: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}) {
  return rpc<string>("create_reservation", {
    p_type: input.type,
    p_service: input.service,
    p_date: input.date,
    p_time: input.time,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
    p_email: input.email || null,
    p_notes: input.notes || null,
  });
}

export async function adminLogin(password: string) {
  return rpc<boolean>("admin_check_password", { p_password: password });
}

export async function adminReservations(password: string) {
  return rpc<Reservation[]>("admin_list_reservations", { p_password: password });
}

export async function adminBlocks(password: string) {
  return rpc<BlockedSlot[]>("admin_list_blocks", { p_password: password });
}

export async function adminSetStatus(password: string, id: string, status: ReservationStatus) {
  return rpc<boolean>("admin_set_reservation_status", {
    p_password: password,
    p_id: id,
    p_status: status,
  });
}

export async function adminAddBlock(password: string, input: {
  type: "vaccin" | "prestation" | "all";
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
}) {
  return rpc<string>("admin_add_block", {
    p_password: password,
    p_type: input.type,
    p_date: input.date,
    p_start_time: input.startTime || null,
    p_end_time: input.endTime || null,
    p_reason: input.reason || null,
  });
}

export async function adminDeleteBlock(password: string, id: string) {
  return rpc<boolean>("admin_delete_block", { p_password: password, p_id: id });
}
