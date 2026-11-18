import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  Slider,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LayersIcon from "@mui/icons-material/Layers";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CaseDialog from "../components/CaseDialog";
import CategoryDialog from "../components/CategoryDialog";
import ForumDialog from "../components/ForumDialog";
import ExpenseDialog from "../components/ExpenseDialog";
import RoleBadge from "../components/RoleBadge";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { PRESET_FAVICONS } from "../services/sampleData";
import { DEFAULT_PDF_LAYOUT, generateSamplePDF } from "../services/exportService";
import {
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  testFirebaseConfig,
  isFirebaseConfigured,
} from "../services/firebase";

const COLOR_PRESETS = [
  { name: "Prestigious Navy", hex: "#0f2942" },
  { name: "Midnight Charcoal", hex: "#111827" },
  { name: "Royal Burgundy", hex: "#4a0404" },
  { name: "Forest Emerald", hex: "#064e3b" },
  { name: "Deep Indigo", hex: "#1e1b4b" },
  { name: "Slate Steel", hex: "#1e293b" },
];

export default function SoftwareAdminPage() {
  const { currentUser, resetPassword, updateLocalRole } = useAuth();
  const {
    cases,
    categories,
    forums,
    users,
    expenses,
    advances,
    settings,
    saveSettings,
    deleteCase,
    deleteCategory,
    deleteForum,
    seedStandardForums,
    deleteExpense,
    updateUserRole,
    deleteUser,
    deleteAllData,
    seedStandardCategories,
    showNotification,
  } = useApp();

  // Active Tab Index
  // 0: Cases | 1: Courts/Forums | 2: Categories | 3: Firm Details | 4: Branding/Favicon | 5: Staff Permissions | 6: Firebase | 7: Master Vouchers | 8: Danger Zone (Reset)
  const [activeTab, setActiveTab] = useState(0);

  // Modals
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const [openForumModal, setOpenForumModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Delete Staff Modal State
  const [openDeleteStaffModal, setOpenDeleteStaffModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleteStaffOption, setDeleteStaffOption] = useState("keep_data"); // "keep_data" | "delete_data"
  const [deletingStaff, setDeletingStaff] = useState(false);

  // Delete All Data (Danger Zone) Modal State
  const [openDeleteAllModal, setOpenDeleteAllModal] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [wipingAllData, setWipingAllData] = useState(false);

  // Firm Details Form State
  const [firmForm, setFirmForm] = useState({
    firmName: settings.firmName || "OJ Legal Advocates & Solicitors",
    tagline: settings.tagline || "",
    registrationNo: settings.registrationNo || "",
    firmAddress: settings.firmAddress || "",
    contactEmail: settings.contactEmail || "",
    contactPhone: settings.contactPhone || "",
    altPhone: settings.altPhone || "",
    websiteUrl: settings.websiteUrl || "",
    currencySymbol: settings.currencySymbol || "₹",
    reportHeader: settings.reportHeader || "",
    reportDisclaimer: settings.reportDisclaimer || "",
    signaturePreparedBy: settings.signaturePreparedBy || "Prepared by Staff Associate",
    signatureVerifiedBy: settings.signatureVerifiedBy || "Verified by Accounts Admin (Boss)",
    signatureApprovedBy: settings.signatureApprovedBy || "Approved by Managing Partner",
    allowAccountsAdminCases: settings.allowAccountsAdminCases !== false,
    allowAccountsAdminForums: settings.allowAccountsAdminForums !== false,
  });

  // PDF Report Studio Form State
  const [pdfForm, setPdfForm] = useState(() => ({
    ...DEFAULT_PDF_LAYOUT,
    ...(settings.pdfLayout || {}),
  }));

  // Branding & UI Form State
  const [brandForm, setBrandForm] = useState({
    navbarTitle: settings.navbarTitle || settings.firmName || "OJ Legal Advocates",
    headerBgColor: settings.headerBgColor || "#0f2942",
    headerTextColor: settings.headerTextColor || "#ffffff",
    headerAccentColor: settings.headerAccentColor || "#c99738",
    navbarIconType: settings.navbarIconType || "gavel",
    customLogoUrl: settings.customLogoUrl || "",
    faviconType: settings.faviconType || "scales",
    customFaviconUrl: settings.customFaviconUrl || "",
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFirmForm((prev) => ({
        ...prev,
        firmName: settings.firmName || prev.firmName,
        tagline: settings.tagline || prev.tagline,
        registrationNo: settings.registrationNo || prev.registrationNo,
        firmAddress: settings.firmAddress || prev.firmAddress,
        contactEmail: settings.contactEmail || prev.contactEmail,
        contactPhone: settings.contactPhone || prev.contactPhone,
        altPhone: settings.altPhone || prev.altPhone,
        websiteUrl: settings.websiteUrl || prev.websiteUrl,
        currencySymbol: settings.currencySymbol || prev.currencySymbol,
        reportHeader: settings.reportHeader || prev.reportHeader,
        reportDisclaimer: settings.reportDisclaimer || prev.reportDisclaimer,
        signaturePreparedBy: settings.signaturePreparedBy || prev.signaturePreparedBy,
        signatureVerifiedBy: settings.signatureVerifiedBy || prev.signatureVerifiedBy,
        signatureApprovedBy: settings.signatureApprovedBy || prev.signatureApprovedBy,
        allowAccountsAdminCases: settings.allowAccountsAdminCases !== false,
        allowAccountsAdminForums: settings.allowAccountsAdminForums !== false,
      }));

      setBrandForm((prev) => ({
        ...prev,
        navbarTitle: settings.navbarTitle || prev.navbarTitle,
        headerBgColor: settings.headerBgColor || prev.headerBgColor,
        headerTextColor: settings.headerTextColor || prev.headerTextColor,
        headerAccentColor: settings.headerAccentColor || prev.headerAccentColor,
        navbarIconType: settings.navbarIconType || prev.navbarIconType,
        customLogoUrl: settings.customLogoUrl || prev.customLogoUrl,
        faviconType: settings.faviconType || prev.faviconType,
        customFaviconUrl: settings.customFaviconUrl || prev.customFaviconUrl,
      }));

      if (settings.pdfLayout) {
        setPdfForm((prev) => ({
          ...DEFAULT_PDF_LAYOUT,
          ...settings.pdfLayout,
        }));
      }
    }
  }, [settings]);

  // Firebase Config State Form
  const [firebaseForm, setFirebaseForm] = useState(() => {
    return (
      getActiveFirebaseConfig() || {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
      }
    );
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState(null);

  // Save Handlers
  const handleSaveFirmDetails = async (e) => {
    e.preventDefault();
    await saveSettings(firmForm);
    showNotification("Law firm official details updated successfully!", "success");
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    await saveSettings(brandForm);
    showNotification("Branding, UI & Favicon settings saved successfully!", "success");
  };

  const handleSavePdfLayout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await saveSettings({ pdfLayout: pdfForm });
    showNotification("Custom PDF Report Layout saved! All client statements and audit ledgers will now use this exact pixel geometry.", "success");
  };

  const handleResetPdfLayout = () => {
    setPdfForm({ ...DEFAULT_PDF_LAYOUT });
    showNotification("Reset PDF layout controls to default system standards.", "info");
  };

  const handleDownloadSamplePDF = () => {
    generateSamplePDF({
      ...settings,
      pdfLayout: pdfForm,
    });
    showNotification("Generated live sample PDF based on current layout controls!", "success");
  };

  // 1-Click Role Change Handler (NO PASSWORDS REQUIRED)
  const handleDirectRoleChange = async (uid, newRole, memberName) => {
    try {
      await updateUserRole(uid, newRole);
      if (currentUser?.uid === uid) {
        updateLocalRole(newRole);
      }
      showNotification(`Role successfully changed to "${newRole.toUpperCase()}" for ${memberName || "user"}.`, "success");
    } catch (err) {
      showNotification(`Failed to change role: ${err.message}`, "error");
    }
  };

  const handleResetUserPassword = async (email) => {
    if (window.confirm(`Send official password reset link to ${email}?`)) {
      const res = await resetPassword(email);
      if (res.success) {
        showNotification(res.message, "success");
      } else {
        showNotification("Failed to send reset link: " + res.error, "error");
      }
    }
  };

  const handleTestFirebase = async () => {
    setTestingConnection(true);
    setConnectionMessage(null);
    try {
      const res = await testFirebaseConfig(firebaseForm);
      setConnectionMessage(res);
    } catch (e) {
      setConnectionMessage({ success: false, message: e.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveFirebase = () => {
    saveCustomFirebaseConfig(firebaseForm);
    showNotification("Firebase credentials saved! Reloading connection...", "success");
  };

  const handleDisconnectFirebase = () => {
    if (window.confirm("Return to local preview storage mode?")) {
      clearCustomFirebaseConfig();
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    setDeletingStaff(true);
    try {
      await deleteUser(
        staffToDelete.uid,
        deleteStaffOption === "delete_data",
        staffToDelete.displayName || staffToDelete.email
      );
      setOpenDeleteStaffModal(false);
      setStaffToDelete(null);
    } catch (e) {
      showNotification("Failed to delete staff member: " + e.message, "error");
    } finally {
      setDeletingStaff(false);
    }
  };

  const handleConfirmDeleteAllData = async () => {
    if (confirmPhrase !== "DELETE ALL DATA") return;
    setWipingAllData(true);
    try {
      await deleteAllData();
      setOpenDeleteAllModal(false);
      setConfirmPhrase("");
      setActiveTab(0);
    } catch (e) {
      showNotification("Failed to delete all data: " + e.message, "error");
    } finally {
      setWipingAllData(false);
    }
  };

  const associatedExpenses = staffToDelete ? expenses.filter(e => e.staffId === staffToDelete.uid) : [];
  const associatedAdvances = staffToDelete ? advances.filter(a => a.staffId === staffToDelete.uid) : [];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Top Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              backgroundColor: "#0f2942",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(15, 41, 66, 0.25)",
              flexShrink: 0,
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#0f172a"
              sx={{ fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.125rem" } }}
            >
              Software Admin Master Console
            </Typography>
            <Typography variant="body2" color="#334155" fontWeight={500} sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
              Comprehensive administration: manage courts, firm details, categories, case registry, and 1-click user permissions.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* High-Contrast Navigation Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          border: "1px solid #cbd5e1",
          borderRadius: 3,
          backgroundColor: "#f8fafc",
          p: 0.8,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            icon={<FolderSpecialIcon />}
            iconPosition="start"
            label={`Cases (${cases.length})`}
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 0 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 0 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<AccountBalanceIcon />}
            iconPosition="start"
            label={`Courts / Forums (${forums.length})`}
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 1 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 1 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<CategoryIcon />}
            iconPosition="start"
            label={`Categories (${categories.length})`}
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 2 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 2 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Firm Details"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 3 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 3 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<PaletteIcon />}
            iconPosition="start"
            label="Branding & Favicon"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 4 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 4 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label={`Staff & Access (${users.length})`}
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 5 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 5 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<PictureAsPdfIcon />}
            iconPosition="start"
            label="PDF Report Studio"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 6 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 6 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<CloudQueueIcon />}
            iconPosition="start"
            label="Firebase Connection"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 7 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 7 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label="Master Vouchers"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 8 ? "#ffffff !important" : "#334155 !important",
              backgroundColor: activeTab === 8 ? "#0f2942" : "transparent",
            }}
          />
          <Tab
            icon={<DeleteForeverIcon />}
            iconPosition="start"
            label="System Reset (Danger Zone)"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: 2,
              mx: 0.4,
              py: 1,
              px: 2,
              color: activeTab === 9 ? "#ffffff !important" : "#dc2626 !important",
              backgroundColor: activeTab === 9 ? "#dc2626" : "transparent",
            }}
          />
        </Tabs>
      </Paper>

      {/* ==================== TAB 0: CASES ==================== */}
      {activeTab === 0 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Approved Case Registry
              </Typography>
              <Typography variant="body2" color="#334155">
                Staff associates can only record expenses against pre-approved cases registered here.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCase(null);
                setOpenCaseModal(true);
              }}
              sx={{ fontWeight: 800, px: 2.5, backgroundColor: "#0f2942", width: { xs: "100%", sm: "auto" } }}
            >
              Register New Case
            </Button>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", sm: "none" },
              px: 2.5,
              py: 0.8,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              fontStyle: "italic",
            }}
          >
            ⇄ Swipe horizontally to inspect full case details & actions
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Case / Filing No</TableCell>
                  <TableCell>Matter Title</TableCell>
                  <TableCell>Court / Forum</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Lead Counsel</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>
                        No cases registered in Firestore. Click "Register New Case" to register your first legal matter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {c.caseNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                          {c.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#334155">{c.court}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#334155">{c.clientName || "—"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#334155">{c.leadAttorney || "—"}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={c.status === "active" ? "ACTIVE" : "CLOSED"}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.7rem",
                            backgroundColor: c.status === "active" ? "#dcfce7" : "#f1f5f9",
                            color: c.status === "active" ? "#15803d" : "#64748b",
                            border: `1px solid ${c.status === "active" ? "#86efac" : "#cbd5e1"}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedCase(c);
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
                            if (window.confirm(`Delete case ${c.caseNumber} (${c.title})?`)) {
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

      {/* ==================== TAB 1: COURTS & FORUMS ==================== */}
      {activeTab === 1 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Courts, Tribunals & Judicial Forums
              </Typography>
              <Typography variant="body2" color="#334155">
                Courts defined here appear dynamically in the Case Registry dropdown across the system.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AutoAwesomeIcon />}
                onClick={seedStandardForums}
                sx={{ fontWeight: 800, borderColor: "#c99738", color: "#9f7324", width: { xs: "100%", sm: "auto" } }}
              >
                Seed Standard Legal Courts
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedForum(null);
                  setOpenForumModal(true);
                }}
                sx={{ fontWeight: 800, backgroundColor: "#0f2942", width: { xs: "100%", sm: "auto" } }}
              >
                Add Court / Forum
              </Button>
            </Box>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", sm: "none" },
              px: 2.5,
              py: 0.8,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              fontStyle: "italic",
            }}
          >
            ⇄ Swipe horizontally to inspect full court/forum details & actions
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Court / Forum Name</TableCell>
                  <TableCell>Location / City</TableCell>
                  <TableCell>Jurisdiction Category</TableCell>
                  <TableCell>Code / Abbr</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>
                        No courts or tribunals configured yet. Click <strong>Seed Standard Legal Courts</strong> to load the Supreme Court, High Courts, and NCLT, or click <strong>Add Court / Forum</strong>.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  forums.map((f) => (
                    <TableRow key={f.id || f.name} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {f.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#334155">{f.city || "New Delhi"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={f.category || "Court"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#64748b">
                          {f.code || f.id || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedForum(f);
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
                            if (window.confirm(`Delete forum '${f.name}'?`)) {
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

      {/* ==================== TAB 2: EXPENSE CATEGORIES ==================== */}
      {activeTab === 2 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Expense Categories & Classification
              </Typography>
              <Typography variant="body2" color="#334155">
                Every category can be edited here. Categories classified as 'Legal' or 'Technical' are separated in Boss audits.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AutoAwesomeIcon />}
                onClick={seedStandardCategories}
                sx={{ fontWeight: 800, borderColor: "#c99738", color: "#9f7324", width: { xs: "100%", sm: "auto" } }}
              >
                Seed Standard Legal Categories
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCategory(null);
                  setOpenCategoryModal(true);
                }}
                sx={{ fontWeight: 800, backgroundColor: "#0f2942", width: { xs: "100%", sm: "auto" } }}
              >
                Add Category
              </Button>
            </Box>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", sm: "none" },
              px: 2.5,
              py: 0.8,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              fontStyle: "italic",
            }}
          >
            ⇄ Swipe horizontally to inspect audit classifications & actions
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Audit Classification</TableCell>
                  <TableCell>Description / Practice Guidelines</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>
                        No categories found in Firestore. Click <strong>Seed Standard Legal Categories</strong> to auto-populate Court Fees, Counsel Fees, and Forensics, or click <strong>Add Category</strong>.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {cat.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cat.type.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            backgroundColor:
                              cat.type === "legal" ? "#dbeafe" :
                              cat.type === "technical" ? "#fef3c7" : "#f1f5f9",
                            color:
                              cat.type === "legal" ? "#1e40af" :
                              cat.type === "technical" ? "#b45309" : "#475569",
                            border: `1px solid ${
                              cat.type === "legal" ? "#93c5fd" :
                              cat.type === "technical" ? "#fde68a" : "#cbd5e1"
                            }`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 450 }}>
                        <Typography variant="body2" color="#334155">
                          {cat.description || "No specific guidelines provided."}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setOpenCategoryModal(true);
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
                            if (window.confirm(`Delete category '${cat.name}'?`)) {
                              await deleteCategory(cat.id);
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

      {/* ==================== TAB 3: OFFICIAL LAW FIRM DETAILS ==================== */}
      {activeTab === 3 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Official Law Firm Identity & Practice Details
              </Typography>
              <Typography variant="body2" color="#334155">
                These official parameters appear on client disbursement statements, voucher PDFs, certified Excel audits, and system reports.
              </Typography>
            </Box>

            <form onSubmit={handleSaveFirmDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Official Law Firm Name"
                    value={firmForm.firmName}
                    onChange={(e) => setFirmForm({ ...firmForm, firmName: e.target.value })}
                    fullWidth
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Practice Tagline / Slogan"
                    value={firmForm.tagline}
                    onChange={(e) => setFirmForm({ ...firmForm, tagline: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bar Council / Chamber Registration No"
                    value={firmForm.registrationNo}
                    onChange={(e) => setFirmForm({ ...firmForm, registrationNo: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Primary Currency Symbol"
                    value={firmForm.currencySymbol}
                    onChange={(e) => setFirmForm({ ...firmForm, currencySymbol: e.target.value })}
                    fullWidth
                    size="small"
                    helperText="e.g. ₹ (INR), $ (USD), £ (GBP), € (EUR), AED"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Chamber Complex Address"
                    value={firmForm.firmAddress}
                    onChange={(e) => setFirmForm({ ...firmForm, firmAddress: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Accounts Department Email"
                    value={firmForm.contactEmail}
                    onChange={(e) => setFirmForm({ ...firmForm, contactEmail: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Chamber Landline Phone"
                    value={firmForm.contactPhone}
                    onChange={(e) => setFirmForm({ ...firmForm, contactPhone: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Alternate Mobile / Contact"
                    value={firmForm.altPhone}
                    onChange={(e) => setFirmForm({ ...firmForm, altPhone: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Official Website URL"
                    value={firmForm.websiteUrl}
                    onChange={(e) => setFirmForm({ ...firmForm, websiteUrl: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                {/* Report Signatures & Disclaimers */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mt: 1, mb: 2 }}>
                    Official Report Signatures & Audit Footers
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Signature 1: Preparation By"
                    value={firmForm.signaturePreparedBy}
                    onChange={(e) => setFirmForm({ ...firmForm, signaturePreparedBy: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Signature 2: Audit & Verification By"
                    value={firmForm.signatureVerifiedBy}
                    onChange={(e) => setFirmForm({ ...firmForm, signatureVerifiedBy: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Signature 3: Approval By"
                    value={firmForm.signatureApprovedBy}
                    onChange={(e) => setFirmForm({ ...firmForm, signatureApprovedBy: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="PDF Report Main Header Title"
                    value={firmForm.reportHeader}
                    onChange={(e) => setFirmForm({ ...firmForm, reportHeader: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Official Audit Disclaimer Text"
                    value={firmForm.reportDisclaimer}
                    onChange={(e) => setFirmForm({ ...firmForm, reportDisclaimer: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>

                {/* Boss Delegation & Authority Permissions */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: "1px solid #cbd5e1",
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <AdminPanelSettingsIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                        Boss Delegation & Operational Authority (Accounts Admin Permissions)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 2 }}>
                      Empower Accounts Admins (Office Manager / Chief of Accounts) to register new litigation matters and courts directly when the Managing Partner is engaged in court hearings or unavailable.
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid #e2e8f0",
                            borderRadius: 1.5,
                            backgroundColor: firmForm.allowAccountsAdminCases ? "#f0fdf4" : "#ffffff",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firmForm.allowAccountsAdminCases !== false}
                                onChange={(e) =>
                                  setFirmForm({ ...firmForm, allowAccountsAdminCases: e.target.checked })
                                }
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                                  Delegate Case Registry Entry
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow Accounts Admin to add, edit & archive Case Matters
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid #e2e8f0",
                            borderRadius: 1.5,
                            backgroundColor: firmForm.allowAccountsAdminForums ? "#f0fdf4" : "#ffffff",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firmForm.allowAccountsAdminForums !== false}
                                onChange={(e) =>
                                  setFirmForm({ ...firmForm, allowAccountsAdminForums: e.target.checked })
                                }
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                                  Delegate Courts & Forums Entry
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow Accounts Admin to register Courts, Tribunals & Forums
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    sx={{
                      fontWeight: 800,
                      py: 1.3,
                      px: 4,
                      backgroundColor: "#0f2942",
                      boxShadow: "0 4px 14px rgba(15, 41, 66, 0.25)",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Save All Law Firm Details
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== TAB 4: BRANDING, HEADER & FAVICON ==================== */}
      {activeTab === 4 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Branding, Top Header & Favicon Customization
              </Typography>
              <Typography variant="body2" color="#334155">
                Customize website favicon, navigation bar color theme, brand title, and official logo graphics.
              </Typography>
            </Box>

            <form onSubmit={handleSaveBranding}>
              <Grid container spacing={3}>
                {/* Favicon Settings */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #cbd5e1", borderRadius: 2, backgroundColor: "#f8fafc" }}>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
                      Website Favicon (Browser Tab Icon)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Preset Legal Favicons"
                          value={brandForm.faviconType}
                          onChange={(e) => setBrandForm({ ...brandForm, faviconType: e.target.value })}
                        >
                          <MenuItem value="scales">⚖️ Scales of Justice (Gold on Navy)</MenuItem>
                          <MenuItem value="gavel">🔨 Judicial Gavel (Dark Gold)</MenuItem>
                          <MenuItem value="pillar">🏛️ Supreme Court Pillar (Royal Blue)</MenuItem>
                          <MenuItem value="shield">🛡️ Advocate Shield (Gold on Crimson)</MenuItem>
                          <MenuItem value="emerald">🟢 Emerald Justice (Corporate Law)</MenuItem>
                          <MenuItem value="navy">🔵 Prestigious Navy Monogram</MenuItem>
                          <MenuItem value="royal">🟣 Imperial Silk Purple</MenuItem>
                          <MenuItem value="custom_url">🔗 Custom Image URL</MenuItem>
                        </TextField>
                      </Grid>

                      {brandForm.faviconType === "custom_url" && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Custom Favicon Image URL (.png / .ico / .svg)"
                            placeholder="https://example.com/favicon.png"
                            value={brandForm.customFaviconUrl}
                            onChange={(e) => setBrandForm({ ...brandForm, customFaviconUrl: e.target.value })}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} color="#334155">
                            Active Favicon Preview:
                          </Typography>
                          <Box
                            component="img"
                            src={
                              brandForm.faviconType === "custom_url" && brandForm.customFaviconUrl
                                ? brandForm.customFaviconUrl
                                : PRESET_FAVICONS[brandForm.faviconType] || PRESET_FAVICONS.scales
                            }
                            alt="Favicon preview"
                            sx={{ width: 28, height: 28, borderRadius: 1, border: "1px solid #cbd5e1" }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Header Navbar Theme */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #cbd5e1", borderRadius: 2, backgroundColor: "#f8fafc" }}>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
                      Header Background & Logo Customization
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Navbar Brand Title"
                          value={brandForm.navbarTitle}
                          onChange={(e) => setBrandForm({ ...brandForm, navbarTitle: e.target.value })}
                          helperText="Overrides firm title in the top navigation bar"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Navbar Logo Icon"
                          value={brandForm.navbarIconType}
                          onChange={(e) => setBrandForm({ ...brandForm, navbarIconType: e.target.value })}
                        >
                          <MenuItem value="gavel">🔨 Judicial Gavel</MenuItem>
                          <MenuItem value="scales">⚖️ Scales of Justice</MenuItem>
                          <MenuItem value="pillar">🏛️ Classical Law Pillar</MenuItem>
                          <MenuItem value="shield">🛡️ Advocate Shield</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Custom Logo Image URL (Optional)"
                          placeholder="https://example.com/logo.png"
                          value={brandForm.customLogoUrl}
                          onChange={(e) => setBrandForm({ ...brandForm, customLogoUrl: e.target.value })}
                          helperText="Replaces the icon with your graphic logo if provided"
                        />
                      </Grid>

                      {/* Header Color Presets */}
                      <Grid item xs={12}>
                        <Typography variant="caption" fontWeight={800} color="#334155" sx={{ display: "block", mb: 1 }}>
                          HEADER BACKGROUND PRESETS:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                          {COLOR_PRESETS.map((p) => (
                            <Button
                              key={p.hex}
                              size="small"
                              variant={brandForm.headerBgColor === p.hex ? "contained" : "outlined"}
                              onClick={() => setBrandForm({ ...brandForm, headerBgColor: p.hex })}
                              sx={{
                                backgroundColor: brandForm.headerBgColor === p.hex ? p.hex : "transparent",
                                color: brandForm.headerBgColor === p.hex ? "#fff" : "#0f172a",
                                borderColor: p.hex,
                                fontWeight: 700,
                                fontSize: "0.78rem",
                              }}
                            >
                              <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: p.hex, mr: 1 }} />
                              {p.name}
                            </Button>
                          ))}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Custom Header Hex Color"
                          value={brandForm.headerBgColor}
                          onChange={(e) => setBrandForm({ ...brandForm, headerBgColor: e.target.value })}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Header Accent Color"
                          value={brandForm.headerAccentColor}
                          onChange={(e) => setBrandForm({ ...brandForm, headerAccentColor: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    sx={{
                      fontWeight: 800,
                      py: 1.3,
                      px: 4,
                      backgroundColor: "#0f2942",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Save All Branding & Favicon Settings
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== TAB 5: STAFF DIRECTORY & 1-CLICK ACCESS CONTROL ==================== */}
      {activeTab === 5 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Staff Directory & 1-Click Role Access Control
              </Typography>
              <Chip label="NO PASSWORDS REQUIRED" size="small" color="success" sx={{ fontWeight: 800, fontSize: "0.68rem" }} />
            </Box>
            <Typography variant="body2" color="#334155" sx={{ mt: 0.5 }}>
              As the Software Admin, you possess full sovereignty to assign staff access, Accounts Admin (Boss) access, or Software Admin access directly from the dropdown or quick action buttons below.
            </Typography>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", sm: "none" },
              px: 2.5,
              py: 0.8,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              fontStyle: "italic",
            }}
          >
            ⇄ Swipe horizontally to manage roles & permissions
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Official Email</TableCell>
                  <TableCell align="center">Current Role</TableCell>
                  <TableCell align="center" sx={{ minWidth: 260 }}>1-Click Role Assignment</TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>
                        No registered users yet. Staff accounts appear here automatically upon Google or Email login.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.uid} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {u.displayName}
                        </Typography>
                        <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.7rem" }}>
                          UID: {u.uid}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#0f172a">
                          {u.email}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <RoleBadge role={u.role} />
                      </TableCell>

                      {/* 1-CLICK INSTANT ROLE SELECTOR & ACTION BUTTONS */}
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 170 }}>
                            <Select
                              value={u.role || "staff"}
                              onChange={(e) => handleDirectRoleChange(u.uid, e.target.value, u.displayName)}
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                borderRadius: 1.5,
                                backgroundColor:
                                  u.role === "software_admin" ? "#f3e8ff" :
                                  u.role === "accounts_admin" ? "#e0f2fe" : "#f1f5f9",
                                color:
                                  u.role === "software_admin" ? "#7e22ce" :
                                  u.role === "accounts_admin" ? "#0369a1" : "#334155",
                              }}
                            >
                              <MenuItem value="staff" sx={{ fontWeight: 700 }}>
                                🟢 Staff Member
                              </MenuItem>
                              <MenuItem value="accounts_admin" sx={{ fontWeight: 700 }}>
                                🔵 Accounts Admin (Boss)
                              </MenuItem>
                              <MenuItem value="software_admin" sx={{ fontWeight: 700 }}>
                                🟣 Software Admin
                              </MenuItem>
                            </Select>
                          </FormControl>

                          {/* Quick Set Buttons */}
                          {u.role !== "accounts_admin" && (
                            <Tooltip title="Promote to Boss / Accounts Admin">
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => handleDirectRoleChange(u.uid, "accounts_admin", u.displayName)}
                                sx={{ py: 0.3, px: 1, fontSize: "0.7rem", fontWeight: 800 }}
                              >
                                + Boss
                              </Button>
                            </Tooltip>
                          )}
                          {u.role !== "software_admin" && (
                            <Tooltip title="Grant Master Software Admin Privileges">
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleDirectRoleChange(u.uid, "software_admin", u.displayName)}
                                sx={{ py: 0.3, px: 1, fontSize: "0.7rem", fontWeight: 800 }}
                              >
                                + Admin
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                          <Tooltip title="Send password reset link via Firebase Auth">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResetUserPassword(u.email)}
                              sx={{ border: "1px solid #cbd5e1", borderRadius: 1.5 }}
                            >
                              <LockResetIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(u.email || "").toLowerCase() === "advocate@boidikghosh.in" || u.uid === currentUser?.uid ? (
                            <Tooltip title="Primary Master Software Admin cannot be deleted">
                              <span>
                                <IconButton size="small" disabled sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5 }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Delete staff account (with or without past records)">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setStaffToDelete(u);
                                  setDeleteStaffOption("keep_data");
                                  setOpenDeleteStaffModal(true);
                                }}
                                sx={{ border: "1px solid #fecaca", borderRadius: 1.5, "&:hover": { bgcolor: "#fee2e2" } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Quick Danger Zone Navigation Bar */}
          <Box sx={{ p: 2, bgcolor: "#fff5f5", borderTop: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={800} color="#991b1b">
                Database Administration & Data Management
              </Typography>
              <Typography variant="caption" color="#7f1d1d">
                Need to wipe all test records or reset the firm database in entirety?
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setActiveTab(9)}
              sx={{ fontWeight: 800, borderColor: "#dc2626" }}
            >
              Open Danger Zone (Delete All Data)
            </Button>
          </Box>
        </Card>
      )}

      {/* ==================== TAB 6: PDF REPORT STUDIO & ENGINE ==================== */}
      {activeTab === 6 && (
        <Box>
          {/* Header Action Bar */}
          <Card sx={{ mb: 3, border: "1px solid #cbd5e1", borderRadius: 2 }}>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <PictureAsPdfIcon sx={{ color: "#0f2942", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    PDF Report Studio & Pixel Layout Engine
                  </Typography>
                </Box>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                  Fine-tune every margin, color hex, column toggle, table font size, and signatory block for generated audit statements.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetPdfLayout}
                  sx={{ fontWeight: 700, flex: { xs: "1 1 auto", sm: "none" } }}
                >
                  Reset Defaults
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownloadSamplePDF}
                  sx={{
                    fontWeight: 800,
                    backgroundColor: "#c99738",
                    color: "#0f172a",
                    "&:hover": { backgroundColor: "#b3852e" },
                    flex: { xs: "1 1 auto", sm: "none" },
                  }}
                >
                  Download Live Sample PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSavePdfLayout}
                  sx={{
                    fontWeight: 800,
                    backgroundColor: "#0f2942",
                    flex: { xs: "1 1 auto", sm: "none" },
                  }}
                >
                  Save PDF Layout
                </Button>
              </Box>
            </Box>
          </Card>

          <Grid container spacing={3}>
            {/* LEFT COLUMN: Controls Studio */}
            <Grid item xs={12} lg={7}>
              {/* SECTION 1: Page Geometry & Paper Dimensions */}
              <Card sx={{ mb: 3, border: "1px solid #cbd5e1" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LayersIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      1. Page Geometry & Paper Format
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Page Orientation"
                        value={pdfForm.orientation}
                        onChange={(e) => setPdfForm({ ...pdfForm, orientation: e.target.value })}
                      >
                        <MenuItem value="portrait">📄 Portrait (Vertical Standard)</MenuItem>
                        <MenuItem value="landscape">📑 Landscape (Wide Horizontal Ledger)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Paper Standard Format"
                        value={pdfForm.format}
                        onChange={(e) => setPdfForm({ ...pdfForm, format: e.target.value })}
                      >
                        <MenuItem value="a4">A4 (210 × 297 mm - Indian Courts Standard)</MenuItem>
                        <MenuItem value="letter">US Letter (8.5 × 11 in)</MenuItem>
                        <MenuItem value="legal">US Legal (8.5 × 14 in - Extended Pleadings)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={700} color="#334155" gutterBottom>
                        Printable Page Margin: {pdfForm.marginMm} mm
                      </Typography>
                      <Slider
                        value={Number(pdfForm.marginMm) || 14}
                        min={8}
                        max={28}
                        step={1}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, marginMm: val })}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 8, label: "8mm (Dense)" },
                          { value: 14, label: "14mm (Standard)" },
                          { value: 24, label: "24mm (Spacious)" },
                        ]}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={700} color="#334155" gutterBottom>
                        Header Banner Height: {pdfForm.bannerHeight} mm
                      </Typography>
                      <Slider
                        value={Number(pdfForm.bannerHeight) || 28}
                        min={18}
                        max={45}
                        step={1}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, bannerHeight: val })}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 20, label: "20mm" },
                          { value: 28, label: "28mm (Default)" },
                          { value: 40, label: "40mm" },
                        ]}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SECTION 2: Visual Identity & Color Theme */}
              <Card sx={{ mb: 3, border: "1px solid #cbd5e1" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PaletteIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      2. Visual Identity & Color Palette
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Header Banner Style"
                        value={pdfForm.bannerStyle}
                        onChange={(e) => setPdfForm({ ...pdfForm, bannerStyle: e.target.value })}
                      >
                        <MenuItem value="full_banner">Solid Color Full Width Banner</MenuItem>
                        <MenuItem value="boxed">Boxed Letterhead Container</MenuItem>
                        <MenuItem value="double_rule">Classic Double Gold Rule</MenuItem>
                        <MenuItem value="minimal">Minimalist Clean Line</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: "block", mb: 0.5 }}>
                        Primary Theme Color: {pdfForm.primaryColor}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                          type="color"
                          value={pdfForm.primaryColor || "#0f2942"}
                          onChange={(e) => setPdfForm({ ...pdfForm, primaryColor: e.target.value })}
                          style={{ width: 44, height: 36, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                        />
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {COLOR_PRESETS.map((c) => (
                            <Box
                              key={c.hex}
                              onClick={() => setPdfForm({ ...pdfForm, primaryColor: c.hex })}
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                backgroundColor: c.hex,
                                cursor: "pointer",
                                border: pdfForm.primaryColor === c.hex ? "2px solid #000" : "1px solid #cbd5e1",
                              }}
                              title={c.name}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: "block", mb: 0.5 }}>
                        Accent Highlight Color: {pdfForm.accentColor}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                          type="color"
                          value={pdfForm.accentColor || "#c99738"}
                          onChange={(e) => setPdfForm({ ...pdfForm, accentColor: e.target.value })}
                          style={{ width: 44, height: 36, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                        />
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {["#c99738", "#f59e0b", "#10b981", "#2563eb", "#ef4444", "#8b5cf6"].map((hex) => (
                            <Box
                              key={hex}
                              onClick={() => setPdfForm({ ...pdfForm, accentColor: hex })}
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                backgroundColor: hex,
                                cursor: "pointer",
                                border: pdfForm.accentColor === hex ? "2px solid #000" : "1px solid #cbd5e1",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: "block", mb: 0.5 }}>
                        Alternate Table Row Shading: {pdfForm.alternateRowColor}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                          type="color"
                          value={pdfForm.alternateRowColor || "#f8fafc"}
                          onChange={(e) => setPdfForm({ ...pdfForm, alternateRowColor: e.target.value })}
                          style={{ width: 44, height: 36, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                        />
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {["#f8fafc", "#f1f5f9", "#fefce8", "#ffffff"].map((hex) => (
                            <Box
                              key={hex}
                              onClick={() => setPdfForm({ ...pdfForm, alternateRowColor: hex })}
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                backgroundColor: hex,
                                cursor: "pointer",
                                border: pdfForm.alternateRowColor === hex ? "2px solid #000" : "1px solid #cbd5e1",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SECTION 3: Titles, Headers & Summary Cards */}
              <Card sx={{ mb: 3, border: "1px solid #cbd5e1" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <VisibilityIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      3. Document Header Titles & Visibility Toggles
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Top Header Title (Leave blank to use Law Firm Name)"
                        value={pdfForm.headerTitle}
                        onChange={(e) => setPdfForm({ ...pdfForm, headerTitle: e.target.value })}
                        placeholder={settings.firmName || "OJ Legal Advocates & Solicitors"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        Header Font Size: {pdfForm.headerTitleFontSize} pt
                      </Typography>
                      <Slider
                        value={Number(pdfForm.headerTitleFontSize) || 13}
                        min={10}
                        max={20}
                        step={0.5}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, headerTitleFontSize: val })}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Statement Title"
                        value={pdfForm.statementTitle}
                        onChange={(e) => setPdfForm({ ...pdfForm, statementTitle: e.target.value })}
                        placeholder="ITEMIZED EXPENDITURE & DISBURSEMENT STATEMENT"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        Statement Font Size: {pdfForm.statementTitleFontSize} pt
                      </Typography>
                      <Slider
                        value={Number(pdfForm.statementTitleFontSize) || 11}
                        min={9}
                        max={16}
                        step={0.5}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, statementTitleFontSize: val })}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showAddress !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showAddress: e.target.checked })}
                          />
                        }
                        label="Print Law Firm Address & Chambers"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showDateStatus !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showDateStatus: e.target.checked })}
                          />
                        }
                        label="Print Generation Date & Audit Status"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showFilterBox !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showFilterBox: e.target.checked })}
                          />
                        }
                        label="Print Report Scope & Filter Box"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showKpiCards !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showKpiCards: e.target.checked })}
                          />
                        }
                        label="Print Executive Financial KPI Cards"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SECTION 4: Table Styling & Individual Column Visibility */}
              <Card sx={{ mb: 3, border: "1px solid #cbd5e1" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <ReceiptLongIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      4. Table Geometry & Column Visibility (Dot-by-Dot Control)
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Table Theme Style"
                        value={pdfForm.tableTheme}
                        onChange={(e) => setPdfForm({ ...pdfForm, tableTheme: e.target.value })}
                      >
                        <MenuItem value="striped">Striped Rows</MenuItem>
                        <MenuItem value="grid">Complete Grid Lines</MenuItem>
                        <MenuItem value="plain">Minimal Plain Lines</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        Table Font Size: {pdfForm.tableFontSize} pt
                      </Typography>
                      <Slider
                        value={Number(pdfForm.tableFontSize) || 7.5}
                        min={6}
                        max={11}
                        step={0.5}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, tableFontSize: val })}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        Cell Padding: {pdfForm.tableCellPadding} mm
                      </Typography>
                      <Slider
                        value={Number(pdfForm.tableCellPadding) || 2}
                        min={1}
                        max={5}
                        step={0.5}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, tableCellPadding: val })}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                        Table Columns to Print:
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 1.5, backgroundColor: "#f8fafc" }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnIndex !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnIndex: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}># Index</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnDate !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnDate: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Date</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnCase !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnCase: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Case / Matter</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnDescription !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnDescription: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Description</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnCategory !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnCategory: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Category</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnPaymentMode !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnPaymentMode: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Payment Mode</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnStaffName !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnStaffName: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Associate Name</Typography>}
                            />
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={pdfForm.showColumnAmount !== false}
                                  onChange={(e) => setPdfForm({ ...pdfForm, showColumnAmount: e.target.checked })}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" fontWeight={600}>Voucher Amount</Typography>}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SECTION 5: Legal Disclaimer, Signatures & Footer */}
              <Card sx={{ border: "1px solid #cbd5e1" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <AdminPanelSettingsIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      5. Legal Disclaimer, Signatory Blocks & Footer
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showDisclaimer !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showDisclaimer: e.target.checked })}
                          />
                        }
                        label="Print Legal Disclaimer"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.disclaimerItalic !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, disclaimerItalic: e.target.checked })}
                          />
                        }
                        label="Italicized Disclaimer"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" fontWeight={700} color="#334155">
                        Disclaimer Size: {pdfForm.disclaimerFontSize} pt
                      </Typography>
                      <Slider
                        value={Number(pdfForm.disclaimerFontSize) || 6.8}
                        min={5}
                        max={9}
                        step={0.2}
                        onChange={(e, val) => setPdfForm({ ...pdfForm, disclaimerFontSize: val })}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showSignatures !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showSignatures: e.target.checked })}
                          />
                        }
                        label="Print Signatory Blocks"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Number of Signatories"
                        value={pdfForm.signatureCount || 3}
                        onChange={(e) => setPdfForm({ ...pdfForm, signatureCount: Number(e.target.value) })}
                      >
                        <MenuItem value={2}>2 Signers (Prepared By & Approved By)</MenuItem>
                        <MenuItem value={3}>3 Signers (Prepared, Verified & Approved)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Signer 1 Designation"
                        value={pdfForm.signer1Label}
                        onChange={(e) => setPdfForm({ ...pdfForm, signer1Label: e.target.value })}
                        placeholder={settings.signaturePreparedBy || "Prepared by Staff Associate"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Signer 2 Designation"
                        value={pdfForm.signer2Label}
                        onChange={(e) => setPdfForm({ ...pdfForm, signer2Label: e.target.value })}
                        placeholder={settings.signatureVerifiedBy || "Verified by Accounts Admin"}
                      />
                    </Grid>

                    {pdfForm.signatureCount === 3 && (
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Signer 3 Designation"
                          value={pdfForm.signer3Label}
                          onChange={(e) => setPdfForm({ ...pdfForm, signer3Label: e.target.value })}
                          placeholder={settings.signatureApprovedBy || "Approved by Managing Partner"}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showSignatureDates !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showSignatureDates: e.target.checked })}
                          />
                        }
                        label="Include Signature Date Lines"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pdfForm.showFooter !== false}
                            onChange={(e) => setPdfForm({ ...pdfForm, showFooter: e.target.checked })}
                          />
                        }
                        label="Print Page Footers & Numbering"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Footer Notice Text"
                        value={pdfForm.footerText}
                        onChange={(e) => setPdfForm({ ...pdfForm, footerText: e.target.value })}
                        placeholder="Confidential Client Disbursement Record • Attorney-Client Privileged"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT COLUMN: Live Interactive Visual Sheet Preview */}
            <Grid item xs={12} lg={5}>
              <Box sx={{ position: { lg: "sticky" }, top: 24 }}>
                <Card sx={{ border: "2px solid #cbd5e1", borderRadius: 2, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
                  <Box sx={{ p: 2, bgcolor: "#0f2942", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VisibilityIcon sx={{ fontSize: 18, color: "#c99738" }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        Live Sheet Preview (Simulated {pdfForm.format?.toUpperCase()} / {pdfForm.orientation})
                      </Typography>
                    </Box>
                    <Chip
                      label={`${pdfForm.marginMm}mm Margins`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  </Box>

                  {/* Simulated PDF Paper Canvas */}
                  <Box
                    sx={{
                      p: `${Math.max(10, Math.min(28, pdfForm.marginMm))}px`,
                      bgcolor: "#ffffff",
                      minHeight: 520,
                      fontSize: "0.75rem",
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.04)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Simulated Header Banner */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: pdfForm.bannerStyle === "boxed" ? 1.5 : 0,
                        border: pdfForm.bannerStyle === "boxed" ? `1.5px solid ${pdfForm.primaryColor || "#0f2942"}` : "none",
                        borderBottom: pdfForm.bannerStyle === "minimal" ? `2px solid ${pdfForm.primaryColor || "#0f2942"}` : pdfForm.bannerStyle === "double_rule" ? `3px double ${pdfForm.accentColor || "#c99738"}` : `2px solid ${pdfForm.accentColor || "#c99738"}`,
                        backgroundColor: pdfForm.bannerStyle === "full_banner" ? (pdfForm.primaryColor || "#0f2942") : "transparent",
                        color: pdfForm.bannerStyle === "full_banner" ? "#ffffff" : (pdfForm.primaryColor || "#0f2942"),
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: `${(Number(pdfForm.headerTitleFontSize) || 13) * 0.9}px`,
                          fontWeight: 800,
                          letterSpacing: "0.03em",
                          lineHeight: 1.2,
                        }}
                      >
                        {(pdfForm.headerTitle || settings.firmName || "OJ LEGAL ADVOCATES & SOLICITORS").toUpperCase()}
                      </Typography>

                      <Typography sx={{ fontSize: "0.68rem", opacity: 0.85, mt: 0.3 }}>
                        {settings.tagline || "Advocates & Legal Consultants • Litigation Advisory"}
                      </Typography>

                      {pdfForm.showAddress !== false && (
                        <Typography sx={{ fontSize: "0.62rem", opacity: 0.75, mt: 0.2 }}>
                          {settings.firmAddress || "High Court Chamber Complex, Legal Enclave"}
                        </Typography>
                      )}
                    </Box>

                    {/* Statement Title */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: `${(Number(pdfForm.statementTitleFontSize) || 11) * 0.9}px`,
                          fontWeight: 800,
                          color: pdfForm.primaryColor || "#0f2942",
                        }}
                      >
                        {pdfForm.statementTitle || "ITEMIZED EXPENDITURE & DISBURSEMENT STATEMENT"}
                      </Typography>

                      {pdfForm.showDateStatus !== false && (
                        <Typography sx={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 600 }}>
                          {new Date().toISOString().split("T")[0]} • AUDITED
                        </Typography>
                      )}
                    </Box>

                    {/* Simulated Filter Scope Box */}
                    {pdfForm.showFilterBox !== false && (
                      <Box sx={{ p: 1, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, mb: 1.5 }}>
                        <Typography sx={{ fontSize: "0.62rem", color: "#475569" }}>
                          <strong>Case:</strong> All Active Matters | <strong>Staff:</strong> All Associates | <strong>Range:</strong> FY 2026-27
                        </Typography>
                      </Box>
                    )}

                    {/* Simulated Executive KPI Summary Cards */}
                    {pdfForm.showKpiCards !== false && (
                      <Grid container spacing={1} sx={{ mb: 1.5 }}>
                        <Grid item xs={3}>
                          <Box sx={{ p: 0.8, bgcolor: "#f1f5f9", borderRadius: 1, textAlign: "center", border: "1px solid #e2e8f0" }}>
                            <Typography sx={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 700 }}>TOTAL</Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: pdfForm.primaryColor || "#0f2942" }}>₹2,73,500</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ p: 0.8, bgcolor: "#eff6ff", borderRadius: 1, textAlign: "center", border: "1px solid #bfdbfe" }}>
                            <Typography sx={{ fontSize: "0.55rem", color: "#1d4ed8", fontWeight: 700 }}>LEGAL</Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e40af" }}>₹1,70,000</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ p: 0.8, bgcolor: "#faf5ff", borderRadius: 1, textAlign: "center", border: "1px solid #e9d5ff" }}>
                            <Typography sx={{ fontSize: "0.55rem", color: "#7e22ce", fontWeight: 700 }}>TECH</Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b21a8" }}>₹85,000</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ p: 0.8, bgcolor: "#f0fdf4", borderRadius: 1, textAlign: "center", border: "1px solid #bbf7d0" }}>
                            <Typography sx={{ fontSize: "0.55rem", color: "#15803d", fontWeight: 700 }}>FLOAT</Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534" }}>₹15,000</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}

                    {/* Simulated Table */}
                    <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden", mb: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: pdfForm.primaryColor || "#0f2942" }}>
                          <TableRow>
                            {pdfForm.showColumnIndex !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>#</TableCell>}
                            {pdfForm.showColumnDate !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Date</TableCell>}
                            {pdfForm.showColumnCase !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Matter</TableCell>}
                            {pdfForm.showColumnDescription !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Description</TableCell>}
                            {pdfForm.showColumnCategory !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Category</TableCell>}
                            {pdfForm.showColumnPaymentMode !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Mode</TableCell>}
                            {pdfForm.showColumnStaffName !== false && <TableCell sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Staff</TableCell>}
                            {pdfForm.showColumnAmount !== false && <TableCell align="right" sx={{ color: "#ffffff", fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, fontWeight: 800, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>Amount</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { idx: 1, date: "2026-04-10", matter: "Tata Motors v. CCI", desc: "Senior Counsel Consultation Fee", cat: "Counsel Briefing", mode: "Advance", staff: "Adv. Arjun", amt: "₹1,25,000" },
                            { idx: 2, date: "2026-04-11", matter: "Tech Mahindra v. Innovatech", desc: "Forensic Hard Drive Clone", cat: "Digital Forensics", mode: "Bank", staff: "Karan Patel", amt: "₹85,000" },
                            { idx: 3, date: "2026-04-12", matter: "State Bank v. Zenith", desc: "NCLT Filing Stamp & Paperbook", cat: "Court Registry", mode: "Cash", staff: "Adv. Priya", amt: "₹45,000" },
                          ].map((row, i) => (
                            <TableRow
                              key={row.idx}
                              sx={{
                                bgcolor: i % 2 === 1 && pdfForm.tableTheme === "striped" ? (pdfForm.alternateRowColor || "#f8fafc") : "#ffffff",
                                "& td": {
                                  borderBottom: pdfForm.tableTheme === "grid" ? "1px solid #cbd5e1" : "1px solid #f1f5f9",
                                  borderRight: pdfForm.tableTheme === "grid" ? "1px solid #cbd5e1" : "none",
                                },
                              }}
                            >
                              {pdfForm.showColumnIndex !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px`, fontWeight: 700 }}>{row.idx}</TableCell>}
                              {pdfForm.showColumnDate !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>{row.date}</TableCell>}
                              {pdfForm.showColumnCase !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px`, fontWeight: 600 }}>{row.matter}</TableCell>}
                              {pdfForm.showColumnDescription !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>{row.desc}</TableCell>}
                              {pdfForm.showColumnCategory !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>{row.cat}</TableCell>}
                              {pdfForm.showColumnPaymentMode !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>{row.mode}</TableCell>}
                              {pdfForm.showColumnStaffName !== false && <TableCell sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px` }}>{row.staff}</TableCell>}
                              {pdfForm.showColumnAmount !== false && <TableCell align="right" sx={{ fontSize: `${(Number(pdfForm.tableFontSize) || 7.5) * 0.9}px`, p: `${pdfForm.tableCellPadding || 2}px 4px`, fontWeight: 800 }}>{row.amt}</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>

                    {/* Simulated Disclaimer */}
                    {pdfForm.showDisclaimer !== false && (
                      <Box sx={{ p: 1, bgcolor: "#f8fafc", borderLeft: `3px solid ${pdfForm.accentColor || "#c99738"}`, mb: 2 }}>
                        <Typography
                          sx={{
                            fontSize: `${(Number(pdfForm.disclaimerFontSize) || 6.8) * 0.85}px`,
                            color: "#475569",
                            fontStyle: pdfForm.disclaimerItalic !== false ? "italic" : "normal",
                            lineHeight: 1.3,
                          }}
                        >
                          This financial statement is prepared strictly for internal billing verification and client disbursement reimbursement under Bar Council regulations.
                        </Typography>
                      </Box>
                    )}

                    {/* Simulated Signatory Blocks */}
                    {pdfForm.showSignatures !== false && (
                      <Box sx={{ pt: 2, display: "flex", justifyContent: "space-between", gap: 1, borderTop: "1px dashed #cbd5e1" }}>
                        <Box sx={{ textAlign: "center", flex: 1 }}>
                          <Box sx={{ width: "80%", height: 1, bgcolor: "#475569", mx: "auto", mb: 0.5 }} />
                          <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#1e293b" }}>
                            {pdfForm.signer1Label || settings.signaturePreparedBy || "Prepared by Staff"}
                          </Typography>
                          {pdfForm.showSignatureDates !== false && (
                            <Typography sx={{ fontSize: "0.52rem", color: "#94a3b8" }}>Date: _________</Typography>
                          )}
                        </Box>

                        <Box sx={{ textAlign: "center", flex: 1 }}>
                          <Box sx={{ width: "80%", height: 1, bgcolor: "#475569", mx: "auto", mb: 0.5 }} />
                          <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#1e293b" }}>
                            {pdfForm.signer2Label || settings.signatureVerifiedBy || "Verified by Accounts"}
                          </Typography>
                          {pdfForm.showSignatureDates !== false && (
                            <Typography sx={{ fontSize: "0.52rem", color: "#94a3b8" }}>Date: _________</Typography>
                          )}
                        </Box>

                        {pdfForm.signatureCount === 3 && (
                          <Box sx={{ textAlign: "center", flex: 1 }}>
                            <Box sx={{ width: "80%", height: 1, bgcolor: "#475569", mx: "auto", mb: 0.5 }} />
                            <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#1e293b" }}>
                              {pdfForm.signer3Label || settings.signatureApprovedBy || "Approved by Partner"}
                            </Typography>
                            {pdfForm.showSignatureDates !== false && (
                              <Typography sx={{ fontSize: "0.52rem", color: "#94a3b8" }}>Date: _________</Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Simulated Footer */}
                    {pdfForm.showFooter !== false && (
                      <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.55rem", color: "#94a3b8" }}>
                          {pdfForm.footerText || "Confidential Client Disbursement Record • Attorney-Client Privileged"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.55rem", color: "#94a3b8" }}>
                          Page 1 of 1
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ==================== TAB 7: FIREBASE CONFIGURATION ==================== */}
      {activeTab === 7 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Google Cloud Firestore & Firebase Auth Settings
              </Typography>
              <Typography variant="body2" color="#334155">
                Target Project: <strong>ojlegal-test</strong>. Connects live data across all users and devices.
              </Typography>
            </Box>

            <Alert
              severity={isFirebaseConfigured() ? "success" : "info"}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {isFirebaseConfigured()
                ? "Active: Connected directly to Google Cloud Firestore project 'ojlegal-test'."
                : "Notice: Currently running in local storage preview mode."}
            </Alert>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="API Key (apiKey)"
                  value={firebaseForm.apiKey}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Auth Domain (authDomain)"
                  value={firebaseForm.authDomain}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, authDomain: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Project ID (projectId)"
                  value={firebaseForm.projectId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Storage Bucket (storageBucket)"
                  value={firebaseForm.storageBucket}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, storageBucket: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Messaging Sender ID"
                  value={firebaseForm.messagingSenderId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, messagingSenderId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="App ID (appId)"
                  value={firebaseForm.appId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, appId: e.target.value })}
                />
              </Grid>

              {connectionMessage && (
                <Grid item xs={12}>
                  <Alert severity={connectionMessage.success ? "success" : "error"} sx={{ borderRadius: 2 }}>
                    {connectionMessage.message}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveFirebase}
                  sx={{ fontWeight: 800, backgroundColor: "#0f2942", width: { xs: "100%", sm: "auto" } }}
                >
                  Save Firebase Credentials
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleTestFirebase}
                  disabled={testingConnection}
                  sx={{ fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
                >
                  {testingConnection ? <CircularProgress size={20} /> : "Test Live Connection"}
                </Button>
                {isFirebaseConfigured() && (
                  <Button color="error" onClick={handleDisconnectFirebase} sx={{ fontWeight: 700, width: { xs: "100%", sm: "auto" } }}>
                    Disconnect
                  </Button>
                )}
              </Grid>

              {/* Firestore Security Rules Display */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      Firebase Console Firestore Security Rules
                    </Typography>
                    <Typography variant="caption" color="#334155" sx={{ display: "block" }}>
                      Paste these rules into <strong>Firebase Console &gt; Firestore Database &gt; Rules tab</strong> to enable delete and edit permissions for <code>advocate@boidikghosh.in</code> and administrators.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isMasterAdmin() {
      return isAuthenticated() && request.auth.token.email == 'advocate@boidikghosh.in';
    }
    function getUserRole() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) ?
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role : 'staff';
    }
    function isSoftwareAdmin() {
      return isAuthenticated() && (isMasterAdmin() || getUserRole() == 'software_admin');
    }
    function isAccountsAdmin() {
      return isAuthenticated() && (isSoftwareAdmin() || getUserRole() == 'accounts_admin');
    }
    match /system/{document=**} { allow read: if isAuthenticated(); allow write: if isSoftwareAdmin(); }
    match /cases/{caseId} { allow read: if isAuthenticated(); allow write: if isAccountsAdmin(); }
    match /categories/{catId} { allow read: if isAuthenticated(); allow write: if isSoftwareAdmin(); }
    match /forums/{forumId} { allow read: if isAuthenticated(); allow write: if isAccountsAdmin(); }
    match /expenses/{expenseId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAccountsAdmin() || (isAuthenticated() && resource.data.staffId == request.auth.uid);
    }
    match /advances/{advanceId} {
      allow read: if isAuthenticated();
      allow write: if isAccountsAdmin();
    }
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && (request.auth.uid == userId || isSoftwareAdmin());
      allow delete: if isSoftwareAdmin();
    }
  }
}`);
                      showNotification("Firestore Security Rules copied to clipboard!", "success");
                    }}
                    sx={{ fontWeight: 800 }}
                  >
                    Copy Rules to Clipboard
                  </Button>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "#0f172a",
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    borderRadius: 2,
                    overflowX: "auto",
                    maxHeight: 220,
                  }}
                >
                  <pre style={{ margin: 0 }}>{`// Publish these rules in Firebase Console > Firestore Database > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isMasterAdmin() {
      return isAuthenticated() && request.auth.token.email == 'advocate@boidikghosh.in';
    }
    function getUserRole() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) ?
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role : 'staff';
    }
    function isSoftwareAdmin() {
      return isAuthenticated() && (isMasterAdmin() || getUserRole() == 'software_admin');
    }
    function isAccountsAdmin() {
      return isAuthenticated() && (isSoftwareAdmin() || getUserRole() == 'accounts_admin');
    }
    match /system/{document=**} { allow read: if isAuthenticated(); allow write: if isSoftwareAdmin(); }
    match /cases/{caseId} { allow read: if isAuthenticated(); allow write: if isAccountsAdmin(); }
    match /categories/{catId} { allow read: if isAuthenticated(); allow write: if isSoftwareAdmin(); }
    match /forums/{forumId} { allow read: if isAuthenticated(); allow write: if isAccountsAdmin(); }
    match /expenses/{expenseId} {
      allow read: if isAuthenticated(); allow create: if isAuthenticated();
      allow update, delete: if isAccountsAdmin() || (isAuthenticated() && resource.data.staffId == request.auth.uid);
    }
    match /advances/{advanceId} {
      allow read: if isAuthenticated();
      allow write: if isAccountsAdmin();
    }
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && (request.auth.uid == userId || isSoftwareAdmin());
      allow delete: if isSoftwareAdmin();
    }
  }
}`}</pre>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ==================== TAB 8: MASTER VOUCHER EDITOR ==================== */}
      {activeTab === 8 && (
        <Card sx={{ border: "1px solid #cbd5e1" }}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              Master Expense & Voucher Oversight
            </Typography>
            <Typography variant="body2" color="#334155">
              As Software Admin, you possess master override authority to modify or delete any expense entry across all staff and cases.
            </Typography>
          </Box>
          <Divider />

          <Typography
            variant="caption"
            sx={{
              display: { xs: "block", sm: "none" },
              px: 2.5,
              py: 0.8,
              color: "#64748b",
              bgcolor: "#f1f5f9",
              fontStyle: "italic",
            }}
          >
            ⇄ Swipe horizontally to view full voucher logs & master actions
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID / Date</TableCell>
                  <TableCell>Case</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Staff Member</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Master Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>
                        No expense vouchers recorded in Firestore yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((exp) => (
                    <TableRow key={exp.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">{exp.id}</Typography>
                        <Typography variant="caption" color="#64748b">{exp.date}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0f172a">{exp.caseTitle}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="#334155">{exp.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="#334155">{exp.staffName}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {settings.currencySymbol || "₹"} {Number(exp.amount).toLocaleString()}
                        </Typography>
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
                            if (window.confirm(`Delete expense ${exp.id}?`)) {
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

      {/* ==================== TAB 9: SYSTEM RESET & DANGER ZONE ==================== */}
      {activeTab === 9 && (
        <Card sx={{ border: "2px solid #ef4444", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#fef2f2", p: { xs: 2, sm: 3 }, borderBottom: "1px solid #fecaca" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                  flexShrink: 0,
                }}
              >
                <DeleteForeverIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#991b1b" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  Master Data Wipe & System Reset (Danger Zone)
                </Typography>
                <Typography variant="body2" color="#7f1d1d" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  Irreversible operation: completely wipe all cases, expense vouchers, advance floats, categories, forums, and staff accounts from Firestore.
                </Typography>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800}>
                CRITICAL WARNING: This action cannot be reversed!
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: "0.85rem" }}>
                Executing this will purge all existing data in entirety across all collections in Google Cloud Firestore (<code>ojlegal-test</code>) and local cache.
                Only your primary administrator account (<code>advocate@boidikghosh.in</code>) will be preserved so you never lose master administrative control.
              </Typography>
            </Alert>

            {/* Inventory Breakdown */}
            <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
              Current Database Records to be Wiped:
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>CASES</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{cases.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>EXPENSES</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{expenses.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>ADVANCES</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{advances.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>COURTS</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{forums.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>CATEGORIES</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{categories.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #cbd5e1", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>USERS</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">{users.length}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                border: "1px dashed #ef4444",
                borderRadius: 2.5,
                bgcolor: "#fff5f5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="#991b1b">
                  Nuclear Master Purge
                </Typography>
                <Typography variant="body2" color="#7f1d1d" sx={{ fontSize: "0.85rem" }}>
                  Wipe all tables, clear test data, and reset database to pristine initial state.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<DeleteForeverIcon />}
                onClick={() => {
                  setConfirmPhrase("");
                  setOpenDeleteAllModal(true);
                }}
                sx={{
                  fontWeight: 800,
                  py: 1.3,
                  px: 3.5,
                  backgroundColor: "#dc2626",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                  "&:hover": { backgroundColor: "#b91c1c" },
                  width: { xs: "100%", sm: "auto" },
                  whiteSpace: "nowrap",
                }}
              >
                Delete All Data in Entirety
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Case Modal */}
      <CaseDialog open={openCaseModal} onClose={() => setOpenCaseModal(false)} caseToEdit={selectedCase} />

      {/* Court / Forum Modal */}
      <ForumDialog open={openForumModal} onClose={() => setOpenForumModal(false)} forumToEdit={selectedForum} />

      {/* Category Modal */}
      <CategoryDialog open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} categoryToEdit={selectedCategory} />

      {/* Expense Modal */}
      <ExpenseDialog open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} expenseToEdit={selectedExpense} />

      {/* ==================== DELETE STAFF MEMBER MODAL ==================== */}
      <Dialog
        open={openDeleteStaffModal}
        onClose={() => !deletingStaff && setOpenDeleteStaffModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, px: { xs: 2, sm: 3 } }}>
          <DeleteIcon color="error" />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              Delete Staff Member
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select whether to preserve or purge associated vouchers and advances
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
          {staffToDelete && (
            <>
              {/* Staff Member Info Banner */}
              <Paper elevation={0} sx={{ p: 2, mb: 2.5, bgcolor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  {staffToDelete.displayName || "Staff Member"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  {staffToDelete.email} • UID: {staffToDelete.uid}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <RoleBadge role={staffToDelete.role} size="small" />
                  <Chip
                    label={`${associatedExpenses.length} Expense Voucher(s)`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                  />
                  <Chip
                    label={`${associatedAdvances.length} Advance Float(s)`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                  />
                </Box>
              </Paper>

              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
                Choose Deletion Mode:
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={deleteStaffOption}
                  onChange={(e) => setDeleteStaffOption(e.target.value)}
                >
                  {/* Option 1: Keep Data */}
                  <Paper
                    elevation={0}
                    onClick={() => setDeleteStaffOption("keep_data")}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      border: "2px solid",
                      borderColor: deleteStaffOption === "keep_data" ? "#2563eb" : "#cbd5e1",
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: deleteStaffOption === "keep_data" ? "#eff6ff" : "#ffffff",
                      transition: "all 0.2s",
                    }}
                  >
                    <FormControlLabel
                      value="keep_data"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                            Delete Staff Member ONLY (Without deleting associated data)
                          </Typography>
                          <Typography variant="caption" color="#475569" sx={{ display: "block", mt: 0.3 }}>
                            Recommended for legal audit integrity. Removes the staff login and account, but keeps all {associatedExpenses.length} expense vouchers and {associatedAdvances.length} advances in the case ledger under their name.
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, alignItems: "flex-start" }}
                    />
                  </Paper>

                  {/* Option 2: Delete Data */}
                  <Paper
                    elevation={0}
                    onClick={() => setDeleteStaffOption("delete_data")}
                    sx={{
                      p: 2,
                      border: "2px solid",
                      borderColor: deleteStaffOption === "delete_data" ? "#dc2626" : "#cbd5e1",
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: deleteStaffOption === "delete_data" ? "#fef2f2" : "#ffffff",
                      transition: "all 0.2s",
                    }}
                  >
                    <FormControlLabel
                      value="delete_data"
                      control={<Radio color="error" />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#dc2626">
                            Delete Staff Member AND Delete Associated Data
                          </Typography>
                          <Typography variant="caption" color="#475569" sx={{ display: "block", mt: 0.3 }}>
                            Destructive action. Permanently deletes this staff member's account AND wipes all {associatedExpenses.length} expense vouchers and {associatedAdvances.length} advance floats logged by this associate.
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, alignItems: "flex-start" }}
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setOpenDeleteStaffModal(false)} color="inherit" disabled={deletingStaff} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={deleteStaffOption === "delete_data" ? "error" : "primary"}
            onClick={handleConfirmDeleteStaff}
            disabled={deletingStaff}
            startIcon={deletingStaff ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
            sx={{ fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
          >
            {deletingStaff
              ? "Deleting..."
              : deleteStaffOption === "delete_data"
              ? "Delete Staff & Associated Data"
              : "Delete Staff (Keep Records)"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== DELETE ALL DATA MODAL ==================== */}
      <Dialog
        open={openDeleteAllModal}
        onClose={() => !wipingAllData && setOpenDeleteAllModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, px: { xs: 2, sm: 3 }, bgcolor: "#fef2f2" }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#991b1b" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              Confirm Nuclear Wipe of Entire Database
            </Typography>
            <Typography variant="caption" color="#7f1d1d">
              This operation will permanently delete all records across all collections
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="#334155" sx={{ mb: 2 }}>
            You are about to permanently wipe <strong>all data</strong> from the Google Cloud Firestore database:
          </Typography>

          <Box component="ul" sx={{ pl: 2.5, mb: 2.5, color: "#475569", fontSize: "0.85rem", lineHeight: 1.7 }}>
            <li><strong>{cases.length} Cases</strong> in the case registry</li>
            <li><strong>{expenses.length} Expense Vouchers</strong> across all associates</li>
            <li><strong>{advances.length} Staff Advances</strong> & float histories</li>
            <li><strong>{categories.length} Expense Categories</strong></li>
            <li><strong>{forums.length} Registered Courts & Tribunals</strong></li>
            <li><strong>Staff & Boss Accounts</strong> (Sole master admin <code>advocate@boidikghosh.in</code> is preserved)</li>
            <li>Official firm branding & settings reset to standard defaults</li>
          </Box>

          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            To confirm, type <strong style={{ color: "#dc2626" }}>DELETE ALL DATA</strong> in uppercase below:
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="DELETE ALL DATA"
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
            disabled={wipingAllData}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                fontWeight: 700,
                color: confirmPhrase === "DELETE ALL DATA" ? "#dc2626" : "inherit",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setOpenDeleteAllModal(false)} color="inherit" disabled={wipingAllData} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteAllData}
            disabled={confirmPhrase !== "DELETE ALL DATA" || wipingAllData}
            startIcon={wipingAllData ? <CircularProgress size={18} color="inherit" /> : <DeleteForeverIcon />}
            sx={{ fontWeight: 800, width: { xs: "100%", sm: "auto" }, backgroundColor: "#dc2626" }}
          >
            {wipingAllData ? "Wiping Entire Database..." : "Permanently Delete All Data"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
