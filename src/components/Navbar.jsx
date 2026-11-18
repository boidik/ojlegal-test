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
  const renderNavbarIcon = (size = 38) => {
    if (settings.customLogoUrl) {
      return (
        <Box
          component="img"
          src={settings.customLogoUrl}
          alt={settings.firmName || "Firm Logo"}
          sx={{ maxHeight: size, maxWidth: size + 6, objectFit: "contain", borderRadius: 1.5 }}
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
          width: size,
          height: size,
          borderRadius: 2,
          backgroundColor: settings.headerAccentColor || "#c99738",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          boxShadow: `0 2px 8px ${settings.headerAccentColor || "#c99738"}60`,
          flexShrink: 0,
        }}
      >
        <IconComponent sx={{ fontSize: size * 0.55 }} />
      </Box>
    );
  };

  const headerBg = settings.headerBgColor || (mode === "light" ? "#0f2942" : "#0c1726");
  const headerText = settings.headerTextColor || "#ffffff";
  const headerAccent = settings.headerAccentColor || "#c99738";

  // Tab definitions
  const tabsList = [];
  if (isSoftwareAdmin) {
    tabsList.push({
      id: "software_admin",
      label: "Software Admin",
      mobileLabel: "Admin",
      icon: <SettingsIcon sx={{ fontSize: { xs: 18, md: 20 } }} />,
    });
  }
  if (isAccountsAdmin || isSoftwareAdmin) {
    tabsList.push({
      id: "accounts_admin",
      label: "Accounts Admin (Boss)",
      mobileLabel: "Boss",
      icon: <AssessmentIcon sx={{ fontSize: { xs: 18, md: 20 } }} />,
    });
  }
  tabsList.push({
    id: "staff",
    label: "Staff Expenses",
    mobileLabel: "Staff",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: { xs: 18, md: 20 } }} />,
  });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: headerBg,
          color: headerText,
          borderBottom: "1px solid",
          borderColor: "rgba(255,255,255,0.12)",
          transition: "background-color 0.3s ease",
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 0.8, md: 1 },
            minHeight: { xs: 58, md: 64 },
          }}
        >
          {/* Brand & Law Firm Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            {renderNavbarIcon(36)}
            <Box sx={{ minWidth: 0, overflow: "hidden" }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  color: headerText,
                  lineHeight: 1.2,
                  fontSize: { xs: "0.92rem", sm: "1.05rem" },
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                {settings.navbarTitle || settings.firmName || "OJ Legal Advocates"}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  display: { xs: "none", sm: "block" },
                  fontSize: "0.72rem",
                  lineHeight: 1.2,
                }}
              >
                {settings.tagline || "Expense Disbursement & Staff Float Management"}
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Tabs (Hidden on mobile/tablet down to 'md') */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.2,
            }}
          >
            {tabsList.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <Button
                  key={t.id}
                  startIcon={t.icon}
                  onClick={() => setActiveTab(t.id)}
                  sx={{
                    color: isActive ? (mode === "light" ? headerBg : "#ffffff") : "rgba(255,255,255,0.88)",
                    backgroundColor: isActive ? (mode === "light" ? "#ffffff" : headerAccent) : "rgba(255,255,255,0.12)",
                    border: isActive ? `2px solid ${mode === "light" ? "#ffffff" : headerAccent}` : "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: isActive ? (mode === "light" ? "#f8fafc" : headerAccent) : "rgba(255,255,255,0.22)",
                    },
                  }}
                >
                  {t.label}
                </Button>
              );
            })}
          </Box>

          {/* Right Action Items: Theme Toggle & Profile Avatar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
            <IconButton
              onClick={toggleColorMode}
              size="small"
              sx={{ color: "rgba(255,255,255,0.9)", p: 0.8 }}
              title="Toggle theme mode"
            >
              {mode === "dark" ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
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
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  backgroundColor: settings.headerAccentColor || "#c99738",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  fontWeight: 800,
                }}
              >
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" } }}>
                <Typography variant="body2" sx={{ color: headerText, fontWeight: 700, lineHeight: 1.1 }}>
                  {currentUser?.displayName || "Advocate"}
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
              <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  {currentUser?.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  {currentUser?.email}
                </Typography>
                <RoleBadge role={currentUser?.role} />
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <Typography color="error" fontWeight={700}>Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>

        {/* Mobile/Tablet Sub-Navigation Bar: Sleek, Touch-Friendly, Full-Width Segmented Bar */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            px: 1,
            pb: 1,
            pt: 0.2,
            gap: 1,
            backgroundColor: "rgba(0,0,0,0.15)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {tabsList.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <Button
                key={t.id}
                fullWidth
                startIcon={t.icon}
                onClick={() => setActiveTab(t.id)}
                size="small"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: 0.7,
                  px: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontWeight: 800,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  color: isActive ? (mode === "light" ? headerBg : "#ffffff") : "rgba(255,255,255,0.88)",
                  backgroundColor: isActive ? (mode === "light" ? "#ffffff" : headerAccent) : "rgba(255,255,255,0.12)",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0.5, sm: 0.8 },
                  },
                  "&:hover": {
                    backgroundColor: isActive ? (mode === "light" ? "#f8fafc" : headerAccent) : "rgba(255,255,255,0.2)",
                  },
                }}
              >
                {t.mobileLabel}
              </Button>
            );
          })}
        </Box>
      </AppBar>
    </>
  );
}
