"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    alpha,
    Skeleton,
    Tooltip,
    Zoom,
    CircularProgress
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useSelector, useDispatch } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { markAsRead } from "@/app/services/notificationService";
import {
    updateNotificationReadStatus,
    markAllAsReadSuccess,
    Notification
} from "@/lib/features/notifications/notificationSlice";
import { RootState } from "@/lib/store";
import ChatHistoryModal from "./ChatHistoryModal";

export default function NotificationDropdown() {
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(2);
    const [chatTarget, setChatTarget] = useState<{ id: number; fullName: string } | null>(null);

    // Using global state from Redux
    const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notifications);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const token = currentUser?.token;

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setDisplayLimit(2); // Reset limit when closing
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#2866f2', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleNotificationClick = async (notif: Notification) => {
        try {
            // Mark as read first if unread
            if (!notif.read) {
                await markAsRead(notif.id, token);
                dispatch(updateNotificationReadStatus({ id: notif.id, read: true }));
            }

            const myId = currentUser?.id ? Number(currentUser.id) : null;
            const myName = currentUser?.fullName;
            const senderId = notif.sender?.id ? Number(notif.sender.id) : null;
            const senderName = notif.sender?.fullName;

            // Determine if I am the sender using ID or Name as fallback
            const isMeSender = (myId && senderId && myId === senderId) ||
                (myName && senderName && myName === senderName);

            const targetUser = isMeSender ? notif.receiver : notif.sender;

            if (targetUser && (targetUser.id || targetUser.fullName)) {
                setChatTarget({
                    id: targetUser.id ? Number(targetUser.id) : 0,
                    fullName: targetUser.fullName || "User"
                });
                setHistoryOpen(true);
            } else {
                setChatTarget(null);
                setHistoryOpen(true);
            }

            handleClose();
        } catch (error) {
            console.error("Failed to handle notification click:", error);
        }
    };

    const handleMarkAsReadOnly = async (id: number) => {
        try {
            await markAsRead(id, token);
            dispatch(updateNotificationReadStatus({ id, read: true }));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;

            // Optimistic update could be done here, but let's be safe
            await Promise.all(unreadIds.map(id => markAsRead(id, token)));
            dispatch(markAllAsReadSuccess());
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const displayedNotifications = notifications.slice(0, displayLimit);

    return (
        <>
            <IconButton size="large" color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1.5,
                            width: 360,
                            maxHeight: 520,
                            borderRadius: 3,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            overflow: 'visible',
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        }
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight="700" color="text.primary">
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <Box sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 1,
                                py: 0.2,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount} New
                            </Box>
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAllAsRead}
                            startIcon={<DoneAllIcon sx={{ fontSize: '1rem' }} />}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'primary.main' }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ p: 0, maxHeight: 380, overflow: 'auto' }}>
                    {loading && notifications.length === 0 ? (
                        [...Array(3)].map((_, i) => (
                            <ListItem key={i} sx={{ px: 2, py: 1.5 }}>
                                <ListItemAvatar>
                                    <Skeleton variant="circular" width={40} height={40} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Skeleton variant="text" width="60%" />}
                                    secondary={<Skeleton variant="text" width="90%" />}
                                />
                            </ListItem>
                        ))
                    ) : notifications.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center', opacity: 0.8 }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: alpha('#2866f2', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                mb: 2
                            }}>
                                <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="body1" fontWeight="600" color="text.primary">No notifications yet</Typography>
                            <Typography variant="body2" color="text.secondary">We'll alert you when something happens.</Typography>
                        </Box>
                    ) : (
                        displayedNotifications.map((notification) => (
                            <ListItem
                                key={notification.id}
                                sx={{
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: alpha('#2866f2', 0.04) },
                                    bgcolor: !notification.read ? alpha('#2866f2', 0.02) : 'transparent',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid',
                                    borderColor: alpha('#000', 0.03),
                                    px: 2,
                                    py: 1.5
                                }}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        invisible={notification.read}
                                        sx={{ '& .MuiBadge-badge': { bgcolor: 'primary.main', border: '2px solid white' } }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: getAvatarColor(notification.sender.fullName || "Admin"),
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {(notification.sender.fullName || "A").charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ component: 'div' }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography variant="subtitle2" fontWeight={notification.read ? "600" : "700"} color="text.primary">
                                                {Number(notification.sender.id) === Number(currentUser?.id)
                                                    ? `To: ${notification.receiver.fullName}`
                                                    : notification.sender.fullName || "Admin"}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color={notification.read ? "text.secondary" : "text.primary"}
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    mb: 0.5,
                                                    fontSize: '0.85rem',
                                                    lineHeight: 1.4,
                                                    fontWeight: notification.read ? 400 : 500
                                                }}
                                            >
                                                {notification.message}
                                            </Typography>
                                            {!notification.read && (
                                                <Button
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsReadOnly(notification.id);
                                                    }}
                                                    sx={{
                                                        p: 0,
                                                        minWidth: 0,
                                                        textTransform: 'none',
                                                        fontSize: '0.7rem',
                                                        color: 'primary.main',
                                                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                    }}
                                                >
                                                    Mark as read
                                                </Button>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>

                <Divider />

                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {notifications.length > 2 && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {displayLimit < notifications.length ? (
                                <Button
                                    fullWidth
                                    startIcon={<ExpandMoreIcon />}
                                    sx={{ textTransform: 'none', py: 0.5, fontSize: '0.8rem' }}
                                    variant="text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDisplayLimit(prev => Math.min(prev + 5, notifications.length));
                                    }}
                                >
                                    View More
                                </Button>
                            ) : (
                                <Button
                                    fullWidth
                                    startIcon={<ExpandLessIcon />}
                                    sx={{ textTransform: 'none', py: 0.5, fontSize: '0.8rem' }}
                                    variant="text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDisplayLimit(2);
                                    }}
                                >
                                    Show Less
                                </Button>
                            )}
                            {displayLimit < notifications.length && (
                                <Button
                                    fullWidth
                                    startIcon={<ListAltIcon sx={{ fontSize: '1rem' }} />}
                                    sx={{ textTransform: 'none', py: 0.5, fontSize: '0.8rem' }}
                                    variant="text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDisplayLimit(notifications.length);
                                    }}
                                >
                                    View All
                                </Button>
                            )}
                        </Box>
                    )}
                    {currentUser?.role !== 'ADMIN' && currentUser?.role !== 'Admin' && (
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                py: 1,
                                borderRadius: 2,
                                boxShadow: 'none',
                                fontWeight: '600',
                                '&:hover': { boxShadow: '0 4px 12px rgba(40, 102, 242, 0.2)' }
                            }}
                            color="primary"
                            onClick={() => {
                                setChatTarget(null);
                                setHistoryOpen(true);
                                handleClose();
                            }}
                        >
                            Conversations History
                        </Button>
                    )}
                </Box>
            </Menu>

            <ChatHistoryModal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                initialTarget={chatTarget}
            />
        </>
    );
}
