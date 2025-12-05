import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Alert, Paper, Link, Stack,
  Grow, Slide, InputAdornment, CircularProgress, IconButton
} from '@mui/material';
import { Email, ArrowBack, Send, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoverEmail, setHoverEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMsg('');
    setIsLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setIsLoading(false);
      setMsg('Si el email existe, se enviará un enlace para restablecer la contraseña.');
      setTimeout(() => navigate('/'), 4000);
    } catch (err) {
      setIsLoading(false);
      setError('Error enviando email. Por favor, intenta nuevamente.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f0f0f0 0%, transparent 70%)',
        bottom: '-150px',
        right: '-150px',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f5f5f5 0%, transparent 70%)',
        top: '-100px',
        left: '-100px',
      }
    }}>
      <Grow in={true} timeout={600}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 },
          width: { xs: '90vw', sm: 420 },
          maxWidth: '100%',
          borderRadius: 2,
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Encabezado */}
          <Box textAlign="center" mb={3}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <Email sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
            
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{ 
                color: '#000000',
                letterSpacing: '-0.5px',
                mb: 0.5
              }}
            >
              Recuperar Acceso
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.875rem' }}>
              Te enviaremos un enlace para restablecer tu contraseña
            </Typography>
          </Box>

          {/* Línea decorativa */}
          <Box sx={{ 
            height: '2px', 
            background: 'linear-gradient(90deg, transparent 0%, #000 50%, transparent 100%)',
            mb: 3,
            mx: 'auto',
            width: '60px'
          }} />

          {/* Información importante */}
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3,
            border: '1px solid #e0e0e0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Info sx={{ fontSize: 18, color: '#666', mt: 0.2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block', mb: 0.5 }}>
                  ¿Qué esperar?
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  • Un enlace será enviado a tu correo electrónico
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  • El enlace expira en 15 minutos
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  • Sigue las instrucciones en el correo
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Alertas */}
          <Slide in={!!error || !!msg} direction="down" mountOnEnter unmountOnExit>
            <Box>
              {error && (
                <Alert 
                  severity="error"
                  sx={{ 
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid #ffebee',
                    background: '#ffebee',
                    color: '#c62828',
                    '& .MuiAlert-icon': { color: '#c62828' }
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}
              {msg && (
                <Alert 
                  severity="success"
                  sx={{ 
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid #e8f5e9',
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    '& .MuiAlert-icon': { color: '#2e7d32' }
                  }}
                >
                  {msg}
                </Alert>
              )}
            </Box>
          </Slide>

          <form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onMouseEnter={() => setHoverEmail(true)}
                onMouseLeave={() => setHoverEmail(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: hoverEmail ? '#000' : '#666' }} />
                    </InputAdornment>
                  ),
                }}
                error={email.length > 0 && !validateEmail(email)}
                helperText={email.length > 0 && !validateEmail(email) ? 'Ingresa un email válido' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    borderColor: '#e0e0e0',
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666',
                    '&.Mui-focused': {
                      color: '#000',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#c62828',
                    fontSize: '0.75rem'
                  }
                }}
                disabled={isLoading}
              />
            </Box>

            {/* Botón de envío */}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 1,
                mb: 2,
                py: 1.2,
                borderRadius: 1,
                fontSize: '0.9rem',
                fontWeight: 600,
                background: '#000000',
                color: '#ffffff',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#333333',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&:disabled': {
                  background: '#cccccc',
                  color: '#999999'
                }
              }}
              disabled={isLoading || !validateEmail(email)}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send sx={{ fontSize: 18, mr: 1 }} />
                  Enviar Enlace de Recuperación
                </>
              )}
            </Button>

            <Box sx={{ 
              bgcolor: '#fff3e0', 
              p: 1.5, 
              borderRadius: 1,
              mb: 3,
              border: '1px solid #ffe0b2',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.8 }
              }
            }}>
              <Typography variant="caption" sx={{ color: '#e65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info sx={{ fontSize: 14, mr: 0.5 }} />
                El enlace será válido por 60 minutos
              </Typography>
            </Box>

            {/* Enlace para volver al login */}
            <Stack direction="row" justifyContent="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
              <Link 
                onClick={() => navigate('/')}
                underline="none"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#666',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#000',
                    transform: 'translateX(-3px)'
                  }
                }}
              >
                <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
                Volver al inicio de sesión
              </Link>
            </Stack>

            {/* Información de seguridad */}
            <Typography variant="caption" sx={{ 
              color: '#999', 
              display: 'block', 
              textAlign: 'center', 
              mt: 2,
              fontSize: '0.75rem',
              lineHeight: 1.4
            }}>
              Por seguridad, no compartas el enlace de recuperación con nadie.
              Si no recibes el email, verifica tu carpeta de spam.
            </Typography>
          </form>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ForgotPassword;