"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    TablePagination,
    Snackbar,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { dutyService, Duty } from '@/app/services/dutyService';

export default function OfficerDutiesPage() {
    const [duties, setDuties] = useState<Duty[]>([]);
    const [loading, setLoading] = useState(false);
    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const token = loggedInUser?.token;
    const userId = loggedInUser?.id;

    // Pagination & Search
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [currentDuty, setCurrentDuty] = useState<Duty | null>(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const fetchDuties = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Because AuthResponse may not contain the ID, we fallback to getProfile
            let actualUserId = userId;
            if (!actualUserId) {
                const { getProfile } = await import('@/app/services/authService');
                const profile = await getProfile(token);
                actualUserId = profile.id;
            }

            if (actualUserId) {
                const data = await dutyService.getDutiesByOfficer(actualUserId, token);
                setDuties(data);
            }
        } catch (error: any) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Failed to load your duties");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDuties();
        }
    }, [token, userId]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const filteredDuties = duties.filter(duty => {
        const query = searchQuery.toLowerCase();
        return (
            (duty.title?.toLowerCase() || "").includes(query) ||
            (duty.status?.toLowerCase() || "").includes(query)
        );
    });

    const paginatedDuties = filteredDuties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleOpenDialog = (duty: Duty) => {
        setCurrentDuty(duty);
        setStatusToUpdate(duty.status);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentDuty(null);
    };

    const handleStatusChange = (e: SelectChangeEvent) => {
        setStatusToUpdate(e.target.value);
    };

    const handleSaveStatus = async () => {
        if (!token || !currentDuty) return;
        setLoading(true);
        try {
            await dutyService.updateDutyStatus(currentDuty.id, statusToUpdate, token);
            setSnackbarSeverity("success");
            setSnackbarMessage("Status updated successfully");
            setSnackbarOpen(true);
            await fetchDuties();
            handleCloseDialog();
        } catch (error: any) {
            setSnackbarSeverity("error");
            setSnackbarMessage(error.message || "Failed to update status");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'warning';
            case 'PENDING': default: return 'info';
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    My Assigned Duties
                </Typography>
            </Box>

            {/* Search Section */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            label="Search Duties"
                            variant="outlined"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Type Title or Status to search..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearAllIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Duties Table */}
            <Paper sx={{ mt: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Updated</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDuties.length === 0 ? (
                                <TableRow key="no-duties">
                                    <TableCell colSpan={5} align="center">You have no assigned duties at the moment.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedDuties.map((duty) => (
                                    <TableRow key={duty.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{duty.title}</TableCell>
                                        <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {duty.description}
                                        </TableCell>
                                        <TableCell>{duty.dueDate ? new Date(duty.dueDate).toLocaleString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={duty.status}
                                                color={getStatusColor(duty.status)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {duty.statusUpdatedAt ? new Date(duty.statusUpdatedAt).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenDialog(duty)}
                                                disabled={duty.status === 'COMPLETED'}
                                            >
                                                {duty.status === 'COMPLETED' ? 'Completed' : 'Update'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredDuties.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Update Status Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>Update Duty Status</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Task: {currentDuty?.title}
                        </Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusToUpdate}
                                label="Status"
                                onChange={handleStatusChange}
                            >
                                {currentDuty?.status === 'PENDING' && <MenuItem value="PENDING">Pending</MenuItem>}
                                {(currentDuty?.status === 'PENDING' || currentDuty?.status === 'IN_PROGRESS') && <MenuItem value="IN_PROGRESS">In Progress</MenuItem>}
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveStatus} variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
