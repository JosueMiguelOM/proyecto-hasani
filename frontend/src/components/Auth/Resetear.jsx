import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Grow,
  Slide,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Lock as LockIcon, 
  Check as CheckIcon, 
  Warning as WarningIcon,
  Visibility,
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setTokenInfo({
          userId: decoded.userId,
          type: decoded.type,
          timestamp: new Date(decoded.timestamp),
          expires: new Date(decoded.exp * 1000),
          adminRequest: decoded.adminRequest || false
        });
        
        console.log('🔐 INFORMACIÓN DEL TOKEN:');
        console.log(`👤 User ID: ${decoded.userId}`);
        console.log(`📝 Tipo: ${decoded.type}`);
        console.log(`🕒 Emitido: ${new Date(decoded.timestamp).toLocaleString()}`);
        console.log(`⏰ Expira: ${new Date(decoded.exp * 1000).toLocaleString()}`);
        console.log(`👑 Admin: ${decoded.adminRequest ? 'SÍ' : 'NO'}`);
        
      } catch (error) {
        setError('Token inválido o malformado');
        console.error('❌ Error decodificando token:', error);
      }
    } else {
      setError('No se proporcionó token de restablecimiento');
    }
  }, [token]);

  // Calcular fortaleza de contraseña
  useEffect(() => {
    const calculateStrength = (password) => {
      if (password.length === 0) return 0;
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return strength;
    };
    
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrengthColor = (strength) => {
    if (strength === 0) return '#e0e0e0';
    if (strength <= 25) return '#ff5252';
    if (strength <= 50) return '#ff9800';
    if (strength <= 75) return '#ffeb3b';
    return '#4caf50';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token de restablecimiento no válido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess('Contraseña restablecida exitosamente');
        console.log('✅ Contraseña cambiada exitosamente');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al restablecer contraseña';
      setError(errorMsg);
      console.error('❌ Error restableciendo contraseña:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTokenExpired = () => {
    if (!tokenInfo) return false;
    return new Date() > tokenInfo.expires;
  };

  const getTimeRemaining = () => {
    if (!tokenInfo) return 'N/A';
    const now = new Date();
    const diff = tokenInfo.expires - now;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes <= 0 && seconds <= 0) return 'Expirado';
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getExpirationColor = () => {
    const remaining = getTimeRemaining();
    if (remaining === 'Expirado') return '#c62828';
    if (remaining.includes('m') && parseInt(remaining) <= 5) return '#ff9800';
    return '#4caf50';
  };

  // Estados de error sin token
  if (!token) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Grow in={true}>
          <Paper elevation={0} sx={{
            p: 4,
            width: 400,
            maxWidth: '90%',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <WarningIcon sx={{ fontSize: 48, color: '#c62828', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 2 }}>
              Token no válido
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              No se proporcionó token de restablecimiento válido
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ 
                background: '#000',
                color: '#fff',
                borderRadius: 1,
                '&:hover': { background: '#333' }
              }}
            >
              Volver al inicio
            </Button>
          </Paper>
        </Grow>
      </Box>
    );
  }

  if (isTokenExpired()) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Grow in={true}>
          <Paper elevation={0} sx={{
            p: 4,
            width: 400,
            maxWidth: '90%',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <WarningIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 2 }}>
              Token Expirado
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              El enlace de restablecimiento ha caducado
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/forgot-password')}
              sx={{ 
                background: '#000',
                color: '#fff',
                borderRadius: 1,
                '&:hover': { background: '#333' }
              }}
            >
              Solicitar nuevo enlace
            </Button>
          </Paper>
        </Grow>
      </Box>
    );
  }

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
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f0f0f0 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
      }
    }}>
      <Grow in={true} timeout={600}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 },
          width: { xs: '90vw', sm: 450 },
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
            <LockIcon sx={{ fontSize: 48, color: '#000', mb: 2 }} />
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{ 
                color: '#000000',
                letterSpacing: '-0.5px',
                mb: 1
              }}
            >
              Nueva Contraseña
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.875rem' }}>
              Crea una nueva contraseña para tu cuenta
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

          {/* Información del token */}
          {tokenInfo && (
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              mb: 3,
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                  Enlace válido por:
                </Typography>
                <Chip 
                  label={getTimeRemaining()}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    background: getExpirationColor(),
                    color: '#fff'
                  }}
                />
              </Box>
              
              {tokenInfo.adminRequest && (
                <Box sx={{ 
                  bgcolor: '#e3f2fd', 
                  p: 1, 
                  borderRadius: 0.5,
                  mt: 1,
                  border: '1px solid #bbdefb'
                }}>
                  <Typography variant="caption" sx={{ color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    Solicitud administrador
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Alertas */}
          <Slide in={!!error || !!success} direction="down" mountOnEnter unmountOnExit>
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
              {success && (
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
              )}
            </Box>
          </Slide>

          <form onSubmit={handleSubmit}>
            {/* Campo Nueva Contraseña */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                        sx={{ color: '#666' }}
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
                  }
                }}
                disabled={loading}
              />
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Seguridad:
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: getPasswordStrengthColor(passwordStrength)
                    }}>
                      {passwordStrength}%
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    height: 4, 
                    width: '100%', 
                    bgcolor: '#e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      height: '100%',
                      width: `${passwordStrength}%`,
                      bgcolor: getPasswordStrengthColor(passwordStrength),
                      transition: 'all 0.3s ease'
                    }} />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Campo Confirmar Contraseña */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                        sx={{ color: '#666' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    borderColor: formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? '#c62828' : '#e0e0e0',
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
                disabled={loading}
              />
            </Box>

            {/* Lista de requisitos */}
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              mb: 3,
              animation: formData.password ? 'fadeIn 0.3s ease' : 'none',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontWeight: 500 }}>
                La contraseña debe contener:
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: formData.password.length >= 6 ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <CheckIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Al menos 6 caracteres
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <CheckIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Las contraseñas coinciden
                </Typography>
              </Box>
            </Box>

            {/* Botón de restablecimiento */}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading || isTokenExpired()}
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
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                  Restableciendo...
                </>
              ) : (
                <>
                  <CheckIcon sx={{ fontSize: 18, mr: 1 }} />
                  Restablecer Contraseña
                </>
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" sx={{ color: '#999', px: 1 }}>
                o
              </Typography>
            </Divider>

            {/* Enlace para problemas */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                ¿Problemas con el restablecimiento?
              </Typography>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/forgot-password')}
                sx={{ 
                  color: '#000',
                  textTransform: 'none',
                  '&:hover': { background: 'transparent' }
                }}
              >
                Solicitar nuevo enlace
              </Button>
            </Box>

            {/* Enlace para volver al login */}
            <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
              <Button 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#666',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#000',
                    background: 'transparent',
                    transform: 'translateX(-3px)'
                  }
                }}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          </form>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ResetPassword;