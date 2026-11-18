import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useAppTheme } from "../context/ThemeContext";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "#0f2942", delay = 0 }) {
  const { mode } = useAppTheme();

  // In dark mode, adapt dark navy / dark primary colors to vibrant high-contrast accents
  const effectiveColor = mode === "dark"
    ? (color === "#0f2942" ? "#38bdf8" : color === "#1e40af" ? "#60a5fa" : color)
    : color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card
        sx={{
          height: "100%",
          position: "relative",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderLeft: `5px solid ${effectiveColor}`,
          backgroundColor: mode === "light" ? "#ffffff" : "#0f1a2c",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  mb: 0.5,
                  fontWeight: 800,
                  color: "text.primary",
                  fontSize: { xs: "1.35rem", sm: "1.65rem", md: "2rem" },
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {Icon && (
              <Box
                sx={{
                  backgroundColor: mode === "light" ? `${effectiveColor}18` : `${effectiveColor}30`,
                  color: effectiveColor,
                  p: 1.2,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 26 }} />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
