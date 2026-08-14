// In-memory feedback store.
//
// This is a development/mock persistence layer standing in for the PostgreSQL
// `Feedback` table (see `docs/database.md` §9). It exposes a small interface
// (`list`, `findById`, `update`, `softDelete`) so the domain service layer can
// be swapped to Prisma without touching the API or UI.
//
// `createFeedbackStore()` is exported for tests; the app uses the `feedbackStore`
// singleton.

import type { FeedbackRating, FeedbackRecord } from "./types";
import { RATING_OPTIONS } from "./ratings";

export type Branch = { id: string; name: string };
export type Service = { id: string; name: string };

export type FeedbackStore = {
  branches: Branch[];
  services: Service[];
  records: FeedbackRecord[];
  findById(id: string): FeedbackRecord | undefined;
  update(
    id: string,
    patch: Partial<Pick<FeedbackRecord, "rating" | "comment">>,
  ): FeedbackRecord | undefined;
  softDelete(id: string): FeedbackRecord | undefined;
};

export const BRANCHES: Branch[] = [
  { id: "br-main", name: "Main Branch" },
  { id: "br-bole", name: "Bole Branch" },
  { id: "br-megenagna", name: "Megenagna Branch" },
  { id: "br-piassa", name: "Piassa Branch" },
  { id: "br-cmc", name: "CMC Branch" },
  { id: "br-airport", name: "Airport Branch" },
  { id: "br-kotebe", name: "Kotebe Branch" },
  { id: "br-lebu", name: "Lebu Branch" },
  { id: "br-north", name: "North Branch" },
  { id: "br-south", name: "South Branch" },
  { id: "br-east", name: "East Branch" },
  { id: "br-west", name: "West Branch" },
  { id: "br-central", name: "Central Branch" },
];

export const SERVICES: Service[] = [
  { id: "sv-general", name: "General Consultation" },
  { id: "sv-laboratory", name: "Laboratory" },
  { id: "sv-pharmacy", name: "Pharmacy" },
  { id: "sv-emergency", name: "Emergency Care" },
  { id: "sv-maternal", name: "Maternal Care" },
  { id: "sv-pediatrics", name: "Pediatrics" },
  { id: "sv-dental", name: "Dental" },
  { id: "sv-radiology", name: "Radiology" },
  { id: "sv-billing", name: "Billing" },
  { id: "sv-reception", name: "Reception" },
];

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function iso(daysAgo: number, hour = 10, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

type SeedRow = [
  phone: string,
  branchId: string,
  serviceId: string,
  rating: FeedbackRating,
  comment: string | null,
  daysAgo: number,
  hour: number,
];

const SEED_ROWS: SeedRow[] = [
  [
    "+251911203456",
    "br-main",
    "sv-general",
    "VERY_SATISFIED",
    "Excellent service, very professional doctor.",
    0,
    9,
  ],
  [
    "+251912345678",
    "br-bole",
    "sv-laboratory",
    "SATISFIED",
    "Results came back quickly and staff were friendly.",
    0,
    11,
  ],
  [
    "+251913457890",
    "br-east",
    "sv-pharmacy",
    "NOT_SATISFIED",
    "Long queue at the pharmacy counter.",
    0,
    14,
  ],
  [
    "+251914567890",
    "br-megenagna",
    "sv-general",
    "GOOD",
    "Good consultation overall.",
    1,
    10,
  ],
  [
    "+251915678901",
    "br-cmc",
    "sv-pediatrics",
    "VERY_SATISFIED",
    "The pediatrician was patient and caring with my child.",
    1,
    13,
  ],
  [
    "+251916789012",
    "br-west",
    "sv-billing",
    "POOR",
    "Billing was confusing and I was charged incorrectly.",
    1,
    16,
  ],
  [
    "+251917890123",
    "br-airport",
    "sv-radiology",
    "SATISFIED",
    "Clean facility and on-time appointment.",
    2,
    9,
  ],
  [
    "+251918901234",
    "br-piassa",
    "sv-reception",
    "NEUTRAL",
    "Reception could be more welcoming.",
    2,
    12,
  ],
  [
    "+251919012345",
    "br-main",
    "sv-dental",
    "MOSTLY_SATISFIED",
    "Dentist explained everything before starting.",
    3,
    10,
  ],
  [
    "+251920123456",
    "br-bole",
    "sv-maternal",
    "VERY_SATISFIED",
    "Wonderful care during my checkup.",
    3,
    15,
  ],
  [
    "+251921234567",
    "br-north",
    "sv-pharmacy",
    "SATISFIED",
    "Pharmacy had all my medication in stock.",
    4,
    11,
  ],
  [
    "+251922345678",
    "br-south",
    "sv-general",
    "VERY_POOR",
    "Waited over an hour without being seen.",
    4,
    17,
  ],
  [
    "+251923456789",
    "br-lebu",
    "sv-laboratory",
    "GOOD",
    "Staff were helpful, results were accurate.",
    5,
    9,
  ],
  [
    "+251924567890",
    "br-central",
    "sv-emergency",
    "NOT_SATISFIED",
    "Emergency response was slow.",
    5,
    20,
  ],
  [
    "+251925678901",
    "br-kotebe",
    "sv-general",
    "SATISFIED",
    "Doctor listened to my concerns carefully.",
    6,
    10,
  ],
  [
    "+251926789012",
    "br-megenagna",
    "sv-billing",
    "MOSTLY_SATISFIED",
    "Payment process was smooth.",
    6,
    14,
  ],
  ["+251927890123", "br-bole", "sv-dental", "GOOD", null, 7, 11],
  [
    "+251928901234",
    "br-main",
    "sv-reception",
    "NEUTRAL",
    "Front desk staff were okay.",
    7,
    13,
  ],
  [
    "+251929012345",
    "br-east",
    "sv-pediatrics",
    "VERY_SATISFIED",
    "Nurses were so kind to my daughter.",
    8,
    9,
  ],
  [
    "+251930123456",
    "br-west",
    "sv-pharmacy",
    "SATISFIED",
    "Medication was ready on time.",
    8,
    12,
  ],
  [
    "+251931234567",
    "br-airport",
    "sv-general",
    "POOR",
    "The doctor seemed rushed.",
    9,
    10,
  ],
  [
    "+251932345678",
    "br-cmc",
    "sv-radiology",
    "VERY_SATISFIED",
    "Very professional radiology team.",
    9,
    15,
  ],
  [
    "+251933456789",
    "br-piassa",
    "sv-maternal",
    "GOOD",
    "Regular checkup went well.",
    10,
    11,
  ],
  [
    "+251934567890",
    "br-north",
    "sv-reception",
    "NOT_SATISFIED",
    "No one helped me find the right office.",
    10,
    13,
  ],
  [
    "+251935678901",
    "br-south",
    "sv-laboratory",
    "SATISFIED",
    "Good laboratory service.",
    12,
    9,
  ],
  [
    "+251936789012",
    "br-lebu",
    "sv-general",
    "MOSTLY_SATISFIED",
    "Satisfied with the consultation.",
    13,
    14,
  ],
  ["+251937890123", "br-central", "sv-dental", "GOOD", null, 14, 10],
  [
    "+251938901234",
    "br-kotebe",
    "sv-pharmacy",
    "VERY_SATISFIED",
    "Very helpful pharmacist.",
    15,
    12,
  ],
  [
    "+251939012345",
    "br-bole",
    "sv-emergency",
    "NEUTRAL",
    "Long wait but care was good.",
    16,
    18,
  ],
  [
    "+251940123456",
    "br-main",
    "sv-billing",
    "SATISFIED",
    "Invoice was clear and correct.",
    17,
    11,
  ],
  [
    "+251941234567",
    "br-east",
    "sv-general",
    "VERY_SATISFIED",
    "Best experience I have had at a clinic.",
    18,
    9,
  ],
  [
    "+251942345678",
    "br-west",
    "sv-maternal",
    "MOSTLY_SATISFIED",
    "Care team was supportive.",
    19,
    13,
  ],
  [
    "+251943456789",
    "br-megenagna",
    "sv-pharmacy",
    "NOT_SATISFIED",
    "Medication was out of stock.",
    21,
    10,
  ],
  [
    "+251944567890",
    "br-airport",
    "sv-reception",
    "POOR",
    "Reception staff were rude.",
    22,
    14,
  ],
  [
    "+251945678901",
    "br-cmc",
    "sv-laboratory",
    "GOOD",
    "Laboratory staff were professional.",
    24,
    9,
  ],
  [
    "+251946789012",
    "br-piassa",
    "sv-general",
    "SATISFIED",
    "Overall a good visit.",
    26,
    11,
  ],
  [
    "+251947890123",
    "br-north",
    "sv-dental",
    "VERY_SATISFIED",
    "Painless tooth extraction, highly recommended.",
    28,
    10,
  ],
  [
    "+251948901234",
    "br-south",
    "sv-emergency",
    "SATISFIED",
    "Handled my emergency quickly.",
    31,
    20,
  ],
  [
    "+251949012345",
    "br-lebu",
    "sv-pharmacy",
    "NEUTRAL",
    "Average pharmacy experience.",
    34,
    12,
  ],
  ["+251950123456", "br-central", "sv-general", "GOOD", null, 38, 10],
  [
    "+251951234567",
    "br-bole",
    "sv-radiology",
    "MOSTLY_SATISFIED",
    "Results were sent to my doctor promptly.",
    42,
    13,
  ],
  [
    "+251952345678",
    "br-main",
    "sv-maternal",
    "VERY_SATISFIED",
    "Great follow-up care.",
    47,
    9,
  ],
  [
    "+251953456789",
    "br-east",
    "sv-billing",
    "POOR",
    "Charged twice for the same visit.",
    53,
    11,
  ],
  [
    "+251954567890",
    "br-west",
    "sv-general",
    "NOT_SATISFIED",
    "Doctor did not explain the prescription.",
    61,
    14,
  ],
  [
    "+251955678901",
    "br-megenagna",
    "sv-pediatrics",
    "SATISFIED",
    "Kids area could use more toys but care was good.",
    75,
    10,
  ],
  [
    "+251956789012",
    "br-airport",
    "sv-pharmacy",
    "GOOD",
    "Pharmacist explained the dosage clearly.",
    90,
    12,
  ],
  [
    "+251957890123",
    "br-cmc",
    "sv-general",
    "VERY_SATISFIED",
    "Excellent attention from start to finish.",
    120,
    10,
  ],
];

function buildSeedRecords(): FeedbackRecord[] {
  return SEED_ROWS.map(
    ([phone, branchId, serviceId, rating, comment, daysAgo, hour], index) => {
      const branch = BRANCHES.find((b) => b.id === branchId)!;
      const service = SERVICES.find((s) => s.id === serviceId)!;
      return {
        id: `fb-${String(index + 1).padStart(4, "0")}`,
        phoneNumber: phone,
        branchId,
        branchName: branch.name,
        serviceId,
        serviceName: service.name,
        rating,
        comment,
        createdAt: iso(daysAgo, hour, (index * 7) % 60),
        deletedAt: null,
      };
    },
  );
}

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

export function createFeedbackStore(): FeedbackStore {
  const records: FeedbackRecord[] = buildSeedRecords();

  return {
    branches: BRANCHES.map((b) => ({ ...b })),
    services: SERVICES.map((s) => ({ ...s })),
    records,

    findById(id) {
      return records.find((record) => record.id === id);
    },

    update(id, patch) {
      const index = records.findIndex(
        (record) => record.id === id && record.deletedAt === null,
      );
      if (index === -1) return undefined;
      const updated = { ...records[index], ...patch };
      records[index] = updated;
      return updated;
    },

    softDelete(id) {
      const index = records.findIndex(
        (record) => record.id === id && record.deletedAt === null,
      );
      if (index === -1) return undefined;
      const updated = {
        ...records[index],
        deletedAt: new Date().toISOString(),
      };
      records[index] = updated;
      return updated;
    },
  };
}

export const feedbackStore = createFeedbackStore();

export { RATING_OPTIONS };
