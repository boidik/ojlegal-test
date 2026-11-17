import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BalanceIcon from "@mui/icons-material/Balance";
import ShieldIcon from "@mui/icons-material/Shield";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import RoleBadge from "./RoleBadge";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useAppTheme } from "../context/ThemeContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, logout, isSoftwareAdmin, isAccountsAdmin } = useAuth();
  const { settings } = useApp();
  const { mode, toggleColorMode } = useAppTheme();

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // Render configured icon or logo image
  const renderNavbarIcon = () => {
    if (settings.customLogoUrl) {
      return (
        <Box
          component="img"
          src={settings.customLogoUrl}
          alt={settings.firmName || "Firm Logo"}
          sx={{ maxHeight: 38, maxWidth: 44, objectFit: "contain", borderRadius: 1.5 }}
        />
      );
    }

    const iconType = settings.navbarIconType || "gavel";
    let IconComponent = GavelIcon;
    if (iconType === "scales") IconComponent = BalanceIcon;
    else if (iconType === "pillar") IconComponent = AccountBalanceIcon;
    else if (iconType === "shield") IconComponent = ShieldIcon;

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: settings.headerAccentColor || "#c99738",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          boxShadow: `0 2px 8px ${settings.headerAccentColor || "#c99738"}60`,
        }}
      >
        <IconComponent sx={{ fontSize: 22 }} />
      </Box>
    );
  };

  const headerBg = mode === "light" 
    ? (settings.headerBgColor || "#0f2942") 
    : "#0c1726";
  const headerText = settings.headerTextColor || "#ffffff";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: headerBg,
        color: headerText,
        borderBottom: "1px solid",
        borderColor: "rgba(255,255,255,0.1)",
        transition: "background-color 0.3s ease",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 0.8, flexWrap: "wrap", gap: 1 }}>
        {/* Brand & Law Firm Name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {renderNavbarIcon()}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.01em",
                color: headerText,
                lineHeight: 1.2,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              {settings.navbarTitle || settings.firmName || "OJ Legal Advocates"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block", fontSize: "0.72rem" }}>
              {settings.tagline || "Litigation & Expense Float Management"}
            </Typography>
          </Box>
        </Box>

        {/* Navigation Tabs - STRICTLY FILTERED BY ROLE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Staff Expenses - Available to staff and admins */}
          <Button
            startIcon={<AccountBalanceWalletIcon />}
            onClick={() => setActiveTab("staff")}
            sx={{
              color: activeTab === "staff" ? "#ffffff" : "rgba(255,255,255,0.75)",
              backgroundColor: activeTab === "staff" ? "rgba(255,255,255,0.18)" : "transparent",
              borderRadius: 2,
              px: 2,
              fontWeight: 600,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            Staff Expenses
          </Button>

          {/* Accounts Admin (Boss) - ONLY visible to Boss and Software Admin */}
          {(isAccountsAdmin || isSoftwareAdmin) && (
            <Button
              startIcon={<AssessmentIcon />}
              onClick={() => setActiveTab("accounts_admin")}
              sx={{
                color: activeTab === "accounts_admin" ? "#ffffff" : "rgba(255,255,255,0.75)",
                backgroundColor: activeTab === "accounts_admin" ? "rgba(255,255,255,0.18)" : "transparent",
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
              }}
            >
              Accounts Admin (Boss)
            </Button>
          )}

          {/* Software Admin - ONLY visible to Software Admin */}
          {isSoftwareAdmin && (
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setActiveTab("software_admin")}
              sx={{
                color: activeTab === "software_admin" ? "#ffffff" : "rgba(255,255,255,0.75)",
                backgroundColor: activeTab === "software_admin" ? "rgba(255,255,255,0.18)" : "transparent",
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
              }}
            >
              Software Admin
            </Button>
          )}
        </Box>

        {/* Right Action Items: Profile & Sign Out */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Light/Dark Toggle */}
          <IconButton onClick={toggleColorMode} sx={{ color: "rgba(255,255,255,0.85)" }}>
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
              "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                backgroundColor: settings.headerAccentColor || "#c99738",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: headerText, fontWeight: 600, lineHeight: 1.1 }}>
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
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
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
            <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <Typography color="error" fontWeight={600}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
