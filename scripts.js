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

// Configuración
const CACHE_CONFIG = {
    CACHE_KEY: 'eloso_products_cache',
    CACHE_DURATION: 20 * 60 * 1000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000
};

// Variables globales
let productsData = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let currentCategory = 'cerveza';

// Detectar si estamos en la landing page
const isLandingPage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' || 
                      window.location.pathname === '';

function getCachedProducts() {
    try {
        const cacheData = localStorage.getItem(CACHE_CONFIG.CACHE_KEY);
        if (!cacheData) return null;
        
        const { data, timestamp } = JSON.parse(cacheData);
        const now = Date.now();
        
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
            if (i === retries - 1) {
                throw error;
            }
            if (delay > 0) {
                console.log(`Esperando ${delay}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
    }
}

function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = function() {
                        img.classList.add('loaded');
                    };
                    img.onerror = function() {
                        this.src = 'images/products/default.jpg';
                        this.classList.add('loaded');
                    };
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
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

function createImagePlaceholder(width, height) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23111111'/%3E%3C/svg%3E`;
}

async function fetchProductsFromURL() {
    try {
        console.log('Solicitando datos desde la URL...');
        const data = await fetchWithRetry('https://script.google.com/macros/s/AKfycbw8ftCNEw6hJBslOS4hyTNniPefNlA_Zsu5b8EO_NcUJmnGXfnuWJNL5tPUAdMsmt4PCw/exec');
        console.log('Datos recibidos:', data);
        
        let productsArray = data;
        
        // Manejar diferentes formatos de respuesta
        if (!Array.isArray(data)) {
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
        
        // Transformar datos
        const transformedData = productsArray.map(item => {
            return {
                id: item.id || 0,
                name: item.name || '',
                subname: item.subname || '',
                description: item.description || '',
                price: parseInt(item.price) || 0,
                oldPrice: parseInt(item.oldPrice) || 0,
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

async function loadProductsData() {
    try {
        console.log('Cargando datos de productos...');
        
        const cachedData = getCachedProducts();
        if (cachedData) {
            productsData = cachedData;
            renderAllSections();
            // Actualizar en segundo plano
            setTimeout(() => {
                console.log('Actualizando datos en segundo plano...');
                refreshProductsData();
            }, 1000);
            return;
        }
        
        await refreshProductsData();
    } catch (error) {
        console.error('Error cargando datos de productos:', error);
        showErrorMessages();
    }
}

async function refreshProductsData() {
    try {
        console.log('Forzando actualización de datos...');
        const transformedData = await fetchProductsFromURL();
        productsData = transformedData;
        setCachedProducts(transformedData);
        
        renderAllSections();
    } catch (error) {
        console.error('Error actualizando datos:', error);
    }
}

function renderAllSections() {
    // Renderizar cervezas
    renderProductsByCategory('cerveza', 'beers-container');
    
    // Renderizar picantes
    renderProductsByCategory('picante', 'sauces-container');
    
    // Renderizar conservas
    renderProductsByCategory('conserva', 'preserves-container');
    
    // Renderizar combos
    renderProductsByCategory('combo', 'combos-container');
}

function renderProductsByCategory(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let filteredProducts = productsData.filter(product => 
        product.category === category && product.active !== false
    );
    
    // Si es la sección de cervezas, aplicar filtro actual
    if (category === 'cerveza' && currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            const subcat = product.subcategory.toLowerCase();
            return subcat.includes(currentFilter.toLowerCase());
        });
    }
    
    // Ordenar: productos con stock primero, luego por más vendidos
    filteredProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        return b.sold - a.sold;
    });
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                <h3>No se encontraron productos</h3>
                <p>${category === 'cerveza' ? 'Intentá con otro filtro.' : 'Volvé a intentar más tarde.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        return `
        <div class="product-card" data-id="${product.id}" itemscope itemtype="https://schema.org/Product">
            <div class="product-image">
                ${getProductBadge(product)}
                <img class="lazy-load" 
                    data-src="${product.image}" 
                    src="${createImagePlaceholder(300, 200)}"
                    alt="${product.name}" 
                    loading="lazy"
                    width="300"
                    height="200">
            </div>
            
            <div class="product-info">
                <div class="product-header-single-line">
                    <span class="product-type">${product.subname || product.name}</span>
                </div>
                
                <div class="product-description-minimal">
                    ${product.description}
                </div>
                
                <div class="product-pricing">
                    ${product.oldPrice && product.oldPrice > product.price ? 
                        `<span class="product-old-price">$${product.oldPrice.toLocaleString('es-AR')}</span>` : ''}
                    <span class="product-price">$${product.price.toLocaleString('es-AR')}</span>
                    <span class="product-format"> · ${product.size}</span>
                </div>

                <div class="product-social-proof">
                    +${formatSales(product.sold)} personas lo eligieron
                </div>
                
                <div class="product-actions" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <meta itemprop="priceCurrency" content="ARS">
                    <meta itemprop="availability" content="${product.stock > 0 ? 'InStock' : 'OutOfStock'}">    
                    <button class="btn-add-to-cart-primary" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-subname="${product.subname}"
                            data-size="${product.size}"
                            data-price="${product.price}" 
                            data-image="${product.image}"
                            data-category="${product.category}"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Sin stock' : 'Agregar al pedido'}
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    initLazyLoading();
}

function getProductBadge(product) {
    if (product.stock === 0) {
        return '<div class="product-badge">Agotado</div>';
    } else if (product.stock < 10) {
        return '<div class="product-badge">Quedan ' + product.stock + '</div>';
    } else if (product.sold < 10) {
        return '<div class="product-badge">Nuevo</div>';
    } else if (product.sold > 200) {
        return '<div class="product-badge">+200 vendidos</div>';
    } else if (product.sold > 100) {
        return '<div class="product-badge">+100 vendidos</div>';
    } else if (product.sold > 50) {
        return '<div class="product-badge">+50 vendidos</div>';
    } else {
        return '<div class="product-badge">Hecho a mano</div>';
    }
}

function formatSales(sold) {
    if (sold >= 1000) {
        return (sold / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return sold.toString();
}

function formatStock(stock) {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return `Últimas ${stock} unidades`;
    if (stock < 50) return `${stock} disponibles`;
    return `${stock}+ en stock`;
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
    trackUserInteraction('mobile_menu_toggle', mobileMenu);
}

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
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    
    cartItems.innerHTML = cart.map((item, index) => {
        const productData = productsData.find(product => product.id == item.id);
        const currentStock = productData ? productData.stock : 0;
        const maxQuantity = currentStock;
        
        return `
        <div class="cart-item">
            <div class="cart-item-image">
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
                    <button class="quantity-btn increase" data-index="${index}" 
                        ${item.quantity >= maxQuantity ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    initLazyLoading();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, name, price, image, subname = '', size = '', category = '') {
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
        const newQuantity = cart[existingItemIndex].quantity + 1;
        if (newQuantity > currentStock) {
            showNotification(`No hay suficiente stock de ${name} ${subname}. Stock disponible: ${currentStock}`);
            return;
        }
        cart[existingItemIndex].quantity = newQuantity;
    } else {
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
    showNotification(`${name} ${subname} agregado al carrito`);
    
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

function buildWhatsAppOrderMessage() {
    let message = "Hola! 👋\n";
    message += "Quiero hacer un pedido directo desde la cervecería \n\n";
    message += "Te paso el detalle:\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n";
    
    cart.forEach((item) => {
        message += `• ${item.name} ${item.subname}: ${item.quantity} x $${item.price.toLocaleString('es-AR')} = $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `Total: $${total.toLocaleString('es-AR')}\n\n`;
    message += "Después coordinamos entrega y el pago.\n";
    message += "Gracias!";
    
    return message;
}

function checkoutViaWhatsApp() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    trackCartAction('checkout_initiated', {
        cart_items: cart.length,
        cart_total: total,
        payment_method: 'whatsapp'
    });
    
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
    
    // Limpiar carrito después de enviar
    cart = [];
    updateCartCount();
    renderCart();
    
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
    }, 100);
    
    showNotification('Redirigiendo a WhatsApp para completar tu pedido');
}

function clearCart() {
    trackCartAction('clear');
    cart = [];
    updateCartCount();
    renderCart();
    localStorage.removeItem('cart');
    showNotification('Carrito vaciado');
}

function setupSmoothScrolling() {
    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Solo manejar enlaces que no sean # o javascript:void(0)
            if (href === '#' || href === 'javascript:void(0)') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                
                // Calcular posición con offset para el header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar la página
                history.pushState(null, null, href);
                
                // Actualizar navegación activa
                updateActiveNavLink(href);
            }
        });
    });
}

function updateActiveNavLink(href) {
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace correspondiente
    const activeLink = document.querySelector(`.nav-link[href="${href}"], .mobile-link[href="${href}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveNavLink(`#${id}`);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones del mismo grupo
            const filterGroup = this.closest('.filter-group');
            if (filterGroup) {
                filterGroup.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
            }
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Actualizar filtro actual
            currentFilter = this.dataset.filter;
            currentCategory = this.dataset.category || 'cerveza';
            
            // Si estamos en la sección de cervezas, aplicar filtro
            if (currentCategory === 'cerveza') {
                renderProductsByCategory('cerveza', 'beers-container');
            }
            
            trackEvent('filter_applied', {
                filter_type: currentFilter,
                page_category: currentCategory,
                page_location: window.location.pathname
            });
        });
    });
}

function showErrorMessages() {
    const containers = ['beers-container', 'sauces-container', 'preserves-container', 'combos-container'];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                    <h3>Error al cargar los productos</h3>
                    <p>Por favor, intentá más tarde o contactanos directamente.</p>
                    <a href="https://wa.me/5491123495971" class="btn btn-outline" style="margin-top: 1rem;" target="_blank">
                        <i class="fas fa-whatsapp"></i> Contactar por WhatsApp
                    </a>
                </div>
            `;
        }
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando landing page...');
    
    // Track page view
    trackPageView();
    
    // Cargar productos
    loadProductsData();
    
    // Configurar lazy loading
    initLazyLoading();
    
    // Configurar navegación suave
    setupSmoothScrolling();
    
    // Configurar scroll spy
    setupScrollSpy();
    
    // Configurar filtros
    setupFilters();
    
    // Elementos del DOM
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartFloat = document.getElementById('cart-float');
    
    // Menú móvil
    if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
    if (menuClose) menuClose.addEventListener('click', toggleMobileMenu);
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) toggleMobileMenu();
        });
    }
    
    // Carrito
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    
    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutViaWhatsApp);
    }
    
    // Botón flotante del carrito
    if (cartFloat) {
        cartFloat.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    }
    
    // Delegación de eventos para elementos dinámicos
    document.addEventListener('click', function(e) {
        // Tracking de clics en productos
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
        
        // Agregar al carrito
        if (e.target.closest('.btn-add-to-cart-primary')) {
            const button = e.target.closest('.btn-add-to-cart-primary');
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
        
        // Carrito: disminuir cantidad
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
        
        // Carrito: aumentar cantidad
        if (e.target.closest('.increase')) {
            const button = e.target.closest('.increase');
            if (button.disabled) return;
            
            const index = parseInt(button.getAttribute('data-index'));
            const item = cart[index];
            const productData = productsData.find(product => product.id == item.id);
            const currentStock = productData ? productData.stock : 0;
            
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
        
        // Carrito: eliminar item
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
    
    // Cerrar menú/carrito con ESC
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
    
    // Tracking de scroll
    let scrollStartTime = Date.now();
    let maxScrollDepth = 0;
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
        
        if (scrollPercent % 25 === 0 && scrollPercent > 0) {
            trackEvent('scroll_depth', {
                scroll_percentage: scrollPercent,
                max_scroll_depth: maxScrollDepth,
                time_on_page: Math.round((Date.now() - scrollStartTime) / 1000)
            });
        }
    });
    
    // Tracking de tiempo en página
    setTimeout(() => {
        trackEvent('time_on_page', {
            seconds_elapsed: 30,
            page_title: document.title
        });
    }, 30000);
    
    // Tracking al salir de la página
    window.addEventListener('beforeunload', function() {
        trackEvent('page_exit', {
            time_on_page: Math.round((Date.now() - scrollStartTime) / 1000),
            max_scroll_depth: maxScrollDepth,
            page_title: document.title
        });
    });
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Botón de refresh para desarrollo
    if (window.location.hostname === '' || window.location.hostname === 'localhost') {
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
});