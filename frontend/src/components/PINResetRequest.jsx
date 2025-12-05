import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Alert, TextField,
    CircularProgress, InputAdornment, Paper, Fade, Slide,
    IconButton  // ¡FALTA ESTE IMPORT!
} from '@mui/material';
import { Email, Security, Send, Close } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
 100% { transform: scale(1); }
`;

// Componentes estilizados
const MinimalPaper = styled(Paper)({
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
});

const MinimalTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderColor: 'rgba(0, 0, 0, 0.12)'
        },
        '&.Mui-focused': {
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.08)'
        }
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 500
    }
});

const MinimalButton = styled(Button)(({ variant, disabled }) => ({
    borderRadius: '12px',
    padding: '14px 28px',
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    border: variant === 'outlined' ? '2px solid #000' : 'none',
    backgroundColor: variant === 'contained' ? '#000' : 'transparent',
    color: variant === 'contained' ? '#fff' : '#000',
    fontSize: '0.95rem',
    position: 'relative',
    overflow: 'hidden',
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
    },
    '&::after': disabled ? {} : {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: variant === 'contained' ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' : 'none',
        animation: variant === 'contained' ? `${shimmer} 3s infinite` : 'none'
    }
}));

const PINResetRequest = ({ open, onClose, onCodeSent }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Por favor ingresa tu email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Por favor ingresa un email válido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/biometric/request-pin-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(`Código enviado a ${data.email}`);
                setTimeout(() => {
                    onCodeSent && onCodeSent(email);
                    onClose && onClose();
                }, 2000);
            } else {
                setError(data.message);
            }

        } catch (error) {
            console.error('Error solicitando restablecimiento:', error);
            setError('Error de conexión. Verifica tu internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperComponent={MinimalPaper}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
        >
            <Box sx={{ position: 'relative', p: 3 }}>
                <IconButton
                    onClick={onClose}
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
                        Restablecer PIN
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                        Ingresa tu email para recibir un código de verificación
                    </Typography>
                </Box>

                {error && (
                    <Fade in>
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
                    </Fade>
                )}

                {success && (
                    <Fade in>
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
                    </Fade>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <MinimalTextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                        autoFocus
                    />

                    <Box sx={{ 
                        p: 2, 
                        mb: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Te enviaremos un código de verificación de 6 dígitos que expira en 15 minutos.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <MinimalButton
                            variant="outlined"
                            onClick={onClose}
                            disabled={loading}
                            sx={{ flex: 1 }}
                        >
                            Cancelar
                        </MinimalButton>
                        
                        <MinimalButton
                            type="submit"
                            variant="contained"
                            disabled={loading || !email}
                            sx={{ flex: 1 }}
                            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Send />}
                        >
                            {loading ? 'Enviando...' : 'Enviar Código'}
                        </MinimalButton>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
};

export default PINResetRequest;