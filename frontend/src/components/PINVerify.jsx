import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Alert, CircularProgress,
    Paper, Backdrop, Grid, IconButton
} from '@mui/material';
import { Security, Fingerprint, Backspace, RestoreOutlined, Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PINResetRequest from './PINResetRequest';
import PINResetVerify from './PINResetVerify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Componentes estilizados
const MinimalPaper = styled(Paper)({
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
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

const PINVerify = ({ open, onVerify, onCancel }) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [showResetRequest, setShowResetRequest] = useState(false);
    const [showResetVerify, setShowResetVerify] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    useEffect(() => {
        if (open) {
            setPin('');
            setError('');
            setAttemptsLeft(5);
            setLockedUntil(null);
            setShowResetRequest(false);
            setShowResetVerify(false);
            setResetEmail('');
        }
    }, [open]);

    const limpiarAutenticacionCompleta = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('biometricToken');
        localStorage.removeItem('userLocation');
        localStorage.removeItem('offlineLocationQueue');
        sessionStorage.clear();
    };

    const handleNumberClick = (number) => {
        if (pin.length < 4) {
            const newPin = pin + number;
            setPin(newPin);
            setError('');

            if (newPin.length === 4) {
                handleVerify(newPin);
            }
        }
    };

    const handleBackspace = () => {
        if (pin.length > 0) {
            setPin(pin.slice(0, -1));
            setError('');
        }
    };

    const handleVerify = async (pinToVerify = null) => {
        const pinFinal = pinToVerify || pin;
        
        if (pinFinal.length !== 4) {
            setError('El PIN debe tener 4 dígitos');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/biometric/verify-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pin: pinFinal })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('biometricToken', data.biometricToken);
                onVerify && onVerify(data.biometricToken);
            } else {
                if (response.status === 423) {
                    setLockedUntil(data.lockedUntil);
                    setError('Demasiados intentos fallidos. Intenta más tarde.');
                } else {
                    setError(data.message);
                    setAttemptsLeft(data.attemptsLeft || attemptsLeft - 1);
                }
                setPin('');
            }
        } catch (error) {
            setError('Error de conexión. Verifica tu internet.');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    const handleManualVerify = () => {
        if (pin.length === 4) {
            handleVerify();
        } else {
            setError('Completa los 4 dígitos del PIN');
        }
    };

    const handleCancel = () => {
        limpiarAutenticacionCompleta();
        
        if (typeof onCancel === 'function') {
            onCancel();
        }
        
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    };

    const handleResetRequest = () => {
        setShowResetRequest(true);
    };

    const handleCodeSent = (email) => {
        setResetEmail(email);
        setShowResetRequest(false);
        setShowResetVerify(true);
    };

    const handleResetSuccess = () => {
        setShowResetVerify(false);
        setShowResetRequest(false);
        handleCancel();
    };

    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();

    return (
        <>
            <Dialog 
                open={open && !showResetRequest && !showResetVerify} 
                onClose={handleCancel}
                maxWidth="sm"
                fullWidth
                PaperComponent={MinimalPaper}
            >
                <Box sx={{ position: 'relative', p: 3 }}>
                    <IconButton
                        onClick={handleCancel}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
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
                            <Security sx={{ fontSize: 32, color: '#000' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#000', mb: 1 }}>
                            Verificación de Seguridad
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Ingresa tu PIN de 4 dígitos
                        </Typography>
                    </Box>

                    {isLocked ? (
                        <Box>
                            <Box sx={{ 
                                p: 3, 
                                mb: 3, 
                                borderRadius: '12px',
                                backgroundColor: 'rgba(244, 67, 54, 0.05)',
                                border: '1px solid rgba(244, 67, 54, 0.1)',
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 500, mb: 1 }}>
                                    Demasiados intentos fallidos
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#F44336' }}>
                                    Puedes intentar nuevamente el {new Date(lockedUntil).toLocaleString()}.
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <MinimalButton
                                    variant="outlined"
                                    onClick={handleResetRequest}
                                    sx={{ minWidth: 200 }}
                                    startIcon={<RestoreOutlined />}
                                >
                                    Restablecer PIN
                                </MinimalButton>
                            </Box>

                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)', textAlign: 'center', mt: 2 }}>
                                ¿Olvidaste tu PIN? Puedes restablecerlo usando tu email.
                            </Typography>
                        </Box>
                    ) : (
                        <>
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
                                            disabled={pin.length >= 4 || loading}
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
                                        disabled={pin.length === 0 || loading}
                                        sx={{ width: '100%', height: 60 }}
                                    >
                                        <Backspace />
                                    </MinimalButton>
                                </Grid>
                                <Grid item xs={4}>
                                    <MinimalButton
                                        variant="outlined"
                                        onClick={() => handleNumberClick('0')}
                                        disabled={pin.length >= 4 || loading}
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
                                        onClick={handleManualVerify}
                                        disabled={pin.length !== 4 || loading}
                                        sx={{ width: '100%', height: 60 }}
                                    >
                                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verificar'}
                                    </MinimalButton>
                                </Grid>
                            </Grid>

                            {error && (
                                <Alert 
                                    severity="error"
                                    onClose={() => setError('')}
                                    sx={{
                                        mt: 3,
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(244, 67, 54, 0.05)',
                                        border: '1px solid rgba(244, 67, 54, 0.1)',
                                        color: '#F44336',
                                        '& .MuiAlert-icon': { color: '#F44336' }
                                    }}
                                >
                                    {error}
                                    {attemptsLeft > 0 && attemptsLeft < 5 && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Intentos restantes: {attemptsLeft}
                                        </Typography>
                                    )}
                                </Alert>
                            )}

                            {attemptsLeft <= 2 && attemptsLeft > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={handleResetRequest}
                                        sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                                    >
                                        ¿Olvidaste tu PIN?
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <MinimalButton
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={loading}
                            sx={{ borderColor: '#F44336', color: '#F44336' }}
                        >
                            {isLocked ? 'Cerrar' : 'Cancelar y Salir'}
                        </MinimalButton>
                    </Box>

                    <Backdrop open={loading} sx={{ zIndex: 1300, color: '#000' }}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Box>
            </Dialog>

            <PINResetRequest
                open={showResetRequest}
                onClose={() => setShowResetRequest(false)}
                onCodeSent={handleCodeSent}
            />

            <PINResetVerify
                open={showResetVerify}
                onClose={() => setShowResetVerify(false)}
                onSuccess={handleResetSuccess}
                email={resetEmail}
            />
        </>
    );
};

PINVerify.defaultProps = {
    onCancel: () => console.warn('onCancel no proporcionado'),
    onVerify: () => console.warn('onVerify no proporcionado'),
};

export default PINVerify;