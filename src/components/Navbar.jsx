import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import RoleBadge from "./RoleBadge";
import FirebaseConfigDialog from "./FirebaseConfigDialog";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useAppTheme } from "../context/ThemeContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, logout, switchDemoRole, isSoftwareAdmin, isAccountsAdmin } = useAuth();
  const { settings, isConfigured } = useApp();
  const { mode, toggleColorMode } = useAppTheme();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSwitch, setAnchorElSwitch] = useState(null);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenSwitchMenu = (event) => setAnchorElSwitch(event.currentTarget);
  const handleCloseSwitchMenu = () => setAnchorElSwitch(null);

  const handleSwitch = (role) => {
    switchDemoRole(role);
    handleCloseSwitchMenu();
    if (role === "software_admin") setActiveTab("software_admin");
    else if (role === "accounts_admin") setActiveTab("accounts_admin");
    else setActiveTab("staff");
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: mode === "light" ? "#0f2942" : "#0c1726",
          borderBottom: "1px solid",
          borderColor: mode === "light" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 0.5, flexWrap: "wrap", gap: 1 }}>
          {/* Brand & Law Firm Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "#c99738",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(201, 151, 56, 0.4)",
              }}
            >
              <GavelIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  lineHeight: 1.2,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                {settings.firmName || "LexVeritas & Partners"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block", fontSize: "0.72rem" }}>
                {settings.tagline || "Litigation & Expense Float Management"}
              </Typography>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              startIcon={<AccountBalanceWalletIcon />}
              onClick={() => setActiveTab("staff")}
              sx={{
                color: activeTab === "staff" ? "#ffffff" : "rgba(255,255,255,0.7)",
                backgroundColor: activeTab === "staff" ? "rgba(255,255,255,0.15)" : "transparent",
                borderRadius: 2,
                px: 2,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              Staff Expenses
            </Button>

            {(isAccountsAdmin || isSoftwareAdmin) && (
              <Button
                startIcon={<AssessmentIcon />}
                onClick={() => setActiveTab("accounts_admin")}
                sx={{
                  color: activeTab === "accounts_admin" ? "#ffffff" : "rgba(255,255,255,0.7)",
                  backgroundColor: activeTab === "accounts_admin" ? "rgba(255,255,255,0.15)" : "transparent",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                Accounts Admin (Boss)
              </Button>
            )}

            {isSoftwareAdmin && (
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => setActiveTab("software_admin")}
                sx={{
                  color: activeTab === "software_admin" ? "#ffffff" : "rgba(255,255,255,0.7)",
                  backgroundColor: activeTab === "software_admin" ? "rgba(255,255,255,0.15)" : "transparent",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                Software Admin
              </Button>
            )}
          </Box>

          {/* Right Action Items: Database Status, Role Switcher, Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Database Status Chip */}
            <Tooltip title="Click to view or connect your Google Cloud Firestore keys">
              <Chip
                icon={isConfigured ? <CloudDoneIcon sx={{ fontSize: "16px !important", color: "#4ade80 !important" }} /> : <CloudOffIcon sx={{ fontSize: "16px !important", color: "#38bdf8 !important" }} />}
                label={isConfigured ? "Firestore Live" : "Local Preview"}
                size="small"
                onClick={() => setOpenConfigDialog(true)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                }}
              />
            </Tooltip>

            {/* Quick Switch Role (For fast user testing) */}
            <Tooltip title="Quickly switch view between Staff, Boss (Accounts Admin), and Software Admin">
              <Button
                size="small"
                startIcon={<SwapHorizIcon />}
                onClick={handleOpenSwitchMenu}
                sx={{
                  backgroundColor: "rgba(201, 151, 56, 0.25)",
                  color: "#fcd34d",
                  border: "1px solid rgba(201, 151, 56, 0.4)",
                  fontSize: "0.75rem",
                  py: 0.4,
                  "&:hover": { backgroundColor: "rgba(201, 151, 56, 0.4)" },
                }}
              >
                Switch Role
              </Button>
            </Tooltip>
            <Menu
              anchorEl={anchorElSwitch}
              open={Boolean(anchorElSwitch)}
              onClose={handleCloseSwitchMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={() => handleSwitch("software_admin")}>
                <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: "#7c3aed" }} /></ListItemIcon>
                <ListItemText primary="Software Admin (You)" secondary="Full master control over cases, categories, users, setup" />
              </MenuItem>
              <MenuItem onClick={() => handleSwitch("accounts_admin")}>
                <ListItemIcon><AssessmentIcon fontSize="small" sx={{ color: "#0284c7" }} /></ListItemIcon>
                <ListItemText primary="Accounts Admin (Boss)" secondary="Audit all expenses, track advances, export PDF/Excel" />
              </MenuItem>
              <MenuItem onClick={() => handleSwitch("staff")}>
                <ListItemIcon><AccountBalanceWalletIcon fontSize="small" sx={{ color: "#16a34a" }} /></ListItemIcon>
                <ListItemText primary="Legal Staff Member" secondary="Submit expenses, view assigned cases, track my advances" />
              </MenuItem>
            </Menu>

            {/* Light/Dark Toggle */}
            <IconButton onClick={toggleColorMode} sx={{ color: "rgba(255,255,255,0.8)" }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* User Profile */}
            <Box
              onClick={handleOpenUserMenu}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                p: 0.5,
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#c99738",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: 600, lineHeight: 1.1 }}>
                  {currentUser?.displayName || "User"}
                </Typography>
                <RoleBadge role={currentUser?.role} size="small" />
              </Box>
            </Box>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {currentUser?.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <RoleBadge role={currentUser?.role} />
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleCloseUserMenu(); setOpenConfigDialog(true); }}>
                <ListItemIcon><CloudDoneIcon fontSize="small" /></ListItemIcon>
                Firestore Settings
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <Typography color="error">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Firebase Configuration Dialog */}
      <FirebaseConfigDialog open={openConfigDialog} onClose={() => setOpenConfigDialog(false)} />
    </>
  );
}
