'use client';

import React, { useEffect, useState } from 'react';
import {
    Container, Box, Typography, Paper, CircularProgress,
    Chip, Divider, InputAdornment, TextField, Fade, Grow, IconButton, Button
} from '@mui/material';
import {
    Campaign as CampaignIcon,
    Search as SearchIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    NotificationsActive as UrgentIcon,
    Event as EventIcon,
    Info as GeneralIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getNotices, Notice } from '@/app/services/noticeService';
import { alpha, useTheme } from '@mui/material/styles';

export default function CitizenNoticesPage() {
    const theme = useTheme();
    const token = useSelector((state: RootState) => state.auth.user?.token);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchNotices = async () => {
            if (token) {
                try {
                    const data = await getNotices(token);
                    // Sort by newest first
                    const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setNotices(sortedData);
                } catch (error) {
                    console.error("Failed to fetch notices", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchNotices();
    }, [token]);

    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'Urgent':
                return {
                    color: theme.palette.error.main,
                    bg: alpha(theme.palette.error.main, 0.1),
                    icon: <UrgentIcon fontSize="small" />
                };
            case 'Event':
                return {
                    color: theme.palette.info.main,
                    bg: alpha(theme.palette.info.main, 0.1),
                    icon: <EventIcon fontSize="small" />
                };
            default:
                return {
                    color: theme.palette.primary.main,
                    bg: alpha(theme.palette.primary.main, 0.1),
                    icon: <GeneralIcon fontSize="small" />
                };
        }
    };

    const filteredNotices = notices.filter(notice => {
        const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || notice.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Fade in timeout={800}>
                <Box mb={6} textAlign="center">
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        <CampaignIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" fontWeight="800" gutterBottom sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        textFillColor: "transparent",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Official Announcements
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontWeight: 'normal' }}>
                        Keep up to date with the latest news, urgent alerts, and community events from the police department.
                    </Typography>

                    {/* Search & Filter Bar */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1,
                            maxWidth: 700,
                            mx: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 50,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                    >
                        <InputAdornment position="start" sx={{ pl: 2 }}>
                            <SearchIcon color="action" />
                        </InputAdornment>
                        <TextField
                            fullWidth
                            placeholder="Search updates..."
                            variant="standard"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ disableUnderline: true }}
                            sx={{ px: 2 }}
                        />
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, pr: 1 }}>
                            {['All', 'Urgent', 'Event', 'General'].map((filter) => (
                                <Chip
                                    key={filter}
                                    label={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    color={activeFilter === filter ? 'primary' : 'default'}
                                    variant={activeFilter === filter ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Fade>

            {/* Notices Grid */}
            <Box display="flex" flexDirection="column" gap={3}>
                {filteredNotices.length === 0 ? (
                    <Fade in>
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'background.default', borderStyle: 'dashed' }}>
                            <Typography variant="h6" color="text.secondary">No notices found matching your criteria.</Typography>
                            <Button
                                variant="outlined"
                                sx={{ mt: 2, borderRadius: 20 }}
                                onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                            >
                                Clear Filters
                            </Button>
                        </Paper>
                    </Fade>
                ) : (
                    filteredNotices.map((notice, index) => {
                        const style = getCategoryConfig(notice.category);
                        return (
                            <Grow in timeout={500 + (index * 100)} key={notice.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 0,
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                                            borderColor: alpha(style.color, 0.3)
                                        }
                                    }}
                                >
                                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                                        {/* Left Accent Strip / Icon Area */}
                                        <Box
                                            sx={{
                                                width: { xs: '100%', md: 6 },
                                                minHeight: { md: '100%' },
                                                height: { xs: 6, md: 'auto' },
                                                bgcolor: style.color
                                            }}
                                        />

                                        <Box sx={{ p: 3, flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" mb={2}>
                                                <Box display="flex" gap={1.5} alignItems="center" mb={{ xs: 1, sm: 0 }}>
                                                    <Chip
                                                        icon={style.icon}
                                                        label={notice.category}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: style.bg,
                                                            color: style.color,
                                                            fontWeight: 700,
                                                            border: 'none',
                                                            '& .MuiChip-icon': { color: style.color }
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                                                {notice.title}
                                            </Typography>

                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                                                {notice.content}
                                            </Typography>

                                            <Divider sx={{ my: 2, opacity: 0.5 }} />

                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            bgcolor: theme.palette.grey[200],
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    </Box>
                                                    <Typography variant="caption" fontWeight="600" color="text.primary">
                                                        {notice.createdBy?.fullName || 'Police Department'}
                                                    </Typography>
                                                </Box>
                                                {/* Optional: Add an action button here if needed in future */}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grow>
                        );
                    })
                )}
            </Box>
        </Container>
    );
}
