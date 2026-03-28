"use client";

import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { citizenTheme } from "@/components/citizen/CitizenTheme";
import CitizenSidebar from "@/components/citizen/CitizenSidebar";
import CitizenTopbar from "@/components/citizen/CitizenTopbar";

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ThemeProvider theme={citizenTheme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: 'background.default' }}>
                {/* Sidebar */}
                <CitizenSidebar
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
                    <CitizenTopbar onSidebarOpen={() => setSidebarOpen(true)} />

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
