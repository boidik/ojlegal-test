import React, { createContext, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useApp } from "./AppContext";

const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  let settings = {};
  try {
    const appContext = useApp();
    settings = appContext?.settings || {};
  } catch (e) {
    settings = {};
  }

  // Persist dark / light theme mode in localStorage
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("oj_theme_mode") || "light";
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("oj_theme_mode", next);
      return next;
    });
  };

  // Firm branding colors configured by Software Admin (applies to both light and dark modes)
  const headerBg = settings.headerBgColor || "#0f2942";
  const accentColor = settings.headerAccentColor || "#c99738";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? headerBg : accentColor,
            light: mode === "light" ? "#1e3a5f" : "#dfb25d",
            dark: mode === "light" ? "#081b2e" : "#9f7324",
            contrastText: mode === "light" ? "#ffffff" : "#081320",
          },
          secondary: {
            main: accentColor,
            light: "#dfb25d",
            dark: "#9f7324",
            contrastText: mode === "light" ? "#000000" : "#ffffff",
          },
          background: {
            default: mode === "light" ? "#f1f5f9" : "#080f1a",
            paper: mode === "light" ? "#ffffff" : "#0f1b2d",
          },
          text: {
            primary: mode === "light" ? "#0f172a" : "#f8fafc",
            secondary: mode === "light" ? "#475569" : "#94a3b8",
          },
          divider: mode === "light" ? "#cbd5e1" : "rgba(255, 255, 255, 0.12)",
          action: {
            hover: mode === "light" ? "rgba(15, 41, 66, 0.04)" : "rgba(255, 255, 255, 0.06)",
            selected: mode === "light" ? "rgba(15, 41, 66, 0.08)" : "rgba(255, 255, 255, 0.1)",
          },
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
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          h5: {
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          h6: {
            fontWeight: 700,
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          subtitle1: {
            fontWeight: 700,
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          subtitle2: {
            fontWeight: 600,
            color: mode === "light" ? "#0f172a" : "#f8fafc",
          },
          body1: {
            color: mode === "light" ? "#334155" : "#cbd5e1",
          },
          body2: {
            color: mode === "light" ? "#475569" : "#cbd5e1",
          },
          caption: {
            color: mode === "light" ? "#64748b" : "#94a3b8",
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
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "light" ? "#f1f5f9" : "#080f1a",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                transition: "background-color 0.2s ease, color 0.2s ease",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 700,
                fontSize: "0.875rem",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  boxShadow: mode === "light" ? "0 4px 12px rgba(15, 41, 66, 0.2)" : "0 4px 14px rgba(0, 0, 0, 0.4)",
                  transform: "translateY(-1px)",
                },
              },
              containedPrimary: {
                backgroundColor: mode === "light" ? headerBg : accentColor,
                color: mode === "light" ? "#ffffff" : "#081320",
                fontWeight: 800,
                "&:hover": {
                  backgroundColor: mode === "light" ? "#1e3a5f" : "#dfb25d",
                },
              },
              containedSecondary: {
                backgroundColor: accentColor,
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#b28124",
                },
              },
              outlined: {
                borderWidth: "1.5px !important",
                borderColor: mode === "light" ? headerBg : accentColor,
                color: mode === "light" ? headerBg : accentColor,
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: mode === "light" ? "rgba(15, 41, 66, 0.08)" : `${accentColor}20`,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                backgroundColor: mode === "light" ? "#ffffff" : "#0f1b2d",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                boxShadow: mode === "light"
                  ? "0 4px 16px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.04)"
                  : "0 4px 20px 0 rgba(0, 0, 0, 0.45)",
                border: mode === "light" ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#ffffff" : "#0f1b2d",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
              },
              rounded: {
                borderRadius: 12,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#e2e8f0" : "#16253b",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 800,
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                backgroundColor: mode === "light" ? "#e2e8f0" : "#16253b",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                borderBottom: mode === "light" ? "2px solid #cbd5e1" : "2px solid rgba(255, 255, 255, 0.15)",
              },
              body: {
                fontSize: "0.875rem",
                color: mode === "light" ? "#0f172a" : "#f1f5f9",
                borderBottom: mode === "light" ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&.MuiTableRow-hover:hover": {
                  backgroundColor: mode === "light" ? "rgba(15, 41, 66, 0.04)" : "rgba(255, 255, 255, 0.05)",
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "transparent" : "rgba(255, 255, 255, 0.04)",
                "& fieldset": {
                  borderColor: mode === "light" ? "#94a3b8" : "rgba(255, 255, 255, 0.22)",
                  borderWidth: "1.5px",
                },
                "&:hover fieldset": {
                  borderColor: mode === "light" ? headerBg : accentColor,
                },
                "&.Mui-focused fieldset": {
                  borderColor: mode === "light" ? "#0284c7" : accentColor,
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
                color: mode === "light" ? "#475569" : "#cbd5e1",
                fontWeight: 600,
                "&.Mui-focused": {
                  color: mode === "light" ? headerBg : accentColor,
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
                  backgroundColor: mode === "light" ? headerBg : accentColor,
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
                  color: mode === "light" ? headerBg : (mode === "dark" ? accentColor : "#ffffff"),
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
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "light" ? "#ffffff" : "#0f1b2d",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                border: mode === "light" ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.15)",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "light" ? "#ffffff" : "#0f1b2d",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                border: mode === "light" ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.15)",
              },
            },
          },
        },
      }),
    [mode, headerBg, accentColor]
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
