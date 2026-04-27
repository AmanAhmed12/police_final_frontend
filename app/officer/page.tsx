"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Grid, Card, CardContent, CircularProgress,
    Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, LinearProgress, Divider
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { dutyService, Duty } from '@/app/services/dutyService';
import { getMyAssignedComplaints, Complaint } from '@/app/services/complaintService';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

export default function OfficerDashboard() {
    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const token = loggedInUser?.token;
    const userId = loggedInUser?.id;

    const [loading, setLoading] = useState(true);
    const [duties, setDuties] = useState<Duty[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    const [activeDutiesCount, setActiveDutiesCount] = useState(0);
    const [completedDutiesCount, setCompletedDutiesCount] = useState(0);
    const [assignedComplaintsCount, setAssignedComplaintsCount] = useState(0);
    const [completedComplaintsCount, setCompletedComplaintsCount] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            try {
                let actualUserId = userId;
                if (!actualUserId) {
                    const { getProfile } = await import('@/app/services/authService');
                    const profile = await getProfile(token);
                    actualUserId = profile.id;
                }

                const [dutiesData, complaintsData] = await Promise.all([
                    actualUserId ? dutyService.getDutiesByOfficer(actualUserId, token).catch(() => []) : Promise.resolve([]),
                    getMyAssignedComplaints(token).catch(() => [])
                ]);

                setDuties(dutiesData);
                setComplaints(complaintsData);

                // Counters
                const activeDuties = dutiesData.filter(d => d.status === 'PENDING' || d.status === 'IN_PROGRESS').length;
                const completedDuties = dutiesData.filter(d => d.status === 'COMPLETED').length;
                const activeComplaints = complaintsData.filter((c: Complaint) =>
                    c.status !== 'Resolved' && c.status !== 'RESOLVED' &&
                    c.status !== 'Closed' && c.status !== 'CLOSED'
                ).length;
                const completedComplaints = complaintsData.filter((c: Complaint) =>
                    c.status === 'Resolved' || c.status === 'RESOLVED' ||
                    c.status === 'Closed' || c.status === 'CLOSED'
                ).length;

                setActiveDutiesCount(activeDuties);
                setCompletedDutiesCount(completedDuties);
                setAssignedComplaintsCount(activeComplaints);
                setCompletedComplaintsCount(completedComplaints);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, userId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress size={60} thickness={4} color="primary" />
            </Box>
        );
    }

    // Combine recent activities for the timeline list
    const recentActivities = [
        ...duties.map(d => ({
            id: `duty-${d.id}`,
            title: d.title,
            type: 'Duty',
            status: d.status,
            date: d.dueDate || d.createdAt || ''
        })),
        ...complaints.map(c => ({
            id: `complaint-${c.id}`,
            title: c.title,
            type: 'Complaint',
            status: c.status,
            date: c.createdAt || ''
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    const getStatusStyles = (status: string) => {
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case 'COMPLETED': case 'RESOLVED': case 'CLOSED':
                return { color: '#00bfa5', bg: 'rgba(0,191,165,0.1)', icon: <CheckCircleOutlineIcon /> };
            case 'IN_PROGRESS': case 'IN PROGRESS': case 'IN_INVESTIGATION':
                return { color: '#fd8c04', bg: 'rgba(253,140,4,0.1)', icon: <AutorenewIcon /> };
            default:
                return { color: '#2866f2', bg: 'rgba(40,102,242,0.1)', icon: <AssignmentIcon /> };
        }
    };

    const totalTasks = activeDutiesCount + completedDutiesCount;
    const dutyProgress = totalTasks === 0 ? 0 : (completedDutiesCount / totalTasks) * 100;

    const totalComplaints = assignedComplaintsCount + completedComplaintsCount;
    const complaintProgress = totalComplaints === 0 ? 0 : (completedComplaintsCount / totalComplaints) * 100;

    return (
        <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hero Section */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <Paper
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(40,102,242,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ position: 'absolute', right: '-5%', top: '-20%', opacity: 0.1, transform: 'scale(1.5)' }}>
                        <LocalPoliceIcon sx={{ fontSize: 300 }} />
                    </Box>
                    <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h3" fontWeight="800" gutterBottom>
                                Hello, {loggedInUser?.fullName || 'Officer'}
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                                Your shift overview and essential metrics are ready. Let's keep the city safe.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right', xs: 'left' } }}>
                            <Box sx={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Current Status
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    ON DUTY
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>

            {/* Premium Stat Cards */}
            <Grid container spacing={3} mb={5}>
                {[
                    { title: "Active Duties", count: activeDutiesCount, icon: <AssignmentIcon sx={{ fontSize: 36, color: '#2866f2' }} />, progress: 100, color: 'primary' },
                    { title: "Ongoing Cases", count: assignedComplaintsCount, icon: <WarningIcon sx={{ fontSize: 36, color: '#fd8c04' }} />, progress: 100, color: 'warning' }
                ].map((stat, idx) => (
                    <Grid size={{ xs: 12, md: 4 }} key={idx}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}>
                            <Card sx={{
                                borderRadius: 4,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.02)',
                                transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: `${stat.color}.light`,
                                                opacity: 0.8
                                            }}
                                        >
                                            {stat.icon}
                                        </Box>
                                        <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
                                            {stat.count}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" color="textSecondary" fontWeight="600" mb={2}>
                                        {stat.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            
            <Grid container spacing={4}>
               
                <Grid size={{ xs: 12, md: 5 }}>
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                        <Typography variant="h5" fontWeight="bold" mb={3}>
                            Workload Distribution
                        </Typography>
                        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', p: 3 }}>
                            <Box mb={4}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                                        Assigned Duties Fulfillment
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                        {Math.round(dutyProgress)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={dutyProgress}
                                    sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(40,102,242,0.1)' }}
                                />
                                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                                    {completedDutiesCount} out of {totalTasks} duties completed.
                                </Typography>
                            </Box>

                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                                        Cases & Complaints Resolved
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#00bfa5' }}>
                                        {Math.round(complaintProgress)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={complaintProgress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(0,191,165,0.1)',
                                        '& .MuiLinearProgress-bar': { backgroundColor: '#00bfa5' }
                                    }}
                                />
                                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                                    {completedComplaintsCount} out of {totalComplaints} cases resolved.
                                </Typography>
                            </Box>

                            <Box mt={4} p={3} sx={{ borderRadius: 3, bgcolor: 'rgba(253,140,4,0.05)', border: '1px dashed rgba(253,140,4,0.3)' }}>
                                <Typography variant="subtitle2" color="warning.main" fontWeight="bold" mb={1}>
                                    Priority Notice
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    You have {activeDutiesCount} active duties and {assignedComplaintsCount} ongoing case(s) requiring your attention today.
                                </Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Elegant Timeline List instead of a standard Table */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                        <Typography variant="h5" fontWeight="bold" mb={3}>
                            Recent Action Feed
                        </Typography>
                        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', p: 1 }}>
                            {recentActivities.length === 0 ? (
                                <Box p={4} textAlign="center">
                                    <Typography color="textSecondary">No recent actions logged in your feed.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: '100%' }}>
                                    {recentActivities.map((activity, index) => {
                                        const styles = getStatusStyles(activity.status);
                                        return (
                                            <React.Fragment key={activity.id}>
                                                <ListItem
                                                    alignItems="flex-start"
                                                    sx={{
                                                        py: 2.5, px: 3,
                                                        transition: 'background-color 0.2s',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: styles.bg, color: styles.color, width: 48, height: 48 }}>
                                                            {styles.icon}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primaryTypographyProps={{ component: 'div' } as any}
                                                        secondaryTypographyProps={{ component: 'div' } as any}
                                                        primary={
                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                                                                    {activity.title}
                                                                </Typography>
                                                                <Typography variant="caption" fontWeight="bold" sx={{ color: styles.color, bgcolor: styles.bg, px: 1.5, py: 0.5, borderRadius: 2 }}>
                                                                    {activity.status.replace(/_/g, ' ')}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box mt={1}>
                                                                <Typography component="span" variant="body2" color="text.primary" fontWeight="500">
                                                                    {activity.type}
                                                                </Typography>
                                                                <Typography component="span" variant="body2" color="textSecondary" sx={{ mx: 1 }}>•</Typography>
                                                                <Typography component="span" variant="body2" color="textSecondary">
                                                                    Assigned on {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
}
