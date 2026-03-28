"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Paper, CircularProgress, Container, TextField,
    InputAdornment, List, ListItemButton, ListItemIcon, ListItemText,
    Accordion, AccordionSummary, AccordionDetails, Divider, Fade, Breadcrumbs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getGuidelines, Guideline } from '@/services/guidelines';

// 1. Import your service and interface


export default function GuidelinesPage() {
    const [guidelines, setGuidelines] = useState<Guideline[]>([]);
    const [filteredGuidelines, setFilteredGuidelines] = useState<Guideline[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    // 2. Access the token from Redux
    const token = useSelector((state: any) => state.auth.user?.token);

    useEffect(() => {
        const fetchGuidelines = async () => {
            setLoading(true);
            try {
                // 3. Call the professional API service
                const data = await getGuidelines(token);
                setGuidelines(data);
                setFilteredGuidelines(data);
            } catch (error) {
                console.error("Failed to load guidelines", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchGuidelines();
    }, [token]);

    // 4. Filtering Logic remains the same
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = guidelines.filter(item =>
            (activeCategory === "All" || item.category === activeCategory) &&
            (item.title.toLowerCase().includes(lowerTerm) || item.content.toLowerCase().includes(lowerTerm))
        );
        setFilteredGuidelines(filtered);
    }, [searchTerm, activeCategory, guidelines]);

    const categories = ["All", ...Array.from(new Set(guidelines.map(g => g.category)))];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#f44336';
            case 'Medium': return '#ff9800';
            default: return '#2196f3';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={5}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Typography color="text.secondary">Standards</Typography>
                    <Typography color="text.primary">Guidelines</Typography>
                </Breadcrumbs>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                    Resource Center
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6 }}>
                    Official safety protocols and community guidelines for CityGuard.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Sidebar */}
                <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
                    <Paper sx={{ p: 2, borderRadius: 4, position: 'sticky', top: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="overline" fontWeight="700" color="text.secondary" sx={{ px: 2, mb: 1, display: 'block' }}>
                            Categories
                        </Typography>
                        <List>
                            {categories.map((cat) => (
                                <ListItemButton
                                    key={cat}
                                    selected={activeCategory === cat}
                                    onClick={() => setActiveCategory(cat)}
                                    sx={{ borderRadius: 2, mb: 0.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {cat === 'All' ? <MenuBookIcon /> : <InfoIcon />}
                                    </ListItemIcon>
                                    <ListItemText primary={cat} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* Main Content */}
                <Box sx={{ flexGrow: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Search guidelines..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'background.paper' } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredGuidelines.map((item, index) => (
                            <Fade in={true} timeout={300 + (index * 100)} key={item.id}>
                                <Accordion
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:before': { display: 'none' },
                                        '&:not(:last-child)': { mb: 1 },
                                        '&:hover': { transform: 'scale(1.005)', transition: '0.2s' }
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 4, height: 24, bgcolor: getPriorityColor(item.priority), borderRadius: 2 }} />
                                            <Typography variant="h6" fontWeight="700">{item.title}</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.01)' }}>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                                            {item.content}
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />

                                        {/* 5. Professional Join Display: Showing the Creator Name from DTO */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <VerifiedUserIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                <Typography variant="caption" fontWeight="700" color="success.main" sx={{ letterSpacing: 0.5 }}>
                                                    OFFICIAL PROTOCOL BY {item.createdByName.toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.disabled" fontWeight="500">
                                                PUBLISHED: {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </Typography>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Fade>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}