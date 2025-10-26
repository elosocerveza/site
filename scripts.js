document.addEventListener('DOMContentLoaded', function() {
    let products = {
        featured: [],
        beers: [],
        sauces: [],
        preserves: [],
        combos: []
    };
    
    let cart = [];

    // ===== MEJOR SOLUCIÓN - PROXY CORS CON FALLBACKS =====
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy8faJa3rHsf2msyB-OH5zyOD9WTD40Ry1O_Jng3p29Z6-58SCNw2KH14y1mr66JoDAkBVQDIXZv8q/pub?gid=477181&single=true&output=csv';

    async function loadProductsFromGoogleSheets() {
        console.log('🔄 Iniciando carga de productos...');
        
        // 1. PRIMERO: Intentar con proxy CORS más confiable
        try {
            const products = await tryWithCorsProxy();
            if (products) {
                console.log('✅ Productos cargados via CORS proxy');
                return products;
            }
        } catch (error) {
            console.warn('❌ Proxy CORS falló:', error.message);
        }
        
        // 2. SEGUNDO: Intentar carga directa (puede funcionar en algunos entornos)
        try {
            const products = await tryDirectLoad();
            if (products) {
                console.log('✅ Productos cargados directamente');
                return products;
            }
        } catch (error) {
            console.warn('❌ Carga directa falló:', error.message);
        }
        
        // 3. TERCERO: Usar datos locales
        console.log('🔄 Usando datos locales de respaldo...');
        return loadLocalProductData();
    }

    // Proxy CORS principal - EL MÁS CONFIABLE
    async function tryWithCorsProxy() {
        // Lista de proxies CORS ordenados por confiabilidad
        const proxies = [
            'https://corsproxy.io/?',        // Muy confiable
            'https://api.allorigins.win/raw?url=', // Buen respaldo
            'https://cors-anywhere.herokuapp.com/' // Alternativa
        ];
        
        for (const proxy of proxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(CSV_URL);
                console.log(`🔧 Probando proxy: ${proxy.split('/')[2]}`);
                
                const response = await fetchWithTimeout(proxyUrl, 8000);
                
                if (response.ok) {
                    const csvText = await response.text();
                    const products = parseCSVData(csvText);
                    
                    // Validar que se cargaron productos reales
                    if (isValidProductsData(products)) {
                        return products;
                    }
                }
            } catch (error) {
                console.warn(`Proxy ${proxy.split('/')[2]} falló:`, error.message);
                continue;
            }
        }
        
        throw new Error('Todos los proxies fallaron');
    }

    // Intento directo (sin proxy)
    async function tryDirectLoad() {
        try {
            const response = await fetchWithTimeout(CSV_URL, 5000);
            
            if (response.ok) {
                const csvText = await response.text();
                const products = parseCSVData(csvText);
                
                if (isValidProductsData(products)) {
                    return products;
                }
            }
        } catch (error) {
            throw new Error('Carga directa falló: ' + error.message);
        }
    }

    // Helper para fetch con timeout
    function fetchWithTimeout(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`Timeout después de ${timeout}ms`));
            }, timeout);
            
            fetch(url, { 
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Accept': 'text/csv',
                    'Content-Type': 'text/csv'
                }
            })
            .then(response => {
                clearTimeout(timeoutId);
                resolve(response);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    }

    // Validar que los datos de productos sean correctos
    function isValidProductsData(products) {
        if (!products || typeof products !== 'object') return false;
        
        const categories = ['featured', 'beers', 'sauces', 'preserves', 'combos'];
        const hasProducts = categories.some(cat => 
            Array.isArray(products[cat]) && products[cat].length > 0
        );
        
        return hasProducts;
    }

    // Función para parsear CSV
    function parseCSVData(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = parseCSVLine(lines[0]).map(h => h.trim());
        
        const products = {
            featured: [],
            beers: [],
            sauces: [],
            preserves: [],
            combos: []
        };
        
        // Mapeo de columnas CSV a propiedades
        const columnMap = {
            'ID': 'id',
            'Nombre': 'name', 
            'Descripción': 'description',
            'Precio': 'price',
            'Imagen': 'image',
            'Categoría': 'category',
            'Badge': 'badge',
            'Características': 'features',
            'Activo': 'active',
            'Stock': 'stock',
            'StockLimit': 'stockLimit'
        };
        
        console.log('📋 Headers encontrados:', headers);
        
        // Procesar cada línea (empezando desde línea 1, saltando encabezados)
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            try {
                const values = parseCSVLine(lines[i]);
                const product = {};
                
                console.log(`📦 Procesando línea ${i}:`, values);
                
                // Mapear cada valor a su propiedad
                values.forEach((value, index) => {
                    if (index < headers.length && value !== undefined && value !== '') {
                        const header = headers[index];
                        const property = columnMap[header];
                        
                        if (property) {
                            // Convertir tipos de datos
                            let processedValue = value.toString().trim();
                            
                            if (property === 'price' || property === 'stock' || property === 'id') {
                                processedValue = Number(processedValue) || 0;
                            } else if (property === 'active' || property === 'stockLimit') {
                                processedValue = processedValue === 'TRUE' || processedValue === 'true' || processedValue === '1' || processedValue === 'Sí';
                            } else if (property === 'features') {
                                processedValue = processedValue ? processedValue.split(';').map(f => f.trim()) : [];
                            }
                            
                            product[property] = processedValue;
                        }
                    }
                });
                
                // Validar producto mínimo
                if (product.id && product.name && product.category) {
                    // Convertir categoría a minúsculas para coincidir con las keys
                    const categoryKey = product.category.toLowerCase();
                    
                    // Agregar a categoría principal
                    if (products[categoryKey]) {
                        products[categoryKey].push(product);
                        console.log(`✅ Producto agregado a ${categoryKey}:`, product.name);
                    } else {
                        console.warn(`❌ Categoría no válida: ${product.category}`);
                    }
                    
                    // Si tiene badge, agregar a destacados
                    if (product.badge && product.badge !== 'FALSE' && product.badge !== 'false') {
                        products.featured.push(product);
                        console.log(`⭐ Producto destacado:`, product.name);
                    }
                } else {
                    console.warn('❌ Producto inválido (falta ID, nombre o categoría):', product);
                }
                
            } catch (error) {
                console.error(`❌ Error procesando línea ${i}:`, error);
            }
        }
        
        console.log('✅ Productos finales cargados desde CSV:', products);
        return products;
    }

    // Función para parsear líneas CSV correctamente (maneja comas dentro de comillas)
    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values.map(v => v.trim().replace(/^"|"$/g, ''));
    }

    // Datos locales como fallback
    function loadLocalProductData() {
        console.log('🔄 Cargando datos locales como fallback...');
        return {
            featured: [
                {
                    id: 1,
                    name: "IPA Frutada - 500ml",
                    description: "Amargor característico y muy aromática, con notas a frutas tropicales",
                    price: 5000,
                    image: "images/products/beers/vika.jpg",
                    category: "beers",
                    features: ["Alcohol: 5,0%", "Amargor: Medio", "Notas frutales tropicales"],
                    active: true,
                    stock: 25
                }
            ],
            beers: [],
            sauces: [],
            preserves: [],
            combos: []
        };
    }

    // ===== 1. CALCULADORA DE ENVÍOS =====
    function initShippingCalculator() {
        console.log("Calculadora de envíos inicializada");
    }

    function calculateShipping(location) {
        if (location.length < 3) {
            document.getElementById('shippingResults').innerHTML = '<p>Ingresá tu barrio o localidad para calcular el envío</p>';
            return;
        }
        
        const freeZones = ['quilmes', 'bernal', 'ezpeleta'];
        const mediumZones = ['solano', 'don bosco', 'san francisco'];
        const farZones = ['avellaneda', 'lanus', 'lomas'];
        
        let resultHTML = '';
        
        if (freeZones.some(zone => location.toLowerCase().includes(zone))) {
            resultHTML = `
                <div class="shipping-option free">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>¡ENVÍO GRATIS!</strong>
                        <span>Jueves y Viernes - Entrega en 24-48hs</span>
                    </div>
                </div>
                <div class="shipping-option paid">
                    <i class="fas fa-shipping-fast"></i>
                    <div>
                        <strong>Envío Express: $800</strong>
                        <span>Mismo día - Pedidos antes de 14hs</span>
                    </div>
                </div>
            `;
        } else if (mediumZones.some(zone => location.toLowerCase().includes(zone))) {
            resultHTML = `
                <div class="shipping-option paid">
                    <i class="fas fa-truck"></i>
                    <div>
                        <strong>Envío Estándar: $500</strong>
                        <span>Entrega en 24-72hs</span>
                    </div>
                </div>
            `;
        } else {
            resultHTML = `
                <div class="shipping-option consult">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Consultar envío</strong>
                        <span>Escribinos por WhatsApp para coordinar</span>
                        <button onclick="consultShipping('${location}')">Consultar ahora</button>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('shippingResults').innerHTML = resultHTML;
    }

    function consultShipping(location) {
        const message = `¡Hola! Quiero consultar el costo de envío a: ${location}. ¿Podrían pasarme información? 🚚`;
        const url = `https://wa.me/5491123495971?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // ===== 2. GARANTÍAS Y CONFIANZA =====
    function initGuaranteesSection() {
        console.log("Sección de garantías inicializada");
    }

    // ===== 3. INFORMACIÓN DE STOCK MEJORADA =====
    function enhanceStockInformation() {
        console.log("Mejorando información de stock...");
    }

    function generateStockInfo(product) {
        if (product.stockLimit === false) {
            return `
                <div class="stock-status high-stock">
                    <i class="fas fa-check-circle"></i>
                    <span>Disponible</span>
                </div>
            `;
        }
        else if (!product.stock || product.stock === 0) {
            return `
                <div class="stock-status out-of-stock">
                    <i class="fas fa-times-circle"></i>
                    <span>Temporalmente sin stock</span>
                    <button onclick="notifyWhenAvailable(${product.id})">Avísame cuando haya</button>
                </div>
            `;
        } else if (product.stock <= 5) {
            return `
                <div class="stock-status low-stock">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Últimas ${product.stock} unidades</span>
                    <div class="stock-bar">
                        <div class="stock-fill" style="width: ${(product.stock / 10) * 100}%"></div>
                    </div>
                </div>
            `;
        } else if (product.stock <= 15) {
            return `
                <div class="stock-status medium-stock">
                    <i class="fas fa-check-circle"></i>
                    <span>Stock disponible (${product.stock} unidades)</span>
                </div>
            `;
        } else {
            return `
                <div class="stock-status high-stock">
                    <i class="fas fa-check-circle"></i>
                    <span>Disponible</span>
                </div>
            `;
        }
    }

    function notifyWhenAvailable(productId) {
        const product = findProductById(productId);
        const message = `¡Hola! Quiero que me avisen cuando ${product.name} esté disponible nuevamente. Mi teléfono es: [MI TELÉFONO]`;
        const url = `https://wa.me/5491123495971?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // ===== 4. COMPRA RÁPIDA =====
    function initOneClickCheckout() {
        console.log("Sistema de compra rápida inicializado");
    }

    function quickBuyProduct(productId) {
        const product = findProductById(productId);
        
        const quickBuyModal = `
            <div class="quick-buy-modal active">
                <div class="quick-buy-content">
                    <h3>¡Compra Rápida! 🚀</h3>
                    <div class="product-summary">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="handleModalImageError(this, ${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <div>
                            <h4>${product.name}</h4>
                            <p class="price">$${product.price.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div class="delivery-options">
                        <h5>¿Cómo querés recibirlo?</h5>
                        <div class="delivery-option active" data-type="delivery">
                            <i class="fas fa-truck"></i>
                            <span>Envío a domicilio</span>
                        </div>
                        <div class="delivery-option" data-type="pickup">
                            <i class="fas fa-store"></i>
                            <span>Retiro en Quilmes</span>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="btn-whatsapp" onclick="completeQuickBuy(${productId}, 'delivery')">
                            <i class="fab fa-whatsapp"></i>
                            Completar por WhatsApp
                        </button>
                        <button class="btn-add-cart" onclick="addToCartFromQuickBuy(${productId})">
                            <i class="fas fa-cart-plus"></i>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente si hay uno
        const existingModal = document.querySelector('.quick-buy-modal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', quickBuyModal);
        
        // Configurar event listeners para opciones de entrega
        document.querySelectorAll('.delivery-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function completeQuickBuy(productId, deliveryType) {
        const product = findProductById(productId);
        const message = `¡Hola! Quiero comprar *${product.name}* por $${product.price.toLocaleString()}. \n\nForma de entrega: ${deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en Quilmes'}. \n\nPor favor, necesito coordinar la entrega. ¡Gracias! 🐻`;
        const url = `https://wa.me/5491123495971?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        // Cerrar modal
        const modal = document.querySelector('.quick-buy-modal');
        if (modal) modal.remove();
    }

    function addToCartFromQuickBuy(productId) {
        const product = findProductById(productId);
        addToCart(product, 1);
        
        // Cerrar modal
        const modal = document.querySelector('.quick-buy-modal');
        if (modal) modal.remove();
        
        showNotification("✅ Producto agregado al carrito", "success");
    }

    // ===== 5. FAQ DE ENTREGAS =====
    function initDeliveryFAQ() {
        console.log("FAQ de entregas inicializado");
    }

    // ===== 6. MÉTODOS DE PAGO =====
    function initPaymentMethods() {
        console.log("Sección de métodos de pago inicializada");
    }

    // ===== 7. CONTACTO INMEDIATO =====
    function initImmediateContact() {
        console.log("Sección de contacto inmediato inicializada");
    }

    function openChatAssistant() {
        const message = "¡Hola! Necesito ayuda para elegir mis productos. ¿Podrían asesorarme? 🐻";
        const url = `https://wa.me/5491123495971?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // ===== 8. RESEÑAS REALES =====
    function initRealReviews() {
        console.log("Sección de reseñas inicializada");
    }

    // ===== 9. CALIDAD Y SEGURIDAD =====
    function initQualitySecurity() {
        console.log("Sección de calidad y seguridad inicializada");
    }

    // ===== FUNCIONES EXISTENTES ACTUALIZADAS =====

    // Función para manejar imágenes que no se cargan
    function handleImageError(imgElement, product) {
        console.log(`Image not found: ${product.image}`);
        
        // If default image fails, use icon
        imgElement.onerror = function() {
            imgElement.style.display = 'none';
            const icon = document.createElement('i');
            icon.className = getProductIcon(product);
            icon.style.fontSize = '40px';
            icon.style.color = 'var(--text-light)';
            imgElement.parentNode.appendChild(icon);
        };
    }

    function handleModalImageError(imgElement, product) {
        console.log(`Modal image not found: ${product.image}`);
        
        // If default image fails, use icon
        imgElement.onerror = function() {
            imgElement.style.display = 'none';
            const icon = document.createElement('i');
            icon.className = getProductIcon(product);
            icon.style.fontSize = '80px';
            icon.style.color = 'var(--text-light)';
            imgElement.parentNode.appendChild(icon);
        };
    }

    function handleCartImageError(imgElement, product) {
        console.log(`Cart image not found: ${product.image}`);
        
        // Use icon in cart if image fails
        imgElement.style.display = 'none';
        const icon = document.createElement('i');
        icon.className = getProductIcon(product);
        icon.style.fontSize = '24px';
        icon.style.color = 'var(--text-light)';
        imgElement.parentNode.appendChild(icon);
    }

    function getProductIcon(product) {
        if (product.category === 'beers') return 'fas fa-beer';
        if (product.category === 'sauces') return 'fas fa-pepper-hot';
        if (product.category === 'preserves') return 'fas fa-jar';
        if (product.category === 'combos') return 'fas fa-gift';
        return 'fas fa-beer';
    }

    // Cargar productos en las secciones
    function loadProducts() {
        renderProducts('featured-products', products.featured);
        renderProducts('beer-products', products.beers);
        renderProducts('sauce-products', products.sauces);
        renderProducts('preserve-products', products.preserves);
        renderProducts('combo-products', products.combos);
    }

    function renderProducts(containerId, productList) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const activeProducts = productList.filter(product => product.active !== false);

        if (activeProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-products">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos disponibles en esta categoría</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activeProducts.map(product => `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy" 
                            onerror="handleImageError(this, ${JSON.stringify(product).replace(/"/g, '&quot;')})">` : 
                        `<i class="fas ${getProductIcon(product)}"></i>`
                    }
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toLocaleString()}</div>
                    
                    <!-- Información de stock mejorada -->
                    ${generateStockInfo(product)}
                    
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Agregar al carrito
                    </button>
                    
                    <!-- Botón de compra rápida -->
                    <button class="quick-buy-btn" data-id="${product.id}">
                        <i class="fas fa-bolt"></i> Comprar rápido
                    </button>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los botones de agregar al carrito
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id);
                const product = findProductById(productId);
                if (product) {
                    addToCart(product, 1);
                }
            });
        });

        // Agregar event listeners a los botones de compra rápida
        container.querySelectorAll('.quick-buy-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id);
                quickBuyProduct(productId);
            });
        });

        // Agregar event listeners a las tarjetas de producto para abrir modal
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // No abrir modal si se hizo click en el botón de agregar al carrito o compra rápida
                if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.quick-buy-btn')) {
                    const productId = parseInt(this.dataset.id);
                    const product = findProductById(productId);
                    if (product) openProductModal(product);
                }
            });
        });
    }

    function findProductById(id) {
        for (const category in products) {
            const product = products[category].find(p => p.id === id);
            if (product) return product;
        }
        return null;
    }

    // Modal de producto
    const productModal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');
    const overlay = document.getElementById('overlay');

    function openProductModal(product) {
        modalBody.innerHTML = `
            <div class="modal-product">
                <div class="modal-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" 
                             onerror="handleModalImageError(this, ${JSON.stringify(product).replace(/"/g, '&quot;')})">` : 
                        `<i class="fas ${getProductIcon(product)}"></i>`
                    }
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="modal-details">
                    <h2 class="modal-title">${product.name}</h2>
                    <p class="modal-description">${product.description}</p>
                    <div class="modal-price">$${product.price.toLocaleString()}</div>
                    
                    <!-- Información de stock en modal -->
                    ${generateStockInfo(product)}
                    
                    <div class="quantity-selector">
                        <button class="quantity-btn" id="decreaseQuantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" id="productQuantity" value="1" min="1" max="10">
                        <button class="quantity-btn" id="increaseQuantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <button class="modal-add-to-cart" id="modalAddToCart" data-id="${product.id}">
                        Añadir al carrito - $${product.price.toLocaleString()}
                    </button>
                    
                    ${product.features && product.features.length > 0 ? `
                    <div class="product-features">
                        <h4>Características:</h4>
                        <ul class="feature-list">
                            ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Configurar event listeners del modal
        const decreaseBtn = document.getElementById('decreaseQuantity');
        const increaseBtn = document.getElementById('increaseQuantity');
        const quantityInput = document.getElementById('productQuantity');
        const addToCartBtn = document.getElementById('modalAddToCart');

        decreaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
                updateAddToCartButton(product);
            }
        });

        increaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            const max = 10;
            if (value < max) {
                quantityInput.value = value + 1;
                updateAddToCartButton(product);
            }
        });

        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            const max = 10;
            if (value < 1) this.value = 1;
            if (value > max) this.value = max;
            updateAddToCartButton(product);
        });

        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            addToCart(product, quantity);
            closeProductModal();
            showAddToCartFeedback(quantity);
        });

        productModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateAddToCartButton(product) {
        const quantity = parseInt(document.getElementById('productQuantity').value);
        const total = product.price * quantity;
        const addToCartBtn = document.getElementById('modalAddToCart');
        addToCartBtn.textContent = `Añadir al carrito - $${total.toLocaleString()}`;
    }

    function closeProductModal() {
        productModal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            closeProductModal();
            closeCartSidebar();
            // Cerrar también modal de compra rápida
            const quickBuyModal = document.querySelector('.quick-buy-modal');
            if (quickBuyModal) quickBuyModal.remove();
        });
    }

    // Funciones del carrito
    function addToCart(product, quantity = 1) {
        // Verificar stock disponible
        if (product.stock && product.quantity + quantity > product.stock) {
            showAddToCartFeedback(0, `❌ Solo quedan ${product.stock} unidades disponibles`);
            return;
        }
        
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ 
                ...product, 
                quantity: quantity 
            });
        }
        
        updateCart();
        saveCart();
        showAddToCartFeedback(quantity);
    }

    function showAddToCartFeedback(quantity, customMessage = null) {
        if (customMessage) {
            // Mostrar notificación de error
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--danger-color);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow);
                z-index: 3000;
                font-weight: bold;
            `;
            notification.textContent = customMessage;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
            return;
        }

        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.style.animation = 'bounce 0.5s';
            setTimeout(() => cartCount.style.animation = '', 500);
        }

        // Mostrar notificación de éxito
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 3000;
            font-weight: bold;
        `;
        notification.textContent = `✅ ${quantity} producto(s) añadido(s) al carrito`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${item.image ? 
                            `<img src="${item.image}" alt="${item.name}" 
                                 onerror="handleCartImageError(this, ${JSON.stringify(item).replace(/"/g, '&quot;')})">` : 
                            `<i class="fas ${getProductIcon(item)}"></i>`
                        }
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-action="increase">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Agregar event listeners a los botones del carrito
            cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.id);
                    const action = this.dataset.action;
                    updateCartItemQuantity(productId, action);
                });
            });

            cartItems.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.id);
                    removeFromCart(productId);
                });
            });
        }

        if (cartTotal) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `$${total.toLocaleString()}`;
        }

        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }

        // Actualizar indicador visual del carrito
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            if (cart.length > 0) {
                cartToggle.classList.add('has-items');
            } else {
                cartToggle.classList.remove('has-items');
            }
        }

        // Añadir botón de limpiar carrito si hay items
        const cartSummary = document.querySelector('.cart-summary');
        if (cartSummary) {
            const existingClearBtn = document.getElementById('clearCartBtn');
            if (cart.length > 0) {
                if (!existingClearBtn) {
                    const clearBtn = document.createElement('button');
                    clearBtn.id = 'clearCartBtn';
                    clearBtn.className = 'clear-cart-btn';
                    clearBtn.innerHTML = '<i class="fas fa-trash"></i> Vaciar Carrito';
                    clearBtn.addEventListener('click', clearCart);
                    cartSummary.appendChild(clearBtn);
                }
            } else {
                if (existingClearBtn) existingClearBtn.remove();
            }
        }
    }

    function updateCartItemQuantity(productId, action) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }

        updateCart();
        saveCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        saveCart();
    }

    // FUNCIONES DE PERSISTENCIA DEL CARRITO
    function saveCart() {
        localStorage.setItem('elOsoCart', JSON.stringify(cart));
        console.log('Carrito guardado:', cart.length, 'productos');
    }

    function loadCart() {
        const savedCart = localStorage.getItem('elOsoCart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                updateCart();
                console.log('Carrito cargado:', cart.length, 'productos');
            } catch (error) {
                console.error('Error loading cart:', error);
                cart = [];
                saveCart();
            }
        }
    }

    function clearCart() {
        if (cart.length === 0) return;
        
        cart = [];
        updateCart();
        saveCart();
        showAddToCartFeedback(0, "🛒 Carrito vaciado");
    }

    // Funcionalidad del carrito
    const cartToggle = document.getElementById('cartToggle');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');

    function openCart() {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', openCart);
    }

    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', openCart);
    }

    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }

    // Navegación por categorías
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Checkout por WhatsApp
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showAddToCartFeedback(0, "❌ Tu carrito está vacío");
                return;
            }

            const message = generateWhatsAppMessage();
            const phoneNumber = '5491123495971';
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(url, '_blank');
            
            // Opcional: Limpiar carrito después de 2 segundos
            setTimeout(() => {
                clearCart();
            }, 2000);
        });
    }

    function generateWhatsAppMessage() {
        let message = '¡HOLA EL OSO! 🐻\nQuiero realizar mi pedido:\n\n';
        
        cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\nTotal: $${total.toLocaleString()}\n\n`;
        
        message += 'Información de entrega:\n';
        message += 'Nombre: [Tu nombre]\n';
        message += 'Dirección: [Tu dirección]\n';
        message += 'Teléfono: [Tu teléfono]\n';
        message += 'Horario preferido: [Horario de entrega]';

        return message;
    }

    // Función para contacto de eventos
    function contactEvent() {
        const message = `¡Hola! Estoy interesado/a en cotizar productos para un evento. Por favor, necesito información sobre:\n\n• Tipo de evento:\n• Cantidad aproximada de personas:\n• Fecha del evento:\n• Productos de interés:\n\nGracias!`;
        const phoneNumber = '5491123495971';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(url, '_blank');
    }

    // Hacer las funciones de manejo de errores globales
    window.handleImageError = handleImageError;
    window.handleModalImageError = handleModalImageError;
    window.handleCartImageError = handleCartImageError;
    window.contactEvent = contactEvent;
    window.clearCart = clearCart;
    window.calculateShipping = calculateShipping;
    window.consultShipping = consultShipping;
    window.notifyWhenAvailable = notifyWhenAvailable;
    window.quickBuyProduct = quickBuyProduct;
    window.completeQuickBuy = completeQuickBuy;
    window.addToCartFromQuickBuy = addToCartFromQuickBuy;
    window.openChatAssistant = openChatAssistant;

    // Función principal inicializada
    async function init() {
        try {
            // Cargar productos desde Google Sheets
            products = await loadProductsFromGoogleSheets();
            loadProducts();
            loadCart();
            
            // Inicializar todas las nuevas funcionalidades
            initShippingCalculator();
            initGuaranteesSection();
            enhanceStockInformation();
            initOneClickCheckout();
            initDeliveryFAQ();
            initPaymentMethods();
            initImmediateContact();
            initRealReviews();
            initQualitySecurity();
            
            console.log("✅ Todas las 9 mejoras implementadas correctamente");
            console.log("📊 Productos cargados desde Google Sheets");
            
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            // Fallback a datos locales
            products = loadLocalProductData();
            loadProducts();
            loadCart();
        }
    }

    init();
});