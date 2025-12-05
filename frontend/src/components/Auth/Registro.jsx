import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, Alert, Paper, Link, Stack,
  Grow, Slide, InputAdornment, CircularProgress, IconButton
} from '@mui/material';
import { 
  Email, Person, Lock, Visibility, VisibilityOff, ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const [form, setForm] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    rol: 'lector'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoverField, setHoverField] = useState({ nombre: false, email: false, password: false });
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      setIsLoading(false);
      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Error en el registro. Por favor, intenta nuevamente.');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFieldHover = (field, isHovering) => {
    setHoverField(prev => ({ ...prev, [field]: isHovering }));
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength === 0) return '#e0e0e0';
    if (strength <= 25) return '#ff5252';
    if (strength <= 50) return '#ff9800';
    if (strength <= 75) return '#ffeb3b';
    return '#4caf50';
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
        top: '-150px',
        left: '-150px',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f5f5f5 0%, transparent 70%)',
        bottom: '-100px',
        right: '-100px',
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
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{ 
                color: '#000000',
                letterSpacing: '-0.5px',
                mb: 0.5
              }}
            >
              Crear Cuenta
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.875rem' }}>
              Completa tus datos para registrarte
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
            {/* Campo Nombre */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                label="Nombre completo"
                fullWidth
                required
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                onMouseEnter={() => handleFieldHover('nombre', true)}
                onMouseLeave={() => handleFieldHover('nombre', false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: hoverField.nombre ? '#000' : '#666' }} />
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
                disabled={isLoading}
              />
            </Box>

            {/* Campo Email */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onMouseEnter={() => handleFieldHover('email', true)}
                onMouseLeave={() => handleFieldHover('email', false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: hoverField.email ? '#000' : '#666' }} />
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
                disabled={isLoading}
              />
            </Box>

            {/* Campo Contraseña */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onMouseEnter={() => handleFieldHover('password', true)}
                onMouseLeave={() => handleFieldHover('password', false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: hoverField.password ? '#000' : '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: hoverField.password ? '#000' : '#666' }}
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
                disabled={isLoading}
              />
              
              {/* Indicador de fortaleza de contraseña */}
              {form.password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 0.5
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Fortaleza de la contraseña:
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: getPasswordStrengthColor(passwordStrength(form.password))
                    }}>
                      {passwordStrength(form.password)}%
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
                      width: `${passwordStrength(form.password)}%`,
                      bgcolor: getPasswordStrengthColor(passwordStrength(form.password)),
                      transition: 'all 0.3s ease'
                    }} />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Lista de requisitos de contraseña */}
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              mb: 3,
              animation: form.password ? 'fadeIn 0.3s ease' : 'none',
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
                  color: form.password.length >= 8 ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                  Al menos 8 caracteres
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: /[A-Z]/.test(form.password) ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                  Una letra mayúscula
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: /[0-9]/.test(form.password) ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                  Un número
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: /[^A-Za-z0-9]/.test(form.password) ? '#4caf50' : '#999',
                  display: 'flex', 
                  alignItems: 'center',
                }}>
                  <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                  Un carácter especial
                </Typography>
              </Box>
            </Box>

            {/* Información del rol */}
            <Box sx={{ 
              bgcolor: '#e8f5e9', 
              p: 1.5, 
              borderRadius: 1,
              mb: 3,
              border: '1px solid #c8e6c9'
            }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                Tu cuenta será creada como <strong style={{ margin: '0 4px' }}>Lector</strong> por defecto
              </Typography>
            </Box>

            {/* Campo de rol oculto */}
            <input type="hidden" name="rol" value="lector" />
            
            {/* Botón de registro */}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 2,
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
              disabled={isLoading || !form.nombre || !form.email || !form.password}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            {/* Enlace para volver al login */}
            <Stack direction="row" justifyContent="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
              <Link 
                href="/" 
                underline="none"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#666',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#000',
                    transform: 'translateX(-3px)'
                  }
                }}
              >
                <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Stack>

            {/* Información de privacidad */}
            <Typography variant="caption" sx={{ 
              color: '#999', 
              display: 'block', 
              textAlign: 'center', 
              mt: 2,
              fontSize: '0.75rem'
            }}>
              Al registrarte, aceptas nuestros términos y condiciones de uso.
            </Typography>
          </form>
        </Paper>
      </Grow>
    </Box>
  );
};

export default Register;