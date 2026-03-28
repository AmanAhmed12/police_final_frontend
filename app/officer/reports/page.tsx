"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
    Box, Typography, Paper, Container, Button, Chip, Divider,
    IconButton, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Tooltip, Avatar, Fade, CircularProgress,
    InputAdornment, TablePagination, Snackbar, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Search as SearchIcon,
    Description as ReportIcon,
    CheckCircle as AcceptIcon,
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    FilterList as FilterIcon,
    History as PendingIcon,
    AssignmentTurnedIn as CompletedIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import {
    getAllReportRequests,
    updateReportStatus,
    finalizeReportRequest,
    removePdfFromReport,
    ReportRequest
} from '@/app/services/reportService';

export default function OfficerReportsManagement() {
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const [reports, setReports] = useState<ReportRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Dialog state
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportRequest | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                // Fetching real reports using the actual Redux token
                const data = await getAllReportRequests(token);
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [token]);

    const handleAccept = async (id: string) => {
        if (!token) return;
        setActionLoading(id);
        try {
            // Calling the real backend with the Redux token
            const updated = await updateReportStatus(id, "In Progress", token);
            setReports(prev => prev.map(r => r.id === id ? updated : r));
            showMessage("Application accepted successfully!");
        } catch (error) {
            console.error("Failed to accept report:", error);
            showMessage("Failed to update report status.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleOpenUpload = (report: ReportRequest) => {
        setSelectedReport(report);
        setSelectedFile(null);
        setOpenUploadDialog(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFinalize = async () => {
        if (!selectedReport || !selectedFile || !token) {
            showMessage("Please select a signed PDF document before finalizing.", "warning");
            return;
        }
        setLoading(true);
        try {
            // Calling the consolidated professional service with the Redux token
            const updatedReport = await finalizeReportRequest(selectedReport.id, selectedFile, token);

            setReports(prev => prev.map(r =>
                r.id === selectedReport.id ? updatedReport : r
            ));

            setOpenUploadDialog(false);
            showMessage("Report finalized successfully! The certificate is now available to the citizen.");
        } catch (error) {
            console.error("Upload failed:", error);
            showMessage("Failed to upload certificate. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePdf = async (reportId: string) => {
        if (!token) return;

        setActionLoading(reportId);
        try {
            const updatedReport = await removePdfFromReport(reportId, token);
            setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
            setOpenViewDialog(false);
            setOpenDeleteConfirmDialog(false);
            showMessage("PDF removed successfully. You can now upload a new certificate.");
        } catch (error) {
            console.error("Failed to remove PDF:", error);
            showMessage("Failed to remove PDF. Please try again.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusChip = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PROCESSED':
                return <Chip icon={<CompletedIcon />} label="Processed" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }} />;
            case 'PENDING':
                return <Chip icon={<PendingIcon />} label="Pending" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.2)' }} />;
            case 'IN PROGRESS':
            case 'IN_PROGRESS':
                return <Chip icon={<PendingIcon />} label="In Progress" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const filteredReports = reports.filter(r =>
        r.purpose?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nic?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fullName?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
        <Box sx={{ pb: 8 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom color="text.primary">
                    Report Management
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    Review, process, and finalize character certificates and police clearance requests.
                </Typography>

                <Paper sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <TextField
                        fullWidth
                        placeholder="Search by ID, Name, or NIC..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            sx: { borderRadius: '12px' }
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        sx={{ borderRadius: '12px', minWidth: 120, height: 40 }}
                    >
                        Filter
                    </Button>
                </Paper>
            </Box>

            {/* Registry Table */}
            <Fade in timeout={600}>
                <Paper sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    bgcolor: 'background.paper'
                }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Request Details</TableCell>
                                    <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Applicant (NIC)</TableCell>
                                    <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, py: 2.5 }}>Workflow Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                            <CircularProgress size={40} />
                                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Loading requests...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedReports.length > 0 ? paginatedReports.map((row) => (
                                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'rgba(40, 102, 242, 0.1)', color: '#2866f2', borderRadius: '12px' }}>
                                                    <ReportIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="700">
                                                        {row.purpose}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.id} • {new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600">{row.fullName}</Typography>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>{row.nic}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(row.status)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Full Details">
                                                    <IconButton
                                                        onClick={() => { setSelectedReport(row); setOpenViewDialog(true); }}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                {row.status?.toUpperCase() === 'PENDING' && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={actionLoading === row.id ? <CircularProgress size={16} color="inherit" /> : <AcceptIcon sx={{ fontSize: '18px !important' }} />}
                                                        onClick={() => handleAccept(row.id)}
                                                        disabled={!!actionLoading}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#2866f2',
                                                            borderRadius: '8px',
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            minWidth: 100
                                                        }}
                                                    >
                                                        Accept
                                                    </Button>
                                                )}

                                                {(row.status?.toUpperCase() === 'IN PROGRESS' || row.status?.toUpperCase() === 'IN_PROGRESS') && (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<UploadIcon sx={{ fontSize: '18px !important' }} />}
                                                        onClick={() => handleOpenUpload(row)}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '8px',
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            minWidth: 100
                                                        }}
                                                    >
                                                        Finalize
                                                    </Button>
                                                )}

                                                {row.status?.toUpperCase() === 'PROCESSED' && row.pdfUrl && (
                                                    <Tooltip title="View Certificate">
                                                        <IconButton
                                                            onClick={() => window.open(row.pdfUrl, '_blank')}
                                                            size="small"
                                                            sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.05)' }}
                                                        >
                                                            <PdfIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body2" color="text.secondary">No report requests found matching your query.</Typography>
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
                            color: 'text.secondary',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}
                    />
                </Paper>
            </Fade>

            {/* View Details Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#1a1f2e' } }}
            >
                <DialogTitle component="div" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="800">Request Details</Typography>
                        <IconButton onClick={() => setOpenViewDialog(false)} size="small" sx={{ color: 'text.secondary' }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedReport && (
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <Typography variant="caption" color="primary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Basic Information</Typography>
                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                        <Typography variant="body1" fontWeight="600">{selectedReport.fullName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">NIC Number</Typography>
                                        <Typography variant="body1" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedReport.nic}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Permanent Address</Typography>
                                        <Typography variant="body1">{selectedReport.homeAddress}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="caption" color="primary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Family Details</Typography>
                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Stack direction="row" spacing={4}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Father's Name</Typography>
                                        <Typography variant="body2">{selectedReport.fatherName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Mother's Name</Typography>
                                        <Typography variant="body2">{selectedReport.motherName}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="caption" color="primary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Request Purpose</Typography>
                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="body2">{selectedReport.purpose}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {selectedReport && selectedReport.status?.toUpperCase() === 'PENDING' && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => { handleAccept(selectedReport.id); setOpenViewDialog(false); }}
                            startIcon={actionLoading === selectedReport.id ? <CircularProgress size={20} color="inherit" /> : <AcceptIcon />}
                            disabled={!!actionLoading}
                            sx={{ bgcolor: '#2866f2', borderRadius: '12px', py: 1.5, fontWeight: 700 }}
                        >
                            Accept Application
                        </Button>
                    )}
                    {selectedReport && (selectedReport.status?.toUpperCase() === 'IN PROGRESS' || selectedReport.status?.toUpperCase() === 'IN_PROGRESS') && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            onClick={() => { setOpenViewDialog(false); handleOpenUpload(selectedReport); }}
                            startIcon={<UploadIcon />}
                            sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}
                        >
                            Add Certificate PDF
                        </Button>
                    )}
                    {selectedReport && selectedReport.status?.toUpperCase() === 'PROCESSED' && selectedReport.pdfUrl && (
                        <Stack spacing={2} width="100%">
                            <Button
                                fullWidth
                                variant="outlined"
                                color="success"
                                onClick={() => window.open(selectedReport.pdfUrl, '_blank')}
                                startIcon={<PdfIcon />}
                                sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}
                            >
                                View Uploaded PDF
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                onClick={() => setOpenDeleteConfirmDialog(true)}
                                disabled={!!actionLoading}
                                startIcon={<CloseIcon />}
                                sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}
                            >
                                Remove PDF & Re-upload
                            </Button>
                        </Stack>
                    )}
                </DialogActions>
            </Dialog>

            {/* Finalize & Upload Dialog */}
            <Dialog
                open={openUploadDialog}
                onClose={() => !loading && setOpenUploadDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#1a1f2e' } }}
            >
                <DialogTitle component="div" sx={{ textAlign: 'center', pt: 4 }}>
                    <Avatar sx={{
                        width: 64, height: 64,
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        mx: 'auto', mb: 2
                    }}>
                        <UploadIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="800">Finalize Report</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Upload the official signed PDF certificate</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <input
                            hidden
                            accept="application/pdf"
                            id="officer-pdf-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="officer-pdf-upload">
                            <Paper
                                sx={{
                                    p: 4,
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    bgcolor: selectedFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'rgba(40, 102, 242, 0.05)'
                                    }
                                }}
                            >
                                <PdfIcon sx={{ fontSize: 48, color: selectedFile ? '#10b981' : 'text.secondary', mb: 1 }} />
                                <Typography variant="body1" fontWeight="700">
                                    {selectedFile ? selectedFile.name : "Select Official PDF"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Click to browse or drag and drop"}
                                </Typography>
                            </Paper>
                        </label>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
                            This file will be automatically securely uploaded to the Cloudinary storage vault.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={handleFinalize}
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            fontWeight: 800,
                            textTransform: 'none'
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit & Close Request"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteConfirmDialog}
                onClose={() => !actionLoading && setOpenDeleteConfirmDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#1a1f2e' } }}
            >
                <DialogTitle component="div" sx={{ textAlign: 'center', pt: 4 }}>
                    <Avatar sx={{
                        width: 64, height: 64,
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        mx: 'auto', mb: 2
                    }}>
                        <CloseIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="800">Remove PDF Certificate?</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        This action will delete the uploaded certificate and revert the report status to "In Progress".
                    </Typography>
                </DialogTitle>
                <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center' }}>
                    <Button
                        onClick={() => setOpenDeleteConfirmDialog(false)}
                        disabled={!!actionLoading}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            fontWeight: 600,
                            color: 'text.secondary',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => selectedReport && handleRemovePdf(selectedReport.id)}
                        disabled={!!actionLoading}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            fontWeight: 800,
                            textTransform: 'none'
                        }}
                    >
                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Remove PDF"}
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
