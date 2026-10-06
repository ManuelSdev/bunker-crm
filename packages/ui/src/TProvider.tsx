import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Tema base inicial en modo oscuro para el Búnker
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0284c7", // Azul cian técnico
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
  },
});

interface BunkerProviderProps {
  children: React.ReactNode;
}

export function BunkerProvider({ children }: BunkerProviderProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
