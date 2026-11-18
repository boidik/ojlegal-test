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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useApp } from "../context/AppContext";

export default function ForumDialog({ open, onClose, forumToEdit = null }) {
  const { addForum, updateForum } = useApp();

  const defaultForm = {
    name: "",
    city: "New Delhi",
    category: "High Court",
    code: "",
    description: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (forumToEdit) {
      setFormData({
        name: forumToEdit.name || "",
        city: forumToEdit.city || "New Delhi",
        category: forumToEdit.category || "High Court",
        code: forumToEdit.code || "",
        description: forumToEdit.description || "",
      });
    } else {
      setFormData(defaultForm);
    }
    setError("");
  }, [forumToEdit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Court / Forum name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (forumToEdit) {
        await updateForum(forumToEdit.id, formData);
      } else {
        await addForum(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save court forum.");
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              {forumToEdit ? "Edit Court / Forum" : "Register New Court / Forum"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This court/tribunal will be available in the Case Registry dropdown
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Court / Forum / Tribunal Name"
                placeholder="e.g. Supreme Court of India, Delhi High Court, NCLAT"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="City / Bench Location"
                placeholder="e.g. New Delhi, Mumbai, Principal Bench"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Jurisdiction Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
                size="small"
                required
              >
                <MenuItem value="Apex Appellate">Apex Appellate (Supreme Court)</MenuItem>
                <MenuItem value="High Court">High Court</MenuItem>
                <MenuItem value="Commercial Division">Commercial Court / Bench</MenuItem>
                <MenuItem value="Corporate Insolvency">NCLT / NCLAT (Corporate / Insolvency)</MenuItem>
                <MenuItem value="Arbitration">Arbitration Tribunal (DIAC / MCIA / LCIA)</MenuItem>
                <MenuItem value="District Court">District & Sessions Court</MenuItem>
                <MenuItem value="Recovery Tribunal">DRT / DRAT (Debt Recovery)</MenuItem>
                <MenuItem value="Consumer Forum">Consumer Disputes Commission (NCDRC / SCDRC)</MenuItem>
                <MenuItem value="Special Tribunal">Special Tribunal / Authority (CAT / TDSAT / NGT)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Court Abbreviation / Short Code"
                placeholder="e.g. DHC, SCI, NCLAT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Description / Registry Note"
                placeholder="e.g. Main High Court campus at Sher Shah Road"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, borderTop: "1px solid", borderColor: "divider", flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              fontWeight: 700,
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {submitting ? "Saving..." : forumToEdit ? "Save Changes" : "Register Forum"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
