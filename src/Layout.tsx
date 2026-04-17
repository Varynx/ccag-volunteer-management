import { useEffect } from "react";
import {
  Layout as RALayout, Menu, AppBar, TitlePortal,
  LayoutProps, useLogout, useTheme,
} from "react-admin";
import { IconButton, Tooltip, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon  from "@mui/icons-material/DarkMode";
import PersonIcon    from "@mui/icons-material/Person";
import TableViewIcon from "@mui/icons-material/TableView";
import LogoutIcon    from "@mui/icons-material/Logout";

// ── Applies body.dark-mode class so volunteer-table.css variables switch ──────
const ThemeApplier = () => {
  const [theme] = useTheme();
  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
  }, [theme]);
  return null;
};

// ── Sidebar menu ──────────────────────────────────────────────────────────────
const MyMenu = () => {
  const logout  = useLogout();
  const [theme] = useTheme();
  const isDark  = theme === "dark";

  const sidebarBg      = isDark ? "#06122d"             : "#f0f4f7";
  const border         = isDark ? "rgba(43,70,128,0.3)" : "rgba(169,180,185,0.25)";
  const logoutColor    = isDark ? "#91aaeb"             : "#566166";
  const logoutHoverBg  = isDark ? "rgba(0,34,90,0.7)"  : "#e8eff3";
  const logoutHoverTxt = isDark ? "#dee5ff"             : "#2a3439";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: sidebarBg }}>

      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "22px 16px 18px",
        borderBottom: `1px solid ${border}`,
      }}>
        <img src="/ccag-circle-logo.png" alt="" style={{ height: 36, flexShrink: 0 }} />
        <img src="/CCAG_Logo.png" alt="Collaborative Care Advocacy Group" style={{ height: 28 }} />
      </div>

      {/* Nav items */}
      <div style={{ flex: 1 }}>
        <Menu sx={{ backgroundColor: "transparent", pt: 1 }}>
          <Menu.Item to="/volunteer"      primaryText="Volunteer Directory"   leftIcon={<PersonIcon />}    />
          <Menu.Item to="/volunteer_info" primaryText="Volunteer Information" leftIcon={<TableViewIcon />} />
        </Menu>
      </div>

      {/* Logout — pinned above bottom edge */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "8px 8px 12px" }}>
        <ListItemButton
          onClick={() => logout()}
          sx={{
            color: logoutColor,
            borderRadius: 0,
            padding: "10px 16px",
            "&:hover": { backgroundColor: logoutHoverBg, color: logoutHoverTxt },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              },
            }}
          />
        </ListItemButton>
      </div>

    </div>
  );
};

// ── Top app bar ───────────────────────────────────────────────────────────────
const MyAppBar = () => {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <AppBar
      color="default"
      elevation={0}
      userMenu={false}
      toolbar={<span />}
      sx={{
        backgroundColor: isDark ? "rgba(6,18,45,0.88)"      : "rgba(247,249,251,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom:   isDark ? "1px solid rgba(43,70,128,0.3)" : "1px solid rgba(169,180,185,0.2)",
        boxShadow:      isDark ? "none"                      : "0 1px 4px rgba(0,0,0,0.05)",
        "& .MuiToolbar-root":   { minHeight: 52 },
        "& .RaAppBar-title":    {
          color:       isDark ? "#dee5ff" : "#2a3439",
          fontFamily:  "'Inter', sans-serif",
          fontWeight:  700,
          fontSize:    14,
          letterSpacing: "-0.01em",
        },
        "& .MuiIconButton-root": { color: isDark ? "#91aaeb" : "#566166" },
      }}
    >
      <TitlePortal />
      <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <IconButton onClick={() => setTheme(isDark ? "light" : "dark")} size="small">
          {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </AppBar>
  );
};

// ── Root layout ───────────────────────────────────────────────────────────────
export const Layout = (props: LayoutProps) => (
  <>
    <ThemeApplier />
    <RALayout {...props} menu={MyMenu} appBar={MyAppBar} />
  </>
);
