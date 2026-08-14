// HealSync Smart City Healthcare Dashboard Mock & Telemetry Store
// Matches PRD §1.2 (13 branches), §3 (Feedback flows), §5 (Roles & Staff), and Security rules.

export type ClinicBranch = {
  id: string;
  code: string;
  name: string;
  zone: string;
  address: string;
  director: string;
  phone: string;
  activeStaff: number;
  openHours: string;
  status: "optimal" | "high_volume" | "maintenance";
  satisfactionRating: number;
  totalFeedbackCount: number;
  resolutionRate: number;
};

export type MedicalService = {
  id: string;
  name: string;
  category: "Clinical" | "Diagnostic" | "Support" | "Specialty";
  description: string;
  headDoctor: string;
  averageWaitMinutes: number;
  satisfactionScore: number;
  monthlyPatients: number;
  activeStatus: boolean;
};

export type DashboardTask = {
  id: string;
  title: string;
  description: string;
  branchName: string;
  category: "Follow-up" | "Inspection" | "Equipment" | "Protocol" | "Staffing";
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  assignee: {
    name: string;
    role: string;
  };
  dueDate: string;
  createdAt: string;
};

export type PatientFeedback = {
  id: string;
  patientPhone: string; // Admin can view, masked for others
  branchName: string;
  serviceName: string;
  rating: number; // 1 to 5
  sentiment: "positive" | "neutral" | "negative";
  predefinedTags: string[];
  comment: string;
  submittedAt: string;
  status: "new" | "investigating" | "resolved";
  resolvedBy?: string;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "analyst";
  assignedBranch: string;
  status: "active" | "inactive";
  lastActive: string;
};

export const CLINIC_BRANCHES: ClinicBranch[] = [
  {
    id: "br-01",
    code: "HS-DT-01",
    name: "Downtown Central Hospital",
    zone: "Central District",
    address: "100 Medical Blvd, Central Metro",
    director: "Dr. Eleanor Vance",
    phone: "+1 (555) 019-2831",
    activeStaff: 48,
    openHours: "24/7 Emergency & Inpatient",
    status: "optimal",
    satisfactionRating: 4.8,
    totalFeedbackCount: 1420,
    resolutionRate: 97.4,
  },
  {
    id: "br-02",
    code: "HS-ND-02",
    name: "North District Health Center",
    zone: "North Suburbs",
    address: "450 Northridge Ave, Suite 100",
    director: "Dr. Marcus Thorne",
    phone: "+1 (555) 019-2832",
    activeStaff: 32,
    openHours: "07:00 AM - 10:00 PM",
    status: "optimal",
    satisfactionRating: 4.6,
    totalFeedbackCount: 980,
    resolutionRate: 95.1,
  },
  {
    id: "br-03",
    code: "HS-WS-03",
    name: "Westside Medical Clinic",
    zone: "West District",
    address: "882 Sunset Parkway",
    director: "Dr. Sophia Reyes",
    phone: "+1 (555) 019-2833",
    activeStaff: 28,
    openHours: "08:00 AM - 08:00 PM",
    status: "high_volume",
    satisfactionRating: 4.4,
    totalFeedbackCount: 840,
    resolutionRate: 91.8,
  },
  {
    id: "br-04",
    code: "HS-HB-04",
    name: "Harbor Bay Urgent Care",
    zone: "Harbor Quarter",
    address: "12 Marina Way, Pier 4",
    director: "Dr. Liam Gallagher",
    phone: "+1 (555) 019-2834",
    activeStaff: 24,
    openHours: "24/7 Urgent Care",
    status: "optimal",
    satisfactionRating: 4.7,
    totalFeedbackCount: 1120,
    resolutionRate: 96.0,
  },
  {
    id: "br-05",
    code: "HS-ME-05",
    name: "Metro East Polyclinic",
    zone: "East District",
    address: "310 Eastgate Boulevard",
    director: "Dr. Aisha Patel",
    phone: "+1 (555) 019-2835",
    activeStaff: 30,
    openHours: "08:00 AM - 09:00 PM",
    status: "optimal",
    satisfactionRating: 4.9,
    totalFeedbackCount: 1250,
    resolutionRate: 98.2,
  },
  {
    id: "br-06",
    code: "HS-SF-06",
    name: "Southside Family Care",
    zone: "South District",
    address: "712 Highland Avenue",
    director: "Dr. Lucas Romero",
    phone: "+1 (555) 019-2836",
    activeStaff: 22,
    openHours: "08:00 AM - 06:00 PM",
    status: "optimal",
    satisfactionRating: 4.5,
    totalFeedbackCount: 690,
    resolutionRate: 93.5,
  },
  {
    id: "br-07",
    code: "HS-UP-07",
    name: "Uptown Medical Pavilion",
    zone: "Uptown Core",
    address: "950 Park Crest Road",
    director: "Dr. Hannah Lindqvist",
    phone: "+1 (555) 019-2837",
    activeStaff: 36,
    openHours: "07:30 AM - 09:00 PM",
    status: "optimal",
    satisfactionRating: 4.9,
    totalFeedbackCount: 1530,
    resolutionRate: 98.8,
  },
  {
    id: "br-08",
    code: "HS-SH-08",
    name: "Silicon Heights Wellness",
    zone: "Tech Corridor",
    address: "400 Innovation Drive",
    director: "Dr. David Kim",
    phone: "+1 (555) 019-2838",
    activeStaff: 26,
    openHours: "08:00 AM - 07:00 PM",
    status: "optimal",
    satisfactionRating: 4.8,
    totalFeedbackCount: 890,
    resolutionRate: 96.5,
  },
  {
    id: "br-09",
    code: "HS-RF-09",
    name: "Riverfront Health Plaza",
    zone: "Riverside District",
    address: "210 Waterfront Promenade",
    director: "Dr. Chloe Martin",
    phone: "+1 (555) 019-2839",
    activeStaff: 20,
    openHours: "08:00 AM - 06:00 PM",
    status: "optimal",
    satisfactionRating: 4.6,
    totalFeedbackCount: 620,
    resolutionRate: 94.0,
  },
  {
    id: "br-10",
    code: "HS-GW-10",
    name: "Greenwood Community Clinic",
    zone: "Greenwood Valley",
    address: "550 Evergreen Trail",
    director: "Dr. Julian Hayes",
    phone: "+1 (555) 019-2840",
    activeStaff: 18,
    openHours: "08:30 AM - 05:30 PM",
    status: "optimal",
    satisfactionRating: 4.7,
    totalFeedbackCount: 510,
    resolutionRate: 95.8,
  },
  {
    id: "br-11",
    code: "HS-SHC-11",
    name: "Sunset Hills Health Center",
    zone: "Sunset District",
    address: "1030 Horizon Terrace",
    director: "Dr. Rachel Zheng",
    phone: "+1 (555) 019-2841",
    activeStaff: 22,
    openHours: "08:00 AM - 07:00 PM",
    status: "high_volume",
    satisfactionRating: 4.3,
    totalFeedbackCount: 780,
    resolutionRate: 89.2,
  },
  {
    id: "br-12",
    code: "HS-GC-12",
    name: "Grand Central Care Hub",
    zone: "Transit Hub",
    address: "50 Terminal Plaza",
    director: "Dr. Noah Bennett",
    phone: "+1 (555) 019-2842",
    activeStaff: 34,
    openHours: "24/7 Rapid Care",
    status: "optimal",
    satisfactionRating: 4.7,
    totalFeedbackCount: 1390,
    resolutionRate: 96.9,
  },
  {
    id: "br-13",
    code: "HS-LK-13",
    name: "Lakeside Medical Point",
    zone: "Lakeside Precinct",
    address: "88 Shoreline Drive",
    director: "Dr. Maya Jensen",
    phone: "+1 (555) 019-2843",
    activeStaff: 19,
    openHours: "08:00 AM - 06:00 PM",
    status: "optimal",
    satisfactionRating: 4.8,
    totalFeedbackCount: 470,
    resolutionRate: 97.0,
  },
];

export const MEDICAL_SERVICES: MedicalService[] = [
  {
    id: "srv-01",
    name: "General Medicine & Triage",
    category: "Clinical",
    description: "Primary consultations, preventive exams, initial triage, and general diagnosis.",
    headDoctor: "Dr. Arthur Campbell",
    averageWaitMinutes: 12,
    satisfactionScore: 4.7,
    monthlyPatients: 4200,
    activeStatus: true,
  },
  {
    id: "srv-02",
    name: "Cardiology & Vascular",
    category: "Specialty",
    description: "Comprehensive cardiac assessment, ECG, echocardiograms, and hypertension management.",
    headDoctor: "Dr. Sarah Jenkins",
    averageWaitMinutes: 18,
    satisfactionScore: 4.9,
    monthlyPatients: 1850,
    activeStatus: true,
  },
  {
    id: "srv-03",
    name: "Pediatrics & Child Care",
    category: "Specialty",
    description: "Well-child visits, childhood vaccinations, developmental screening, and acute pediatric care.",
    headDoctor: "Dr. Maya Sharma",
    averageWaitMinutes: 14,
    satisfactionScore: 4.8,
    monthlyPatients: 2400,
    activeStatus: true,
  },
  {
    id: "srv-04",
    name: "Orthopedics & Sports Medicine",
    category: "Specialty",
    description: "Bone health, joint treatment, fracture care, and rehabilitation therapies.",
    headDoctor: "Dr. Robert Vance",
    averageWaitMinutes: 20,
    satisfactionScore: 4.6,
    monthlyPatients: 1350,
    activeStatus: true,
  },
  {
    id: "srv-05",
    name: "Radiology & Diagnostic Imaging",
    category: "Diagnostic",
    description: "Digital X-Ray, CT Scans, MRI, Ultrasound imaging, and rapid radiologist reviews.",
    headDoctor: "Dr. Nathan Cole",
    averageWaitMinutes: 10,
    satisfactionScore: 4.8,
    monthlyPatients: 3100,
    activeStatus: true,
  },
  {
    id: "srv-06",
    name: "Dental Care & Oral Surgery",
    category: "Clinical",
    description: "Dental hygiene, root canals, cosmetic dentistry, and emergency dental treatments.",
    headDoctor: "Dr. Lisa Wong",
    averageWaitMinutes: 15,
    satisfactionScore: 4.7,
    monthlyPatients: 1950,
    activeStatus: true,
  },
  {
    id: "srv-07",
    name: "Clinical Pharmacy & Dispensing",
    category: "Support",
    description: "Prescription fulfillment, medication reconciliation, and patient drug counseling.",
    headDoctor: "PharmD. Kevin Miller",
    averageWaitMinutes: 6,
    satisfactionScore: 4.9,
    monthlyPatients: 5600,
    activeStatus: true,
  },
  {
    id: "srv-08",
    name: "Emergency & Trauma Response",
    category: "Clinical",
    description: "24/7 critical stabilization, acute injury care, and rapid emergency intervention.",
    headDoctor: "Dr. Gregory House",
    averageWaitMinutes: 4,
    satisfactionScore: 4.7,
    monthlyPatients: 2100,
    activeStatus: true,
  },
];

export const DASHBOARD_TASKS: DashboardTask[] = [
  {
    id: "tsk-101",
    title: "Urgent Patient Follow-up: Cardiology Consult",
    description: "Follow up with patient after 2-star rating regarding extended wait time in downtown clinic.",
    branchName: "Downtown Central Hospital",
    category: "Follow-up",
    priority: "urgent",
    status: "pending",
    assignee: { name: "Sarah Jenkins", role: "Care Coordinator" },
    dueDate: "Today, 4:00 PM",
    createdAt: "2026-08-14T08:30:00Z",
  },
  {
    id: "tsk-102",
    title: "Pharmacy Dispensing Speed Audit",
    description: "Review peak-hour medication dispensing bottlenecks reported at Westside branch.",
    branchName: "Westside Medical Clinic",
    category: "Inspection",
    priority: "high",
    status: "in_progress",
    assignee: { name: "Kevin Miller", role: "Lead Pharmacist" },
    dueDate: "Tomorrow, 11:00 AM",
    createdAt: "2026-08-13T14:20:00Z",
  },
  {
    id: "tsk-103",
    title: "Quarterly Diagnostic Ultrasound Calibration",
    description: "Mandatory calibration & certified maintenance for 3 ultrasound units in North District.",
    branchName: "North District Health Center",
    category: "Equipment",
    priority: "medium",
    status: "pending",
    assignee: { name: "Nathan Cole", role: "Biomedical Engineer" },
    dueDate: "Aug 18, 2026",
    createdAt: "2026-08-12T09:15:00Z",
  },
  {
    id: "tsk-104",
    title: "Pediatric Waiting Lounge Childproofing Review",
    description: "Verify sanitization stations and interactive play tablet stations are fully operational.",
    branchName: "Uptown Medical Pavilion",
    category: "Protocol",
    priority: "low",
    status: "completed",
    assignee: { name: "Maya Sharma", role: "Pediatric Lead" },
    dueDate: "Aug 14, 2026",
    createdAt: "2026-08-11T11:00:00Z",
  },
  {
    id: "tsk-105",
    title: "Patient Feedback Resolution: Staff Courtesy Commendation",
    description: "Deliver commendation certificate to Night Shift nursing team for outstanding patient care scores.",
    branchName: "Harbor Bay Urgent Care",
    category: "Staffing",
    priority: "medium",
    status: "completed",
    assignee: { name: "Liam Gallagher", role: "Branch Director" },
    dueDate: "Aug 13, 2026",
    createdAt: "2026-08-10T16:45:00Z",
  },
  {
    id: "tsk-106",
    title: "Investigate Sunset Hills Peak-Hour Wait Times",
    description: "Analyze triage queue logs between 5 PM - 7 PM to reduce patient wait times.",
    branchName: "Sunset Hills Health Center",
    category: "Inspection",
    priority: "high",
    status: "pending",
    assignee: { name: "Rachel Zheng", role: "Operations Lead" },
    dueDate: "Aug 16, 2026",
    createdAt: "2026-08-14T07:10:00Z",
  },
];

export const PATIENT_FEEDBACK_DATA: PatientFeedback[] = [
  {
    id: "fb-501",
    patientPhone: "+1 (555) 492-1084",
    branchName: "Downtown Central Hospital",
    serviceName: "Cardiology & Vascular",
    rating: 5,
    sentiment: "positive",
    predefinedTags: ["Attentive Staff", "Clear Explanations", "Clean Facilities"],
    comment: "Dr. Jenkins and the cardiac nursing team were remarkably caring. Everything was explained step by step with great empathy.",
    submittedAt: "15 minutes ago",
    status: "resolved",
    resolvedBy: "Dr. Eleanor Vance",
  },
  {
    id: "fb-502",
    patientPhone: "+1 (555) 883-9912",
    branchName: "Westside Medical Clinic",
    serviceName: "General Medicine & Triage",
    rating: 2,
    sentiment: "negative",
    predefinedTags: ["Long Wait Time", "Crowded Waiting Room"],
    comment: "Waited 45 minutes beyond my appointment time. The triage staff was polite but seemed overwhelmed with registrations.",
    submittedAt: "42 minutes ago",
    status: "investigating",
  },
  {
    id: "fb-503",
    patientPhone: "+1 (555) 314-5509",
    branchName: "Uptown Medical Pavilion",
    serviceName: "Pediatrics & Child Care",
    rating: 5,
    sentiment: "positive",
    predefinedTags: ["Kids-Friendly", "Gentle Care", "Fast Service"],
    comment: "Our toddler felt so safe! The stickers and gentle doctor made vaccinations completely tear-free. Thank you HealSync!",
    submittedAt: "1 hour ago",
    status: "resolved",
    resolvedBy: "Dr. Hannah Lindqvist",
  },
  {
    id: "fb-504",
    patientPhone: "+1 (555) 720-3341",
    branchName: "Harbor Bay Urgent Care",
    serviceName: "Emergency & Trauma Response",
    rating: 5,
    sentiment: "positive",
    predefinedTags: ["Rapid Triage", "Professional Doctors"],
    comment: "Came in with a severe sprain. X-rays were taken within 10 minutes, and I walked out with a brace and clear rehab instructions.",
    submittedAt: "2 hours ago",
    status: "resolved",
    resolvedBy: "Dr. Liam Gallagher",
  },
  {
    id: "fb-505",
    patientPhone: "+1 (555) 609-1823",
    branchName: "Metro East Polyclinic",
    serviceName: "Clinical Pharmacy & Dispensing",
    rating: 4,
    sentiment: "positive",
    predefinedTags: ["Quick Prescription", "Helpful Pharmacist"],
    comment: "Pharmacist Kevin Miller took time to explain possible interactions with my existing vitamins. Very knowledgeable.",
    submittedAt: "3 hours ago",
    status: "resolved",
    resolvedBy: "Dr. Aisha Patel",
  },
  {
    id: "fb-506",
    patientPhone: "+1 (555) 441-9025",
    branchName: "Sunset Hills Health Center",
    serviceName: "Radiology & Diagnostic Imaging",
    rating: 3,
    sentiment: "neutral",
    predefinedTags: ["Average Service", "Parking Issue"],
    comment: "The MRI scan was handled professionally, but parking was extremely difficult during the afternoon rush.",
    submittedAt: "5 hours ago",
    status: "new",
  },
  {
    id: "fb-507",
    patientPhone: "+1 (555) 299-8834",
    branchName: "North District Health Center",
    serviceName: "Dental Care & Oral Surgery",
    rating: 5,
    sentiment: "positive",
    predefinedTags: ["Painless Procedure", "Modern Equipment"],
    comment: "Cleanest dental facility I've visited in the city. High-definition screen showing the scans was awesome.",
    submittedAt: "6 hours ago",
    status: "resolved",
    resolvedBy: "Dr. Marcus Thorne",
  },
  {
    id: "fb-508",
    patientPhone: "+1 (555) 501-7721",
    branchName: "Silicon Heights Wellness",
    serviceName: "General Medicine & Triage",
    rating: 5,
    sentiment: "positive",
    predefinedTags: ["Digital Check-in", "Punctual Doctors"],
    comment: "Loved the digital check-in on my phone. No paperwork required, entered right on time.",
    submittedAt: "7 hours ago",
    status: "resolved",
  },
];

export const STAFF_USERS: StaffUser[] = [
  {
    id: "usr-01",
    name: "Dr. Alexander Cross",
    email: "admin@healsync.health",
    role: "admin",
    assignedBranch: "All 13 Branches (Global Admin)",
    status: "active",
    lastActive: "Active Now",
  },
  {
    id: "usr-02",
    name: "Elena Rostova",
    email: "manager@healsync.health",
    role: "manager",
    assignedBranch: "Central & Westside District Operations",
    status: "active",
    lastActive: "10 mins ago",
  },
  {
    id: "usr-03",
    name: "David Chen",
    email: "analyst@healsync.health",
    role: "analyst",
    assignedBranch: "Smart City Analytics & BI Unit",
    status: "active",
    lastActive: "1 hour ago",
  },
  {
    id: "usr-04",
    name: "Dr. Eleanor Vance",
    email: "e.vance@healsync.health",
    role: "manager",
    assignedBranch: "Downtown Central Hospital",
    status: "active",
    lastActive: "25 mins ago",
  },
  {
    id: "usr-05",
    name: "Dr. Marcus Thorne",
    email: "m.thorne@healsync.health",
    role: "manager",
    assignedBranch: "North District Health Center",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "usr-06",
    name: "Sophie Laurent",
    email: "s.laurent@healsync.health",
    role: "analyst",
    assignedBranch: "Patient Experience & SLA Metrics",
    status: "active",
    lastActive: "Yesterday",
  },
];

export const ANALYTICS_METRICS = {
  npsScore: 78,
  npsChange: "+5.2 pts this month",
  averageSatisfaction: 4.74,
  satisfactionChange: "+0.18 vs last quarter",
  totalSubmissions: 11820,
  submissionsChange: "+14.3% YoY",
  slaResolutionRate: 95.8,
  slaChange: "+2.1% compliance",
  sentimentBreakdown: {
    positive: 84,
    neutral: 11,
    negative: 5,
  },
  ratingDistribution: [
    { stars: "5 Stars", count: 8640, percentage: 73 },
    { stars: "4 Stars", count: 2180, percentage: 18 },
    { stars: "3 Stars", count: 620, percentage: 5 },
    { stars: "2 Stars", count: 260, percentage: 3 },
    { stars: "1 Star", count: 120, percentage: 1 },
  ],
  monthlyTrends: [
    { month: "Jan", feedback: 820, satisfaction: 4.58 },
    { month: "Feb", feedback: 890, satisfaction: 4.62 },
    { month: "Mar", feedback: 960, satisfaction: 4.65 },
    { month: "Apr", feedback: 1040, satisfaction: 4.69 },
    { month: "May", feedback: 1110, satisfaction: 4.71 },
    { month: "Jun", feedback: 1230, satisfaction: 4.72 },
    { month: "Jul", feedback: 1350, satisfaction: 4.74 },
  ],
};
