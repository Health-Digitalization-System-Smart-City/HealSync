# Product Requirements Document (PRD)

## Healthcare Clinic Feedback & Analytics Platform

**Document:** `PRD.md`
**Version:** 1.0
**Status:** Draft — V1
**Audience:** Product team, developers, designers, QA, DevOps, AI coding agents

---

# 1. Product Overview

## 1.1 Product Name

**Healthcare Clinic Feedback & Analytics Platform**

> The final product name can be decided separately.

## 1.2 Product Purpose

The platform is a centralized feedback collection and analytics system for a healthcare clinic operating approximately **13 branches**.

The system allows patients to quickly submit feedback about the branch and service they received. Patients can provide both:

* Structured feedback using predefined options.
* Free-form feedback written in their own words.

Authorized clinic personnel can then access a secure administrative dashboard to analyze the collected feedback across branches, services/departments, and time periods.

The system should transform raw patient feedback into useful operational information that helps clinic management understand:

* Which branches are performing well.
* Which services/departments are performing well or poorly.
* How patient satisfaction changes over time.
* Where problems are occurring.
* Whether performance is improving or declining.
* What patients are saying in their own words.
* What areas require management attention.

The platform should prioritize **simplicity for patients, strong analytics for management, and strict access control for administrative users**.

---

# 2. Problem Statement

The clinic needs a centralized way to collect and understand patient feedback across its approximately 13 branches.

Without a centralized feedback platform:

* Feedback can be difficult to collect consistently.
* Management may not have a unified view across branches.
* Poor-performing departments may be difficult to identify.
* Trends over time may be missed.
* Manual analysis of written feedback is time-consuming.
* Management may not know which areas require immediate attention.
* Access to sensitive operational information may not be sufficiently controlled.

The platform solves this by creating a single feedback system where patient responses are collected consistently and transformed into actionable analytics.

---

# 3. Product Goals

## 3.1 Primary Goals

### G1 — Simple patient feedback collection

A patient should be able to submit feedback with minimal friction.

The core patient flow should be:

```text
Open platform
    ↓
Enter phone number
    ↓
Select branch
    ↓
Select service/department
    ↓
Select predefined feedback
       OR
Write free-text feedback
    ↓
Submit
    ↓
Confirmation
```

The process should be optimized for mobile devices because patients are expected to primarily access the system from phones.

---

### G2 — Centralized feedback storage

All feedback from all branches should be stored in a centralized database.

Every feedback record should be associated with enough contextual information to support analytics, including:

* Branch
* Service/department
* Feedback type
* Structured rating/value
* Optional free-text feedback
* Patient phone number
* Submission timestamp
* Relevant system metadata

---

### G3 — Powerful management dashboard

Authorized users should be able to access a dashboard that provides detailed analytics.

The dashboard should allow users to understand feedback at multiple levels:

```text
Organization
    ↓
Branch
    ↓
Service / Department
    ↓
Time period
    ↓
Individual feedback
```

---

### G4 — Time-based analytics

Management should be able to analyze feedback for:

* Today
* Yesterday
* This week
* Previous week
* This month
* Previous month
* This year
* Previous year
* Custom date range
* Specific selected day/date

The system should make it easy to compare periods where appropriate.

---

### G5 — Branch and service performance analysis

Management should be able to identify:

* Highest-performing branches.
* Lowest-performing branches.
* Highest-performing services/departments.
* Lowest-performing services/departments.
* Satisfaction distribution.
* Feedback volume.
* Changes in performance over time.

---

### G6 — AI-assisted feedback analysis

The platform should use AI where it provides meaningful analytical value.

AI should help transform free-text feedback into useful insights such as:

* Common complaints.
* Common positive experiences.
* Recurring issues.
* Sentiment trends.
* Important themes.
* Potential problem areas.
* Summaries of large amounts of feedback.
* Branch/service-specific insights.

AI-generated insights should be treated as **analytical assistance**, not as authoritative facts.

The original patient feedback must remain the source of truth.

---

### G7 — Controlled administrative access

Dashboard access must not be public.

Only authorized users should be able to access management functionality.

The system should support multiple administrative roles with different permissions.

The **administrator** should have the ability to register/create other dashboard users.

---

### G8 — Controlled data modification

Only authorized roles should be able to:

* Create branches.
* Update branches.
* Delete/deactivate branches.
* Create services/departments.
* Update services/departments.
* Delete/deactivate services/departments.
* Update feedback records where permitted.
* Delete feedback records where permitted.

These operations must be controlled through role-based permissions.

---

# 4. Non-Goals

The following are outside the core purpose of the V1 platform unless explicitly added later.

### 4.1 Patient accounts

Patients should **not** need to create an account.

The patient-facing experience should remain lightweight.

---

### 4.2 Appointment management

The system is not an appointment scheduling system.

---

### 4.3 Medical records

The system must not become a medical records management system.

It should not store:

* Diagnoses
* Medical histories
* Prescriptions
* Lab results
* Clinical notes

unless a future requirement explicitly introduces them.

---

### 4.4 Patient portal

The platform is not intended to replace a full patient portal.

---

### 4.5 Clinical decision-making

The AI analytics system must not make medical diagnoses or clinical decisions.

---

# 5. Users and Roles

The system has two major user categories.

## 5.1 Patient

Patients interact with the public feedback interface.

### Patient capabilities

A patient can:

1. Open the feedback platform.
2. Enter their phone number.
3. Select a clinic branch.
4. Select a service/department.
5. Choose predefined feedback.
6. Optionally provide free-text feedback.
7. Submit feedback.
8. Receive submission confirmation.

Patients should not have access to:

* Administrative dashboard.
* Other patients' feedback.
* Analytics.
* User management.
* Branch management.
* Service management.

---

# 6. Administrative Users

Administrative users access the protected dashboard.

Role names and permissions are finalized in `security.md` §2 (Roles) and §3
(Permission Model). The system uses three **fixed** roles — Admin, Manager,
and Analyst — and does not support custom roles.

A conceptual model is:

```text
Admin
 ├── User Management
 ├── Branch Management
 ├── Service Management
 ├── Feedback Management
 ├── Analytics
 └── AI Insights

Manager
 ├── Analytics
 └── Permitted feedback access

Analyst
 ├── Dashboard
 └── Analytics (read-only)
```

The exact role hierarchy should **not** be hard-coded into the frontend.

Authorization should be based on backend permissions.

---

# 7. Administrator Responsibilities

The administrator is responsible for managing access to the system.

An administrator should be able to:

* Register dashboard users.
* Assign roles.
* Modify user access where authorized.
* Disable users.
* Manage branches.
* Manage services/departments.
* View feedback.
* Access analytics.
* Access AI-generated insights.
* Perform authorized data-management operations.

The administrator should not necessarily be the only person who can perform every operation.

The system should use **least privilege**.

---

# 8. Patient Feedback Experience

## 8.1 Entry Screen

The patient-facing application should initially present a simple feedback interface.

The first required input should be:

```text
Phone Number
```

The patient should then select their branch.

---

## 8.2 Branch Selection

The system currently operates approximately **13 branches**.

The patient should be able to select the branch they visited.

Example:

```text
Select your branch

○ Branch A
○ Branch B
○ Branch C
...
○ Branch M
```

The exact branch names should be configurable by authorized administrators rather than hard-coded.

---

# 9. Service / Department Selection

After selecting a branch, the patient selects the service or department they interacted with.

Example:

```text
Select service

○ Service A
○ Service B
○ Service C
○ Service D
```

Services should be configurable.

The system should support relationships such as:

```text
Branch
   ↓
Available Services
```

If services differ between branches, the patient should only see services applicable to the selected branch.

---

# 10. Structured Feedback

The patient should be able to provide predefined feedback.

Possible values include concepts such as:

* Very satisfied
* Satisfied
* Mostly satisfied
* Good
* Neutral
* Not satisfied
* Poor
* Very poor

The exact final feedback scale should be standardized before implementation.

The system should not allow every page or frontend component to invent its own rating values.

A centralized feedback/rating definition should be used.

---

# 11. Free-Text Feedback

Patients should also be able to express feedback in their own words.

Example:

```text
Tell us more about your experience.

[__________________________________]

[ Submit Feedback ]
```

Free-text feedback is important because structured ratings alone cannot explain **why** a patient was satisfied or dissatisfied.

The system should therefore preserve the original text.

---

# 12. Feedback Submission

A valid feedback submission should contain the required contextual information.

Conceptually:

```text
Feedback
├── Patient phone number
├── Branch
├── Service
├── Structured feedback
├── Optional free-text feedback
└── Timestamp
```

The backend must validate all submitted data.

The frontend must never be trusted as the source of authorization or data validity.

---

# 13. Feedback Confirmation

After successful submission, the patient should receive a clear confirmation.

Example:

```text
Thank you!

Your feedback has been submitted successfully.
```

The system should prevent accidental duplicate submissions caused by repeated clicks or network retries where technically feasible.

---

# 14. Administrative Dashboard

The dashboard is the main management interface.

It should provide both:

1. High-level overview.
2. Detailed drill-down.

---

# 15. Dashboard Overview

The dashboard should provide key performance indicators.

Example:

```text
Total Feedback
1,284

Satisfied
78%

Not Satisfied
14%

Neutral / Other
8%

Feedback Today
84
```

The exact KPI set should be finalized during UX and analytics design.

---

# 16. Dashboard Filters

The dashboard should support filtering.

At minimum:

### Branch

```text
All Branches
Branch A
Branch B
...
```

### Service / Department

```text
All Services
Service A
Service B
...
```

### Date

```text
Today
Yesterday
This Week
This Month
This Year
Custom Range
```

Filters should work together.

Example:

```text
Branch: Branch A
Service: Laboratory
Date: This Month
```

The resulting analytics should represent only that subset.

---

# 17. Time Analytics

The dashboard should support temporal analysis.

### Today

Show feedback collected from the beginning of the current day until the current time.

### Yesterday

Show the complete previous calendar day.

### This Week

Show the current calendar week according to the application's configured timezone and week definition.

### This Month

Show the current calendar month.

### This Year

Show the current calendar year.

### Custom Date Range

Allow an authorized dashboard user to specify:

```text
Start Date
End Date
```

The backend must calculate date boundaries consistently.

---

# 18. Analytics

The platform should provide detailed analytics rather than only raw feedback lists.

Potential analytics include:

## 18.1 Feedback volume

```text
Feedback count over time
```

Example:

```text
Mon ███████
Tue ███████████
Wed █████
Thu █████████████
Fri ████████
```

---

## 18.2 Satisfaction distribution

Example:

```text
Very Satisfied     42%
Satisfied          31%
Mostly Satisfied    9%
Neutral             6%
Not Satisfied       8%
Poor                4%
```

---

## 18.3 Branch comparison

The system should allow management to compare branches.

Example:

| Branch   | Feedback | Satisfaction |
| -------- | -------: | -----------: |
| Branch A |      240 |          91% |
| Branch B |      198 |          84% |
| Branch C |      310 |          72% |

The actual metric definitions must be standardized in the analytics specification.

---

## 18.4 Service comparison

Management should be able to determine which services/departments are performing well and which require attention.

Example:

```text
Service Performance

Laboratory       ████████████████  92%
Reception        ██████████████    84%
Pharmacy         ███████████       71%
Billing          ████████          58%
```

---

## 18.5 Trend analysis

The dashboard should identify changes over time.

For example:

```text
Satisfaction

Jan  ███████████
Feb  ████████████
Mar  █████████████
Apr  ██████████
May  █████████
Jun  ████████████
```

This helps management identify improvement or deterioration.

---

# 19. Feedback Detail

Authorized dashboard users should be able to inspect individual feedback records according to their permissions.

A feedback detail view may include:

```text
Branch
Service
Phone Number
Structured Feedback
Written Feedback
Submitted At
```

Sensitive information should only be exposed to users who have permission to view it.

---

# 20. AI-Powered Analytics

AI should augment traditional analytics.

It should not replace deterministic metrics.

## 20.1 Traditional analytics

Traditional analytics should calculate facts such as:

* Number of feedback submissions.
* Satisfaction percentage.
* Feedback volume.
* Branch rankings.
* Service rankings.
* Trends.

These calculations should be deterministic.

---

## 20.2 AI analytics

AI can analyze unstructured feedback.

Potential capabilities:

### Sentiment analysis

Classify written feedback into:

```text
Positive
Neutral
Negative
```

---

### Topic detection

Identify recurring themes:

```text
Waiting Time
Staff Behavior
Cleanliness
Service Quality
Pricing
Communication
Facilities
```

---

### Summarization

Example:

> "Patients generally appreciate the laboratory staff, but several recent complaints mention long waiting times during morning hours."

---

### Problem detection

The AI may identify recurring negative themes that deserve attention.

---

### Positive insight detection

The AI can identify frequently praised services or branches.

---

## 20.3 AI limitations

AI output must be clearly identified as AI-generated.

The system must not present an AI interpretation as an objective fact.

Example:

```text
AI Insight

Based on recent written feedback, patients appear to
be increasingly concerned about waiting times.

Confidence: ...
```

The original feedback should remain accessible for verification.

---

# 21. Data Management

Authorized users should be able to manage clinic configuration.

## 21.1 Branch management

Authorized users may:

* Add branch.
* View branch.
* Update branch.
* Deactivate branch.
* Delete branch if permitted.

Branches should preferably be **soft-deactivated** rather than physically deleted when historical feedback depends on them.

---

## 21.2 Service management

Authorized users may:

* Add service.
* Update service.
* Associate service with branches.
* Deactivate service.
* Delete service if permitted.

Historical feedback should remain understandable even if a service is later deactivated.

---

# 22. User Management

Only authorized administrators should manage dashboard users.

The administrator should be able to:

* Create user.
* Assign role.
* Disable user.
* Update user information.
* Change role where authorized.
* Revoke access.

The system should never allow an ordinary dashboard user to elevate their own privileges.

---

# 23. Permissions

Permissions should be explicit.

Conceptual permissions include:

```text
feedback.read
feedback.update
feedback.delete

branch.read
branch.create
branch.update
branch.delete

service.read
service.create
service.update
service.delete

analytics.read
analytics.ai

user.read
user.create
user.update
user.disable
```

The exact permission list will be finalized in `security.md` and `API.md`.

---

# 24. Auditability

Administrative operations should be auditable.

Important actions should produce an audit record.

Examples:

```text
Admin created branch
Admin updated service
Manager deleted feedback
Admin created dashboard user
Admin changed user role
```

Audit records should contain enough information to answer:

```text
Who?
What?
When?
What resource?
What action?
```

The audit system will be specified in greater detail in `database.md` and `security.md`.

---

# 25. Business Rules

## BR-001 — Phone number is required

A patient must provide a phone number before submitting feedback.

---

## BR-002 — Branch is required

Every feedback record must belong to a branch.

---

## BR-003 — Service is required

Every feedback record must identify the relevant service/department.

---

## BR-004 — Structured feedback must be standardized

The system must use a predefined set of structured feedback values.

---

## BR-005 — Free-text feedback is optional

Patients may submit structured feedback without writing additional text, depending on the final UX decision.

---

## BR-006 — Patient accounts are not required

Patients should not need authentication accounts for the basic feedback flow.

---

## BR-007 — Dashboard requires authentication

Administrative dashboard functionality must require authenticated access.

---

## BR-008 — Authorization is server-side

Frontend UI restrictions must never be considered sufficient authorization.

Every protected backend operation must enforce permissions.

---

## BR-009 — Admin controls dashboard access

Only authorized administrators can create/register dashboard users.

---

## BR-010 — Historical data must remain analyzable

Deactivating a branch or service must not unnecessarily destroy historical feedback data.

---

## BR-011 — AI does not replace source data

AI-generated analysis must not overwrite the original patient feedback.

---

## BR-012 — Analytics must use consistent definitions

Metrics such as satisfaction rate, feedback count, and trends must have documented definitions and produce consistent results across the application.

---

# 26. Functional Requirements

## Patient Requirements

### FR-P001

The patient can enter a phone number.

### FR-P002

The patient can select a branch.

### FR-P003

The patient can select a service/department.

### FR-P004

The patient can choose structured feedback.

### FR-P005

The patient can enter free-text feedback.

### FR-P006

The patient can submit feedback.

### FR-P007

The patient receives submission confirmation.

---

## Dashboard Requirements

### FR-D001

Authorized users can authenticate.

### FR-D002

Authorized users can access the dashboard according to their permissions.

### FR-D003

Users can view total feedback.

### FR-D004

Users can view satisfaction metrics.

### FR-D005

Users can filter by branch.

### FR-D006

Users can filter by service.

### FR-D007

Users can filter by date.

### FR-D008

Users can view daily analytics.

### FR-D009

Users can view weekly analytics.

### FR-D010

Users can view monthly analytics.

### FR-D011

Users can view yearly analytics.

### FR-D012

Users can specify a custom date range.

### FR-D013

Users can compare branch performance.

### FR-D014

Users can compare service performance.

### FR-D015

Users can view feedback trends.

### FR-D016

Users can inspect individual feedback where permitted.

### FR-D017

Users can access AI-generated insights where permitted.

---

## Administration Requirements

### FR-A001

An administrator can create dashboard users.

### FR-A002

An administrator can assign roles.

### FR-A003

Authorized users can manage branches.

### FR-A004

Authorized users can manage services.

### FR-A005

Authorized users can update feedback where permitted.

### FR-A006

Authorized users can delete feedback where permitted.

### FR-A007

Administrative actions are auditable.

---

# 27. Non-Functional Requirements

## NFR-001 — Performance

Patient feedback submission should be fast and responsive.

The patient should not have to wait unnecessarily for analytics or AI processing.

---

## NFR-002 — Mobile-first

The patient-facing interface must be designed primarily for mobile devices.

---

## NFR-003 — Accessibility

The platform should follow modern accessibility practices.

Target:

**WCAG 2.2 AA** where reasonably applicable.

---

## NFR-004 — Security

The platform must implement strong authentication, authorization, validation, and data protection.

Security requirements will be formally defined in `security.md`.

---

## NFR-005 — Reliability

A temporary analytics/AI failure should not prevent basic feedback collection unless the core data system itself is unavailable.

---

## NFR-006 — Observability

The backend should provide structured logs and enough telemetry to diagnose:

* API errors.
* Authentication failures.
* Database failures.
* Feedback submission failures.
* AI processing failures.
* Administrative operations.

---

## NFR-007 — Maintainability

The system should use clear architectural boundaries and modular code.

Business logic should not be tightly coupled to UI components.

---

## NFR-008 — Type Safety

The codebase should use strong TypeScript typing across frontend and backend where applicable.

---

## NFR-009 — Validation

All externally supplied data must be validated at the backend boundary.

---

## NFR-010 — Privacy

Patient phone numbers and feedback must be treated as sensitive application data.

The platform should collect only information required for the product's legitimate functionality.

---

# 28. High-Level User Journeys

## Patient Journey

```text
Patient
  │
  ▼
Feedback Platform
  │
  ├── Enter phone number
  │
  ├── Select branch
  │
  ├── Select service
  │
  ├── Select feedback
  │
  ├── Optional written feedback
  │
  ▼
Submit
  │
  ▼
Backend validation
  │
  ▼
Store feedback
  │
  ▼
Confirmation
```

---

## Management Journey

```text
Admin User
    │
    ▼
Login
    │
    ▼
Dashboard
    │
    ├── Overview
    ├── Branch Analytics
    ├── Service Analytics
    ├── Feedback
    ├── AI Insights
    └── Administration
```

---

# 29. Analytics Journey

```text
Dashboard User
       │
       ▼
Select Filters
       │
       ├── Branch
       ├── Service
       └── Date Range
       │
       ▼
Analytics Engine
       │
       ├── Aggregations
       ├── Trends
       ├── Comparisons
       └── Statistics
       │
       ▼
Dashboard Visualizations
       │
       ▼
Optional AI Analysis
```

---

# 30. Success Criteria

The V1 system should be considered successful when:

### Patient experience

* A patient can submit feedback quickly from a mobile device.
* The feedback flow is understandable without staff assistance.
* Feedback can be submitted using structured or written feedback.

### Management

* Management can see feedback across all branches.
* Management can identify poor-performing branches/services.
* Management can analyze current and historical periods.
* Management can inspect individual feedback where permitted.
* Management can obtain useful AI-assisted insights.

### Administration

* Administrators can manage dashboard users.
* Authorized users can manage branches and services.
* Permissions prevent unauthorized administrative operations.
* Important administrative operations are auditable.

### Engineering

* The system has clear frontend/backend boundaries.
* APIs are documented.
* Database schema is documented.
* Security requirements are documented.
* GitHub development workflow is documented.
* Automated testing and CI can verify critical functionality.

---

# 31. Acceptance Criteria

## Feedback Submission

A patient should be able to:

```text
Enter phone
→ Select branch
→ Select service
→ Select structured feedback
→ Optionally enter written feedback
→ Submit successfully
```

The resulting record must be persisted.

---

## Analytics

An authorized dashboard user should be able to:

```text
Open dashboard
→ Select branch
→ Select service
→ Select time period
→ View corresponding analytics
```

Changing filters must update the displayed metrics.

---

## User Access

An unauthorized user must not be able to access protected dashboard functionality.

An authorized administrator must be able to create a dashboard user.

---

## Role Permissions

A user without the required permission must not be able to perform protected administrative operations, even if they manually call the API.

---

## Data Integrity

Deleting/deactivating a branch or service must not unintentionally corrupt historical feedback analytics.

---

# 32. Product Principles

The following principles should guide implementation.

## Principle 1 — Patient simplicity

The patient experience should be extremely simple.

> Collect feedback, don't make patients navigate an enterprise application.

---

## Principle 2 — Data before AI

Deterministic analytics must be correct before AI features are introduced.

AI should enhance the data rather than compensate for poor data architecture.

---

## Principle 3 — Least privilege

Every administrative user should have only the permissions necessary for their responsibilities.

---

## Principle 4 — Source of truth

Original feedback and authoritative database records remain the source of truth.

Derived analytics and AI interpretations must be traceable back to the underlying data.

---

## Principle 5 — Configurable clinic structure

Branches and services should be managed as data rather than hard-coded application logic.

---

## Principle 6 — Backend-enforced security

The backend is responsible for enforcing authorization.

Frontend controls are for user experience, not security.

---

## Principle 7 — Historical integrity

Historical feedback should remain meaningful even when the clinic changes its branch/service structure.

---

## Principle 8 — Build for the actual clinic

The initial system should be designed around the clinic's real operational needs rather than unnecessary enterprise complexity.

---

# 33. Open Decisions

The following decisions should be resolved before or during implementation:

1. Exact names of the 13 branches.
2. Exact list of services/departments.
3. Whether a service can belong to multiple branches.
4. Final structured feedback/rating scale.
5. Whether phone numbers must be verified.
6. Duplicate-feedback policy.
7. Exact administrative roles — **resolved**: a fixed set of `Admin`, `Manager`, and `Analyst` defined in `security.md` §2.
8. Exact permission matrix — **resolved**: defined consistently in `PRD.md` §23, `API.md` §8, `database.md` §5, and `security.md` §3.
9. Whether feedback can be edited after submission.
10. Whether deleted feedback is physically deleted or soft-deleted.
11. Exact analytics metric definitions.
12. Exact AI provider/model.
13. AI processing strategy and cost controls.
14. Whether dashboard users use email/password, SSO, or another authentication mechanism.
15. Data retention requirements.
16. Export/reporting requirements if required by clinic management.
17. Notification/alert requirements if required by management.

These decisions should be captured in the appropriate technical documents rather than scattered throughout implementation.

---

# 34. Document Relationships

This PRD is the **product-level source of truth**.

Other documents should derive their requirements from this document.

```text
                    PRD.md
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
Architecture.md    API.md      database.md
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                 security.md
                      │
                      ▼
                  workflow.md
```

### PRD.md

Defines:

> What are we building and why?

### Architecture.md

Defines:

> How is the system structured?

### API.md

Defines:

> How do system components communicate?

### database.md

Defines:

> How is application data modeled and stored?

### security.md

Defines:

> How do we protect the system and its data?

### workflow.md

Defines:

> How does our team safely build, review, test, and deploy it?

---

# 35. AI Agent Instructions

Any AI coding agent working on this repository should treat these documents as project-level specifications.

Before implementing a feature, the agent should:

1. Read `PRD.md`.
2. Read the relevant technical specification.
3. Identify existing architecture before modifying it.
4. Avoid introducing functionality that contradicts the PRD.
5. Avoid inventing business rules when a documented rule exists.
6. Ask for clarification when an implementation decision materially changes product behavior.
7. Preserve existing data integrity.
8. Implement authorization on the backend.
9. Add appropriate tests for new behavior.
10. Update documentation when implementation changes an established contract.

The agent should treat the documents as **living specifications**, not disposable notes.

---

# 36. Definition of V1

V1 is complete when the system provides:

```text
                    ┌──────────────────┐
                    │     PATIENT      │
                    └────────┬─────────┘
                             │
                             ▼
                    Phone Number
                             │
                             ▼
                         Branch
                             │
                             ▼
                     Service/Department
                             │
                             ▼
                  Structured / Free Text
                             │
                             ▼
                    Feedback Submission
                             │
                             ▼
                    ┌──────────────────┐
                    │    DATABASE      │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
        Aggregations      Feedback        AI Analysis
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                    ┌──────────────────┐
                    │    DASHBOARD     │
                    └──────────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
             Branch       Service       Time
             Analytics    Analytics     Analytics
```

The core V1 product therefore consists of four major capabilities:

**1. Patient Feedback Collection**

**2. Centralized Feedback Management**

**3. Management Analytics Dashboard**

**4. AI-Assisted Feedback Insights**

All of these capabilities must operate under the platform's authentication, authorization, security, and audit requirements.
