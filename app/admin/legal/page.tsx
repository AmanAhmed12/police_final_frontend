import React from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

export default function LegalPage() {
    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <GavelIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Legal Actions
                </Typography>
            </Box>
            <Paper sx={{ p: 4, textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    No pending legal actions required.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    All court orders and warrants are up to date.
                </Typography>
            </Paper>
        </Box>
    );
}
