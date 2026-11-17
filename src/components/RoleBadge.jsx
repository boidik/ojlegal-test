import React from "react";
import { Chip } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";

export default function RoleBadge({ role, size = "small" }) {
  if (role === "software_admin") {
    return (
      <Chip
        icon={<AdminPanelSettingsIcon sx={{ fontSize: "16px !important" }} />}
        label="Software Admin (Master)"
        size={size}
        sx={{
          backgroundColor: "#7c3aed18",
          color: "#7c3aed",
          fontWeight: 700,
          border: "1px solid #7c3aed40",
        }}
      />
    );
  }

  if (role === "accounts_admin") {
    return (
      <Chip
        icon={<AccountBalanceIcon sx={{ fontSize: "16px !important" }} />}
        label="Accounts Admin (Boss)"
        size={size}
        sx={{
          backgroundColor: "#0284c718",
          color: "#0284c7",
          fontWeight: 700,
          border: "1px solid #0284c740",
        }}
      />
    );
  }

  return (
    <Chip
      icon={<PersonIcon sx={{ fontSize: "16px !important" }} />}
      label="Staff Member"
      size={size}
      sx={{
        backgroundColor: "#16a34a18",
        color: "#16a34a",
        fontWeight: 600,
        border: "1px solid #16a34a40",
      }}
    />
  );
}
