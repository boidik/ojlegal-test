import { 
  db, 
  auth,
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
  where,
  onSnapshot,
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
        const merged = { ...INITIAL_SETTINGS, ...data };
        setLocal(STORAGE_KEYS.SETTINGS, merged);
        applyFaviconAndTitle(merged);
        return merged;
      }
    } catch (e) {
      console.warn("Remote getSettings failed, using local fallback", e);
    }
  }
  const s = getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  const merged = { ...INITIAL_SETTINGS, ...s };
  applyFaviconAndTitle(merged);
  return merged;
};

export const updateSettings = async (newSettings) => {
  const current = await getSettings();
  const merged = { ...INITIAL_SETTINGS, ...current, ...newSettings };
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
      if (list.length > 0) {
        setLocal(STORAGE_KEYS.EXPENSES, list);
      }
    } catch (e) {
      console.warn("Remote getExpenses with orderBy failed, falling back to simple query:", e);
      try {
        const qSimple = query(collection(db, "expenses"));
        const snapshot = await getDocs(qSimple);
        list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        if (list.length > 0) {
          setLocal(STORAGE_KEYS.EXPENSES, list);
        }
      } catch (e2) {
        console.warn("Simple query also failed:", e2);
      }
    }
  }

  if (list.length === 0) {
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

// Real-time Firestore subscription for live expense vouchers
export const subscribeExpenses = (callback) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const q = query(collection(db, "expenses"));
    return onSnapshot(
      q,
      (snapshot) => {
        const expensesList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        expensesList.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));
        callback(expensesList);
      },
      (err) => {
        console.warn("Real-time expenses collection snapshot listener failed:", err);
      }
    );
  } catch (e) {
    console.warn("subscribeExpenses error:", e);
    return () => {};
  }
};

export const addExpense = async (expenseData) => {
  const isAdvance = expenseData.paymentMode === "firm_advance" || Boolean(expenseData.advanceDeducted);
  const newExpense = {
    ...expenseData,
    id: expenseData.id || `EXP-${Date.now().toString().slice(-6)}`,
    amount: Number(expenseData.amount) || 0,
    paymentMode: expenseData.paymentMode || "cash",
    advanceDeducted: isAdvance,
    advanceId: isAdvance ? (expenseData.advanceId || null) : null,
    status: expenseData.status || "approved",
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "expenses", newExpense.id), newExpense);
  }

  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  const updatedExpenses = [newExpense, ...localExpenses.filter(e => e.id !== newExpense.id)];
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  if (newExpense.advanceId && isAdvance) {
    await updateAdvanceUsage(newExpense.advanceId);
  }

  return newExpense;
};

export const updateExpense = async (id, updates) => {
  const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
  const existing = localExpenses.find(e => e.id === id);

  const effectiveMode = updates.paymentMode !== undefined ? updates.paymentMode : (existing?.paymentMode || "cash");
  const isAdvance = effectiveMode === "firm_advance";

  const sanitizedUpdates = {
    ...updates,
    ...(updates.amount !== undefined ? { amount: Number(updates.amount) } : {}),
    paymentMode: effectiveMode,
    advanceDeducted: isAdvance,
    advanceId: isAdvance ? (updates.advanceId !== undefined ? updates.advanceId : existing?.advanceId) : null,
  };

  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "expenses", id), sanitizedUpdates);
  }

  const updatedExpenses = localExpenses.map(e => e.id === id ? { ...e, ...sanitizedUpdates } : e);
  setLocal(STORAGE_KEYS.EXPENSES, updatedExpenses);

  // If advance link changed or payment mode changed away from advance, update old advance
  if (existing && existing.advanceId && (existing.advanceId !== sanitizedUpdates.advanceId || !isAdvance)) {
    await updateAdvanceUsage(existing.advanceId);
  }
  // Update new advance
  if (sanitizedUpdates.advanceId && isAdvance) {
    await updateAdvanceUsage(sanitizedUpdates.advanceId);
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

  if (target && target.advanceId && (target.paymentMode === "firm_advance" || target.advanceDeducted)) {
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
      // Step 1: Attempt to read all advances (succeeds for accounts_admin and software_admin)
      let snapshot;
      try {
        const q = query(collection(db, "advances"), orderBy("disbursedDate", "desc"));
        snapshot = await getDocs(q);
      } catch (sortErr) {
        snapshot = await getDocs(collection(db, "advances"));
      }
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (permErr) {
      console.warn("Collection-level advances query blocked by permissions; initiating targeted associate queries...", permErr);
      
      // Step 2: Targeted query for staff associate.
      // Firestore security rules that check `resource.data.staffId == request.auth.uid`
      // ALWAYS permit queries filtered by `where("staffId", "==", auth.currentUser.uid)`.
      try {
        const currentUser = auth?.currentUser;
        if (currentUser) {
          const docMap = new Map();

          // A: Query by UID
          try {
            const qUid = query(collection(db, "advances"), where("staffId", "==", currentUser.uid));
            const sUid = await getDocs(qUid);
            sUid.docs.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
          } catch (eA) {
            console.warn("Targeted UID advance query failed:", eA);
          }

          // B: Query by Email
          if (currentUser.email) {
            try {
              const qEmail = query(collection(db, "advances"), where("staffEmail", "==", currentUser.email));
              const sEmail = await getDocs(qEmail);
              sEmail.docs.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
            } catch (eB) {
              console.warn("Targeted Email advance query failed:", eB);
            }

            try {
              const qEmailLower = query(collection(db, "advances"), where("staffEmail", "==", currentUser.email.toLowerCase()));
              const sEmailLower = await getDocs(qEmailLower);
              sEmailLower.docs.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
            } catch (eBLower) {}

            try {
              const qStaffIdEmail = query(collection(db, "advances"), where("staffId", "==", currentUser.email));
              const sStaffIdEmail = await getDocs(qStaffIdEmail);
              sStaffIdEmail.docs.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
            } catch (eBStaffId) {}
          }

          // C: Query by Display Name
          if (currentUser.displayName) {
            try {
              const qName = query(collection(db, "advances"), where("staffName", "==", currentUser.displayName));
              const sName = await getDocs(qName);
              sName.docs.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
            } catch (eC) {
              console.warn("Targeted Name advance query failed:", eC);
            }
          }

          list = Array.from(docMap.values());
        }
      } catch (targetedErr) {
        console.warn("All targeted advance queries failed:", targetedErr);
      }
    }
  }

  // Step 3: Local storage synchronization and fallback
  if (list.length === 0) {
    const local = getLocal(STORAGE_KEYS.ADVANCES, []);
    if (local && local.length > 0) {
      list = local;
    }
  } else {
    // Keep local cache up to date
    try {
      const local = getLocal(STORAGE_KEYS.ADVANCES, []);
      const mergedMap = new Map();
      local.forEach(item => mergedMap.set(item.id, item));
      list.forEach(item => mergedMap.set(item.id, item));
      setLocal(STORAGE_KEYS.ADVANCES, Array.from(mergedMap.values()));
    } catch (e) {}
  }

  // Sort by disbursedDate descending
  list.sort((a, b) => (b.disbursedDate || "").localeCompare(a.disbursedDate || ""));

  if (staffId && staffId !== "ALL") {
    const s = String(staffId).trim().toLowerCase();
    list = list.filter(a =>
      String(a.staffId || "").trim().toLowerCase() === s ||
      String(a.staffEmail || "").trim().toLowerCase() === s
    );
  }

  return list;
};

// Real-time Firestore subscription for advances
export const subscribeAdvances = (callback) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const q = query(collection(db, "advances"));
    return onSnapshot(
      q,
      (snapshot) => {
        const advancesList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        advancesList.sort((a, b) => (b.disbursedDate || "").localeCompare(a.disbursedDate || ""));
        callback(advancesList);
      },
      (err) => {
        console.warn("Real-time advances collection snapshot listener blocked; falling back to targeted listener:", err);
        const currentUser = auth?.currentUser;
        if (currentUser) {
          const qTarget = query(collection(db, "advances"), where("staffId", "==", currentUser.uid));
          return onSnapshot(
            qTarget,
            (s) => {
              const userAdvances = s.docs.map(d => ({ id: d.id, ...d.data() }));
              userAdvances.sort((a, b) => (b.disbursedDate || "").localeCompare(a.disbursedDate || ""));
              callback(userAdvances);
            },
            (e) => console.warn("Targeted snapshot listener error:", e)
          );
        }
      }
    );
  } catch (e) {
    console.warn("subscribeAdvances initialization failed:", e);
    return () => {};
  }
};

export const addAdvance = async (advanceData) => {
  const newAdvance = {
    ...advanceData,
    id: advanceData.id || `ADV-${Date.now().toString().slice(-5)}`,
    staffId: String(advanceData.staffId || "").trim(),
    staffEmail: String(advanceData.staffEmail || "").trim().toLowerCase(),
    staffName: String(advanceData.staffName || "").trim(),
    amount: Number(advanceData.amount) || 0,
    usedAmount: Number(advanceData.usedAmount) || 0,
    status: advanceData.status || "active",
    disbursedDate: advanceData.disbursedDate || new Date().toISOString().split("T")[0],
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, "advances", newAdvance.id), newAdvance);
  }

  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
  const updated = [newAdvance, ...localAdvances.filter(a => a.id !== newAdvance.id)];
  setLocal(STORAGE_KEYS.ADVANCES, updated);
  return newAdvance;
};

export const updateAdvance = async (id, updates) => {
  const sanitizedUpdates = {
    ...updates,
    ...(updates.amount !== undefined ? { amount: Number(updates.amount) } : {}),
    ...(updates.staffEmail ? { staffEmail: String(updates.staffEmail).trim().toLowerCase() } : {}),
    ...(updates.staffId ? { staffId: String(updates.staffId).trim() } : {}),
    ...(updates.staffName ? { staffName: String(updates.staffName).trim() } : {}),
  };

  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, "advances", id), sanitizedUpdates);
  }
  const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
  const updated = localAdvances.map(a => a.id === id ? { ...a, ...sanitizedUpdates } : a);
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

  const matchingExpenses = allExpenses.filter(e => 
    e.advanceId === advanceId && (e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted))
  );
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
    const totalAllocated = Number(targetAdvance.amount || 0);
    const balance = Math.max(0, totalAllocated - totalUsed);
    const isSettled = balance <= 0 || totalUsed >= totalAllocated;
    const updates = {
      usedAmount: totalUsed,
      balance: balance,
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

export const deleteUser = async (uid, deleteAssociatedData = false) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (e) {
      console.warn("Remote delete user failed:", e);
    }

    if (deleteAssociatedData) {
      // Delete expenses recorded by this user
      try {
        const expSnap = await getDocs(collection(db, "expenses"));
        for (const d of expSnap.docs) {
          const data = d.data();
          if (data.staffId === uid) {
            await deleteDoc(d.ref);
          }
        }
      } catch (err) {
        console.warn("Remote delete associated expenses failed:", err);
      }

      // Delete advances disbursed to this user
      try {
        const advSnap = await getDocs(collection(db, "advances"));
        for (const d of advSnap.docs) {
          const data = d.data();
          if (data.staffId === uid) {
            await deleteDoc(d.ref);
          }
        }
      } catch (err) {
        console.warn("Remote delete associated advances failed:", err);
      }
    }
  }

  // Update Local Storage
  const localUsers = getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
  const updatedUsers = localUsers.filter(u => u.uid !== uid);
  setLocal(STORAGE_KEYS.USERS, updatedUsers);

  if (deleteAssociatedData) {
    const localExpenses = getLocal(STORAGE_KEYS.EXPENSES, []);
    setLocal(STORAGE_KEYS.EXPENSES, localExpenses.filter(e => e.staffId !== uid));

    const localAdvances = getLocal(STORAGE_KEYS.ADVANCES, []);
    setLocal(STORAGE_KEYS.ADVANCES, localAdvances.filter(a => a.staffId !== uid));
  }

  return true;
};

export const deleteAllData = async (preserveAdminEmail = "advocate@boidikghosh.in") => {
  if (isFirebaseConfigured() && db) {
    // 1. Delete all expenses
    try {
      const expSnap = await getDocs(collection(db, "expenses"));
      for (const d of expSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn("Error wiping expenses:", e);
    }

    // 2. Delete all advances
    try {
      const advSnap = await getDocs(collection(db, "advances"));
      for (const d of advSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn("Error wiping advances:", e);
    }

    // 3. Delete all cases
    try {
      const caseSnap = await getDocs(collection(db, "cases"));
      for (const d of caseSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn("Error wiping cases:", e);
    }

    // 4. Delete all categories
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      for (const d of catSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn("Error wiping categories:", e);
    }

    // 5. Delete all forums
    try {
      const forumSnap = await getDocs(collection(db, "forums"));
      for (const d of forumSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn("Error wiping forums:", e);
    }

    // 6. Delete all users except primary master admin
    try {
      const userSnap = await getDocs(collection(db, "users"));
      for (const d of userSnap.docs) {
        const uData = d.data();
        if ((uData.email || "").toLowerCase() !== preserveAdminEmail.toLowerCase()) {
          await deleteDoc(d.ref);
        }
      }
    } catch (e) {
      console.warn("Error wiping users:", e);
    }

    // 7. Reset system settings to initial default
    try {
      await setDoc(doc(db, "system", "firm_settings"), INITIAL_SETTINGS);
    } catch (e) {
      console.warn("Error resetting system settings:", e);
    }
  }

  // Clear LocalStorage
  setLocal(STORAGE_KEYS.EXPENSES, []);
  setLocal(STORAGE_KEYS.ADVANCES, []);
  setLocal(STORAGE_KEYS.CASES, []);
  setLocal(STORAGE_KEYS.CATEGORIES, []);
  setLocal(STORAGE_KEYS.FORUMS, []);
  
  const localUsers = getLocal(STORAGE_KEYS.USERS, OFFLINE_DEMO_USERS);
  const filteredUsers = localUsers.filter(u => (u.email || "").toLowerCase() === preserveAdminEmail.toLowerCase());
  setLocal(STORAGE_KEYS.USERS, filteredUsers);

  setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  applyFaviconAndTitle(INITIAL_SETTINGS);

  return true;
};
