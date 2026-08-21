-- Preserve the language selected by the patient at submission time. Existing
-- records predate language selection and therefore remain English by default.
ALTER TABLE "feedback" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
