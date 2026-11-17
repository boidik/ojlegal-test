import { 
  db, 
  isFirebaseConfigured 
} from "./firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc 
} from "firebase/firestore";
import { 
  INITIAL_SETTINGS, 
  STANDARD_LEGAL_CATEGORIES,
  STANDARD_COURT_FORUMS,
  OFFLINE_DEMO_CASES,
  OFFLINE_DEMO_USERS,
  PRESET_FAVICONS
} from "./sampleData";

const STORAGE_KEYS = {
  CASES: "oj_store_cases",
  EXPENSES: "oj_store_expenses",
  ADVANCES: "oj_store_advances",
  CATEGORIES: "oj_store_categories",
  FORUMS: "oj_store_forums",
  SETTINGS: "oj_store_settings",
  USERS: "oj_store_users",
};

// Dynamic Favicon and Title Applicator
export const applyFaviconAndTitle = (settings) => {
  if (!settings) return;

  // 1. Update Document Title
  if (settings.firmName) {
    document.title = `${settings.firmName} - Expense & Float Management`;
  }

  // 2. Update Favicon Link
  let faviconUrl = "";
  if (settings.faviconType === "custom_url" && settings.customFaviconUrl) {
    faviconUrl = settings.customFaviconUrl;
  } else if (settings.faviconType && PRESET_FAVICONS[settings.faviconType]) {
    faviconUrl = PRESET_FAVICONS[settings.faviconType];
  } else {
    faviconUrl = PRESET_FAVICONS.scales;
  }

  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
};

// Helper for local storage retrieval (only used in offline demo mode)
const getLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Local storage read error:", e);
    return fallback;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage write error:", e);
  }
};

// Initialize data store
// IMPORTANT: Does NOT seed simulated cases/expenses/advances into Firestore!
export const initializeDataStore = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      // Check if firm settings exist in Firestore; only create initial firm settings if not present
      const settingsRef = doc(db, "system", "firm_settings");
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, INITIAL_SETTINGS);
      }
      const loaded = settingsSnap.exists() ? settingsSnap.data() : INITIAL_SETTINGS;
      applyFaviconAndTitle(loaded);
    } catch (err) {
      console.warn("Could not check/seed remote Firestore settings:", err);
    }
  } else {
    // Local offline demo mode
    getLocal(STORAGE_KEYS.CASES, OFFLINE_DEMO_CASES);
    getLocal(STORAGE_KEYS.EXPENSES, []);
    getLocal(STORAGE_KEYS.ADVANCES, []);
    getLocal(STORAGE_KEYS.CATEGORIES, STANDARD_LEGAL_CATEGORIES);
    const s = getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
    applyFaviconAndTitle(s);
  }
};

// ==================== SETTINGS & BRANDING ====================
export const getSettings = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, "system", "firm_settings"));
      if (snap.exists()) {
        const data = snap.data();
        applyFaviconAndTitle(data);
        return data;
      }
    } catch (e) {
      console.warn("Remote getSettings failed, using local fallback", e);
    }
  }
  const s = getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  applyFaviconAndTitle(s);
  return s;
};

export const updateSettings = async (newSettings) => {
  const merged = { ...INITIAL_SETTINGS, ...newSettings };
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "system", "firm_settings"), merged, { merge: true });
    } catch (e) {
      console.error("Remote updateSettings failed:", e);
    }
  }
  setLocal(STORAGE_KEYS.SETTINGS, merged);
  applyFaviconAndTitle(merged);
  return merged;
};

// ==================== CASES ====================
// Returns strictly live cases from Firestore when connected. No simulated data!
export const getCases = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getCases failed:", e);
      return [];
    }
  }
  return getLocal(STORAGE_KEYS.CASES, OFFLINE_DEMO_CASES);
};

export const addCase = async (caseData) => {
  const newCase = {
    ...caseData,
    id: caseData.id || `CASE-${Date.now().toString().slice(-4)}`,
    status: caseData.status || "active",
    createdAt: new Date().toISOString().split("T")[0],
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "cases", newCase.id), newCase);
  }

  const localCases = getLocal(STORAGE_KEYS.CASES, []);
  const updated = [newCase, ...localCases];
  setLocal(STORAGE_KEYS.CASES, updated);
  return newCase;
};

export const updateCase = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "cases", id), updates);
  }
  const localCases = getLocal(STORAGE_KEYS.CASES, []);
  const updated = localCases.map(c => c.id === id ? { ...c, ...updates } : c);
  setLocal(STORAGE_KEYS.CASES, updated);
  return updated.find(c => c.id === id);
};

export const deleteCase = async (id) => {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "cases", id));
  }
  const localCases = getLocal(STORAGE_KEYS.CASES, []);
  const filtered = localCases.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CASES, filtered);
  return true;
};

// ==================== EXPENSES ====================
// Returns strictly live expenses from Firestore when connected. No simulated data!
export const getExpenses = async (filters = {}) => {
  let list = [];
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getExpenses failed:", e);
      list = [];
    }
  } else {
    list = getLocal(STORAGE_KEYS.EXPENSES, []);
  }

  // Apply filters
  if (filters.caseId && filters.caseId !== "ALL") {
    list = list.filter(e => e.caseId === filters.caseId);
  }
  if (filters.staffId && filters.staffId !== "ALL") {
    list = list.filter(e => e.staffId === filters.staffId);
  }
  if (filters.categoryType && filters.categoryType !== "ALL") {
    list = list.filter(e => e.categoryType === filters.categoryType);
  }
  if (filters.category && filters.category !== "ALL") {
    list = list.filter(e => e.category === filters.category);
  }
  if (filters.startDate) {
    list = list.filter(e => e.date >= filters.startDate);
  }
  if (filters.endDate) {
    list = list.filter(e => e.date <= filters.endDate);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(e => 
      e.name.toLowerCase().includes(s) || 
      (e.caseTitle && e.caseTitle.toLowerCase().includes(s)) ||
      (e.notes && e.notes.toLowerCase().includes(s)) ||
      (e.staffName && e.staffName.toLowerCase().includes(s))
    );
  }

  return list;
};

export const addExpense = async (expenseData) => {
  const newExpense = {
    ...expenseData,
    id: expenseData.id || `EXP-${Date.now().toString().slice(-6)}`,
    amount: Number(expenseData.amount) || 0,
    status: expenseData.status || "approved",
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "expenses", newExpense.id), newExpense);
  }

  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  const updatedExpenses = [newExpense, ...localExpenses];
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  if (newExpense.advanceId && (newExpense.paymentMode === "firm_advance" || newExpense.advanceDeducted)) {
    await updateAdvanceUsage(newExpense.advanceId);
  }

  return newExpense;
};

export const updateExpense = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "expenses", id), updates);
  }

  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  const existing = localExpenses.find(e => e.id === id);
  const updatedExpenses = localExpenses.map(e => e.id === id ? { ...e, ...updates } : e);
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  if (existing && existing.advanceId) {
    await updateAdvanceUsage(existing.advanceId);
  }
  if (updates.advanceId && updates.advanceId !== existing?.advanceId) {
    await updateAdvanceUsage(updates.advanceId);
  }

  return updatedExpenses.find(e => e.id === id);
};

export const deleteExpense = async (id) => {
  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  const target = localExpenses.find(e => e.id === id);

  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "expenses", id));
  }

  const filtered = localExpenses.filter(e => e.id !== id);
  setLocal(STORAGE_KEYS.EXPENSES, filtered);

  if (target && target.advanceId) {
    await updateAdvanceUsage(target.advanceId);
  }

  return true;
};

// ==================== ADVANCES ====================
// Returns strictly live advances from Firestore when connected. No simulated data!
export const getAdvances = async (staffId = null) => {
  let list = [];
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "advances"), orderBy("disbursedDate", "desc"));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getAdvances failed:", e);
      list = [];
    }
  } else {
    list = getLocal(STORAGE_KEYS.ADVANCES, []);
  }

  if (staffId && staffId !== "ALL") {
    list = list.filter(a => a.staffId === staffId);
  }

  return list;
};

export const addAdvance = async (advanceData) => {
  const newAdvance = {
    ...advanceData,
    id: advanceData.id || `ADV-${Date.now().toString().slice(-5)}`,
    amount: Number(advanceData.amount) || 0,
    usedAmount: 0,
    status: "active",
    disbursedDate: advanceData.disbursedDate || new Date().toISOString().split("T")[0],
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "advances", newAdvance.id), newAdvance);
  }

  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
  const updated = [newAdvance, ...localAdvances];
  setLocal(STORAGE_KEYS.ADVANCES, updated);
  return newAdvance;
};

export const updateAdvance = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "advances", id), updates);
  }
  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
  const updated = localAdvances.map(a => a.id === id ? { ...a, ...updates } : a);
  setLocal(STORAGE_KEYS.ADVANCES, updated);
  return updated.find(a => a.id === id);
};

export const deleteAdvance = async (id) => {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "advances", id));
  }
  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
  const filtered = localAdvances.filter(a => a.id !== id);
  setLocal(STORAGE_KEYS.ADVANCES, filtered);
  return true;
};

// Reconciles advance usage
export const updateAdvanceUsage = async (advanceId) => {
  if (!advanceId) return;

  let allExpenses = [];
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "expenses"));
      const snap = await getDocs(q);
      allExpenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      allExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
    }
  } else {
    allExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  }

  const matchingExpenses = allExpenses.filter(e => e.advanceId === advanceId);
  const totalUsed = matchingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  let targetAdvance = null;
  if (isFirebaseConfigured() && db) {
    try {
      const advSnap = await getDoc(doc(db, "advances", advanceId));
      if (advSnap.exists()) {
        targetAdvance = advSnap.data();
      }
    } catch (e) {
      console.warn("Could not read advance from Firestore:", e);
    }
  }

  if (!targetAdvance) {
    const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
    targetAdvance = localAdvances.find(a => a.id === advanceId);
  }

  if (targetAdvance) {
    const isSettled = totalUsed >= targetAdvance.amount;
    const updates = {
      usedAmount: totalUsed,
      status: isSettled ? "settled" : "active"
    };

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, "advances", advanceId), updates);
      } catch (e) {
        console.warn("Could not sync advance usage to Firestore:", e);
      }
    }

    const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
    const updatedAdvances = localAdvances.map(a => a.id === advanceId ? { ...a, ...updates } : a);
    setLocal(STORAGE_KEYS.ADVANCES, updatedAdvances);
  }
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "categories"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return list;
    } catch (e) {
      console.warn("Remote getCategories failed:", e);
      return [];
    }
  }
  return getLocal(STORAGE_KEYS.CATEGORIES, STANDARD_LEGAL_CATEGORIES);
};

export const addCategory = async (catData) => {
  const newCat = {
    ...catData,
    id: catData.id || `CAT-${Date.now().toString().slice(-4)}`,
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "categories", newCat.id), newCat);
  }

  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, []);
  const updated = [...localCategories, newCat];
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  return newCat;
};

export const seedStandardCategories = async () => {
  for (const cat of STANDARD_LEGAL_CATEGORIES) {
    if (isFirebaseConfigured() && db) {
      await setDoc(doc(db, "categories", cat.id), cat);
    }
  }
  setLocal(STORAGE_KEYS.CATEGORIES, STANDARD_LEGAL_CATEGORIES);
  return STANDARD_LEGAL_CATEGORIES;
};

export const updateCategory = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "categories", id), updates);
  }
  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, []);
  const updated = localCategories.map(c => c.id === id ? { ...c, ...updates } : c);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  return updated.find(c => c.id === id);
};

export const deleteCategory = async (id) => {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "categories", id));
  }
  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, []);
  const filtered = localCategories.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, filtered);
  return true;
};

// ==================== FORUMS & COURTS ====================
export const getForums = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "forums"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Remote getForums failed:", e);
    }
  }
  return getLocal(STORAGE_KEYS.FORUMS, STANDARD_COURT_FORUMS);
};

export const addForum = async (forumData) => {
  const newForum = {
    ...forumData,
    id: forumData.id || `FORUM-${Date.now().toString().slice(-4)}`,
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "forums", newForum.id), newForum);
  }

  const localForums = getLocal(STORAGE_KEYS.FORUMS, STANDARD_COURT_FORUMS);
  const updated = [...localForums, newForum];
  setLocal(STORAGE_KEYS.FORUMS, updated);
  return newForum;
};

export const updateForum = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "forums", id), updates);
  }
  const localForums = getLocal(STORAGE_KEYS.FORUMS, STANDARD_COURT_FORUMS);
  const updated = localForums.map(f => f.id === id ? { ...f, ...updates } : f);
  setLocal(STORAGE_KEYS.FORUMS, updated);
  return updated.find(f => f.id === id);
};

export const deleteForum = async (id) => {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "forums", id));
  }
  const localForums = getLocal(STORAGE_KEYS.FORUMS, STANDARD_COURT_FORUMS);
  const filtered = localForums.filter(f => f.id !== id);
  setLocal(STORAGE_KEYS.FORUMS, filtered);
  return true;
};

export const seedStandardForums = async () => {
  for (const f of STANDARD_COURT_FORUMS) {
    if (isFirebaseConfigured() && db) {
      await setDoc(doc(db, "forums", f.id), f);
    }
  }
  setLocal(STORAGE_KEYS.FORUMS, STANDARD_COURT_FORUMS);
  return STANDARD_COURT_FORUMS;
};

// ==================== USERS & ROLES ====================
export const getUsers = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getUsers failed:", e);
      return [];
    }
  }
  return getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
};

export const saveUser = async (userData) => {
  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "users", userData.uid), userData, { merge: true });
  }
  const localUsers = getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
  const existingIdx = localUsers.findIndex(u => u.uid === userData.uid || u.email === userData.email);
  let updatedUsers;
  if (existingIdx >= 0) {
    updatedUsers = [...localUsers];
    updatedUsers[existingIdx] = { ...updatedUsers[existingIdx], ...userData };
  } else {
    updatedUsers = [...localUsers, userData];
  }
  setLocal(STORAGE_KEYS.USERS, updatedUsers);
  return userData;
};

export const updateUserRole = async (uid, role) => {
  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "users", uid), { role }, { merge: true });
  }
  const localUsers = getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
  const updated = localUsers.map(u => u.uid === uid ? { ...u, role } : u);
  setLocal(STORAGE_KEYS.USERS, updated);
  return true;
};
