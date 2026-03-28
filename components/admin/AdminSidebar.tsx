"use client";

import React from "react";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Divider,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import { adminNavigation } from "./navigation";

const DRAWER_WIDTH = 280;

interface AdminSidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const pathname = usePathname();

    const DrawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Brand area */}
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: "primary.main",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: 'white'
                    }}
                >
                    <LocalPoliceIcon />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'white' }}>
                    Police Assist
                </Typography>
                {isMobile && (
                    <IconButton onClick={onClose} sx={{ ml: "auto", color: "text.secondary" }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Navigation Links */}
            <List component="nav" sx={{ flexGrow: 1, px: 2 }}>
                {adminNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={isMobile ? onClose : undefined}
                                sx={{
                                    py: 0.5,
                                    my: 0.25,
                                    borderRadius: 1
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            color: isActive ? 'primary.main' : 'white',
                                            fontWeight: isActive ? 600 : 400
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </Link>
                    );
                })}
            </List>

            {/* Footer / Info */}
            <Box sx={{ p: 2 }}>
                <Box sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(40,102,242,0.08)',
                    border: '1px solid rgba(40,102,242,0.1)',
                    textAlign: 'center'
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                        Admin Console
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
                        v1.0.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            aria-label="admin folders"
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: DRAWER_WIDTH,
                    },
                }}
            >
                {DrawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: DRAWER_WIDTH,
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                    },
                }}
                open
            >
                {DrawerContent}
            </Drawer>
        </Box>
    );
}
