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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import TuneIcon from "@mui/icons-material/Tune";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CaseDialog from "../components/CaseDialog";
import CategoryDialog from "../components/CategoryDialog";
import ExpenseDialog from "../components/ExpenseDialog";
import RoleBadge from "../components/RoleBadge";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { PRESET_FAVICONS } from "../services/sampleData";
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

const ACCENT_PRESETS = [
  { name: "Legal Gold", hex: "#c99738" },
  { name: "Amber Warmth", hex: "#d97706" },
  { name: "High Court Cyan", hex: "#0284c7" },
  { name: "Emerald Green", hex: "#16a34a" },
  { name: "Imperial Bronze", hex: "#9f7324" },
];

export default function SoftwareAdminPage() {
  const { currentUser, resetPassword } = useAuth();
  const {
    cases,
    categories,
    users,
    expenses,
    settings,
    saveSettings,
    deleteCase,
    deleteCategory,
    deleteExpense,
    updateUserRole,
    seedStandardCategories,
    showNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);

  // Modals
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Comprehensive Settings State Form (Firm Details, Layout, Favicon, Header)
  const [settingsForm, setSettingsForm] = useState({
    firmName: settings.firmName || "OJ Legal Advocates & Solicitors",
    tagline: settings.tagline || "",
    registrationNo: settings.registrationNo || "",
    firmAddress: settings.firmAddress || "",
    contactEmail: settings.contactEmail || "",
    contactPhone: settings.contactPhone || "",
    altPhone: settings.altPhone || "",
    websiteUrl: settings.websiteUrl || "",
    currencySymbol: settings.currencySymbol || "₹",
    navbarTitle: settings.navbarTitle || settings.firmName || "OJ Legal Advocates",
    headerBgColor: settings.headerBgColor || "#0f2942",
    headerTextColor: settings.headerTextColor || "#ffffff",
    headerAccentColor: settings.headerAccentColor || "#c99738",
    navbarIconType: settings.navbarIconType || "gavel",
    customLogoUrl: settings.customLogoUrl || "",
    faviconType: settings.faviconType || "scales",
    customFaviconUrl: settings.customFaviconUrl || "",
    reportHeader: settings.reportHeader || "",
    reportDisclaimer: settings.reportDisclaimer || "",
    signaturePreparedBy: settings.signaturePreparedBy || "Prepared by Staff Associate",
    signatureVerifiedBy: settings.signatureVerifiedBy || "Verified by Accounts Admin (Boss)",
    signatureApprovedBy: settings.signatureApprovedBy || "Approved by Managing Partner",
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSettingsForm(prev => ({
        ...prev,
        ...settings,
      }));
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

  // Role Edit Dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("staff");

  const handleSaveFirmSettings = async (e) => {
    e.preventDefault();
    await saveSettings(settingsForm);
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

  const handleOpenRoleModal = (u) => {
    setUserToEdit(u);
    setSelectedNewRole(u.role);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (userToEdit) {
      await updateUserRole(userToEdit.uid, selectedNewRole);
      setRoleDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Software Admin & Master Control
          </Typography>
          <Chip label="MASTER ACCESS" size="small" sx={{ backgroundColor: "#7c3aed", color: "#fff", fontWeight: 800 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Configure cases, categories, user roles, firm layout, favicon, header styling, PDF reports, and Google Firestore.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<FolderSpecialIcon />} iconPosition="start" label={`Case Registry (${cases.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<CategoryIcon />} iconPosition="start" label={`Expense Categories (${categories.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<PaletteIcon />} iconPosition="start" label="Branding, UI & Header" sx={{ fontWeight: 700 }} />
          <Tab icon={<PeopleIcon />} iconPosition="start" label={`Staff & Permissions (${users.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<CloudQueueIcon />} iconPosition="start" label="Firebase & Firestore" sx={{ fontWeight: 700 }} />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Master Voucher Editor" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* ==================== TAB 0: CASES ==================== */}
      {activeTab === 0 && (
        <Card>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Approved Case Registry
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Staff can only select active cases registered here. Deactivating a case stops new expense submissions for it.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCase(null);
                setOpenCaseModal(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Register New Case
            </Button>
          </Box>
          <Divider />

          <TableContainer component={Paper} elevation={0}>
            <Table>
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
                      <Typography variant="body2" color="text.secondary">
                        No cases registered in Firestore yet. Click <strong>Register New Case</strong> to add your first law firm matter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {c.caseNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {c.id}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {c.title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{c.court}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{c.clientName || "N/A"}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{c.leadAttorney || "Unassigned"}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={c.status.toUpperCase()}
                          size="small"
                          color={c.status === "active" ? "success" : "default"}
                          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit case details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCase(c);
                              setOpenCaseModal(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete case">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Delete case ${c.caseNumber} - ${c.title}?`)) {
                                await deleteCase(c.id);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ==================== TAB 1: CATEGORIES ==================== */}
      {activeTab === 1 && (
        <Card>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Expense Categories & Audit Classifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Categories tagged 'Legal' or 'Technical' are separated in financial audits.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {categories.length === 0 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={seedStandardCategories}
                  sx={{ fontWeight: 700 }}
                >
                  Seed Standard Legal Categories
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCategory(null);
                  setOpenCategoryModal(true);
                }}
                sx={{ fontWeight: 700 }}
              >
                Add Category
              </Button>
            </Box>
          </Box>
          <Divider />

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Classification</TableCell>
                  <TableCell>Description / Guidelines</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No categories found in Firestore. Click <strong>Seed Standard Legal Categories</strong> to auto-populate standard Court Fees, Counsel Fees, and Forensics categories, or click <strong>Add Category</strong> to define custom ones.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {cat.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={cat.type.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            backgroundColor:
                              cat.type === "legal" ? "#1e40af15" :
                              cat.type === "technical" ? "#b4530915" : "#47556915",
                            color:
                              cat.type === "legal" ? "#1e40af" :
                              cat.type === "technical" ? "#b45309" : "#475569",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="body2" color="text.secondary">
                          {cat.description || "No specific guidelines provided."}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit category">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setOpenCategoryModal(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete category">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Delete category '${cat.name}'?`)) {
                                await deleteCategory(cat.id);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ==================== TAB 2: BRANDING, UI, FAVICON & HEADER ==================== */}
      {activeTab === 2 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>
                Law Firm Details, Header & UI Customizer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full control over the website's visual branding, favicon, header color theme, firm metadata, and PDF statements.
              </Typography>
            </Box>

            <form onSubmit={handleSaveFirmSettings}>
              {/* SECTION A: FAVICON CUSTOMIZATION */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "background.default" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <span>🌐</span> Browser Tab Favicon Settings
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Customize the icon appearing in browser tabs. Updates dynamically in real-time.
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select Favicon Style"
                      value={settingsForm.faviconType}
                      onChange={(e) => setSettingsForm({ ...settingsForm, faviconType: e.target.value })}
                    >
                      <MenuItem value="scales">⚖️ Scales of Justice (Gold Legal Shield)</MenuItem>
                      <MenuItem value="gavel">🔨 Judicial Gavel (Executive Navy)</MenuItem>
                      <MenuItem value="pillar">🏛️ Classical Law Pillar (Sky Blue)</MenuItem>
                      <MenuItem value="shield">🛡️ Protected Shield (Emerald)</MenuItem>
                      <MenuItem value="custom_url">🔗 Custom Favicon Image URL</MenuItem>
                    </TextField>
                  </Grid>

                  {settingsForm.faviconType === "custom_url" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Custom Favicon URL (.png, .svg, or .ico)"
                        placeholder="https://example.com/favicon.png"
                        value={settingsForm.customFaviconUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, customFaviconUrl: e.target.value })}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
                      <Typography variant="caption" fontWeight={600}>
                        Current Favicon Preview:
                      </Typography>
                      <Box
                        component="img"
                        src={
                          settingsForm.faviconType === "custom_url" && settingsForm.customFaviconUrl
                            ? settingsForm.customFaviconUrl
                            : PRESET_FAVICONS[settingsForm.faviconType] || PRESET_FAVICONS.scales
                        }
                        alt="Favicon preview"
                        sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* SECTION B: HEADER & NAVBAR STYLING */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "background.default" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <span>🎨</span> Header & Navigation Bar Customization
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Customize the top navbar background color, logo, and brand name.
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Navbar Brand Title"
                      value={settingsForm.navbarTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, navbarTitle: e.target.value })}
                      helperText="Overrides firm name in the top navigation bar"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Navbar Logo Icon"
                      value={settingsForm.navbarIconType}
                      onChange={(e) => setSettingsForm({ ...settingsForm, navbarIconType: e.target.value })}
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
                      placeholder="https://ojlegal.com/logo.png"
                      value={settingsForm.customLogoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, customLogoUrl: e.target.value })}
                      helperText="If provided, replaces the icon with your firm's graphic logo"
                    />
                  </Grid>

                  {/* Header Background Color Presets */}
                  <Grid item xs={12}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      HEADER BACKGROUND THEME PRESETS:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                      {COLOR_PRESETS.map((p) => (
                        <Button
                          key={p.hex}
                          size="small"
                          variant={settingsForm.headerBgColor === p.hex ? "contained" : "outlined"}
                          onClick={() => setSettingsForm({ ...settingsForm, headerBgColor: p.hex })}
                          sx={{
                            backgroundColor: settingsForm.headerBgColor === p.hex ? p.hex : "transparent",
                            color: settingsForm.headerBgColor === p.hex ? "#fff" : "text.primary",
                            borderColor: p.hex,
                            fontSize: "0.75rem",
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
                      value={settingsForm.headerBgColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, headerBgColor: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: settingsForm.headerBgColor, mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Header Accent Color"
                      value={settingsForm.headerAccentColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, headerAccentColor: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: settingsForm.headerAccentColor, mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* SECTION C: FIRM CONTACT & OFFICIAL DETAILS */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "background.default" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <span>🏛️</span> Official Law Firm Details
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  These details appear on official client invoices, vouchers, and generated PDF/Excel reports.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Official Law Firm Name"
                      value={settingsForm.firmName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, firmName: e.target.value })}
                      fullWidth
                      size="small"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Practice Tagline / Slogan"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Bar Council / Chamber Registration No"
                      value={settingsForm.registrationNo}
                      onChange={(e) => setSettingsForm({ ...settingsForm, registrationNo: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Currency Symbol"
                      value={settingsForm.currencySymbol}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                      fullWidth
                      size="small"
                      helperText="e.g. ₹ (INR), $ (USD), £ (GBP), € (EUR), AED"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Chamber Complex Address"
                      value={settingsForm.firmAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, firmAddress: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Accounts Department Email"
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Chamber Phone"
                      value={settingsForm.contactPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Alternate Phone / Mobile"
                      value={settingsForm.altPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, altPhone: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Official Website URL"
                      value={settingsForm.websiteUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* SECTION D: REPORT TEMPLATES & SIGNATURES */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "background.default" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <span>📑</span> PDF & Excel Report Header & Disclaimers
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="PDF Report Main Title Header"
                      value={settingsForm.reportHeader}
                      onChange={(e) => setSettingsForm({ ...settingsForm, reportHeader: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Official Bar Council Legal Certification & Disclaimer (Appears on PDF footer)"
                      value={settingsForm.reportDisclaimer}
                      onChange={(e) => setSettingsForm({ ...settingsForm, reportDisclaimer: e.target.value })}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Sign-off Block 1"
                      value={settingsForm.signaturePreparedBy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, signaturePreparedBy: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Sign-off Block 2"
                      value={settingsForm.signatureVerifiedBy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, signatureVerifiedBy: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Sign-off Block 3"
                      value={settingsForm.signatureApprovedBy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, signatureApprovedBy: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} sx={{ fontWeight: 700, py: 1.2, px: 4 }}>
                Save All UI & Branding Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== TAB 3: STAFF & USER PERMISSIONS ==================== */}
      {activeTab === 3 && (
        <Card>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Staff Directory, Roles & Password Administration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Assign roles (`staff`, `accounts_admin`, `software_admin`) and dispatch secure Firebase password resets.
            </Typography>
          </Box>
          <Divider />

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Official Email</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell align="center">System Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No registered users yet. Staff accounts will appear here automatically when they log in with Google or create an account.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.uid} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {u.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          UID: {u.uid}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{u.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{u.designation || "Staff Member"}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <RoleBadge role={u.role} />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenRoleModal(u)}
                          sx={{ mr: 1, fontSize: "0.75rem" }}
                        >
                          Change Role
                        </Button>
                        <Tooltip title="Send password reset link via Firebase">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleResetUserPassword(u.email)}
                          >
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ==================== TAB 4: FIREBASE CONFIGURATION ==================== */}
      {activeTab === 4 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Google Cloud Firestore & Firebase Auth Settings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Connect your website directly to your Google Cloud Firestore project.
              </Typography>
            </Box>

            <Alert
              severity={isFirebaseConfigured() ? "success" : "info"}
              sx={{ mb: 3 }}
            >
              {isFirebaseConfigured()
                ? `Connected to Google Firebase Project: ${firebaseForm.projectId}. All data is secured in Google Cloud.`
                : "The application is currently running in Local Offline Mode. Enter your Firebase project credentials below to connect live."}
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Firebase API Key"
                  value={firebaseForm.apiKey}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value.trim() })}
                  fullWidth
                  size="small"
                  placeholder="AIzaSy..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Project ID"
                  value={firebaseForm.projectId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value.trim() })}
                  fullWidth
                  size="small"
                  placeholder="ojlegal-test"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Auth Domain"
                  value={firebaseForm.authDomain}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, authDomain: e.target.value.trim() })}
                  fullWidth
                  size="small"
                  placeholder="ojlegal-test.firebaseapp.com"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Storage Bucket"
                  value={firebaseForm.storageBucket}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, storageBucket: e.target.value.trim() })}
                  fullWidth
                  size="small"
                  placeholder="ojlegal-test.firebasestorage.app"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Messaging Sender ID"
                  value={firebaseForm.messagingSenderId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, messagingSenderId: e.target.value.trim() })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="App ID"
                  value={firebaseForm.appId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, appId: e.target.value.trim() })}
                  fullWidth
                  size="small"
                />
              </Grid>

              {connectionMessage && (
                <Grid item xs={12}>
                  <Alert severity={connectionMessage.success ? "success" : "error"}>
                    {connectionMessage.message}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12} sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleTestFirebase}
                  disabled={testingConnection || !firebaseForm.apiKey || !firebaseForm.projectId}
                >
                  {testingConnection ? "Verifying..." : "Test Connection"}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSaveFirebase}
                  disabled={!firebaseForm.apiKey || !firebaseForm.projectId}
                  sx={{ fontWeight: 700 }}
                >
                  Save & Connect Firebase
                </Button>

                {isFirebaseConfigured() && (
                  <Button color="error" onClick={handleDisconnectFirebase}>
                    Disconnect
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ==================== TAB 5: MASTER VOUCHER EDITOR ==================== */}
      {activeTab === 5 && (
        <Card>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Master Expense & Voucher Oversight
            </Typography>
            <Typography variant="caption" color="text.secondary">
              As Software Admin, you possess master override access to edit or delete any voucher across all staff and cases.
            </Typography>
          </Box>
          <Divider />

          <TableContainer component={Paper} elevation={0}>
            <Table>
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
                      <Typography variant="body2" color="text.secondary">
                        No expense vouchers recorded in Firestore yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((exp) => (
                    <TableRow key={exp.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{exp.id}</Typography>
                        <Typography variant="caption" color="text.secondary">{exp.date}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{exp.caseTitle}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{exp.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{exp.staffName}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {settings.currencySymbol || "₹"} {Number(exp.amount).toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedExpense(exp);
                            setOpenExpenseModal(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async () => {
                            if (window.confirm(`Delete expense ${exp.id}?`)) {
                              await deleteExpense(exp.id);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Case Modal */}
      <CaseDialog open={openCaseModal} onClose={() => setOpenCaseModal(false)} caseToEdit={selectedCase} />

      {/* Category Modal */}
      <CategoryDialog open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} categoryToEdit={selectedCategory} />

      {/* Expense Modal */}
      <ExpenseDialog open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} expenseToEdit={selectedExpense} />

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Role for {userToEdit?.displayName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select
            label="Assigned Role"
            value={selectedNewRole}
            onChange={(e) => setSelectedNewRole(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="staff">Staff Member (Submit expenses & view advances)</MenuItem>
            <MenuItem value="accounts_admin">Accounts Admin / Boss (Audit, advances, reports)</MenuItem>
            <MenuItem value="software_admin">Software Admin (Master control)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRole}>Update Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
