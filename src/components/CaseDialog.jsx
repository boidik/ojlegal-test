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
  const { addCase, updateCase } = useApp();

  const defaultForm = {
    caseNumber: "",
    title: "",
    clientName: "",
    court: "Delhi High Court",
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <FolderSpecialIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {caseToEdit ? "Modify Case Registry" : "Register Pre-Approved Case"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only registered active cases are available for staff expense entry
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
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
                <MenuItem value="Supreme Court of India">Supreme Court of India</MenuItem>
                <MenuItem value="Delhi High Court">Delhi High Court</MenuItem>
                <MenuItem value="Bombay High Court">Bombay High Court</MenuItem>
                <MenuItem value="District & Sessions Court">District & Sessions Court</MenuItem>
                <MenuItem value="National Company Law Tribunal (NCLT)">NCLT / NCLAT</MenuItem>
                <MenuItem value="Arbitration Centre">Arbitration Centre</MenuItem>
                <MenuItem value="Consumer Disputes Commission">Consumer Forum</MenuItem>
                <MenuItem value="High Court / Commercial Division">High Court (Commercial)</MenuItem>
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

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : caseToEdit ? "Update Case" : "Register Case"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
