# HealSync — Product Requirements Document (PRD)

**Status: Draft — Phase 2 (design)**

This document is the source of truth for **what** HealSync is and **why** it
exists. It supersedes the Phase 1 placeholder. Implementation decisions
(workflows, architecture, data model, APIs, security, deployment) are
specified in the sibling documents:

| Document                           | Answers                                  |
| ---------------------------------- | ---------------------------------------- |
| [WORKFLOWS.md](WORKFLOWS.md)       | How users accomplish tasks, step by step |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the application is built             |
| [DATABASE.md](DATABASE.md)         | How data is modeled and stored           |
| [API.md](API.md)                   | How clients interact programmatically    |
| [SECURITY.md](SECURITY.md)         | How data is protected                    |
| [DEPLOYMENT.md](DEPLOYMENT.md)     | How the system runs in production        |

> **Reading guide for stakeholders:** this document is written for both
> product owners and engineers. Sections 1–5 and 13 are product-oriented;
> sections 6–12 define requirements precisely enough to plan engineering
> work.

---

## 1. Product Overview

### 1.1 What is HealSync?

HealSync is a feedback and analytics platform for **private healthcare
clinics**. It gives clinics a structured way to collect patient feedback and
transform it into actionable operational insights.

The product has two distinct experiences:

```text
Patient Feedback Experience        Administrative Analytics Platform
----------------------------       ---------------------------------
One page, no account.              Authenticated, analytical, information-rich.
Answer a few questions.            Trends, comparisons, drill-downs, management.
```

The single question HealSync exists to answer:

> _"How are our clinics performing, what are patients experiencing, and
> where should management improve?"_

### 1.2 The problem it solves

Private clinics receive feedback through fragmented, unstructured channels:
word of mouth, paper forms, phone calls, social media posts, Google reviews,
and ad-hoc conversations. Each channel is siloed, unquantified, and rarely
acted upon systematically.

As a result, clinic management cannot reliably answer:

- Which branch performs best, and which is struggling?
- Which services have poor satisfaction?
- Are patients satisfied with their doctors? With nurses?
- Is reception or waiting time driving dissatisfaction?
- Is performance improving or declining over time?
- Which issues keep recurring?

HealSync centralizes feedback into **one structured, queryable dataset** and
adds the analysis layer needed to act on it.

### 1.3 Who uses it

| Actor              | Relationship to the product                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Patients**       | Submit feedback after receiving a service. No account required. Never authenticate.   |
| **Administrators** | Authenticated staff who review feedback, analyze performance, and manage clinic data. |

### 1.4 Why generic feedback mechanisms are insufficient

- **Paper forms / verbal feedback** — not aggregated, not quantified, no history.
- **Social media / Google reviews** — public, unverified, mixed with non-clinic
  context, cannot be tied to a specific branch, service, or visit.
- **Internal chat / email** — unstructured, unsearchable, no metrics.

Generic surveys that do exist are often:

- not tied to a **specific branch or service** the patient actually received;
- not normalized to a **consistent rating scale**;
- buried under low response effort (long forms, account creation);
- unusable for **operational comparison** (branch vs branch, service vs service).

### 1.5 Why structured clinic feedback is useful

When feedback is structured, it becomes _operational data_:

- every record is tied to a branch, a service, and a point in time;
- ratings are consistent and comparable;
- trends can be computed over any date range;
- recurring issues become visible patterns instead of isolated complaints;
- management effort can be prioritized toward the biggest dissatisfaction drivers.

---

## 2. Problem Statement

Private healthcare clinics lack a lightweight, structured channel for
collecting patient experience feedback and converting it into operational
decisions.

Feedback arrives via scattered informal channels. There is no single place
where a clinic can see:

- **Which branch performs best** across consistent metrics;
- **Which branch is struggling** and may need attention;
- **Which services have poor satisfaction** and should be improved or
  re-scoped;
- **whether patients are satisfied with specific staff** (where attribution
  is appropriate);
- **whether waiting time or reception is a systemic problem**;
- **whether performance is improving or declining** over time;
- **which issues repeatedly appear** and warrant a fix.

HealSync centralizes this information. It does not invent statistics — it
quantifies what patients actually report.

---

## 3. Product Goals

Measurable, product-oriented goals for the initial release (MVP):

1. **Make feedback submission extremely easy.** A patient can complete the
   flow from an empty browser in under one minute, on any device, without an
   account.
2. **Collect structured feedback consistently.** Every submission captures a
   branch, a service, an overall satisfaction rating, and an optional comment,
   using a single consistent rating scale.
3. **Associate feedback with the real operational context.** Feedback is
   permanently tied to the branch and service the patient received (and,
   where appropriate, to a category such as reception, waiting time, or a
   specific staff member).
4. **Enable branch comparison.** Management can compare branches on identical
   metrics over the same period.
5. **Surface trends over time.** Satisfaction, volume, and issue patterns can
   be viewed over day, week, month, or custom date ranges.
6. **Identify operational weaknesses.** Administrators can see which services,
   branches, and categories generate the most dissatisfaction.
7. **Help administrators prioritize.** Analytics feed a simple
   data → analysis → insight → action pipeline (see §11).
8. **Keep administrator workflows efficient.** Feedback lists are filterable,
   paginated, and drillable; metrics link back to the underlying records.

Success signals (non-contractual, directional): rising satisfaction %, growing
feedback volume, and branch/service leaders clearly distinguishable from
laggards.

---

## 4. Non-Goals

HealSync is **not**:

- an electronic medical record (EMR) / EHR system;
- a hospital management system;
- a patient portal (no medical history, no appointment booking as a core
  feature);
- a medical diagnosis or clinical decision support system;
- a payment or billing system;
- a replacement for medical records;
- a messaging platform between patients and doctors;
- a public review site (reviews are visible only to authorized administrators).

HealSync deliberately **does not** store medical information, diagnoses, or
treatment details in its MVP. The only personal data it collects is the
patient's phone number (see [SECURITY.md](SECURITY.md) for treatment) and the
free-text comment, which is treated as sensitive content.

These non-goals prevent scope creep and keep the MVP focused on the value
loop: patient experience → feedback → structured data → analytics →
operational insight → clinic improvement.

---

## 5. User Types

### 5.1 Patient

An individual who received a service from a clinic branch and wishes to
provide feedback.

- **Does not need an account.** The MVP has no patient registration, login,
  or identity system.
- **Provides minimal data:** the branch visited, the service received, a
  phone number, an overall rating, and optionally a written comment.
- **Expects:** speed, clarity, privacy of their contact details, and no
  follow-up spam.

### 5.2 Administrator

A user authorized to access the HealSync management platform.

- Authenticates with email + password via **Better Auth** (already wired in
  the foundation).
- Can eventually:
  - view and filter feedback;
  - view analytics (overall, branch, service, trends);
  - manage clinics, branches, services, and staff;
  - manage administrative settings.

**Permission note:** HealSync does **not** assume every administrator has
identical permissions. A future role/permission model (RBAC) may distinguish
responsibilities — e.g., _clinic manager_ (one branch's data) vs. _platform
admin_ (everything). For MVP, a single administrator role is assumed; this is
an open decision (see §14).

---

## 6. Patient Experience Requirements

### 6.1 Intended patient flow

```text
Open feedback page
      ↓
Select clinic/branch
      ↓
Select service
      ↓
Provide phone number
      ↓
Provide rating / satisfaction
      ↓
Optionally provide written feedback
      ↓
Submit
      ↓
Receive confirmation
```

### 6.2 Step-by-step explanation

| Step                   | Details                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Open feedback page** | A public URL (e.g. `/feedback`). No login, no app install. Works on any modern browser.                     |
| **Select branch**      | The patient picks the branch they visited. Branches are grouped under their clinic so the list stays small. |
| **Select service**     | The patient picks the service they received from the chosen branch's service catalog.                       |
| **Provide phone**      | A contact number for follow-up and (future) duplicate/abuse control. Treated as sensitive personal data.    |
| **Provide rating**     | One required overall satisfaction rating (see §8).                                                          |
| **Optional comment**   | Free text describing the experience. Length-capped.                                                         |
| **Submit**             | Client-side validation, then server-side validation, then persistence.                                      |
| **Confirmation**       | A clear success message. No account, no login required afterwards.                                          |

### 6.3 Experience principles

- **Mobile-first.** The flow is optimized for a phone: large touch targets,
  few steps, no horizontal scrolling.
- **Fast.** One lightweight page; no heavy client-side framework work on the
  critical path.
- **Accessible.** Keyboard-navigable, labeled controls, adequate contrast,
  works with screen readers. WCAG 2.1 AA is the working target.
- **Simple & understandable.** Plain language, no jargon, obvious next step
  at every stage.
- **Low-friction.** No account creation, no redundant questions, sensible
  defaults and disabled-submit-until-valid behavior.
- **Honest about privacy.** A short, plain-language note explains what the
  phone number is used for.

---

## 7. Feedback Model (Conceptual)

The conceptual structure of a feedback record. **This is a product-level
description, not a final database schema** — exact fields, types, and
constraints are finalized in [DATABASE.md](DATABASE.md).

A feedback record may contain:

| Concept                  | Product-level meaning                                                       | Product requirement                   | DB implementation detail           |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------- |
| **Clinic / branch**      | Where the service was received. Branch implies clinic.                      | Required                              | FK to branch                       |
| **Service**              | What the patient received (e.g. consultation, vaccination, lab test).       | Required                              | FK to service                      |
| **Patient contact**      | Phone number for follow-up. Treated as PII.                                 | Required in flow (see Open Decisions) | Dedicated column(s), PII treatment |
| **Overall satisfaction** | One rating on the shared scale.                                             | Required                              | Rating column                      |
| **Comment**              | Optional free text.                                                         | Optional                              | Text column, length-capped         |
| **Submission timestamp** | When the feedback was submitted (server time).                              | Required                              | createdAt                          |
| **Feedback category**    | Aspect of the visit the feedback relates to (reception, waiting time, ...). | Optional at MVP                       | FK/relation or enum                |
| **Staff association**    | Optional attribution to a doctor/nurse/etc.                                 | Optional at MVP (Open Decision)       | Nullable FK to staff               |
| **Rating dimensions**    | Future: service-specific or staff-specific rating breakdowns.               | Post-MVP                              | Not in MVP schema                  |

> **Rule:** product requirements (what a record contains) are decided here;
> database implementation details (how it is stored) are decided in
> [DATABASE.md](DATABASE.md). Neither is finalized until the database-design
> review.

---

## 8. Rating System

### 8.1 Proposed model

A single, consistent **5-point integer satisfaction scale**:

```text
1 — Very dissatisfied
2 — Dissatisfied
3 — Neutral
4 — Satisfied
5 — Very satisfied
```

- The scale is **global** — every submission, branch, and service uses the
  same scale, which is what makes cross-branch and cross-service comparison
  meaningful.
- The UI uses labeled options (stars or numbered buttons with labels) so
  patients do not need to interpret abstract numbers.

### 8.2 Metrics derived from the scale (proposed)

Working definitions (to be confirmed during analytics design; see
[ARCHITECTURE.md](ARCHITECTURE.md) §Analytics):

```text
Satisfaction %     = (records with rating ≥ 4) / (total rated records) × 100
Dissatisfaction %  = (records with rating ≤ 2) / (total rated records) × 100
Average rating     = mean(rating)
Rating distribution = count per rating level (1..5)
```

> These groupings (≥4 satisfied, ≤2 dissatisfied, 3 neutral) are **proposed**.
> They are open to change and must be documented wherever they are used.

### 8.3 Scope of ratings in the MVP

- **MVP:** a single **overall satisfaction** rating per submission.
- **Post-MVP / open:** service-specific, staff-specific, or
  category-specific rating dimensions. These are _not_ MVP requirements —
  adding dimensions multiplies form friction and model complexity and is
  deferred until the overall system proves valuable.

---

## 9. Feedback Categories

Categories describe **which aspect of the visit** the feedback concerns
(e.g., _reception_, _waiting time_). They are **not** services, **not** staff
types, and **not** rating dimensions. The distinctions:

| Concept              | Question it answers                   | Example                         |
| -------------------- | ------------------------------------- | ------------------------------- |
| **Category**         | Which aspect of the experience?       | Reception, waiting time, doctor |
| **Service**          | What service did the patient receive? | Consultation, vaccination       |
| **Staff type**       | What role does the staff member have? | Doctor, nurse, receptionist     |
| **Rating dimension** | Separate rating per aspect (future).  | Cleanliness rating (post-MVP)   |

### 9.1 Proposed category set (MVP)

```text
Doctor
Nurse
Reception
Laboratory
Pharmacy
Waiting time
Cleanliness
Facility
Service quality
General experience
```

### 9.2 Fixed vs. configurable (proposed)

- **MVP:** a **fixed, curated set** of categories (the list above), stored in
  the database and seeded — not hardcoded in the UI. This keeps feedback
  comparable while allowing future re-labeling.
- **Post-MVP:** categories become **configurable per clinic** (add, rename,
  disable). This is explicitly deferred.

> **Note:** whether `Laboratory` and `Pharmacy` are _categories_ or _services_
> in a given clinic is a real ambiguity — some clinics treat them as services
> patients choose. This is listed under [Open Decisions](#16-open-decisions).
> The data model must not force a wrong choice.

---

## 10. Administrator Dashboard Requirements

The admin experience must eventually answer the questions below. Everything
is **read-optimized, filterable, and drillable** (a metric always links to the
feedback records behind it).

### 10.1 Overall

- How satisfied are patients overall (satisfaction %, average rating)?
- How much feedback has been received (volume, in the selected period)?
- Is satisfaction improving or declining (trend)?

### 10.2 Branches

- Which branch performs best / worst on consistent metrics?
- Which branches are improving, and which need attention?

### 10.3 Services

- Which services have the highest / lowest satisfaction?
- Which services generate the most negative feedback?

### 10.4 Staff (conditional)

- Doctor, nurse, and other staff-category performance **only where** the data
  model supports attribution and privacy considerations allow it (see
  [DATABASE.md](DATABASE.md) §Staff and [SECURITY.md](SECURITY.md)).
- Staff-level analytics are **post-MVP** unless explicitly pulled into scope.

### 10.5 Trends & time ranges

- Analysis over **day, week, month, and custom date ranges**.
- Every analytics view carries an explicit, visible date range.

### 10.6 Filtering

Administrators can filter feedback by: branch, service, category, rating,
date range, and free-text search. Filtering preserves context when drilling
into records.

---

## 11. Analytics Requirements

Analytics is defined by the **questions** it answers, not by "charts":

```text
What is the average satisfaction?
What percentage of feedback is positive (satisfied)?
What percentage is negative (dissatisfied)?
Which branch is underperforming?
Which service is underperforming?
How has satisfaction changed over time?
Which issues appear repeatedly?
```

### 11.1 Metrics (proposed)

| Metric              | Definition (working assumption)                                          |
| ------------------- | ------------------------------------------------------------------------ |
| Total feedback      | Count of submissions in range                                            |
| Average rating      | Mean of ratings in range                                                 |
| Satisfaction %      | Share of ratings ≥ 4                                                     |
| Dissatisfaction %   | Share of ratings ≤ 2                                                     |
| Rating distribution | Count per rating level 1–5                                               |
| Feedback volume     | Submissions per time bucket (day/week/month)                             |
| Branch comparison   | The metrics above computed per branch                                    |
| Service comparison  | The metrics above computed per service                                   |
| Trend over time     | Metrics computed per time bucket over a range                            |
| Top issues          | Most frequent categories among dissatisfied ratings (post-MVP candidate) |

**Rule:** every metric must have a clearly defined calculation and a stated
assumption (e.g. what counts as "satisfied"). No formula is invented without
documenting its assumptions; no unsupported statistics are presented as fact.

### 11.2 Computation approach

Analytics are **computed from transactional feedback data** with SQL
aggregation (`feedback → SQL aggregation → analytics`). No data warehouse,
event stream, or OLAP database in the MVP (see [DATABASE.md](DATABASE.md)
§Analytics data and [ARCHITECTURE.md](ARCHITECTURE.md)).

---

## 12. Actionable Insights

The product moves beyond raw data through a defined pipeline:

```text
Data            →  Analysis           →  Insight           →  Potential action
(satisfaction = 61%)  (most negative feedback tied to  (nursing/waiting-time  (management investigates
                      long waiting times)                 experience is a major  staffing and queue times)
                                                          dissatisfaction driver)
```

Concrete example:

```text
Data:     Nursing satisfaction = 61%
Analysis: Most negative feedback is associated with long waiting times.
Insight:  Nursing/waiting-time experience is a major dissatisfaction driver.
Action:   Management should investigate staffing levels and queue times.
```

**Boundary:** HealSync presents operational insights and recommendations for
clinic management. It does **not** provide medical advice, clinical
recommendations, or patient-specific guidance. Insights are directional
signals for management review — never automated verdicts about staff
individuals or clinical quality.

---

## 13. MVP vs. Future

### 13.1 MVP (first useful release)

**Patients:**

- Public feedback page (branch → service → phone → rating → optional comment
  → submit → confirmation).
- Mobile-first, accessible, fast; no account.

**Administrators:**

- Email + password login (Better Auth).
- Feedback list with filters (branch, service, category, rating, date range,
  search) and pagination.
- Core analytics: total feedback, average rating, satisfaction %,
  dissatisfaction %, rating distribution, volume over time, branch comparison,
  service comparison, trends over day/week/month/custom range.
- Drill-down from metrics to feedback records.
- Management of clinics, branches, and services (create, read, update,
  archive). (Scope of staff management — see Open Decisions.)

### 13.2 Post-MVP (future capabilities — NOT MVP requirements)

- SMS feedback links and QR-code feedback.
- AI-generated summaries of feedback.
- Automated alerts for negative feedback spikes.
- Sentiment analysis of comments.
- Configurable surveys and clinic-specific categories.
- Multilingual feedback.
- Advanced role-based access control (RBAC).
- Benchmarking against other clinics (aggregate, anonymized).
- Scheduled reports and email notifications.
- Clinic performance scoring.
- Staff-level analytics and feedback attribution.
- Duplicate-submission prevention and CAPTCHA hardening.

> These are deliberately _future_ capabilities. Do not design the MVP around
> them; do design the architecture so they remain possible (see
> [ARCHITECTURE.md](ARCHITECTURE.md)).

---

## 14. Non-Functional Requirements

| ID    | Area            | Requirement                                                                                        |
| ----- | --------------- | -------------------------------------------------------------------------------------------------- |
| NFR-1 | Security        | All external input is validated; admin endpoints enforce authentication and authorization.         |
| NFR-2 | Privacy         | Patient phone numbers are treated as sensitive data (see [SECURITY.md](SECURITY.md)).              |
| NFR-3 | Performance     | The feedback page loads and submits quickly (target: interactive in < 2s on typical mobile).       |
| NFR-4 | Performance     | Feedback lists are paginated; analytics queries return in bounded time on MVP data volumes.        |
| NFR-5 | Accessibility   | WCAG 2.1 AA working target for patient and admin UIs.                                              |
| NFR-6 | Maintainability | Modular monolith, typed services, Zod at boundaries, documented conventions.                       |
| NFR-7 | Testability     | Unit tests for services/validation; e2e tests for the patient flow and key admin flows.            |
| NFR-8 | Availability    | No hard uptime SLA for MVP; the platform must fail gracefully and never leak internals.            |
| NFR-9 | Auditability    | Administrative changes to clinics/branches/services are recorded (see [DATABASE.md](DATABASE.md)). |

---

## 15. Functional Requirements Summary

Requirement IDs are used across the workflow and API documents to keep
traceability.

### Patient (FR-PAT-*)

| ID       | Requirement                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| FR-PAT-1 | Patient can open the feedback page without an account.                                         |
| FR-PAT-2 | Patient selects the branch visited (branch implies clinic).                                    |
| FR-PAT-3 | Patient selects the service received, from the branch's service catalog.                       |
| FR-PAT-4 | Patient provides a phone number (required in the flow — see Open Decisions).                   |
| FR-PAT-5 | Patient provides one overall satisfaction rating.                                              |
| FR-PAT-6 | Patient may optionally provide a written comment.                                              |
| FR-PAT-7 | On submit, the record is validated (client + server) and persisted; patient sees confirmation. |
| FR-PAT-8 | The flow works on mobile, is accessible, and is understandable without instructions.           |

### Administrator (FR-ADM-*)

| ID        | Requirement                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------- |
| FR-ADM-1  | Administrator can sign in with email + password.                                                     |
| FR-ADM-2  | Administrator can view feedback with filters: branch, service, category, rating, date range, search. |
| FR-ADM-3  | Administrator can view core metrics: total, average rating, satisfaction %, distribution, volume.    |
| FR-ADM-4  | Administrator can compare branches on identical metrics.                                             |
| FR-ADM-5  | Administrator can compare services on identical metrics.                                             |
| FR-ADM-6  | Administrator can view trends over day/week/month/custom ranges.                                     |
| FR-ADM-7  | Administrator can drill from any metric to the underlying feedback records.                          |
| FR-ADM-8  | Administrator can manage clinics, branches, and services (create/read/update/archive).               |
| FR-ADM-9  | Destructive administrative operations require explicit confirmation.                                 |
| FR-ADM-10 | Administrators see phone numbers masked by default (see [SECURITY.md](SECURITY.md)).                 |

---

## 16. Open Decisions

Decisions that require product/team input before or during implementation.
**Do not silently resolve these.**

- **Phone number: required vs. optional?** The flow includes a phone step,
  but requiring real phone numbers is a friction/privacy trade-off. Options:
  required for MVP (current working assumption), optional, or store a hash
  instead of the raw number (see [SECURITY.md](SECURITY.md) and
  [DATABASE.md](DATABASE.md)).
- **Should staff-level ratings/attribution be part of MVP?** The product
  description mentions staff performance analysis, but MVP scope may exclude
  staff attribution entirely. Post-MVP candidate unless pulled in.
- **Should services belong globally to a clinic or individually to branches?**
  Affects the data model and the patient flow (see [DATABASE.md](DATABASE.md)
  and [Open Decisions](#16-open-decisions) there).
- **What exact rating model?** 1–5 labeled scale is proposed; the
  satisfied/dissatisfied thresholds (≥4 / ≤2) need confirmation.
- **What administrator roles are required?** MVP assumes a single admin role;
  the RBAC model (clinic-level vs platform-level admins) needs definition.
- **Are `Laboratory` / `Pharmacy` categories or services?** Real clinics
  differ; the model must not force a single choice.
- **Should negative feedback automatically trigger alerts?** Defined as
  post-MVP; confirm no auto-alerts in MVP (see [WORKFLOWS.md](WORKFLOWS.md)).
- **Feedback status lifecycle?** Whether records need a `new / reviewed /
archived` status for admin triage, or stay purely transactional in MVP.
- **Category selection: required or optional at MVP?** Optional is proposed to
  minimize form friction.

---

## 17. Glossary

| Term         | Definition                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Clinic**   | The organization (brand). Owns multiple branches.                 |
| **Branch**   | A physical clinic location. Where patients receive services.      |
| **Service**  | What the patient received (consultation, vaccination, ...).       |
| **Staff**    | A person employed at a branch (doctor, nurse, receptionist, ...). |
| **Category** | The aspect of the visit the feedback concerns (reception, ...).   |
| **Feedback** | A single patient submission: branch + service + rating + comment. |
| **Admin**    | An authenticated administrator of the management platform.        |
