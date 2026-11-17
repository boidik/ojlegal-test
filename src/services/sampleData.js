// Clean initial settings and presets for Law Firm Expense & Advance Management System

export const PRESET_FAVICONS = {
  scales: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c99738'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/></svg>",
  gavel: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230f2942'><path d='M1 21h12v2H1zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828zM12.317 1l5.657 5.656-2.83 2.83-5.656-5.658zM3.832 9.485l5.656 5.657-2.828 2.828-5.657-5.657z'/></svg>",
  pillar: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'><path d='M4 2v3h16V2H4zm2 5v11h3V7H6zm5 0v11h3V7h-3zm5 0v11h3V7h-3zM2 20v2h20v-2H2z'/></svg>",
  shield: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2316a34a'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/></svg>",
};

export const INITIAL_SETTINGS = {
  firmName: "OJ Legal Advocates & Solicitors",
  tagline: "Corporate Litigation, Arbitration & Technical Legal Advisory",
  registrationNo: "DEL/HC/2026/BAR-892",
  firmAddress: "Chamber Suite 402, High Court Complex, New Delhi - 110001",
  contactEmail: "accounts@ojlegal.com",
  contactPhone: "+91 98100 00000",
  altPhone: "+91 (11) 2338-0000",
  websiteUrl: "https://ojlegal-test.firebaseapp.com",
  currencySymbol: "₹", // Supports ₹, $, £, €, etc.
  
  // UI & Header Customization
  navbarTitle: "OJ Legal Advocates",
  headerBgColor: "#0f2942", // Default Navy Blue (#0f2942, #111827, #4a0404, #064e3b, etc.)
  headerTextColor: "#ffffff",
  headerAccentColor: "#c99738", // Subtle Gold
  navbarIconType: "gavel", // "gavel" | "scales" | "pillar" | "shield" | "custom_url"
  customLogoUrl: "",
  faviconType: "scales", // "scales" | "gavel" | "pillar" | "shield" | "custom_url"
  customFaviconUrl: "",
  primaryColor: "#0f2942",
  secondaryColor: "#c99738",
  
  // Reports & Legal Headers
  reportHeader: "OJ LEGAL ADVOCATES - EXPENDITURE & ADVANCE RECONCILIATION STATEMENT",
  reportDisclaimer: "Certified that the above expenditures were strictly incurred in the discharge of professional legal services and client representation. All original vouchers & receipts are digitally retained in compliance with Bar Council guidelines.",
  signaturePreparedBy: "Prepared by Staff Associate",
  signatureVerifiedBy: "Verified by Accounts Admin (Boss)",
  signatureApprovedBy: "Approved by Managing Partner",
};

// Standard clean legal & technical categories that can be seeded into Firestore on demand
export const STANDARD_LEGAL_CATEGORIES = [
  {
    id: "CAT-LEGAL-01",
    name: "Court & Filing Fees",
    type: "legal",
    description: "Stamp duty, caveat filing, court petition registration fees, process fees"
  },
  {
    id: "CAT-LEGAL-02",
    name: "Senior Counsel & Briefing Fees",
    type: "legal",
    description: "Senior advocate conference, brief drafting, legal opinion fees"
  },
  {
    id: "CAT-LEGAL-03",
    name: "Certified Copies & Clerical Charges",
    type: "legal",
    description: "Registry inspection fees, certified copies, translation, notary & oath commissioner"
  },
  {
    id: "CAT-TECH-01",
    name: "Forensic Evidence & Data Extraction",
    type: "technical",
    description: "Hard drive imaging, digital forensics, mobile data recovery, chain of custody"
  },
  {
    id: "CAT-TECH-02",
    name: "E-Discovery & Litigation Software Subscriptions",
    type: "technical",
    description: "Relativity licenses, specialized litigation databases, transcription AI"
  },
  {
    id: "CAT-TECH-03",
    name: "Expert Technical Witness & Valuation",
    type: "technical",
    description: "Patent engineers, cyber security consultants, chartered accountants"
  },
  {
    id: "CAT-TRAVEL-01",
    name: "Travel, Lodging & Conveyance",
    type: "administrative",
    description: "Outstation tribunal flights, trains, local cabs, hotel stays during hearing"
  },
  {
    id: "CAT-MISC-01",
    name: "Printing, Courier & Miscellaneous",
    type: "administrative",
    description: "Speed post, bulk petition paper binding, stationery, client refreshments"
  }
];

// Offline fallback mock data for testing only when Firebase is not configured
export const OFFLINE_DEMO_CASES = [
  {
    id: "CASE-DEMO-001",
    caseNumber: "WP(C) 4120/2026",
    title: "Apex Technologies vs. State of NCT",
    clientName: "Apex Tech Global Pvt Ltd",
    court: "Delhi High Court",
    leadAttorney: "Adv. Rajesh Varma",
    status: "active",
    budget: 250000,
    createdAt: "2026-01-15"
  },
  {
    id: "CASE-DEMO-002",
    caseNumber: "ARB/DEL/882/2026",
    title: "Metro Infra Ltd vs. Union of India (Arbitration)",
    clientName: "Metro Infrastructure Consortium",
    court: "International Arbitration Centre",
    leadAttorney: "Adv. Meenakshi Sundaram",
    status: "active",
    budget: 600000,
    createdAt: "2026-02-01"
  }
];

export const OFFLINE_DEMO_USERS = [
  {
    uid: "user-software-admin",
    email: "admin@ojlegal.com",
    displayName: "Software Admin (You)",
    role: "software_admin",
    designation: "Principal Tech & Systems Admin",
    phone: "+91 98110 00001",
    isActive: true
  },
  {
    uid: "user-accounts-boss",
    email: "boss@ojlegal.com",
    displayName: "Mr. Vikramaditya Sen (Managing Partner / Boss)",
    role: "accounts_admin",
    designation: "Managing Partner & Head of Accounts",
    phone: "+91 98110 00002",
    isActive: true
  },
  {
    uid: "user-staff-1",
    email: "priya.sharma@ojlegal.com",
    displayName: "Priya Sharma",
    role: "staff",
    designation: "Senior Associate Advocate",
    phone: "+91 98110 00003",
    isActive: true
  }
];

export const INITIAL_USERS = OFFLINE_DEMO_USERS;

