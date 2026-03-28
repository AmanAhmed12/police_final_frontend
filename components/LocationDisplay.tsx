"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationDisplayProps {
    lat: number;
    lng: number;
    address?: string;
    height?: string | number;
}

const SRI_LANKA_BOUNDS: L.LatLngBoundsExpression = [
    [5.916, 79.516],
    [9.850, 81.883]
];

const LocationDisplay: React.FC<LocationDisplayProps> = ({ lat, lng, address, height = 300 }) => {
    return (
        <Box sx={{ height, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                maxBounds={SRI_LANKA_BOUNDS}
                minZoom={7}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    {address && (
                        <Popup>
                            <Typography variant="body2">{address}</Typography>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </Box>
    );
};

export default LocationDisplay;
