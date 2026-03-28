'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Select, MenuItem, InputLabel, FormControl,
    CircularProgress, Chip, TablePagination, InputAdornment, Tooltip,
    Fade, Stack, Zoom, Snackbar, Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Article as ArticleIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    NavigateNext as DetailsIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
    getGuidelines,
    createGuideline,
    updateGuideline,
    deleteGuideline,
    Guideline,
    GuidelineInput
} from '@/app/services/guidelines';
import { alpha, useTheme } from '@mui/material/styles';

export default function AdminGuidelinesPage() {
    const theme = useTheme();
    const token = useSelector((state: RootState) => state.auth.user?.token);

    // Data State
    const [guidelines, setGuidelines] = useState<Guideline[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [selectedGuideline, setSelectedGuideline] = useState<Partial<Guideline>>({
        title: '',
        category: '',
        priority: 'Medium',
        content: ''
    });

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchGuidelines = async () => {
        setLoading(true);
        if (token) {
            try {
                const data = await getGuidelines(token);
                setGuidelines(data);
            } catch (error) {
                console.error("Failed to fetch guidelines", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchGuidelines();
    }, [token]);

    // Derived Data
    const filteredGuidelines = useMemo(() => {
        return guidelines.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [guidelines, searchQuery, categoryFilter]);

    const paginatedGuidelines = useMemo(() => {
        return filteredGuidelines.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredGuidelines, page, rowsPerPage]);

    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(guidelines.map(g => g.category)))];
    }, [guidelines]);

    // Handlers
    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenCreate = () => {
        setDialogMode('create');
        setSelectedGuideline({ title: '', category: '', priority: 'Medium', content: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (guideline: Guideline) => {
        setDialogMode('edit');
        setSelectedGuideline({ ...guideline });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!token) return;

        // Filter input to send only the fields the backend Guideline model expects
        const guidelineInput: GuidelineInput = {
            title: selectedGuideline.title ?? '',
            category: selectedGuideline.category ?? '',
            content: selectedGuideline.content ?? '',
            priority: (selectedGuideline.priority as any) ?? 'Medium'
        };

        try {
            if (dialogMode === 'create') {
                await createGuideline(guidelineInput, token);
                setSnackbar({ open: true, message: 'Guideline created successfully!', severity: 'success' });
            } else if (dialogMode === 'edit' && selectedGuideline.id) {
                await updateGuideline(selectedGuideline.id, guidelineInput, token);
                setSnackbar({ open: true, message: 'Guideline updated successfully!', severity: 'success' });
            }
            fetchGuidelines();
            setOpenDialog(false);
        } catch (error: any) {
            console.error("Failed to save guideline", error);
            setSnackbar({
                open: true,
                message: `Error: ${error.message || 'Failed to save guideline'}`,
                severity: 'error'
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setIdToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (idToDelete && token) {
            try {
                await deleteGuideline(idToDelete, token);
                setSnackbar({ open: true, message: 'Guideline deleted successfully!', severity: 'success' });
                fetchGuidelines();
                setDeleteDialogOpen(false);
                setIdToDelete(null);
            } catch (error: any) {
                console.error("Delete failed", error);
                setSnackbar({
                    open: true,
                    message: `Error: ${error.message || 'Failed to delete guideline'}`,
                    severity: 'error'
                });
            }
        }
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'High': return { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) };
            case 'Medium': return { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) };
            case 'Low': return { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) };
            default: return { color: theme.palette.text.secondary, bg: theme.palette.action.hover };
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header Content */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="primary" sx={{ letterSpacing: '-1px', mb: 0.5 }}>
                        Guideline Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create, update, and manage official safety protocols for citizens.
                    </Typography>
                </Box>
                <Zoom in>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                            textTransform: 'none',
                            fontWeight: 700
                        }}
                    >
                        Add Guideline
                    </Button>
                </Zoom>
            </Box>

            {/* Controls Section */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Search titles or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                        sx: { borderRadius: '10px' }
                    }}
                />
                <FormControl size="small" sx={{ minWidth: '150px' }}>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        value={categoryFilter}
                        label="Category"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        sx={{ borderRadius: '10px' }}
                    >
                        {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
                    {filteredGuidelines.length} Guidelines Found
                </Typography>
            </Paper>

            {/* Table Section */}
            <Fade in timeout={800}>
                <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={10}>
                            <CircularProgress size={40} thickness={4} />
                            <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>Loading records...</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, py: 2 }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedGuidelines.length > 0 ? paginatedGuidelines.map((guideline) => {
                                        const pStyle = getPriorityStyles(guideline.priority);
                                        return (
                                            <TableRow key={guideline.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="700">
                                                        {guideline.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={guideline.category} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={guideline.priority}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: pStyle.bg,
                                                            color: pStyle.color,
                                                            fontWeight: 800,
                                                            fontSize: '0.65rem',
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography component="div" variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'primary.main' }}>
                                                            {guideline.createdByName?.charAt(0) || 'U'}
                                                        </Box>
                                                        {guideline.createdByName || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.disabled">
                                                        {new Date(guideline.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenEdit(guideline)}
                                                                sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick(guideline.id)}
                                                                sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <ArticleIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5, mb: 1 }} />
                                                <Typography variant="body1" color="text.secondary">No records found matching your filters.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredGuidelines.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                    />
                </Paper>
            </Fade>

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem' }}>
                    {dialogMode === 'create' ? 'Add New Guideline' : 'Edit Guideline'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        <TextField
                            label="Title"
                            fullWidth
                            variant="outlined"
                            value={selectedGuideline.title}
                            onChange={(e) => setSelectedGuideline({ ...selectedGuideline, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedGuideline.category}
                                    label="Category"
                                    onChange={(e) => setSelectedGuideline({ ...selectedGuideline, category: e.target.value })}
                                    sx={{ borderRadius: '12px' }}
                                >
                                    <MenuItem value="Safety">Safety</MenuItem>
                                    <MenuItem value="Procedure">Procedure</MenuItem>
                                    <MenuItem value="Legal">Legal</MenuItem>
                                    <MenuItem value="Emergency">Emergency</MenuItem>
                                    <MenuItem value="General">General</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={selectedGuideline.priority}
                                    label="Priority"
                                    onChange={(e) => setSelectedGuideline({ ...selectedGuideline, priority: e.target.value as any })}
                                    sx={{ borderRadius: '12px' }}
                                >
                                    <MenuItem value="High">High</MenuItem>
                                    <MenuItem value="Medium">Medium</MenuItem>
                                    <MenuItem value="Low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <TextField
                            label="Content"
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            value={selectedGuideline.content}
                            onChange={(e) => setSelectedGuideline({ ...selectedGuideline, content: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ borderRadius: '10px', px: 4, fontWeight: 700, textTransform: 'none' }}
                    >
                        Save Record
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Are you sure you want to delete this guideline? This action uses a <b>Soft Delete</b>, so it won't be visible in the citizen portal but archived in our records.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        sx={{ borderRadius: '10px', fontWeight: 700 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: '12px',
                        fontWeight: 600,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
