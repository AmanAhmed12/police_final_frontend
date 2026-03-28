import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string; // e.g., "+12%" or "-5%"
    isPositive?: boolean;
    icon: React.ReactNode;
    color?: string; // Hex color for the icon background
}

export default function StatCard({ title, value, trend, isPositive, icon, color = "#2866f2" }: StatCardProps) {
    return (
        <Paper
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)'
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="textPrimary">
                        {value}
                    </Typography>
                </Box>
                <Avatar
                    variant="rounded"
                    sx={{
                        bgcolor: `${color}22`, // 22 is ~13% opacity
                        color: color,
                        width: 48,
                        height: 48
                    }}
                >
                    {icon}
                </Avatar>
            </Box>

            {trend && (
                <Box display="flex" alignItems="center" gap={1}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: isPositive ? '#00e676' : '#ff1744',
                            bgcolor: isPositive ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}
                    >
                        {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        {trend}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                        since last month
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
