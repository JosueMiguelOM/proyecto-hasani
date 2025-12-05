const notificationService = require('../services/notificationService');

// Middleware para notificaciones automáticas sobre eventos del sistema
const notificationMiddleware = {
  // Notificar cuando admin modifica datos de usuario
  onUserDataModified: async (adminId, modifiedUserId, changes) => {
    try {
      const changeCount = Object.keys(changes).length;
      const campos = changeCount === 1 ? 'un campo' : `${changeCount} campos`;
      
      await notificationService.createNotification({
        userId: modifiedUserId,
        tipo: 'administración',
        titulo: '📋 Actualización de tu perfil',
        mensaje: `Hemos actualizado ${campos} de tu información personal. Estos cambios fueron realizados por nuestro equipo de soporte.`,
        datosAdicionales: {
          adminId,
          changes,
          timestamp: new Date().toISOString()
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error en notificación de modificación:', error);
    }
  },

  // Notificar actividad sospechosa
  onSuspiciousActivity: async (userId, activityDetails) => {
    try {
      await notificationService.createNotification({
        userId,
        tipo: 'seguridad',
        titulo: '🔒 Actividad inusual detectada',
        mensaje: `Hemos identificado un acceso a tu cuenta que parece inusual. Por tu seguridad, te recomendamos revisar tu actividad reciente.`,
        datosAdicionales: activityDetails,
        priority: 'high'
      });

      // También notificar a administradores
      await notificationService.notifyAdmins({
        tipo: 'seguridad',
        titulo: '⚠️ Alerta de seguridad',
        mensaje: `Posible actividad inusual detectada en la cuenta del usuario ID: ${userId}. Se recomienda revisión.`,
        datosAdicionales: activityDetails,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error en notificación de seguridad:', error);
    }
  },

  // Notificar sobre actualizaciones del sistema
  onSystemUpdate: async (updateDetails) => {
    try {
      const emoji = updateDetails.type === 'maintenance' ? '🛠️' : 
                    updateDetails.type === 'feature' ? '✨' : 
                    updateDetails.type === 'bugfix' ? '🐛' : '📢';
      
      await notificationService.broadcastToAll({
        tipo: 'sistema',
        titulo: `${emoji} ${updateDetails.title || 'Novedades del sistema'}`,
        mensaje: updateDetails.message,
        datosAdicionales: updateDetails,
        priority: 'low'
      });
    } catch (error) {
      console.error('Error en notificación de actualización:', error);
    }
  },

  // Nueva: Notificación de bienvenida
  onUserRegistered: async (userId, userName) => {
    try {
      await notificationService.createNotification({
        userId,
        tipo: 'bienvenida',
        titulo: '👋 ¡Bienvenido/a a nuestra plataforma!',
        mensaje: `Hola ${userName}, estamos muy contentos de tenerte con nosotros. Tu cuenta ha sido creada exitosamente.`,
        datosAdicionales: {
          welcomeDate: new Date().toISOString(),
          nextSteps: ['Completa tu perfil', 'Explora nuestras funciones', 'Configura tus preferencias']
        },
        priority: 'low'
      });
    } catch (error) {
      console.error('Error en notificación de bienvenida:', error);
    }
  },

  // Nueva: Notificación de pago exitoso
  onPaymentSuccess: async (userId, paymentDetails) => {
    try {
      await notificationService.createNotification({
        userId,
        tipo: 'transacción',
        titulo: '✅ Pago confirmado',
        mensaje: `Tu transacción por $${paymentDetails.amount} ha sido procesada exitosamente. Número de referencia: ${paymentDetails.reference}`,
        datosAdicionales: paymentDetails,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error en notificación de pago:', error);
    }
  },

  // Nueva: Notificación de carrito abandonado
  onCartAbandoned: async (userId, cartItems) => {
    try {
      const itemCount = cartItems.length;
      const itemText = itemCount === 1 ? 'un artículo' : `${itemCount} artículos`;
      
      await notificationService.createNotification({
        userId,
        tipo: 'recordatorio',
        titulo: '🛍️ ¿Sigues interesado/a?',
        mensaje: `Vimos que dejaste ${itemText} en tu carrito. ¡Aún están disponibles!`,
        datosAdicionales: {
          cartItems,
          timestamp: new Date().toISOString(),
          expiresIn: '24 hours'
        },
        priority: 'low'
      });
    } catch (error) {
      console.error('Error en notificación de carrito:', error);
    }
  },

  // Nueva: Notificación de orden completada
  onOrderCompleted: async (userId, orderDetails) => {
    try {
      await notificationService.createNotification({
        userId,
        tipo: 'orden',
        titulo: '🚚 Orden en proceso',
        mensaje: `¡Excelente! Tu orden #${orderDetails.orderId} ha sido confirmada y está siendo preparada.`,
        datosAdicionales: orderDetails,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error en notificación de orden:', error);
    }
  },

  // Nueva: Notificación de soporte respondido
  onSupportResponse: async (userId, ticketDetails) => {
    try {
      await notificationService.createNotification({
        userId,
        tipo: 'soporte',
        titulo: '💬 Nueva respuesta a tu consulta',
        mensaje: `Nuestro equipo de soporte ha respondido a tu ticket #${ticketDetails.ticketId}.`,
        datosAdicionales: ticketDetails,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error en notificación de soporte:', error);
    }
  }
};

module.exports = notificationMiddleware;