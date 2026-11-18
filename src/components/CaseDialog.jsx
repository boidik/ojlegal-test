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
} from "@mui/material";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import { useApp } from "../context/AppContext";

export default function CaseDialog({ open, onClose, caseToEdit = null }) {
  const { addCase, updateCase, forums } = useApp();

  const defaultCourt = (forums && forums.length > 0) ? forums[0].name : "Delhi High Court";

  const defaultForm = {
    caseNumber: "",
    title: "",
    clientName: "",
    court: defaultCourt,
    leadAttorney: "",
    status: "active",
    budget: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (caseToEdit) {
      setFormData({
        caseNumber: caseToEdit.caseNumber || "",
        title: caseToEdit.title || "",
        clientName: caseToEdit.clientName || "",
        court: caseToEdit.court || "Delhi High Court",
        leadAttorney: caseToEdit.leadAttorney || "",
        status: caseToEdit.status || "active",
        budget: caseToEdit.budget || "",
      });
    } else {
      setFormData(defaultForm);
    }
    setError("");
  }, [caseToEdit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseNumber.trim() || !formData.title.trim()) {
      setError("Case Number and Matter Title are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (caseToEdit) {
        await updateCase(caseToEdit.id, formData);
      } else {
        await addCase(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save case.");
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
          <FolderSpecialIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              {caseToEdit ? "Modify Case Registry" : "Register Pre-Approved Case"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only registered active cases are available for staff expense entry
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Court Filing / Case Number"
                placeholder="e.g. WP(C) 4120/2026"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Court / Forum"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                fullWidth
                size="small"
                required
              >
                {/* Dynamically populate from forums maintained in Software Admin */}
                {forums && forums.length > 0 ? (
                  forums.map((f) => (
                    <MenuItem key={f.id || f.name} value={f.name}>
                      {f.name} {f.city ? `(${f.city})` : ""}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="Supreme Court of India">Supreme Court of India</MenuItem>
                    <MenuItem value="Delhi High Court">Delhi High Court</MenuItem>
                    <MenuItem value="Bombay High Court">Bombay High Court</MenuItem>
                    <MenuItem value="District & Sessions Court">District & Sessions Court</MenuItem>
                    <MenuItem value="National Company Law Tribunal (NCLT)">NCLT / NCLAT</MenuItem>
                  </>
                )}
                {/* Ensure current value exists in menu even if legacy */}
                {formData.court && (!forums || !forums.some((f) => f.name === formData.court)) && (
                  <MenuItem value={formData.court}>{formData.court}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Case / Matter Title"
                placeholder="e.g. Apex Technologies vs. State of NCT"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Name / Organization"
                placeholder="e.g. Apex Tech Global Pvt Ltd"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Lead Handling Attorney"
                placeholder="e.g. Adv. Rajesh Varma"
                value={formData.leadAttorney}
                onChange={(e) => setFormData({ ...formData, leadAttorney: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Case Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
                size="small"
                required
              >
                <MenuItem value="active">Active (Permits Expense Logging)</MenuItem>
                <MenuItem value="closed">Closed (Archived)</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Approved Budget / Float Limit"
                type="number"
                placeholder="e.g. 250000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 700 }}>
            {submitting ? "Saving..." : caseToEdit ? "Update Case" : "Register Case"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
