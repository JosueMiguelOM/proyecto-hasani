import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Alert, Link, Paper, Stack,
  Fade, Zoom, InputAdornment, IconButton, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Backdrop
} from '@mui/material';
import {
  Google, Visibility, VisibilityOff, Email, Lock,
  Security, ArrowBack, LocationOn, LocationOff,
  Fingerprint, Security as SecurityIcon, WifiOff, Wifi,
  CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PINSetup from '../PINSetup';
import PINVerify from '../PINVerify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('online');
  const [offlineCode, setOfflineCode] = useState('');
  const [locationDialog, setLocationDialog] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [savedToken, setSavedToken] = useState(null);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [showPINVerify, setShowPINVerify] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [requiresBiometric, setRequiresBiometric] = useState(false);
  const [hoverEmail, setHoverEmail] = useState(false);
  const [hoverPassword, setHoverPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const navigate = useNavigate();

  useEffect(() => {
    if (error && (form.email || form.password || otp)) {
      setError(null);
    }
  }, [form.email, form.password, otp]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
    
    setOtp(newDigits.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const checkBiometricStatus = async (token) => {
    try {
      const response = await fetch(`${API_URL}/biometric/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBiometricStatus(data);
        
        if (data.requiresSetup) {
          setShowPINSetup(true);
          setRequiresBiometric(true);
        } else if (data.biometricEnabled) {
          setShowPINVerify(true);
          setRequiresBiometric(true);
        } else {
          setLocationDialog(true);
        }
      } else {
        setLocationDialog(true);
      }
    } catch (error) {
      console.error('Error verificando estado biométrico:', error);
      setLocationDialog(true);
    }
  };

  const requestLocation = async (token) => {
    setLocationStatus('requesting');
    
    if (!navigator.geolocation) {
      console.log('Geolocalización no soportada');
      setLocationStatus('denied');
      setTimeout(() => navigate('/Usuarios'), 1500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.post(`${API_URL}/usuarios/ubicacion`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('userLocation', JSON.stringify(locationData));
          
          setLocationStatus('success');
          setSuccess('Ubicación guardada correctamente');
          
          setTimeout(() => {
            setLocationDialog(false);
            navigate('/Usuarios');
          }, 1500);
          
        } catch (error) {
          console.error('Error guardando ubicación:', error);
          try {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString(),
              offline: true
            };
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            
            const offlineQueue = JSON.parse(localStorage.getItem('offlineLocationQueue') || '[]');
            offlineQueue.push(locationData);
            localStorage.setItem('offlineLocationQueue', JSON.stringify(offlineQueue));
            
            setLocationStatus('success');
            setSuccess('Ubicación guardada offline');
          } catch (offlineError) {
            console.error('Error guardando ubicación offline:', offlineError);
            setLocationStatus('denied');
          }
          
          setTimeout(() => {
            setLocationDialog(false);
            navigate('/Usuarios');
          }, 1500);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        let errorMessage = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo agotado obteniendo ubicación';
            break;
          default:
            errorMessage = 'Error desconocido';
            break;
        }
        
        setLocationStatus('denied');
        setError(`Error de ubicación: ${errorMessage}`);
        
        setTimeout(() => {
          setLocationDialog(false);
          navigate('/Usuarios');
        }, 2000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const skipLocation = () => {
    setLocationDialog(false);
    navigate('/Usuarios');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      console.log('🔐 Iniciando login con:', { email: form.email });
      
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: form.email.trim(),
        password: form.password
      });
      
      console.log('✅ Respuesta del servidor:', res.data);
      setIsLoading(false);
      
      if (res.data.success && res.data.require2fa) {
        setUserId(res.data.userId);
        setAuthMode(res.data.mode || 'online');
        setStep(2);
        
        if (res.data.mode === 'offline') {
          setOfflineCode(res.data.offlineCode || '');
          setSuccess(res.data.message || '🔴 Modo offline - Usa el código mostrado');
          
          if (res.data.offlineCode) {
            console.log('🔑 Código offline:', res.data.offlineCode);
          }
        } else {
          setSuccess('✅ Código de verificación enviado a tu correo electrónico');
        }
      } else if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/Usuarios');
      } else {
        setError(res.data.message || 'Error desconocido en el login');
      }
      
    } catch (err) {
      setIsLoading(false);
      console.error('❌ Error en login:', err);
      
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('❌ Sin conexión a internet. El servidor no está disponible.');
      } else if (err.response?.status === 401) {
        setError('❌ Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (err.response?.status === 409) {
        setError(err.response?.data?.message || '⚠️ Ya existe una sesión activa.');
      } else {
        setError(err.response?.data?.message || 'Error de autenticación. Intenta nuevamente.');
      }
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!userId) {
      setError('❌ Error: No se encontró el ID de usuario. Inicia sesión nuevamente.');
      setStep(1);
      return;
    }
    
    const otpTrimmed = otpDigits.join('');
    if (!/^\d{4,6}$/.test(otpTrimmed)) {
      setError('❌ El código debe tener 4 o 6 dígitos numéricos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Verificando código 2FA:', {
        userId: userId,
        otpLength: otpTrimmed.length,
        mode: authMode
      });
      
      const res = await axios.post(`${API_URL}/auth/2fa/verify`, {
        userId: parseInt(userId),
        otp: otpTrimmed
      });
      
      console.log('✅ Verificación exitosa:', res.data);
      setIsLoading(false);
      
      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setSavedToken(res.data.token);
        setSuccess(`✅ ${res.data.message || 'Autenticación exitosa'}`);
        
        setTimeout(() => {
          checkBiometricStatus(res.data.token);
        }, 500);
      } else {
        setError(res.data.message || '❌ Error en la verificación');
      }
      
    } catch (err) {
      setIsLoading(false);
      console.error('❌ Error en verificación 2FA:', err);
      
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('❌ Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else if (err.response?.status === 400) {
        const errorData = err.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          setError(`❌ ${errorData.errors.join(', ')}`);
        } else {
          setError(errorData?.message || '❌ Datos inválidos. Verifica el código ingresado.');
        }
      } else if (err.response?.status === 401) {
        setError(err.response?.data?.message || '❌ Código incorrecto o expirado. Intenta nuevamente.');
      } else if (err.response?.status === 404) {
        setError('❌ Usuario no encontrado. Inicia sesión nuevamente.');
        setTimeout(() => {
          setStep(1);
          setOtpDigits(['', '', '', '', '', '']);
        }, 2000);
      } else {
        setError(err.response?.data?.message || '❌ Error verificando el código. Intenta nuevamente.');
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToLogin = () => {
    setStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setUserId(null);
    setError(null);
    setSuccess(null);
    setAuthMode('online');
    setOfflineCode('');
  };

  const handlePINSetupSuccess = () => {
    setShowPINSetup(false);
    setLocationDialog(true);
  };

  const handlePINVerifySuccess = () => {
    setShowPINVerify(false);
    setLocationDialog(true);
  };

  const handlePINCancel = () => {
    if (biometricStatus?.requiresSetup) {
      setError('Debes configurar el PIN de seguridad para continuar');
      setShowPINSetup(true);
    } else {
      setShowPINVerify(false);
      setError('Verificación de seguridad cancelada');
      localStorage.removeItem('token');
    }
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
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f0f0f0 0%, transparent 70%)',
        top: '-200px',
        right: '-200px',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f5f5f5 0%, transparent 70%)',
        bottom: '-150px',
        left: '-150px',
      }
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 },
          width: { xs: '90vw', sm: 400 },
          maxWidth: '100%',
          borderRadius: 2,
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Encabezado minimalista */}
          <Box textAlign="center" mb={3}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Typography 
                variant="h5" 
                fontWeight={800}
                sx={{ 
                  color: '#000000',
                  letterSpacing: '-0.5px',
                  mb: 0.5
                }}
              >
                Acceso
              </Typography>
            </motion.div>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.875rem' }}>
              {step === 1 ? 'Ingresa tus credenciales' : 'Verificación de seguridad'}
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

          {/* Alertas */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
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
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
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
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    fullWidth
                    margin="normal"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onMouseEnter={() => setHoverEmail(true)}
                    onMouseLeave={() => setHoverEmail(false)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: hoverEmail ? '#000' : '#666' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        borderColor: '#e0e0e0',
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000',
                      }
                    }}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <TextField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onMouseEnter={() => setHoverPassword(true)}
                    onMouseLeave={() => setHoverPassword(false)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: hoverPassword ? '#000' : '#666' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            disabled={isLoading}
                            sx={{ color: hoverPassword ? '#000' : '#666' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        borderColor: '#e0e0e0',
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000',
                      }
                    }}
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      py: 1.2,
                      borderRadius: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: '#000000',
                      color: '#ffffff',
                      textTransform: 'none',
                      '&:hover': {
                        background: '#333333',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      },
                      '&:disabled': {
                        background: '#cccccc'
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                    ) : (
                      'Continuar'
                    )}
                  </Button>
                </motion.div>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" sx={{ color: '#999', px: 2 }}>
                    o continuar con
                  </Typography>
                </Divider>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Google />}
                    sx={{ 
                      py: 1.2,
                      borderRadius: 1,
                      fontWeight: 500,
                      borderColor: '#e0e0e0',
                      color: '#666',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#000',
                        color: '#000',
                        background: 'transparent'
                      }
                    }}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    Google
                  </Button>
                </motion.div>

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                  <Link 
                    href="/forgot-password" 
                    underline="none"
                    sx={{ 
                      fontSize: '0.8rem',
                      color: '#666',
                      '&:hover': { color: '#000' }
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                  <Link 
                    href="/register" 
                    underline="none"
                    sx={{ 
                      fontSize: '0.8rem',
                      color: '#000',
                      fontWeight: 600,
                      '&:hover': { color: '#333' }
                    }}
                  >
                    Crear cuenta
                  </Link>
                </Stack>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="2fa-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handle2FA}>
                <Box textAlign="center" mb={3}>
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {authMode === 'offline' ? (
                      <WifiOff sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                    ) : (
                      <Security sx={{ fontSize: 48, color: '#000', mb: 2 }} />
                    )}
                  </motion.div>
                  
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#000' }}>
                    {authMode === 'offline' ? 'Modo sin conexión' : 'Verificación en dos pasos'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                    {authMode === 'offline' 
                      ? 'Ingresa el código proporcionado'
                      : 'Hemos enviado un código de verificación a tu correo.'}
                  </Typography>
                  
                  {authMode === 'offline' && offlineCode && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Box sx={{ 
                        bgcolor: '#fff3e0', 
                        p: 2, 
                        borderRadius: 1,
                        mb: 3,
                        border: '1px solid #ffe0b2'
                      }}>
                        <Typography variant="h6" sx={{ color: '#e65100', fontWeight: 700 }}>
                          {offlineCode}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#e65100', display: 'block', mt: 0.5 }}>
                          Expira en 10 minutos
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Box>

                {/* OTP Input con dígitos separados */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TextField
                        id={`otp-input-${index}`}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        inputProps={{
                          maxLength: 1,
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'center', fontSize: '1.2rem' }
                        }}
                        sx={{
                          width: 45,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '&.Mui-focused fieldset': {
                              borderColor: '#000',
                              borderWidth: '2px'
                            }
                          }
                        }}
                        disabled={isLoading}
                      />
                    </motion.div>
                  ))}
                </Box>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    variant="contained"
                    fullWidth 
                    sx={{ 
                      mt: 2,
                      py: 1.2,
                      borderRadius: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: authMode === 'offline' ? '#ff9800' : '#000',
                      color: '#ffffff',
                      textTransform: 'none',
                      '&:hover': {
                        background: authMode === 'offline' ? '#f57c00' : '#333'
                      }
                    }}
                    disabled={isLoading || otpDigits.join('').length < 4}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ x: -3 }}
                >
                  <Button
                    fullWidth
                    startIcon={<ArrowBack />}
                    sx={{ 
                      mt: 1.5,
                      borderRadius: 1,
                      color: '#666',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#000',
                        background: 'transparent'
                      }
                    }}
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                  >
                    Volver
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* Pie de página minimalista */}
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center' 
          }}>
            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} Sistema de seguridad
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Dialog de Ubicación - Rediseñado */}
      <Dialog 
        open={locationDialog} 
        onClose={skipLocation}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <LocationOn sx={{ fontSize: 48, color: '#000', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
              Ubicación
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ color: '#666', mb: 2 }}>
              Permite el acceso a tu ubicación para una mejor experiencia
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              textAlign: 'left',
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ color: '#333', mb: 1, display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                Mostrar contenido relevante a tu zona
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1, display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                Funcionamiento offline
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                Datos guardados localmente
              </Typography>
            </Box>

            {locationStatus === 'requesting' && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <CircularProgress size={24} sx={{ color: '#000' }} />
                <Typography sx={{ color: '#666' }}>Obteniendo ubicación...</Typography>
              </Box>
            )}

            {locationStatus === 'success' && (
              <Alert 
                severity="success"
                sx={{ 
                  mb: 2,
                  borderRadius: 1,
                  background: '#e8f5e9',
                  color: '#2e7d32'
                }}
              >
                Ubicación guardada
              </Alert>
            )}

            {locationStatus === 'denied' && (
              <Alert 
                severity="warning"
                sx={{ 
                  mb: 2,
                  borderRadius: 1,
                  background: '#fff3e0',
                  color: '#e65100'
                }}
              >
                Ubicación no disponible
              </Alert>
            )}

            <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
              Puedes cambiar los permisos en configuración
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={skipLocation}
                variant="outlined"
                sx={{ 
                  borderRadius: 1,
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#000',
                    color: '#000'
                  }
                }}
                disabled={locationStatus === 'requesting'}
              >
                Omitir
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => requestLocation(savedToken)}
                variant="contained"
                startIcon={locationStatus === 'requesting' ? null : <LocationOn />}
                sx={{ 
                  borderRadius: 1,
                  background: '#000',
                  color: '#fff',
                  '&:hover': {
                    background: '#333'
                  }
                }}
                disabled={locationStatus === 'requesting' || locationStatus === 'success'}
              >
                {locationStatus === 'requesting' ? (
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                ) : (
                  'Permitir'
                )}
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Componentes biométricos (mantener funcionalidad) */}
      <PINSetup
        open={showPINSetup}
        onClose={() => setShowPINSetup(false)}
        onSuccess={handlePINSetupSuccess}
        requiresSetup={biometricStatus?.requiresSetup || false}
      />

      <PINVerify
        open={showPINVerify}
        onVerify={handlePINVerifySuccess}
        onCancel={handlePINCancel}
      />

      <Backdrop open={isLoading} sx={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        color: '#000',
        zIndex: (theme) => theme.zIndex.drawer + 1 
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={40} sx={{ color: '#000' }} />
        </motion.div>
      </Backdrop>
    </Box>
  );
};

export default Login;