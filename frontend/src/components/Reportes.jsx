import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge,
  FormControl,
  InputLabel,
  Select,
  alpha,
  InputAdornment
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Inventory as InventoryIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  TableChart as ExcelIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Games as GamesIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Dashboard as DashboardIcon,
  InsertChart as InsertChartIcon,
  Equalizer as EqualizerIcon,
  TrendingFlat as TrendingFlatIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Paleta de colores moderna en blanco y negro
const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc',
  '#4a4a4a', '#767676', '#a3a3a3', '#d0d0d0', '#f5f5f5'
];

// Configuración de límites de caracteres (sin cambios)
const LIMITES_CARACTERES = {
  codigo: 20,
  nombre: 100,
  descripcion: 500,
  categoria: 50,
  unidad: 20
};

// Configuración de límites numéricos (sin cambios)
const LIMITES_NUMERICOS = {
  stock_min: 0,
  stock_max: 1000000,
  stock_minimo_min: 0,
  stock_minimo_max: 100000,
  precio_min: 0,
  precio_max: 1000000
};

const Reportes = () => {
  const [tabActual, setTabActual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para reportes (sin cambios)
  const [reporteCategorias, setReporteCategorias] = useState([]);
  const [reporteMovimientos, setReporteMovimientos] = useState([]);
  const [reporteTopProductos, setReporteTopProductos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [inventarioCompleto, setInventarioCompleto] = useState([]);
 
  // Estados para filtros (sin cambios)
  const [filtroStock, setFiltroStock] = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Estados para modal de productos por categoría (sin cambios)
  const [modalCategoria, setModalCategoria] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productosPorCategoria, setProductosPorCategoria] = useState([]);

  // Estados para modal de crear/editar producto (sin cambios)
  const [modalProducto, setModalProducto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formProducto, setFormProducto] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    stock: 0,
    categoria: '',
    unidad: 'unidad',
    stock_minimo: 0,
    precio: 0
  });
  const [erroresForm, setErroresForm] = useState({});

  // Estados para filtros de reportes (sin cambios)
  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [diasTopProductos, setDiasTopProductos] = useState(30);
  const [limiteProductos, setLimiteProductos] = useState(10);

  useEffect(() => {
    cargarReporteCategorias();
    cargarAlertasStock();
    cargarInventarioCompleto();
  }, []);

  const cargarInventarioCompleto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pagos/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setInventarioCompleto(response.data.data);
      }
    } catch (err) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/inventario`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setInventarioCompleto(response.data.data);
        }
      } catch (fallbackErr) {
        console.error('Error cargando inventario fallback:', fallbackErr);
      }
    }
  };

  const cargarReporteCategorias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reportes/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReporteCategorias(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar el reporte de categorías');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteMovimientos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/reportes/movements-by-period?startDate=${fechaInicio}&endDate=${fechaFin}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setReporteMovimientos(response.data.data);
        setSuccess('Reporte de movimientos cargado exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Error al cargar el reporte de movimientos');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteTopProductos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/reportes/top-products?days=${diasTopProductos}&limit=${limiteProductos}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setReporteTopProductos(response.data.data);
        setSuccess('Reporte de productos más movidos cargado exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Error al cargar el reporte de productos');
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertasStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventario/stock-alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAlertasStock(response.data.data);
      }
    } catch (err) {
      console.error('Error cargando alertas de stock:', err);
    }
  };

  const verProductosCategoria = (categoria) => {
    const productos = inventarioCompleto.filter(p => p.categoria === categoria);
    setCategoriaSeleccionada(categoria);
    setProductosPorCategoria(productos);
    setModalCategoria(true);
  };

  // Funciones para gestión de productos (sin cambios)
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoSeleccionado(null);
    setFormProducto({
      codigo: '',
      nombre: '',
      descripcion: '',
      stock: 0,
      categoria: '',
      unidad: 'unidad',
      stock_minimo: 0,
      precio: 0
    });
    setErroresForm({});
    setModalProducto(true);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoSeleccionado(producto);
    setFormProducto({
      codigo: producto.codigo || '',
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
      unidad: producto.unidad || 'unidad',
      stock_minimo: producto.stock_minimo || 0,
      stock: producto.stock || 0,
      precio: producto.precio || 0
    });
    setErroresForm({});
    setModalProducto(true);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (formProducto.codigo.length > LIMITES_CARACTERES.codigo) {
      nuevosErrores.codigo = `Máximo ${LIMITES_CARACTERES.codigo} caracteres`;
    }

    if (formProducto.nombre.length > LIMITES_CARACTERES.nombre) {
      nuevosErrores.nombre = `Máximo ${LIMITES_CARACTERES.nombre} caracteres`;
    }

    if (formProducto.descripcion.length > LIMITES_CARACTERES.descripcion) {
      nuevosErrores.descripcion = `Máximo ${LIMITES_CARACTERES.descripcion} caracteres`;
    }

    if (formProducto.categoria.length > LIMITES_CARACTERES.categoria) {
      nuevosErrores.categoria = `Máximo ${LIMITES_CARACTERES.categoria} caracteres`;
    }

    if (!formProducto.codigo.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    }

    if (!formProducto.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formProducto.categoria.trim()) {
      nuevosErrores.categoria = 'La categoría es requerida';
    }

    const stock = parseFloat(formProducto.stock);
    if (isNaN(stock) || stock < LIMITES_NUMERICOS.stock_min) {
      nuevosErrores.stock = `El stock no puede ser menor a ${LIMITES_NUMERICOS.stock_min}`;
    } else if (stock > LIMITES_NUMERICOS.stock_max) {
      nuevosErrores.stock = `El stock no puede ser mayor a ${LIMITES_NUMERICOS.stock_max.toLocaleString()}`;
    }

    const stockMinimo = parseFloat(formProducto.stock_minimo);
    if (isNaN(stockMinimo) || stockMinimo < LIMITES_NUMERICOS.stock_minimo_min) {
      nuevosErrores.stock_minimo = `El stock mínimo no puede ser menor a ${LIMITES_NUMERICOS.stock_minimo_min}`;
    } else if (stockMinimo > LIMITES_NUMERICOS.stock_minimo_max) {
      nuevosErrores.stock_minimo = `El stock mínimo no puede ser mayor a ${LIMITES_NUMERICOS.stock_minimo_max.toLocaleString()}`;
    }

    const precio = parseFloat(formProducto.precio);
    if (isNaN(precio) || precio < LIMITES_NUMERICOS.precio_min) {
      nuevosErrores.precio = `El precio no puede ser menor a ${LIMITES_NUMERICOS.precio_min}`;
    } else if (precio > LIMITES_NUMERICOS.precio_max) {
      nuevosErrores.precio = `El precio no puede ser mayor a ${formatearMoneda(LIMITES_NUMERICOS.precio_max)}`;
    }

    if (stockMinimo > stock) {
      nuevosErrores.stock_minimo = 'El stock mínimo no puede ser mayor que el stock actual';
    }

    setErroresForm(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
   
    if (['codigo', 'nombre', 'descripcion', 'categoria', 'unidad'].includes(name)) {
      const limite = LIMITES_CARACTERES[name];
      if (value.length <= limite) {
        setFormProducto(prev => ({
          ...prev,
          [name]: value
        }));
       
        if (erroresForm[name]) {
          setErroresForm(prev => ({
            ...prev,
            [name]: ''
          }));
        }
      } else {
        setErroresForm(prev => ({
          ...prev,
          [name]: `Máximo ${limite} caracteres`
        }));
      }
    } else {
      let valorNumerico = parseFloat(value);
     
      if (isNaN(valorNumerico)) {
        valorNumerico = 0;
      }

      let valorFinal = valorNumerico;
      let errorCampo = '';

      switch (name) {
        case 'stock':
          if (valorNumerico < LIMITES_NUMERICOS.stock_min) {
            errorCampo = `Mínimo ${LIMITES_NUMERICOS.stock_min}`;
            valorFinal = LIMITES_NUMERICOS.stock_min;
          } else if (valorNumerico > LIMITES_NUMERICOS.stock_max) {
            errorCampo = `Máximo ${LIMITES_NUMERICOS.stock_max.toLocaleString()}`;
            valorFinal = LIMITES_NUMERICOS.stock_max;
          }
          break;
       
        case 'stock_minimo':
          if (valorNumerico < LIMITES_NUMERICOS.stock_minimo_min) {
            errorCampo = `Mínimo ${LIMITES_NUMERICOS.stock_minimo_min}`;
            valorFinal = LIMITES_NUMERICOS.stock_minimo_min;
          } else if (valorNumerico > LIMITES_NUMERICOS.stock_minimo_max) {
            errorCampo = `Máximo ${LIMITES_NUMERICOS.stock_minimo_max.toLocaleString()}`;
            valorFinal = LIMITES_NUMERICOS.stock_minimo_max;
          }
          break;
       
        case 'precio':
          if (valorNumerico < LIMITES_NUMERICOS.precio_min) {
            errorCampo = `Mínimo ${LIMITES_NUMERICOS.precio_min}`;
            valorFinal = LIMITES_NUMERICOS.precio_min;
          } else if (valorNumerico > LIMITES_NUMERICOS.precio_max) {
            errorCampo = `Máximo ${formatearMoneda(LIMITES_NUMERICOS.precio_max)}`;
            valorFinal = LIMITES_NUMERICOS.precio_max;
          }
          break;
       
        default:
          break;
      }

      setFormProducto(prev => ({
        ...prev,
        [name]: valorFinal
      }));

      if (errorCampo) {
        setErroresForm(prev => ({
          ...prev,
          [name]: errorCampo
        }));
      } else if (erroresForm[name]) {
        setErroresForm(prev => ({
          ...prev,
          [name]: ''
        }));
      }

      if (name === 'stock' || name === 'stock_minimo') {
        const stockActual = name === 'stock' ? valorFinal : parseFloat(formProducto.stock);
        const stockMinimoActual = name === 'stock_minimo' ? valorFinal : parseFloat(formProducto.stock_minimo);
       
        if (stockMinimoActual > stockActual) {
          setErroresForm(prev => ({
            ...prev,
            stock_minimo: 'El stock mínimo no puede ser mayor que el stock actual'
          }));
        } else if (erroresForm.stock_minimo === 'El stock mínimo no puede ser mayor que el stock actual') {
          setErroresForm(prev => ({
            ...prev,
            stock_minimo: ''
          }));
        }
      }
    }
  };

  const crearProducto = async () => {
    if (!validarFormulario()) {
      setError('Por favor corrige los errores en el formulario');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
     
      const response = await axios.post(
        `${API_URL}/inventario/products`,
        formProducto,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Producto creado exitosamente');
        setTimeout(() => setSuccess(null), 3000);
        setModalProducto(false);
        await cargarInventarioCompleto();
        await cargarReporteCategorias();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el producto');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const editarProducto = async () => {
    if (!validarFormulario()) {
      setError('Por favor corrige los errores en el formulario');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
     
      const response = await axios.put(
        `${API_URL}/inventario/products/${productoSeleccionado.id}`,
        formProducto,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Producto actualizado exitosamente');
        setTimeout(() => setSuccess(null), 3000);
        setModalProducto(false);
        await cargarInventarioCompleto();
        await cargarReporteCategorias();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el producto');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoProducto = async (producto) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const nuevoEstado = !esActivo(producto.activo);
     
      if (!nuevoEstado) {
        const response = await axios.delete(
          `${API_URL}/inventario/products/${producto.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
       
        if (response.data.success) {
          setSuccess(`Producto "${producto.nombre}" desactivado exitosamente`);
        }
      } else {
        const response = await axios.put(
          `${API_URL}/inventario/products/${producto.id}`,
          { activo: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
       
        if (response.data.success) {
          setSuccess(`Producto "${producto.nombre}" activado exitosamente`);
        }
      }
     
      setTimeout(() => setSuccess(null), 3000);
      await cargarInventarioCompleto();
      await cargarReporteCategorias();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar el estado del producto');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporteExcel = async (tipo) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = '';
      let filename = '';

      switch (tipo) {
        case 'inventario':
          url = `${API_URL}/reportes/excel/inventario`;
          filename = `reporte_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'movimientos':
          url = `${API_URL}/reportes/excel/movimientos?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
          filename = `reporte_movimientos_${fechaInicio}_a_${fechaFin}.xlsx`;
          break;
        case 'productos-movidos':
          url = `${API_URL}/reportes/excel/productos-movidos?dias=${diasTopProductos}&limite=${limiteProductos}`;
          filename = `reporte_productos_movidos_${diasTopProductos}dias.xlsx`;
          break;
        case 'completo':
          url = `${API_URL}/reportes/excel/completo?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&dias=${diasTopProductos}`;
          filename = `reporte_completo_sistema_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`Reporte ${tipo} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al descargar el reporte en Excel');
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const esActivo = (valor) => {
    return valor === true || valor === 't' || valor === 'true' || valor === 'TRUE';
  };

  const esInactivo = (valor) => {
    return valor === false || valor === 'f' || valor === 'false' || valor === 'FALSE';
  };

  const inventarioFiltrado = inventarioCompleto.filter(producto => {
    let cumpleFiltroStock = true;
    if (filtroStock === 'bajo') {
      cumpleFiltroStock = Number(producto.stock) <= Number(producto.stock_minimo);
    } else if (filtroStock === 'normal') {
      cumpleFiltroStock = Number(producto.stock) > Number(producto.stock_minimo);
    }

    let cumpleFiltroActivo = true;
    if (filtroActivo === 'activos') {
      cumpleFiltroActivo = esActivo(producto.activo);
    } else if (filtroActivo === 'inactivos') {
      cumpleFiltroActivo = esInactivo(producto.activo);
    }

    const cumpleBusqueda = busqueda === '' || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltroStock && cumpleFiltroActivo && cumpleBusqueda;
  });

  // Preparar datos para gráficas
  const datosGraficaCategorias = reporteCategorias.map(cat => ({
    name: cat.categoria,
    productos: parseInt(cat.cantidad_productos),
    stock: parseInt(cat.total_stock),
    valor: parseFloat(cat.valor_total)
  }));

  const datosGraficaMovimientos = reporteMovimientos.reduce((acc, mov) => {
    const fecha = formatearFecha(mov.fecha_dia);
    const existing = acc.find(item => item.fecha === fecha);
   
    if (existing) {
      if (mov.tipo === 'entrada') {
        existing.entradas = parseInt(mov.total_unidades);
      } else {
        existing.salidas = parseInt(mov.total_unidades);
      }
    } else {
      acc.push({
        fecha,
        entradas: mov.tipo === 'entrada' ? parseInt(mov.total_unidades) : 0,
        salidas: mov.tipo === 'salida' ? parseInt(mov.total_unidades) : 0
      });
    }
   
    return acc;
  }, []);

  const datosGraficaTopProductos = reporteTopProductos.map(prod => ({
    name: prod.codigo,
    nombreCompleto: prod.nombre,
    entradas: parseInt(prod.total_entradas),
    salidas: parseInt(prod.total_salidas),
    movimientos: parseInt(prod.total_movimientos)
  }));

  const datosRadarCategorias = reporteCategorias.slice(0, 6).map(cat => ({
    categoria: cat.categoria,
    valor: parseFloat(cat.valor_total) / 1000,
    stock: parseInt(cat.total_stock) / 10,
    productos: parseInt(cat.cantidad_productos) * 10
  }));

  // Función para obtener gradiente de grises
  const getGrayGradient = (index) => {
    const intensities = [10, 30, 50, 70, 90, 110, 130, 150, 170, 190];
    return `linear-gradient(135deg, #${intensities[index]}${intensities[index]}${intensities[index]} 0%, #${Math.min(255, intensities[index] + 30)}${Math.min(255, intensities[index] + 30)}${Math.min(255, intensities[index] + 30)} 100%)`;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header Rediseñado - Posición diferente */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 72, px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GamesIcon sx={{ color: '#000', fontSize: 32 }} />
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 900, 
                      color: '#000',
                      letterSpacing: '-0.5px',
                      lineHeight: 1
                    }}
                  >
                    INVENTORY PRO
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                    Advanced Analytics Dashboard
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Chip 
                  icon={<AssessmentIcon />}
                  label="Business Intelligence" 
                  size="small" 
                  sx={{ 
                    height: 28,
                    fontWeight: 600,
                    bgcolor: 'rgba(0,0,0,0.06)',
                    color: '#000',
                    '& .MuiChip-icon': { fontSize: 16 }
                  }}
                />
                <Chip 
                  icon={<TrendingUpIcon />}
                  label="Real-time Data" 
                  size="small" 
                  sx={{ 
                    height: 28,
                    fontWeight: 600,
                    bgcolor: 'rgba(0,0,0,0.06)',
                    color: '#000',
                    '& .MuiChip-icon': { fontSize: 16 }
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Dashboard">
                <IconButton onClick={() => window.location.href = '/Usuarios'} sx={{ color: '#000' }}>
                  <DashboardIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => {
                    cargarReporteCategorias();
                    cargarAlertasStock();
                    cargarInventarioCompleto();
                  }}
                  sx={{ color: '#000' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ pb: 6 }}>
        {/* Mensajes reorganizados - Ahora en la parte superior derecha */}
        <Box sx={{ position: 'fixed', top: 100, right: 24, zIndex: 1000, width: 350 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)} 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '& .MuiAlert-icon': { color: '#ff3b30' }
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              onClose={() => setSuccess(null)} 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '& .MuiAlert-icon': { color: '#34c759' }
              }}
            >
              {success}
            </Alert>
          )}
        </Box>

        {/* Tarjetas de estadísticas en diseño horizontal compacto */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <CategoryIcon sx={{ color: '#000', fontSize: 28, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', mb: 0.5 }}>
                  {reporteCategorias.length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                  CATEGORÍAS
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <InventoryIcon sx={{ color: '#000', fontSize: 28, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', mb: 0.5 }}>
                  {reporteCategorias.reduce((sum, cat) => sum + parseInt(cat.cantidad_productos), 0)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                  PRODUCTOS
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <EqualizerIcon sx={{ color: '#000', fontSize: 28, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', mb: 0.5 }}>
                  {reporteCategorias.reduce((sum, cat) => sum + parseInt(cat.total_stock), 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                  STOCK TOTAL
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ color: '#000', fontSize: 28, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#000', mb: 0.5 }}>
                  {formatearMoneda(reporteCategorias.reduce((sum, cat) => sum + parseFloat(cat.valor_total), 0))}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                  VALOR TOTAL INVENTARIO
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 2, height: '100%', bgcolor: '#000', color: '#fff' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 28, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {alertasStock.length} ALERTAS
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  STOCK BAJO CRÍTICO
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Layout principal - Sidebar izquierdo con tabs y contenido a la derecha */}
        <Grid container spacing={3}>
          {/* Sidebar izquierdo */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={abrirModalCrear}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Nuevo Producto
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => descargarReporteExcel('completo')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Exportar Todo
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Export Reports
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { tipo: 'inventario', label: 'Inventory Report', icon: <InventoryIcon /> },
                    { tipo: 'movimientos', label: 'Movement Report', icon: <TimelineIcon /> },
                    { tipo: 'productos-movidos', label: 'Top Products', icon: <TrendingUpIcon /> },
                    { tipo: 'completo', label: 'Full System Report', icon: <AnalyticsIcon /> }
                  ].map((item) => (
                    <Button
                      key={item.tipo}
                      startIcon={item.icon}
                      onClick={() => descargarReporteExcel(item.tipo)}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Contenido principal */}
          <Grid item xs={12} md={9}>
            {/* Alertas de Stock - Nuevo diseño como banner horizontal */}
            {alertasStock.length > 0 && (
              <Card 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,149,0,0.1)',
                  border: '2px solid #ff9500'
                }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <WarningIcon sx={{ color: '#ff9500', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {alertasStock.length} Productos con Stock Bajo
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                          Atención requerida en inventario
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ bgcolor: '#ff9500', '&:hover': { bgcolor: '#e68900' } }}
                    >
                      Ver Detalles
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Tabs verticales en lugar de horizontales */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ 
                    width: 200, 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRight: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {[
                      { icon: <CategoryIcon />, label: 'Categories' },
                      { icon: <TimelineIcon />, label: 'Movements' },
                      { icon: <TrendingUpIcon />, label: 'Top Products' },
                      { icon: <InventoryIcon />, label: 'Inventory' },
                      { icon: <DashboardIcon />, label: 'Dashboard' }
                    ].map((tab, index) => (
                      <Button
                        key={index}
                        fullWidth
                        startIcon={tab.icon}
                        onClick={() => setTabActual(index)}
                        sx={{
                          justifyContent: 'flex-start',
                          px: 3,
                          py: 2,
                          borderRadius: 0,
                          borderBottom: '1px solid rgba(0,0,0,0.04)',
                          bgcolor: tabActual === index ? 'rgba(0,0,0,0.04)' : 'transparent',
                          color: tabActual === index ? '#000' : 'rgba(0,0,0,0.7)',
                          fontWeight: tabActual === index ? 600 : 400,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </Box>
                  
                  <Box sx={{ flex: 1, p: 3 }}>
                    {/* Tab 0: Reporte por Categorías - Diseño reorganizado */}
                    {tabActual === 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                              Category Analysis
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                              Detailed breakdown by product categories
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={cargarReporteCategorias}
                          >
                            Refresh
                          </Button>
                        </Box>

                        {loading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <Grid container spacing={3}>
                            {/* Gráfico circular a la izquierda, tabla a la derecha */}
                            <Grid item xs={12} lg={5}>
                              <Card sx={{ height: '100%' }}>
                                <CardContent>
                                  <Typography variant="h6" sx={{ mb: 2 }}>
                                    Value Distribution
                                  </Typography>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                      <Pie
                                        data={datosGraficaCategorias}
                                        dataKey="valor"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                      >
                                        {datosGraficaCategorias.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                      </Pie>
                                      <RechartsTooltip formatter={(value) => formatearMoneda(value)} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>
                            </Grid>

                            <Grid item xs={12} lg={7}>
                              <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 0 }}>
                                  <TableContainer>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Category</TableCell>
                                          <TableCell align="right">Products</TableCell>
                                          <TableCell align="right">Stock</TableCell>
                                          <TableCell align="right">Value</TableCell>
                                          <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {reporteCategorias.map((cat, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, bgcolor: COLORS[idx % COLORS.length], borderRadius: '50%' }} />
                                                {cat.categoria}
                                              </Box>
                                            </TableCell>
                                            <TableCell align="right">{cat.cantidad_productos}</TableCell>
                                            <TableCell align="right">{cat.total_stock}</TableCell>
                                            <TableCell align="right">
                                              <Typography sx={{ fontWeight: 600 }}>
                                                {formatearMoneda(cat.valor_total)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <IconButton size="small" onClick={() => verProductosCategoria(cat.categoria)}>
                                                <VisibilityIcon fontSize="small" />
                                              </IconButton>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    )}

                    {/* Tab 1: Movimientos - Diseño reorganizado */}
                    {tabActual === 1 && (
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                          Movement Analysis
                        </Typography>

                        {/* Filtros en línea */}
                        <Card sx={{ mb: 3, p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Start Date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.4)' }} /> }}
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                type="date"
                                label="End Date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.4)' }} /> }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                fullWidth
                                label="Search"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.4)' }} /> }}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={cargarReporteMovimientos}
                                disabled={loading}
                              >
                                Generate
                              </Button>
                            </Grid>
                          </Grid>
                        </Card>

                        {reporteMovimientos.length > 0 && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h6" sx={{ mb: 2 }}>
                                    Movement Trends
                                  </Typography>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={datosGraficaMovimientos}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="fecha" />
                                      <YAxis />
                                      <RechartsTooltip />
                                      <Legend />
                                      <Line type="monotone" dataKey="entradas" stroke="#34c759" strokeWidth={2} />
                                      <Line type="monotone" dataKey="salidas" stroke="#ff3b30" strokeWidth={2} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    )}

                    {/* Tab 2: Top Productos - Diseño reorganizado */}
                    {tabActual === 2 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                              Top Products Performance
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                              Most moved products in selected period
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              select
                              size="small"
                              label="Period"
                              value={diasTopProductos}
                              onChange={(e) => setDiasTopProductos(e.target.value)}
                              sx={{ width: 120 }}
                            >
                              <MenuItem value={7}>7 days</MenuItem>
                              <MenuItem value={30}>30 days</MenuItem>
                              <MenuItem value={90}>90 days</MenuItem>
                            </TextField>
                            <Button
                              variant="contained"
                              onClick={cargarReporteTopProductos}
                            >
                              Update
                            </Button>
                          </Box>
                        </Box>

                        {reporteTopProductos.length > 0 && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h6" sx={{ mb: 2 }}>
                                    Product Movement Comparison
                                  </Typography>
                                  <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={datosGraficaTopProductos}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <RechartsTooltip />
                                      <Legend />
                                      <Bar dataKey="entradas" fill="#34c759" name="Incoming" />
                                      <Bar dataKey="salidas" fill="#ff3b30" name="Outgoing" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    )}

                    {/* Tab 3: Inventario - Diseño reorganizado */}
                    {tabActual === 3 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                              Inventory Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                              Complete product inventory with filters and actions
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={abrirModalCrear}
                          >
                            Add Product
                          </Button>
                        </Box>

                        {/* Filtros en tarjeta separada */}
                        <Card sx={{ mb: 3, p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                              <TextField
                                fullWidth
                                label="Search products..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.4)' }} /> }}
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <FormControl fullWidth>
                                <InputLabel>Stock Status</InputLabel>
                                <Select value={filtroStock} label="Stock Status" onChange={(e) => setFiltroStock(e.target.value)}>
                                  <MenuItem value="todos">All</MenuItem>
                                  <MenuItem value="bajo">Low Stock</MenuItem>
                                  <MenuItem value="normal">Normal</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <FormControl fullWidth>
                                <InputLabel>Product Status</InputLabel>
                                <Select value={filtroActivo} label="Product Status" onChange={(e) => setFiltroActivo(e.target.value)}>
                                  <MenuItem value="todos">All</MenuItem>
                                  <MenuItem value="activos">Active</MenuItem>
                                  <MenuItem value="inactivos">Inactive</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={cargarInventarioCompleto}
                              >
                                Filter
                              </Button>
                            </Grid>
                          </Grid>
                        </Card>

                        {/* Tabla de inventario */}
                        <Card>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product</TableCell>
                                  <TableCell align="center">Category</TableCell>
                                  <TableCell align="center">Stock</TableCell>
                                  <TableCell align="right">Price</TableCell>
                                  <TableCell align="center">Status</TableCell>
                                  <TableCell align="center">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {inventarioFiltrado.map((producto) => (
                                  <TableRow key={producto.id}>
                                    <TableCell>
                                      <Box>
                                        <Typography sx={{ fontWeight: 600 }}>
                                          {producto.nombre}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                          {producto.codigo}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip label={producto.categoria} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <Typography sx={{ fontWeight: 700 }}>
                                          {producto.stock}
                                        </Typography>
                                        {Number(producto.stock) <= Number(producto.stock_minimo) && (
                                          <ArrowDownIcon sx={{ color: '#ff3b30', fontSize: 16 }} />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                      {formatearMoneda(producto.precio)}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={esActivo(producto.activo) ? 'Active' : 'Inactive'}
                                        size="small"
                                        color={esActivo(producto.activo) ? 'success' : 'default'}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Stack direction="row" spacing={1} justifyContent="center">
                                        <Tooltip title="Edit">
                                          <IconButton size="small" onClick={() => abrirModalEditar(producto)}>
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title={esActivo(producto.activo) ? 'Deactivate' : 'Activate'}>
                                          <IconButton size="small" onClick={() => toggleEstadoProducto(producto)}>
                                            {esActivo(producto.activo) ? (
                                              <DeleteIcon fontSize="small" />
                                            ) : (
                                              <RestoreIcon fontSize="small" />
                                            )}
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Card>
                      </Box>
                    )}

                    {/* Tab 4: Dashboard - Diseño reorganizado */}
                    {tabActual === 4 && (
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                          Analytics Dashboard
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                  Inventory Overview
                                </Typography>
                                <ResponsiveContainer width="100%" height={350}>
                                  <BarChart data={datosGraficaCategorias}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="productos" fill="#666666" name="Products" />
                                    <Bar yAxisId="left" dataKey="stock" fill="#999999" name="Stock" />
                                    <Bar yAxisId="right" dataKey="valor" fill="#000000" name="Value (MXN)" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Modales (sin cambios en estructura interna, solo posicionamiento) */}
      <Dialog
        open={modalCategoria}
        onClose={() => setModalCategoria(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Products in {categoriaSeleccionada}
          <Typography variant="caption" display="block" sx={{ color: 'rgba(0,0,0,0.6)' }}>
            {productosPorCategoria.length} products found
          </Typography>
        </DialogTitle>
        <DialogContent>
          {productosPorCategoria.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosPorCategoria.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{prod.nombre}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>{prod.codigo}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{prod.stock}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                            Min: {prod.stock_minimo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatearMoneda(prod.precio)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={esActivo(prod.activo) ? 'Active' : 'Inactive'}
                          size="small"
                          color={esActivo(prod.activo) ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No products in this category</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalCategoria(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modalProducto}
        onClose={() => setModalProducto(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modoEdicion ? 'Edit Product' : 'Create Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code"
                name="codigo"
                value={formProducto.codigo}
                onChange={handleInputChange}
                disabled={modoEdicion}
                error={!!erroresForm.codigo}
                helperText={erroresForm.codigo}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                name="categoria"
                value={formProducto.categoria}
                onChange={handleInputChange}
                error={!!erroresForm.categoria}
                helperText={erroresForm.categoria}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="nombre"
                value={formProducto.nombre}
                onChange={handleInputChange}
                error={!!erroresForm.nombre}
                helperText={erroresForm.nombre}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="descripcion"
                value={formProducto.descripcion}
                onChange={handleInputChange}
                multiline
                rows={2}
                error={!!erroresForm.descripcion}
                helperText={erroresForm.descripcion}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Unit"
                name="unidad"
                value={formProducto.unidad}
                onChange={handleInputChange}
              >
                <MenuItem value="unidad">Unit</MenuItem>
                <MenuItem value="kg">Kilogram</MenuItem>
                <MenuItem value="g">Gram</MenuItem>
                <MenuItem value="l">Liter</MenuItem>
                <MenuItem value="ml">Milliliter</MenuItem>
                <MenuItem value="caja">Box</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={formProducto.stock}
                onChange={handleInputChange}
                error={!!erroresForm.stock}
                helperText={erroresForm.stock}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Stock"
                name="stock_minimo"
                type="number"
                value={formProducto.stock_minimo}
                onChange={handleInputChange}
                error={!!erroresForm.stock_minimo}
                helperText={erroresForm.stock_minimo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                name="precio"
                type="number"
                value={formProducto.precio}
                onChange={handleInputChange}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                error={!!erroresForm.precio}
                helperText={erroresForm.precio}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalProducto(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={modoEdicion ? editarProducto : crearProducto}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (modoEdicion ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer reorganizado */}
      <Box sx={{ mt: 8, py: 3, bgcolor: '#000', color: '#fff' }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Inventory Pro Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Advanced inventory management and analytics system
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  © {new Date().getFullYear()} GameStore
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  v2.1.0
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Reportes;