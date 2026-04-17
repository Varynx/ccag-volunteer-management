import { createTheme } from "@mui/material/styles";

const menuItemBase = {
  borderRadius: 0,
  padding: "10px 16px",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  "& .MuiListItemIcon-root": { color: "inherit", minWidth: 36 },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f7f9fb", paper: "#ffffff" },
    primary:    { main: "#565e74", contrastText: "#ffffff" },
    secondary:  { main: "#506076" },
    error:      { main: "#9f403d" },
    text:       { primary: "#2a3439", secondary: "#566166" },
    divider: "rgba(169, 180, 185, 0.2)",
    action:  { hover: "rgba(218,226,253,0.5)", selected: "#dae2fd" },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    // @ts-ignore — react-admin component override
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          ...menuItemBase,
          color: "#566166",
          "&.RaMenuItemLink-active": { backgroundColor: "#dae2fd", color: "#2a3439" },
          "&:hover": { backgroundColor: "#e8eff3", color: "#2a3439" },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#060e20", paper: "#06122d" },
    primary:    { main: "#38bdf8", contrastText: "#060e20" },
    secondary:  { main: "#91aaeb" },
    error:      { main: "#ee7d77" },
    text:       { primary: "#dee5ff", secondary: "#91aaeb" },
    divider: "rgba(43, 70, 128, 0.3)",
    action:  { hover: "rgba(0,40,103,0.4)", selected: "#002867", active: "#38bdf8" },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    // @ts-ignore — react-admin component override
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          ...menuItemBase,
          color: "#91aaeb",
          "&.RaMenuItemLink-active": {
            backgroundColor: "#002867",
            color: "#ebf1ff",
            borderRight: "3px solid #38bdf8",
          },
          "&:hover": { backgroundColor: "rgba(0,34,90,0.7)", color: "#dee5ff" },
        },
      },
    },
  },
});
