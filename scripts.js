// ===== ANALYTICS MEJORADO =====
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            ...eventParams,
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            timestamp: Date.now()
        });
    }
    console.log(`[Analytics] Evento: ${eventName}`, eventParams);
}

// Track de páginas con parámetros mejorados
function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timestamp: Date.now()
        });
    }
}

// Track de inicio de sesión (usuario interactúa con el sitio)
function trackUserInteraction(type, element) {
    trackEvent('user_interaction', {
        interaction_type: type,
        element_text: element?.textContent?.substring(0, 100) || '',
        element_id: element?.id || '',
        element_class: element?.className || ''
    });
}

// Track de conversiones de producto
function trackProductInteraction(action, product) {
    trackEvent('product_' + action, {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        product_subcategory: product.subcategory,
        currency: 'ARS',
        value: product.price
    });
}

// Track de carrito
function trackCartAction(action, cartData = null) {
    const eventData = {
        cart_action: action,
        cart_item_count: cart?.length || 0,
        cart_total_value: cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
    };
    
    if (cartData) {
        Object.assign(eventData, cartData);
    }
    
    trackEvent('cart_' + action, eventData);
}

// ===== CONFIGURACIÓN DE CACHE Y REINTENTOS =====
const CACHE_CONFIG = {
    CACHE_KEY: 'eloso_products_cache',
    CACHE_DURATION: 20 * 60 * 1000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000
};

// Datos de productos (se cargarán desde cache o URL)
let productsData = [];

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let currentCategory = '';

// Detectar si estamos en una página de productos
const isProductsPage = window.location.pathname.includes('beers.html') || 
                       window.location.pathname.includes('sauces.html') ||
                       window.location.pathname.includes('preserves.html') ||
                       window.location.pathname.includes('combos.html') ||
                       document.querySelector('.beers-page') !== null;

// Detectar categoría actual de la página
function detectPageCategory() {
    const path = window.location.pathname;
    if (path.includes('sauces.html')) return 'sauces';
    if (path.includes('preserves.html')) return 'preserves';
    if (path.includes('combos.html')) return 'combos';
    if (path.includes('beers.html')) return 'beers';
    return '';
}

// ===== SISTEMA DE CACHE =====
function getCachedProducts() {
    try {
        const cacheData = localStorage.getItem(CACHE_CONFIG.CACHE_KEY);
        if (!cacheData) return null;
        
        const { data, timestamp } = JSON.parse(cacheData);
        const now = Date.now();
        
        // Verificar si el cache sigue siendo válido
        if (now - timestamp < CACHE_CONFIG.CACHE_DURATION) {
            console.log('Usando datos del cache');
            return data;
        } else {
            console.log('Cache expirado');
            localStorage.removeItem(CACHE_CONFIG.CACHE_KEY);
            return null;
        }
    } catch (error) {
        console.error('Error leyendo cache:', error);
        return null;
    }
}

function setCachedProducts(data) {
    try {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_CONFIG.CACHE_KEY, JSON.stringify(cacheData));
        console.log('Datos guardados en cache');
    } catch (error) {
        console.error('Error guardando en cache:', error);
    }
}

// ===== SISTEMA DE REINTENTOS =====
async function fetchWithRetry(url, retries = CACHE_CONFIG.MAX_RETRIES, delay = CACHE_CONFIG.RETRY_DELAY) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Intento ${i + 1} de ${retries}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error en intento ${i + 1}:`, error);
            
            // Si es el último intento, relanzar el error
            if (i === retries - 1) {
                throw error;
            }
            
            // Esperar antes del siguiente intento
            if (delay > 0) {
                console.log(`Esperando ${delay}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Incrementar el delay para el próximo intento (backoff exponencial)
                delay *= 2;
            }
        }
    }
}

// ===== LAZY LOADING IMPLEMENTATION =====
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Cargar la imagen real
                    img.src = img.dataset.src;
                    
                    // Cuando la imagen se carga, añadir clase para animación
                    img.onload = function() {
                        img.classList.add('loaded');
                    };
                    
                    // Manejar error de carga
                    img.onerror = function() {
                        this.src = 'images/products/default.jpg';
                        this.classList.add('loaded');
                    };
                    
                    // Dejar de observar esta imagen
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores antiguos
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.onload = function() {
                img.classList.add('loaded');
            };
            img.onerror = function() {
                this.src = 'images/products/default.jpg';
                this.classList.add('loaded');
            };
        });
    }
}

// Función para crear placeholder de imagen
function createImagePlaceholder(width, height) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23111111'/%3E%3C/svg%3E`;
}

// ===== SCHEMA MARKUP GENERATOR =====
function generateProductSchema(products) {
    const productSchema = products.map((product, index) => ({
        "@type": "Product",
        "@id": `https://eloso.ar/product/${product.id}`,
        "name": product.name,
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": "El Oso"
        },
        "category": product.category,
        "sku": `ELOSO-${product.id}`,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "ARS",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://eloso.ar/${product.category}.html#product-${product.id}`
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "Categoría",
                "value": product.subcategory
            },
            {
                "@type": "PropertyValue",
                "name": "Tamaño",
                "value": product.size
            }
        ],
        "aggregateRating": product.rating > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating.toFixed(1),
            "reviewCount": Math.floor(product.sold / 10)
        } : null
    })).filter(schema => schema !== null);

    // Crear el schema markup completo
    const fullSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Brewery",
                "@id": "https://eloso.ar/#brewery",
                "name": "El Oso",
                "url": "https://eloso.ar/",
                "description": "Cervecería artesanal especializada en cervezas y productos artesanales",
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "AR",
                    "addressRegion": "Buenos Aires"
                },
                "servesCuisine": "Cerveza Artesanal y Productos Artesanales"
            },
            ...productSchema
        ]
    };

    // Añadir al DOM
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(fullSchema);
    document.head.appendChild(script);
}

// Función separada para obtener datos desde la URL
async function fetchProductsFromURL() {
    try {
        console.log('Solicitando datos desde la URL...');
        const data = await fetchWithRetry('https://script.google.com/macros/s/AKfycbw8ftCNEw6hJBslOS4hyTNniPefNlA_Zsu5b8EO_NcUJmnGXfnuWJNL5tPUAdMsmt4PCw/exec');
        
        console.log('Datos recibidos:', data);
        
        // Verificar si data es un array, si no, intentar extraer el array
        let productsArray = data;
        if (!Array.isArray(data)) {
            // Intentar encontrar un array dentro del objeto
            const keys = Object.keys(data);
            for (const key of keys) {
                if (Array.isArray(data[key])) {
                    productsArray = data[key];
                    break;
                }
            }
        }
        
        if (!Array.isArray(productsArray)) {
            throw new Error('Los datos recibidos no son un array');
        }
        
        // Transformar los datos a la estructura esperada
        const transformedData = productsArray.map(item => {
            return {
                id: item.id || 0,
                name: item.name || '',
                subname: item.subname || '',
                description: item.description || '',
                price: parseInt(item.price) || 0,
                category: item.category || '',
                subcategory: item.subcategory || '',
                image: item.image || '',
                badge: item.badge || '',
                stock: parseInt(item.stock) || 0,
                sold: parseInt(item.sold) || 0,
                rating: parseFloat(item.rating) || 0,
                active: item.active || false,
                ingredients: item.ingredients || '',
                size: item.size || '',
                spec1value: item.spec1value || '',
                spec2value: item.spec2value || ''
            };
        });
        
        console.log('Productos transformados:', transformedData.length);
        
        return transformedData;
        
    } catch (error) {
        console.error('Error obteniendo datos desde URL:', error);
        throw error;
    }
}

// Cargar datos de productos desde cache o URL con reintentos
async function loadProductsData() {
    try {
        console.log('Cargando datos de productos...');
        
        // 1. Intentar cargar desde cache primero
        const cachedData = getCachedProducts();
        if (cachedData) {
            productsData = cachedData;
            
            // Actualizar la vista inmediatamente con datos en cache
            if (isProductsPage) {
                renderProducts();
            }
            
            // En segundo plano, intentar actualizar desde la URL
            setTimeout(() => {
                console.log('Actualizando datos en segundo plano...');
                refreshProductsData();
            }, 1000);
            
            return;
        }
        
        // 2. Si no hay cache válido, cargar desde URL con reintentos
        await refreshProductsData();
        
    } catch (error) {
        console.error('Error cargando datos de productos:', error);
        
        // Mostrar mensaje de error en la interfaz
        if (isProductsPage) {
            const container = document.getElementById('beers-container');
            if (container) {
                container.innerHTML = `
                    <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                        <h3>Error al cargar los productos</h3>
                        <p>${error.message}</p>
                        <p>Por favor, intenta más tarde.</p>
                    </div>
                `;
            }
        }
    }
}

// Forzar actualización de datos (útil para botones de "actualizar")
async function refreshProductsData() {
    try {
        console.log('Forzando actualización de datos...');
        
        // Cargar datos desde URL
        const transformedData = await fetchProductsFromURL();
        
        // Actualizar datos globales
        productsData = transformedData;
        
        // Guardar en cache
        setCachedProducts(transformedData);
        
        // Generar schema markup para productos
        if (productsData.length > 0) {
            generateProductSchema(productsData);
        }
        
        // Actualizar vista si es necesario
        if (isProductsPage) {
            renderProducts();
        }
    } catch (error) {
        console.error('Error actualizando datos:', error);
    }
}

// Obtener nombre del estilo (en español, sin conversión)
function getStyleName(subcategory) {
    const sub = subcategory.toLowerCase();
    
    // Convertir a mayúsculas solo la primera letra
    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    
    // Devolver el nombre en español en mayúsculas completo
    return sub.toUpperCase();
}

// Función para formatear las ventas (ej: 3900 -> 3,9k)
function formatSales(sold) {
    if (sold >= 1000) {
        return (sold / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return sold.toString();
}

// Función para formatear el stock
function formatStock(stock) {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return `Últimas ${stock} unidades`;
    if (stock < 50) return `${stock} disponibles`;
    return `${stock}+ en stock`;
}

// Renderizar productos
function renderProducts() {
    const container = document.getElementById('beers-container');
    if (!container) return;
    
    // Mostrar estado de carga
    if (productsData.length === 0) {
        container.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #C9A96E; margin-bottom: 1rem;"></i>
                <p>Cargando productos...</p>
            </div>
        `;
        return;
    }
    
    // Filtrar productos por categoría actual si está definida
    let filteredProducts = productsData;
    if (currentCategory) {
        // Mapear categorías en español a las que vienen de los datos
        const categoryMap = {
            'beers': 'cerveza',
            'sauces': 'picante',
            'preserves': 'conserva',
            'combos': 'combo'
        };
        
        // Convertir la categoría en español a la categoría en inglés de los datos
        const spanishCategory = categoryMap[currentCategory];
        filteredProducts = productsData.filter(product => product.category === spanishCategory);
    }
    
    // Aplicar filtro de subcategoría si no es 'all'
    if (currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            if (currentFilter !== 'all') {
                // Normalizar filtro para comparación
                const filter = currentFilter.toLowerCase();
                const subcat = product.subcategory.toLowerCase();
                
                // Comparación directa
                return subcat.includes(filter) || filter.includes(subcat);
            }
            return true;
        });
    }
    
    // Ordenar
    filteredProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        return b.sold - a.sold;
    });
    
    // Track de vista de productos
    if (filteredProducts.length > 0) {
        trackEvent('view_item_list', {
            item_list_id: currentCategory + '_catalog',
            item_list_name: 'Catálogo de ' + currentCategory,
            items: filteredProducts.slice(0, 20).map(product => ({
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.subcategory,
                index: filteredProducts.indexOf(product)
            }))
        });
    }
    
    // Mostrar mensaje si no hay resultados
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                <h3>No se encontraron productos</h3>
                <p>Intentá con otro filtro.</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML con microdata
    container.innerHTML = filteredProducts.map(product => {
        // Determinar valores para las especificaciones según categoría
        let spec1Value = '', spec2Value = '', spec3Value = '';
        
        // Ajustar valores para categorías específicas
        if (currentCategory === 'beers') {
            spec1Value = `Alcohol ${product.spec1value}`;
            spec2Value = `Amargor ${product.spec2value}`;
            spec3Value = `Tamaño ${product.size}`;
        } else if (currentCategory === 'sauces') {
            spec1Value = `Picor ${product.spec1value}`;
            spec2Value = `Textura ${product.spec2value}`;
            spec3Value = `Tamaño ${product.size}`;
        } else if (currentCategory === 'preserves') {
            spec1Value = `${product.spec1value}`;
            spec2Value = `${product.spec2value}`;
            spec3Value = `Tamaño ${product.size}`;
        } else if (currentCategory === 'combos') {
            spec1Value = `${product.spec1value}`;
            spec2Value = `Ahorro ${product.spec2value}`;
            spec3Value = `${product.size}`;
        }
        
        return `
        <div class="product-card" data-id="${product.id}" itemscope itemtype="https://schema.org/Product">
            <div class="product-image">
                ${getProductBadge(product)}
                <!-- Imagen con lazy loading -->
                <img class="lazy-load" 
                    data-src="${product.image}" 
                    src="${createImagePlaceholder(300, 200)}"
                    alt="${product.name}" 
                    loading="lazy"
                    width="300"
                    height="200"
                    itemprop="image">
            </div>
            <div class="product-info">
                <div class="product-category" itemprop="category">${product.subname || product.subcategory}</div>
                <h3 class="product-name" itemprop="name">${product.name}</h3>
                
                <div class="product-stats">
                    <span class="sales">+${formatSales(product.sold)} ventas</span>
                    <span class="separator"> · </span>
                    <span class="stock">${formatStock(product.stock)}</span>
                </div>
                
                <p class="product-description" itemprop="description">${product.description}</p>
                
                <div class="product-specs">
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <span itemprop="value">${spec1Value}</span>
                    </div>
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <span itemprop="value">${spec2Value}</span>
                    </div>
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <span itemprop="value">${spec3Value}</span>
                    </div>
                </div>
                
                <div class="product-footer" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <meta itemprop="priceCurrency" content="ARS">
                    <meta itemprop="availability" content="${product.stock > 0 ? 'InStock' : 'OutOfStock'}">
                    <div class="product-price" itemprop="price">$${product.price.toLocaleString('es-AR')}</div>
                    <button class="btn-add-to-cart" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-subname="${product.subname}"
                            data-size="${product.size}"
                            data-price="${product.price}" 
                            data-image="${product.image}"
                            data-category="${product.category}"
                            ${product.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Inicializar lazy loading para las nuevas imágenes
    initLazyLoading();
}

// Obtener badge del producto
function getProductBadge(product) {
    if (product.stock === 0) {
        return '<div class="product-badge badge-sold-out">AGOTADO</div>';
    } else if (product.stock < 10) {
        return '<div class="product-badge badge-low-stock">ÚLTIMAS UNIDADES</div>';
    } else if (product.sold > 200) {
        return '<div class="product-badge badge-popular">POPULAR</div>';
    } else if (product.sold == 0) {
        return '<div class="product-badge badge-new">NUEVO</div>';
    }
    return '<div class="product-badge badge-limited">EDICIÓN LIMITADA</div>';
}

// Resetear filtros
function resetFilters() {
    currentFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') btn.classList.add('active');
    });
    renderProducts();
}

// Menú móvil
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
    
    // Track del menú móvil
    trackUserInteraction('mobile_menu_toggle', mobileMenu);
}

// Carrito
function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        renderCart();
        trackCartAction('open', {
            cart_item_count: cart.length,
            cart_total_value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
    } else {
        trackCartAction('close');
    }
}

// Renderizar carrito
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.style.display = 'flex';
        cartTotal.textContent = '$0';
        return;
    }
    
    cartEmpty.style.display = 'none';
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    
    // Renderizar items
    cartItems.innerHTML = cart.map((item, index) => {
        // Buscar el producto en productsData para obtener stock actual
        const productData = productsData.find(product => product.id == item.id);
        const currentStock = productData ? productData.stock : 0;
        const maxQuantity = currentStock;
        
        return `
        <div class="cart-item">
            <div class="cart-item-image">
                <!-- Imágenes del carrito con lazy loading -->
                <img class="lazy-load" 
                     data-src="${item.image}" 
                     src="${createImagePlaceholder(60, 60)}"
                     alt="${item.name}"
                     loading="lazy"
                     width="60"
                     height="60">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}<br>${item.subname} ${item.size}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}" ${item.quantity >= maxQuantity ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // Inicializar lazy loading para imágenes del carrito
    initLazyLoading();
}

// Actualizar contador del carrito
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Añadir al carrito con validación de stock
function addToCart(id, name, price, image, subname = '', size = '', category = '') {
    // Buscar el producto en productsData para obtener stock actual
    const productData = productsData.find(product => product.id == id);
    
    if (!productData) {
        showNotification(`Error: Producto no encontrado`);
        return;
    }
    
    const currentStock = productData.stock;
    
    if (currentStock <= 0) {
        showNotification(`Lo sentimos, ${name} ${subname} está agotado`);
        return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // Verificar si al aumentar supera el stock disponible
        const newQuantity = cart[existingItemIndex].quantity + 1;
        
        if (newQuantity > currentStock) {
            showNotification(`No hay suficiente stock de ${name} ${subname}. Stock disponible: ${currentStock}`);
            return;
        }
        
        cart[existingItemIndex].quantity = newQuantity;
    } else {
        // Verificar si hay stock para añadir al menos 1
        if (currentStock < 1) {
            showNotification(`Lo sentimos, ${name} ${subname} está agotado`);
            return;
        }
        
        cart.push({
            id: id,
            name: name,
            subname: subname,
            size: size,
            price: price,
            image: image,
            category: category,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`${name} ${subname} añadido al carrito`);
    
    // Track del evento
    if (productData) {
        trackProductInteraction('add_to_cart', productData);
        trackCartAction('add_item', {
            product_id: id,
            product_name: name,
            quantity_added: 1,
            new_quantity: existingItemIndex !== -1 ? cart[existingItemIndex].quantity : 1
        });
    }
    
    if (document.getElementById('cart-sidebar').classList.contains('active')) {
        renderCart();
    }
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #C9A96E;
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para construir el mensaje de pedido para WhatsApp
function buildWhatsAppOrderMessage() {
    let message = "Hola! 👋\n";
    message += "Quiero hacer un pedido directo desde la cervecería \n\n";
    message += "Te paso el detalle:\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n";

    // Detalle del pedido
    Object.values(cart).forEach((item) => {
        message += `• ${item.name} ${item.subname}: ${item.quantity} x $${item.price.toLocaleString('es-AR')} = $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `Total: $${total.toLocaleString('es-AR')}\n\n`;
    message += "Después coordinamos entrega y el pago.\n";
    message += "Gracias!";

    return message;
}

// Botón de actualización para desarrollo (opcional)
function addRefreshButton() {
    if (window.location.hostname === '') {
        const refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '🔄';
        refreshBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #C9A96E;
            color: black;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10000;
            font-size: 18px;
        `;
        refreshBtn.title = 'Actualizar datos';
        refreshBtn.addEventListener('click', refreshProductsData);
        document.body.appendChild(refreshBtn);
    }
}

function clearCart() {
    trackCartAction('clear');
    cart = [];
    updateCartCount();
    renderCart();
    localStorage.removeItem('cart');
    showNotification('Carrito vaciado');
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Detectar categoría de la página
    currentCategory = detectPageCategory();
    
    // Track de vista de página
    trackPageView();
    
    // Cargar datos de productos (con cache y reintentos)
    loadProductsData();
    
    // Inicializar lazy loading para imágenes existentes
    initLazyLoading();
    
    // Añadir botón de actualización en desarrollo
    addRefreshButton();
    
    // Menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
    if (menuClose) menuClose.addEventListener('click', toggleMobileMenu);
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) toggleMobileMenu();
        });
    }
    
    // Carrito
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Tu carrito está vacío');
                return;
            }
            
            // Track del checkout iniciado
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            trackCartAction('checkout_initiated', {
                cart_items: cart.length,
                cart_total: total,
                payment_method: 'whatsapp'
            });
            
            // Track de conversión de venta
            trackEvent('purchase', {
                transaction_id: 'whatsapp_' + Date.now(),
                value: total,
                currency: 'ARS',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            });
            
            const whatsappMessage = buildWhatsAppOrderMessage();
            const phoneNumber = '5491123495971';
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            
            clearCart();
            
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 100);
            
            showNotification('Redirigiendo a WhatsApp para completar tu pedido');
        });
    }
    
    // Carrito flotante
    const cartFloat = document.getElementById('cart-float');
    if (cartFloat) {
        cartFloat.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    }
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            
            // Track del filtro aplicado
            trackEvent('filter_applied', {
                filter_type: currentFilter,
                page_category: currentCategory,
                page_location: window.location.pathname
            });
            
            if (isProductsPage) renderProducts();
        });
    });
    
    // Eventos delegados
    document.addEventListener('click', function(e) {
        // Track de clic en producto
        if (e.target.closest('.product-card')) {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.getAttribute('data-id');
            const productData = productsData.find(product => product.id == productId);
            
            if (productData) {
                trackEvent('select_item', {
                    item_list_id: currentCategory + '_catalog',
                    item_list_name: 'Catálogo de ' + currentCategory,
                    items: [{
                        item_id: productData.id,
                        item_name: productData.name,
                        price: productData.price,
                        item_category: productData.subcategory
                    }]
                });
            }
        }
        
        // Añadir al carrito
        if (e.target.closest('.btn-add-to-cart')) {
            const button = e.target.closest('.btn-add-to-cart');
            if (button.disabled) return;
            
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'));
            const image = button.getAttribute('data-image');
            const subname = button.getAttribute('data-subname') || '';
            const size = button.getAttribute('data-size') || '';
            const category = button.getAttribute('data-category') || '';
            
            addToCart(id, name, price, image, subname, size, category);
        }
        
        // Acciones del carrito
        if (e.target.closest('.decrease')) {
            const button = e.target.closest('.decrease');
            const index = parseInt(button.getAttribute('data-index'));
            
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                trackCartAction('update_quantity', {
                    product_id: cart[index].id,
                    product_name: cart[index].name,
                    quantity_change: -1,
                    new_quantity: cart[index].quantity
                });
            } else {
                const itemName = cart[index].name;
                cart.splice(index, 1);
                trackCartAction('remove_item', {
                    product_id: cart[index]?.id,
                    product_name: itemName
                });
                showNotification(`${itemName} eliminado`);
            }
            
            updateCartCount();
            renderCart();
        }
        
        if (e.target.closest('.increase')) {
            const button = e.target.closest('.increase');
            if (button.disabled) return;
            
            const index = parseInt(button.getAttribute('data-index'));
            const item = cart[index];
            
            // Buscar el producto en productsData para obtener stock actual
            const productData = productsData.find(product => product.id == item.id);
            const currentStock = productData ? productData.stock : 0;
            
            // Verificar stock antes de aumentar
            if (item.quantity < currentStock) {
                cart[index].quantity += 1;
                updateCartCount();
                renderCart();
                trackCartAction('update_quantity', {
                    product_id: item.id,
                    product_name: item.name,
                    quantity_change: 1,
                    new_quantity: cart[index].quantity
                });
            } else {
                showNotification(`No hay más stock disponible de ${item.name} ${item.subname}`);
            }
        }
        
        if (e.target.closest('.cart-item-remove')) {
            const button = e.target.closest('.cart-item-remove');
            const index = parseInt(button.getAttribute('data-index'));
            const itemName = cart[index].name;
            
            trackCartAction('remove_item', {
                product_id: cart[index].id,
                product_name: itemName
            });
            
            cart.splice(index, 1);
            updateCartCount();
            renderCart();
            showNotification(`${itemName} eliminado`);
        }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            const cartSidebar = document.getElementById('cart-sidebar');
            
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            if (cartSidebar && cartSidebar.classList.contains('active')) {
                toggleCart();
            }
        }
    });
    
    // Track de scroll
    let scrollStartTime = Date.now();
    let maxScrollDepth = 0;
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
        
        // Track de profundidad de scroll cada 25%
        if (scrollPercent % 25 === 0 && scrollPercent > 0) {
            trackEvent('scroll_depth', {
                scroll_percentage: scrollPercent,
                max_scroll_depth: maxScrollDepth,
                time_on_page: Math.round((Date.now() - scrollStartTime) / 1000)
            });
        }
    });
    
    // Track de tiempo en página
    setTimeout(() => {
        trackEvent('time_on_page', {
            seconds_elapsed: 30,
            page_title: document.title
        });
    }, 30000);
    
    // Track de salida de página
    window.addEventListener('beforeunload', function() {
        trackEvent('page_exit', {
            time_on_page: Math.round((Date.now() - scrollStartTime) / 1000),
            max_scroll_depth: maxScrollDepth,
            page_title: document.title
        });
    });
    
    // Inicializar
    updateCartCount();
});