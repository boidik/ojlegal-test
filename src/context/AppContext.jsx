import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  applyFaviconAndTitle
} from "../services/dataStore";
import { isFirebaseConfigured, getActiveFirebaseConfig } from "../services/firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

      setCases(fetchedCases);
      setExpenses(fetchedExpenses);
      setAdvances(fetchedAdvances);
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
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

  // ==================== FORUM / COURT HANDLERS ====================
  const handleAddForum = async (data) => {
    try {
      const added = await dbAddForum(data);
      await refreshData();
      showNotification("Court Forum registered.", "success");
      return added;
    } catch (e) {
      showNotification("Failed to add forum: " + e.message, "error");
    }
  };

  const handleUpdateForum = async (id, data) => {
    try {
      const updated = await dbUpdateForum(id, data);
      await refreshData();
      showNotification("Court Forum updated.", "success");
      return updated;
    } catch (e) {
      showNotification("Failed to update forum: " + e.message, "error");
    }
  };

  const handleDeleteForum = async (id) => {
    try {
      await dbDeleteForum(id);
      await refreshData();
      showNotification("Court Forum removed.", "info");
    } catch (e) {
      showNotification("Failed to delete forum: " + e.message, "error");
    }
  };

  const handleSeedStandardForums = async () => {
    try {
      await dbSeedStandardForums();
      await refreshData();
      showNotification("Standard court forums populated in Firestore!", "success");
    } catch (e) {
      showNotification("Failed to seed forums: " + e.message, "error");
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
