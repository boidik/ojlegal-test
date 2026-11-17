import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Chip,
  Paper,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, switchDemoRole } = useAuth();
  const { settings, isConfigured } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error || "Failed to sign in with Google.");
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const res = await registerWithEmail(email, password, displayName);
        if (!res.success) setError(res.error);
      } else {
        const res = await loginWithEmail(email, password);
        if (!res.success) setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async () => {
    if (!resetEmail) return;
    const res = await resetPassword(resetEmail);
    if (res.success) {
      setResetMessage(res.message);
    } else {
      setError(res.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#081320",
        backgroundImage: "radial-gradient(at 50% 0%, #0f2942 0px, transparent 65%)",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 460 }}
      >
        <Card
          sx={{
            borderRadius: 3.5,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#0d1b2e",
            color: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Law Firm Logo & Header */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  backgroundColor: "#c99738",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  mb: 1.5,
                  boxShadow: "0 4px 15px rgba(201, 151, 56, 0.4)",
                }}
              >
                <GavelIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.01em", color: "#ffffff" }}>
                {settings.firmName || "LexVeritas & Partners"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.65)", display: "block" }}>
                {settings.tagline || "Expense Disbursement & Staff Float Management"}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

            {/* Google Sign-In Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                mb: 2.5,
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontWeight: 700,
                py: 1.2,
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              Sign In with Google
            </Button>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                OR SIGN IN WITH EMAIL
              </Typography>
            </Divider>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth}>
              {isRegister && (
                <TextField
                  fullWidth
                  label="Full Name / Advocate Title"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  size="small"
                  sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "#94a3b8" } }}
                />
              )}

              <TextField
                fullWidth
                label="Official Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                required
                sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "#94a3b8" } }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="small"
                required
                sx={{ mb: 2, "& .MuiInputBase-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "#94a3b8" } }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => { setResetModalOpen(true); setResetMessage(""); }}
                  sx={{ color: "#93c5fd" }}
                >
                  Forgot Password?
                </Link>

                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => { setIsRegister(!isRegister); setError(""); }}
                  sx={{ color: "#c99738", fontWeight: 700 }}
                >
                  {isRegister ? "Have an account? Sign In" : "New Staff? Register"}
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.2,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #c99738 0%, #dfb25d 100%)",
                  color: "#081320",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : isRegister ? "Create Staff Account" : "Access Portal"}
              </Button>
            </form>

            {/* Quick Demo Personas */}
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px dashed rgba(255, 255, 255, 0.12)",
              }}
            >
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", display: "block", mb: 1, fontWeight: 700 }}>
                QUICK 1-CLICK DEMO ACCESS:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AdminPanelSettingsIcon sx={{ color: "#c084fc" }} />}
                  onClick={() => switchDemoRole("software_admin")}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#e9d5ff",
                    borderColor: "rgba(192, 132, 252, 0.3)",
                    fontSize: "0.75rem",
                  }}
                >
                  Login as Software Admin (You)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AccountBalanceIcon sx={{ color: "#38bdf8" }} />}
                  onClick={() => switchDemoRole("accounts_admin")}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#bae6fd",
                    borderColor: "rgba(56, 189, 248, 0.3)",
                    fontSize: "0.75rem",
                  }}
                >
                  Login as Accounts Admin (Boss)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonIcon sx={{ color: "#4ade80" }} />}
                  onClick={() => switchDemoRole("staff")}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#bbf7d0",
                    borderColor: "rgba(74, 222, 128, 0.3)",
                    fontSize: "0.75rem",
                  }}
                >
                  Login as Legal Staff (Priya Sharma)
                </Button>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Reset Modal */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your official law firm email address to receive a secure password reset link.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {resetMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {resetMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetModalOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleSendReset} disabled={!resetEmail}>
            Send Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
