import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  initializeDataStore,
  getCases,
  addCase as dbAddCase,
  updateCase as dbUpdateCase,
  deleteCase as dbDeleteCase,
  getExpenses,
  addExpense as dbAddExpense,
  updateExpense as dbUpdateExpense,
  deleteExpense as dbDeleteExpense,
  getAdvances,
  addAdvance as dbAddAdvance,
  updateAdvance as dbUpdateAdvance,
  deleteAdvance as dbDeleteAdvance,
  subscribeAdvances,
  subscribeExpenses,
  getCategories,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  seedStandardCategories as dbSeedStandardCategories,
  getForums,
  addForum as dbAddForum,
  updateForum as dbUpdateForum,
  deleteForum as dbDeleteForum,
  seedStandardForums as dbSeedStandardForums,
  getSettings,
  updateSettings as dbUpdateSettings,
  getUsers,
  updateUserRole as dbUpdateUserRole,
  deleteUser as dbDeleteUser,
  deleteAllData as dbDeleteAllData,
  applyFaviconAndTitle
} from "../services/dataStore";
import { isFirebaseConfigured, getActiveFirebaseConfig } from "../services/firebase";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cases, setCases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forums, setForums] = useState([]);
  const [settings, setSettings] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Snackbar notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Refs to hold latest values for cross-reconciliation without triggering effect re-runs
  const expensesRef = useRef([]);
  const rawAdvancesRef = useRef([]);

  // Live Mathematical Reconciler: dynamically computes usedAmount and remaining balance
  // for all advances from actual verified expenses where paymentMode === "firm_advance"
  const computeReconciledAdvances = useCallback((rawAdvances, rawExpenses) => {
    if (!rawAdvances) return [];
    return rawAdvances.map((adv) => {
      const matchingExpenses = (rawExpenses || []).filter(
        (e) => e.advanceId === adv.id && (e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted))
      );
      const fromExpenses = matchingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const totalAllocated = Number(adv.amount || 0);
      const effectiveUsed = fromExpenses;
      const balance = Math.max(0, totalAllocated - effectiveUsed);
      return {
        ...adv,
        amount: totalAllocated,
        usedAmount: effectiveUsed,
        balance: balance,
        status: balance <= 0 ? "settled" : "active",
      };
    });
  }, []);

  // Sync refs whenever state updates
  useEffect(() => {
    expensesRef.current = expenses;
  }, [expenses]);

  useEffect(() => {
    rawAdvancesRef.current = advances;
  }, [advances]);

  // Fetch all collections
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await initializeDataStore();
      const [fetchedCases, fetchedExpenses, fetchedAdvances, fetchedCategories, fetchedForums, fetchedSettings, fetchedUsers] = await Promise.all([
        getCases(),
        getExpenses(),
        getAdvances(),
        getCategories(),
        getForums(),
        getSettings(),
        getUsers()
      ]);

      expensesRef.current = fetchedExpenses;
      rawAdvancesRef.current = fetchedAdvances;
      const reconciledAdvances = computeReconciledAdvances(fetchedAdvances, fetchedExpenses);

      setCases(fetchedCases);
      setExpenses(fetchedExpenses);
      setAdvances(reconciledAdvances);
      setCategories(fetchedCategories);
      setForums(fetchedForums);
      setSettings(fetchedSettings);
      setUsers(fetchedUsers);
      applyFaviconAndTitle(fetchedSettings);
    } catch (err) {
      console.error("Error refreshing data:", err);
      showNotification("Error loading data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [computeReconciledAdvances]);

  // Initial load & whenever auth user state changes (e.g. login, token restore, role change)
  useEffect(() => {
    refreshData();
  }, [currentUser?.uid, currentUser?.role, refreshData]);

  // Window Focus Auto-Sync: throttled to at most once per 60 seconds
  useEffect(() => {
    let lastSync = Date.now();
    const handleFocus = () => {
      if (Date.now() - lastSync > 60000) {
        lastSync = Date.now();
        refreshData();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshData]);

  // Real-time Firestore subscriptions for live synchronization of expenses and advances
  // ONLY runs once per user session. Uses stable refs to prevent re-subscription loops.
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isSubscribed = true;

    const unsubAdvances = subscribeAdvances((updatedAdvances) => {
      if (!isSubscribed || !updatedAdvances) return;
      rawAdvancesRef.current = updatedAdvances;
      const reconciled = computeReconciledAdvances(updatedAdvances, expensesRef.current);
      setAdvances(reconciled);
    });

    const unsubExpenses = subscribeExpenses((updatedExpenses) => {
      if (!isSubscribed || !updatedExpenses) return;
      expensesRef.current = updatedExpenses;
      setExpenses(updatedExpenses);
      setAdvances((prev) => computeReconciledAdvances(rawAdvancesRef.current.length > 0 ? rawAdvancesRef.current : prev, updatedExpenses));
    });

    return () => {
      isSubscribed = false;
      if (typeof unsubAdvances === "function") unsubAdvances();
      if (typeof unsubExpenses === "function") unsubExpenses();
    };
  }, [currentUser?.uid, computeReconciledAdvances]);

  // ==================== EXPENSE HANDLERS ====================
  const handleAddExpense = async (data) => {
    try {
      const added = await dbAddExpense(data);
      await refreshData();
      showNotification("Expense successfully recorded!", "success");
      return added;
    } catch (e) {
      showNotification("Failed to add expense: " + e.message, "error");
      throw e;
    }
  };

  const handleUpdateExpense = async (id, data) => {
    try {
      const updated = await dbUpdateExpense(id, data);
      await refreshData();
      showNotification("Expense updated successfully!", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to update expense: " + e.message, "error");
      throw e;
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await dbDeleteExpense(id);
      await refreshData();
      showNotification("Expense record deleted.", "info");
    } catch (e) {
      showNotification("Failed to delete expense: " + e.message, "error");
    }
  };

  // ==================== ADVANCE HANDLERS ====================
  const handleAddAdvance = async (data) => {
    try {
      const added = await dbAddAdvance(data);
      await refreshData();
      showNotification("Advance allocated successfully!", "success");
      return added;
    } catch (e) {
      showNotification("Failed to disburse advance: " + e.message, "error");
      throw e;
    }
  };

  const handleUpdateAdvance = async (id, data) => {
    try {
      const updated = await dbUpdateAdvance(id, data);
      await refreshData();
      showNotification("Advance updated.", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to update advance: " + e.message, "error");
    }
  };

  const handleDeleteAdvance = async (id) => {
    try {
      await dbDeleteAdvance(id);
      await refreshData();
      showNotification("Advance record removed.", "info");
    } catch (e) {
      showNotification("Failed to delete advance: " + e.message, "error");
    }
  };

  // ==================== CASE HANDLERS ====================
  const handleAddCase = async (data) => {
    try {
      const added = await dbAddCase(data);
      await refreshData();
      showNotification("Case successfully registered!", "success");
      return added;
    } catch (e) {
      showNotification("Failed to register case: " + e.message, "error");
      throw e;
    }
  };

  const handleUpdateCase = async (id, data) => {
    try {
      const updated = await dbUpdateCase(id, data);
      await refreshData();
      showNotification("Case details updated.", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to update case: " + e.message, "error");
    }
  };

  const handleDeleteCase = async (id) => {
    try {
      await dbDeleteCase(id);
      await refreshData();
      showNotification("Case archived / removed.", "info");
    } catch (e) {
      showNotification("Failed to delete case: " + e.message, "error");
    }
  };

  // ==================== CATEGORY HANDLERS ====================
  const handleAddCategory = async (data) => {
    try {
      const added = await dbAddCategory(data);
      await refreshData();
      showNotification("Expense category created.", "success");
      return added;
    } catch (e) {
      showNotification("Failed to create category: " + e.message, "error");
    }
  };

  const handleSeedStandardCategories = async () => {
    try {
      await dbSeedStandardCategories();
      await refreshData();
      showNotification("Standard legal & technical categories added to Firestore!", "success");
    } catch (e) {
      showNotification("Failed to seed categories: " + e.message, "error");
    }
  };

  const handleUpdateCategory = async (id, data) => {
    try {
      const updated = await dbUpdateCategory(id, data);
      await refreshData();
      showNotification("Category updated.", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to update category: " + e.message, "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await dbDeleteCategory(id);
      await refreshData();
      showNotification("Category removed.", "info");
    } catch (e) {
      showNotification("Failed to delete category: " + e.message, "error");
    }
  };

  const formatFirestoreError = (action, err) => {
    if (err?.code === "permission-denied" || err?.message?.includes("Missing or insufficient permissions")) {
      return `${action}: Permission Denied. Please paste the updated rules into Firebase Console > Firestore Database > Rules (copy from Tab 6 in Software Admin).`;
    }
    return `${action}: ${err?.message || "Operation failed."}`;
  };

  // ==================== FORUM / COURT HANDLERS ====================
  const handleAddForum = async (data) => {
    try {
      const added = await dbAddForum(data);
      await refreshData();
      showNotification("Court Forum registered.", "success");
      return added;
    } catch (e) {
      showNotification(formatFirestoreError("Failed to add forum", e), "error");
    }
  };

  const handleUpdateForum = async (id, data) => {
    try {
      const updated = await dbUpdateForum(id, data);
      await refreshData();
      showNotification("Court Forum updated.", "success");
      return updated;
    } catch (e) {
      showNotification(formatFirestoreError("Failed to update forum", e), "error");
    }
  };

  const handleDeleteForum = async (id) => {
    try {
      await dbDeleteForum(id);
      await refreshData();
      showNotification("Court Forum removed.", "info");
    } catch (e) {
      showNotification(formatFirestoreError("Failed to delete forum", e), "error");
    }
  };

  const handleSeedStandardForums = async () => {
    try {
      await dbSeedStandardForums();
      await refreshData();
      showNotification("Standard court forums populated in Firestore!", "success");
    } catch (e) {
      showNotification(formatFirestoreError("Failed to seed forums", e), "error");
    }
  };

  // ==================== SETTINGS & USERS ====================
  const handleSaveSettings = async (data) => {
    try {
      const updated = await dbUpdateSettings(data);
      setSettings(updated);
      applyFaviconAndTitle(updated);
      showNotification("Firm details, layout & favicon updated!", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to save settings: " + e.message, "error");
    }
  };

  const handleUpdateUserRole = async (uid, role) => {
    try {
      await dbUpdateUserRole(uid, role);
      await refreshData();
      showNotification("User role updated successfully.", "success");
    } catch (e) {
      showNotification("Failed to update user role: " + e.message, "error");
    }
  };

  const handleDeleteUser = async (uid, deleteAssociatedData, userName = "Staff member") => {
    try {
      await dbDeleteUser(uid, deleteAssociatedData);
      await refreshData();
      if (deleteAssociatedData) {
        showNotification(`${userName} and all associated expenses/advances have been permanently deleted.`, "info");
      } else {
        showNotification(`${userName} has been removed. All past expense/advance records preserved.`, "info");
      }
    } catch (e) {
      showNotification(formatFirestoreError("Failed to delete staff member", e), "error");
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await dbDeleteAllData();
      await refreshData();
      showNotification("All database records (cases, expenses, advances, categories, forums, and staff accounts) have been completely wiped.", "warning");
    } catch (e) {
      showNotification(formatFirestoreError("Failed to delete all data", e), "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        cases,
        expenses,
        advances,
        categories,
        forums,
        settings,
        users,
        loading,
        notification,
        showNotification,
        closeNotification,
        refreshData,
        isConfigured: isFirebaseConfigured(),
        firebaseConfig: getActiveFirebaseConfig(),
        // Expense actions
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        deleteExpense: handleDeleteExpense,
        // Advance actions
        addAdvance: handleAddAdvance,
        updateAdvance: handleUpdateAdvance,
        deleteAdvance: handleDeleteAdvance,
        // Case actions
        addCase: handleAddCase,
        updateCase: handleUpdateCase,
        deleteCase: handleDeleteCase,
        // Category actions
        addCategory: handleAddCategory,
        seedStandardCategories: handleSeedStandardCategories,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory,
        // Forum actions
        addForum: handleAddForum,
        updateForum: handleUpdateForum,
        deleteForum: handleDeleteForum,
        seedStandardForums: handleSeedStandardForums,
        // Settings & Users
        saveSettings: handleSaveSettings,
        updateUserRole: handleUpdateUserRole,
        deleteUser: handleDeleteUser,
        deleteAllData: handleDeleteAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
