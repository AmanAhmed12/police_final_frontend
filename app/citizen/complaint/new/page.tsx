"use client";

import React, { useState, ChangeEvent } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Container,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    FormHelperText,
    Snackbar,
    Alert,
    IconButton,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter, useSearchParams } from 'next/navigation';
import { createComplaint } from '@/app/services/complaintService';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { translations, Language } from './translations';
import dynamic from 'next/dynamic';


const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</Box>
});


export default function FileComplaintPage() {
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.user?.token);

  
    const [lang, setLang] = useState<Language>('en');
    const t = translations[lang];

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        incidentDate: '',
        location: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
        description: '',
    });

  
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [errors, setErrors] = useState<any>({});
    const searchParams = useSearchParams();

    
    React.useEffect(() => {
        const title = searchParams.get('title');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const description = searchParams.get('description');

        if (title || category || location || description) {
            setFormData(prev => ({
                ...prev,
                ...(title && { title }),
                ...(category && { category }),
                ...(location && { location }),
                ...(description && { description }),
            }));
        }
    }, [searchParams]);

    const handleLanguageChange = (event: React.MouseEvent<HTMLElement>, newLang: Language) => {
        if (newLang) {
            setLang(newLang);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
        if (errors[name as string]) {
            setErrors((prev: any) => ({ ...prev, [name as string]: null }));
        }
    };

    const handleLocationPickerChange = (address: string, lat?: number, lng?: number) => {
        setFormData(prev => ({
            ...prev,
            location: address,
            latitude: lat,
            longitude: lng
        }));
        if (errors.location) {
            setErrors((prev: any) => ({ ...prev, location: null }));
        }
    };

  
    const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            const remainingSlots = 3 - selectedImages.length;

            if (remainingSlots <= 0) {
                setSnackbarMessage("Maximum 3 images allowed");
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
                return;
            }

            const filesToProcess = filesArray.slice(0, remainingSlots);

           
            const newPreviews = filesToProcess.map(file => URL.createObjectURL(file));

            setSelectedImages(prev => [...prev, ...filesToProcess]);
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
           
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const validateStep = (step: number) => {
        const newErrors: any = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.title) newErrors.title = t.errors.title;
            if (!formData.category) newErrors.category = t.errors.category;
            if (!formData.incidentDate) newErrors.incidentDate = t.errors.date;
        } else if (step === 1) {
            if (!formData.location) newErrors.location = t.errors.location;
            if (!formData.description) newErrors.description = t.errors.description;
            if (formData.description.length < 20) newErrors.description = t.errors.descMin;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(1)) return;

        setLoading(true);
        try {
            await createComplaint(formData, selectedImages, token);
            setSnackbarOpen(true);
            setTimeout(() => {
                router.push('/citizen');
            }, 2000);
        } catch (error) {
            console.error("Complaint submission error:", error);
            setSnackbarMessage("Failed to submit complaint. Please try again.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setLoading(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                {t.step1Title}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label={t.subjectLabel}
                                name="title"
                                placeholder={t.subjectPlaceholder}
                                value={formData.title}
                                onChange={handleInputChange}
                                error={!!errors.title}
                                helperText={errors.title}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth error={!!errors.category}>
                                <InputLabel>{t.categoryLabel}</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label={t.categoryLabel}
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value="Theft">{t.categories.Theft}</MenuItem>
                                    <MenuItem value="Assault">{t.categories.Assault}</MenuItem>
                                    <MenuItem value="Harassment">{t.categories.Harassment}</MenuItem>
                                    <MenuItem value="Cybercrime">{t.categories.Cybercrime}</MenuItem>
                                    <MenuItem value="LostProperty">{t.categories.LostProperty}</MenuItem>
                                    <MenuItem value="SuspiciousActivity">{t.categories.SuspiciousActivity}</MenuItem>
                                    <MenuItem value="Other">{t.categories.Other}</MenuItem>
                                </Select>
                                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label={t.dateLabel}
                                type="datetime-local"
                                name="incidentDate"
                                value={formData.incidentDate}
                                onChange={handleInputChange}
                                error={!!errors.incidentDate}
                                helperText={errors.incidentDate}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                {t.step2Title}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <LocationPicker
                                label={t.locationLabel}
                                placeholder={t.locationPlaceholder}
                                value={formData.location}
                                onChange={handleLocationPickerChange}
                                error={!!errors.location}
                                helperText={errors.location}
                                initialLat={formData.latitude}
                                initialLng={formData.longitude}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label={t.descLabel}
                                name="description"
                                multiline
                                rows={6}
                                placeholder={t.descPlaceholder}
                                value={formData.description}
                                onChange={handleInputChange}
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                        </Grid>

                       
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default', borderStyle: 'dashed' }}>
                                <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {t.evidenceTitle}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    {t.evidenceSubtitle}
                                </Typography>

                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    multiple
                                    type="file"
                                    onChange={handleImageSelect}
                                    disabled={selectedImages.length >= 3}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={selectedImages.length >= 3}
                                    >
                                        {t.uploadBtn}
                                    </Button>
                                </label>

                               
                                {previewUrls.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        {previewUrls.map((url, index) => (
                                            <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: -10,
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        '&:hover': { bgcolor: 'error.dark' }
                                                    }}
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                );
            case 2:
               
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                            {t.step3Title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {t.step3Subtitle}
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="subtitle2" color="text.secondary">{t.subjectLabel}</Typography>
                                    <Typography variant="body1" fontWeight="500">{formData.title}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="subtitle2" color="text.secondary">{t.categoryLabel}</Typography>
                                    <Typography variant="body1">{formData.category}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="subtitle2" color="text.secondary">{t.dateLabel}</Typography>
                                    <Typography variant="body1">{formData.incidentDate ? new Date(formData.incidentDate).toLocaleString() : ''}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary">{t.locationLabel}</Typography>
                                    <Typography variant="body1">{formData.location}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary">{t.descLabel}</Typography>
                                    <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, mt: 0.5, wordBreak: 'break-word' }}>
                                        {formData.description}
                                    </Typography>
                                </Grid>
                                {selectedImages.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Attached Images</Typography>
                                        <Typography variant="body1">{selectedImages.length} images ready to upload.</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md">
            <Box mb={4} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                        {t.pageTitle}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t.pageSubtitle}
                    </Typography>
                </Box>

               
                <ToggleButtonGroup
                    value={lang}
                    exclusive
                    onChange={handleLanguageChange}
                    aria-label="language"
                    size="small"
                >
                    <ToggleButton value="en">English</ToggleButton>
                    <ToggleButton value="ta">தமிழ்</ToggleButton>
                    <ToggleButton value="si">සිංහල</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {t.steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box>
                    {activeStep === t.steps.length ? (
                        <Box textAlign="center" py={5}>
                            <Typography variant="h5" gutterBottom>
                                {t.successMessage}
                            </Typography>
                            <Typography variant="subtitle1">
                                Your reference number is #2024-8832.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {renderStepContent(activeStep)}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    {t.backBtn}
                                </Button>
                                {activeStep === t.steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        endIcon={loading ? null : <SendIcon />}
                                        size="large"
                                        sx={{ px: 4, borderRadius: 2 }}
                                    >
                                        {loading ? t.submitting : t.submitBtn}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        endIcon={<ArrowForwardIcon />}
                                        size="large"
                                        sx={{ px: 4, borderRadius: 2 }}
                                    >
                                        {t.nextBtn}
                                    </Button>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>

         
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%', boxShadow: 4 }} variant="filled">
                    {snackbarSeverity === 'success' ? t.successMessage : snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}
