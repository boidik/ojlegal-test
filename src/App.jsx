import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import StaffExpensePage from "./pages/StaffExpensePage";
import AccountsAdminPage from "./pages/AccountsAdminPage";
import SoftwareAdminPage from "./pages/SoftwareAdminPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import { useApp } from "./context/AppContext";

export default function App() {
  const { currentUser, loading, isSoftwareAdmin, isAccountsAdmin, isStaff } = useAuth();
  const { notification, closeNotification } = useApp();

  // Initialize activeTab with session persistence so page refreshes don't lose the user's active view
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("oj_active_tab") || "staff";
  });

  const handleTabChange = (newTab) => {
    sessionStorage.setItem("oj_active_tab", newTab);
    setActiveTab(newTab);
  };

  // On auth state restoration, ensure the user is defaulted to an authorized view if their saved tab is not allowed
  useEffect(() => {
    if (currentUser?.role) {
      const saved = sessionStorage.getItem("oj_active_tab");
      if (!saved) {
        if (currentUser.role === "software_admin") {
          handleTabChange("software_admin");
        } else if (currentUser.role === "accounts_admin") {
          handleTabChange("accounts_admin");
        } else {
          handleTabChange("staff");
        }
      } else {
        if (currentUser.role === "staff" && saved !== "staff") {
          handleTabChange("staff");
        } else if (currentUser.role === "accounts_admin" && saved === "software_admin") {
          handleTabChange("accounts_admin");
        }
      }
    }
  }, [currentUser?.role, currentUser?.uid]);

  // Synchronously compute the effective authorized tab so there is NEVER a blank frame during state transition
  let effectiveTab = activeTab;
  if (currentUser?.role === "staff") {
    effectiveTab = "staff";
  } else if (currentUser?.role === "accounts_admin" && activeTab === "software_admin") {
    effectiveTab = "accounts_admin";
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#081320",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // If no user is authenticated, strictly display the Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Render authorized page with guaranteed fallback to prevent blank screens
  const renderCurrentPage = () => {
    if (effectiveTab === "software_admin" && isSoftwareAdmin) {
      return <SoftwareAdminPage />;
    }
    if (effectiveTab === "accounts_admin" && (isAccountsAdmin || isSoftwareAdmin)) {
      return <AccountsAdminPage />;
    }
    return <StaffExpensePage />;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }}>
      {/* Top Navbar with role-specific views */}
      <Navbar activeTab={effectiveTab} setActiveTab={handleTabChange} />

      {/* Main Page Area with instant, smooth transition (no blocking wait state) */}
      <Box component="main" sx={{ pb: 8 }}>
        <motion.div
          key={effectiveTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {renderCurrentPage()}
        </motion.div>
      </Box>

      {/* Global Notification Toast */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: "100%", boxShadow: 3 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
