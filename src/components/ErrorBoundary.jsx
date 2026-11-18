import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Uncaught Error Boundary caught:", error, errorInfo);
  }

  handleReload = () => {
    // Clear any temporary corrupt session keys if necessary
    sessionStorage.removeItem("oj_active_tab");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            backgroundColor: "#081320",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              maxWidth: 500,
              width: "100%",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#0f2942",
              border: "1px solid rgba(201, 151, 56, 0.4)",
              textAlign: "center",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <Typography variant="h5" fontWeight={800} color="#f8fafc" sx={{ mb: 1.5 }}>
              Application State Recovered
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
              A temporary display glitch was intercepted safely. Click below to reload the console in a clean state.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{
                background: "linear-gradient(135deg, #c99738 0%, #dfb15b 100%)",
                color: "#081320",
                fontWeight: 800,
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
              }}
            >
              Reload Application
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
