export const PHARMACY = {
  name: "Pharmacie Du Marché",
  city: "Carouge",
  phone: "022 342 00 44",
  phoneHref: "tel:+41223420044",
  address: "Place du Marché 1, 1227 Carouge",
  languages: ["Français", "Allemand", "Anglais", "Italien", "Portugais"],
};

export const HOURS: { day: string; hours: string }[] = [
  { day: "Lundi", hours: "08:00 – 18:30" },
  { day: "Mardi", hours: "08:00 – 18:30" },
  { day: "Mercredi", hours: "08:00 – 18:30" },
  { day: "Jeudi", hours: "08:00 – 18:30" },
  { day: "Vendredi", hours: "08:00 – 18:30" },
  { day: "Samedi", hours: "08:00 – 14:00" },
  { day: "Dimanche", hours: "Fermé" },
];

export const VACCINES: string[] = [
  "Vaccin FSME (encéphalite à tiques)",
  "Vaccin ROR (rougeole, oreillons, rubéole)",
  "Vaccin Hépatite A",
  "Vaccin Hépatite B",
  "Vaccin Hépatite A + B",
  "Vaccin Diphtérie-Tétanos-Coqueluche (dTpa)",
  "Vaccin Papillomavirus (HPV)",
  "Vaccin Méningocoques",
  "Vaccin Pneumocoques",
  "Vaccin Herpès zoster (zona)",
  "Vaccin Varicelle",
  "Vaccin Diphtérie-Tétanos-Poliomyélite (dT-IPV)",
  "Vaccin Diphtérie-Tétanos-Coqueluche-Poliomyélite (dTpa-IPV)",
  "Vaccin Covid-19",
  "Vaccin grippe",
  "Vaccin Virus Respiratoire Syncytial (VRS)",
];

export const CONSULTATIONS: string[] = [
  "Contraception d’urgence",
  "Cardiotest",
  "Dépistage du cancer du côlon",
  "Test streptocoques",
  "Infections urinaires / cystites",
  "Affection oculaire",
  "Affection dermatologique",
  "Inconfort vaginal",
  "Dysfonction érectile",
  "Perte de cheveux chez l’homme",
  "Soins des plaies légères et des brûlures",
  "Mesure de la glycémie",
  "Troubles du sommeil",
  "Mesure de la tension artérielle",
];

export const EXPERTISE: string[] = [
  "Test de glycémie",
  "Test de tension artérielle",
  "Prévention cardiovasculaire | CardioCheck | CardioTest",
  "Dépistage du cancer colorectal",
  "Contraception d’urgence",
  "Vaccination contre la grippe",
  "Vaccination contre l’hépatite A/B",
  "Vaccination contre la rougeole, les oreillons et la rubéole (ROR)",
  "Mesure des bas de contention",
  "Vaccination contre le zona",
  "Mal de gorge | Angine",
  "Test de dépistage du streptocoque",
  "Vaccination contre le tétanos, la diphtérie et la coqueluche (TDAP)",
  "Vaccination contre l’encéphalite à tiques (TBE)",
  "Conseils aux voyageurs",
];

export const MAP_EMBED =
  "https://www.google.com/maps?q=Place+du+March%C3%A9+1,+1227+Carouge&output=embed";

export const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=Place+du+March%C3%A9+1,+1227+Carouge";

/** Créneaux horaires proposés à la réservation, par jour de la semaine (0 = dimanche). */
export function slotsForDate(dateStr: string): string[] {
  if (!dateStr) return [];
  const date = new Date(`${dateStr}T12:00:00`);
  const day = date.getDay();
  if (day === 0) return [];
  const end = day === 6 ? 13.5 : 18;
  const slots: string[] = [];
  for (let t = 8.5; t <= end; t += 0.5) {
    const h = Math.floor(t);
    const m = t % 1 === 0 ? "00" : "30";
    slots.push(`${String(h).padStart(2, "0")}:${m}`);
  }
  return slots;
}
