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
  MenuItem,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
  Fade,
  CircularProgress,
  Backdrop,
  Tooltip,
  Avatar,
  Divider,
  Stack,
  Fab,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Grid,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditorIcon,
  Visibility as ReaderIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Security as SecurityIcon,
  SystemUpdate as SystemUpdateIcon,
  Refresh as RefreshIcon,
  VpnKey as KeyIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Games as GamesIcon,
  Store as StoreIcon,
  Group as GroupIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Sistema de permisos por rol (sin cambios)
const PERMISOS = {
  lector: {
    ver: true,
    crear: false,
    editar: false,
    eliminar: false
  },
  editor: {
    ver: true,
    crear: true,
    editar: true,
    eliminar: false
  },
  admin: {
    ver: true,
    crear: true,
    editar: true,
    eliminar: true
  }
};

// Configuración de validaciones (sin cambios)
const VALIDACIONES = {
  nombre: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/,
    mensajeError: 'El nombre debe contener solo letras y espacios (2-50 caracteres)'
  },
  email: {
    minLength: 5,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    mensajeError: 'El formato del email no es válido'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,128}$/,
    mensajeError: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos'
  }
};

// Función de validación robusta (sin cambios)
const validarCampo = (campo, valor) => {
  const config = VALIDACIONES[campo];
  if (!config) return { valido: true, mensaje: '' };

  if (valor.length < config.minLength) {
    return { 
      valido: false, 
      mensaje: `Mínimo ${config.minLength} caracteres requeridos` 
    };
  }

  if (valor.length > config.maxLength) {
    return { 
      valido: false, 
      mensaje: `Máximo ${config.maxLength} caracteres permitidos` 
    };
  }

  if (config.pattern && !config.pattern.test(valor)) {
    return { 
      valido: false, 
      mensaje: config.mensajeError 
    };
  }

  return { valido: true, mensaje: '' };
};

// Función para sanitizar entrada (sin cambios)
const sanitizarEntrada = (valor, maxLength = 50) => {
  if (typeof valor !== 'string') return '';
  
  let sanitized = valor
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Componente de campanita de notificaciones (sin cambios funcionales, solo diseño)
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const notifs = response.data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.leida).length);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, leida: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, leida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    await loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    await loadNotifications();
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'seguridad':
        return <SecurityIcon sx={{ color: '#ff3b30' }} fontSize="small" />;
      case 'admin':
        return <AdminIcon sx={{ color: '#007aff' }} fontSize="small" />;
      case 'sistema':
        return <SystemUpdateIcon sx={{ color: '#34c759' }} fontSize="small" />;
      default:
        return <NotificationsIcon sx={{ color: '#8e8e93' }} fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ 
          position: 'relative',
          bgcolor: 'transparent',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
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

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            width: 380, 
            maxWidth: '90vw', 
            maxHeight: '70vh', 
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#000' }}>
              Notificaciones
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={handleRefresh} 
                disabled={loading}
                sx={{ color: '#000' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  onClick={markAllAsRead}
                  startIcon={<CheckIcon />}
                  disabled={loading}
                  sx={{ 
                    color: '#007aff',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(0,122,255,0.04)' }
                  }}
                >
                  Marcar todas
                </Button>
              )}
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
        </Box>

        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} sx={{ color: '#000' }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.3)', mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ py: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.leida ? 'transparent' : 'rgba(0,122,255,0.04)',
                    borderLeft: notification.leida ? 'none' : '4px solid',
                    borderLeftColor: notification.prioridad === 'urgent' ? '#ff3b30' : '#007aff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                  }}
                  secondaryAction={
                    !notification.leida && (
                      <IconButton 
                        size="small" 
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como leída"
                        sx={{ color: '#007aff' }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.tipo)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, color: '#000' }}>
                          {notification.titulo}
                        </Typography>
                        <Chip 
                          label={notification.prioridad} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: notification.prioridad === 'urgent' ? 'rgba(255,59,48,0.1)' : 'rgba(0,0,0,0.06)',
                            color: notification.prioridad === 'urgent' ? '#ff3b30' : '#000',
                            border: 'none'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="div">
                        <Typography variant="body2" component="div" sx={{ color: '#000', mb: 0.5, opacity: 0.9 }}>
                          {notification.mensaje}
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                          {formatDate(notification.fecha_creacion)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {notifications.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                {notifications.length} notificación(es) • {unreadCount} sin leer
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

const Usuarios = () => {
  // Estados (sin cambios)
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'lector'
  });
  const [erroresValidacion, setErroresValidacion] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const navigate = useNavigate();

  // Configuración de roles con diseño moderno
  const rolesDisponibles = [
    {
      value: 'admin',
      label: 'Administrador',
      color: '#ff3b30',
      icon: <AdminIcon fontSize="small" />,
      description: 'Acceso completo al sistema',
      gradient: 'linear-gradient(135deg, #ff3b30 0%, #c62828 100%)'
    },
    {
      value: 'editor',
      label: 'Editor',
      color: '#ff9500',
      icon: <EditorIcon fontSize="small" />,
      description: 'Puede crear y editar contenido',
      gradient: 'linear-gradient(135deg, #ff9500 0%, #ef6c00 100%)'
    },
    {
      value: 'lector',
      label: 'Lector',
      color: '#34c759',
      icon: <ReaderIcon fontSize="small" />,
      description: 'Solo lectura del contenido',
      gradient: 'linear-gradient(135deg, #34c759 0%, #2e7d32 100%)'
    }
  ];

  // Función para verificar permisos (sin cambios)
  const tienePermiso = (accion) => {
    if (!user || !user.rol) return false;
    return PERMISOS[user.rol]?.[accion] || false;
  };

  const esAdministrador = () => {
    return user && user.rol === 'admin';
  };

  const esUsuarioActual = (usuario) => {
    return user && usuario.id === user.id;
  };

  const puedeRestablecerContraseña = (usuario) => {
    if (esAdministrador()) return true;
    return esUsuarioActual(usuario);
  };

  const getTooltipRestablecimiento = (usuario) => {
    if (esAdministrador()) {
      return `Restablecer contraseña de ${usuario.nombre}`;
    }
    if (esUsuarioActual(usuario)) {
      return 'Restablecer mi contraseña';
    }
    return 'Solo puedes restablecer tu propia contraseña';
  };

  // Obtener usuario autenticado (sin cambios)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
     .then(res => {
      setUser(res.data.data);
    })
    .catch(() => {
      setUser(null);
      navigate('/');
    });
  }, [navigate]);

  // Cargar usuarios (sin cambios)
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsuarios(response.data.data);
        if (response.data.estadisticas) {
          setEstadisticas(response.data.estadisticas);
        }
        setError(null);
      } else {
        setError(response.data.message || 'Error al cargar usuarios');
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

  // ✅ FUNCIÓN PARA ENVIAR RESTABLECIMIENTO DE CONTRASEÑA (sin cambios)
  const enviarRestablecimientoContraseña = async (usuario) => {
    const mensajeConfirmacion = esUsuarioActual(usuario) 
      ? `¿Enviar enlace de restablecimiento de contraseña a tu email (${usuario.email})?`
      : `¿Enviar enlace de restablecimiento de contraseña a ${usuario.email}?`;
    
    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = esAdministrador() 
        ? `${API_URL}/auth/admin-reset-password`
        : `${API_URL}/auth/forgot-password`;
      
      const payload = esAdministrador() 
        ? { userId: usuario.id }
        : { email: usuario.email };
      
      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        let mensajeExito = '';
        
        if (esUsuarioActual(usuario)) {
          mensajeExito = 'Solicitud de restablecimiento procesada';
        } else {
          mensajeExito = `Solicitud de restablecimiento procesada para ${usuario.email}`;
        }
        
        if (data.mode === 'offline') {
          mensajeExito += ' (modo offline)';
        }
        
        mostrarMensaje(mensajeExito, 'success');
      } else {
        mostrarMensaje(response.data.message || 'Error al procesar la solicitud', 'error');
      }
    } catch (err) {
      mostrarMensaje(err.response?.data?.message || 'Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función de validación en tiempo real (sin cambios)
  const validarCampoEnTiempoReal = (campo, valor) => {
    const resultado = validarCampo(campo, valor);
    setErroresValidacion(prev => ({
      ...prev,
      [campo]: resultado.mensaje
    }));
    return resultado.valido;
  };

  const handleCampoChange = (campo, valor) => {
    const valorSanitizado = sanitizarEntrada(valor, VALIDACIONES[campo]?.maxLength || 50);
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

    const emailValido = validarCampoEnTiempoReal('email', formData.email);
    if (!emailValido) {
      nuevosErrores.email = erroresValidacion.email;
      esValido = false;
    }

    if (!editandoUsuario) {
      const passwordValido = validarCampoEnTiempoReal('password', formData.password);
      if (!passwordValido) {
        nuevosErrores.password = erroresValidacion.password;
        esValido = false;
      }
    }

    setErroresValidacion(nuevosErrores);
    return esValido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editandoUsuario && !tienePermiso('editar')) {
      mostrarMensaje('No tienes permisos para editar usuarios', 'error');
      return;
    }
    
    if (!editandoUsuario && !tienePermiso('crear')) {
      mostrarMensaje('No tienes permisos para crear usuarios', 'error');
      return;
    }

    if (!validarFormulario()) {
      mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (editandoUsuario) {
        const response = await axios.put(
          `${API_URL}/usuarios/${editandoUsuario.id}`,
          {
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          mostrarMensaje('Usuario actualizado exitosamente', 'success');
          setEditandoUsuario(null);
        } else {
          mostrarMensaje(response.data.message || 'Error al actualizar usuario', 'error');
        }
      } else {
        const response = await axios.post(
          `${API_URL}/usuarios`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          mostrarMensaje('Usuario creado exitosamente', 'success');
        } else {
          mostrarMensaje(response.data.message || 'Error al crear usuario', 'error');
        }
      }
      await cargarUsuarios();
      cerrarFormulario();
    } catch (err) {
      mostrarMensaje(err.response?.data?.message || 'Error al guardar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!tienePermiso('eliminar')) {
      mostrarMensaje('No tienes permisos para eliminar usuarios', 'error');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/usuarios/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        mostrarMensaje('Usuario eliminado exitosamente', 'success');
        await cargarUsuarios();
      } else {
        mostrarMensaje(response.data.message || 'Error al eliminar usuario', 'error');
      }
    } catch (err) {
      mostrarMensaje(err.response?.data?.message || 'Error al eliminar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirFormularioNuevo = () => {
    if (!tienePermiso('crear')) {
      mostrarMensaje('No tienes permisos para crear usuarios', 'error');
      return;
    }
    
    setFormData({ nombre: '', email: '', password: '', rol: 'lector' });
    setErroresValidacion({ nombre: '', email: '', password: '' });
    setEditandoUsuario(null);
    setMostrarPassword(false);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (usuario) => {
    if (!tienePermiso('editar')) {
      mostrarMensaje('No tienes permisos para editar usuarios', 'error');
      return;
    }
    
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    });
    setErroresValidacion({ nombre: '', email: '', password: '' });
    setEditandoUsuario(usuario);
    setMostrarPassword(false);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setEditandoUsuario(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'lector' });
    setErroresValidacion({ nombre: '', email: '', password: '' });
    setMostrarPassword(false);
  };

  const obtenerInfoRol = (rol) => {
    return rolesDisponibles.find(r => r.value === rol) || rolesDisponibles[2];
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (nombre) => {
    if (!nombre) return '??';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userPreferences');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const irAPagos = () => {
    navigate('/admin/pagos');
  };

  // NUEVA FUNCIÓN: Navegar a proveedores
  const irAProveedores = () => {
    navigate('/proveedores');
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

  // Función para obtener color de avatar basado en nombre
  const getAvatarColor = (nombre) => {
    const colors = [
      '#007aff', '#5856d6', '#ff2d55', '#ff9500', 
      '#34c759', '#5ac8fa', '#ffcc00', '#af52de'
    ];
    const index = nombre.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* AppBar minimalista */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <GamesIcon sx={{ color: '#000', fontSize: 28 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: '#000',
                letterSpacing: '-0.5px'
              }}
            >
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
                
                {/* NUEVO: Botón para Proveedores */}
                <Tooltip title="Proveedores">
                  <IconButton 
                    onClick={irAProveedores}
                    sx={{ 
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <LocalShippingIcon />
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

                <Tooltip title="Mi Ubicación">
                  <IconButton 
                    onClick={() => navigate('/locations')}
                    sx={{ 
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <ShieldIcon />
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
                    bgcolor: getAvatarColor(user.nombre),
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(user.nombre)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }}>
                    {user.nombre.split(' ')[0]}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', display: 'block' }}>
                    {user.rol}
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
        open={loading && usuarios.length === 0}
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
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.6)', maxWidth: 600 }}>
            Administra los usuarios y permisos del sistema de tu tienda de videojuegos
          </Typography>
        </Box>

        {/* Mensajes */}
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            onClose={() => setError(null)} 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'rgba(255,59,48,0.1)',
              color: '#000',
              border: '1px solid rgba(255,59,48,0.2)',
              '& .MuiAlert-icon': { color: '#ff3b30' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Error</AlertTitle>
            {error}
          </Alert>
        </Collapse>

        <Collapse in={!!success}>
          <Alert 
            severity="success" 
            onClose={() => setSuccess(null)} 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'rgba(52,199,89,0.1)',
              color: '#000',
              border: '1px solid rgba(52,199,89,0.2)',
              '& .MuiAlert-icon': { color: '#34c759' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Éxito</AlertTitle>
            {success}
          </Alert>
        </Collapse>

        {/* Estadísticas modernas */}
        {estadisticas.length > 0 && (
          <Fade in={estadisticas.length > 0}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {estadisticas.map((stat) => {
                const rolInfo = obtenerInfoRol(stat.rol);
                return (
                  <Grid item xs={12} sm={4} key={stat.rol}>
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
                              {rolInfo.label}s
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
                              {stat.cantidad}
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
                              background: rolInfo.gradient,
                              color: '#fff'
                            }}
                          >
                            {rolInfo.icon}
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
                          {rolInfo.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Fade>
        )}

        {/* Panel de acciones */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
            Todos los Usuarios
            <Typography component="span" sx={{ color: 'rgba(0,0,0,0.5)', ml: 1, fontWeight: 400 }}>
              ({usuarios.length} registrados)
            </Typography>
          </Typography>
          
          {tienePermiso('crear') ? (
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
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1a1a1a',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              Nuevo Usuario
            </Button>
          ) : (
            <Tooltip title="No tienes permisos para crear usuarios">
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                disabled
                sx={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  color: 'rgba(0,0,0,0.3)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Sin permisos
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Tabla de usuarios moderna */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#fff',
            overflow: 'hidden'
          }}
        >
          {loading && usuarios.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#000' }} />
            </Box>
          ) : usuarios.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <GroupIcon sx={{ fontSize: 64, color: 'rgba(0,0,0,0.1)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.5)', mb: 1, fontWeight: 600 }}>
                No hay usuarios registrados
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.4)', mb: 3 }}>
                {tienePermiso('crear') ? 'Comienza creando el primer usuario' : 'No tienes permisos para crear usuarios'}
              </Typography>
              {tienePermiso('crear') && (
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
                  Crear Primer Usuario
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Rol</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#000', py: 2 }}>Fecha de Creación</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000', py: 2 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => {
                    const rolInfo = obtenerInfoRol(usuario.rol);
                    const esMiUsuario = esUsuarioActual(usuario);
                    const puedeRestablecer = puedeRestablecerContraseña(usuario);
                    
                    return (
                      <TableRow
                        key={usuario.id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                          '&:last-child td': { border: 0 },
                          bgcolor: esMiUsuario ? 'rgba(0,122,255,0.04)' : 'transparent'
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  bgcolor: getAvatarColor(usuario.nombre),
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              >
                                {getInitials(usuario.nombre)}
                              </Avatar>
                              {esMiUsuario && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    bottom: -2,
                                    right: -2,
                                    width: 12,
                                    height: 12,
                                    bgcolor: '#34c759',
                                    borderRadius: '50%',
                                    border: '2px solid #fff'
                                  }}
                                />
                              )}
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000' }}>
                                  {usuario.nombre}
                                </Typography>
                                {esMiUsuario && (
                                  <Chip
                                    label="Tú"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      bgcolor: 'rgba(0,122,255,0.1)',
                                      color: '#007aff'
                                    }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EmailIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                                  {usuario.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            icon={rolInfo.icon}
                            label={rolInfo.label}
                            sx={{
                              bgcolor: alpha(rolInfo.color, 0.1),
                              color: rolInfo.color,
                              border: 'none',
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: rolInfo.color }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                              {formatearFecha(usuario.fecha_creacion)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {tienePermiso('editar') ? (
                              <Tooltip title="Editar usuario">
                                <IconButton
                                  size="small"
                                  onClick={() => abrirFormularioEditar(usuario)}
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
                            ) : (
                              <Tooltip title="Sin permisos para editar">
                                <IconButton size="small" disabled sx={{ color: 'rgba(0,0,0,0.1)' }}>
                                  <LockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title={getTooltipRestablecimiento(usuario)}>
                              <IconButton
                                size="small"
                                onClick={() => enviarRestablecimientoContraseña(usuario)}
                                disabled={!puedeRestablecer}
                                sx={{ 
                                  color: puedeRestablecer 
                                    ? (esMiUsuario ? '#007aff' : '#ff9500') 
                                    : 'rgba(0,0,0,0.1)',
                                  '&:hover': { 
                                    color: esMiUsuario ? '#0056cc' : '#e67300',
                                    bgcolor: esMiUsuario ? 'rgba(0,122,255,0.1)' : 'rgba(255,149,0,0.1)'
                                  }
                                }}
                              >
                                <KeyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {tienePermiso('eliminar') && !esMiUsuario ? (
                              <Tooltip title="Eliminar usuario">
                                <IconButton
                                  size="small"
                                  onClick={() => eliminarUsuario(usuario)}
                                  sx={{ 
                                    color: 'rgba(0,0,0,0.5)',
                                    '&:hover': { 
                                      color: '#ff3b30',
                                      bgcolor: 'rgba(255,59,48,0.1)'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title={esMiUsuario ? "No puedes eliminarte a ti mismo" : "Sin permisos para eliminar"}>
                                <IconButton size="small" disabled sx={{ color: 'rgba(0,0,0,0.1)' }}>
                                  <LockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              startIcon={<StoreIcon />}
              onClick={() => navigate('/shop')}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
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
            {/* NUEVO: Botón para Proveedores */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LocalShippingIcon />}
              onClick={irAProveedores}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Gestión de Proveedores
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
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Ver Reportes
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ShieldIcon />}
              onClick={() => navigate('/locations')}
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#000',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Mi Ubicación
            </Button>
          </Grid>
          {esAdministrador() && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PaymentIcon />}
                onClick={irAPagos}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1a1a1a',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Administrar Pagos
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Formulario Modal moderno */}
      <Dialog
        open={mostrarFormulario}
        onClose={cerrarFormulario}
        maxWidth="sm"
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
            {editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', mt: 0.5 }}>
            {editandoUsuario ? 'Modifica los datos del usuario' : 'Completa la información del nuevo usuario'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nombre completo"
                variant="outlined"
                required
                value={formData.nombre}
                onChange={(e) => handleCampoChange('nombre', e.target.value)}
                placeholder="Ingresa el nombre completo"
                error={!!erroresValidacion.nombre}
                helperText={erroresValidacion.nombre || `${formData.nombre.length}/50 caracteres`}
                inputProps={{ 
                  maxLength: 50,
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

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                required
                value={formData.email}
                onChange={(e) => handleCampoChange('email', e.target.value)}
                placeholder="usuario@ejemplo.com"
                error={!!erroresValidacion.email}
                helperText={erroresValidacion.email || `${formData.email.length}/100 caracteres`}
                inputProps={{ 
                  maxLength: 100,
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
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: getBorderColor('email')
                  }
                }}
              />

              {!editandoUsuario && (
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={mostrarPassword ? 'text' : 'password'}
                  variant="outlined"
                  required={!editandoUsuario}
                  value={formData.password}
                  onChange={(e) => handleCampoChange('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres con diferentes tipos"
                  error={!!erroresValidacion.password}
                  helperText={erroresValidacion.password || `${formData.password.length}/128 caracteres`}
                  inputProps={{ 
                    maxLength: 128,
                    minLength: 8,
                    pattern: VALIDACIONES.password.pattern.source
                }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {getValidationIcon('password')}
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          edge="end"
                          sx={{ color: 'rgba(0,0,0,0.3)' }}
                        >
                          {mostrarPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: getBorderColor('password'),
                        borderWidth: 2
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: getBorderColor('password')
                    }
                  }}
                />
              )}

              <TextField
                fullWidth
                select
                label="Rol"
                variant="outlined"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                {rolesDisponibles.map((rol) => (
                  <MenuItem key={rol.value} value={rol.value} sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: rol.gradient,
                          color: '#fff'
                        }}
                      >
                        {rol.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>
                          {rol.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                          {rol.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={cerrarFormulario}
              sx={{ 
                mr: 1,
                color: 'rgba(0,0,0,0.5)',
                fontWeight: 600,
                textTransform: 'none',
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
              disabled={loading || Object.values(erroresValidacion).some(error => error !== '')}
              sx={{ 
                borderRadius: 2,
                bgcolor: '#000',
                color: '#fff',
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
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
              {editandoUsuario ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* FAB para móviles */}
      {tienePermiso('crear') && (
        <Fab
          color="primary"
          aria-label="add user"
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
      )}

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

export default Usuarios;