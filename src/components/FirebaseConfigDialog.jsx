import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorageIcon from "@mui/icons-material/Storage";
import {
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  testFirebaseConfig,
  isFirebaseConfigured
} from "../services/firebase";

export default function FirebaseConfigDialog({ open, onClose }) {
  const existing = getActiveFirebaseConfig() || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  };

  const [config, setConfig] = useState(existing);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (field) => (e) => {
    setConfig({ ...config, [field]: e.target.value.trim() });
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!config.apiKey || !config.projectId) {
      setTestResult({ success: false, message: "API Key and Project ID are required." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConfig(config);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveCustomFirebaseConfig(config);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Disconnect custom Firebase credentials and return to Local Preview Mode?")) {
      clearCustomFirebaseConfig();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <CloudQueueIcon color="primary" />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Google Firebase & Firestore Setup
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Connect directly to your law firm's Google Cloud Firestore database
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            backgroundColor: isFirebaseConfigured() ? "success.50" : "info.50",
            border: "1px solid",
            borderColor: isFirebaseConfigured() ? "success.200" : "info.200",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isFirebaseConfigured() ? (
              <CheckCircleOutlineIcon color="success" />
            ) : (
              <StorageIcon color="info" />
            )}
            <Typography variant="subtitle2" fontWeight={700} color={isFirebaseConfigured() ? "success.dark" : "info.dark"}>
              {isFirebaseConfigured() ? "Status: Connected to Google Firebase" : "Status: Running in Local Preview / Fallback Mode"}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {isFirebaseConfigured()
              ? "All cases, expenses, advances, and user records are actively syncing with your live Google Firestore database in real-time."
              : "Currently using client-side offline storage with realistic law firm seed data. Paste your Firebase project keys below to connect live anytime."}
          </Typography>
        </Paper>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="API Key"
            value={config.apiKey}
            onChange={handleChange("apiKey")}
            placeholder="AIzaSy..."
            fullWidth
            size="small"
            required
            helperText="From Firebase Console > Project Settings > General"
          />
          <TextField
            label="Project ID"
            value={config.projectId}
            onChange={handleChange("projectId")}
            placeholder="lexveritas-law-firm-12345"
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Auth Domain"
            value={config.authDomain}
            onChange={handleChange("authDomain")}
            placeholder="lexveritas-law-firm-12345.firebaseapp.com"
            fullWidth
            size="small"
          />
          <TextField
            label="Storage Bucket"
            value={config.storageBucket}
            onChange={handleChange("storageBucket")}
            placeholder="lexveritas-law-firm-12345.appspot.com"
            fullWidth
            size="small"
          />
          <TextField
            label="Messaging Sender ID"
            value={config.messagingSenderId}
            onChange={handleChange("messagingSenderId")}
            placeholder="104928392019"
            fullWidth
            size="small"
          />
          <TextField
            label="App ID"
            value={config.appId}
            onChange={handleChange("appId")}
            placeholder="1:104928392019:web:abcdef..."
            fullWidth
            size="small"
          />
        </Box>

        {testResult && (
          <Alert severity={testResult.success ? "success" : "error"} sx={{ mt: 2 }}>
            {testResult.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        {isFirebaseConfigured() ? (
          <Button color="error" size="small" onClick={handleClear}>
            Disconnect Firebase
          </Button>
        ) : (
          <Box />
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handleTest} disabled={testing}>
            {testing ? <CircularProgress size={20} /> : "Test Connection"}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!config.apiKey || !config.projectId}>
            Save & Connect
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
