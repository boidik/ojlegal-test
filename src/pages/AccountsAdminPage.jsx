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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ClearIcon from "@mui/icons-material/Clear";
import StatCard from "../components/StatCard";
import ExpenseDialog from "../components/ExpenseDialog";
import AdvanceDialog from "../components/AdvanceDialog";
import CaseDialog from "../components/CaseDialog";
import ForumDialog from "../components/ForumDialog";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useAppTheme } from "../context/ThemeContext";
import { exportExpensesToExcel, exportExpensesToPDF } from "../services/exportService";

export default function AccountsAdminPage() {
  const { currentUser } = useAuth();
  const { mode } = useAppTheme();
  const {
    expenses,
    advances,
    cases,
    categories,
    forums,
    users,
    settings,
    deleteExpense,
    deleteAdvance,
    updateAdvance,
    deleteCase,
    deleteForum,
    seedStandardForums,
  } = useApp();

  const currency = settings.currencySymbol || "₹";

  // Delegation checks from Software Admin settings
  const canManageCases = settings.allowAccountsAdminCases !== false;
  const canManageForums = settings.allowAccountsAdminForums !== false;

  const caseTabIndex = canManageCases ? 2 : -1;
  const forumTabIndex = canManageForums ? (canManageCases ? 3 : 2) : -1;

  const [activeTab, setActiveTab] = useState(0); // 0 = Expenses, 1 = Advances, 2 = Cases (delegated), 3 = Forums (delegated)
  const [selectedCase, setSelectedCase] = useState("ALL");
  const [selectedStaff, setSelectedStaff] = useState("ALL");
  const [selectedCategoryType, setSelectedCategoryType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openForumModal, setOpenForumModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [forumToEdit, setForumToEdit] = useState(null);

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

  // Financial aggregates: Live Mathematically Reconciled
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Separation of Firm Advance Float vs. Associate Self (Out-of-Pocket Reimbursement)
  const advanceExpenses = filteredExpenses.filter((e) => e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted));
  const selfExpenses = filteredExpenses.filter((e) => e.paymentMode !== "firm_advance" && !e.advanceDeducted);

  const advanceExpensesTotal = advanceExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const selfExpensesTotal = selfExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

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
  const totalAdvancesUsed = filteredAdvances.reduce((sum, a) => {
    const fromExp = expenses
      .filter((e) => e.advanceId === a.id && (e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted)))
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return sum + (fromExp > 0 ? fromExp : Number(a.usedAmount || 0));
  }, 0);
  const remainingFloatBalance = Math.max(0, totalAdvancesDisbursed - totalAdvancesUsed);

  // Percentage calculations
  const advanceFloatPct = totalExpenses > 0 ? Math.round((advanceExpensesTotal / totalExpenses) * 100) : 0;
  const selfReimbursePct = totalExpenses > 0 ? Math.round((selfExpensesTotal / totalExpenses) * 100) : 0;
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
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: { xs: 2.5, md: 4 },
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography
              variant="h4"
              fontWeight={800}
              color="text.primary"
              sx={{ fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.125rem" }, lineHeight: 1.2 }}
            >
              Accounts Admin & Financial Audit
            </Typography>
            <Chip label="BOSS PORTAL" size="small" color="secondary" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.82rem", sm: "0.875rem" } }}>
            Senior Partner overview: verify staff vouchers, manage advance balances, and generate certified Excel & PDF reports.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedAdvance(null);
              setOpenAdvanceModal(true);
            }}
            sx={{ fontWeight: 800, flex: { xs: "1 1 100%", sm: "1 1 auto" }, py: 1 }}
          >
            Disburse Advance
          </Button>

          {canManageCases && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FolderSpecialIcon />}
              onClick={() => {
                setCaseToEdit(null);
                setOpenCaseModal(true);
              }}
              sx={{ fontWeight: 800, flex: { xs: "1 1 calc(50% - 6px)", sm: "1 1 auto" }, py: 1 }}
            >
              + Case
            </Button>
          )}

          {canManageForums && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AccountBalanceIcon />}
              onClick={() => {
                setForumToEdit(null);
                setOpenForumModal(true);
              }}
              sx={{ fontWeight: 800, flex: { xs: "1 1 calc(50% - 6px)", sm: "1 1 auto" }, py: 1 }}
            >
              + Court
            </Button>
          )}

          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{
              fontWeight: 800,
              flex: { xs: "1 1 calc(50% - 6px)", sm: "1 1 auto" },
              py: 1,
              background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
            }}
          >
            Excel
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            sx={{
              fontWeight: 800,
              flex: { xs: "1 1 calc(50% - 6px)", sm: "1 1 auto" },
              py: 1,
              background: "linear-gradient(135deg, #0f2942 0%, #1e3a5f 100%)",
            }}
          >
            PDF Report
          </Button>
        </Box>
      </Box>

      {/* Aggregate Financial Metrics: Live Mathematical Float & Cashflow Reconciler */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incurred Expenses"
            value={`${currency} ${totalExpenses.toLocaleString()}`}
            subtitle={`${filteredExpenses.length} verified voucher entries`}
            icon={TrendingUpIcon}
            color="#0f2942"
            delay={0.05}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid from Firm Advance"
            value={`${currency} ${advanceExpensesTotal.toLocaleString()}`}
            subtitle={`Absorbed from advance float (${advanceFloatPct}%)`}
            icon={AccountBalanceWalletIcon}
            color="#c99738"
            delay={0.1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid from Associate Self"
            value={`${currency} ${selfExpensesTotal.toLocaleString()}`}
            subtitle={`Reimbursements owed to staff (${selfReimbursePct}%)`}
            icon={ReceiptLongIcon}
            color="#1e40af"
            delay={0.15}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Advance Float"
            value={`${currency} ${remainingFloatBalance.toLocaleString()}`}
            subtitle={`Out of ${currency} ${totalAdvancesDisbursed.toLocaleString()} total float disbursed`}
            icon={CheckCircleIcon}
            color={remainingFloatBalance > 0 ? "#16a34a" : "#64748b"}
            delay={0.2}
          />
        </Grid>
      </Grid>

      {/* Legal vs Technical Separation Visualizer */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: "divider" }}>
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
          <Box sx={{ display: "flex", height: 14, borderRadius: 2, overflow: "hidden", mb: 2, backgroundColor: mode === "light" ? "#f1f5f9" : "rgba(255,255,255,0.08)" }}>
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
      <Card sx={{ mb: 4, border: "1px solid", borderColor: "divider" }}>
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

      {/* Tabs: Itemized Expenses vs Advances Float vs Delegated Registries */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: { xs: "0.82rem", sm: "0.95rem" },
              px: { xs: 1.5, sm: 2.5 },
              minHeight: 48,
              whiteSpace: "nowrap",
            },
          }}
        >
          <Tab label={`Itemized Audit Ledger (${filteredExpenses.length})`} />
          <Tab label={`Staff Advances & Float (${filteredAdvances.length})`} />
          {canManageCases && (
            <Tab
              icon={<FolderSpecialIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Case Registry (${cases.length})`}
            />
          )}
          {canManageForums && (
            <Tab
              icon={<AccountBalanceIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Courts & Forums (${forums.length})`}
            />
          )}
        </Tabs>
      </Box>

      {/* TAB 0: Itemized Expenses Ledger */}
      {activeTab === 0 && (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              px: 2,
              pt: 1.5,
              pb: 0.5,
              textAlign: "right",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            Scroll horizontally for full ledger columns →
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table sx={{ minWidth: 920 }}>
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
                            label="Firm Advance Float"
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        ) : (
                          <Chip
                            icon={<ReceiptLongIcon sx={{ fontSize: "14px !important" }} />}
                            label={`Self (${(exp.paymentMode || "Cash").toUpperCase()})`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                          />
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
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
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
              sx={{ fontWeight: 800, width: { xs: "100%", sm: "auto" }, whiteSpace: "nowrap" }}
            >
              Disburse New Advance
            </Button>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              px: 2,
              pt: 1.5,
              pb: 0.5,
              textAlign: "right",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            Scroll horizontally for all advance columns →
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table sx={{ minWidth: 880 }}>
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
                    const fromExp = expenses
                      .filter((e) => e.advanceId === adv.id && (e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted)))
                      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
                    const effectiveUsed = fromExp > 0 ? fromExp : Number(adv.usedAmount || 0);
                    const totalAmt = Number(adv.amount || 0);
                    const balance = Math.max(0, totalAmt - effectiveUsed);
                    const isSettled = balance <= 0 || adv.status === "settled";
                    const pctUsed = totalAmt > 0 ? Math.min(100, Math.round((effectiveUsed / totalAmt) * 100)) : 0;

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
                            {currency} {totalAmt.toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {currency} {effectiveUsed.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pctUsed}% utilized
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

      {/* TAB 2 (Delegated): Case Registry */}
      {canManageCases && activeTab === caseTabIndex && (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: mode === "light" ? "#f8fafc" : "#16253b",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Law Firm Case Registry (Delegated Access)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Authorized by Managing Partner to register and maintain active litigation & arbitration matters.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCaseToEdit(null);
                setOpenCaseModal(true);
              }}
              sx={{ fontWeight: 800 }}
            >
              Add New Case
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              px: 2,
              pt: 1.5,
              pb: 0.5,
              textAlign: "right",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            Scroll horizontally to see all columns →
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: { xs: 700, sm: 800 } }} size="medium">
              <TableHead sx={{ backgroundColor: mode === "light" ? "#f1f5f9" : "#142136" }}>
                <TableRow>
                  <TableCell>Case ID / Number</TableCell>
                  <TableCell>Title & Client</TableCell>
                  <TableCell>Court / Tribunal</TableCell>
                  <TableCell>Practice Area</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No cases registered in the firm registry yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {c.caseNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ref: {c.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Client: {c.clientName || "Corporate / Private"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.courtForum || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.practiceArea || "Litigation"}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.72rem", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={c.status ? c.status.toUpperCase() : "ACTIVE"}
                          size="small"
                          color={c.status === "closed" ? "default" : "success"}
                          sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setCaseToEdit(c);
                            setOpenCaseModal(true);
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
                            if (window.confirm(`Archive or delete case "${c.caseNumber}"?`)) {
                              await deleteCase(c.id);
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

      {/* TAB 3 (Delegated): Courts & Forums */}
      {canManageForums && activeTab === forumTabIndex && (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: mode === "light" ? "#f8fafc" : "#16253b",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Courts, Tribunals & Forums Registry (Delegated Access)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Authorized by Managing Partner to register High Courts, NCLT, DRT, and Consumer Forums.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AutoAwesomeIcon />}
                onClick={async () => {
                  if (window.confirm("Seed 16+ standard High Courts, Tribunals & Judicial Forums?")) {
                    await seedStandardForums();
                  }
                }}
                sx={{ fontWeight: 800 }}
              >
                Seed Standard Courts
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setForumToEdit(null);
                  setOpenForumModal(true);
                }}
                sx={{ fontWeight: 800 }}
              >
                Add Forum
              </Button>
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              px: 2,
              pt: 1.5,
              pb: 0.5,
              textAlign: "right",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            Scroll horizontally to see all columns →
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: { xs: 650, sm: 750 } }} size="medium">
              <TableHead sx={{ backgroundColor: mode === "light" ? "#f1f5f9" : "#142136" }}>
                <TableRow>
                  <TableCell>Court / Forum Name</TableCell>
                  <TableCell>Short Code</TableCell>
                  <TableCell>Forum Type</TableCell>
                  <TableCell>Jurisdiction / City</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No courts or judicial forums registered yet. Click <strong>Seed Standard Courts</strong> or <strong>Add Forum</strong>.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  forums.map((f) => (
                    <TableRow key={f.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {f.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={f.shortCode || "GEN"}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "0.72rem", fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {f.type || "Judicial Tribunal"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{f.location || "National / Multi-Bench"}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setForumToEdit(f);
                            setOpenForumModal(true);
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
                            if (window.confirm(`Delete forum "${f.name}"?`)) {
                              await deleteForum(f.id);
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

      {/* Delegated Case Modal */}
      <CaseDialog
        open={openCaseModal}
        onClose={() => setOpenCaseModal(false)}
        caseToEdit={caseToEdit}
      />

      {/* Delegated Forum Modal */}
      <ForumDialog
        open={openForumModal}
        onClose={() => setOpenForumModal(false)}
        forumToEdit={forumToEdit}
      />
    </Box>
  );
}
