import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  Divider,
  Alert,
  Chip,
  InputAdornment,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function ExpenseDialog({ open, onClose, expenseToEdit = null }) {
  const { currentUser } = useAuth();
  const { cases, categories, advances, settings, addExpense, updateExpense } = useApp();

  const currency = settings.currencySymbol || "₹";

  const defaultForm = {
    caseId: "",
    caseTitle: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().substring(0, 5),
    name: "",
    category: "",
    categoryType: "legal",
    amount: "",
    paymentMode: "cash",
    advanceId: "",
    notes: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only active cases can have expenses entered
  const activeCases = cases.filter(c => c.status === "active");

  // Get active advances available for this staff member
  const targetStaffId = expenseToEdit ? expenseToEdit.staffId : currentUser?.uid;
  const targetStaffEmail = expenseToEdit ? expenseToEdit.staffEmail : currentUser?.email;
  const targetStaffName = expenseToEdit ? expenseToEdit.staffName : currentUser?.displayName;

  const staffAdvances = advances.filter(
    a => (a.staffId === targetStaffId ||
          (targetStaffEmail && (a.staffEmail || "").toLowerCase() === targetStaffEmail.toLowerCase()) ||
          (targetStaffName && (a.staffName || "").toLowerCase() === targetStaffName.toLowerCase())) &&
         (a.amount - (a.usedAmount || 0) > 0)
  );

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        caseId: expenseToEdit.caseId || "",
        caseTitle: expenseToEdit.caseTitle || "",
        date: expenseToEdit.date || new Date().toISOString().split("T")[0],
        time: expenseToEdit.time || "12:00",
        name: expenseToEdit.name || "",
        category: expenseToEdit.category || "",
        categoryType: expenseToEdit.categoryType || "legal",
        amount: expenseToEdit.amount || "",
        paymentMode: expenseToEdit.paymentMode || "cash",
        advanceId: expenseToEdit.advanceId || "",
        notes: expenseToEdit.notes || "",
      });
    } else {
      setFormData({
        ...defaultForm,
        caseId: activeCases[0]?.id || "",
        caseTitle: activeCases[0]?.title || "",
        category: categories[0]?.name || "",
        categoryType: categories[0]?.type || "legal",
      });
    }
    setError("");
  }, [expenseToEdit, open]);

  const handleCaseChange = (e) => {
    const selectedId = e.target.value;
    const selectedCase = cases.find(c => c.id === selectedId);
    setFormData(prev => ({
      ...prev,
      caseId: selectedId,
      caseTitle: selectedCase ? selectedCase.title : "",
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedName = e.target.value;
    const selectedCat = categories.find(c => c.name === selectedName);
    setFormData(prev => ({
      ...prev,
      category: selectedName,
      categoryType: selectedCat ? selectedCat.type : "legal",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseId) {
      setError("Please select a valid case.");
      return;
    }
    if (!formData.name.trim()) {
      setError("Please enter the expense description / name.");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        staffId: expenseToEdit ? expenseToEdit.staffId : currentUser?.uid,
        staffName: expenseToEdit ? expenseToEdit.staffName : (currentUser?.displayName || "Staff Member"),
        staffEmail: expenseToEdit ? expenseToEdit.staffEmail : (currentUser?.email || ""),
        advanceDeducted: formData.paymentMode === "firm_advance",
      };

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, payload);
      } else {
        await addExpense(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 3 } } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, px: { xs: 2, sm: 3 } }}>
          <ReceiptLongIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              {expenseToEdit ? "Edit Expense Voucher" : "Record New Case Expense"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enter official legal, technical, or court disbursements for client billing & accounts
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            {/* Case Selection */}
            <Grid item xs={12} sm={8}>
              <TextField
                select
                label="Select Case / Matter"
                value={formData.caseId}
                onChange={handleCaseChange}
                fullWidth
                size="small"
                required
                helperText="Pre-approved active cases maintained by Software Admin"
              >
                {activeCases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {c.caseNumber} - {c.title}
                      </Typography>
                      <Chip label={c.court} size="small" variant="outlined" sx={{ ml: 1, fontSize: "0.7rem" }} />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Disbursement Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Expense Name */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="Expense Name / Purpose"
                placeholder="e.g. High Court Paper Book Filing Fee, Server Forensic Audit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            {/* Time */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Time of Expense"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Expense Category"
                value={formData.category}
                onChange={handleCategoryChange}
                fullWidth
                size="small"
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span>{cat.name}</span>
                      <Chip
                        label={cat.type.toUpperCase()}
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          height: 20,
                          backgroundColor:
                            cat.type === "legal" ? "#1e40af15" :
                            cat.type === "technical" ? "#b4530915" : "#47556915",
                          color:
                            cat.type === "legal" ? "#1e40af" :
                            cat.type === "technical" ? "#b45309" : "#475569",
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Expense Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                fullWidth
                size="small"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                }}
              />
            </Grid>

            {/* Payment Mode */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Payment Mode"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                fullWidth
                size="small"
                required
              >
                <MenuItem value="cash">Cash (Out-of-Pocket)</MenuItem>
                <MenuItem value="online_upi">Online Transfer / UPI</MenuItem>
                <MenuItem value="card">Credit / Debit Card</MenuItem>
                <MenuItem value="firm_advance">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 16, color: "#c99738" }} />
                    <strong>Deduct from Firm Advance Float</strong>
                  </Box>
                </MenuItem>
              </TextField>
            </Grid>

            {/* Advance Picker (If Payment Mode is firm_advance) */}
            {formData.paymentMode === "firm_advance" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Select Active Advance Float"
                  value={formData.advanceId}
                  onChange={(e) => setFormData({ ...formData, advanceId: e.target.value })}
                  fullWidth
                  size="small"
                  required
                  helperText="Select which advance to reconcile this against"
                >
                  {staffAdvances.length === 0 ? (
                    <MenuItem disabled value="">
                      No active advances available with remaining balance
                    </MenuItem>
                  ) : (
                    staffAdvances.map((adv) => {
                      const balance = adv.amount - (adv.usedAmount || 0);
                      return (
                        <MenuItem key={adv.id} value={adv.id}>
                          {adv.id} - {adv.caseTitle} (Balance: {currency} {balance.toLocaleString()})
                        </MenuItem>
                      );
                    })
                  )}
                </TextField>
              </Grid>
            )}

            {/* Notes / Voucher Number */}
            <Grid item xs={12}>
              <TextField
                label="Voucher Details / Bill No / Notes"
                placeholder="e.g. Receipt No #HC-992, Certified Copy Application #412"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 700 }}>
            {submitting ? "Saving..." : expenseToEdit ? "Update Expense" : "Record Expense"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
