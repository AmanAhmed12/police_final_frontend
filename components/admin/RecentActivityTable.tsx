import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Box,
    Avatar,
    Skeleton
} from '@mui/material';
import { Complaint } from '@/app/services/complaintService';
import { ReportRequest } from '@/app/services/reportService';
import { formatDistanceToNow } from 'date-fns';

// Activity interface for combined feed
interface Activity {
    id: string;
    userName: string;
    userEmail: string;
    action: string;
    status: 'completed' | 'pending' | 'failed' | string;
    date: Date;
    type: 'complaint' | 'report';
}

interface RecentActivityTableProps {
    complaints: Complaint[];
    reports: ReportRequest[];
    loading?: boolean;
}

export default function RecentActivityTable({ complaints, reports, loading }: RecentActivityTableProps) {
    // Combine and sort activities
    const activities: Activity[] = React.useMemo(() => {
        const combined: Activity[] = [
            ...complaints.map(c => ({
                id: `c-${c.id}`,
                userName: c.citizenName || 'Unknown User',
                userEmail: '', // Not always available in DTO
                action: `Submitted complaint: ${c.title}`,
                status: c.status || 'pending',
                date: new Date(c.createdAt),
                type: 'complaint' as const
            })),
            ...reports.map(r => ({
                id: `r-${r.id}`,
                userName: r.fullName || 'Unknown User',
                userEmail: '',
                action: `Applied for report: ${r.purpose}`,
                status: r.status?.toLowerCase() === 'processed' ? 'completed' : 'pending',
                date: new Date(r.createdAt),
                type: 'report' as const
            }))
        ];

        return combined
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);
    }, [complaints, reports]);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase().replace(/_/g, ' ');
        if (s === 'completed' || s === 'solved' || s === 'processed') return { bg: 'rgba(0, 230, 118, 0.1)', color: '#00e676' };
        if (s === 'pending') return { bg: 'rgba(255, 179, 0, 0.1)', color: '#ffb300' };
        if (s === 'in progress' || s === 'in investigation' || s === 'under investigation') return { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' };
        if (s === 'failed' || s === 'rejected') return { bg: 'rgba(255, 23, 68, 0.1)', color: '#ff1744' };
        return { bg: 'rgba(0,0,0,0.05)', color: 'inherit' };
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
                <Table aria-label="recent activity table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>User</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Action</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Box display="flex" gap={2}><Skeleton variant="circular" width={32} height={32} /><Skeleton width={120} /></Box></TableCell>
                                    <TableCell><Skeleton width={200} /></TableCell>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                </TableRow>
                            ))
                        ) : activities.length > 0 ? (
                            activities.map((row) => {
                                const colors = getStatusColor(row.status);
                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.9rem' }}>
                                                    {row.userName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {row.userName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.primary">
                                                {row.action}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatStatus(row.status)}
                                                size="small"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    fontWeight: 600,
                                                    bgcolor: colors.bg,
                                                    color: colors.color
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                            {formatDistanceToNow(row.date, { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No recent activity found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
