"use client";
import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Divider,
    Grid,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateProfile, changePassword, getProfile } from "@/services/authService";
import { updateUser } from "@/lib/features/auth/authSlice";

export default function SettingsComponent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const token = user?.token;

    // Profile Picture State
    const [profilePicture, setProfilePicture] = useState<string | null>(
        user?.profilePicture || null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Personal Info State (editable fields)
    const [email, setEmail] = useState(user?.email || "");
    const [username, setUsername] = useState(user?.username || "");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    // Fetch user profile on mount to ensure data is fresh
    React.useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                try {
                    const profileData = await getProfile(token);
                    if (profileData) {
                        dispatch(updateUser(profileData));
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };
        fetchUserData();
    }, [token, dispatch]);

    // Update local state when user data changes
    React.useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setUsername(user.username || "");
            setProfilePicture(user.profilePicture || null);
        }
    }, [user]);

    // Handle Profile Picture Upload
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Profile Update
    const handleProfileUpdate = async () => {
        if (!selectedFile) {
            setSnackbar({
                open: true,
                message: "Please select a profile picture to upload",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("profilePicture", selectedFile);
            formData.append("email", email);
            formData.append("username", username);

            const updatedUser = await updateProfile(formData, token);

            // Update Redux store
            dispatch(updateUser({ profilePicture: updatedUser.profilePicture }));

            setSnackbar({
                open: true,
                message: "Profile updated successfully! Logging out for security...",
                severity: "success",
            });

            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/Login';
            }, 1500);

            setSelectedFile(null);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to update profile",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle Personal Info Update
    const handlePersonalInfoUpdate = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("username", username);
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const updatedUser = await updateProfile(formData, token);

            // Update Redux store
            dispatch(updateUser({ email: updatedUser.email, username: updatedUser.username }));

            // Any change to personal info requires logout for security
            setSnackbar({
                open: true,
                message: "Information updated! Logging out for security...",
                severity: "success",
            });
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/Login';
            }, 1500);

        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to update personal information",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle Password Change
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setSnackbar({
                open: true,
                message: "Please fill in all password fields",
                severity: "error",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setSnackbar({
                open: true,
                message: "New passwords do not match",
                severity: "error",
            });
            return;
        }

        if (newPassword.length < 6) {
            setSnackbar({
                open: true,
                message: "Password must be at least 6 characters long",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Change Password FIRST (while token username is still valid)
            await changePassword({ currentPassword, newPassword }, token);

            // 2. Check for pending profile changes and save them SECOND
            if (email !== user?.email || username !== user?.username || selectedFile) {
                const formData = new FormData();
                formData.append("email", email);
                formData.append("username", username);
                if (selectedFile) {
                    formData.append("profilePicture", selectedFile);
                }
                await updateProfile(formData, token);
            }

            setSnackbar({
                open: true,
                message: "Password and profile updated successfully! Logging out...",
                severity: "success",
            });

            // Auto-logout after short delay
            setTimeout(async () => {
                // Clear local storage manually as fallback
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/Login';
            }, 1500);

            // Clear password fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to change password",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Settings
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
                Manage your account settings and preferences
            </Typography>

            {/* Profile Picture Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <PersonOutlineIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" fontWeight={600}>
                        Profile Picture
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box display="flex" alignItems="center" gap={3}>
                    <Box position="relative">
                        <Avatar
                            src={profilePicture || undefined}
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: "primary.main",
                                fontSize: "3rem",
                            }}
                        >
                            {!profilePicture && user?.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="profile-picture-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="profile-picture-upload">
                            <IconButton
                                component="span"
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: "primary.main",
                                    "&:hover": { bgcolor: "primary.dark" },
                                }}
                            >
                                <PhotoCameraIcon sx={{ color: "white" }} />
                            </IconButton>
                        </label>
                    </Box>

                    <Box>
                        <Typography variant="body1" fontWeight={600} gutterBottom>
                            {user?.fullName || "User"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {user?.email || "No email provided"}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleProfileUpdate}
                            disabled={!selectedFile || loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Save Changes"}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Personal Information Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <PersonOutlineIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" fontWeight={600}>
                        Personal Information
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            type="email"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="contained"
                            onClick={handlePersonalInfoUpdate}
                            disabled={loading}
                            sx={{ minWidth: 150 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Save Changes"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Change Password Section */}
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <LockOutlinedIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" fontWeight={600}>
                        Change Password
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handlePasswordChange}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Current Password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ minWidth: 150 }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Change Password"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
