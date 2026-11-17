import { 
  db, 
  isFirebaseConfigured 
} from "./firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDoc 
} from "firebase/firestore";
import { 
  INITIAL_CASES, 
  INITIAL_EXPENSES, 
  INITIAL_ADVANCES, 
  INITIAL_CATEGORIES, 
  INITIAL_SETTINGS, 
  INITIAL_USERS 
} from "./sampleData";

const STORAGE_KEYS = {
  CASES: "lex_store_cases",
  EXPENSES: "lex_store_expenses",
  ADVANCES: "lex_store_advances",
  CATEGORIES: "lex_store_categories",
  SETTINGS: "lex_store_settings",
  USERS: "lex_store_users",
};

// Helper for local storage retrieval with default fallback
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

// Initialize default storage in browser if empty
export const initializeDataStore = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      // Check if collections exist, seed settings if missing
      const settingsRef = doc(db, "system", "firm_settings");
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, INITIAL_SETTINGS);
      }
    } catch (err) {
      console.warn("Could not check/seed remote Firestore settings:", err);
    }
  } else {
    getLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
    getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
    getLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
};

// ==================== SETTINGS ====================
export const getSettings = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, "system", "firm_settings"));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn("Remote getSettings failed, using local fallback", e);
    }
  }
  return getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
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
  return merged;
};

// ==================== CASES ====================
export const getCases = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Remote getCases failed, falling back to local storage:", e);
    }
  }
  return getLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
};

export const addCase = async (caseData) => {
  const newCase = {
    ...caseData,
    id: caseData.id || `CASE-${Date.now().toString().slice(-4)}`,
    status: caseData.status || "active",
    createdAt: new Date().toISOString().split("T")[0],
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "cases", newCase.id), newCase);
    } catch (e) {
      console.error("Remote addCase failed:", e);
    }
  }

  const localCases = getLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
  const updated = [newCase, ...localCases];
  setLocal(STORAGE_KEYS.CASES, updated);
  return newCase;
};

export const updateCase = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, "cases", id), updates);
    } catch (e) {
      console.error("Remote updateCase failed:", e);
    }
  }
  const localCases = getLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
  const updated = localCases.map(c => c.id === id ? { ...c, ...updates } : c);
  setLocal(STORAGE_KEYS.CASES, updated);
  return updated.find(c => c.id === id);
};

export const deleteCase = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, "cases", id));
    } catch (e) {
      console.error("Remote deleteCase failed:", e);
    }
  }
  const localCases = getLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
  const filtered = localCases.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CASES, filtered);
  return true;
};

// ==================== EXPENSES ====================
export const getExpenses = async (filters = {}) => {
  let list = [];
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getExpenses failed, reading local:", e);
      list = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    }
  } else {
    list = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
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
    try {
      await setDoc(doc(db, "expenses", newExpense.id), newExpense);
    } catch (e) {
      console.error("Remote addExpense failed:", e);
    }
  }

  // Update local expenses
  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const updatedExpenses = [newExpense, ...localExpenses];
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  // If this expense is funded from an advance, recalculate advance usedAmount
  if (newExpense.advanceId && (newExpense.paymentMode === "firm_advance" || newExpense.advanceDeducted)) {
    await updateAdvanceUsage(newExpense.advanceId);
  }

  return newExpense;
};

export const updateExpense = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, "expenses", id), updates);
    } catch (e) {
      console.error("Remote updateExpense failed:", e);
    }
  }

  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const existing = localExpenses.find(e => e.id === id);
  const updatedExpenses = localExpenses.map(e => e.id === id ? { ...e, ...updates } : e);
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  // Reconcile advances if advanceId was affected
  if (existing && existing.advanceId) {
    await updateAdvanceUsage(existing.advanceId);
  }
  if (updates.advanceId && updates.advanceId !== existing?.advanceId) {
    await updateAdvanceUsage(updates.advanceId);
  }

  return updatedExpenses.find(e => e.id === id);
};

export const deleteExpense = async (id) => {
  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const target = localExpenses.find(e => e.id === id);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (e) {
      console.error("Remote deleteExpense failed:", e);
    }
  }

  const filtered = localExpenses.filter(e => e.id !== id);
  setLocal(STORAGE_KEYS.EXPENSES, filtered);

  if (target && target.advanceId) {
    await updateAdvanceUsage(target.advanceId);
  }

  return true;
};

// ==================== ADVANCES ====================
export const getAdvances = async (staffId = null) => {
  let list = [];
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "advances"), orderBy("disbursedDate", "desc"));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Remote getAdvances failed, reading local:", e);
      list = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
    }
  } else {
    list = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
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
    try {
      await setDoc(doc(db, "advances", newAdvance.id), newAdvance);
    } catch (e) {
      console.error("Remote addAdvance failed:", e);
    }
  }

  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
  const updated = [newAdvance, ...localAdvances];
  setLocal(STORAGE_KEYS.ADVANCES, updated);
  return newAdvance;
};

export const updateAdvance = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, "advances", id), updates);
    } catch (e) {
      console.error("Remote updateAdvance failed:", e);
    }
  }
  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
  const updated = localAdvances.map(a => a.id === id ? { ...a, ...updates } : a);
  setLocal(STORAGE_KEYS.ADVANCES, updated);
  return updated.find(a => a.id === id);
};

export const deleteAdvance = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, "advances", id));
    } catch (e) {
      console.error("Remote deleteAdvance failed:", e);
    }
  }
  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
  const filtered = localAdvances.filter(a => a.id !== id);
  setLocal(STORAGE_KEYS.ADVANCES, filtered);
  return true;
};

// Helper: updates the usedAmount of an advance based on all expenses tagged with it
export const updateAdvanceUsage = async (advanceId) => {
  if (!advanceId) return;

  const allExpenses = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const matchingExpenses = allExpenses.filter(e => e.advanceId === advanceId);
  const totalUsed = matchingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, INITIAL_ADVANCES);
  const targetAdvance = localAdvances.find(a => a.id === advanceId);

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
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Remote getCategories failed, reading local:", e);
    }
  }
  return getLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
};

export const addCategory = async (catData) => {
  const newCat = {
    ...catData,
    id: catData.id || `CAT-${Date.now().toString().slice(-4)}`,
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "categories", newCat.id), newCat);
    } catch (e) {
      console.error("Remote addCategory failed:", e);
    }
  }

  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = [...localCategories, newCat];
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  return newCat;
};

export const updateCategory = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, "categories", id), updates);
    } catch (e) {
      console.error("Remote updateCategory failed:", e);
    }
  }
  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = localCategories.map(c => c.id === id ? { ...c, ...updates } : c);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  return updated.find(c => c.id === id);
};

export const deleteCategory = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (e) {
      console.error("Remote deleteCategory failed:", e);
    }
  }
  const localCategories = getLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const filtered = localCategories.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, filtered);
  return true;
};

// ==================== USERS & ROLES ====================
export const getUsers = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Remote getUsers failed, reading local:", e);
    }
  }
  return getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
};

export const saveUser = async (userData) => {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "users", userData.uid), userData, { merge: true });
    } catch (e) {
      console.error("Remote saveUser failed:", e);
    }
  }
  const localUsers = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
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
    try {
      await updateDoc(doc(db, "users", uid), { role });
    } catch (e) {
      console.error("Remote updateUserRole failed:", e);
    }
  }
  const localUsers = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  const updated = localUsers.map(u => u.uid === uid ? { ...u, role } : u);
  setLocal(STORAGE_KEYS.USERS, updated);
  return true;
};
