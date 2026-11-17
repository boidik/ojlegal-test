// Realistic seed data for Law Firm Expense & Advance Management System

export const INITIAL_SETTINGS = {
  firmName: "LexVeritas & Partners Advocates",
  tagline: "High Court & Supreme Court Legal Counsel",
  firmAddress: "Chamber No. 408, High Court Bar Association Complex, New Delhi - 110001",
  contactEmail: "accounts@lexveritaslaw.com",
  contactPhone: "+91 (11) 2338-9000",
  currencySymbol: "₹", // Supports ₹, $, £, €, etc.
  reportHeader: "LEXVERITAS & PARTNERS - EXPENDITURE & ADVANCE RECONCILIATION STATEMENT",
  reportDisclaimer: "Certified that the above expenditures were strictly incurred in the discharge of professional legal services and client representation. All original vouchers & receipts are attached or digitally retained in compliance with Bar Council guidelines.",
  primaryColor: "#0f2942", // Prestigious Navy Blue
  secondaryColor: "#c99738", // Subtle Gold
};

export const INITIAL_CATEGORIES = [
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
    description: "Senior advocate conference, brief drafting, opinion fees"
  },
  {
    id: "CAT-LEGAL-03",
    name: "Certified Copies & Clerical Charges",
    type: "legal",
    description: "Inspection fees, certified copies, translation, notary & commissioner"
  },
  {
    id: "CAT-TECH-01",
    name: "Forensic Evidence & Data Extraction",
    type: "technical",
    description: "Hard drive imaging, digital forensics, mobile data recovery, chain of custody"
  },
  {
    id: "CAT-TECH-02",
    name: "E-Discovery & Cloud Software Subscriptions",
    type: "technical",
    description: "Relativity licenses, specialized litigation databases, transcription AI"
  },
  {
    id: "CAT-TECH-03",
    name: "Expert Technical Witness & Valuation",
    type: "technical",
    description: "Patent engineers, cyber security consultants, financial chartered accountants"
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

export const INITIAL_CASES = [
  {
    id: "CASE-2026-001",
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
    id: "CASE-2026-002",
    caseNumber: "ARB/DEL/882/2026",
    title: "Metro Infra Ltd vs. Union of India (Arbitration)",
    clientName: "Metro Infrastructure Consortium",
    court: "International Arbitration Centre",
    leadAttorney: "Adv. Meenakshi Sundaram",
    status: "active",
    budget: 600000,
    createdAt: "2026-02-01"
  },
  {
    id: "CASE-2026-003",
    caseNumber: "CS(COMM) 104/2026",
    title: "Novartis Pharma Patent Infringement Matter",
    clientName: "Novartis Healthcare Ltd",
    court: "Commercial Division, High Court",
    leadAttorney: "Adv. Tanya Oberoi",
    status: "active",
    budget: 450000,
    createdAt: "2026-03-10"
  },
  {
    id: "CASE-2026-004",
    caseNumber: "CRL.A 55/2026",
    title: "State vs. Dr. Alok Kumar (Cyber Defense)",
    clientName: "Dr. Alok Kumar",
    court: "Sessions Court",
    leadAttorney: "Adv. Rajesh Varma",
    status: "active",
    budget: 180000,
    createdAt: "2026-04-05"
  },
  {
    id: "CASE-2026-005",
    caseNumber: "NCLT/IB/339/2026",
    title: "Insolvency Matter - Zenith Steel Mills",
    clientName: "Zenith Steels Operational Creditors",
    court: "NCLT Principal Bench",
    leadAttorney: "Adv. Meenakshi Sundaram",
    status: "active",
    budget: 350000,
    createdAt: "2026-05-12"
  }
];

export const INITIAL_USERS = [
  {
    uid: "user-software-admin",
    email: "admin@lexveritaslaw.com",
    displayName: "Software Admin (You)",
    role: "software_admin",
    designation: "Principal Tech & Systems Admin",
    phone: "+91 98110 00001",
    isActive: true
  },
  {
    uid: "user-accounts-boss",
    email: "boss@lexveritaslaw.com",
    displayName: "Mr. Vikramaditya Sen (Managing Partner / Boss)",
    role: "accounts_admin",
    designation: "Managing Partner & Head of Accounts",
    phone: "+91 98110 00002",
    isActive: true
  },
  {
    uid: "user-staff-1",
    email: "priya.sharma@lexveritaslaw.com",
    displayName: "Priya Sharma",
    role: "staff",
    designation: "Senior Associate Advocate",
    phone: "+91 98110 00003",
    isActive: true
  },
  {
    uid: "user-staff-2",
    email: "arjun.mehta@lexveritaslaw.com",
    displayName: "Arjun Mehta",
    role: "staff",
    designation: "Junior Litigator & Court Clerk Manager",
    phone: "+91 98110 00004",
    isActive: true
  },
  {
    uid: "user-staff-3",
    email: "rohan.das@lexveritaslaw.com",
    displayName: "Rohan Das",
    role: "staff",
    designation: "Legal Tech & Forensic Analyst",
    phone: "+91 98110 00005",
    isActive: true
  }
];

export const INITIAL_ADVANCES = [
  {
    id: "ADV-2026-001",
    staffId: "user-staff-1",
    staffName: "Priya Sharma",
    staffEmail: "priya.sharma@lexveritaslaw.com",
    amount: 25000,
    usedAmount: 18450,
    caseId: "CASE-2026-001",
    caseTitle: "Apex Technologies vs. State of NCT",
    disbursedDate: "2026-11-01",
    notes: "Advance issued for urgent High Court paper book filings and process services.",
    status: "active",
    disbursedBy: "Mr. Vikramaditya Sen (Boss)"
  },
  {
    id: "ADV-2026-002",
    staffId: "user-staff-2",
    staffName: "Arjun Mehta",
    staffEmail: "arjun.mehta@lexveritaslaw.com",
    amount: 15000,
    usedAmount: 8900,
    caseId: "ALL", // General advance
    caseTitle: "General Out-of-Pocket Office Float",
    disbursedDate: "2026-11-05",
    notes: "Monthly general petty cash advance for court appearances and registry movement.",
    status: "active",
    disbursedBy: "Mr. Vikramaditya Sen (Boss)"
  },
  {
    id: "ADV-2026-003",
    staffId: "user-staff-3",
    staffName: "Rohan Das",
    staffEmail: "rohan.das@lexveritaslaw.com",
    amount: 40000,
    usedAmount: 34500,
    caseId: "CASE-2026-004",
    caseTitle: "State vs. Dr. Alok Kumar (Cyber Defense)",
    disbursedDate: "2026-11-08",
    notes: "Advance for server forensic image analysis and certified cyber examiner fees.",
    status: "active",
    disbursedBy: "Mr. Vikramaditya Sen (Boss)"
  }
];

export const INITIAL_EXPENSES = [
  {
    id: "EXP-2026-001",
    caseId: "CASE-2026-001",
    caseTitle: "Apex Technologies vs. State of NCT",
    date: "2026-11-02",
    time: "11:30",
    name: "Urgent Writ Petition Stamp & Court Fee",
    category: "Court & Filing Fees",
    categoryType: "legal",
    amount: 6500,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-001",
    staffId: "user-staff-1",
    staffName: "Priya Sharma",
    staffEmail: "priya.sharma@lexveritaslaw.com",
    notes: "Paid at High Court Filing Counter. Receipt No: HC/F/9921",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-02T11:35:00Z"
  },
  {
    id: "EXP-2026-002",
    caseId: "CASE-2026-001",
    caseTitle: "Apex Technologies vs. State of NCT",
    date: "2026-11-03",
    time: "15:45",
    name: "Specialized Paper Book Printing & Golden Embossing (6 sets)",
    category: "Printing, Courier & Miscellaneous",
    categoryType: "administrative",
    amount: 4200,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-001",
    staffId: "user-staff-1",
    staffName: "Priya Sharma",
    staffEmail: "priya.sharma@lexveritaslaw.com",
    notes: "6 paper books for Bench and Advocate General",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-03T15:50:00Z"
  },
  {
    id: "EXP-2026-003",
    caseId: "CASE-2026-001",
    caseTitle: "Apex Technologies vs. State of NCT",
    date: "2026-11-05",
    time: "10:15",
    name: "Senior Advocate Briefing Conference Venue & Clerkage",
    category: "Senior Counsel & Briefing Fees",
    categoryType: "legal",
    amount: 7750,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-001",
    staffId: "user-staff-1",
    staffName: "Priya Sharma",
    staffEmail: "priya.sharma@lexveritaslaw.com",
    notes: "Conference room booking and clerkage fee",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-05T10:20:00Z"
  },
  {
    id: "EXP-2026-004",
    caseId: "CASE-2026-004",
    caseTitle: "State vs. Dr. Alok Kumar (Cyber Defense)",
    date: "2026-11-09",
    time: "14:00",
    name: "Forensic Hard Drive Bit-Stream Imaging (MD5 Verified)",
    category: "Forensic Evidence & Data Extraction",
    categoryType: "technical",
    amount: 22000,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-003",
    staffId: "user-staff-3",
    staffName: "Rohan Das",
    staffEmail: "rohan.das@lexveritaslaw.com",
    notes: "Forensic lab report #CYBER-2026-90 attached",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-09T14:10:00Z"
  },
  {
    id: "EXP-2026-005",
    caseId: "CASE-2026-004",
    caseTitle: "State vs. Dr. Alok Kumar (Cyber Defense)",
    date: "2026-11-11",
    time: "16:30",
    name: "Cloud E-Discovery Log Analysis & Audit Software Seat",
    category: "E-Discovery & Cloud Software Subscriptions",
    categoryType: "technical",
    amount: 12500,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-003",
    staffId: "user-staff-3",
    staffName: "Rohan Das",
    staffEmail: "rohan.das@lexveritaslaw.com",
    notes: "Single month seat license for AWS log correlation",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-11T16:35:00Z"
  },
  {
    id: "EXP-2026-006",
    caseId: "CASE-2026-002",
    caseTitle: "Metro Infra Ltd vs. Union of India (Arbitration)",
    date: "2026-11-12",
    time: "09:00",
    name: "Arbitration Tribunal Hearing Hall Deposit & Stenographer",
    category: "Certified Copies & Clerical Charges",
    categoryType: "legal",
    amount: 18000,
    paymentMode: "online_upi",
    advanceId: "",
    staffId: "user-staff-2",
    staffName: "Arjun Mehta",
    staffEmail: "arjun.mehta@lexveritaslaw.com",
    notes: "Direct UPI transfer to Delhi International Arbitration Centre",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-12T09:15:00Z"
  },
  {
    id: "EXP-2026-007",
    caseId: "CASE-2026-003",
    caseTitle: "Novartis Pharma Patent Infringement Matter",
    date: "2026-11-14",
    time: "12:15",
    name: "Chemical Patent Prior Art Search & Expert Metallurgist Opinion",
    category: "Expert Technical Witness & Valuation",
    categoryType: "technical",
    amount: 35000,
    paymentMode: "card",
    advanceId: "",
    staffId: "user-staff-1",
    staffName: "Priya Sharma",
    staffEmail: "priya.sharma@lexveritaslaw.com",
    notes: "Paid to Prof. K. Singhal, IIT Patent Consultant",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-14T12:20:00Z"
  },
  {
    id: "EXP-2026-008",
    caseId: "CASE-2026-002",
    caseTitle: "Metro Infra Ltd vs. Union of India (Arbitration)",
    date: "2026-11-15",
    time: "18:00",
    name: "Outstation Flight Ticket (Delhi - Mumbai Hearing) & Cab",
    category: "Travel, Lodging & Conveyance",
    categoryType: "administrative",
    amount: 8900,
    paymentMode: "firm_advance",
    advanceId: "ADV-2026-002",
    staffId: "user-staff-2",
    staffName: "Arjun Mehta",
    staffEmail: "arjun.mehta@lexveritaslaw.com",
    notes: "IndiGo 6E-2045 + Uber airport commute",
    receiptUrl: "",
    status: "approved",
    createdAt: "2026-11-15T18:10:00Z"
  }
];
