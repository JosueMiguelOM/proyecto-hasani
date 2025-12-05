import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  AppBar,
  Toolbar,
  Tooltip,
  Avatar,
  Divider,
  Grid,
  InputAdornment,
  Collapse,
  AlertTitle,
  Fade,
  Backdrop,
  Badge,
  alpha,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  ContactPhone as ContactPhoneIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Logout as LogoutIcon,
  Games as GamesIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuración de validaciones (sin cambios)
const VALIDACIONES = {
  nombre: {
    minLength: 2,
    maxLength: 400,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\&\.\,\(\)\d]+$/,
    mensajeError: 'El nombre debe contener solo letras, números, espacios y los siguientes caracteres: - & . , ( )',
    placeholder: 'Ej: Distribuidora ABC S.A. (2-100 caracteres)'
  },
  contacto: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\.]+$/,
    mensajeError: 'El nombre de contacto debe contener solo letras y espacios',
    placeholder: 'Ej: Juan Pérez (2-50 caracteres)'
  },
 telefono: {
  minLength: 7, 
  maxLength: 12,
  pattern: /^\+\d{1,4}\d{7,12}$/,
  mensajeError: 'El teléfono debe tener entre 7 y 12 dígitos después de la lada',
  placeholder: 'Selecciona lada y escribe teléfono'
},
  email: {
    minLength: 5,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    mensajeError: 'El formato del email no es válido',
    placeholder: 'contacto@empresa.com (5-100 caracteres)'
  },
  direccion: {
    minLength: 5,
    maxLength: 200,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\#\.\,\d]+$/,
    mensajeError: 'La dirección debe contener solo letras, números, espacios y los caracteres: - # . ,',
    placeholder: 'Calle, número, colonia, ciudad... (5-200 caracteres)'
  }
};

// Componente de notificaciones (versión simplificada)
const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <IconButton
      onClick={handleClick}
      sx={{ 
        position: 'relative',
        bgcolor: 'transparent',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
      }}
    >
      <Badge 
        badgeContent={0} 
        color="error" 
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.6rem',
            height: 18,
            minWidth: 18
          }
        }}
      >
        <NotificationsIcon sx={{ color: '#000' }} />
      </Badge>
    </IconButton>
  );
};

// Función de validación robusta (sin cambios)
const validarCampo = (campo, valor) => {
  const config = VALIDACIONES[campo];
  if (!config) return { valido: true, mensaje: '' };

  // Si el campo es opcional y está vacío, es válido
  if (!valor.trim() && campo !== 'nombre') {
    return { valido: true, mensaje: '' };
  }

  // Validar longitud mínima
  if (valor.length < config.minLength) {
    return { 
      valido: false, 
      mensaje: `Mínimo ${config.minLength} caracteres requeridos` 
    };
  }

  // Validar longitud máxima
  if (valor.length > config.maxLength) {
    return { 
      valido: false, 
      mensaje: `Máximo ${config.maxLength} caracteres permitidos` 
    };
  }

  // Validar patrón si existe
  if (config.pattern && !config.pattern.test(valor)) {
    return { 
      valido: false, 
      mensaje: config.mensajeError 
    };
  }

  return { valido: true, mensaje: '' };
};

// Función para sanitizar entrada (sin cambios)
const sanitizarEntrada = (valor, maxLength = 100) => {
  if (typeof valor !== 'string') return '';
  
  let sanitized = valor
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/'/g, '')
    .replace(/"/g, '');
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

const Proveedores = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoProveedor, setEditandoProveedor] = useState(null);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    lada: '+52',
    numeroTelefono: '',
    contacto: '',
    email: '',
    direccion: ''
  });

  const [erroresValidacion, setErroresValidacion] = useState({
    nombre: '',
    telefono: '',
    contacto: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => {
        setUser(null);
      });
    }
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventario/proveedores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProveedores(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || 'Error al cargar proveedores');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (mensaje, tipo) => {
    if (tipo === 'success') {
      setSuccess(mensaje);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(mensaje);
      setTimeout(() => setError(null), 5000);
    }
  };

  const validarCampoEnTiempoReal = (campo, valor) => {
    const resultado = validarCampo(campo, valor);
    setErroresValidacion(prev => ({
      ...prev,
      [campo]: resultado.mensaje
    }));
    return resultado.valido;
  };

  const handleCampoChange = (campo, valor) => {
    const valorSanitizado = sanitizarEntrada(valor, VALIDACIONES[campo]?.maxLength || 100);
    validarCampoEnTiempoReal(campo, valorSanitizado);
    setFormData(prev => ({
      ...prev,
      [campo]: valorSanitizado
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    let esValido = true;

    const nombreValido = validarCampoEnTiempoReal('nombre', formData.nombre);
    if (!nombreValido) {
      nuevosErrores.nombre = erroresValidacion.nombre;
      esValido = false;
    }

    if (formData.contacto.trim()) {
      const contactoValido = validarCampoEnTiempoReal('contacto', formData.contacto);
      if (!contactoValido) {
        nuevosErrores.contacto = erroresValidacion.contacto;
        esValido = false;
      }
    }

    if (formData.telefono.trim()) {
      const telefonoValido = validarCampoEnTiempoReal('telefono', formData.telefono);
      if (!telefonoValido) {
        nuevosErrores.telefono = erroresValidacion.telefono;
        esValido = false;
      }
    }

    if (formData.email.trim()) {
      const emailValido = validarCampoEnTiempoReal('email', formData.email);
      if (!emailValido) {
        nuevosErrores.email = erroresValidacion.email;
        esValido = false;
      }
    }

    if (formData.direccion.trim()) {
      const direccionValido = validarCampoEnTiempoReal('direccion', formData.direccion);
      if (!direccionValido) {
        nuevosErrores.direccion = erroresValidacion.direccion;
        esValido = false;
      }
    }

    setErroresValidacion(nuevosErrores);
    return esValido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editandoProveedor) {
        const response = await axios.put(
          `${API_URL}/inventario/proveedores/${editandoProveedor.id_proveedor}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          mostrarMensaje('Proveedor actualizado exitosamente', 'success');
          setEditandoProveedor(null);
        } else {
          mostrarMensaje(response.data.message || 'Error al actualizar proveedor', 'error');
        }
      } else {
        const response = await axios.post(
          `${API_URL}/inventario/proveedores`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          mostrarMensaje('Proveedor creado exitosamente', 'success');
        } else {
          mostrarMensaje(response.data.message || 'Error al crear proveedor', 'error');
        }
      }
      
      await cargarProveedores();
      cerrarFormulario();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Error al guardar proveedor';
      mostrarMensaje(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirFormularioNuevo = () => {
    setFormData({
      nombre: '',
      telefono: '',
      lada: '+52',
      numeroTelefono: '',
      contacto: '',
      email: '',
      direccion: ''
    });
    setErroresValidacion({
      nombre: '',
      telefono: '',
      contacto: '',
      email: '',
      direccion: ''
    });
    setEditandoProveedor(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (proveedor) => {
    let lada = '+52';
    let numeroTelefono = '';
    
    if (proveedor.telefono) {
      const match = proveedor.telefono.match(/^(\+\d+)(\d+)$/);
      if (match) {
        lada = match[1];
        numeroTelefono = match[2];
      }
    }
    
    setFormData({
      nombre: proveedor.nombre || '',
      telefono: proveedor.telefono || '',
      lada: lada,
      numeroTelefono: numeroTelefono,
      contacto: proveedor.contacto || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || ''
    });
    setEditandoProveedor(proveedor);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setEditandoProveedor(null);
    setFormData({
      nombre: '',
      telefono: '',
      lada: '+52',
      numeroTelefono: '',
      contacto: '',
      email: '',
      direccion: ''
    });
    setErroresValidacion({
      nombre: '',
      telefono: '',
      contacto: '',
      email: '',
      direccion: ''
    });
  };

  const getInitials = (nombre) => {
    if (!nombre) return '??';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (nombre) => {
    const colors = [
      '#007aff', '#5856d6', '#ff2d55', '#ff9500', 
      '#34c759', '#5ac8fa', '#ffcc00', '#af52de'
    ];
    const index = nombre.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBorderColor = (campo) => {
    if (erroresValidacion[campo]) return '#ff3b30';
    if (formData[campo] && !erroresValidacion[campo]) return '#34c759';
    return '#c7c7cc';
  };

  const getValidationIcon = (campo) => {
    if (erroresValidacion[campo]) {
      return <ErrorIcon sx={{ color: '#ff3b30' }} fontSize="small" />;
    }
    if (formData[campo] && !erroresValidacion[campo]) {
      return <CheckCircleIcon sx={{ color: '#34c759' }} fontSize="small" />;
    }
    return null;
  };

  const getHelperText = (campo) => {
    const config = VALIDACIONES[campo];
    if (!config) return '';
    
    if (erroresValidacion[campo]) {
      return erroresValidacion[campo];
    }
    
    const length = formData[campo]?.length || 0;
    const maxLength = config.maxLength;
    
    if (campo === 'nombre') {
      return `${length}/${maxLength} caracteres (requerido)`;
    }
    
    return length > 0 ? `${length}/${maxLength} caracteres` : '(opcional)';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },
    appBar: {
      bgcolor: '#fff',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    },
    title: {
      fontWeight: 700,
      color: '#000',
      letterSpacing: '-0.5px'
    },
    messageContainer: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '1000',
      animation: 'slideIn 0.3s ease-out'
    },
    message: {
      padding: '16px 24px',
      backgroundColor: '#000',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  };

  return (
    <Box sx={styles.container}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { max-height: 0; opacity: 0; }
          to { max-height: 500px; opacity: 1; }
        }
      `}</style>
      
      {error && (
        <Box sx={styles.messageContainer}>
          <Box sx={styles.message}>
            ❌ {error}
          </Box>
        </Box>
      )}
      
      {success && (
        <Box sx={styles.messageContainer}>
          <Box sx={styles.message}>
            ✅ {success}
          </Box>
        </Box>
      )}

      {/* AppBar moderno */}
      <AppBar position="sticky" elevation={0} sx={styles.appBar}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <GamesIcon sx={{ color: '#000', fontSize: 28 }} />
            <Typography variant="h6" sx={styles.title}>
              GameStore Admin
            </Typography>
            <Chip 
              label="Beta" 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: 'rgba(0,122,255,0.1)',
                color: '#007aff',
                border: 'none'
              }}
            />
          </Box>
          
          <NotificationBell />

          {user && (
            <>
              {/* Menú de navegación rápido */}
              <Stack direction="row" spacing={1} sx={{ mr: 3 }}>
                <Tooltip title="Usuarios">
                  <IconButton 
                    onClick={() => navigate('/Usuarios')}
                    sx={{ 
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <PersonIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Tienda">
                  <IconButton 
                    onClick={() => navigate('/shop')}
                    sx={{ 
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <StoreIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Reportes">
                  <IconButton 
                    onClick={() => navigate('/reportes')}
                    sx={{ 
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <TrendingUpIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Perfil de usuario */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 3,
                px: 2,
                py: 0.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
              }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getAvatarColor(user.nombre || ''),
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(user.nombre || '')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }}>
                    {user.nombre?.split(' ')[0] || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', display: 'block' }}>
                    {user.rol || 'Sin rol'}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={handleLogout}
                  sx={{ color: '#000' }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && proveedores.length === 0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Contenido principal */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header con título */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              color: '#000',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Gestión de Proveedores
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.6)', maxWidth: 600 }}>
            Administra la información de tus proveedores para mantener un inventario eficiente
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Fade in={proveedores.length > 0}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: '#fff',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'rgba(0,0,0,0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          mb: 1
                        }}
                      >
                        Total
                      </Typography>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 800, 
                          color: '#000',
                          fontSize: '3rem',
                          lineHeight: 1
                        }}
                      >
                        {proveedores.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.1)',
                        color: '#000'
                      }}
                    >
                      <LocalShippingIcon />
                    </Box>
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(0,0,0,0.5)', 
                      display: 'block',
                      mt: 2
                    }}
                  >
                    Proveedores registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Panel de acciones */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
            Todos los Proveedores
            <Typography component="span" sx={{ color: 'rgba(0,0,0,0.5)', ml: 1, fontWeight: 400 }}>
              ({proveedores.length} registrados)
            </Typography>
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarProveedores}
              disabled={loading}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Actualizar
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirFormularioNuevo}
              disabled={loading}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1a1a1a',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }
              }}
            >
              Nuevo Proveedor
            </Button>
          </Stack>
        </Box>

        {/* Tabla de proveedores moderna */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#fff',
            overflow: 'hidden'
          }}
        >
          {loading && proveedores.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#000' }} />
            </Box>
          ) : proveedores.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalShippingIcon sx={{ fontSize: 64, color: 'rgba(0,0,0,0.1)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.5)', mb: 1, fontWeight: 600 }}>
                No hay proveedores registrados
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.4)', mb: 3 }}>
                Comienza agregando tu primer proveedor
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={abrirFormularioNuevo}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Agregar Proveedor
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Proveedor</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Información</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Fecha Registro</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000', py: 2 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proveedores.map((proveedor) => (
                    <TableRow
                      key={proveedor.id_proveedor}
                      hover
                      sx={{
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: getAvatarColor(proveedor.nombre),
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                          >
                            {getInitials(proveedor.nombre)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', mb: 0.5 }}>
                              {proveedor.nombre}
                            </Typography>
                            {proveedor.direccion && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                                  {proveedor.direccion.length > 50 
                                    ? `${proveedor.direccion.substring(0, 50)}...`
                                    : proveedor.direccion}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {proveedor.contacto ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <PersonIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                              {proveedor.contacto}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.3)' }}>
                            Sin contacto
                          </Typography>
                        )}
                        {proveedor.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                              {proveedor.telefono}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {proveedor.email ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                              {proveedor.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.3)' }}>
                            Sin email
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                          {formatearFecha(proveedor.fecha_registro)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={proveedor.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            bgcolor: proveedor.activo ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                            color: proveedor.activo ? '#34c759' : '#ff3b30',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Editar proveedor">
                            <IconButton
                              size="small"
                              onClick={() => abrirFormularioEditar(proveedor)}
                              sx={{ 
                                color: 'rgba(0,0,0,0.5)',
                                '&:hover': { 
                                  color: '#007aff',
                                  bgcolor: 'rgba(0,122,255,0.1)'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Botones de navegación inferiores */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/Usuarios')}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Volver a Usuarios
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<StoreIcon />}
              onClick={() => navigate('/shop')}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Ir a la Tienda
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/reportes')}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Ver Reportes
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* Formulario Modal moderno */}
      <Dialog
        open={mostrarFormulario}
        onClose={cerrarFormulario}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#000' }}>
            {editandoProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', mt: 0.5 }}>
            {editandoProveedor ? 'Modifica los datos del proveedor' : 'Completa la información del nuevo proveedor'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nombre de la Empresa"
                variant="outlined"
                required
                value={formData.nombre}
                onChange={(e) => handleCampoChange('nombre', e.target.value)}
                placeholder={VALIDACIONES.nombre.placeholder}
                error={!!erroresValidacion.nombre}
                helperText={getHelperText('nombre')}
                inputProps={{ 
                  maxLength: VALIDACIONES.nombre.maxLength,
                  pattern: VALIDACIONES.nombre.pattern.source
                }}
                InputProps={{
                  endAdornment: getValidationIcon('nombre')
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: getBorderColor('nombre'),
                      borderWidth: 2
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: getBorderColor('nombre')
                  }
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Contacto"
                    variant="outlined"
                    value={formData.contacto}
                    onChange={(e) => handleCampoChange('contacto', e.target.value)}
                    placeholder={VALIDACIONES.contacto.placeholder}
                    error={!!erroresValidacion.contacto}
                    helperText={getHelperText('contacto')}
                    inputProps={{ 
                      maxLength: VALIDACIONES.contacto.maxLength,
                      pattern: VALIDACIONES.contacto.pattern.source
                    }}
                    InputProps={{
                      endAdornment: getValidationIcon('contacto')
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: getBorderColor('contacto'),
                          borderWidth: 2
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    variant="outlined"
                    value={formData.numeroTelefono || ''}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const soloNumeros = valor.replace(/\D/g, '').slice(0, 10);
                      handleCampoChange('numeroTelefono', soloNumeros);
                      
                      const ladaActual = formData.lada || '+52';
                      const telefonoCompleto = ladaActual + soloNumeros;
                      handleCampoChange('telefono', telefonoCompleto);
                    }}
                    placeholder="1234567890"
                    error={!!erroresValidacion.telefono}
                    helperText={erroresValidacion.telefono || (formData.numeroTelefono ? `${formData.numeroTelefono.length}/10 dígitos` : 'Escribe 10 dígitos')}
                    inputProps={{ 
                      maxLength: 10,
                      inputMode: 'numeric'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TextField
                            select
                            variant="standard"
                            value={formData.lada || '+52'}
                            onChange={(e) => {
                              const nuevaLada = e.target.value;
                              handleCampoChange('lada', nuevaLada);
                              
                              const numeroActual = formData.numeroTelefono || '';
                              const telefonoCompleto = nuevaLada + numeroActual;
                              handleCampoChange('telefono', telefonoCompleto);
                            }}
                            sx={{
                              minWidth: 100,
                              '& .MuiInput-underline:before': { borderBottom: 'none' },
                              '& .MuiInput-underline:after': { borderBottom: 'none' },
                              '& .MuiSelect-select': { 
                                paddingRight: '24px !important',
                                paddingLeft: '8px !important'
                              }
                            }}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="+52">🇲🇽 +52</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+51">🇵🇪 +51</option>
                            <option value="+56">🇨🇱 +56</option>
                            <option value="+54">🇦🇷 +54</option>
                            <option value="+55">🇧🇷 +55</option>
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+58">🇻🇪 +58</option>
                            <option value="+503">🇸🇻 +503</option>
                            <option value="+504">🇭🇳 +504</option>
                            <option value="+505">🇳🇮 +505</option>
                            <option value="+506">🇨🇷 +506</option>
                            <option value="+507">🇵🇦 +507</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+39">🇮🇹 +39</option>
                          </TextField>
                        </InputAdornment>
                      ),
                      endAdornment: getValidationIcon('telefono'),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: getBorderColor('telefono'),
                          borderWidth: 2
                        },
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={(e) => handleCampoChange('email', e.target.value)}
                placeholder={VALIDACIONES.email.placeholder}
                error={!!erroresValidacion.email}
                helperText={getHelperText('email')}
                inputProps={{ 
                  maxLength: VALIDACIONES.email.maxLength,
                  pattern: VALIDACIONES.email.pattern.source
                }}
                InputProps={{
                  endAdornment: getValidationIcon('email')
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: getBorderColor('email'),
                      borderWidth: 2
                    },
                  }
                }}
              />

              <TextField
                fullWidth
                label="Dirección"
                variant="outlined"
                multiline
                rows={3}
                value={formData.direccion}
                onChange={(e) => handleCampoChange('direccion', e.target.value)}
                placeholder={VALIDACIONES.direccion.placeholder}
                error={!!erroresValidacion.direccion}
                helperText={getHelperText('direccion')}
                inputProps={{ 
                  maxLength: VALIDACIONES.direccion.maxLength,
                  pattern: VALIDACIONES.direccion.pattern.source
                }}
                InputProps={{
                  endAdornment: getValidationIcon('direccion')
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: getBorderColor('direccion'),
                      borderWidth: 2
                    },
                  }
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={cerrarFormulario}
              sx={{ 
                mr: 1,
                color: 'rgba(0,0,0,0.5)',
                fontWeight: 600,
                '&:hover': {
                  color: '#000',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
              disabled={loading || Object.values(erroresValidacion).some(error => error !== '') || !formData.nombre.trim()}
              sx={{ 
                borderRadius: 2,
                bgcolor: '#000',
                color: '#fff',
                px: 3,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1a1a1a',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(0,0,0,0.1)',
                  color: 'rgba(0,0,0,0.3)'
                }
              }}
            >
              {editandoProveedor ? 'Actualizar' : 'Crear Proveedor'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* FAB para móviles */}
      <Fab
        color="primary"
        aria-label="add provider"
        onClick={abrirFormularioNuevo}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
          bgcolor: '#000',
          color: '#fff',
          '&:hover': { bgcolor: '#1a1a1a' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Footer minimalista */}
      <Box sx={{ 
        mt: 8, 
        py: 3, 
        borderTop: '1px solid rgba(0,0,0,0.06)',
        bgcolor: '#fff'
      }}>
        <Container maxWidth="xl">
          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.4)', display: 'block', textAlign: 'center' }}>
            GameStore Admin v1.0 • Sistema de gestión para tienda de videojuegos
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Proveedores;