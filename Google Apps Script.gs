// ============================================
// Google Apps Script para El Oso
// ============================================

const CONFIG = {
  SHEET_ID: 'xxx',
  ORDERS_SHEET_NAME: 'Web - Pedidos',
  PRODUCTS_SHEET_NAME: 'Web - Productos',
  LOGS_SHEET_NAME: 'Web - Logs',
  ADMIN_EMAIL: 'xxx@gmail.com',
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  CACHE_DURATION: 1800,
  META_PIXEL_ID: 'xxx',
  META_ACCESS_TOKEN: 'xxx'
};

// ====== SISTEMA DE LOGS ======
function logError(error, context = '', additionalData = {}) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      const headers = ['Fecha', 'Hora', 'Tipo', 'Contexto', 'Mensaje', 'URL', 'UserAgent', 'IP', 'Datos Adicionales'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.setFrozenRows(1);
    }
    
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
    const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');
    
    const request = ScriptApp.getRequest ? ScriptApp.getRequest() : null;
    const url = request ? request.url : 'N/A';
    const userAgent = request ? request.userAgent : 'N/A';
    const ip = request ? request.sourceIp : 'N/A';
    
    const errorMessage = error.message || error.toString();
    const errorType = error.name || 'Error';
    const additionalDataJson = JSON.stringify(additionalData) || '{}';
    
    const lastRow = logsSheet.getLastRow() + 1;
    logsSheet.getRange(lastRow, 1, 1, 9).setValues([[
      formattedDate,
      formattedTime,
      errorType,
      context,
      errorMessage,
      url,
      userAgent,
      ip,
      additionalDataJson
    ]]);
    
    if (errorType.includes('Error') || errorType.includes('Exception')) {
      logsSheet.getRange(lastRow, 1, 1, 9).setBackground('#ffcccc');
    }
    
    console.error(`[LOG] ${errorType} en ${context}: ${errorMessage}`);
    
  } catch (logError) {
    console.error('Error al escribir en el log:', logError);
  }
}

function logInfo(message, context = '', data = {}) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      const headers = ['Fecha', 'Hora', 'Tipo', 'Contexto', 'Mensaje', 'URL', 'UserAgent', 'IP', 'Datos Adicionales'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.setFrozenRows(1);
    }
    
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
    const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');
    
    const request = ScriptApp.getRequest ? ScriptApp.getRequest() : null;
    const url = request ? request.url : 'N/A';
    const userAgent = request ? request.userAgent : 'N/A';
    const ip = request ? request.sourceIp : 'N/A';
    
    const dataJson = JSON.stringify(data) || '{}';
    
    const lastRow = logsSheet.getLastRow() + 1;
    logsSheet.getRange(lastRow, 1, 1, 9).setValues([[
      formattedDate,
      formattedTime,
      'INFO',
      context,
      message,
      url,
      userAgent,
      ip,
      dataJson
    ]]);
    
    console.log(`[INFO] ${context}: ${message}`);
    
  } catch (logError) {
    console.error('Error al escribir log info:', logError);
  }
}

// ====== MANEJAR SOLICITUDES GET ======
function doGet(e) {
  const params = e ? e.parameter : {};
  const action = params.action;
  
  try {
    let result;
    
    switch(action) {
      case 'getProducts':
        result = handleGetProducts();
        break;
      default:
        result = {
          success: false,
          message: 'Acción no válida',
          availableActions: ['getProducts']
        };
    }
    
    return createJsonResponse(result);
    
  } catch (error) {
    logError(error, 'doGet', { action: action, params: params });
    return createJsonResponse({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// ====== MANEJAR SOLICITUDES POST ======
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos en la solicitud POST');
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const orderData = data.orderData;
    
    if (action === 'submitOrder' && orderData) {
      const result = submitOrderToSheet(orderData);
      return createJsonResponse(result);
    } else {
      throw new Error('Acción o datos inválidos. Se esperaba submitOrder');
    }
    
  } catch (error) {
    logError(error, 'doPost', { 
      postData: e ? e.postData.contents.substring(0, 500) : 'N/A'
    });
    return createJsonResponse({
      success: false,
      message: 'Error procesando solicitud POST',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// ====== OBTENER PRODUCTOS CON CACHE ======
function handleGetProducts() {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'eloso_products';
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      parsed.cached = true;
      parsed.cacheTimestamp = new Date().toISOString();
      return parsed;
    }
    
    const products = getProductsFromSheet();
    
    const result = {
      success: true,
      products: products,
      count: products.length,
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    cache.put(cacheKey, JSON.stringify(result), CONFIG.CACHE_DURATION);
    
    return result;
    
  } catch (error) {
    logError(error, 'getProducts');
    return {
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
      products: [],
      count: 0,
      timestamp: new Date().toISOString()
    };
  }
}

// ====== OBTENER PRODUCTOS DESDE SHEET ======
function getProductsFromSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET_NAME);
    
    if (!sheet) {
      logError(new Error('Hoja de productos no encontrada'), 'getProductsFromSheet');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0].map(h => h.toString().trim());
    const products = [];
    
    // Definir índices de columnas (se admiten nombres en español e inglés)
    const colIndex = {
      id: headers.indexOf('ID') !== -1 ? headers.indexOf('ID') : -1,
      name: headers.indexOf('Nombre') !== -1 ? headers.indexOf('Nombre') : headers.indexOf('Name'),
      category: headers.indexOf('Categoría') !== -1 ? headers.indexOf('Categoría') : headers.indexOf('Category'),
      price: headers.indexOf('Precio') !== -1 ? headers.indexOf('Precio') : headers.indexOf('Price'),
      image: headers.indexOf('Imagen') !== -1 ? headers.indexOf('Imagen') : headers.indexOf('Image'),
      info: headers.indexOf('Info') !== -1 ? headers.indexOf('Info') : -1,
      stock: headers.indexOf('Stock') !== -1 ? headers.indexOf('Stock') : -1,
      description: headers.indexOf('Descripción') !== -1 ? headers.indexOf('Descripción') : headers.indexOf('Description'),
      active: headers.indexOf('Disponible') !== -1 ? headers.indexOf('Disponible') : headers.indexOf('Active'),
      presentation: headers.indexOf('Presentación') !== -1 ? headers.indexOf('Presentación') : headers.indexOf('Presentation')
    };
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }
      
      const productId = colIndex.id >= 0 ? parseInt(row[colIndex.id]) || i : i;
      const productName = colIndex.name >= 0 ? (row[colIndex.name] || '').toString().trim() : 'Producto ' + i;
      const category = colIndex.category >= 0 ? (row[colIndex.category] || 'cerveza').toString().trim().toLowerCase() : 'cerveza';
      const price = colIndex.price >= 0 ? parseFloat(row[colIndex.price]) || 0 : 0;
      const image = colIndex.image >= 0 ? (row[colIndex.image] || '').toString().trim() : '';
      const info = colIndex.info >= 0 ? (row[colIndex.info] || '').toString().trim() : (colIndex.description >= 0 ? (row[colIndex.description] || '').toString().trim() : '');
      const stock = colIndex.stock >= 0 ? parseInt(row[colIndex.stock]) || 0 : 0;
      const description = colIndex.description >= 0 ? (row[colIndex.description] || '').toString().trim() : '';
      
      // Parsear disponibilidad (acepta TRUE, true, Sí, SI, 1, etc.)
      let active = true; // por defecto, si no se especifica, asumimos activo
      if (colIndex.active >= 0) {
        const activeVal = row[colIndex.active];
        if (activeVal === false || activeVal === 'FALSE' || activeVal === 'false' || activeVal === 'NO' || activeVal === 'No' || activeVal === 'no' || activeVal === '0') {
          active = false;
        } else if (activeVal === true || activeVal === 'TRUE' || activeVal === 'true' || activeVal === 'SI' || activeVal === 'Sí' || activeVal === 'sí' || activeVal === '1') {
          active = true;
        } else {
          active = true; // cualquier otro valor, asumimos activo
        }
      }
      
      const presentation = colIndex.presentation >= 0 ? (row[colIndex.presentation] || '').toString().trim() : 'Unidad';
      
      products.push({
        id: productId,
        name: productName,
        category: category,
        price: price,
        image: image,
        info: info,
        stock: stock,
        description: description,
        active: active,
        presentation: presentation
      });
    }
    
    return products;
    
  } catch (error) {
    logError(error, 'getProductsFromSheet');
    return [];
  }
}

// ====== ASEGURAR QUE LA HOJA DE PEDIDOS TENGA LAS COLUMNAS NECESARIAS ======
function ensureOrderSheetColumns() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.ORDERS_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.ORDERS_SHEET_NAME);
    const headers = [
      'Fecha', 'Hora', 'Pedido', 'Estado', 'Cliente', 'Email', 'Teléfono',
      'Dirección', 'Localidad', 'Día Entrega', 'Horario',
      'Productos', 'Subtotal', 'Descuento', 'Cupón', 'Envío', 'Total', 'Notas'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return { sheet, added: headers };
  }
  
  // Verificar columnas existentes y agregar las que falten
  const headersRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const currentHeaders = headersRow.map(h => h.toString().trim());
  
  const requiredHeaders = [
    'Fecha', 'Hora', 'Pedido', 'Estado', 'Cliente', 'Email', 'Teléfono',
    'Dirección', 'Localidad', 'Día Entrega', 'Horario',
    'Productos', 'Subtotal', 'Descuento', 'Cupón', 'Envío', 'Total', 'Notas'
  ];
  
  const newColumns = [];
  requiredHeaders.forEach((header, index) => {
    if (!currentHeaders.includes(header)) {
      newColumns.push(header);
    }
  });
  
  if (newColumns.length > 0) {
    const lastCol = sheet.getLastColumn();
    sheet.insertColumnsAfter(lastCol, newColumns.length);
    for (let i = 0; i < newColumns.length; i++) {
      sheet.getRange(1, lastCol + 1 + i).setValue(newColumns[i]);
    }
  }
  
  return { sheet, added: newColumns };
}

// ====== GUARDAR PEDIDO ======
function submitOrderToSheet(orderData) {
  try {
    // Validación básica
    if (!orderData.orderNumber || !orderData.customer || !orderData.items || orderData.items.length === 0) {
      const error = new Error('Datos del pedido incompletos');
      logError(error, 'submitOrderToSheet', { orderData: orderData });
      throw error;
    }
    
    const { sheet } = ensureOrderSheetColumns();
    
    // Obtener encabezados actuales para saber en qué columna escribir cada campo
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
    
    // Mapeo de campo a índice de columna (base 1)
    const colIndex = {
      fecha: headers.indexOf('Fecha') + 1,
      hora: headers.indexOf('Hora') + 1,
      pedido: headers.indexOf('Pedido') + 1,
      estado: headers.indexOf('Estado') + 1,
      cliente: headers.indexOf('Cliente') + 1,
      email: headers.indexOf('Email') + 1,
      telefono: headers.indexOf('Teléfono') + 1,
      direccion: headers.indexOf('Dirección') + 1,
      localidad: headers.indexOf('Localidad') + 1,
      diaEntrega: headers.indexOf('Día Entrega') + 1,
      horario: headers.indexOf('Horario') + 1,
      productos: headers.indexOf('Productos') + 1,
      subtotal: headers.indexOf('Subtotal') + 1,
      descuento: headers.indexOf('Descuento') + 1,
      cupon: headers.indexOf('Cupón') + 1,
      envio: headers.indexOf('Envío') + 1,
      total: headers.indexOf('Total') + 1,
      notas: headers.indexOf('Notas') + 1
    };
    
    // Preparar datos
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
    const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');
    
    // Crear resumen de productos
    const productsSummary = orderData.items.map(item => {
      const presentation = item.presentation || 'Unidad';
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const subtotal = price * quantity;
      return `${item.name} (${presentation}) - ${quantity} x $${price.toLocaleString('es-AR')} = $${subtotal.toLocaleString('es-AR')}`;
    }).join('\n');
    
    // Preparar fila (array con la longitud total de columnas)
    const row = new Array(headers.length).fill('');
    
    // Asignar valores según índices
    if (colIndex.fecha) row[colIndex.fecha - 1] = formattedDate;
    if (colIndex.hora) row[colIndex.hora - 1] = formattedTime;
    if (colIndex.pedido) row[colIndex.pedido - 1] = orderData.orderNumber;
    if (colIndex.estado) row[colIndex.estado - 1] = 'PENDIENTE';
    if (colIndex.cliente) row[colIndex.cliente - 1] = orderData.customer.name || '';
    if (colIndex.email) row[colIndex.email - 1] = orderData.customer.email || '';
    if (colIndex.telefono) row[colIndex.telefono - 1] = orderData.customer.phone || '';
    if (colIndex.direccion) row[colIndex.direccion - 1] = orderData.customer.address || '';
    if (colIndex.localidad) row[colIndex.localidad - 1] = orderData.customer.location || '';
    if (colIndex.diaEntrega) row[colIndex.diaEntrega - 1] = orderData.customer.deliveryDay || '';
    if (colIndex.horario) row[colIndex.horario - 1] = orderData.customer.deliveryTime || '';
    if (colIndex.productos) row[colIndex.productos - 1] = productsSummary;
    if (colIndex.subtotal) row[colIndex.subtotal - 1] = orderData.subtotal || 0;
    if (colIndex.descuento) row[colIndex.descuento - 1] = orderData.discount || 0;
    if (colIndex.cupon) row[colIndex.cupon - 1] = orderData.appliedCoupon ? JSON.stringify(orderData.appliedCoupon) : '';
    if (colIndex.envio) row[colIndex.envio - 1] = orderData.shipping || 0;
    if (colIndex.total) row[colIndex.total - 1] = orderData.total || 0;
    if (colIndex.notas) row[colIndex.notas - 1] = orderData.customer.notes || '';
    
    // Agregar fila
    sheet.appendRow(row);
    
    // Enviar notificación por email
    if (orderData.customer.email && CONFIG.ADMIN_EMAIL) {
      sendEmailNotification(orderData);
    }

    sendPurchaseToFacebook(orderData);
    
    // Invalidar cache de productos
    CacheService.getScriptCache().remove('eloso_products');
    
    const result = {
      success: true,
      orderId: orderData.orderNumber,
      message: 'Pedido registrado exitosamente',
      timestamp: now.toISOString()
    };
    
    return result;
    
  } catch (error) {
    logError(error, 'submitOrderToSheet', { 
      orderNumber: orderData ? orderData.orderNumber : 'desconocido',
      orderDataSummary: {
        hasCustomer: !!orderData.customer,
        itemCount: orderData.items ? orderData.items.length : 0,
        subtotal: orderData.subtotal,
        total: orderData.total
      }
    });
    return {
      success: false,
      message: 'Error al procesar el pedido',
      error: error.message,
      orderId: orderData ? orderData.orderNumber : 'desconocido',
      timestamp: new Date().toISOString()
    };
  }
}

// ====== ENVIAR NOTIFICACIÓN POR EMAIL (CLIENTE Y ADMIN) ======
function sendEmailNotification(orderData) {
  try {
    var customer = orderData.customer || {};
    var items = orderData.items || [];
    
    if (!customer.email || customer.email.trim() === '') {
      console.warn('No se pudo enviar email al cliente: email no proporcionado');
      return;
    }
    
    var customerSubject = '✅ Confirmación de pedido #' + orderData.orderNumber + ' - El Oso';
    var customerMessage = '<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">';
    customerMessage += '<div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">';
    customerMessage += '<h1 style="margin: 0; font-size: 24px;">🍺 EL OSO</h1>';
    customerMessage += '<p style="margin: 10px 0 0 0; font-size: 16px;">¡Gracias por tu pedido!</p>';
    customerMessage += '</div>';
    customerMessage += '<div style="padding: 30px 20px;">';
    customerMessage += '<h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">📋 RESÚMEN DE TU PEDIDO</h2>';
    customerMessage += '<p><strong>Número de pedido:</strong> <span style="background-color: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-weight: bold;">' + orderData.orderNumber + '</span></p>';
    customerMessage += '<p><strong>Fecha y hora:</strong> ' + new Date().toLocaleString('es-AR', { timeZone: CONFIG.TIMEZONE }) + '</p>';
    customerMessage += '<p><strong>Estado:</strong> <span style="color: #ff9900; font-weight: bold;">PENDIENTE DE CONFIRMACIÓN</span></p>';
    customerMessage += '<h3 style="color: #000; margin-top: 25px;">👤 TUS DATOS</h3>';
    customerMessage += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.name || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.phone || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Dirección:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.address || 'No especificado') + ', ' + (customer.city || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Entrega:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.deliveryDay || 'No especificado') + ', ' + (customer.deliveryTime || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Notas:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.notes || 'Sin notas') + '</td></tr>';
    customerMessage += '</table>';
    customerMessage += '<h3 style="color: #000; margin-top: 25px;">🛒 PRODUCTOS</h3>';
    customerMessage += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    customerMessage += '<thead><tr style="background-color: #f5f5f5;">';
    customerMessage += '<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>';
    customerMessage += '<th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Cant.</th>';
    customerMessage += '<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio</th>';
    customerMessage += '<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>';
    customerMessage += '</tr></thead><tbody>';
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemTotal = (item.price || 0) * (item.quantity || 1);
      customerMessage += '<tr>';
      customerMessage += '<td style="padding: 10px; border-bottom: 1px solid #eee;">' + (item.name || 'Sin nombre') + ' (' + item.presentation +')' + '</td>';
      customerMessage += '<td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">' + (item.quantity || 1) + '</td>';
      customerMessage += '<td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">$' + (item.price || 0).toLocaleString('es-AR') + '</td>';
      customerMessage += '<td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;"><strong>$' + itemTotal.toLocaleString('es-AR') + '</strong></td>';
      customerMessage += '</tr>';
    }
    
    customerMessage += '</tbody></table>';
    customerMessage += '<h3 style="color: #000; margin-top: 25px;">💰 TOTAL DEL PEDIDO</h3>';
    customerMessage += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">';
    customerMessage += '<tr><td style="padding: 10px; text-align: right;">Subtotal:</td><td style="padding: 10px; text-align: right; width: 100px;">$' + (orderData.subtotal || 0).toLocaleString('es-AR') + '</td></tr>';
    if (orderData.discount) {
      customerMessage += '<tr><td style="padding: 10px; text-align: right;">Descuento:</td><td style="padding: 10px; text-align: right;">-$' + (orderData.discount || 0).toLocaleString('es-AR') + '</td></tr>';
    }
    customerMessage += '<tr><td style="padding: 10px; text-align: right;">Envío:</td><td style="padding: 10px; text-align: right;">$' + (orderData.shipping || 0).toLocaleString('es-AR') + '</td></tr>';
    customerMessage += '<tr style="font-weight: bold; font-size: 18px;">';
    customerMessage += '<td style="padding: 15px 10px; text-align: right; border-top: 2px solid #000;">TOTAL:</td>';
    customerMessage += '<td style="padding: 15px 10px; text-align: right; border-top: 2px solid #000;">$' + (orderData.total || 0).toLocaleString('es-AR') + '</td>';
    customerMessage += '</tr>';
    customerMessage += '</table>';
    customerMessage += '<div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 30px 0;">';
    customerMessage += '<h4 style="color: #000; margin-top: 0;">📱 PRÓXIMOS PASOS</h4>';
    customerMessage += '<ol style="padding-left: 20px; margin: 10px 0;">';
    customerMessage += '<li>Te contactaremos por WhatsApp en las próximas 24 horas para coordinar la entrega.</li>';
    customerMessage += '<li>Prepará el pago en efectivo o transferencia para cuando recibas tu pedido.</li>';
    customerMessage += '<li>Guardá este número de pedido para cualquier consulta: <strong>' + orderData.orderNumber + '</strong></li>';
    customerMessage += '<li>Si no recibís noticias en 48 horas, contactanos por WhatsApp al 11 2349 5971</li>';
    customerMessage += '</ol>';
    customerMessage += '</div>';
    customerMessage += '<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">';
    customerMessage += '<p style="color: #666; font-size: 14px;">Gracias por elegir El Oso.<br>¡Te esperamos pronto!</p>';
    customerMessage += '<p style="margin-top: 20px;"><a href="https://wa.me/5491123495971?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20' + orderData.orderNumber + '" style="background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">📱 Contactar por WhatsApp</a></p>';
    customerMessage += '</div>';
    customerMessage += '</div>';
    customerMessage += '<div style="background-color: #f0f0f0; color: #666; padding: 20px; text-align: center; font-size: 12px;">';
    customerMessage += '<p>© ' + new Date().getFullYear() + ' El Oso. Todos los derechos reservados.</p>';
    customerMessage += '<p>Este es un email automático, por favor no respondas a esta dirección.</p>';
    customerMessage += '</div>';
    customerMessage += '</body></html>';

    var recipients = customer.email + ', ' + CONFIG.ADMIN_EMAIL;

    MailApp.sendEmail({
      to: recipients,
      subject: customerSubject,
      htmlBody: customerMessage,
      replyTo: CONFIG.ADMIN_EMAIL,
      name: 'El Oso'
    });
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

// ====== ENVIAR EVENTO PURCHASE A META (ACTUALIZADO) ======
function sendPurchaseToFacebook(orderData) {
  try {
    const pixelId = CONFIG.META_PIXEL_ID;
    const accessToken = CONFIG.META_ACCESS_TOKEN;
    const apiUrl = `https://graph.facebook.com/v21.0/${pixelId}/events`;

    const customer = orderData.customer || {};
    const items = orderData.items || [];
    const metaData = orderData.metaData || {};   // <-- NUEVO: datos de fbc/fbp

    // Preparar productos
    const contents = items.map(item => ({
      id: item.id.toString(),
      quantity: item.quantity,
      item_price: item.price
    }));

    // Obtener IP y User Agent del request (si está disponible)
    const request = ScriptApp.getRequest ? ScriptApp.getRequest() : null;
    const clientIp = request ? request.sourceIp : '0.0.0.0';
    const userAgent = metaData.userAgent || '';

    // Datos del cliente con hash SHA256 (los campos tradicionales)
    const userData = {
      em: hashSha256((customer.email || '').trim().toLowerCase()),
      ph: hashSha256((customer.phone || '').replace(/\D/g, '')),
      fn: hashSha256((customer.name || '').split(' ')[0].toLowerCase()),
      ln: hashSha256((customer.name || '').split(' ').slice(1).join(' ').toLowerCase()),
      ct: hashSha256((customer.city || '').toLowerCase()),
      country: hashSha256('ar'),
      client_ip_address: clientIp,
      client_user_agent: userAgent,
      // NUEVO: fbc y fbp se envían sin hashear, tal como vienen del frontend
      fbc: metaData.fbc || undefined,
      fbp: metaData.fbp || undefined
    };

    // Limpiar propiedades undefined para no enviar campos vacíos
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) delete userData[key];
    });

    const payload = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: orderData.orderNumber, // Importante para deduplicar con el píxel
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: 'ARS',
          value: orderData.total || 0,
          content_ids: items.map(i => i.id.toString()),
          content_type: 'product',
          num_items: items.reduce((sum, i) => sum + i.quantity, 0),
          contents: contents
        }
      }],
      access_token: accessToken
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      //logInfo('Evento Purchase enviado a Meta OK', 'sendPurchaseToFacebook', result);
    } else {
      logError(new Error('Error al enviar a Meta'), 'sendPurchaseToFacebook', result);
    }
  } catch (error) {
    logError(error, 'sendPurchaseToFacebook');
  }
}

// ====== FUNCIÓN AUXILIAR PARA HASH SHA256 ======
function hashSha256(str) {
  if (!str) return '';
  // Utilities.computeDigest devuelve array de bytes con signo
  const rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
  // Convertir cada byte a hexadecimal, manejando valores negativos
  return rawBytes.map(byte => {
    const normalized = byte < 0 ? byte + 256 : byte;
    return ('0' + normalized.toString(16)).slice(-2);
  }).join('');
}

// ====== CREAR RESPUESTA JSON ======
function createJsonResponse(data) {
  try {
    const output = ContentService.createTextOutput();
    output.setContent(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (error) {
    logError(error, 'createJsonResponse', { dataType: typeof data });
    const errorData = {
      success: false,
      message: 'Error creando respuesta JSON',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    const errorOutput = ContentService.createTextOutput();
    errorOutput.setContent(JSON.stringify(errorData));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}

// ====== FUNCIÓN DE INICIALIZACIÓN MEJORADA ======
function initializeSystem() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    
    // Crear hoja de productos si no existe
    var productsSheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET_NAME);
    if (!productsSheet) {
      productsSheet = ss.insertSheet(CONFIG.PRODUCTS_SHEET_NAME);
      var headers = ['ID', 'Nombre', 'Categoría', 'Precio', 'Imagen', 'Descripción', 'Disponible', 'Presentación', 'Info', 'Stock'];
      productsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      productsSheet.setFrozenRows(1);
    }
    
    // Crear o actualizar hoja de pedidos con las nuevas columnas
    var ordersSheet = ss.getSheetByName(CONFIG.ORDERS_SHEET_NAME);
    if (!ordersSheet) {
      ordersSheet = ss.insertSheet(CONFIG.ORDERS_SHEET_NAME);
      var headers = [
        'Fecha', 'Hora', 'Pedido', 'Estado', 'Cliente', 'Email', 'Teléfono',
        'Dirección', 'Localidad', 'Día Entrega', 'Horario',
        'Productos', 'Subtotal', 'Descuento', 'Cupón', 'Envío', 'Total', 'Notas'
      ];
      ordersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      ordersSheet.setFrozenRows(1);
    } else {
      // Asegurar que tenga las columnas necesarias
      ensureOrderSheetColumns();
    }
    
    // Crear hoja de logs si no existe
    var logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      var headers = ['Fecha', 'Hora', 'Tipo', 'Contexto', 'Mensaje', 'URL', 'UserAgent', 'IP', 'Datos Adicionales'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.setFrozenRows(1);
    }
    
    return {
      success: true,
      message: 'Sistema inicializado correctamente',
      sheets: {
        products: !!productsSheet,
        orders: !!ordersSheet,
        logs: !!logsSheet
      },
      scriptUrl: ScriptApp.getService().getUrl(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logError(error, 'initializeSystem');
    return {
      success: false,
      message: 'Error inicializando sistema',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ====== FUNCIÓN PARA LIMPIAR LOGS ANTIGUOS ======
function cleanupOldLogs(daysToKeep = 30) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    
    if (!logsSheet) {
      return { success: true, message: 'No hay hoja de logs' };
    }
    
    const data = logsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, message: 'No hay logs para limpiar' };
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    const rowsToDelete = [];
    
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const dateStr = row[0];
      const timeStr = row[1];
      
      try {
        const logDate = new Date(`${dateStr} ${timeStr}`);
        
        if (logDate < cutoffDate) {
          rowsToDelete.push(i + 1);
          deletedCount++;
        }
      } catch (dateError) {
        logError(dateError, 'cleanupOldLogs', { 
          rowIndex: i,
          date: dateStr,
          time: timeStr 
        });
      }
    }
    
    rowsToDelete.sort((a, b) => b - a).forEach(rowIndex => {
      logsSheet.deleteRow(rowIndex);
    });
    
    return {
      success: true,
      deletedCount: deletedCount,
      remainingCount: data.length - 1 - deletedCount,
      message: `Se eliminaron ${deletedCount} logs antiguos`
    };
    
  } catch (error) {
    logError(error, 'cleanupOldLogs');
    return {
      success: false,
      message: 'Error limpiando logs',
      error: error.message
    };
  }
}

// ====== FUNCIÓN PARA PROBAR CONEXIÓN ======
function testConnection() {
  try {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      scriptUrl: ScriptApp.getService().getUrl(),
      sheets: {},
      environment: {
        timezone: Session.getScriptTimeZone(),
        user: Session.getActiveUser().getEmail(),
        runtime: 'Google Apps Script'
      }
    };
    
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      const sheets = ss.getSheets();
      result.sheets = sheets.map(sheet => ({
        name: sheet.getName(),
        rows: sheet.getLastRow(),
        cols: sheet.getLastColumn()
      }));
    } catch (sheetError) {
      result.sheetsError = sheetError.message;
    }
    
    try {
      const cache = CacheService.getScriptCache();
      cache.put('test', 'ok', 10);
      const cacheTest = cache.get('test');
      result.cache = cacheTest === 'ok' ? 'working' : 'not_working';
    } catch (cacheError) {
      result.cacheError = cacheError.message;
    }
    
    return result;
    
  } catch (error) {
    logError(error, 'testConnection');
    return {
      success: false,
      message: 'Error en prueba de conexión',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ====== EJECUTAR AL INSTALAR/ACTUALIZAR ======
function onInstall() {
  return initializeSystem();
}

// ====== FUNCIÓN PARA LIMPIAR CACHE ======
function clearCache() {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove('eloso_products');
    
    return {
      success: true,
      message: 'Cache limpiado exitosamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError(error, 'clearCache');
    return {
      success: false,
      message: 'Error limpiando cache',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}