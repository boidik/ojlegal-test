import React, { createContext, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleColorMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? "#0f2942" : "#38bdf8", // Deep Navy in light, vibrant cyan in dark
            light: "#1e3a5f",
            dark: "#081b2e",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#c99738", // Prestigious Legal Gold
            light: "#dfb25d",
            dark: "#9f7324",
            contrastText: "#000000",
          },
          background: {
            default: mode === "light" ? "#f4f6f9" : "#0b1320",
            paper: mode === "light" ? "#ffffff" : "#111c2e",
          },
          text: {
            primary: mode === "light" ? "#1e293b" : "#f1f5f9",
            secondary: mode === "light" ? "#64748b" : "#94a3b8",
          },
          divider: mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
        },
        typography: {
          fontFamily: [
            '"Plus Jakarta Sans"',
            '"Inter"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
          ].join(','),
          h4: {
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h5: {
            fontWeight: 700,
            letterSpacing: "-0.01em",
          },
          h6: {
            fontWeight: 600,
          },
          subtitle1: {
            fontWeight: 500,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
          },
        },
        shape: {
          borderRadius: 10,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "8px 18px",
                boxShadow: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(15, 41, 66, 0.15)",
                  transform: "translateY(-1px)",
                },
              },
              containedPrimary: {
                background: mode === "light" 
                  ? "linear-gradient(135deg, #0f2942 0%, #1a3c61 100%)" 
                  : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              },
              containedSecondary: {
                background: "linear-gradient(135deg, #c99738 0%, #d8a548 100%)",
                color: "#ffffff",
              }
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                boxShadow: mode === "light"
                  ? "0 2px 14px 0 rgba(15, 41, 66, 0.06), 0 0 1px 1px rgba(15, 41, 66, 0.03)"
                  : "0 4px 20px 0 rgba(0, 0, 0, 0.4)",
                border: mode === "light" ? "1px solid #eef2f6" : "1px solid #1e2d42",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              rounded: {
                borderRadius: 12,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#f8fafc" : "#162235",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                color: mode === "light" ? "#475569" : "#cbd5e1",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              },
              body: {
                fontSize: "0.875rem",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 6,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
