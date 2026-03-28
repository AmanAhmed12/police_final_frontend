"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    Paper,
    alpha,
    TextField,
    InputAdornment,
    IconButton as MuiIconButton,
    Tooltip,
    CircularProgress,
    Skeleton,
    Zoom
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import MessageIcon from "@mui/icons-material/Message";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { format } from "date-fns";
import { getMyNotifications, sendNotification, getChatHistory } from "@/app/services/notificationService";
import { Notification } from "@/lib/features/notifications/notificationSlice";
import { useNotificationContext } from "@/components/providers/NotificationProvider";

interface ChatHistoryModalProps {
    open: boolean;
    onClose: () => void;
    initialTarget?: { id: number; fullName: string } | null;
}

export default function ChatHistoryModal({ open, onClose, initialTarget }: ChatHistoryModalProps): React.JSX.Element {
    const { refresh } = useNotificationContext();
    const [history, setHistory] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: number; fullName: string } | null>(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const currentUser = useSelector((state: RootState) => state.auth.user);
    const token = currentUser?.token;

    useEffect(() => {
        setReplyTo(initialTarget || null);
        if (!initialTarget) {
            setHistory([]); // Clear history before refetching for "View All"
        }
    }, [initialTarget]);

    const fetchHistory = async (target = replyTo) => {
        if (!token) return;
        setLoading(true);
        try {
            let data: Notification[] = [];
            const targetId = target?.id ? Number(target.id) : null;

            if (targetId && targetId !== 0) {
                // Fetch specific chat history with this person
                data = await getChatHistory(targetId, token);
            } else {
                // Fetch all notifications (for "View All")
                data = await getMyNotifications(token);
            }

            setHistory(data);

            // If we have data but no confirmed partner yet, pick the most relevant partner
            if (data.length > 0) {
                const myId = currentUser?.id ? Number(currentUser.id) : null;
                const myName = currentUser?.fullName;

                // If we don't have a target, or if the history we fetched seems to be for the wrong person
                if (!target || target.id === 0) {
                    const mostRecent = data[0];
                    const senderId = mostRecent.sender?.id ? Number(mostRecent.sender.id) : null;
                    const senderName = mostRecent.sender?.fullName;

                    const isSenderMe = (myId && senderId && myId === senderId) ||
                        (myName && senderName && myName === senderName);

                    const partner = isSenderMe ? mostRecent.receiver : mostRecent.sender;

                    if (partner && partner.id) {
                        setReplyTo({ id: Number(partner.id), fullName: partner.fullName || "User" });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && token) {
            const effectiveTarget = initialTarget || null;
            setReplyTo(effectiveTarget);
            setHistory([]); // Clear while loading
            fetchHistory(effectiveTarget);
        }
    }, [open, token, `${initialTarget?.id}-${initialTarget?.fullName}`]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (history.length > 0) {
            scrollToBottom();
        }
    }, [history]);

    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyTo]);

    const handleSendReply = async () => {
        if (!replyTo || !replyText.trim() || !token) return;

        setSending(true);
        try {
            await sendNotification(replyTo.id, replyText, token);
            setReplyText("");
            await fetchHistory(); // Refresh local history
            refresh(); // Refresh global notification bell count
        } catch (error) {
            console.error("Failed to send reply:", error);
            alert("Failed to send reply. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxHeight: '85vh',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    backgroundImage: 'none'
                }
            }}
        >
            <DialogTitle component="div" sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <MessageIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="800">Messages</Typography>
                        {replyTo && (
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: -0.5 }}>
                                Chatting with {replyTo.fullName}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box>
                    <Tooltip title="Refresh">
                        <MuiIconButton size="small" onClick={() => fetchHistory()} sx={{ mr: 1 }}>
                            <RefreshIcon fontSize="small" />
                        </MuiIconButton>
                    </Tooltip>
                    <MuiIconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </MuiIconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: alpha('#f4f7fe', 0.4), position: 'relative' }}>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
                    {loading && history.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
                            <CircularProgress size={32} thickness={5} />
                            <Typography variant="body2" color="textSecondary">Securing connection...</Typography>
                        </Box>
                    ) : history.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.5 }}>
                            <MessageIcon sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
                            <Typography variant="h6" color="textSecondary">No conversations yet</Typography>
                            <Typography variant="body2" color="textSecondary">Send a message to start the thread</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {[...history].reverse().map((notif) => {
                                const isMe = Number(notif.sender.id) === Number(currentUser?.id) ||
                                    (currentUser?.fullName && notif.sender.fullName === currentUser.fullName);
                                return (
                                    <Box
                                        key={notif.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                            width: '100%'
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            maxWidth: '85%',
                                            flexDirection: isMe ? 'row-reverse' : 'row',
                                            alignItems: 'flex-start'
                                        }}>
                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: isMe ? 'primary.main' : 'secondary.main',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {notif.sender.fullName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                                                        bgcolor: isMe ? 'primary.main' : 'background.paper',
                                                        color: isMe ? 'white' : 'text.primary',
                                                        boxShadow: isMe
                                                            ? '0 4px 12px rgba(40,102,242,0.2)'
                                                            : '0 2px 8px rgba(0,0,0,0.04)',
                                                        border: isMe ? 'none' : '1px solid',
                                                        borderColor: 'divider',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <Typography variant="caption" fontWeight="900" display="block" sx={{ mb: 0.75, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, opacity: isMe ? 0.8 : 0.6 }}>
                                                        {notif.sender.fullName}{isMe ? " (YOU)" : ""}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
                                                        {notif.message}
                                                    </Typography>
                                                </Paper>
                                                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem', color: 'text.secondary', px: 0.5 }}>
                                                    {format(new Date(notif.createdAt), 'hh:mm a')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <Box sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder={replyTo ? `Type a reply to ${replyTo.fullName.split(' ')[0]}...` : "Select a user to message"}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={!replyTo || sending}
                        inputRef={inputRef}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                            }
                        }}
                        InputProps={{
                            sx: {
                                borderRadius: 3,
                                bgcolor: alpha('#f4f7fe', 0.5),
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                                py: 1.5
                            }
                        }}
                    />
                    <Tooltip title="Send Message">
                        <span>
                            <MuiIconButton
                                color="primary"
                                onClick={handleSendReply}
                                disabled={!replyTo || !replyText.trim() || sending}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 48,
                                    height: 48,
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'white' },
                                    boxShadow: '0 4px 12px rgba(40,102,242,0.3)'
                                }}
                            >
                                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                            </MuiIconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
        </Dialog>
    );
}
