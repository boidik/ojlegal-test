import React, { useState } from "react";
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
  const { currentUser, loading } = useAuth();
  const { notification, closeNotification } = useApp();

  // Tab state: "staff" | "accounts_admin" | "software_admin"
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === "software_admin") return "software_admin";
    if (currentUser?.role === "accounts_admin") return "accounts_admin";
    return "staff";
  });

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

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }}>
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Area with subtle professional transition */}
      <Box component="main" sx={{ pb: 8 }}>
        <AnimatePresence mode="wait">
          {activeTab === "staff" && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StaffExpensePage />
            </motion.div>
          )}

          {activeTab === "accounts_admin" && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AccountsAdminPage />
            </motion.div>
          )}

          {activeTab === "software_admin" && (
            <motion.div
              key="software"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SoftwareAdminPage />
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
