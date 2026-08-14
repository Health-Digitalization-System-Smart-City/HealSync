# DESIGN.md

# Healthcare Patient Feedback Platform — Design System

**Version:** 1.0  
**Platform:** Progressive Web App (PWA)  
**Design Strategy:** Mobile-first, responsive, accessible, task-focused  
**Primary Experience:** Patient feedback submission  
**Secondary Experience:** Staff and administrator management

---

# 1. Design Philosophy

The product should feel:

- Simple
- Trustworthy
- Professional
- Calm
- Accessible
- Fast
- Human
- Healthcare-oriented

The interface should avoid looking like a complicated hospital management system.

The patient should be able to:

> **Scan → Understand → Answer → Submit**

with minimal cognitive effort.

Administrators should be able to:

> **Monitor → Investigate → Act → Measure**

---

# 2. Design Principles

## 2.1 Mobile First

Design for the smallest practical screen first.

Primary target:

```text
360px – 430px
```

Then progressively support:

```text
Tablet
768px+
```

```text
Desktop
1024px+
```

```text
Large desktop
1440px+
```

Do not design desktop first and simply shrink it for mobile.

---

## 2.2 Patient First

The patient-facing experience receives the highest priority.

The patient should never need to understand:

- Facility IDs
- Database concepts
- Feedback workflows
- Complaint statuses
- Administrative terminology

The interface should use simple language.

Instead of:

> "Select feedback classification"

Use:

> **What would you like to tell us about?**

---

## 2.3 Progressive Disclosure

Do not display everything at once.

Show only what the user needs at the current step.

Example:

```text
Step 1
How was your experience?

        ⭐⭐⭐⭐⭐

        Continue
```

Then:

```text
Step 2
What would you like to tell us?

[Complaint]
[Suggestion]
[Compliment]
```

Then:

```text
Step 3
Tell us more

[_____________________]

Submit
```

---

## 2.4 Accessibility

The application must be usable by people with different abilities.

Requirements:

- High color contrast
- Large touch targets
- Clear focus states
- Keyboard navigation
- Screen-reader-friendly labels
- No color-only communication
- Clear validation messages
- Accessible form controls
- Respect reduced-motion preferences

Minimum interactive target:

```text
44px × 44px
```

Preferred:

```text
48px × 48px
```

---

# 3. Visual Identity

The visual identity should communicate:

> Trust + Healthcare + Technology

Avoid excessive gradients, overly decorative illustrations, or highly saturated colors.

The interface should feel modern without becoming visually distracting.

---

# 4. Color System

Use a calm healthcare-oriented palette.

## Primary

```text
Primary: #0F766E
```

Use for:

- Primary buttons
- Active navigation
- Important links
- Selected states
- Progress indicators

---

## Primary Dark

```text
Primary Dark: #115E59
```

Use for:

- Hover states
- Dark emphasis
- Headings where appropriate

---

## Primary Light

```text
Primary Light: #CCFBF1
```

Use for:

- Soft backgrounds
- Selected cards
- Informational areas

---

## Background

```text
Background: #F8FAFC
```

---

## Surface

```text
Surface: #FFFFFF
```

---

## Text

```text
Text Primary: #0F172A
Text Secondary: #475569
Text Muted: #64748B
```

---

## Border

```text
Border: #E2E8F0
```

---

## Semantic Colors

### Success

```text
#15803D
```

### Warning

```text
#B45309
```

### Error

```text
#B91C1C
```

### Info

```text
#0369A1
```

Semantic colors should always be paired with:

- Icons
- Labels
- Text

Never communicate status through color alone.

---

# 5. Typography

Use **Inter** as the primary interface font.

Fallback:

```text
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

For future multilingual support, use a font stack that provides appropriate coverage for Amharic and other supported languages.

---

## Typography Scale

### Display

```text
32px
Line height: 40px
Weight: 700
```

Use sparingly.

### H1

```text
28px
Line height: 36px
Weight: 700
```

### H2

```text
24px
Line height: 32px
Weight: 700
```

### H3

```text
20px
Line height: 28px
Weight: 600
```

### Body Large

```text
18px
Line height: 28px
Weight: 400
```

Use for important patient-facing questions.

### Body

```text
16px
Line height: 24px
```

### Body Small

```text
14px
Line height: 20px
```

### Caption

```text
12px
Line height: 16px
```

Do not use caption text for essential information.

---

# 6. Spacing System

Use a consistent 4px base scale.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
```

Primary mobile screen padding:

```text
16px
```

Tablet:

```text
24px
```

Desktop:

```text
32px
```

---

# 7. Border Radius

Use moderate rounding.

```text
Small: 6px
Medium: 10px
Large: 14px
XL: 20px
Full: 9999px
```

Recommended:

```text
Cards: 14px
Buttons: 10px
Inputs: 10px
Badges: 9999px
```

Avoid excessive pill-shaped UI.

---

# 8. Shadows

Keep shadows subtle.

Default card:

```text
0 1px 3px rgba(...)
```

Elevated:

```text
0 4px 12px rgba(...)
```

Use borders more often than heavy shadows.

---

# 9. Layout

## Mobile

```text
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│                              │
│ Content                      │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ Primary action               │
└──────────────────────────────┘
```

Screen padding:

```text
16px
```

---

## Tablet

Use:

```text
max-width: 720px
```

for patient forms.

This prevents long lines and keeps forms comfortable.

---

## Desktop

Patient forms should still remain constrained:

```text
max-width: 640px
```

Admin pages can use wider layouts:

```text
max-width: 1280px
```

---

# 10. Patient Experience

The patient interface is the most important part of the application.

## 10.1 Patient Entry

When a patient scans a QR code:

```text
┌──────────────────────────────┐
│                              │
│           LOGO               │
│                              │
│      Adama Health Center     │
│                              │
│   We value your feedback.    │
│                              │
│ Your experience helps us     │
│ improve our services.        │
│                              │
│      [ Give Feedback ]       │
│                              │
│          ~1 minute           │
│                              │
└──────────────────────────────┘
```

Do not require login.

---

# 11. Feedback Flow

The preferred patient flow is:

```text
Facility
   ↓
Welcome
   ↓
Overall Rating
   ↓
Feedback Type
   ↓
Category / Questions
   ↓
Comment
   ↓
Optional Contact
   ↓
Review
   ↓
Submit
   ↓
Confirmation
```

The system may skip unnecessary steps depending on facility configuration.

---

# 12. Rating Component

Use large, touch-friendly rating controls.

Example:

```text
How was your overall experience?

☆  ☆  ☆  ☆  ☆
```

After selection:

```text
★  ★  ★  ★  ☆

Very Good
```

The rating must not rely only on color.

Provide accessible labels:

```text
1 — Very Poor
2 — Poor
3 — Average
4 — Good
5 — Excellent
```

---

# 13. Feedback Type

Use large selectable cards.

```text
┌─────────────────────────────┐
│ ⚠ Complaint                 │
│ Tell us what went wrong     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💡 Suggestion               │
│ Tell us how we can improve  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 👍 Compliment               │
│ Tell us what went well      │
└─────────────────────────────┘
```

Cards should have:

- Icon
- Title
- Short description
- Selected state

---

# 14. Form Design

Use one-column forms on mobile.

```text
Label

[ Input                         ]

Supporting text
```

Never use unnecessarily dense forms.

---

## Required fields

Mark required fields clearly.

Example:

```text
What happened? *
```

Do not rely only on an asterisk.

---

# 15. Optional Contact Information

Explain why the information is requested.

```text
Would you like us to contact you?

Your contact information is optional.

○ Yes
○ No
```

If yes:

```text
Phone number

[ +251 __________ ]

Email

[ __________________ ]
```

Never make contact information mandatory for anonymous feedback unless the organization's policy explicitly requires it.

---

# 16. Progress Indicator

For multi-step forms:

```text
● ━━━ ○ ━━━ ○
Step 1 of 3
```

Keep it simple.

Do not use a complicated wizard.

The user should always understand:

- Where they are
- How much remains
- What happens next

---

# 17. Navigation

## Patient

Avoid traditional navigation.

The patient experience should focus on:

```text
Back
Continue
Submit
```

No sidebar.

No hamburger menu unless absolutely necessary.

---

## Admin

Use responsive navigation.

### Mobile

Bottom navigation:

```text
┌──────────────────────────────┐
│                              │
│       Page content           │
│                              │
├──────────────────────────────┤
│ Home │ Feedback │ Reports │ More │
└──────────────────────────────┘
```

### Desktop

Sidebar:

```text
┌────────────────┬─────────────────────────┐
│ Logo           │                         │
│                │ Dashboard               │
│ Dashboard      │                         │
│ Feedback       │                         │
│ Complaints     │                         │
│ Facilities     │                         │
│ Reports        │                         │
│ Users          │                         │
│ Settings       │                         │
│                │                         │
└────────────────┴─────────────────────────┘
```

---

# 18. Admin Dashboard

The dashboard should prioritize actionable information.

Mobile:

```text
┌──────────────────────────────┐
│ Dashboard                    │
│ Good morning, Admin          │
├──────────────────────────────┤
│                              │
│  Feedback                    │
│  1,248                       │
│                              │
├──────────────────────────────┤
│  Avg Rating                  │
│  ★ 4.3                       │
│                              │
├──────────────────────────────┤
│  Open Complaints             │
│  17                          │
│                              │
├──────────────────────────────┤
│  Resolution Rate             │
│  79%                         │
└──────────────────────────────┘
```

Desktop can display these as four cards in one row.

---

# 19. Dashboard Cards

Cards should communicate one metric clearly.

Structure:

```text
┌──────────────────────────┐
│ Total Feedback       ⋮   │
│                          │
│ 1,248                    │
│                          │
│ ↑ 12.4% this month       │
└──────────────────────────┘
```

Do not overload cards with multiple unrelated numbers.

---

# 20. Feedback List

Mobile:

```text
┌──────────────────────────────┐
│ Complaint                    │
│ Hospital A                   │
│ ⭐⭐                          │
│ Waiting Time                 │
│                              │
│ "I waited for..."            │
│                              │
│ HIGH • IN PROGRESS           │
│ Aug 8, 2026                  │
└──────────────────────────────┘
```

Desktop may use a table.

### Mobile rule

Do not force large desktop tables onto mobile.

Use cards instead.

---

# 21. Feedback Details

```text
Feedback #FB-1024

Complaint
⭐⭐

Hospital A
Emergency Department

Category
Waiting Time

Description
"I waited more than two hours..."

Status
IN PROGRESS

Priority
HIGH

Assigned to
Facility Manager
```

Actions:

```text
[Assign]
[Change Status]
[Add Note]
```

---

# 22. Complaint Status UI

Use badges with both text and visual indicators.

```text
● Submitted
● Under Review
● Assigned
● In Progress
● Resolved
● Closed
```

Do not communicate status using color alone.

---

# 23. Priority UI

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Critical items should have a clear visual warning but should not create excessive visual noise.

---

# 24. Analytics

Charts must remain understandable on mobile.

Preferred mobile chart:

```text
Feedback Trend

│
│      ╭─╮
│   ╭──╯ ╰─╮
│───╯      ╰──
└────────────────
```

Users should be able to:

- Change date range
- Filter facility
- Filter category
- View exact values

On mobile, horizontal scrolling is acceptable for complex charts, but avoid it whenever possible.

---

# 25. Facility Management

Facility card:

```text
┌──────────────────────────────┐
│ Adama Health Center          │
│ Clinic                       │
│                              │
│ Feedback     1,245           │
│ Rating       ⭐ 4.3          │
│ Open Issues  17              │
│                              │
│ [View] [Configure]           │
└──────────────────────────────┘
```

Facility type should always be visible.

---

# 26. Configuration UI

Configuration should be organized into sections.

```text
Facility Settings

├── General
├── Feedback Form
├── Categories
├── Questions
├── Departments
├── Workflow
├── Notifications
└── QR Codes
```

Avoid one giant settings page.

---

# 27. Question Builder

The administrator should see:

```text
Questions

┌──────────────────────────────┐
│ How satisfied were you?     │
│ Rating • Required            │
│                              │
│ ☰       ✏      ●            │
└──────────────────────────────┘

┌──────────────────────────────┐
│ What can we improve?        │
│ Long Text • Optional         │
│                              │
│ ☰       ✏      ●            │
└──────────────────────────────┘

[ + Add Question ]
```

The drag handle allows reordering.

---

# 28. Empty States

Every list needs a useful empty state.

Bad:

> No data.

Good:

```text
No feedback yet

Feedback submitted by patients
will appear here.

[View QR Code]
```

Empty states should explain:

1. What happened
2. Why the screen is empty
3. What the user can do next

---

# 29. Loading States

Use skeleton loading for dashboards and lists.

Example:

```text
┌──────────────────────────────┐
│ █████████████               │
│                              │
│ ███████                     │
│ ███████████████             │
└──────────────────────────────┘
```

Avoid displaying a blank screen while loading.

---

# 30. Error States

Errors should be human-readable.

Instead of:

```text
Error 500
```

show:

```text
Something went wrong

We couldn't load the feedback.
Please try again.

[Try Again]
```

---

# 31. Form Validation

Validation should happen close to the affected field.

Example:

```text
Phone number

[ 091234 ]

⚠ Please enter a valid phone number.
```

Do not wait until the entire form is submitted before explaining every error.

---

# 32. Success State

After feedback submission:

```text
┌──────────────────────────────┐
│                              │
│            ✓                 │
│                              │
│     Thank you!               │
│                              │
│ Your feedback has been       │
│ successfully submitted.      │
│                              │
│ Reference: FB-1024           │
│                              │
│ Your feedback helps us       │
│ improve our services.        │
│                              │
│        [Done]                │
└──────────────────────────────┘
```

Do not redirect immediately.

Give the user clear confirmation.

---

# 33. QR Code Screen

Administrators can access:

```text
Facility QR Code

┌────────────────────┐
│                    │
│       QR CODE      │
│                    │
└────────────────────┘

Adama Health Center

[Download PNG]
[Print QR]
[Regenerate]
```

The printable version should include:

```text
Your Feedback Matters

Scan the QR code
to share your experience.

[QR CODE]
```

---

# 34. Buttons

## Primary

Used for the main action.

```text
[ Submit Feedback ]
```

## Secondary

```text
[ Cancel ]
```

## Destructive

Use only for destructive actions.

```text
[ Delete ]
```

Destructive actions should require confirmation when appropriate.

---

# 35. Mobile Button Rules

Primary actions should generally be full-width on patient forms.

```text
┌──────────────────────────────┐
│       Continue               │
└──────────────────────────────┘
```

Minimum height:

```text
48px
```

For critical patient actions, use a clear visual hierarchy.

---

# 36. Icons

Use one consistent icon library.

Recommended:

```text
Lucide Icons
```

Icons should support text, not replace it when meaning is important.

Good:

```text
✏ Edit
```

Avoid:

```text
✏
```

for actions that aren't universally obvious.

---

# 37. Toasts

Use toast notifications for lightweight actions.

Example:

```text
✓ Feedback assigned successfully
```

Do not use toasts for important information that the user must act upon.

---

# 38. Dialogs

Use dialogs for:

- Confirmation
- Short forms
- Important warnings

Avoid putting long forms inside dialogs on mobile.

For complex workflows, use a dedicated page.

---

# 39. Bottom Sheets

On mobile, bottom sheets can be used for:

- Filters
- Sorting
- Quick actions
- Short selections

Example:

```text
┌──────────────────────────────┐
│ Filters                      │
├──────────────────────────────┤
│ Facility                     │
│ [ All Facilities ]           │
│                              │
│ Status                       │
│ [ All ]                      │
│                              │
│ Category                     │
│ [ All ]                      │
│                              │
│ [ Apply Filters ]            │
└──────────────────────────────┘
```

---

# 40. Responsive Breakpoints

Use simple breakpoints.

```text
Mobile:
< 640px

Tablet:
640px – 1023px

Desktop:
1024px – 1279px

Large:
1280px+
```

Do not create many unnecessary breakpoints.

---

# 41. Responsive Behavior

## Mobile

- Single-column layouts
- Bottom navigation for admin
- Cards instead of tables
- Full-width primary actions
- Bottom-sheet filters
- Compact charts

## Tablet

- Two-column layouts where appropriate
- Larger dashboard cards
- More visible navigation

## Desktop

- Sidebar navigation
- Multi-column dashboard
- Data tables
- Advanced filtering
- Larger charts

---

# 42. PWA Requirements

The application must behave like a reliable mobile application.

Required:

- Installable
- Responsive
- Web App Manifest
- App icons
- Splash/loading experience
- HTTPS
- Service worker
- Offline-aware behavior

---

# 43. Offline Strategy

The patient feedback flow should be designed to handle unstable connections gracefully.

If possible:

```text
Form
 ↓
Local temporary storage
 ↓
Connection restored
 ↓
Submit
```

However, offline feedback submission should only be implemented if the backend can safely prevent duplicate submissions.

For MVP:

> Prioritize reliable online submission and graceful retry before implementing full offline synchronization.

---

# 44. PWA Installation

The patient should not be forced to install the PWA.

The application should work immediately in the browser.

For staff/admin users, installation can be encouraged:

```text
Install the app

Get faster access to your dashboard
and notifications.

[Install]
[Not now]
```

---

# 45. Network Resilience

Healthcare environments may have unstable internet connections.

The UI should:

- Show connection errors clearly
- Preserve entered form data during temporary failures
- Allow retry
- Prevent accidental duplicate submission
- Show submission state

Example:

```text
Submitting...

Please don't close this page.
```

Then:

```text
✓ Submitted successfully
```

or:

```text
Connection lost

Your feedback has not been submitted.

[Try Again]
```

---

# 46. Accessibility Requirements

Target:

```text
WCAG 2.2 AA
```

Important requirements:

- Keyboard accessible
- Visible focus states
- Proper heading hierarchy
- Semantic HTML
- ARIA only where necessary
- Accessible labels
- Accessible error messages
- Sufficient contrast
- Touch targets ≥44px
- Screen reader compatibility

---

# 47. Internationalization

The architecture should support multiple languages even if version one launches in English.

Potential languages:

```text
English
Amharic
Afaan Oromo
```

Do not hardcode user-facing text throughout components.

Use translation keys:

```text
feedback.submit
feedback.rating.title
feedback.success.message
```

This makes future localization much easier.

---

# 48. Content Guidelines

Use simple language.

Prefer:

> Tell us about your experience.

Instead of:

> Please provide a comprehensive evaluation of the healthcare service you received.

Prefer:

> Your feedback helps us improve.

Instead of:

> Your participation contributes to organizational service-quality optimization.

---

# 49. Privacy Messaging

Patients should clearly understand optional data collection.

Example:

```text
Your feedback can be anonymous.

If you choose to provide your phone number
or email, we may use it to respond to you.
```

Keep privacy explanations short and understandable.

---

# 50. Design Tokens

Use centralized design tokens.

Example:

```css
:root {
  --color-primary: #0F766E;
  --color-primary-dark: #115E59;
  --color-primary-light: #CCFBF1;

  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;

  --color-text: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;

  --color-border: #E2E8F0;

  --color-success: #15803D;
  --color-warning: #B45309;
  --color-error: #B91C1C;
  --color-info: #0369A1;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

The exact implementation can change depending on whether Tailwind CSS, CSS Modules, or another styling system is used.

---

# 51. Component Library

Create reusable components rather than styling each page independently.

## Core

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Radio
Switch
Badge
Avatar
Divider
Tooltip
```

## Feedback

```text
Rating
FeedbackTypeCard
FeedbackCategory
Question
QuestionRenderer
FeedbackCard
FeedbackStatus
FeedbackPriority
```

## Navigation

```text
Sidebar
BottomNavigation
Header
Breadcrumb
Tabs
```

## Data

```text
DataTable
StatCard
ChartCard
FilterBar
Pagination
SearchInput
```

## Feedback Management

```text
FeedbackList
FeedbackDetails
StatusTimeline
AssignmentPanel
InternalNote
ResponsePanel
```

## Configuration

```text
QuestionBuilder
CategoryManager
WorkflowBuilder
FacilitySettings
```

---

# 52. Page Structure

## Patient

```text
/p/{facilityCode}
/p/{facilityCode}/feedback
/p/{facilityCode}/feedback/success
```

---

## Admin

```text
/login

/dashboard

/feedback
/feedback/:id

/complaints
/complaints/:id

/facilities
/facilities/:id

/facilities/:id/settings
/facilities/:id/questions
/facilities/:id/categories
/facilities/:id/workflow
/facilities/:id/qr

/reports
/analytics

/users
/audit-logs

/settings
```

Routes may change based on implementation.

---

# 53. Mobile Admin Priority

On mobile, prioritize:

```text
1. Dashboard
2. Feedback
3. Complaints
4. Notifications
5. Facilities
```

Less frequently used configuration should be placed under:

```text
More
   ↓
Settings
```

Do not expose every administrative function in the bottom navigation.

---

# 54. Dashboard Information Hierarchy

The order should be:

```text
1. Critical issues
2. Key metrics
3. Recent feedback
4. Trends
5. Detailed analytics
```

If there is a critical unresolved complaint, it should not be buried underneath charts.

---

# 55. Patient Information Architecture

Keep patient navigation shallow.

Ideal:

```text
Welcome
   ↓
Feedback
   ↓
Confirmation
```

Avoid:

```text
Home
 → Services
 → Feedback
 → Facility
 → Category
 → Form
 → Confirmation
```

The QR code already establishes the facility context.

---

# 56. Performance Design

The patient page should load quickly.

Priorities:

1. Small initial bundle
2. Optimized images
3. Lazy loading
4. Minimal JavaScript where possible
5. Server-side rendering where useful
6. Fast API responses
7. Avoid unnecessary third-party scripts

Do not load the entire admin application when a patient opens a feedback form.

---

# 57. Security UX

Never expose sensitive information in:

- URLs
- Notifications
- Browser titles
- Public feedback pages

For example, avoid:

```text
/feedback/patient/0912345678
```

Prefer opaque identifiers.

---

# 58. Design Quality Checklist

Before considering a page complete:

### Mobile

- [ ] Works at 360px width
- [ ] No horizontal scrolling
- [ ] Buttons are easy to tap
- [ ] Text is readable
- [ ] Forms are comfortable
- [ ] Keyboard doesn't hide important controls

### Accessibility

- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Inputs have labels
- [ ] Errors are accessible
- [ ] Color isn't the only status indicator
- [ ] Contrast is sufficient

### UX

- [ ] User knows what to do next
- [ ] Primary action is obvious
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Empty states exist
- [ ] Success states exist

### PWA

- [ ] Installable
- [ ] Manifest configured
- [ ] Icons configured
- [ ] HTTPS
- [ ] Service worker
- [ ] Network failure handled

---

# 59. Design Priorities

When making design decisions, follow this order:

```text
1. Patient usability
        ↓
2. Accessibility
        ↓
3. Clarity
        ↓
4. Performance
        ↓
5. Administrative efficiency
        ↓
6. Visual polish
```

A beautiful feedback form that patients find confusing is a failed design.

---

# 60. Final Design Direction

The product should feel like:

> **A modern, trustworthy healthcare service platform — not a complicated enterprise dashboard.**

### Patient side

```text
Simple
Fast
Friendly
Mobile-first
Minimal
Accessible
```

### Staff side

```text
Action-oriented
Clear
Efficient
Responsive
```

### Organization side

```text
Data-driven
Configurable
Professional
Scalable
```

The most important design decision is to maintain **two distinct experiences inside one PWA**:

```text
                    PWA
                     │
          ┌──────────┴──────────┐
          │                     │
      PATIENT                 ADMIN
          │                     │
    Mobile-first          Responsive
          │                     │
    Simple workflow       Information-rich
          │                     │
    QR → Feedback          Manage → Analyze
```

The patient interface should remain extremely simple even as the administrative system becomes powerful.