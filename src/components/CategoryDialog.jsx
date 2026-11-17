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
import CategoryIcon from "@mui/icons-material/Category";
import { useApp } from "../context/AppContext";

export default function CategoryDialog({ open, onClose, categoryToEdit = null }) {
  const { addCategory, updateCategory } = useApp();

  const defaultForm = {
    name: "",
    type: "legal", // "legal" | "technical" | "administrative"
    description: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || "",
        type: categoryToEdit.type || "legal",
        description: categoryToEdit.description || "",
      });
    } else {
      setFormData(defaultForm);
    }
    setError("");
  }, [categoryToEdit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, formData);
      } else {
        await addCategory(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <CategoryIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {categoryToEdit ? "Edit Category" : "Add Expense Category"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Categorize expenses for legal and technical audit reports
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Category Name"
                placeholder="e.g. Senior Counsel Conference, Cloud Forensics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Classification Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                fullWidth
                size="small"
                required
                helperText="Used to separate legal vs technical expenses in reports"
              >
                <MenuItem value="legal">⚖️ Legal Expense (Court fees, Briefings, Certified Copies)</MenuItem>
                <MenuItem value="technical">💻 Technical Expense (Forensics, E-Discovery, Expert witness)</MenuItem>
                <MenuItem value="administrative">📑 Administrative / Logistics (Travel, Courier, Printing)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description & Rules"
                placeholder="Brief guidelines on what expenses belong in this category"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : categoryToEdit ? "Update Category" : "Save Category"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
