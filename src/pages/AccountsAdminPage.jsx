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
  Tabs,
  Tab,
  LinearProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GavelIcon from "@mui/icons-material/Gavel";
import MemoryIcon from "@mui/icons-material/Memory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import StatCard from "../components/StatCard";
import ExpenseDialog from "../components/ExpenseDialog";
import AdvanceDialog from "../components/AdvanceDialog";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { exportExpensesToExcel, exportExpensesToPDF } from "../services/exportService";

export default function AccountsAdminPage() {
  const { currentUser } = useAuth();
  const {
    expenses,
    advances,
    cases,
    categories,
    users,
    settings,
    deleteExpense,
    deleteAdvance,
    updateAdvance,
  } = useApp();

  const currency = settings.currencySymbol || "₹";

  const [activeTab, setActiveTab] = useState(0); // 0 = Expenses, 1 = Advances
  const [selectedCase, setSelectedCase] = useState("ALL");
  const [selectedStaff, setSelectedStaff] = useState("ALL");
  const [selectedCategoryType, setSelectedCategoryType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  // Filter expenses based on current controls
  const filteredExpenses = expenses.filter((e) => {
    if (selectedCase !== "ALL" && e.caseId !== selectedCase) return false;
    if (selectedStaff !== "ALL" && e.staffId !== selectedStaff && e.staffEmail !== selectedStaff) return false;
    if (selectedCategoryType !== "ALL" && e.categoryType !== selectedCategoryType) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.caseTitle && e.caseTitle.toLowerCase().includes(q)) ||
        (e.staffName && e.staffName.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Financial aggregates
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const legalExpenses = filteredExpenses
    .filter((e) => e.categoryType === "legal")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const technicalExpenses = filteredExpenses
    .filter((e) => e.categoryType === "technical")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const adminExpenses = totalExpenses - legalExpenses - technicalExpenses;

  // Advances aggregates
  const filteredAdvances = advances.filter((a) => {
    if (selectedStaff !== "ALL" && a.staffId !== selectedStaff && a.staffEmail !== selectedStaff) return false;
    if (selectedCase !== "ALL" && a.caseId !== "ALL" && a.caseId !== selectedCase) return false;
    return true;
  });

  const totalAdvancesDisbursed = filteredAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalAdvancesUsed = filteredAdvances.reduce((sum, a) => sum + (Number(a.usedAmount) || 0), 0);
  const remainingFloatBalance = totalAdvancesDisbursed - totalAdvancesUsed;

  // Percentage calculations
  const legalPct = totalExpenses > 0 ? Math.round((legalExpenses / totalExpenses) * 100) : 0;
  const techPct = totalExpenses > 0 ? Math.round((technicalExpenses / totalExpenses) * 100) : 0;
  const adminPct = totalExpenses > 0 ? Math.round((adminExpenses / totalExpenses) * 100) : 0;

  // Clear filters
  const handleClearFilters = () => {
    setSelectedCase("ALL");
    setSelectedStaff("ALL");
    setSelectedCategoryType("ALL");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  // Export Handlers
  const getFilterSummary = () => {
    const caseObj = cases.find((c) => c.id === selectedCase);
    const staffObj = users.find((u) => u.uid === selectedStaff || u.email === selectedStaff);
    return {
      caseName: caseObj ? `${caseObj.caseNumber} - ${caseObj.title}` : "All Cases",
      staffName: staffObj ? `${staffObj.displayName} (${staffObj.email})` : "All Staff",
      categoryType: selectedCategoryType !== "ALL" ? selectedCategoryType : "All Categories",
      startDate: startDate || "All Time",
      endDate: endDate || "Present",
    };
  };

  const handleExportExcel = () => {
    exportExpensesToExcel({
      expenses: filteredExpenses,
      advances: filteredAdvances,
      settings,
      filterSummary: getFilterSummary(),
      fileName: `lex_accounts_audit_${selectedCase === "ALL" ? "all_cases" : selectedCase}`,
    });
  };

  const handleExportPDF = () => {
    exportExpensesToPDF({
      expenses: filteredExpenses,
      advances: filteredAdvances,
      settings,
      filterSummary: getFilterSummary(),
      fileName: `lex_expense_voucher_statement_${selectedCase === "ALL" ? "all_cases" : selectedCase}`,
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Accounts Admin & Financial Audit
            </Typography>
            <Chip label="BOSS PORTAL" size="small" color="secondary" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Senior Partner overview: verify staff vouchers, manage advance balances, and generate certified Excel & PDF reports.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedAdvance(null);
              setOpenAdvanceModal(true);
            }}
            sx={{ fontWeight: 700 }}
          >
            Disburse Advance
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
            }}
          >
            Export to Excel
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #0f2942 0%, #1e3a5f 100%)",
            }}
          >
            Generate PDF Report
          </Button>
        </Box>
      </Box>

      {/* Aggregate Financial Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incurred Expenses"
            value={`${currency} ${totalExpenses.toLocaleString()}`}
            subtitle={`${filteredExpenses.length} verified vouchers`}
            icon={TrendingUpIcon}
            color="#0f2942"
            delay={0.05}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Legal & Court Disbursements"
            value={`${currency} ${legalExpenses.toLocaleString()}`}
            subtitle={`${legalPct}% of aggregate expenditures`}
            icon={GavelIcon}
            color="#1e40af"
            delay={0.1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Technical & Forensic Expenses"
            value={`${currency} ${technicalExpenses.toLocaleString()}`}
            subtitle={`${techPct}% of aggregate expenditures`}
            icon={MemoryIcon}
            color="#b45309"
            delay={0.15}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Advance Float"
            value={`${currency} ${remainingFloatBalance.toLocaleString()}`}
            subtitle={`${currency} ${totalAdvancesDisbursed.toLocaleString()} total disbursed`}
            icon={AccountBalanceWalletIcon}
            color="#c99738"
            delay={0.2}
          />
        </Grid>
      </Grid>

      {/* Legal vs Technical Separation Visualizer */}
      <Card sx={{ mb: 4, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Expenditure Distribution (Legal vs. Technical vs. Administrative)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: <strong>{currency} {totalExpenses.toLocaleString()}</strong>
            </Typography>
          </Box>

          {/* Visual Stacked Progress Bar */}
          <Box sx={{ display: "flex", height: 14, borderRadius: 2, overflow: "hidden", mb: 2, backgroundColor: "#f1f5f9" }}>
            <Box sx={{ width: `${legalPct}%`, backgroundColor: "#1e40af" }} title={`Legal: ${legalPct}%`} />
            <Box sx={{ width: `${techPct}%`, backgroundColor: "#b45309" }} title={`Technical: ${techPct}%`} />
            <Box sx={{ width: `${adminPct}%`, backgroundColor: "#64748b" }} title={`Admin: ${adminPct}%`} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#1e40af" }} />
                <Typography variant="body2" fontWeight={600}>
                  Legal & Court Fees: {currency} {legalExpenses.toLocaleString()} ({legalPct}%)
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5, display: "block" }}>
                Senior counsel briefing, petition stamp duty, certified copies
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#b45309" }} />
                <Typography variant="body2" fontWeight={600}>
                  Technical & Forensic: {currency} {technicalExpenses.toLocaleString()} ({techPct}%)
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5, display: "block" }}>
                Data extraction, forensic imaging, e-discovery platforms
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#64748b" }} />
                <Typography variant="body2" fontWeight={600}>
                  Administrative & Logistics: {currency} {adminExpenses.toLocaleString()} ({adminPct}%)
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5, display: "block" }}>
                Outstation tribunal travel, courier, paper binding, misc
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Comprehensive Multi-Parameter Filter Card */}
      <Card sx={{ mb: 4, border: "1px solid #cbd5e1" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Report & Ledger Filter Controls
              </Typography>
            </Box>
            {(selectedCase !== "ALL" || selectedStaff !== "ALL" || selectedCategoryType !== "ALL" || startDate || endDate || searchTerm) && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                color="inherit"
                sx={{ fontSize: "0.75rem" }}
              >
                Reset All Filters
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Filter by Case */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Case / Matter Filter"
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="ALL">All Law Firm Cases</MenuItem>
                {cases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title.substring(0, 22)}...
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Filter by Staff */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Staff Member Filter"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="ALL">All Staff Associates</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.uid} value={u.uid}>
                    {u.displayName} ({u.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Filter by Classification Type */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Classification"
                value={selectedCategoryType}
                onChange={(e) => setSelectedCategoryType(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="legal">⚖️ Legal Only</MenuItem>
                <MenuItem value="technical">💻 Technical Only</MenuItem>
                <MenuItem value="administrative">📑 Administrative</MenuItem>
              </TextField>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Search Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search across expense descriptions, client name, voucher references, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs: Itemized Expenses vs Advances Float */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab
            label={`Itemized Audit Ledger (${filteredExpenses.length})`}
            sx={{ fontWeight: 700, fontSize: "0.95rem" }}
          />
          <Tab
            label={`Staff Advances & Float Reconciliation (${filteredAdvances.length})`}
            sx={{ fontWeight: 700, fontSize: "0.95rem" }}
          />
        </Tabs>
      </Box>

      {/* TAB 0: Itemized Expenses Ledger */}
      {activeTab === 0 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Case / Matter</TableCell>
                  <TableCell>Expense Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Logged By</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell align="right">Amount ({currency})</TableCell>
                  <TableCell align="center">Reconciled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No expenses match the current filter criteria.
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

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {exp.caseTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.caseId}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {exp.name}
                        </Typography>
                        {exp.notes && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            Ref: {exp.notes}
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
                        <Typography variant="body2" fontWeight={600}>
                          {exp.staffName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.staffEmail}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {exp.paymentMode === "firm_advance" ? (
                          <Chip
                            icon={<AccountBalanceWalletIcon sx={{ fontSize: "14px !important" }} />}
                            label="Firm Advance"
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
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                          label={exp.status ? exp.status.toUpperCase() : "VERIFIED"}
                          size="small"
                          color={exp.status === "reconciled" ? "success" : "default"}
                          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedExpense(exp);
                            setOpenExpenseModal(true);
                          }}
                          sx={{ mr: 1, py: 0.4, px: 1.2, fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                          onClick={async () => {
                            if (window.confirm("Delete this expense voucher?")) {
                              await deleteExpense(exp.id);
                            }
                          }}
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
        </Card>
      )}

      {/* TAB 1: Staff Advances & Float Reconciliation */}
      {activeTab === 1 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Staff Advance Disbursements & Float Settlements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Track pre-authorized advances issued to legal associates and their current utilization balance
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedAdvance(null);
                setOpenAdvanceModal(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Disburse New Advance
            </Button>
          </Box>
          <Divider />

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Advance ID</TableCell>
                  <TableCell>Staff Associate</TableCell>
                  <TableCell>Scope / Case</TableCell>
                  <TableCell>Date Disbursed</TableCell>
                  <TableCell align="right">Disbursed ({currency})</TableCell>
                  <TableCell align="right">Utilized ({currency})</TableCell>
                  <TableCell align="right">Balance ({currency})</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdvances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No advances recorded. Click <strong>Disburse New Advance</strong> to allocate funds.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdvances.map((adv) => {
                    const balance = adv.amount - (adv.usedAmount || 0);
                    const isSettled = balance <= 0 || adv.status === "settled";

                    return (
                      <TableRow key={adv.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {adv.id}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {adv.staffName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {adv.staffEmail}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" fontWeight={600} color={adv.caseId === "ALL" ? "secondary.main" : "primary.main"}>
                            {adv.caseTitle || (adv.caseId === "ALL" ? "General Float (Any Case)" : adv.caseId)}
                          </Typography>
                          {adv.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {adv.notes}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2">{adv.disbursedDate}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            By: {adv.disbursedBy}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {currency} {Number(adv.amount).toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {currency} {Number(adv.usedAmount || 0).toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={800} color={balance > 0 ? "secondary.dark" : "text.secondary"}>
                            {currency} {balance.toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={isSettled ? "SETTLED" : "ACTIVE FLOAT"}
                            size="small"
                            color={isSettled ? "default" : "secondary"}
                            sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                            onClick={() => {
                              setSelectedAdvance(adv);
                              setOpenAdvanceModal(true);
                            }}
                            sx={{ mr: 1, py: 0.4, px: 1.2, fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                            onClick={async () => {
                              if (window.confirm("Remove this advance record?")) {
                                await deleteAdvance(adv.id);
                              }
                            }}
                            sx={{ py: 0.4, px: 1.2, fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Expense Modal */}
      <ExpenseDialog
        open={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        expenseToEdit={selectedExpense}
      />

      {/* Advance Modal */}
      <AdvanceDialog
        open={openAdvanceModal}
        onClose={() => setOpenAdvanceModal(false)}
        advanceToEdit={selectedAdvance}
      />
    </Box>
  );
}
