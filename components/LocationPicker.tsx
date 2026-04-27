'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TextField, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Fix for default marker icon in Leaflet + Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerProps {
    value: string; // The text address
    onChange: (location: string, lat?: number, lng?: number) => void;
    error?: boolean;
    helperText?: React.ReactNode;
    label?: string;
    placeholder?: string;
    // Optional initial coordinates 
    initialLat?: number;
    initialLng?: number;
    disabled?: boolean;
}

// Center of Sri Lanka
const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;
const SRI_LANKA_BOUNDS: L.LatLngBoundsExpression = [
    [5.916, 79.516],
    [9.850, 81.883]
];

export default function LocationPicker({
    value,
    onChange,
    error,
    helperText,
    label = "Location",
    placeholder = "Drag the pin or type the address",
    initialLat,
    initialLng,
    disabled = false
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [loading, setLoading] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    // Reverse Geocode when position changes
    useEffect(() => {
        if (!position || disabled) return;

        const [lat, lng] = position;
        const fetchAddress = async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                if (data && data.display_name) {
                    // Extract a clean but detailed address (e.g., skip the super long country details if possible, or just use display_name)
                    const cleanAddress = data.display_name;
                    onChange(cleanAddress, lat, lng);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly to avoid spamming the API while dragging
        const timeoutId = setTimeout(fetchAddress, 800);
        return () => clearTimeout(timeoutId);
    }, [position]);


    // Component to handle map clicks and move the marker
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                if (!disabled) {
                    setPosition([e.latlng.lat, e.latlng.lng]);
                }
            },
        });

        return position === null ? null : (
            <Marker
                position={position}
                draggable={!disabled}
                eventHandlers={{
                    dragend: (e) => {
                        if (!disabled) {
                            const marker = e.target;
                            const pos = marker.getLatLng();
                            setPosition([pos.lat, pos.lng]);
                        }
                    },
                }}
            />
        );
    };

    const handleGetMyLocation = () => {
        if ('geolocation' in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    if (mapRef.current) {
                        mapRef.current.flyTo(newPos, 16);
                    }
                },
                (err) => {
                    console.error("Error getting location", err);
                    setLoading(false);
                    alert("Could not get your current location. Please ensure location services are enabled.");
                }
            );
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* The Map */}
            <Box sx={{ height: 300, width: '100%', borderRadius: 1, overflow: 'hidden', position: 'relative', border: error ? '1px solid #d32f2f' : '1px solid #c4c4c4' }}>
                <MapContainer
                    center={position || DEFAULT_CENTER}
                    zoom={position ? 15 : DEFAULT_ZOOM}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    maxBounds={SRI_LANKA_BOUNDS}
                    minZoom={7}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>

                {/* Floating GPS Button */}
                {!disabled && (
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
                        <IconButton
                            color="primary"
                            onClick={handleGetMyLocation}
                            sx={{
                                backgroundColor: 'white',
                                boxShadow: 2,
                                '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : <MyLocationIcon />}
                        </IconButton>
                    </Box>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 999,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <CircularProgress />
                    </Box>
                )}
            </Box>

            {/* The Text Input */}
            <Typography variant="caption" color="text.secondary">
                Drop a pin on the map to auto-fill, or type the address manually if the incident occurred elsewhere.
            </Typography>
            <TextField
                fullWidth
                label={label}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value, position?.[0], position?.[1])}
                error={error}
                helperText={helperText}
                disabled={disabled}
            />
        </Box>
    );
}
