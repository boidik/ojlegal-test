import React from "react";
import { Chip } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";

export default function RoleBadge({ role, size = "small" }) {
  if (role === "software_admin") {
    return (
      <Chip
        icon={<AdminPanelSettingsIcon sx={{ fontSize: "16px !important", color: "#6b21a8 !important" }} />}
        label="Software Admin (Master)"
        size={size}
        sx={{
          backgroundColor: "#f3e8ff",
          color: "#6b21a8",
          fontWeight: 800,
          border: "1.5px solid #c084fc",
          fontSize: "0.75rem",
        }}
      />
    );
  }

  if (role === "accounts_admin") {
    return (
      <Chip
        icon={<AccountBalanceIcon sx={{ fontSize: "16px !important", color: "#0369a1 !important" }} />}
        label="Accounts Admin (Boss)"
        size={size}
        sx={{
          backgroundColor: "#e0f2fe",
          color: "#0369a1",
          fontWeight: 800,
          border: "1.5px solid #7dd3fc",
          fontSize: "0.75rem",
        }}
      />
    );
  }

  return (
    <Chip
      icon={<PersonIcon sx={{ fontSize: "16px !important", color: "#15803d !important" }} />}
      label="Staff Associate"
      size={size}
      sx={{
        backgroundColor: "#dcfce7",
        color: "#15803d",
        fontWeight: 800,
        border: "1.5px solid #86efac",
        fontSize: "0.75rem",
      }}
    />
  );
}
