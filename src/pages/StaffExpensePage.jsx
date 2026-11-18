import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import ExpenseDialog from "../components/ExpenseDialog";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function StaffExpensePage() {
  const { currentUser } = useAuth();
  const { expenses, advances, cases, settings, deleteExpense } = useApp();

  const currency = settings.currencySymbol || "₹";

  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [caseFilter, setCaseFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter expenses belonging to this logged in staff member
  const myExpenses = expenses.filter(e =>
    e.staffId === currentUser?.uid ||
    (currentUser?.email && (e.staffEmail || "").toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.displayName && (e.staffName || "").toLowerCase() === currentUser.displayName.toLowerCase())
  );

  // Filter advances belonging to this logged in staff member
  const myAdvances = advances.filter(a =>
    a.staffId === currentUser?.uid ||
    (currentUser?.email && (a.staffEmail || "").toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.displayName && (a.staffName || "").toLowerCase() === currentUser.displayName.toLowerCase())
  );

  const totalMyExpenses = myExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalAdvancesReceived = myAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalAdvancesUsed = myAdvances.reduce((sum, a) => sum + (Number(a.usedAmount) || 0), 0);
  const remainingFloatBalance = totalAdvancesReceived - totalAdvancesUsed;

  // Filtered expenses list
  const filteredExpenses = myExpenses.filter(e => {
    if (caseFilter !== "ALL" && e.caseId !== caseFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.caseTitle && e.caseTitle.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleEdit = (exp) => {
    setSelectedExpense(exp);
    setOpenExpenseModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      await deleteExpense(id);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Top Banner */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: { xs: 2.5, md: 4 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.125rem" }, lineHeight: 1.2, mb: 0.5 }}
          >
            Staff Expense Portal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.82rem", sm: "0.875rem" } }}>
            Welcome, <strong>{currentUser?.displayName || "Advocate"}</strong>. Record case expenditures and monitor your authorized advance float.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedExpense(null);
            setOpenExpenseModal(true);
          }}
          sx={{
            py: 1.2,
            px: 3,
            width: { xs: "100%", sm: "auto" },
            fontSize: "0.95rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #0f2942 0%, #1e40af 100%)",
            boxShadow: "0 4px 14px rgba(15, 41, 66, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          Record New Expense
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Total Expenses Logged"
            value={`${currency} ${totalMyExpenses.toLocaleString()}`}
            subtitle={`${myExpenses.length} entries submitted`}
            icon={TrendingUpIcon}
            color="#0f2942"
            delay={0.05}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Advances Allocated"
            value={`${currency} ${totalAdvancesReceived.toLocaleString()}`}
            subtitle={`${myAdvances.length} advances disbursed`}
            icon={AccountBalanceWalletIcon}
            color="#0284c7"
            delay={0.1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Advances Expended / Settled"
            value={`${currency} ${totalAdvancesUsed.toLocaleString()}`}
            subtitle="Deducted against firm vouchers"
            icon={CheckCircleIcon}
            color="#16a34a"
            delay={0.15}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usable Advance Float Balance"
            value={`${currency} ${remainingFloatBalance.toLocaleString()}`}
            subtitle={remainingFloatBalance > 0 ? "Available for upcoming expenses" : "No active advance float"}
            icon={AssignmentTurnedInIcon}
            color={remainingFloatBalance > 0 ? "#c99738" : "#94a3b8"}
            delay={0.2}
          />
        </Grid>
      </Grid>

      {/* Active Advance Float Strip (If staff has active advances) */}
      {myAdvances.length > 0 && (
        <Card sx={{ mb: 4, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AccountBalanceWalletIcon sx={{ color: "#c99738" }} />
              <Typography variant="subtitle1" fontWeight={700}>
                My Authorized Advance Float History
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {myAdvances.map((adv) => {
                const rem = adv.amount - (adv.usedAmount || 0);
                return (
                  <Grid item xs={12} sm={6} md={4} key={adv.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: rem > 0 ? "secondary.light" : "divider",
                        backgroundColor: rem > 0 ? "rgba(201, 151, 56, 0.05)" : "background.default",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {adv.id}
                        </Typography>
                        <Chip
                          label={rem > 0 ? "ACTIVE FLOAT" : "SETTLED"}
                          size="small"
                          color={rem > 0 ? "secondary" : "default"}
                          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Scope: <strong>{adv.caseTitle || (adv.caseId === "ALL" ? "General Float" : adv.caseId)}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        Disbursed on: {adv.disbursedDate} by {adv.disbursedBy}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, pt: 1, borderTop: "1px dashed #cbd5e1" }}>
                        <Typography variant="caption">Total: <strong>{currency} {adv.amount.toLocaleString()}</strong></Typography>
                        <Typography variant="caption" color={rem > 0 ? "secondary.dark" : "text.secondary"}>
                          Balance: <strong>{currency} {rem.toLocaleString()}</strong>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Expense History Table with Filters */}
      <Card sx={{ border: "1px solid #cbd5e1" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              Submitted Expenses
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                select
                size="small"
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                sx={{ width: { xs: "100%", sm: 220 } }}
                label="Filter by Case"
              >
                <MenuItem value="ALL">All Assigned Cases</MenuItem>
                {cases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title.substring(0, 24)}...
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                placeholder="Search description, bill no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { xs: "100%", sm: 240 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              mb: 1,
              textAlign: "right",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            Scroll horizontally to view all columns & actions →
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid #cbd5e1",
              borderRadius: 2,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Case / Matter</TableCell>
                  <TableCell>Expense Details</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Paid By</TableCell>
                  <TableCell align="right">Amount ({currency})</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No expense records found. Click <strong>Record New Expense</strong> above to log your first entry.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((exp) => (
                    <TableRow key={exp.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {exp.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.time || "12:00"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {exp.caseTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {exp.caseId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {exp.name}
                        </Typography>
                        {exp.notes && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            Voucher: {exp.notes}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={exp.category}
                          size="small"
                          sx={{
                            fontSize: "0.72rem",
                            backgroundColor:
                              exp.categoryType === "legal" ? "#1e40af15" :
                              exp.categoryType === "technical" ? "#b4530915" : "#47556915",
                            color:
                              exp.categoryType === "legal" ? "#1e40af" :
                              exp.categoryType === "technical" ? "#b45309" : "#475569",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {exp.paymentMode === "firm_advance" ? (
                          <Chip
                            icon={<AccountBalanceWalletIcon sx={{ fontSize: "14px !important" }} />}
                            label="Firm Advance Float"
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                            {exp.paymentMode || "Cash"}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800} color="text.primary">
                          {currency} {Number(exp.amount).toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={exp.status ? exp.status.toUpperCase() : "APPROVED"}
                          size="small"
                          color={exp.status === "reconciled" ? "success" : "primary"}
                          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleEdit(exp)}
                          sx={{ mr: 1, py: 0.4, px: 1.2, fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleDelete(exp.id)}
                          sx={{ py: 0.4, px: 1.2, fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Expense Modal */}
      <ExpenseDialog
        open={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        expenseToEdit={selectedExpense}
      />
    </Box>
  );
}
