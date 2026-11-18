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
  InputAdornment,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function AdvanceDialog({ open, onClose, advanceToEdit = null }) {
  const { currentUser } = useAuth();
  const { cases, users, settings, addAdvance, updateAdvance } = useApp();

  const currency = settings.currencySymbol || "₹";

  const staffUsers = users.filter(u => u.role === "staff" || u.role === "accounts_admin" || u.role === "software_admin");
  const activeCases = cases.filter(c => c.status === "active");

  const defaultForm = {
    staffId: "",
    staffName: "",
    staffEmail: "",
    amount: "",
    caseId: "ALL", // "ALL" means general float, or specific case ID
    caseTitle: "General Office Out-of-Pocket Float",
    disbursedDate: new Date().toISOString().split("T")[0],
    notes: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (advanceToEdit) {
      const matchedUser = users.find(
        u => u.uid === advanceToEdit.staffId || 
             (advanceToEdit.staffEmail && (u.email || "").toLowerCase() === (advanceToEdit.staffEmail || "").toLowerCase())
      );
      setFormData({
        staffId: advanceToEdit.staffId || (matchedUser ? matchedUser.uid : ""),
        staffName: advanceToEdit.staffName || (matchedUser ? matchedUser.displayName : ""),
        staffEmail: advanceToEdit.staffEmail || (matchedUser ? matchedUser.email : ""),
        amount: advanceToEdit.amount || "",
        caseId: advanceToEdit.caseId || "ALL",
        caseTitle: advanceToEdit.caseTitle || "General Office Out-of-Pocket Float",
        disbursedDate: advanceToEdit.disbursedDate || new Date().toISOString().split("T")[0],
        notes: advanceToEdit.notes || "",
      });
    } else {
      const firstStaff = staffUsers[0];
      setFormData({
        ...defaultForm,
        staffId: firstStaff ? firstStaff.uid : "",
        staffName: firstStaff ? firstStaff.displayName : "",
        staffEmail: firstStaff ? firstStaff.email : "",
      });
    }
    setError("");
  }, [advanceToEdit, open]);

  const handleStaffChange = (e) => {
    const selectedUid = e.target.value;
    const matched = users.find(u => u.uid === selectedUid);
    setFormData(prev => ({
      ...prev,
      staffId: selectedUid,
      staffName: matched ? matched.displayName : "",
      staffEmail: matched ? matched.email : "",
    }));
  };

  const handleCaseChange = (e) => {
    const selectedCaseId = e.target.value;
    if (selectedCaseId === "ALL") {
      setFormData(prev => ({
        ...prev,
        caseId: "ALL",
        caseTitle: "General Office Out-of-Pocket Float",
      }));
    } else {
      const selectedCase = cases.find(c => c.id === selectedCaseId);
      setFormData(prev => ({
        ...prev,
        caseId: selectedCaseId,
        caseTitle: selectedCase ? selectedCase.title : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) {
      setError("Please select the recipient staff member.");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please specify a valid advance disbursement amount.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const matched = users.find(
        u => u.uid === formData.staffId || 
             (formData.staffEmail && (u.email || "").toLowerCase() === (formData.staffEmail || "").toLowerCase())
      );

      const payload = {
        ...formData,
        staffId: formData.staffId || (matched ? matched.uid : ""),
        staffName: matched?.displayName || formData.staffName || "Staff Associate",
        staffEmail: (matched?.email || formData.staffEmail || "").toLowerCase().trim(),
        amount: Number(formData.amount),
        disbursedBy: currentUser?.displayName || "Managing Partner / Accounts Admin",
      };

      if (advanceToEdit) {
        await updateAdvance(advanceToEdit.id, payload);
      } else {
        await addAdvance(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to disburse advance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 3 } } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, px: { xs: 2, sm: 3 } }}>
          <AccountBalanceWalletIcon color="secondary" />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              {advanceToEdit ? "Modify Staff Advance" : "Disburse Staff Advance Float"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Allocate pre-authorized funds to legal staff for case-specific or general court expenses
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            {/* Staff Recipient */}
            <Grid item xs={12}>
              <TextField
                select
                label="Staff Recipient"
                value={formData.staffId}
                onChange={handleStaffChange}
                fullWidth
                size="small"
                required
              >
                {staffUsers.map((u) => (
                  <MenuItem key={u.uid} value={u.uid}>
                    {u.displayName} ({u.email}) - {u.designation || u.role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Advance Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Advance Amount"
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

            {/* Disbursed Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Disbursement"
                type="date"
                value={formData.disbursedDate}
                onChange={(e) => setFormData({ ...formData, disbursedDate: e.target.value })}
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Earmark Case / Overall */}
            <Grid item xs={12}>
              <TextField
                select
                label="Advance Purpose / Scope"
                value={formData.caseId}
                onChange={handleCaseChange}
                fullWidth
                size="small"
                required
                helperText="Can be earmarked for a specific active matter or general overall out-of-pocket expenses"
              >
                <MenuItem value="ALL">
                  <strong>★ Overall / General Office Float (Any Case)</strong>
                </MenuItem>
                <Divider />
                {activeCases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    Case: {c.caseNumber} - {c.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Disbursement Notes / Reference"
                placeholder="e.g. Paid via Bank Transfer #IMPS-99201 for urgent outstation arbitration"
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
          <Button type="submit" variant="contained" color="secondary" disabled={submitting} sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 700 }}>
            {submitting ? "Processing..." : advanceToEdit ? "Update Advance" : "Disburse Advance"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
