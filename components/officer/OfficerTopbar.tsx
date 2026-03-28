"use client";

import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Badge,
    Menu,
    MenuItem,
    Stack,
    Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/features/auth/authSlice';
import { logoutUser } from '@/app/services/authService';
import { RootState } from "@/lib/store";
import NotificationDropdown from "@/components/common/NotificationDropdown";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '30ch',
        },
    },
}));

interface OfficerTopbarProps {
    onSidebarOpen: () => void;
}

export default function OfficerTopbar({ onSidebarOpen }: OfficerTopbarProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            if (!user?.token) return;
            await logoutUser(user.token);
            dispatch(logout());
            router.push('/Login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still logout from frontend even if backend fails
            dispatch(logout());
            router.push('/Login');
        }
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(15, 17, 26, 0.7) !important", // Use alpha version of background
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 64, md: 80 } }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onSidebarOpen}
                    sx={{ mr: 2, display: { md: "none" } }} // Hide on desktop
                >
                    <MenuIcon />
                </IconButton>

                {/* Search Bar */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search records..."
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </Box>

                {/* Right Side Icons */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationDropdown />


                    <Box sx={{ ml: 1 }}>
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            sx={{ p: 0 }}
                        >
                            <Avatar
                                alt={user?.fullName || "Officer"}
                                src={user?.profilePicture || undefined}
                                sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}
                            >
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "O"}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1.5,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                }
                            }}
                        >
                            <MenuItem onClick={() => { handleMenuClose(); router.push('/officer/duties'); }}>My Duties</MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); router.push('/officer/settings'); }}>My Profile</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
