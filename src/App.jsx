import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
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

  // Initialize activeTab directly based on user's role:
  // Software Admin -> "software_admin"
  // Accounts Admin (Boss) -> "accounts_admin"
  // Staff Member -> "staff"
  const [activeTab, setActiveTab] = useState("staff");

  // Whenever currentUser or their role changes, automatically direct them to their designated console
  useEffect(() => {
    if (currentUser?.role) {
      if (currentUser.role === "software_admin") {
        setActiveTab("software_admin");
      } else if (currentUser.role === "accounts_admin") {
        setActiveTab("accounts_admin");
      } else {
        setActiveTab("staff");
      }
    }
  }, [currentUser?.role, currentUser?.uid]);

  // Authorization Guard: Prevent staff or boss from accessing unauthorized tabs
  useEffect(() => {
    if (currentUser?.role) {
      if (currentUser.role === "staff" && activeTab !== "staff") {
        setActiveTab("staff");
      }
      if (currentUser.role === "accounts_admin" && activeTab === "software_admin") {
        setActiveTab("accounts_admin");
      }
    }
  }, [activeTab, currentUser?.role]);

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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }}>
      {/* Top Navbar with role-specific views */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Area */}
      <Box component="main" sx={{ pb: 8 }}>
        <AnimatePresence mode="wait">
          {activeTab === "software_admin" && isSoftwareAdmin && (
            <motion.div
              key="software"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SoftwareAdminPage />
            </motion.div>
          )}

          {activeTab === "accounts_admin" && (isAccountsAdmin || isSoftwareAdmin) && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AccountsAdminPage />
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StaffExpensePage />
            </motion.div>
          )}
        </AnimatePresence>
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
