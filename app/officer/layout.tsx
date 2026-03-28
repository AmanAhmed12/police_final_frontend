"use client";

import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { darkTheme } from "@/components/theme";
import OfficerSidebar from "@/components/officer/OfficerSidebar";
import OfficerTopbar from "@/components/officer/OfficerTopbar";

export default function OfficerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: 'background.default' }}>
                {/* Sidebar */}
                <OfficerSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        width: { md: `calc(100% - 280px)` } // Adjust based on sidebar width
                    }}
                >
                    <OfficerTopbar onSidebarOpen={() => setSidebarOpen(true)} />

                    <Box
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            flexGrow: 1,
                            overflow: "auto"
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
