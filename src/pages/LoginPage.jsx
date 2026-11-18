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
  Paper,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const { settings } = useApp();

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
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
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
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: "100%", maxWidth: 450 }}
      >
        <Card
          sx={{
            borderRadius: 3.5,
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#0d1b2e",
            color: "#ffffff",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 4.5 } }}>
            {/* Law Firm Logo & Header */}
            <Box sx={{ textAlign: "center", mb: 3.5 }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 3,
                  backgroundColor: settings.headerAccentColor || "#c99738",
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
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                {settings.firmName || "OJ Legal Advocates & Solicitors"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.65)", display: "block", mt: 0.5 }}>
                {settings.tagline || "Expense Disbursement & Staff Float Management"}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

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
                py: 1.3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": { backgroundColor: "#f8fafc" },
              }}
            >
              Sign In with Google Account
            </Button>

            <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.12)" }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                OR SIGN IN WITH EMAIL & PASSWORD
              </Typography>
            </Divider>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth}>
              {isRegister && (
                <TextField
                  fullWidth
                  label="Full Name / Advocate Title"
                  placeholder="Adv. Priya Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  size="small"
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                      "&:hover fieldset": { borderColor: "#c99738" },
                    },
                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Official Email Address"
                placeholder="name@ojlegal.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "#c99738" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="small"
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "#c99738" },
                  },
                  "& .MuiInputLabel-root": { color: "#94a3b8" },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => { setResetModalOpen(true); setResetMessage(""); }}
                  sx={{ color: "#93c5fd", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  Forgot Password?
                </Link>

                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => { setIsRegister(!isRegister); setError(""); }}
                  sx={{ color: "#c99738", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  {isRegister ? "Already registered? Sign In" : "New Associate? Register"}
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.3,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #c99738 0%, #dfb25d 100%)",
                  color: "#081320",
                  "&:hover": { background: "linear-gradient(135deg, #dfb25d 0%, #c99738 100%)" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : isRegister ? "Create Law Firm Account" : "Access Portal"}
              </Button>
            </form>

            {/* Security Notice */}
            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <SecurityIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>
                Restricted to authorized law firm personnel. Protected by Google Cloud Firestore.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Reset Modal */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Account Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your registered email address to receive an official password reset link.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Registered Email Address"
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
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
