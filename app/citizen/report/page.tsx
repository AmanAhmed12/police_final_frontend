"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
    Box, Typography, Paper, Container, Button, Chip, Divider,
    IconButton, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Tooltip, InputAdornment, Avatar, Fade, Zoom, CircularProgress,
    TablePagination, Snackbar, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Description as ReportIcon,
    LocationOn as LocationIcon,
    Info as InfoIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    AssignmentTurnedIn as CompletedIcon,
    History as PendingIcon,
    DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import {
    getReportRequests,
    createReportRequest,
    deleteReportRequest,
    ReportRequest
} from '@/app/services/reportService';

export default function ReportDashboard() {
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const [reports, setReports] = useState<ReportRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    const showMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        const fetchReports = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // Using the real professional API call with Redux token
                const data = await getReportRequests(token);
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [token]);

    const [openForm, setOpenForm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        nic: '',
        homeAddress: '',
        fatherName: '',
        motherName: '',
        siblings: 0,
        purpose: ''
    });

    const handleOpenForm = (reportToEdit: any = null) => {
        if (reportToEdit) {
            setSelectedId(reportToEdit.id);
            setFormData({
                fullName: reportToEdit.fullName,
                nic: reportToEdit.nic,
                homeAddress: reportToEdit.homeAddress,
                fatherName: reportToEdit.fatherName,
                motherName: reportToEdit.motherName,
                siblings: reportToEdit.siblings,
                purpose: reportToEdit.purpose
            });
        } else {
            setSelectedId(null);
            setFormData({
                fullName: '',
                nic: '',
                homeAddress: '',
                fatherName: '',
                motherName: '',
                siblings: 0,
                purpose: ''
            });
        }
        setOpenForm(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (selectedId) {
                // Update logic (Backend DTO specific implementation pending)
                setReports(reports.map(r => r.id === selectedId ? { ...r, ...formData } : r));
                showMessage("Application updated successfully!");
            } else {
                // Professional application submission with Redux token
                const newReport = await createReportRequest(formData, token);
                setReports([newReport, ...reports]);
                showMessage("Official application submitted successfully!");
            }
            setOpenForm(false);
        } catch (error) {
            console.error("Failed to save report:", error);
            showMessage("Application failed. Please check your connection.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (pdfUrl?: string) => {
        if (!pdfUrl) {
            showMessage("The official document is still being digitally signed. Please check back in a few minutes.", "info");
            return;
        }
        window.open(pdfUrl, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this application?")) return;
        try {
            // Calling real backend to delete/cancel the request with Redux token
            await deleteReportRequest(id, token);
            setReports(reports.filter(r => r.id !== id));
            showMessage("Application cancelled successfully!");
        } catch (error) {
            console.error("Failed to delete report:", error);
            showMessage("Failed to cancel request.", "error");
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Processed':
                return <Chip icon={<CompletedIcon />} label={status} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }} />;
            case 'Pending':
                return <Chip icon={<PendingIcon />} label={status} size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.2)' }} />;
            case 'In Progress':
                return <Chip icon={<PendingIcon />} label={status} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const filteredReports = reports.filter(r =>
        r.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedReports = filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ minHeight: '100vh', pb: 10 }}>
            {/* HERO SECTION */}
            <Box sx={{
                bgcolor: '#1f2433',
                color: 'white',
                pt: 6, pb: 8,
                mb: 4,
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={4}>
                        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.02em', color: '#f5f7ff' }}>
                                Police Clearance & Reports
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#a0a4b7', fontWeight: 400, mb: 3 }}>
                                Apply for character certificates, police clearance, and official background verification reports.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenForm()}
                                    sx={{
                                        bgcolor: '#2866f2',
                                        px: 4, py: 1.5,
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#1741a6' }
                                    }}
                                >
                                    New Certificate Request
                                </Button>
                                <Chip
                                    icon={<InfoIcon style={{ color: '#6699ff' }} />}
                                    label="Official Travel Documents"
                                    sx={{
                                        bgcolor: 'rgba(102, 153, 255, 0.1)',
                                        color: '#6699ff',
                                        fontWeight: 600,
                                        border: '1px solid rgba(102, 153, 255, 0.2)',
                                        height: 48,
                                        px: 1,
                                        borderRadius: '12px'
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Paper sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            width: { xs: '100%', md: 400 },
                            bgcolor: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: 'none'
                        }}>
                            <TextField
                                fullWidth
                                variant="standard"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    disableUnderline: true,
                                    startAdornment: <SearchIcon sx={{ color: '#a0a4b7', mr: 1 }} />,
                                    sx: { px: 2, color: '#f5f7ff' }
                                }}
                            />
                        </Paper>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Fade in timeout={800}>
                    <Paper sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)',
                        bgcolor: '#1f2433'
                    }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#1a1f2e', fontWeight: 700, color: '#f5f7ff', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2.5 }}>Request Purpose</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a1f2e', fontWeight: 700, color: '#f5f7ff', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2.5 }}>NIC Number</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a1f2e', fontWeight: 700, color: '#f5f7ff', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2.5 }}>Applicant</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a1f2e', fontWeight: 700, color: '#f5f7ff', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2.5 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ bgcolor: '#1a1f2e', fontWeight: 700, color: '#f5f7ff', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2.5 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedReports.length > 0 ? paginatedReports.map((row) => (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'rgba(40, 102, 242, 0.1)', color: '#2866f2', borderRadius: '12px', width: 44, height: 44 }}>
                                                        <ReportIcon fontSize="small" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700" color="#f5f7ff" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {row.purpose}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#a0a4b7' }}>{row.id} • {new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Typography variant="body2" sx={{ color: '#6699ff', fontWeight: 600, fontFamily: 'monospace' }}>{row.nic}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Typography variant="body2" sx={{ color: '#f5f7ff' }}>{row.fullName}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                {getStatusChip(row.status)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    {row.status === 'Processed' && row.pdfUrl && (
                                                        <Tooltip title="Download Official Report">
                                                            <IconButton
                                                                onClick={() => handleDownload(row.pdfUrl)}
                                                                size="small"
                                                                sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' } }}
                                                            >
                                                                <DownloadIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <IconButton
                                                        onClick={() => handleOpenForm(row)}
                                                        size="small"
                                                        sx={{ color: '#a0a4b7', bgcolor: 'rgba(255,255,255,0.03)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#f5f7ff' } }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDelete(row.id)}
                                                        size="small"
                                                        sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                                                <Box sx={{ opacity: 0.1, mb: 2 }}>
                                                    <ReportIcon sx={{ fontSize: 64, color: '#f5f7ff' }} />
                                                </Box>
                                                <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="700">No reports found</Typography>
                                                <Typography variant="body2" color="text.secondary">Try adjusting your search or create a new request.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredReports.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                color: '#f5f7ff',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                '.MuiTablePagination-selectIcon': { color: '#f5f7ff' }
                            }}
                        />
                    </Paper>
                </Fade>
            </Container>

            {/* COMPREHENSIVE REGISTRY FORM */}
            <Dialog
                open={openForm}
                onClose={() => setOpenForm(false)}
                fullWidth
                maxWidth="md"
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                        bgcolor: '#1f2433',
                        backgroundImage: 'none',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="span" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#f5f7ff' }}>
                        {selectedId ? "Request Details" : "Official Report Application"}
                    </Typography>
                    <IconButton onClick={() => setOpenForm(false)} size="small" sx={{ color: '#a0a4b7' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ color: '#2866f2', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid size={8}>
                                <TextField
                                    label="Full Name"
                                    fullWidth
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                            <Grid size={4}>
                                <TextField
                                    label="NIC Number"
                                    fullWidth
                                    value={formData.nic}
                                    onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    label="Permanent Home Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.homeAddress}
                                    onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ color: '#2866f2', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
                            Family Background
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid size={5}>
                                <TextField
                                    label="Father's Full Name"
                                    fullWidth
                                    value={formData.fatherName}
                                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                            <Grid size={5}>
                                <TextField
                                    label="Mother's Full Name"
                                    fullWidth
                                    value={formData.motherName}
                                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                            <Grid size={2}>
                                <TextField
                                    label="Siblings"
                                    type="number"
                                    fullWidth
                                    value={formData.siblings}
                                    onChange={(e) => setFormData({ ...formData, siblings: parseInt(e.target.value) || 0 })}
                                    InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#2866f2', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
                            Request details
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <TextField
                            label="Purpose of Requesting Report"
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Please specify why you need this certificate (e.g. Job Application at Bank X, Visa for Country Y, etc.)"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            InputProps={{ sx: { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.2)' } }}
                        />
                    </Box>

                    <Box sx={{
                        mt: 4, p: 2, bgcolor: 'rgba(40, 102, 242, 0.05)', borderRadius: '16px',
                        border: '1px dashed rgba(40, 102, 242, 0.2)', display: 'flex',
                        alignItems: 'center', gap: 2
                    }}>
                        <Avatar sx={{ bgcolor: 'rgba(40, 102, 242, 0.1)', color: '#2866f2' }}>
                            <ReportIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#a0a4b7' }}>
                            <b style={{ color: '#f5f7ff' }}>Notice:</b> All information provided will be cross-checked with the national database. Incomplete or false information will result in immediate rejection.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={() => setOpenForm(false)}
                        sx={{
                            borderRadius: '12px', px: 3,
                            fontWeight: 600, color: '#a0a4b7',
                            textTransform: 'none'
                        }}
                    >
                        Discard
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.fullName || !formData.nic || !formData.purpose || loading}
                        sx={{
                            borderRadius: '12px', px: 4,
                            fontWeight: 800, bgcolor: '#2866f2',
                            textTransform: 'none',
                            minWidth: 160,
                            boxShadow: '0 10px 15px -3px rgba(40, 102, 242, 0.3)',
                            '&:hover': { bgcolor: '#1741a6' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (selectedId ? "Update Information" : "Submit Request")}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
