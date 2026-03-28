"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Container,
    InputAdornment,
    TextField
} from '@mui/material';
import Grid from '@mui/material/Grid';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import { getEmergencyContacts, EmergencyContact } from "@/app/services/emergencyService";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export default function CitizenEmergencyPage() {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const token = useSelector((state: RootState) => state.auth.user?.token);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getEmergencyContacts(token);
                setContacts(data);
                setFilteredContacts(data);
            } catch (error) {
                console.error("Failed to load contacts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, [token]);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = contacts.filter(contact =>
            contact.name.toLowerCase().includes(lowerTerm) ||
            contact.number.includes(lowerTerm) ||
            contact.type.toLowerCase().includes(lowerTerm)
        );
        setFilteredContacts(filtered);
    }, [searchTerm, contacts]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Police': return <SecurityIcon fontSize="large" />;
            case 'Medical': return <MedicalServicesIcon fontSize="large" />;
            case 'Fire': return <LocalFireDepartmentIcon fontSize="large" />;
            default: return <LocalPhoneIcon fontSize="large" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Police': return 'primary.main';
            case 'Medical': return 'error.main';
            case 'Fire': return 'warning.main';
            default: return 'text.secondary';
        }
    };

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Emergency Contacts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Quick access to important emergency services. In case of immediate danger, always call 119.
                </Typography>
            </Box>

            {/* Search Bar */}
            <Box mb={4}>
                <TextField
                    placeholder="Search for police, ambulance, or other services..."
                    fullWidth
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor: 'background.paper' }
                    }}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" my={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredContacts.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No contacts found matching your search.</Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        filteredContacts.map((contact) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contact.id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}>
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                bgcolor: `${getTypeColor(contact.type)}15`, // 15% opacity
                                                color: getTypeColor(contact.type),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2
                                            }}
                                        >
                                            {getTypeIcon(contact.type)}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {contact.name}
                                        </Typography>
                                        <Chip
                                            label={contact.type}
                                            size="small"
                                            sx={{ mb: 2, bgcolor: `${getTypeColor(contact.type)}15`, color: getTypeColor(contact.type), fontWeight: 'bold' }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {contact.description}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ p: 2, pt: 0, textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color={contact.type === 'Medical' ? 'error' : contact.type === 'Fire' ? 'warning' : 'primary'}
                                            startIcon={<LocalPhoneIcon />}
                                            fullWidth
                                            size="large"
                                            href={`tel:${contact.number}`}
                                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            Call {contact.number}
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}
        </Container>
    );
}