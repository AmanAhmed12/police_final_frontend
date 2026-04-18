"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, Chip, CircularProgress, TablePagination } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { getAllComplaints, deleteComplaint, updateComplaintStatus, updateComplaintFir, Complaint } from '@/app/services/complaintService';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';

export default function ComplaintsPage() {
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<number | null>(null);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
    const [statusToUpdate, setStatusToUpdate] = useState<string>('');

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    // Pagination State
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const fetchComplaints = async () => {
        if (token) {
            try {
                const data = await getAllComplaints(token);
                setComplaints(data);
            } catch (error) {
                console.error("Failed to fetch complaints", error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [token]);

    // Delete Logic
    const handleDeleteClick = (id: number) => {
        setCaseToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (caseToDelete && token) {
            try {
                await deleteComplaint(caseToDelete, token);
                setSnackbar({ open: true, message: "Complaint deleted successfully!", severity: 'info' });
                await fetchComplaints();
                setDeleteDialogOpen(false);
                setCaseToDelete(null);
            } catch (error) {
                console.error("Delete failed", error);
                setSnackbar({ open: true, message: "Failed to delete complaint", severity: 'error' });
            }
        }
    };

    // Status Update Logic
    const handleStatusClick = (caseItem: Complaint) => {
        setSelectedCase(caseItem);
        setStatusToUpdate(caseItem.status);
        setStatusDialogOpen(true);
    };

    const confirmStatusUpdate = async () => {
        if (selectedCase && statusToUpdate && token) {
            try {
                await updateComplaintStatus(selectedCase.id, statusToUpdate, token);
                setSnackbar({ open: true, message: "Status updated successfully!", severity: 'success' });
                await fetchComplaints();
                setStatusDialogOpen(false);
                setStatusToUpdate('');
                setSelectedCase(null);
            } catch (error) {
                console.error("Status update failed", error);
                setSnackbar({ open: true, message: "Failed to update status", severity: 'error' });
            }
        }
    };


    const handleCreateFir = async (id: number) => {
        if (token) {
            try {
                await updateComplaintFir(id, 1, token);
                await updateComplaintStatus(id, 'PENDING', token);
                setSnackbar({ open: true, message: "FIR created successfully!", severity: 'success' });
                await fetchComplaints();
            } catch (error) {
                console.error("Failed to create FIR", error);
                setSnackbar({ open: true, message: "Failed to create FIR", severity: 'error' });
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {

            case 'PENDING': return 'warning';
            case 'IN_INVESTIGATION': return 'info';
            case 'RESOLVED': return 'success';
            case 'CLOSED': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <WarningIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Complaints
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {complaints.filter(c => c.fir !== 1).length === 0 ? (
                            <Grid size={{ xs: 12 }}>
                                <Box p={3} textAlign="center">
                                    <Typography color="text.secondary">No complaints found.</Typography>
                                </Box>
                            </Grid>
                        ) : (
                            complaints
                                .filter(c => c.fir !== 1)
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((complaint) => (
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={complaint.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        #{complaint.id}
                                                    </Typography>
                                                    <Chip
                                                        label="PENDING"
                                                        color="warning"
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                                    {complaint.title}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    Category: {complaint.category}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Location: {complaint.location}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Incident Date: {new Date(complaint.incidentDate).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Submitted By: {complaint.citizenName || "Unknown"}
                                                </Typography>

                                                <Box mt={2} pt={1} borderTop={1} borderColor="divider">
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Created: {new Date(complaint.createdAt).toLocaleString()}
                                                    </Typography>
                                                    {complaint.updatedAt && (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Updated: {new Date(complaint.updatedAt).toLocaleString()}
                                                            {complaint.updatedByName && ` by ${complaint.updatedByName}`}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                            <Box p={2} pt={0} display="flex" justifyContent="flex-end" gap={1}>
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    variant="contained"
                                                    onClick={() => handleCreateFir(complaint.id)}
                                                >
                                                    Create FIR
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    onClick={() => handleDeleteClick(complaint.id)}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    onClick={() => handleStatusClick(complaint)}
                                                >
                                                    Status
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))
                        )}
                    </Grid>
                    {complaints.filter(c => c.fir !== 1).length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[10]}
                            component="div"
                            count={complaints.filter(c => c.fir !== 1).length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            sx={{ mt: 2 }}
                        />
                    )}
                </>
            )}

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Update Status</DialogTitle>
                <DialogContent>
                    <Box pt={1}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusToUpdate}
                                label="Status"
                                onChange={(e) => setStatusToUpdate(e.target.value)}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="IN_INVESTIGATION">In Investigation</MenuItem>
                                <MenuItem value="RESOLVED">Resolved</MenuItem>
                                <MenuItem value="CLOSED">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmStatusUpdate} variant="contained" color="primary">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Complaint?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this complaint? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
