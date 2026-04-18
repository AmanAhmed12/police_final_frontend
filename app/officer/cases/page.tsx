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
    Chip,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    IconButton,
    TablePagination,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getMyAssignedComplaints, updateComplaintStatus, Complaint } from '@/app/services/complaintService';
import { suspectService, Suspect } from '@/app/services/suspectService';
import dynamic from 'next/dynamic';

const LocationDisplay = dynamic(() => import('@/components/LocationDisplay'), {
    ssr: false,
    loading: () => <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Forensic Map...</Box>
});

export default function OfficerCasesPage() {
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const user = useSelector((state: RootState) => state.auth.user);
    const [cases, setCases] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    // Status update state (for the dialog)
    const [newStatus, setNewStatus] = useState('');
    const [remarks, setRemarks] = useState('');

    // Pagination State
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const fetchCases = async () => {
        try {
            const data = await getMyAssignedComplaints(token);
            setCases(data);
        } catch (error) {
            console.error("Failed to fetch cases", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCases();
        }
    }, [token]);

    const [suspectDetails, setSuspectDetails] = useState<Suspect[]>([]);

    const handleOpenDialog = async (caseItem: Complaint) => {
        setSelectedCase(caseItem);
        setNewStatus(caseItem.status);
        setRemarks(caseItem.remarks || '');
        setSuspectDetails([]);
        if (caseItem.suspectIds && caseItem.suspectIds.length > 0) {
            try {
                const suspects = await Promise.all(
                    caseItem.suspectIds.map(id => suspectService.getSuspectById(id, token))
                );
                setSuspectDetails(suspects);
            } catch (error) {
                console.error("Failed to fetch suspect details", error);
            }
        }
    };

    const handleCloseDialog = () => {
        setSelectedCase(null);
    };

    const generatePDFDoc = async () => {
        if (!selectedCase) return null;

        const doc = new jsPDF();

        // Header
        try {
            const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.src = "/policelogo.jpeg";
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
            });
            doc.addImage(logoImg, 'JPEG', 14, 12, 25, 25);
        } catch (error) {
            console.error("Failed to load logo", error);
        }

        doc.setFontSize(22);
        doc.setTextColor(20, 30, 60);
        doc.setFont("helvetica", "bold");
        doc.text("POLICE DEPARTMENT", 46, 24);

        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.text("Online Assistance Management System", 46, 32);

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 45, 196, 45);

        // Report Title
        doc.setFontSize(18);
        doc.setTextColor(20, 30, 60);
        doc.setFont("helvetica", "bold");
        doc.text("COMPLAINT REPORT", 14, 58);

        // Meta Info
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);

        const dateStr = new Date().toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });
        doc.text(`Generated on: ${dateStr}`, 14, 66);

        const userName = user?.fullName || user?.username || "System Administrator";
        doc.text(`Generated by: ${userName}`, 14, 72);

        // Reset text formats
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        autoTable(doc, {
            startY: 84,
            head: [['Attribute', 'Information']],
            body: [
                ['Title', selectedCase.title || 'N/A'],
                ['Category', selectedCase.category || 'N/A'],
                ['Location', selectedCase.location || 'N/A'],
                ['Incident Date', selectedCase.incidentDate ? new Date(selectedCase.incidentDate).toLocaleString() : 'N/A'],
                ['Status', selectedCase.status || 'N/A'],
                ['Description', selectedCase.description || 'N/A'],
                ['Submitted By', selectedCase.citizenName || 'N/A'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 11, cellPadding: 4 }
        });

        // Suspect Details
        if (suspectDetails.length > 0) {
            let finalY: number = (doc as any).lastAutoTable?.finalY || 50;

            doc.setFontSize(14);
            doc.text("Linked Suspect Profiles", 14, finalY + 15);

            const suspectBody = suspectDetails.map(suspect => [
                suspect.name || 'Unknown',
                suspect.gender || 'N/A',
                suspect.age ? `${suspect.age}` : 'N/A',
                suspect.lastSeenLocation || 'N/A',
                suspect.description || 'N/A',
                suspect.signs?.join(", ") || 'N/A'
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Name/Alias', 'Gender', 'Age', 'Last Seen', 'Observation', 'Identifying Marks']],
                body: suspectBody,
                theme: 'grid',
                headStyles: { fillColor: [192, 57, 43] },
                styles: { fontSize: 10, cellPadding: 3 },
                columnStyles: {
                    0: { cellWidth: 32 }, // Name/Alias
                    1: { cellWidth: 22 }, // Gender
                    2: { cellWidth: 16 }, // Age
                    3: { cellWidth: 30 }, // Last Seen
                    4: { cellWidth: 'auto' }, // Observation
                    5: { cellWidth: 35 }  // Identifying Marks
                }
            });
        }

        // Add page numbers
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        }

        return doc;
    };

    const handleDownloadPDF = async () => {
        const doc = await generatePDFDoc();
        if (doc) doc.save(`Complaint_Report_${selectedCase?.id}.pdf`);
    };

    const handleViewPDF = async () => {
        const doc = await generatePDFDoc();
        if (doc) {
            const pdfBlobUrl = doc.output('bloburl');
            window.open(pdfBlobUrl, '_blank');
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedCase || !newStatus) return;

        if (newStatus === 'RESOLVED' && !remarks.trim()) {
            setSnackbar({ open: true, message: "Please provide resolution remarks", severity: 'warning' });
            return;
        }

        setStatusUpdateLoading(true);
        try {
            await updateComplaintStatus(selectedCase.id, newStatus, token, remarks);
            setSnackbar({ open: true, message: "Status updated successfully!", severity: 'success' });
            // Refresh list and close dialog or update local state
            await fetchCases();
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: "Failed to update status", severity: 'error' });
        } finally {
            setStatusUpdateLoading(false);
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

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                My Assigned Cases
            </Typography>

            <Paper sx={{ mt: 3 }}>
                {cases.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">No assigned cases found.</Typography>
                    </Box>
                ) : (
                    <>
                        <List>
                            {cases
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((caseItem, index) => (
                                    <React.Fragment key={caseItem.id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            secondaryAction={
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenDialog(caseItem)}
                                                >
                                                    View
                                                </Button>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    <AssignmentIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {caseItem.title}
                                                        </Typography>
                                                        <Chip
                                                            label={caseItem.status}
                                                            size="small"
                                                            color={getStatusColor(caseItem.status)}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography variant="body2" component="span" color="text.secondary" display="block">
                                                            Category: {caseItem.category}
                                                        </Typography>
                                                        <Typography variant="body2" component="span" color="text.secondary">
                                                            Date: {new Date(caseItem.incidentDate).toLocaleDateString()}
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        {index < (cases.slice(page * rowsPerPage, (page + 1) * rowsPerPage).length - 1) && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                        </List>
                        <TablePagination
                            rowsPerPageOptions={[10]}
                            component="div"
                            count={cases.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                        />
                    </>
                )}
            </Paper>

            {/* Case Details Dialog */}
            <Dialog open={!!selectedCase} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                {selectedCase && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                Complaint Details #{selectedCase.id}
                                <IconButton onClick={handleCloseDialog}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                                    <Typography variant="body1" gutterBottom>{selectedCase.title}</Typography>

                                    <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                    <Typography variant="body1" gutterBottom>{selectedCase.category}</Typography>

                                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                    <Typography variant="body1" gutterBottom>{selectedCase.location}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Incident Date</Typography>
                                    <Typography variant="body1" gutterBottom>{new Date(selectedCase.incidentDate).toLocaleString()}</Typography>

                                    <Typography variant="subtitle2" color="text.secondary">Submitted By</Typography>
                                    <Typography variant="body1" gutterBottom>{selectedCase.citizenName || "Unknown"}</Typography>

                                    <Typography variant="subtitle2" color="text.secondary">Submitted At</Typography>
                                    <Typography variant="body1" gutterBottom>{new Date(selectedCase.createdAt).toLocaleString()}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                                        <Typography variant="body2">{selectedCase.description}</Typography>
                                    </Paper>

                                    {selectedCase.latitude && selectedCase.longitude && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Precise Incident Geolocation
                                            </Typography>
                                            <LocationDisplay
                                                lat={selectedCase.latitude}
                                                lng={selectedCase.longitude}
                                                address={selectedCase.location}
                                                height={200}
                                            />
                                        </Box>
                                    )}
                                </Grid>

                                {selectedCase.evidenceFiles && selectedCase.evidenceFiles.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Evidence Files</Typography>
                                        <Box display="flex" gap={2} flexWrap="wrap">
                                            {selectedCase.evidenceFiles.map((url, idx) => (
                                                <Box key={idx} component="img" src={url} alt={`Evidence ${idx + 1}`}
                                                    sx={{
                                                        width: 150,
                                                        height: 150,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                        border: '1px solid #ddd',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.open(url, '_blank')}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                )}

                                {suspectDetails.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Divider sx={{ my: 2 }} />
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography variant="h6" color="primary">Linked Suspect Details</Typography>
                                            <Box display="flex" gap={2}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<PictureAsPdfIcon />}
                                                    onClick={handleViewPDF}
                                                >
                                                    View PDF
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={handleDownloadPDF}
                                                >
                                                    Download PDF
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {suspectDetails.length} suspect profile(s) have been linked to this case. Please view or download the comprehensive PDF report for detailed information.
                                        </Typography>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 2 }} />
                                    <Grid container spacing={2} alignItems="flex-start">
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Typography variant="h6">Update Status</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 8 }}>
                                            <Box display="flex" gap={2} mb={newStatus === 'RESOLVED' ? 2 : 0}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={newStatus}
                                                        label="Status"
                                                        onChange={(e) => setNewStatus(e.target.value)}
                                                    >
                                                        <MenuItem value="ASSIGNED">Assigned</MenuItem>
                                                        <MenuItem value="IN_INVESTIGATION">In Investigation</MenuItem>
                                                        <MenuItem value="RESOLVED">Resolved</MenuItem>
                                                        <MenuItem value="CLOSED">Closed</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleUpdateStatus}
                                                    disabled={statusUpdateLoading}
                                                    sx={{ minWidth: 100 }}
                                                >
                                                    {statusUpdateLoading ? <CircularProgress size={24} /> : "Update"}
                                                </Button>
                                            </Box>

                                            {newStatus === 'RESOLVED' && (
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Resolution Remarks"
                                                    placeholder="Enter details about how the case was resolved..."
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    required
                                                    error={!remarks.trim()}
                                                    helperText={!remarks.trim() ? "Remarks are required for RESOLVED status" : ""}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </>
                )}
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
