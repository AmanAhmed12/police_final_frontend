"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TablePagination,
    Container,
    Button
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getMyComplaints, Complaint } from '@/app/services/complaintService';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LocationDisplay = dynamic(() => import('@/components/LocationDisplay'), {
    ssr: false,
    loading: () => <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Forensic Map...</Box>
});

export default function MyComplaintsPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const router = useRouter();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

   
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                try {
                    const data = await getMyComplaints(token);
                    setComplaints(data);
                } catch (error) {
                    console.error("Failed to fetch my complaints", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

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
        <Container maxWidth="lg">
            <Box py={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <ArticleIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="h4" fontWeight="bold">
                            My Complaints
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        href="/citizen/complaint/new"
                    >
                        File New Complaint
                    </Button>
                </Box>

                <Paper sx={{ p: 0, overflow: 'hidden' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : complaints.length === 0 ? (
                        <Box p={4} textAlign="center">
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No complaints found.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                You haven't submitted any complaints yet.
                            </Typography>
                            <Button variant="outlined" startIcon={<AddIcon />} href="/citizen/complaint/new">
                                Submit your first complaint
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <List>
                                {complaints
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            <ListItem alignItems="flex-start" sx={{ p: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ cursor: 'pointer' }} onClick={() => setSelectedComplaint(item)}>
                                                                    {item.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                                                    Reference ID: #{item.id}
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={item.status}
                                                                color={getStatusColor(item.status)}
                                                                size="small"
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        </Box>
                                                    }
                                                    secondaryTypographyProps={{ component: 'div' }}
                                                    secondary={
                                                        <Box mt={1}>
                                                            <Typography variant="body1" color="text.primary" gutterBottom sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                cursor: 'pointer'
                                                            }} onClick={() => setSelectedComplaint(item)}>
                                                                {item.description}
                                                            </Typography>

                                                            <Box display="flex" gap={3} mt={1} flexWrap="wrap">
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <strong>Category:</strong> {item.category}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <strong>Location:</strong> {item.location}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <strong>Incident Date:</strong> {new Date(item.incidentDate).toLocaleDateString()}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>

                                                            {item.assignedOfficerName && (
                                                                <Box mt={1} p={1} bgcolor="background.default" borderRadius={1} display="inline-block">
                                                                    <Typography variant="caption" fontWeight="bold">
                                                                        Assigned Officer: {item.assignedOfficerName}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < (complaints.slice(page * rowsPerPage, (page + 1) * rowsPerPage).length - 1) && <Divider component="li" />}
                                        </React.Fragment>
                                    ))}
                            </List>
                            <TablePagination
                                rowsPerPageOptions={[10]}
                                component="div"
                                count={complaints.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {/* Complaint Detail Modal */}
            <Dialog
                open={Boolean(selectedComplaint)}
                onClose={() => setSelectedComplaint(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedComplaint && (
                    <>
                        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5" fontWeight="bold">Complaint Details</Typography>
                                <Chip
                                    label={selectedComplaint.status}
                                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 3 }}>
                            <Box mb={4}>
                                <Typography variant="overline" color="text.secondary">Title</Typography>
                                <Typography variant="h6" gutterBottom>{selectedComplaint.title}</Typography>
                                <Typography variant="caption" color="text.secondary">Reference ID: #{selectedComplaint.id}</Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Box mb={4}>
                                <Typography variant="overline" color="text.secondary">Description</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {selectedComplaint.description}
                                </Typography>
                            </Box>

                            {selectedComplaint.latitude && selectedComplaint.longitude && (
                                <Box mb={4}>
                                    <Typography variant="overline" color="text.secondary">Incident Geolocation</Typography>
                                    <LocationDisplay
                                        lat={selectedComplaint.latitude}
                                        lng={selectedComplaint.longitude}
                                        address={selectedComplaint.location}
                                        height={250}
                                    />
                                </Box>
                            )}

                            <Grid container spacing={3} sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">{selectedComplaint.category}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Location</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">{selectedComplaint.location}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Incident Date</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">{new Date(selectedComplaint.incidentDate).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Submitted On</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</Typography>
                                </Grid>
                            </Grid>

                            {selectedComplaint.assignedOfficerName && (
                                <Box mt={3} p={2} sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                                    <Typography variant="caption" color="primary.main" fontWeight="bold">Official Assignment</Typography>
                                    <Typography variant="body1">Assigned to Officer: <strong>{selectedComplaint.assignedOfficerName}</strong></Typography>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={() => setSelectedComplaint(null)} variant="outlined">Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
}
