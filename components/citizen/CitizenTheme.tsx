import { createTheme } from "@mui/material/styles";

export const citizenTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#2866f2", // Main dark blue from Login
            light: "#6699ff",
            dark: "#1741a6",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#f5f7ff",
            light: "#ffffff",
            dark: "#cccccc",
            contrastText: "#000000",
        },
        background: {
            default: "#0f111a", // Deep dark blue background
            paper: "#1f2433",   // Lighter dark blue for cards/sidebar
        },
        text: {
            primary: "#f5f7ff",
            secondary: "#a0a4b7",
        },
        divider: "rgba(255, 255, 255, 0.12)",
    },
    typography: {
        fontFamily: "Inter, Roboto, sans-serif",
        h1: { fontSize: "2rem", fontWeight: 700, color: "#f5f7ff" },
        h2: { fontSize: "1.75rem", fontWeight: 700, color: "#f5f7ff" },
        h3: { fontSize: "1.5rem", fontWeight: 700, color: "#f5f7ff" },
        h4: { fontSize: "1.25rem", fontWeight: 600, color: "#f5f7ff" },
        h5: { fontSize: "1.1rem", fontWeight: 600, color: "#2866f2" },
        h6: { fontSize: "1rem", fontWeight: 600, color: "#f5f7ff" },
        subtitle1: { color: "#a0a4b7" },
        subtitle2: { color: "#a0a4b7", fontSize: '0.85rem' },
        body1: { color: "#f5f7ff" },
        body2: { color: "#a0a4b7" },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#0f111a",
                    scrollbarColor: "#2866f2 #0f111a",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#0f111a",
                        width: "8px",
                        height: "8px",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#2866f2",
                        minHeight: 24,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "#1f2433",
                    backgroundImage: "none", // Remove default gradient overlay
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(40,102,242,0.2)",
                    },
                },
                containedPrimary: {
                    backgroundColor: "#2866f2",
                    "&:hover": {
                        backgroundColor: "#1741a6",
                    },
                }
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#1f2433",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#0f111a", // Match body bg for seamless look or paper if preferred
                    backgroundImage: 'none',
                    boxShadow: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: "rgba(255, 255, 255, 0.08)"
                }
            }
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: "#a0a4b7",
                    minWidth: "40px"
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: "8px",
                    margin: "4px 8px",
                    "&.Mui-selected": {
                        backgroundColor: "rgba(40, 102, 242, 0.15)",
                        "& .MuiListItemIcon-root": {
                            color: "#2866f2"
                        },
                        "& .MuiListItemText-primary": {
                            color: "#2866f2",
                            fontWeight: 600
                        },
                        "&:hover": {
                            backgroundColor: "rgba(40, 102, 242, 0.25)",
                        }
                    },
                    "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        "& .MuiListItemIcon-root": {
                            color: "#f5f7ff"
                        },
                    }
                }
            }
        }
    },
});
