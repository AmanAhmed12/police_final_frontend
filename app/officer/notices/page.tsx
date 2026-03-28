"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
    Typography, Box, Paper, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Snackbar, Alert,
    CircularProgress, List, ListItem, ListItemText, ListItemAvatar,
    Avatar, Divider, Tooltip, useTheme, useMediaQuery, Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    NotificationsActive as NoticeIcon,
    Search as SearchIcon,
    CalendarToday as CalendarIcon,
    Label as LabelIcon,
    History as HistoryIcon
} from '@mui/icons-material';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    Notice,
    NoticeInput
} from '@/services/noticeService';

export default function NoticePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const token = useSelector((state: RootState) => state.auth.user?.token);

    // --- State ---
    const [notices, setNotices] = useState<Notice[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const [formData, setFormData] = useState<NoticeInput>({
        title: '',
        content: '',
        category: 'General'
    });

    // --- API Logic ---
    const fetchNotices = useCallback(async () => {
        if (!token) return;
        setFetching(true);
        try {
            const data = await getNotices(token);
            setNotices(data);
        } catch (error: any) {
            if (error.message !== "SESSION_EXPIRED") {
                setSnackbar({ open: true, message: "Failed to load notices", severity: "error" });
            }
        } finally {
            setFetching(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    // --- Handlers ---
    const handleOpenDialog = (notice?: Notice) => {
        if (notice) {
            setCurrentNotice(notice);
            setFormData({
                title: notice.title,
                content: notice.content,
                category: notice.category
            });
        } else {
            setCurrentNotice(null);
            setFormData({ title: '', content: '', category: 'General' });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (currentNotice) {
                await updateNotice(currentNotice.id, formData, token);
                setSnackbar({ open: true, message: "Notice updated successfully", severity: "success" });
            } else {
                await createNotice(formData, token);
                setSnackbar({ open: true, message: "New notice posted", severity: "success" });
            }
            fetchNotices();
            setOpenDialog(false);
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || "An error occurred", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !currentNotice) return;
        setLoading(true);
        try {
            await deleteNotice(currentNotice.id, token);
            setSnackbar({ open: true, message: "Notice deleted successfully", severity: "success" });
            fetchNotices();
            setOpenDeleteDialog(false);
        } catch (error: any) {
            setSnackbar({ open: true, message: "Delete failed", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Urgent': return theme.palette.error.main;
            case 'Event': return theme.palette.secondary.main;
            default: return theme.palette.primary.main;
        }
    };

    // Helper to format dates safely
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1100, margin: '0 auto', minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-1.5px', mb: 1 }}>
                        Notices
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                        Manage official announcements and community updates.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        borderRadius: '16px',
                        px: 4, py: 1.5,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        textTransform: 'none',
                        fontWeight: 700
                    }}
                >
                    Add Notice
                </Button>
            </Box>

            {/* Search Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: '6px 16px', mb: 4, display: 'flex', alignItems: 'center',
                    borderRadius: '20px', border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.08)' }
                }}
            >
                <SearchIcon sx={{ color: 'text.disabled', mr: 1.5 }} />
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Search by title or content..."
                    InputProps={{ disableUnderline: true }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ py: 1 }}
                />
            </Paper>

            {/* List Section */}
            <Paper sx={{ borderRadius: '24px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                {fetching ? (
                    <Box sx={{ py: 15, textAlign: 'center' }}>
                        <CircularProgress size={40} thickness={4} />
                        <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>Fetching announcements...</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredNotices.length > 0 ? filteredNotices.map((notice, index) => (
                            <React.Fragment key={notice.id}>
                                <ListItem
                                    sx={{
                                        py: 4, px: { xs: 3, md: 5 },
                                        transition: '0.2s',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        alignItems: isMobile ? 'flex-start' : 'center'
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 70 }}>
                                        <Avatar sx={{
                                            bgcolor: `${getCategoryColor(notice.category)}15`,
                                            color: getCategoryColor(notice.category),
                                            width: 56, height: 56,
                                            borderRadius: '16px'
                                        }}>
                                            <NoticeIcon fontSize="medium" />
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primaryTypographyProps={{ component: 'div' }}
                                        secondaryTypographyProps={{ component: 'div' }}
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                    {notice.title}
                                                </Typography>
                                                <Chip
                                                    label={notice.category}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        bgcolor: `${getCategoryColor(notice.category)}15`,
                                                        color: getCategoryColor(notice.category),
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, maxWidth: '800px', lineHeight: 1.7 }}>
                                                    {notice.content}
                                                </Typography>

                                                {/* Meta Info Section */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {/* Creation Row */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.disabled', flexWrap: 'wrap' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <CalendarIcon sx={{ fontSize: 16 }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                Posted: {formatDate(notice.createdAt)}
                                                                {notice.createdBy?.fullName && ` by ${notice.createdBy.fullName}`}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LabelIcon sx={{ fontSize: 16 }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>ID: #{notice.id}</Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Update Row - Only shows if data exists */}
                                                    {(notice.updatedAt || notice.updatedBy) && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'info.main', opacity: 0.8 }}>
                                                            <HistoryIcon sx={{ fontSize: 14 }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                                                                Last edited
                                                                {notice.updatedAt && ` on ${formatDate(notice.updatedAt)}`}
                                                                {notice.updatedBy?.fullName && ` by ${notice.updatedBy.fullName}`}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                    />

                                    <Box sx={{ display: 'flex', gap: 1, ml: isMobile ? 0 : 'auto', mt: isMobile ? 3 : 0 }}>
                                        <Tooltip title="Edit Notice">
                                            <IconButton onClick={() => handleOpenDialog(notice)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                                                <EditIcon fontSize="small" color="primary" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => { setCurrentNotice(notice); setOpenDeleteDialog(true); }}
                                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}
                                            >
                                                <DeleteIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </ListItem>
                                {index < filteredNotices.length - 1 && <Divider sx={{ mx: 4 }} />}
                            </React.Fragment>
                        )) : (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.disabled">No notices found.</Typography>
                            </Box>
                        )}
                    </List>
                )}
            </Paper>

            {/* Save/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => !loading && setOpenDialog(false)}
                fullWidth maxWidth="sm"
                PaperProps={{ sx: { borderRadius: '28px', p: 1.5 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.6rem' }}>
                    {currentNotice ? 'Update Notice' : 'New Announcement'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <TextField
                            select
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            SelectProps={{ native: true }}
                        >
                            <option value="General">General</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Event">Event</option>
                        </TextField>
                        <TextField
                            label="Content"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading || !formData.title || !formData.content}
                        sx={{ borderRadius: '12px', px: 4 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Notice'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => !loading && setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this notice? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Global Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}