// ===== CONFIGURACIÓN DE CACHE Y REINTENTOS =====
const CACHE_CONFIG = {
    CACHE_KEY: 'eloso_beers_cache',
    CACHE_DURATION: 60 * 60 * 1000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000
};

// Datos de cervezas (se cargarán desde cache o URL)
let beersData = [];

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';

// Detectar si estamos en la página de cervezas
const isBeersPage = window.location.pathname.includes('beers.html') || 
                    document.querySelector('.beers-page') !== null;

// ===== SISTEMA DE CACHE =====
function getCachedBeers() {
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

function setCachedBeers(data) {
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
                        this.src = 'images/products/beers/default.jpg';
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
                this.src = 'images/products/beers/default.jpg';
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
function generateProductSchema(beers) {
    const productSchema = beers.map((beer, index) => ({
        "@type": "Product",
        "@id": `https://eloso.ar/product/${beer.id}`,
        "name": beer.name,
        "description": beer.description,
        "brand": {
            "@type": "Brand",
            "name": "El Oso"
        },
        "category": beer.subcategory,
        "sku": `ELOSO-${beer.id}`,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "ARS",
            "price": beer.price,
            "availability": beer.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://eloso.ar/beers.html#product-${beer.id}`
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "ABV",
                "value": `${beer.abv}%`
            },
            {
                "@type": "PropertyValue",
                "name": "IBU",
                "value": beer.ibu
            },
            {
                "@type": "PropertyValue",
                "name": "Tamaño",
                "value": beer.size
            }
        ],
        "aggregateRating": beer.rating > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": beer.rating.toFixed(1),
            "reviewCount": Math.floor(beer.sold / 10)
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
                "description": "Cervecería artesanal especializada en cervezas de montaña",
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "AR",
                    "addressRegion": "Buenos Aires"
                },
                "servesCuisine": "Cerveza Artesanal"
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
async function fetchBeersFromURL() {
    try {
        console.log('Solicitando datos desde la URL...');
        const data = await fetchWithRetry('https://script.google.com/macros/s/AKfycbw8ftCNEw6hJBslOS4hyTNniPefNlA_Zsu5b8EO_NcUJmnGXfnuWJNL5tPUAdMsmt4PCw/exec');
        
        console.log('Datos recibidos:', data);
        
        // Verificar si data es un array, si no, intentar extraer el array
        let beerArray = data;
        if (!Array.isArray(data)) {
            // Intentar encontrar un array dentro del objeto
            const keys = Object.keys(data);
            for (const key of keys) {
                if (Array.isArray(data[key])) {
                    beerArray = data[key];
                    break;
                }
            }
        }
        
        if (!Array.isArray(beerArray)) {
            throw new Error('Los datos recibidos no son un array');
        }
        
        // Transformar los datos a la estructura esperada
        const transformedData = beerArray.map(item => {
            // Mapear subcategorías manteniendo nombres en español
            let subcategory = item.subcategory || 'otros';
            
            // Convertir a minúsculas para consistencia
            subcategory = subcategory.toLowerCase();
            
            return {
                id: item.id || 0,
                name: item.name || '',
                subname: item.subname || '',
                description: item.description || '',
                price: parseInt(item.price) || 0,
                category: 'beers',
                subcategory: subcategory || '',
                image: item.image || '',
                badge: item.badge || '',
                stock: parseInt(item.stock) || 0,
                sold: parseInt(item.sold) || 0,
                rating: parseFloat(item.rating) || 0,
                active: item.active || false,
                abv: parseFloat(item.abv) || 0,
                ibu: parseInt(item.ibu) || 0,
                ingredients: item.ingredients || '',
                size: item.size || ''
            };
        });
        
        console.log('Cervezas transformadas:', transformedData.length);
        
        return transformedData;
        
    } catch (error) {
        console.error('Error obteniendo datos desde URL:', error);
        throw error;
    }
}

// Cargar datos de cervezas desde cache o URL con reintentos
async function loadBeersData() {
    try {
        console.log('Cargando datos de cervezas...');
        
        // 1. Intentar cargar desde cache primero
        const cachedData = getCachedBeers();
        if (cachedData) {
            beersData = cachedData;
            
            // Actualizar la vista inmediatamente con datos en cache
            if (isBeersPage) {
                renderBeers();
            }
            
            // En segundo plano, intentar actualizar desde la URL
            setTimeout(() => {
                console.log('Actualizando datos en segundo plano...');
                refreshBeersData();
            }, 1000);
            
            return;
        }
        
        // 2. Si no hay cache válido, cargar desde URL con reintentos
        await refreshBeersData();
        
    } catch (error) {
        console.error('Error cargando datos de cervezas:', error);
        
        // Mostrar mensaje de error en la interfaz
        if (isBeersPage) {
            const container = document.getElementById('beers-container');
            if (container) {
                container.innerHTML = `
                    <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                        <h3>Error al cargar las cervezas</h3>
                        <p>${error.message}</p>
                        <p>Por favor, intenta más tarde.</p>
                    </div>
                `;
            }
        }
    }
}

// Forzar actualización de datos (útil para botones de "actualizar")
async function refreshBeersData() {
    try {
        console.log('Forzando actualización de datos...');
        
        // Cargar datos desde URL
        const transformedData = await fetchBeersFromURL();
        
        // Actualizar datos globales
        beersData = transformedData;
        
        // Guardar en cache
        setCachedBeers(transformedData);
        
        // Generar schema markup para productos
        if (beersData.length > 0) {
            generateProductSchema(beersData);
        }
        
        // Actualizar vista si es necesario
        if (isBeersPage) {
            renderBeers();
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
    if (stock < 10) return `Últimas ${stock} botellas`;
    if (stock < 50) return `${stock} disponibles`;
    return `${stock}+ en stock`;
}

// Renderizar cervezas
function renderBeers() {
    const container = document.getElementById('beers-container');
    if (!container) return;
    
    // Mostrar estado de carga
    if (beersData.length === 0) {
        container.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #C9A96E; margin-bottom: 1rem;"></i>
                <p>Cargando cervezas...</p>
            </div>
        `;
        return;
    }
    
    // Filtrar cervezas
    let filteredBeers = beersData.filter(beer => {
        if (currentFilter !== 'all') {
            // Normalizar filtro para comparación
            const filter = currentFilter.toLowerCase();
            const subcat = beer.subcategory.toLowerCase();
            
            // Mapeo directo de filtros a subcategorías en español
            const filterMap = {
                'ipa': ['ipa'],
                'negra': ['negra'],
                'roja': ['roja'],
                'trigo': ['trigo'],
                'rubia': ['rubia', 'dorada'],
                'especial': ['especial']
            };
            
            // Verificar si la subcategoría coincide con el filtro
            const matches = filterMap[filter] || [filter];
            return matches.some(match => subcat.includes(match));
        }
        
        return true;
    });
    
    // Ordenar
    filteredBeers.sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        return b.sold - a.sold;
    });
    
    // Mostrar mensaje si no hay resultados
    if (filteredBeers.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-beer" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                <h3>No se encontraron cervezas</h3>
                <p>Intentá con otro filtro.</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML con microdata
    container.innerHTML = filteredBeers.map(beer => {
        return `
        <div class="product-card" data-id="${beer.id}" itemscope itemtype="https://schema.org/Product">
            <div class="product-image">
                ${getProductBadge(beer)}
                <!-- Imagen con lazy loading -->
                <img class="lazy-load" 
                    data-src="${beer.image}" 
                    src="${createImagePlaceholder(300, 200)}"
                    alt="${beer.name}" 
                    loading="lazy"
                    width="300"
                    height="200"
                    itemprop="image">
            </div>
            <div class="product-info">
                <div class="product-category" itemprop="category">${beer.subname}</div>
                <h3 class="product-name" itemprop="name">${beer.name}</h3>
                
                <div class="product-stats">
                    <span class="sales">+${formatSales(beer.sold)} ventas</span>
                    <span class="separator"> · </span>
                    <span class="stock">${formatStock(beer.stock)}</span>
                </div>
                
                <p class="product-description" itemprop="description">${beer.description}</p>
                
                <div class="product-specs">
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <i class="fas fa-beer"></i>
                        <span itemprop="value">${beer.abv}%</span> ABV
                    </div>
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <i class="fas fa-fire"></i>
                        <span itemprop="value">${beer.ibu}</span> IBU
                    </div>
                    <div class="spec" itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue">
                        <i class="fas fa-wine-bottle"></i>
                        <span itemprop="value">${beer.size}</span>
                    </div>
                </div>
                
                <div class="product-footer" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <meta itemprop="priceCurrency" content="ARS">
                    <meta itemprop="availability" content="${beer.stock > 0 ? 'InStock' : 'OutOfStock'}">
                    <div class="product-price" itemprop="price">$${beer.price.toLocaleString('es-AR')}</div>
                    <button class="btn-add-to-cart" 
                            data-id="${beer.id}" 
                            data-name="${beer.name}" 
                            data-subname="${beer.subname}"
                            data-size="${beer.size}"
                            data-price="${beer.price}" 
                            data-image="${beer.image}"
                            ${beer.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
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
function getProductBadge(beer) {
    if (beer.stock === 0) {
        return '<div class="product-badge badge-sold-out">AGOTADA</div>';
    } else if (beer.stock < 10) {
        return '<div class="product-badge badge-low-stock">ÚLTIMAS BOTELLAS</div>';
    } else if (beer.sold > 200) {
        return '<div class="product-badge badge-popular">POPULAR</div>';
    } else if (beer.sold == 0) {
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
    renderBeers();
}

// Menú móvil
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
}

// Carrito
function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        renderCart();
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
        // Buscar el producto en beersData para obtener stock actual
        const beerData = beersData.find(beer => beer.id == item.id);
        const currentStock = beerData ? beerData.stock : 0;
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
                ${currentStock <= 5 ? `<small style="color: #EF6C00; display: block; margin-top: 4px;">Solo quedan ${currentStock} disponibles</small>` : ''}
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
function addToCart(id, name, price, image, subname = '', size = '') {
    // Buscar el producto en beersData para obtener stock actual
    const beerData = beersData.find(beer => beer.id == id);
    
    if (!beerData) {
        showNotification(`Error: Producto no encontrado`);
        return;
    }
    
    const currentStock = beerData.stock;
    
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
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`${name} ${subname} añadido al carrito`);
    
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
    message += "Quiero hacer un pedido directo desde la cervecería 🍻\n\n";
    message += "Te paso el detalle:\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n";

    // Detalle del pedido
    cart.forEach((item) => {
        message += `• ${item.name}\n`;
        message += `  Cantidad: ${item.quantity}\n`;
        message += `  Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
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
        refreshBtn.addEventListener('click', refreshBeersData);
        document.body.appendChild(refreshBtn);
    }
}

function clearCart() {
    cart = [];
    updateCartCount();
    renderCart();
    localStorage.removeItem('cart');
    showNotification('Carrito vaciado');
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de cervezas (con cache y reintentos)
    loadBeersData();
    
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
            if (isBeersPage) renderBeers();
        });
    });
    
    // Eventos delegados
    document.addEventListener('click', function(e) {
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
            
            addToCart(id, name, price, image, subname, size);
        }
        
        // Acciones del carrito
        if (e.target.closest('.decrease')) {
            const button = e.target.closest('.decrease');
            const index = parseInt(button.getAttribute('data-index'));
            
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            
            updateCartCount();
            renderCart();
        }
        
        if (e.target.closest('.increase')) {
            const button = e.target.closest('.increase');
            if (button.disabled) return;
            
            const index = parseInt(button.getAttribute('data-index'));
            const item = cart[index];
            
            // Buscar el producto en beersData para obtener stock actual
            const beerData = beersData.find(beer => beer.id == item.id);
            const currentStock = beerData ? beerData.stock : 0;
            
            // Verificar stock antes de aumentar
            if (item.quantity < currentStock) {
                cart[index].quantity += 1;
                updateCartCount();
                renderCart();
            } else {
                showNotification(`No hay más stock disponible de ${item.name} ${item.subname}`);
            }
        }
        
        if (e.target.closest('.cart-item-remove')) {
            const button = e.target.closest('.cart-item-remove');
            const index = parseInt(button.getAttribute('data-index'));
            const itemName = cart[index].name;
            
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
    
    // Inicializar
    updateCartCount();
});