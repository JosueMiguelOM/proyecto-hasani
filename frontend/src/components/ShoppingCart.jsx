import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('products');
  const [user, setUser] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Cargar datos iniciales
  useEffect(() => {
    loadUser();
    loadProducts();
    loadCart();
    loadOrders();
  }, []);

  // Estilos globales
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: '#1a1a1a',
      padding: '0',
      margin: '0',
      overflowX: 'hidden'
    },
    header: {
      position: 'sticky',
      top: '0',
      zIndex: '100',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #f0f0f0',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    },
    navButton: {
      border: 'none',
      background: 'transparent',
      color: '#1a1a1a',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 24px',
      cursor: 'pointer',
      borderRadius: '50px',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    activeNavButton: {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      transform: 'scale(1.05)'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'transparent',
      border: '1px solid #e0e0e0',
      color: '#1a1a1a',
      padding: '10px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '30px',
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    productCard: {
      background: '#ffffff',
      border: '1px solid #f0f0f0',
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      cursor: 'pointer'
    },
    productImage: {
      width: '100%',
      height: '240px',
      objectFit: 'cover',
      transition: 'transform 0.6s ease'
    },
    productInfo: {
      padding: '24px',
      position: 'relative'
    },
    addToCartBtn: {
      position: 'absolute',
      bottom: '24px',
      right: '24px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      transition: 'all 0.3s ease',
      transform: 'scale(0)',
      opacity: '0'
    },
    cartSidebar: {
      position: 'fixed',
      top: '0',
      right: isCartOpen ? '0' : '-400px',
      width: '380px',
      height: '100vh',
      backgroundColor: '#ffffff',
      boxShadow: '-5px 0 30px rgba(0,0,0,0.1)',
      transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: '1000',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column'
    },
    cartItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid #f0f0f0',
      animation: 'slideIn 0.3s ease'
    },
    checkoutButton: {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: 'none',
      padding: '18px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      marginTop: '20px'
    },
    orderCard: {
      background: '#ffffff',
      border: '1px solid #f0f0f0',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    statusBadge: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    sectionTitle: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '40px',
      textAlign: 'center',
      position: 'relative',
      paddingBottom: '20px'
    },
    sectionTitleLine: {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60px',
      height: '3px',
      backgroundColor: '#1a1a1a'
    },
    cartCounter: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ff4444',
      color: 'white',
      borderRadius: '50%',
      width: '22px',
      height: '22px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginLeft: 'auto'
    },
    quantityBtn: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: '1px solid #e0e0e0',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  // Animaciones CSS
  const keyframes = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
  `;

  // Funciones de carga (sin cambios)
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('shoppingCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/ordenes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, {
        productId: product.id,
        name: product.nombre,
        price: parseFloat(product.precio),
        quantity: 1,
        image: product.imagen_url
      }];
    }

    saveCart(newCart);
    // Animación de confirmación
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      button.style.animation = 'pulse 0.3s ease';
      setTimeout(() => {
        button.style.animation = '';
      }, 300);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    saveCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_URL}/pagos/crear-orden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          total: getCartTotal()
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.data.approvalUrl;
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA726',
      processing: '#29B6F6',
      completed: '#66BB6A',
      cancelled: '#EF5350',
      refunded: '#78909C'
    };
    return colors[status] || '#78909C';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'PENDIENTE',
      processing: 'PROCESANDO',
      completed: 'COMPLETADO',
      cancelled: 'CANCELADO',
      refunded: 'REEMBOLSADO'
    };
    return texts[status] || status.toUpperCase();
  };

  return (
    <div style={styles.container}>
      {/* Inyectar animaciones CSS */}
      <style>{keyframes}</style>
      
      {/* Header minimalista */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={styles.backButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Volver
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {['products', 'orders'].map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                style={{
                  ...styles.navButton,
                  ...(currentView === view ? styles.activeNavButton : {})
                }}
                onMouseEnter={(e) => {
                  if (currentView !== view) {
                    e.target.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== view) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {view === 'products' ? '🏪 Productos' : '📋 Mis Pedidos'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {user && (
            <div style={{ fontSize: '14px', color: '#666' }}>
              👋 Hola, <strong>{user.nombre}</strong>
            </div>
          )}
          
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            style={{
              ...styles.navButton,
              position: 'relative'
            }}
          >
            🛒 Carrito
            {cart.length > 0 && (
              <span style={styles.cartCounter}>
                {getCartItemsCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Carrito lateral */}
      <div style={styles.cartSidebar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>Tu Carrito</h3>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛒</div>
              <p style={{ margin: '0', fontSize: '16px' }}>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} style={styles.cartItem}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginRight: '15px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {formatPrice(item.price)} × {item.quantity}
                  </div>
                </div>
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={styles.quantityBtn}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  style={{
                    marginLeft: '15px',
                    background: 'transparent',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.color = '#ff4444'}
                  onMouseLeave={(e) => e.target.color = '#999'}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Total:</span>
              <span style={{ fontSize: '28px', fontWeight: '700' }}>
                {formatPrice(getCartTotal())}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                ...styles.checkoutButton,
                ...(loading ? { backgroundColor: '#666' } : {})
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'PROCESANDO...' : 'PAGAR AHORA'}
            </button>
          </div>
        )}
      </div>

      {/* Overlay para carrito */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: '999',
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Contenido principal */}
      <main style={{ padding: '0 40px 40px', animation: 'fadeIn 0.5s ease' }}>
        {/* Vista de Productos */}
        {currentView === 'products' && (
          <>
            <div style={{ textAlign: 'center', margin: '60px 0 40px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>
                Productos Destacados
              </h1>
              <p style={{ fontSize: '18px', color: '#666', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
                Descubre nuestra selección premium de productos
              </p>
            </div>
            
            <div style={styles.productGrid}>
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  style={{
                    ...styles.productCard,
                    animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                  }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img 
                    src={product.imagen_url} 
                    alt={product.nombre}
                    style={{
                      ...styles.productImage,
                      transform: hoveredProduct === product.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                  <div style={styles.productInfo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>
                          {product.nombre}
                        </h3>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#666'
                        }}>
                          {product.categoria}
                        </span>
                      </div>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a' }}>
                        {formatPrice(product.precio)}
                      </span>
                    </div>
                    
                    <p style={{ 
                      margin: '0 0 40px 0', 
                      color: '#666', 
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}>
                      {product.descripcion}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: product.stock > 0 ? '#66BB6A' : '#EF5350', fontWeight: '600' }}>
                        {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Sin stock'}
                      </span>
                      <button
                        data-product-id={product.id}
                        onClick={() => product.stock > 0 && addToCart(product)}
                        disabled={product.stock <= 0}
                        style={{
                          ...styles.addToCartBtn,
                          transform: hoveredProduct === product.id ? 'scale(1)' : 'scale(0)',
                          opacity: hoveredProduct === product.id ? '1' : '0',
                          backgroundColor: product.stock > 0 ? '#1a1a1a' : '#999',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Vista de Pedidos */}
        {currentView === 'orders' && (
          <>
            <div style={{ textAlign: 'center', margin: '60px 0 40px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>
                Historial de Pedidos
              </h1>
              <p style={{ fontSize: '18px', color: '#666', marginTop: '16px' }}>
                Revisa el estado de tus compras anteriores
              </p>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', color: '#999' }}>
                  <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                    No hay pedidos aún
                  </h3>
                  <p style={{ fontSize: '16px', marginBottom: '30px' }}>
                    Realiza tu primera compra para verla aquí
                  </p>
                  <button
                    onClick={() => setCurrentView('products')}
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'white',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Explorar Productos
                  </button>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div 
                    key={order.id}
                    style={{
                      ...styles.orderCard,
                      animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
                          Pedido #{order.id}
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                          📅 {formatDate(order.fecha_creacion)}
                        </p>
                      </div>
                      <span style={{ fontSize: '22px', fontWeight: '800' }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(order.estado)
                    }}>
                      {getStatusText(order.estado)}
                    </div>

                    {order.items && (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#666' }}>
                          ARTÍCULOS COMPRADOS:
                        </h4>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {JSON.parse(typeof order.items === 'string' ? order.items : JSON.stringify(order.items)).map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '8px' }}>
                              • Producto #{item.productId} - Cantidad: {item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {order.paypal_capture_id && (
                      <div style={{ 
                        marginTop: '16px', 
                        fontSize: '12px', 
                        color: '#999',
                        padding: '8px 12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px'
                      }}>
                        🔗 ID de transacción: {order.paypal_capture_id}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer minimalista */}
      <footer style={{
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px',
        borderTop: '1px solid #f0f0f0',
        marginTop: '60px'
      }}>
        <p style={{ margin: '0' }}>
          © {new Date().getFullYear()} Tienda Online. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default ShoppingCart;