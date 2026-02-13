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
  CACHE_DURATION: 1800
};

// ====== SISTEMA DE LOGS ======
function logError(error, context = '', additionalData = {}) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    
    // Crear hoja de logs si no existe
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      const headers = ['Fecha', 'Hora', 'Tipo', 'Contexto', 'Mensaje', 'URL', 'UserAgent', 'IP', 'Datos Adicionales'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.setFrozenRows(1);
    }
    
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
    const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');
    
    // Obtener información del request
    const request = ScriptApp.getRequest ? ScriptApp.getRequest() : null;
    const url = request ? request.url : 'N/A';
    const userAgent = request ? request.userAgent : 'N/A';
    const ip = request ? request.sourceIp : 'N/A';
    
    // Preparar el mensaje de error
    const errorMessage = error.message || error.toString();
    const errorType = error.name || 'Error';
    
    // Preparar datos adicionales como JSON
    const additionalDataJson = JSON.stringify(additionalData) || '{}';
    
    // Escribir en la hoja de logs
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
    
    // Aplicar formato a las filas de error
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
      postData: e ? e.postData.contents.substring(0, 500) : 'N/A' // Primeros 500 chars
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
    
    // Verificar cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      parsed.cached = true;
      parsed.cacheTimestamp = new Date().toISOString();
      return parsed;
    }
    
    // Obtener datos frescos
    const products = getProductsFromSheet();
    
    const result = {
      success: true,
      products: products,
      count: products.length,
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    // Guardar en cache
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
    
    const headers = data[0].map(function(h) { return h.toString().trim(); });
    const products = [];
    
    // Columnas actualizadas con las nuevas columnas
    const colIndex = {
      id: headers.indexOf('ID'),
      name: headers.indexOf('Nombre'),
      category: headers.indexOf('Categoría'),
      price: headers.indexOf('Precio'),
      image: headers.indexOf('Imagen'),
      info: headers.indexOf('Info'),
      stock: headers.indexOf('Stock'),
      description: headers.indexOf('Descripción'),
      active: headers.indexOf('Disponible'),
      presentation: headers.indexOf('Presentación')
    };
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Si la fila está vacía, continuar
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }
      
      // Usar la columna 'Info' si existe, si no usar 'Descripción'
      const infoColumn = colIndex.info >= 0 ? colIndex.info : colIndex.description;
      const infoValue = infoColumn >= 0 ? (row[infoColumn] || '').toString().trim() : '';
      
      // Usar 'Descripción' como descripción detallada
      const descriptionColumn = colIndex.description >= 0 ? colIndex.description : -1;
      const descriptionValue = descriptionColumn >= 0 ? (row[descriptionColumn] || '').toString().trim() : '';
      
      const productId = colIndex.id >= 0 ? parseInt(row[colIndex.id]) || i : i;
      const productPrice = colIndex.price >= 0 ? parseFloat(row[colIndex.price]) || 0 : 0;
      
      var product = {
        id: productId,
        name: colIndex.name >= 0 ? (row[colIndex.name] || '').toString().trim() : 'Producto ' + i,
        category: colIndex.category >= 0 ? 
                  ((row[colIndex.category] || 'cerveza').toString().trim().toLowerCase()) : 
                  'cerveza',
        price: productPrice,
        image: colIndex.image >= 0 ? (row[colIndex.image] || '').toString().trim() : '',
        info: infoValue,
        stock: colIndex.stock >= 0 ? parseInt(row[colIndex.stock]) || 0 : 0,
        description: descriptionValue,
        active: colIndex.active >= 0 ? 
                (row[colIndex.active] === true || 
                 row[colIndex.active] === "TRUE" || 
                 row[colIndex.active] === "true" || 
                 row[colIndex.active] == 1 || 
                 row[colIndex.active] === "1" ||
                 row[colIndex.active] === "SI" ||
                 row[colIndex.active] === "Sí" ||
                 row[colIndex.active] === "sí") : 
                false,
        presentation: colIndex.presentation >= 0 ? 
                      (row[colIndex.presentation] || '').toString().trim() : 
                      'Unidad'
      };
      
      products.push(product);
    }
    
    return products;
    
  } catch (error) {
    logError(error, 'getProductsFromSheet');
    return [];
  }
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
    
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.ORDERS_SHEET_NAME);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.ORDERS_SHEET_NAME);
      var headers = [
        'Fecha', 'Hora', 'Pedido', 'Estado', 'Cliente', 'DNI', 'Email', 'Teléfono',
        'Dirección', 'Localidad', 'Día Entrega', 'Horario',
        'Productos', 'Subtotal', 'Envío', 'Total', 'Notas'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
    
    // Preparar fila
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
    var formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');

    // Crear listas detalladas
    var productNames = [];
    var productQuantities = [];
    var productPrices = [];
    var productSubtotals = [];
    var productsSummary = [];
    
    for (var i = 0; i < orderData.items.length; i++) {
      var item = orderData.items[i];
      var itemName = item.name || 'Sin nombre';
      var itemQuantity = item.quantity || 1;
      var itemPrice = item.price || 0;
      var itemSubtotal = itemPrice * itemQuantity;
      var presentation = item.presentation || 'Unidad';
      
      productNames.push(itemName);
      productQuantities.push(itemQuantity);
      productPrices.push('$' + itemPrice.toLocaleString('es-AR'));
      productSubtotals.push('$' + itemSubtotal.toLocaleString('es-AR'));
      
      // Resumen completo para nueva columna
      productsSummary.push(
        `${itemName} (${presentation}) - ${itemQuantity} x $${itemPrice.toLocaleString('es-AR')} = $${itemSubtotal.toLocaleString('es-AR')}`
      );
    }
    
    var row = [
      formattedDate,
      formattedTime,
      orderData.orderNumber,
      'PENDIENTE',
      orderData.customer.name || '',
      orderData.customer.dni || '',
      orderData.customer.email || '',
      orderData.customer.phone || '',
      orderData.customer.address || '',
      orderData.customer.location || '',
      orderData.customer.deliveryDay || '',
      orderData.customer.deliveryTime || '',
      productsSummary.join('\n'),
      orderData.subtotal || 0,
      orderData.shipping || 0,
      orderData.total || 0,
      orderData.customer.notes || ''
    ];
    
    // Guardar en la hoja
    var lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1, 1, row.length).setValues([row]);
    
    // Enviar notificación por email si está configurado
    if (orderData.customer.email && CONFIG.ADMIN_EMAIL) {
      sendEmailNotification(orderData, lastRow);
    }
    
    // Invalidar cache de productos
    CacheService.getScriptCache().remove('eloso_products');
    
    const result = {
      success: true,
      orderId: orderData.orderNumber,
      message: 'Pedido registrado exitosamente',
      sheetRow: lastRow,
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
function sendEmailNotification(orderData, rowNumber) {
  try {
    var customer = orderData.customer || {};
    var items = orderData.items || [];
    
    // Verificar que haya un email válido
    if (!customer.email || customer.email.trim() === '') {
      console.warn('No se pudo enviar email al cliente: email no proporcionado');
      return;
    }
    
    // Construir mensaje para el CLIENTE
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
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>DNI:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.dni || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.phone || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Dirección:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.address || 'No especificado') + ', ' + (customer.city || 'No especificado') + '</td></tr>';
    customerMessage += '<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Entrega:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">' + (customer.deliveryDay || 'No especificado') + ' ' + (customer.deliveryTime || 'No especificado') + '</td></tr>';
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

    // Enviar email al CLIENTE
    MailApp.sendEmail({
      to: recipients,
      subject: customerSubject,
      htmlBody: customerMessage,
      replyTo: CONFIG.ADMIN_EMAIL,
      name: 'El Oso'
    });
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // No lanzamos el error para no interrumpir el flujo del pedido
  }
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
    
    // Respuesta de error básica si falla createJsonResponse
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
      
      // Agregar algunos productos de ejemplo
      const sampleProducts = [
        [1, 'VIKA - New England IPA', 'cerveza', 5000, 'images/products/beers/vika-330.png', 'IPA estilo New England', 'SI', 'Botella 330ml', 'New England IPA | Alc. 5.0%', 10],
        [2, 'NDALA - Chocolate Stout', 'cerveza', 5000, 'images/products/beers/ndala-330.png', 'Stout con chocolate', 'SI', 'Botella 330ml', 'Chocolate Stout | Alc. 6.0%', 8]
      ];
      productsSheet.getRange(2, 1, sampleProducts.length, headers.length).setValues(sampleProducts);
    }
    
    // Crear hoja de pedidos si no existe
    var ordersSheet = ss.getSheetByName(CONFIG.ORDERS_SHEET_NAME);
    if (!ordersSheet) {
      ordersSheet = ss.insertSheet(CONFIG.ORDERS_SHEET_NAME);
      var headers = [
        'Fecha', 'Hora', 'Pedido', 'Estado', 'Cliente', 'DNI', 'Email', 'Teléfono',
        'Dirección', 'Localidad', 'Día Entrega', 'Horario',
        'Productos', 'Subtotal', 'Envío', 'Total', 'Notas'
      ];
      ordersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      ordersSheet.setFrozenRows(1);
    }
    
    // Crear hoja de logs si no existe
    var logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      var headers = ['Fecha', 'Hora', 'Tipo', 'Contexto', 'Mensaje', 'URL', 'UserAgent', 'IP', 'Datos Adicionales'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.setFrozenRows(1);
      
      // Agregar un log inicial
      const now = new Date();
      const formattedDate = Utilities.formatDate(now, CONFIG.TIMEZONE, 'dd/MM/yyyy');
      const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm:ss');
      
      logsSheet.getRange(2, 1, 1, 9).setValues([[
        formattedDate,
        formattedTime,
        'INFO',
        'initializeSystem',
        'Sistema inicializado exitosamente',
        ScriptApp.getService().getUrl(),
        'Google Apps Script',
        'N/A',
        JSON.stringify({ version: '1.0', sheets: ['products', 'orders', 'logs'] })
      ]]);
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
      const dateStr = row[0]; // Fecha en columna A
      const timeStr = row[1]; // Hora en columna B
      
      try {
        const logDate = new Date(`${dateStr} ${timeStr}`);
        
        if (logDate < cutoffDate) {
          rowsToDelete.push(i + 1); // +1 porque las filas en Google Sheets empiezan en 1
          deletedCount++;
        }
      } catch (dateError) {
        // Si hay error parseando la fecha, no borrar
        logError(dateError, 'cleanupOldLogs', { 
          rowIndex: i,
          date: dateStr,
          time: timeStr 
        });
      }
    }
    
    // Borrar filas (de abajo hacia arriba para mantener índices correctos)
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
    
    // Probar acceso a hojas
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
    
    // Probar cache
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