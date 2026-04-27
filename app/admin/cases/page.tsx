"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    CircularProgress,
    Chip,
    Tabs,
    Tab,
    Snackbar,
    Alert
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getAllComplaints, assignOfficerToComplaint, deleteComplaint, updateComplaintStatus, Complaint } from '@/app/services/complaintService'; // Updated Import
import { getUsers } from '@/app/services/authService';


interface Officer {
    id: number;
    fullName: string; 
    role: string;
}

export default function CasesPage() {
    const token = useSelector((state: RootState) => state.auth.user?.token);

    const [cases, setCases] = useState<Complaint[]>([]);
    const [officers, setOfficers] = useState<Officer[]>([]); 
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
    const [selectedOfficerId, setSelectedOfficerId] = useState<string>(''); 

    const [tabValue, setTabValue] = useState(0);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<number | null>(null);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<string>('');

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

   
    const fetchData = async () => {
        setLoading(true);
        try {
           
            const complaintsData = await getAllComplaints(token);
            const casesData = complaintsData.filter((c: Complaint) => c.fir === 1);
            setCases(casesData);

           
            const usersData = await getUsers(token);
           
            const officerList = usersData.filter((u: any) => u.role === 'OFFICER' || u.role === 'Officer');
            setOfficers(officerList);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

   
    const handleAssignClick = (caseItem: Complaint) => {
        setSelectedCase(caseItem);
       
        setSelectedOfficerId(caseItem.assignedOfficerId ? caseItem.assignedOfficerId.toString() : '');
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedCase(null);
        setSelectedOfficerId('');
    };

    const handleOfficerChange = (event: SelectChangeEvent) => {
        setSelectedOfficerId(event.target.value as string);
    };

    const handleConfirmAssign = async () => {
        if (selectedCase && selectedOfficerId) {
            try {
                await assignOfficerToComplaint(selectedCase.id, parseInt(selectedOfficerId), token);
              
                await updateComplaintStatus(selectedCase.id, 'ASSIGNED', token);
                setSnackbar({ open: true, message: "Officer assigned successfully!", severity: 'success' });
                await fetchData();
                handleClose();
            } catch (error) {
                setSnackbar({ open: true, message: "Failed to assign officer", severity: 'error' });
            }
        }
    };

  
    const handleDeleteClick = (id: number) => {
        setCaseToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (caseToDelete && token) {
            try {
                await deleteComplaint(caseToDelete, token);
                setSnackbar({ open: true, message: "Case deleted successfully!", severity: 'info' });
                await fetchData();
                setDeleteDialogOpen(false);
                setCaseToDelete(null);
            } catch (error) {
                console.error("Delete failed", error);
                setSnackbar({ open: true, message: "Failed to delete case", severity: 'error' });
            }
        }
    };

   
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
                await fetchData();
                setStatusDialogOpen(false);
                setStatusToUpdate('');
                setSelectedCase(null);
            } catch (error) {
                console.error("Status update failed", error);
                setSnackbar({ open: true, message: "Failed to update status", severity: 'error' });
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'ASSIGNED': return 'secondary';
            case 'IN_INVESTIGATION': return 'info';
            case 'RESOLVED': return 'success';
            case 'CLOSED': return 'default';
            default: return 'default';
        }
    };

  
    const filteredCases = tabValue === 0
        ? cases.filter(c => !c.assignedOfficerId)
        : cases;

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                Case Files
            </Typography>

            <Box mb={2}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                    <Tab label={`Unassigned (${cases.filter(c => !c.assignedOfficerId).length})`} />
                    <Tab label="All Cases" />
                </Tabs>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
                <Paper sx={{ mt: 3 }}>
                    <List>
                        {filteredCases.length === 0 ? (
                            <Box p={3} textAlign="center">
                                <Typography color="text.secondary">
                                    {tabValue === 0 ? "Great job! No unassigned cases." : "No cases found."}
                                </Typography>
                            </Box>
                        ) : (
                            filteredCases.map((caseItem, index) => (
                                <React.Fragment key={caseItem.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(caseItem.id)}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleStatusClick(caseItem)}
                                                >
                                                    Status
                                                </Button>
                                                <Button
                                                    variant={caseItem.assignedOfficerId ? "outlined" : "contained"}
                                                    size="small"
                                                    startIcon={caseItem.assignedOfficerId ? <AssignmentIcon /> : <PersonAddIcon />}
                                                    onClick={() => handleAssignClick(caseItem)}
                                                    color={caseItem.assignedOfficerId ? "inherit" : "primary"}
                                                >
                                                    {caseItem.assignedOfficerId ? "Reassign" : "Assign"}
                                                </Button>
                                            </Box>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: caseItem.assignedOfficerId ? 'success.light' : 'warning.light', color: 'white' }}>
                                                {caseItem.assignedOfficerId ? <CheckCircleIcon /> : <AssignmentIcon />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <Typography fontWeight={600} variant="subtitle1">#{caseItem.id} - {caseItem.title}</Typography>
                                                    <Chip label={caseItem.status} size="small" color={getStatusColor(caseItem.status)} variant="outlined" />
                                                </Box>
                                            }
                                            secondaryTypographyProps={{ component: 'div' }}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.primary" gutterBottom>
                                                        Location: {caseItem.location} | Date: {new Date(caseItem.incidentDate).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {caseItem.assignedOfficerName ? (
                                                            <>Assigned to: <b>{caseItem.assignedOfficerName}</b></>
                                                        ) : (
                                                            <Typography component="span" color="error.main" fontWeight="bold">Unassigned</Typography>
                                                        )}
                                                    </Typography>

                                                    {/* Audit Log Display */}
                                                    <Box mt={1} pl={1} borderLeft={2} borderColor="divider">
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Created: {new Date(caseItem.createdAt).toLocaleString()}
                                                        </Typography>
                                                        {caseItem.updatedAt && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                Last Updated: {new Date(caseItem.updatedAt).toLocaleString()}
                                                                {caseItem.updatedByName && ` by ${caseItem.updatedByName}`}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredCases.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            )}

           
            <Dialog open={openDialog} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>Assign Officer</DialogTitle>
                <DialogContent>
                    <Box pt={1}>
                        <Typography variant="subtitle2" gutterBottom>Case: {selectedCase?.title}</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="officer-select-label">Select Officer</InputLabel>
                            <Select
                                labelId="officer-select-label"
                                value={selectedOfficerId}
                                label="Select Officer"
                                onChange={handleOfficerChange}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {officers.map((officer) => (
                                    <MenuItem key={officer.id} value={officer.id.toString()}>{officer.fullName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmAssign} color="primary" variant="contained">Assign</Button>
                </DialogActions>
            </Dialog>

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
                                <MenuItem value="ASSIGNED">Assigned</MenuItem>
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
