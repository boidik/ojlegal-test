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
            main: mode === "light" ? "#0f2942" : "#38bdf8",
            light: "#1e3a5f",
            dark: "#081b2e",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#c99738",
            light: "#dfb25d",
            dark: "#9f7324",
            contrastText: "#000000",
          },
          background: {
            default: mode === "light" ? "#f1f5f9" : "#0b1320",
            paper: mode === "light" ? "#ffffff" : "#111c2e",
          },
          text: {
            primary: mode === "light" ? "#0f172a" : "#f8fafc",
            secondary: mode === "light" ? "#334155" : "#cbd5e1",
          },
          divider: mode === "light" ? "#cbd5e1" : "rgba(255, 255, 255, 0.12)",
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
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: mode === "light" ? "#0f172a" : "#ffffff",
          },
          h5: {
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: mode === "light" ? "#0f172a" : "#ffffff",
          },
          h6: {
            fontWeight: 700,
            color: mode === "light" ? "#0f172a" : "#ffffff",
          },
          subtitle1: {
            fontWeight: 700,
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          subtitle2: {
            fontWeight: 600,
          },
          button: {
            textTransform: "none",
            fontWeight: 700,
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
                fontWeight: 700,
                fontSize: "0.875rem",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(15, 41, 66, 0.2)",
                  transform: "translateY(-1px)",
                },
              },
              containedPrimary: {
                backgroundColor: mode === "light" ? "#0f2942" : "#0284c7",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: mode === "light" ? "#1e3a5f" : "#0369a1",
                },
              },
              containedSecondary: {
                backgroundColor: "#c99738",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#b28124",
                },
              },
              outlined: {
                borderWidth: "1.5px !important",
                borderColor: mode === "light" ? "#0f2942" : "#38bdf8",
                color: mode === "light" ? "#0f2942" : "#38bdf8",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: mode === "light" ? "rgba(15, 41, 66, 0.08)" : "rgba(56, 189, 248, 0.12)",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                boxShadow: mode === "light"
                  ? "0 4px 16px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.04)"
                  : "0 4px 20px 0 rgba(0, 0, 0, 0.4)",
                border: mode === "light" ? "1px solid #cbd5e1" : "1px solid #1e2d42",
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
                backgroundColor: mode === "light" ? "#e2e8f0" : "#162235",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 800,
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                borderBottom: mode === "light" ? "2px solid #cbd5e1" : "2px solid #334155",
              },
              body: {
                fontSize: "0.875rem",
                color: mode === "light" ? "#0f172a" : "#f1f5f9",
                borderBottom: mode === "light" ? "1px solid #e2e8f0" : "1px solid #1e293b",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                "& fieldset": {
                  borderColor: mode === "light" ? "#94a3b8" : "#475569",
                  borderWidth: "1.5px",
                },
                "&:hover fieldset": {
                  borderColor: mode === "light" ? "#0f2942" : "#38bdf8",
                },
                "&.Mui-focused fieldset": {
                  borderColor: mode === "light" ? "#0284c7" : "#38bdf8",
                  borderWidth: "2px",
                },
              },
              input: {
                fontWeight: 500,
                color: mode === "light" ? "#0f172a" : "#f8fafc",
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: mode === "light" ? "#334155" : "#94a3b8",
                fontWeight: 600,
                "&.Mui-focused": {
                  color: mode === "light" ? "#0f2942" : "#38bdf8",
                  fontWeight: 700,
                },
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: {
                "& .MuiTabs-indicator": {
                  height: 3,
                  backgroundColor: mode === "light" ? "#0f2942" : "#38bdf8",
                },
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                fontWeight: 700,
                fontSize: "0.875rem",
                color: mode === "light" ? "#475569" : "#94a3b8",
                "&.Mui-selected": {
                  color: mode === "light" ? "#0f2942" : "#ffffff",
                  fontWeight: 800,
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 700,
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
