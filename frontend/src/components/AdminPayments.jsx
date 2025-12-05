import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/admin/ordenes-pendientes`, {
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

  const verifyPayPalOrder = async (paypalOrderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/admin/verificar-orden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paypalOrderId })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Estado en PayPal: ${data.data.status}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error verificando orden en PayPal');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error verificando orden:', error);
      setMessage('❌ Error de conexión con PayPal');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const capturePayment = async (orderId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/admin/capturar-orden/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Pago capturado exitosamente');
        loadPendingOrders();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error capturando pago');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const approveManual = async (orderId) => {
    const notes = prompt('Ingrese notas para esta aprobación manual:');
    if (notes === null) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pagos/admin/aprobar-manual/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Orden aprobada manualmente');
        loadPendingOrders();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error aprobando orden');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },
    header: {
      maxWidth: '1200px',
      margin: '0 auto 30px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#000',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '30px'
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
    },
    actionBar: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#000',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.3px'
    },
    buttonSecondary: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: '#000',
      border: '2px solid #000',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    ordersGrid: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gap: '20px'
    },
    orderCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: '1px solid #eaeaea',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    },
    orderHeader: {
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      borderBottom: '1px solid #eaeaea',
      cursor: 'pointer'
    },
    orderInfo: {
      flex: '1'
    },
    orderNumber: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#000',
      marginBottom: '8px'
    },
    orderMeta: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      marginBottom: '12px'
    },
    metaItem: {
      fontSize: '14px',
      color: '#666'
    },
    metaValue: {
      color: '#000',
      fontWeight: '500'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: '#fff3cd',
      color: '#856404',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      border: '1px solid #ffeaa7'
    },
    orderActions: {
      display: 'flex',
      gap: '12px',
      flexDirection: 'column',
      minWidth: '180px'
    },
    actionButton: {
      padding: '10px 16px',
      backgroundColor: '#000',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    actionButtonSecondary: {
      padding: '10px 16px',
      backgroundColor: 'transparent',
      color: '#000',
      border: '1px solid #000',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    orderDetails: {
      padding: '24px',
      backgroundColor: '#fafafa',
      borderTop: '1px solid #eaeaea',
      animation: 'slideDown 0.3s ease-out'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#000',
      marginBottom: '16px'
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    itemCard: {
      backgroundColor: '#fff',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #eaeaea'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      maxWidth: '600px',
      margin: '0 auto'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '24px',
      opacity: '0.5'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#000',
      marginBottom: '12px'
    },
    emptyText: {
      fontSize: '16px',
      color: '#666',
      lineHeight: '1.6'
    }
  };

  const buttonHover = `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  `;

  const keyframes = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
      }
      to {
        max-height: 500px;
        opacity: 1;
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      
      {message && (
        <div style={styles.messageContainer}>
          <div style={styles.message}>
            {message}
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Panel de Administración de Pagos</h1>
        <p style={styles.subtitle}>
          Gestiona y aprueba los pagos pendientes del sistema
        </p>
        
        <div style={styles.actionBar}>
          <button
            onClick={() => navigate('/Usuarios')}
            style={{
              ...styles.buttonSecondary,
              ...(!loading && { ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } })
            }}
          >
            ← Volver a Usuarios
          </button>
          
          <button
            onClick={loadPendingOrders}
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled),
              ...(!loading && { ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } })
            }}
          >
            ⟳ Actualizar Lista
          </button>
        </div>
      </div>

      {orders.length > 0 ? (
        <div style={styles.ordersGrid}>
          {orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <div 
                style={styles.orderHeader}
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div style={styles.orderInfo}>
                  <div style={styles.orderNumber}>
                    Orden #{order.id} • {order.user_name}
                  </div>
                  
                  <div style={styles.orderMeta}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaValue}>{order.user_email}</span>
                    </div>
                    <div style={styles.metaItem}>
                      Total: <span style={styles.metaValue}>{formatPrice(order.total)}</span>
                    </div>
                    <div style={styles.metaItem}>
                      Fecha: <span style={styles.metaValue}>{formatDate(order.fecha_creacion)}</span>
                    </div>
                  </div>
                  
                  <div style={styles.statusBadge}>
                    {order.estado}
                  </div>
                </div>
                
                <div style={styles.orderActions}>
                  {order.paypal_order_id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          verifyPayPalOrder(order.paypal_order_id);
                        }}
                        style={{
                          ...styles.actionButton,
                          ...{ ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }
                        }}
                      >
                        Verificar en PayPal
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          capturePayment(order.id);
                        }}
                        disabled={loading}
                        style={{
                          ...styles.actionButton,
                          ...(loading && styles.buttonDisabled),
                          ...(!loading && { ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } })
                        }}
                      >
                        Capturar Pago
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      approveManual(order.id);
                    }}
                    disabled={loading}
                    style={{
                      ...styles.actionButtonSecondary,
                      ...(loading && styles.buttonDisabled),
                      ...(!loading && { ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } })
                    }}
                  >
                    Aprobar Manualmente
                  </button>
                </div>
              </div>
              
              {expandedOrders[order.id] && (
                <div style={styles.orderDetails}>
                  <h4 style={styles.sectionTitle}>Detalles de la Orden</h4>
                  {order.paypal_order_id && (
                    <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                      <strong>PayPal ID:</strong> {order.paypal_order_id}
                    </p>
                  )}
                  
                  <h4 style={styles.sectionTitle}>Productos</h4>
                  <div style={styles.itemsList}>
                    {order.items && (
                      JSON.parse(typeof order.items === 'string' ? order.items : JSON.stringify(order.items)).map((item, index) => (
                        <div key={index} style={styles.itemCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <strong>Producto ID:</strong> {item.productId}
                            </div>
                            <div>
                              <strong>Cantidad:</strong> {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✅</div>
          <h2 style={styles.emptyTitle}>No hay órdenes pendientes</h2>
          <p style={styles.emptyText}>
            Todas las órdenes han sido procesadas y aprobadas. 
            Las nuevas órdenes aparecerán aquí automáticamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;