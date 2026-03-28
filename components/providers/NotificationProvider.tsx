"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
    setNotifications,
    addNotification,
    setLoading,
    setError
} from "@/lib/features/notifications/notificationSlice";
import { logout } from "@/lib/features/auth/authSlice";
import { getMyNotifications } from "@/app/services/notificationService";
import { Snackbar, Alert, Typography, Box } from "@mui/material";

const NotificationContext = createContext({
    refresh: () => { },
});

export const useNotificationContext = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const token = currentUser?.token;

    const [toast, setToast] = React.useState<{ open: boolean; message: string; sender: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchNotifications = async (isInitial = false) => {
        if (!token) return;

        try {
            // Proactive check for token expiration
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    dispatch(logout());
                    return;
                }
            }

            if (isInitial) dispatch(setLoading(true));
            const data = await getMyNotifications(token);

            // Check for new notifications to show toast
            if (!isInitial && data.length > notifications.length) {
                const newNotifs = data.filter(
                    (n: any) => !notifications.find((old: any) => old.id === n.id)
                );

                if (newNotifs.length > 0) {
                    const latest = newNotifs[0];
                    if (latest.sender.id !== currentUser.id) {
                        setToast({
                            open: true,
                            message: latest.message,
                            sender: latest.sender.fullName
                        });
                        // Play sound if possible
                        if (audioRef.current) {
                            audioRef.current.play().catch(() => { });
                        }
                    }
                }
            }

            dispatch(setNotifications(data));
        } catch (error: any) {
            if (error.message === "Unauthorized") {
                dispatch(logout());
                return;
            }
            console.error("Failed to fetch notifications:", error);
            dispatch(setError(error.message));
        } finally {
            if (isInitial) dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications(true);
            const interval = setInterval(() => fetchNotifications(), 15000); // Poll every 15s
            return () => clearInterval(interval);
        }
    }, [token, notifications.length]); // Dependencies help but be careful of loops

    return (
        <NotificationContext.Provider value={{ refresh: () => fetchNotifications() }}>
            {children}

            {/* Audio for notification - Uncomment when audio file is added */}
            {/* <audio ref={audioRef} src="/notification-hit.mp3" preload="auto" /> */}

            {/* Notification Toast */}
            <Snackbar
                open={!!toast?.open}
                autoHideDuration={6000}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 7 }}
            >
                <Alert
                    onClose={() => setToast(null)}
                    severity="info"
                    variant="filled"
                    sx={{
                        width: '100%',
                        bgcolor: 'primary.main',
                        '& .MuiAlert-icon': { color: 'white' }
                    }}
                >
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            New Message from {toast?.sender}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {toast?.message}
                        </Typography>
                    </Box>
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}
