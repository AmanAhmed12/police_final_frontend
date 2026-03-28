"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
    Snackbar,
    Alert,
    Chip,
    InputAdornment,
    CircularProgress,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';

// Importing the cleaned-up services
import {
    getEmergencyContacts,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    EmergencyContact
} from "@/app/services/emergencyService";

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export default function EmergencyContactsPage() {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog States
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentContact, setCurrentContact] = useState<EmergencyContact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);

    // Auth - Get token from Redux
    const token = useSelector((state: RootState) => state.auth.user?.token);

    // Form State
    const [formData, setFormData] = useState<Omit<EmergencyContact, 'id'>>({
        name: '',
        number: '',
        type: 'Police',
        description: '',
        priority: 1
    });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Loading & Snackbar States
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
    const fetchContacts = useCallback(async () => {
        // 1. Proactive Guard: If Redux says token is gone, clear local state and STOP.
        if (!token) {
            setContacts([]);
            setFilteredContacts([]);
            return;
        }

        setFetching(true);
        try {
            const data = await getEmergencyContacts(token);
            // 2. Only update if we still have a token (prevents state updates on unmounted component)
            if (token) {
                setContacts(data);
            }
        } catch (error: any) {
            // 3. Selective Reporting: Ignore auth-related noise during logout transitions
            const silentErrors = ["AUTH_REQUIRED", "SESSION_EXPIRED"];
            if (!silentErrors.includes(error.message)) {
                setSnackbar({
                    open: true,
                    message: "Failed to load contacts",
                    severity: "error"
                });
            }
        } finally {
            setFetching(false);
        }
    }, [token]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // 2. Search Logic (Local filtering)
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = contacts.filter(contact =>
            contact.name.toLowerCase().includes(lowerTerm) ||
            contact.number.includes(lowerTerm) ||
            contact.type.toLowerCase().includes(lowerTerm)
        );
        setFilteredContacts(filtered);
        setPage(0); // Reset to first page on search
    }, [searchTerm, contacts]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedContacts = filteredContacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // 3. UI Helpers
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Police': return <SecurityIcon color="primary" />;
            case 'Medical': return <MedicalServicesIcon color="error" />;
            case 'Fire': return <LocalFireDepartmentIcon color="warning" />;
            default: return <LocalPhoneIcon color="action" />;
        }
    };

    const showMessage = (msg: string, sev: "success" | "error" = "success") => {
        setSnackbar({ open: true, message: msg, severity: sev });
    };

    // 4. Action Handlers
    const handleOpenDialog = (contact?: EmergencyContact) => {
        if (contact) {
            setCurrentContact(contact);
            setFormData({
                name: contact.name,
                number: contact.number,
                type: contact.type,
                description: contact.description || '',
                priority: contact.priority || 1
            });
        } else {
            setCurrentContact(null);
            setFormData({ name: '', number: '', type: 'Police', description: '', priority: 1 });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!token) return showMessage("Session expired. Please login.", "error");
        setLoading(true);
        try {
            if (currentContact) {
                await updateEmergencyContact(currentContact.id, formData, token);
                showMessage("Contact updated successfully");
            } else {
                await createEmergencyContact(formData, token);
                showMessage("Contact added successfully");
            }
            await fetchContacts();
            setOpenDialog(false);
        } catch (error: any) {
            showMessage(error.message || "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (contactToDelete === null || !token) return;
        setLoading(true);
        try {
            await deleteEmergencyContact(contactToDelete, token);
            showMessage("Contact deleted successfully");
            await fetchContacts();
            setOpenDeleteDialog(false);
        } catch (error: any) {
            showMessage("Failed to delete contact", "error");
        } finally {
            setLoading(false);
            setContactToDelete(null);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Emergency Contacts
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage important numbers for citizens and officers.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ px: 3, py: 1, borderRadius: 2, textTransform: 'none' }}
                >
                    Add Contact
                </Button>
            </Box>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }} elevation={0}>
                <InputAdornment position="start" sx={{ mr: 1 }}>
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
                <TextField
                    variant="standard"
                    placeholder="Search contacts by name, number or type..."
                    fullWidth
                    InputProps={{ disableUnderline: true, sx: { color: 'text.primary' } }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }} elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Service Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Number</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetching ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} sx={{ mr: 2 }} />
                                        <Typography variant="body2" component="span">Loading contacts...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No contacts found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedContacts.map((contact) => (
                                    <TableRow key={contact.id} hover>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getTypeIcon(contact.type)}
                                                <Chip label={contact.type} size="small" variant="outlined" sx={{ color: 'primary.main', borderColor: 'rgba(40,102,242,0.3)' }} />
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Typography fontWeight="500" color="text.primary">{contact.name}</Typography></TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Typography fontWeight="bold" color="primary.main">{contact.number}</Typography></TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'text.secondary' }}>{contact.description || "-"}</TableCell>
                                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <IconButton color="primary" onClick={() => handleOpenDialog(contact)} size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton sx={{ color: 'error.main' }} onClick={() => { setContactToDelete(contact.id); setOpenDeleteDialog(true); }} size="small">
                                                <DeleteIcon fontSize="small" />
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
                    count={filteredContacts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Dialogs and Snackbars remain mostly the same but use the updated handlers */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>{currentContact ? 'Edit Contact' : 'New Contact'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Service Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <TextField label="Emergency Number" fullWidth value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required />
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select value={formData.type} label="Type" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <MenuItem value="Police">Police</MenuItem>
                                <MenuItem value="Medical">Medical / Ambulance</MenuItem>
                                <MenuItem value="Fire">Fire Department</MenuItem>
                                <MenuItem value="Hotline">Hotline</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Description" fullWidth multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading || !formData.name || !formData.number}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Save Contact"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete this contact?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}