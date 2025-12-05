import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Alert,
    CircularProgress, Stepper, Step, StepLabel,
    Backdrop, Grid, Paper, IconButton
} from '@mui/material';
import { Security, Fingerprint, CheckCircle, Backspace, Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Componentes estilizados
const MinimalPaper = styled(Paper)({
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
});

const MinimalStepper = styled(Stepper)({
    '& .MuiStepIcon-root': {
        color: 'rgba(0, 0, 0, 0.2)',
        '&.Mui-active': {
            color: '#000'
        },
        '&.Mui-completed': {
            color: '#000'
        }
    },
    '& .MuiStepLabel-label': {
        color: 'rgba(0, 0, 0, 0.5)',
        '&.Mui-active': {
            color: '#000',
            fontWeight: 600
        },
        '&.Mui-completed': {
            color: '#000',
            fontWeight: 500
        }
    }
});

const MinimalButton = styled(Button)(({ variant }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    border: variant === 'outlined' ? '2px solid #000' : 'none',
    backgroundColor: variant === 'contained' ? '#000' : 'transparent',
    color: variant === 'contained' ? '#fff' : '#000',
    '&:hover': {
        backgroundColor: variant === 'contained' ? '#333' : 'rgba(0, 0, 0, 0.04)',
        transform: 'translateY(-2px)',
        boxShadow: variant === 'contained' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : 'none',
        borderColor: variant === 'outlined' ? '#333' : undefined
    },
    '&.Mui-disabled': {
        backgroundColor: variant === 'contained' ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        color: variant === 'contained' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(0, 0, 0, 0.1)'
    }
}));

const DotIndicator = styled('div')(({ filled }) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: filled ? '#000' : 'rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: filled ? 'none' : '1px solid rgba(0, 0, 0, 0.2)'
}));

const PINSetup = ({ open, onClose, onSuccess, requiresSetup = false }) => {
    const [step, setStep] = useState(0);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const steps = ['Crear PIN', 'Confirmar PIN', 'Completado'];

    useEffect(() => {
        if (open) {
            setStep(0);
            setPin('');
            setConfirmPin('');
            setError('');
            setSuccess('');
        }
    }, [open]);

    const limpiarAutenticacion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('biometricToken');
        localStorage.removeItem('userLocation');
        localStorage.removeItem('offlineLocationQueue');
        sessionStorage.clear();
    };

    const handleCloseSafe = () => {
        if (requiresSetup) {
            limpiarAutenticacion();
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        }
        
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const handleCancelExplicit = () => {
        limpiarAutenticacion();
        
        if (typeof onClose === 'function') {
            onClose();
        }
        
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    };

    const handleNumberClick = (number) => {
        if (pin.length < 4 && step === 0) {
            const newPin = pin + number;
            setPin(newPin);
            setError('');

            if (newPin.length === 4 && step === 0) {
                setTimeout(() => {
                    setStep(1);
                }, 500);
            }
        } else if (confirmPin.length < 4 && step === 1) {
            const newConfirmPin = confirmPin + number;
            setConfirmPin(newConfirmPin);
            setError('');
        }
    };

    const handleBackspace = () => {
        if (step === 0 && pin.length > 0) {
            setPin(pin.slice(0, -1));
            setError('');
        } else if (step === 1 && confirmPin.length > 0) {
            setConfirmPin(confirmPin.slice(0, -1));
            setError('');
        }
    };

    const handleConfirmPIN = async () => {
        if (pin !== confirmPin) {
            setError('Los PINs no coinciden. Por favor, inténtalo de nuevo.');
            setConfirmPin('');
            return;
        }

        const pinsComunes = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234'];
        if (pinsComunes.includes(pin)) {
            setError('Por seguridad, elige un PIN menos común.');
            setPin('');
            setConfirmPin('');
            setStep(0);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const response = await fetch(`${API_URL}/biometric/setup-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pin })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('PIN configurado correctamente');
                setStep(2);
                
                if (data.biometricToken) {
                    localStorage.setItem('biometricToken', data.biometricToken);
                }

                setTimeout(() => {
                    if (typeof onSuccess === 'function') {
                        onSuccess();
                    }
                    if (!requiresSetup) {
                        handleCloseSafe();
                    }
                }, 2000);
            } else {
                setError(data.message || 'Error configurando PIN');
                setStep(0);
                setPin('');
                setConfirmPin('');
            }
        } catch (error) {
            setError('Error de conexión. Verifica tu conexión a internet.');
            setStep(0);
            setPin('');
            setConfirmPin('');
            
            if (error.message.includes('token')) {
                limpiarAutenticacion();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 3, textAlign: 'center' }}>
                            Crea un PIN de 4 dígitos para seguridad adicional
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                            {[1, 2, 3, 4].map((index) => (
                                <DotIndicator key={index} filled={pin.length >= index} />
                            ))}
                        </Box>

                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center', mb: 3 }}>
                            {pin.length}/4 dígitos
                        </Typography>

                        <Grid container spacing={1} sx={{ maxWidth: 300, margin: '0 auto' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                <Grid item xs={4} key={number}>
                                    <MinimalButton
                                        variant="outlined"
                                        onClick={() => handleNumberClick(number.toString())}
                                        disabled={pin.length >= 4}
                                        sx={{
                                            width: '100%',
                                            height: 60,
                                            fontSize: '1.2rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {number}
                                    </MinimalButton>
                                </Grid>
                            ))}
                            
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={handleBackspace}
                                    disabled={pin.length === 0}
                                    sx={{ width: '100%', height: 60 }}
                                >
                                    <Backspace />
                                </MinimalButton>
                            </Grid>
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={() => handleNumberClick('0')}
                                    disabled={pin.length >= 4}
                                    sx={{
                                        width: '100%',
                                        height: 60,
                                        fontSize: '1.2rem',
                                        fontWeight: 700
                                    }}
                                >
                                    0
                                </MinimalButton>
                            </Grid>
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="contained"
                                    onClick={() => setStep(1)}
                                    disabled={pin.length !== 4}
                                    sx={{ width: '100%', height: 60 }}
                                >
                                    Siguiente
                                </MinimalButton>
                            </Grid>
                        </Grid>

                        <Typography variant="caption" sx={{ 
                            color: 'rgba(0, 0, 0, 0.5)', 
                            display: 'block', 
                            textAlign: 'center', 
                            mt: 3,
                            fontFamily: 'monospace'
                        }}>
                            PIN: {pin.replace(/./g, '•')}
                        </Typography>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 3, textAlign: 'center' }}>
                            Confirma tu PIN
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center', mb: 2 }}>
                            PIN original: {pin.replace(/./g, '•')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                            {[1, 2, 3, 4].map((index) => (
                                <DotIndicator key={index} filled={confirmPin.length >= index} />
                            ))}
                        </Box>

                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center', mb: 3 }}>
                            {confirmPin.length}/4 dígitos
                        </Typography>

                        <Grid container spacing={1} sx={{ maxWidth: 300, margin: '0 auto' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                <Grid item xs={4} key={number}>
                                    <MinimalButton
                                        variant="outlined"
                                        onClick={() => handleNumberClick(number.toString())}
                                        disabled={confirmPin.length >= 4}
                                        sx={{
                                            width: '100%',
                                            height: 60,
                                            fontSize: '1.2rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {number}
                                    </MinimalButton>
                                </Grid>
                            ))}
                            
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={handleBackspace}
                                    disabled={confirmPin.length === 0}
                                    sx={{ width: '100%', height: 60 }}
                                >
                                    <Backspace />
                                </MinimalButton>
                            </Grid>
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={() => handleNumberClick('0')}
                                    disabled={confirmPin.length >= 4}
                                    sx={{
                                        width: '100%',
                                        height: 60,
                                        fontSize: '1.2rem',
                                        fontWeight: 700
                                    }}
                                >
                                    0
                                </MinimalButton>
                            </Grid>
                            <Grid item xs={4}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={() => {
                                        setStep(0);
                                        setConfirmPin('');
                                    }}
                                    sx={{ width: '100%', height: 60 }}
                                >
                                    Atrás
                                </MinimalButton>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <MinimalButton
                                variant="contained"
                                onClick={handleConfirmPIN}
                                disabled={confirmPin.length !== 4 || loading}
                                sx={{ minWidth: 200 }}
                                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Fingerprint />}
                            >
                                {loading ? 'Configurando...' : 'Confirmar PIN'}
                            </MinimalButton>
                        </Box>

                        <Typography variant="caption" sx={{ 
                            color: 'rgba(0, 0, 0, 0.5)', 
                            display: 'block', 
                            textAlign: 'center', 
                            mt: 3,
                            fontFamily: 'monospace'
                        }}>
                            Confirmación: {confirmPin.replace(/./g, '•')}
                        </Typography>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '20px',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                border: '1px solid rgba(76, 175, 80, 0.2)'
                            }}
                        >
                            <CheckCircle sx={{ fontSize: 48, color: '#4CAF50' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', mb: 1 }}>
                            ¡PIN Configurado!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Tu autenticación biométrica está activa
                        </Typography>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={requiresSetup ? undefined : handleCloseSafe}
            maxWidth="sm"
            fullWidth
            PaperComponent={MinimalPaper}
        >
            <Box sx={{ position: 'relative', p: 3 }}>
                <IconButton
                    onClick={requiresSetup ? undefined : handleCloseSafe}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                    disabled={requiresSetup && step === 2}
                >
                    <Close />
                </IconButton>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            border: '1px solid rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        <Security sx={{ fontSize: 32, color: step === 2 ? '#4CAF50' : '#000' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#000', mb: 2 }}>
                        {requiresSetup ? 'Configuración de Seguridad' : 'Autenticación Biométrica'}
                    </Typography>
                </Box>

                <MinimalStepper activeStep={step} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </MinimalStepper>

                {error && (
                    <Alert 
                        severity="error"
                        onClose={() => setError('')}
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(244, 67, 54, 0.05)',
                            border: '1px solid rgba(244, 67, 54, 0.1)',
                            color: '#F44336',
                            '& .MuiAlert-icon': { color: '#F44336' }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert 
                        severity="success"
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                            border: '1px solid rgba(76, 175, 80, 0.1)',
                            color: '#4CAF50',
                            '& .MuiAlert-icon': { color: '#4CAF50' }
                        }}
                    >
                        {success}
                    </Alert>
                )}

                {renderStepContent()}

                {requiresSetup && step === 0 && (
                    <Box sx={{ 
                        p: 2, 
                        mt: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                            Para mayor seguridad, debes configurar un PIN de acceso de 4 dígitos.
                        </Typography>
                    </Box>
                )}

                {step < 2 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <MinimalButton
                            onClick={requiresSetup ? handleCancelExplicit : handleCloseSafe}
                            disabled={loading}
                            variant="outlined"
                            sx={{ borderColor: '#F44336', color: '#F44336' }}
                        >
                            {requiresSetup ? 'Cancelar y Salir' : 'Cancelar'}
                        </MinimalButton>
                    </Box>
                )}

                <Backdrop open={loading} sx={{ zIndex: 1300, color: '#000' }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Box>
        </Dialog>
    );
};

PINSetup.defaultProps = {
    onClose: () => console.warn('onClose no proporcionado para PINSetup'),
    onSuccess: () => console.warn('onSuccess no proporcionado para PINSetup'),
};

export default PINSetup;