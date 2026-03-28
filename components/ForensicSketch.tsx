"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface ForensicSketchProps {
    imageUrl: string;
    width?: number | string;
    height?: number | string;
}

const ForensicSketch: React.FC<ForensicSketchProps> = ({ imageUrl, width = '100%', height = '100%' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [analysis, setAnalysis] = useState<string>('');
    const [error, setError] = useState(false);

    const resolvedUrl = imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
        : imageUrl;

    useEffect(() => {
        let isMounted = true;

        const processSketch = async () => {
            if (!resolvedUrl) return;
            setIsProcessing(true);
            setProgress(10);

            try {
                // 1. Fetch AI Analysis & Image Blob
                const [aiRes, imgRes] = await Promise.all([
                    fetch('/api/suspect/sketch-analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: resolvedUrl })
                    }),
                    fetch(resolvedUrl).then(r => r.blob())
                ]);

                if (aiRes.ok && isMounted) {
                    const data = await aiRes.json();
                    if (data.analysis) setAnalysis(data.analysis);
                }
                setProgress(40);

                // 2. Load Image from Blob
                const img = new Image();
                const blobUrl = URL.createObjectURL(imgRes);
                img.src = blobUrl;

                img.onload = () => {
                    if (!isMounted) return;
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (!ctx) return;

                    canvas.width = img.width;
                    canvas.height = img.height;

                    // LAYER 1: Grayscale Base (The Graphite Foundation)
                    ctx.filter = 'grayscale(100%) contrast(1.1) brightness(1.1)';
                    ctx.drawImage(img, 0, 0);
                    const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const basePixels = baseData.data;

                    // LAYER 2: Deep Blurred Inversion (The Shading Volume - 10px blur for realistic gradients)
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    if (!tempCtx) return;

                    tempCtx.filter = 'grayscale(100%) invert(100%) blur(10px)';
                    tempCtx.drawImage(img, 0, 0);
                    const blurData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    const blurPixels = blurData.data;

                    // PHASE 3: Color Dodge + Graphite Noise Injection
                    for (let i = 0; i < basePixels.length; i += 4) {
                        const base = basePixels[i];
                        const blend = blurPixels[i];

                        // Digital Dodge Formula
                        let res = blend === 255 ? 255 : (base * 255) / (255 - blend);

                        // Apply "Graphite Grain" (subtle random variation)
                        const noise = (Math.random() - 0.5) * 15;
                        res = Math.min(255, res + noise);

                        // Mid-tone compression for realistic shading (Niall Horan reference style)
                        if (res < 240) {
                            res = res * 0.95; // Soften the highlights
                        }
                        if (res < 150) {
                            res = res * 0.85; // Deepen the pencil strokes
                        }

                        basePixels[i] = res;
                        basePixels[i + 1] = res;
                        basePixels[i + 2] = res;
                    }

                    ctx.putImageData(baseData, 0, 0);

                    // PHASE 4: Multiply Paper Tint
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = 'rgba(245, 240, 225, 0.4)'; // Aged paper warm tint
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Cleanup
                    URL.revokeObjectURL(blobUrl);
                    setProgress(100);
                    setTimeout(() => { if (isMounted) setIsProcessing(false); }, 500);
                };

                img.onerror = () => { if (isMounted) { setError(true); setIsProcessing(false); } };

            } catch (e) {
                console.error("Forensic Sketch Engine Error:", e);
                if (isMounted) setIsProcessing(false);
            }
        };

        processSketch();
        return () => { isMounted = false; };
    }, [resolvedUrl]);

    return (
        <Box sx={{
            position: 'relative', width, height, overflow: 'hidden',
            borderRadius: 2, bgcolor: '#fdfbf7', // Creamy paper background
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Canvas-based Sketch */}
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: isProcessing ? 'none' : 'block',
                    filter: 'contrast(1.1) brightness(1.05)' // Final polish
                }}
            />

            {/* Paper Texture Overlay (CSS-based to avoid CORS/html2canvas errors) */}
            {!isProcessing && !error && (
                <Box
                    sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        pointerEvents: 'none',
                        // CSS-based grain instead of external image
                        background: `
                            linear-gradient(rgba(253, 251, 247, 0.2), rgba(253, 251, 247, 0.2)),
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
                        `,
                        opacity: 0.15,
                        mixBlendMode: 'multiply',
                        zIndex: 2
                    }}
                />
            )}

            {/* Error State */}
            {error && (
                <Typography color="error" sx={{ fontWeight: 800 }}>DATABASE CORRUPTION DETECTED</Typography>
            )}

            {/* AI Processing Animation */}
            {isProcessing && (
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(5,7,12,0.99)', color: 'white'
                }}>
                    <AutoFixHighIcon sx={{ fontSize: 40, mb: 2, animation: 'sketch-pulse 2s infinite', color: '#2866f2' }} />
                    <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 5, mb: 1, color: '#00e5ff' }}>
                        CALIBRATING GRAPHITE DEPTH
                    </Typography>
                    <Box sx={{ width: '40%', height: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                        <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: '#2866f2', transition: 'width 0.4s ease' }} />
                    </Box>
                    <style>{`
                        @keyframes sketch-pulse {
                            0% { transform: scale(0.95) rotate(-2deg); opacity: 0.6; }
                            50% { transform: scale(1.05) rotate(2deg); opacity: 1; }
                            100% { transform: scale(0.95) rotate(-2deg); opacity: 0.6; }
                        }
                    `}</style>
                </Box>
            )}

            {/* AI Observations Overlay */}
            {!isProcessing && analysis && (
                <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    bgcolor: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(12px)',
                    p: 2.5, borderTop: '1px solid rgba(0,229,255,0.3)',
                    zIndex: 5
                }}>
                    <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 900, display: 'block', mb: 0.5, letterSpacing: 2, textTransform: 'uppercase' }}>
                        Investigative AI Profile:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f5f7ff', opacity: 0.9, lineHeight: 1.4, fontSize: '0.75rem', fontStyle: 'italic' }}>
                        "{analysis}"
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ForensicSketch;
