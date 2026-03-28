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
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    SelectChangeEvent,
    TablePagination,
    Snackbar,
    Grid,
    InputAdornment,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { dutyService, Duty } from '@/app/services/dutyService';
import { getUsers } from '@/services/authService';

export default function AdminDutiesPage() {
    const [duties, setDuties] = useState<Duty[]>([]);
    const [officers, setOfficers] = useState<any[]>([]); // To populate the assign to dropdown
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentDuty, setCurrentDuty] = useState<Duty | null>(null);
    const [dutyToDelete, setDutyToDelete] = useState<number | null>(null);
    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const token = loggedInUser?.token;

    // Pagination & Search
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        officerId: '',
        dueDate: '',
        status: 'PENDING'
    });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const fetchDutiesAndOfficers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [dutiesData, usersData] = await Promise.all([
                dutyService.getAllDuties(token),
                getUsers(token)
            ]);
            setDuties(dutiesData);
            // Filter only officers
            const officersList = usersData.filter((u: any) => u.role?.toLowerCase() === 'officer');
            setOfficers(officersList);
        } catch (error: any) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Failed to load data");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDutiesAndOfficers();
        }
    }, [token]);

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
            (duty.officerName?.toLowerCase() || "").includes(query) ||
            (duty.status?.toLowerCase() || "").includes(query)
        );
    });

    const paginatedDuties = filteredDuties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleOpenDialog = (duty?: Duty) => {
        if (duty) {
            setCurrentDuty(duty);
            setFormData({
                title: duty.title,
                description: duty.description,
                officerId: duty.officerId.toString(),
                dueDate: duty.dueDate ? new Date(duty.dueDate).toISOString().slice(0, 16) : '',
                status: duty.status
            });
        } else {
            setCurrentDuty(null);
            setFormData({
                title: '',
                description: '',
                officerId: '',
                dueDate: '',
                status: 'PENDING'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentDuty(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSave = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const dutyPayload = {
                title: formData.title,
                description: formData.description,
                officerId: Number(formData.officerId),
                dueDate: formData.dueDate, // Ensure correct format handled by backend
                status: formData.status as any
            };

            if (currentDuty) {
                await dutyService.updateDuty(currentDuty.id, dutyPayload, token);
                setSnackbarSeverity("success");
                setSnackbarMessage("Duty updated successfully");
            } else {
                await dutyService.createDuty(dutyPayload, token);
                setSnackbarSeverity("success");
                setSnackbarMessage("Duty created successfully");
            }
            await fetchDutiesAndOfficers();
            handleCloseDialog();
            setSnackbarOpen(true);
        } catch (error: any) {
            setSnackbarSeverity("error");
            setSnackbarMessage(error.message || "Operation failed");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDutyToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (dutyToDelete === null || !token) return;
        setLoading(true);
        try {
            await dutyService.deleteDuty(dutyToDelete, token);
            await fetchDutiesAndOfficers();
            setOpenDeleteDialog(false);
            setDutyToDelete(null);
            setSnackbarSeverity("success");
            setSnackbarMessage("Duty deleted successfully");
            setSnackbarOpen(true);
        } catch (error: any) {
            setSnackbarSeverity("error");
            setSnackbarMessage(error.message || "Failed to delete duty");
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
                    Manage Duties
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Assign New Duty
                </Button>
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
                            placeholder="Type Title, Officer Name, or Status to search..."
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
                                <TableCell>Assigned Officer</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Updated</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDuties.length === 0 ? (
                                <TableRow key="no-duties">
                                    <TableCell colSpan={5} align="center">No duties found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedDuties.map((duty) => (
                                    <TableRow key={duty.id} hover>
                                        <TableCell>{duty.title}</TableCell>
                                        <TableCell>{duty.officerName || `Officer ID: ${duty.officerId}`}</TableCell>
                                        <TableCell>{duty.dueDate ? new Date(duty.dueDate).toLocaleString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={duty.status}
                                                color={getStatusColor(duty.status)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {duty.statusUpdatedAt ? new Date(duty.statusUpdatedAt).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(duty)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(duty.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
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

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentDuty ? 'Edit Duty' : 'Assign New Duty'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Duty Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Assign Officer</InputLabel>
                            <Select
                                name="officerId"
                                value={formData.officerId}
                                label="Assign Officer"
                                onChange={handleSelectChange}
                            >
                                {officers.map(officer => (
                                    <MenuItem key={officer.id} value={officer.id.toString()}>
                                        {officer.fullName} (NIC: {officer.nic})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Due Date"
                            name="dueDate"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            required
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this duty? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
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
