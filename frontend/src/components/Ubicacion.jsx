import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Grid,
  Fade,
  Slide,
  Fab
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  LocationOn as LocationOnIcon,
  Payment as PaymentIcon,
  GpsFixed as GpsFixedIcon,
  GpsNotFixed as GpsNotFixedIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Animaciones CSS
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

// Componentes estilizados minimalistas
const MinimalCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
    transform: 'translateY(-2px)'
  },
  animation: `${fadeInUp} 0.5s ease-out`
}));

const MonospaceTypography = styled(Typography)({
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  letterSpacing: '0.5px'
});

const MinimalButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '14px',
  padding: '14px 28px',
  textTransform: 'none',
  fontWeight: 500,
  letterSpacing: '0.3px',
  transition: 'all 0.2s ease',
  border: variant === 'outlined' ? '2px solid #000' : 'none',
  backgroundColor: variant === 'contained' ? '#000' : 'transparent',
  color: variant === 'contained' ? '#fff' : '#000',
  fontSize: '0.95rem',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#333' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : 'none',
    borderColor: variant === 'outlined' ? '#333' : undefined
  },
  '&.Mui-disabled': {
    backgroundColor: variant === 'contained' ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
    color: variant === 'contained' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(0, 0, 0, 0.12)'
  }
}));

const StatBadge = styled('div')(({ online }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 16px',
  borderRadius: '12px',
  backgroundColor: online ? 'rgba(0, 200, 83, 0.08)' : 'rgba(244, 67, 54, 0.08)',
  border: `1px solid ${online ? 'rgba(0, 200, 83, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: online ? '#00C853' : '#F44336'
}));

const LocationDot = styled('div')(({ active }) => ({
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: active ? '#000' : '#999',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-6px',
    left: '-6px',
    right: '-6px',
    bottom: '-6px',
    borderRadius: '50%',
    backgroundColor: active ? 'rgba(0, 0, 0, 0.1)' : 'rgba(153, 153, 153, 0.1)',
    animation: active ? `${pulse} 2s infinite` : 'none'
  }
}));

const ProgressRing = styled(CircularProgress)({
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round'
  }
});

// Componente de métrica minimalista
const MetricCard = ({ icon, label, value, subtext }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: '16px',
      backgroundColor: '#fff',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease',
      height: '100%',
      '&:hover': {
        borderColor: 'rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-2px)'
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000'
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
          {value}
        </Typography>
      </Box>
    </Box>
    {subtext && (
      <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
        {subtext}
      </Typography>
    )}
  </Paper>
);

const LocationManager = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: false,
    permission: 'prompt'
  });

  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Función para guardar ubicación offline
  const saveLocationOffline = useCallback((coords) => {
    const locationData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: new Date().toISOString(),
      offline: true
    };
    
    try {
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      const offlineQueue = JSON.parse(localStorage.getItem('offlineLocationQueue') || '[]');
      offlineQueue.push(locationData);
      localStorage.setItem('offlineLocationQueue', JSON.stringify(offlineQueue));
    } catch (error) {
      console.error('Error guardando ubicación offline:', error);
    }
  }, []);

  // Función para guardar ubicación online
  const saveLocationOnline = useCallback(async (coords) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${API_URL}/usuarios/ubicacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error guardando ubicación online:', error);
      return false;
    }
  }, [API_URL]);

  // Manejar nueva posición
  const handlePosition = useCallback(async (position) => {
    const coords = position.coords;
    
    setLocation(prev => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: new Date().toISOString(),
      error: null,
      loading: false,
      permission: 'granted'
    }));

    saveLocationOffline(coords);

    if (navigator.onLine) {
      await saveLocationOnline(coords);
    }
  }, [saveLocationOffline, saveLocationOnline]);

  // Manejar errores
  const handleError = useCallback((error) => {
    let errorMessage = '';
    let permission = 'denied';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permisos de ubicación denegados';
        permission = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Ubicación no disponible';
        permission = 'granted';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado';
        permission = 'granted';
        break;
      default:
        errorMessage = 'Error desconocido';
        break;
    }

    setLocation(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
      permission
    }));
  }, []);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocalización no soportada',
        loading: false
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [handlePosition, handleError]);

  // Iniciar/detener seguimiento
  const toggleTracking = useCallback(() => {
    if (isTracking) {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
    } else {
      if (!navigator.geolocation) return;
      
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }

      const id = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );

      setWatchId(id);
      setIsTracking(true);
    }
  }, [isTracking, watchId, handlePosition, handleError]);

  // Cargar ubicación offline
  const loadOfflineLocation = useCallback(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const locationData = JSON.parse(savedLocation);
        setLocation(prev => ({
          ...prev,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
          error: null
        }));
        return locationData;
      }
    } catch (error) {
      console.error('Error cargando ubicación offline:', error);
    }
    return null;
  }, []);

  // Eliminar datos de ubicación
  const handleDeleteLocation = async () => {
    if (!window.confirm('¿Eliminar todos tus datos de ubicación?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/usuarios/ubicacion`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      localStorage.removeItem('userLocation');
      localStorage.removeItem('offlineLocationQueue');
      
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
        error: null,
        loading: false,
        permission: 'prompt'
      });
    } catch (error) {
      console.error('Error eliminando ubicación:', error);
    }
  };

  // Obtener usuarios cercanos
  const fetchNearbyUsers = async () => {
    if (!location.latitude || !location.longitude || user?.rol !== 'admin') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/usuarios/cercanos?latitude=${location.latitude}&longitude=${location.longitude}&radius=5000`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNearbyUsers(data.data || []);
        setShowNearby(true);
      }
    } catch (error) {
      console.error('Error obteniendo usuarios cercanos:', error);
    }
  };

  // Cargar información del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error('Error cargando usuario:', err));
    }
  }, [API_URL]);

  // Cargar ubicación offline al montar
  useEffect(() => {
    loadOfflineLocation();
  }, [loadOfflineLocation]);

  // Manejar cambios de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Funciones de navegación
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const esAdministrador = () => user && user.rol === 'admin';

  const irAPagos = () => navigate('/admin/pagos');

  // Formatear coordenadas
  const formatLocation = (lat, lng) => {
    return `${lat?.toFixed(6) || 'N/A'}, ${lng?.toFixed(6) || 'N/A'}`;
  };

  // Calcular precisión como porcentaje
  const calculateAccuracyPercentage = (accuracy) => {
    if (!accuracy) return 0;
    return Math.min(100, Math.round((1000 - Math.min(accuracy, 1000)) / 10));
  };

  // Función para obtener iniciales
  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative'
    }}>
      {/* Botón de regreso flotante */}
      <Fab
        sx={{
          position: 'fixed',
          top: 24,
          left: 24,
          backgroundColor: '#fff',
          color: '#000',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            transform: 'translateX(-4px)'
          },
          zIndex: 1000,
          transition: 'all 0.2s ease'
        }}
        onClick={() => navigate(-1)}
        size="medium"
      >
        <ArrowBackIcon />
      </Fab>

      {/* Encabezado mínimo */}
      <Box sx={{ 
        pt: 8, 
        pb: 4, 
        px: { xs: 2, sm: 3 },
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5,
                  color: '#000',
                  letterSpacing: '-0.5px'
                }}
              >
                Geolocalización
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Monitoreo en tiempo real
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatBadge online={isOnline}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: isOnline ? '#00C853' : '#F44336',
                  mr: 1 
                }} />
                {isOnline ? 'En línea' : 'Offline'}
              </StatBadge>

              {user && (
                <IconButton
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  sx={{
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      color: '#000',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getInitials(user.nombre)}
                  </Avatar>
                </IconButton>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Menú de usuario flotante */}
      {showUserMenu && (
        <Paper
          sx={{
            position: 'fixed',
            top: 100,
            right: 24,
            width: 200,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            zIndex: 999,
            animation: `${fadeInUp} 0.2s ease-out`
          }}
        >
          <Box sx={{ p: 2 }}>
            {user && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      color: '#000'
                    }}
                  >
                    {getInitials(user.nombre)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>
                      {user.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {user.rol}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            
            <List dense>
              <ListItem 
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LogoutIcon fontSize="small" sx={{ color: '#F44336' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Cerrar sesión" 
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    sx: { color: '#F44336', fontWeight: 500 } 
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      )}

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Tarjeta principal */}
        <MinimalCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Encabezado de la tarjeta */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              pb: 3,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationDot active={!!location.latitude} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                    Posición actual
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {location.latitude ? 'Ubicación detectada' : 'Esperando datos'}
                  </Typography>
                </Box>
              </Box>

              {isTracking && (
                <Chip
                  icon={<GpsFixedIcon />}
                  label="Seguimiento activo"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    color: '#000',
                    fontWeight: 500,
                    animation: `${floatAnimation} 2s infinite ease-in-out`
                  }}
                />
              )}
            </Box>

            {/* Estado de carga */}
            {location.loading && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                py: 6 
              }}>
                <ProgressRing 
                  size={64}
                  thickness={4}
                  sx={{ color: '#000', mb: 3 }}
                />
                <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
                  Localizando posición...
                </Typography>
              </Box>
            )}

            {/* Error */}
            {location.error && (
              <Alert 
                severity="error"
                sx={{ 
                  mb: 4, 
                  borderRadius: '12px',
                  backgroundColor: 'rgba(244, 67, 54, 0.05)',
                  border: '1px solid rgba(244, 67, 54, 0.1)',
                  color: '#F44336'
                }}
                icon={<ErrorIcon />}
              >
                {location.error}
              </Alert>
            )}

            {/* Información de ubicación */}
            {location.latitude && location.longitude ? (
              <Box>
                {/* Coordenadas principales */}
                <Box sx={{ 
                  mb: 4,
                  p: 4,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                    COORDENADAS GPS
                  </Typography>
                  <MonospaceTypography variant="h3" sx={{ fontWeight: 700, color: '#000', mb: 1 }}>
                    {formatLocation(location.latitude, location.longitude)}
                  </MonospaceTypography>
                  
                  {location.timestamp && (
                    <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                      Actualizado: {new Date(location.timestamp).toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>

                {/* Métricas */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                      icon={<LocationOnIcon />}
                      label="Precisión"
                      value={`${Math.round(location.accuracy || 0)}m`}
                      subtext={`${calculateAccuracyPercentage(location.accuracy)}% confianza`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                      icon={isTracking ? <GpsFixedIcon /> : <GpsNotFixedIcon />}
                      label="Modo"
                      value={isTracking ? 'Seguimiento' : 'Estático'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                      icon={location.permission === 'granted' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label="Permisos"
                      value={location.permission === 'granted' ? 'Concedidos' : 'Denegados'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                      icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
                      label="Conexión"
                      value={isOnline ? 'Online' : 'Offline'}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                borderRadius: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: '2px dashed rgba(0, 0, 0, 0.08)'
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <LocationOnIcon sx={{ fontSize: 40, color: '#999' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                  Sin datos de ubicación
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', maxWidth: '400px', mx: 'auto', mb: 3 }}>
                  Obtén tu ubicación actual para comenzar el monitoreo
                </Typography>
                <MinimalButton
                  variant="contained"
                  startIcon={<MyLocationIcon />}
                  onClick={getCurrentLocation}
                  disabled={location.loading}
                >
                  Obtener ubicación
                </MinimalButton>
              </Box>
            )}

            {/* Controles */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              alignItems: 'center',
              pt: 4,
              mt: 4,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <MinimalButton
                variant="contained"
                startIcon={<MyLocationIcon />}
                onClick={getCurrentLocation}
                disabled={location.loading}
              >
                {location.latitude ? 'Actualizar ubicación' : 'Obtener ubicación'}
              </MinimalButton>

              <FormControlLabel
                control={
                  <Switch
                    checked={isTracking}
                    onChange={toggleTracking}
                    disabled={location.loading || !location.latitude}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#000',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#000'
                        }
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Seguimiento continuo
                  </Typography>
                }
              />

              {location.latitude && (
                <MinimalButton
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteLocation}
                  sx={{ color: '#F44336', borderColor: 'rgba(244, 67, 54, 0.3)' }}
                >
                  Limpiar datos
                </MinimalButton>
              )}

              {esAdministrador() && (
                <MinimalButton
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  onClick={irAPagos}
                  sx={{ ml: 'auto' }}
                >
                  Panel de pagos
                </MinimalButton>
              )}
            </Box>
          </CardContent>
        </MinimalCard>

        {/* Sección de usuarios cercanos (solo admin) */}
        {user?.rol === 'admin' && location.latitude && (
          <MinimalCard sx={{ animation: `${fadeInUp} 0.5s ease-out 0.2s both` }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4,
                pb: 3,
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 0.5 }}>
                    Usuarios cercanos
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Radio de 5km desde tu ubicación actual
                  </Typography>
                </Box>
                
                <MinimalButton
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={fetchNearbyUsers}
                >
                  Escanear área
                </MinimalButton>
              </Box>

              {showNearby && (
                <Box sx={{ mt: 2 }}>
                  {nearbyUsers.length > 0 ? (
                    <Grid container spacing={2}>
                      {nearbyUsers.map((nearbyUser, index) => (
                        <Grid item xs={12} md={6} key={nearbyUser.id}>
                          <Slide in timeout={400} direction="up">
                            <Paper
                              sx={{
                                p: 3,
                                borderRadius: '16px',
                                backgroundColor: '#fff',
                                border: '1px solid rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'rgba(0, 0, 0, 0.12)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    color: '#000',
                                    fontWeight: 600
                                  }}
                                >
                                  {getInitials(nearbyUser.nombre)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#000' }}>
                                    {nearbyUser.nombre}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    {nearbyUser.email}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={`${Math.round(nearbyUser.distance)}m`}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: '#000',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={nearbyUser.rol}
                                  size="small"
                                  sx={{
                                    backgroundColor: nearbyUser.rol === 'admin' 
                                      ? 'rgba(244, 67, 54, 0.1)' 
                                      : 'rgba(0, 150, 136, 0.1)',
                                    color: nearbyUser.rol === 'admin' ? '#F44336' : '#009688',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                            </Paper>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert 
                      severity="info"
                      sx={{ 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(33, 150, 243, 0.05)',
                        border: '1px solid rgba(33, 150, 243, 0.1)',
                        color: '#2196F3'
                      }}
                      icon={<InfoIcon />}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        No se encontraron usuarios cercanos en el radio de 5km
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </MinimalCard>
        )}

        {/* Pie de página minimalista */}
        <Box sx={{ 
          mt: 6, 
          pt: 4, 
          borderTop: '1px solid rgba(0, 0, 0, 0.06)', 
          textAlign: 'center' 
        }}>
          <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
            Geolocalización • Sistema de monitoreo en tiempo real
          </Typography>
          <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mt: 0.5 }}>
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LocationManager;