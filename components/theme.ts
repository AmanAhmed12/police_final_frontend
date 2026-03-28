"use client";
import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    palette: {
        mode: "dark", // Enable dark mode features (e.g., default text/background)
        primary: {
            main: "#2866f2", // Your main dark blue
            light: "#6699ff",
            dark: "#1741a6",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#f5f7ff", // Your main white/off-white
            light: "#ffffff",
            dark: "#cccccc",
            contrastText: "#000000",
        },
        error: { // Good to define for form validation
            main: '#ef5350',
        },
        background: {
            default: "#0f111a", // Deep dark blue for the overall page background
            paper: "#1f2433", // Slightly lighter dark blue for card/paper backgrounds
        },
        text: {
            primary: "#f5f7ff", // White text for primary content
            secondary: "#a0a4b7", // Lighter grey for secondary text (e.g., labels, hints)
        },
    },
    typography: {
        fontFamily: "Roboto, sans-serif", // Or your preferred font (e.g., 'Inter', 'sans-serif')
        h5: {
            fontWeight: 700,
            color: "#2866f2", // Specific color for "Welcome Back"
        },
        subtitle1: {
            color: "#a0a4b7", // Color for "Sign in to your account"
        },
        body2: {
            color: "#a0a4b7", // Color for "Don't have an account?"
        },
    },
    components: {
        // Global overrides for Material-UI components
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "#3a415a",
                        },
                        "&:hover fieldset": {
                            borderColor: "#2866f2",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#2866f2",
                        },
                    },
                    "& .MuiInputLabel-root": {
                        color: "#a0a4b7",
                        "&.Mui-focused": {
                            color: "#2866f2",
                        }
                    },
                    "& .MuiInputBase-input": {
                        color: "#f5f7ff",
                    },
                    "& .MuiInputAdornment-root": {
                        color: "#a0a4b7",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                    boxShadow: "none",
                    transition: "all 0.2s",
                },
                containedPrimary: {
                    backgroundColor: "#2866f2",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(40,102,242,0.12)",
                    "&:hover": {
                        backgroundColor: "#1741a6",
                    },
                },
                text: {
                    backgroundColor: "transparent",
                    "&:hover": {
                        backgroundColor: "rgba(40, 102, 242, 0.08)",
                    }
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "#1f2433",
                    borderRadius: "18px",
                    boxShadow: "0 8px 32px rgba(40,102,242,0.15)",
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: '#2866f2',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    "&:hover": {
                        color: '#6699ff',
                    }
                }
            }
        }
    },
});
