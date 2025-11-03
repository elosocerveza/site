// ===== CONFIGURACIONES GLOBALES =====
const CONFIG = {
    FREE_SHIPPING_THRESHOLD: 15000,
    FREE_SHIPPING_DAYS: [4, 5], // Jueves y Viernes
    FREE_SHIPPING_HOUR: 18
};

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class ElOsoApp {
    constructor() {
        this.products = {
            flash: [], mostSold: [], beers: [], 
            sauces: [], preserves: [], combos: []
        };
        this.cart = [];
        this.currentSearchTerm = '';
        this.managers = {};
    }

    async init() {
        try {
            // PRIMERO configurar los managers
            this.setupManagers();
            
            // LUEGO cargar productos y demás
            await this.loadProducts();
            this.setupEventListeners();
            this.startCountdowns();
            this.loadCart();
            this.updateCartUI();
            
            console.log('🛒 El Oso - Ecommerce inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando la app:', error);
        }
    }

    setupManagers() {
        this.managers = {
            analytics: new GoogleAnalyticsTracker(),
            forms: new GoogleFormsManager(),
            social: new SocialProof(),
            ui: new UIManager(this),
            cart: new CartManager(this),
            products: new ProductManager(this)
        };
    }

    async loadProducts() {
        await this.managers.products.loadProducts();
    }

    loadCart() {
        this.cart = this.managers.cart.loadCart();
    }

    updateCartUI() {
        this.managers.cart.updateCartUI();
    }

    startCountdowns() {
        this.managers.ui.startCountdown();
        this.managers.ui.startShippingCountdown();
        this.managers.ui.startCompactShippingCountdown();
    }

    // Métodos de acceso rápido
    getProductById(id) {
        return this.managers.products.getProductById(id);
    }

    addToCart(productId, button = null) {
        this.managers.cart.addToCart(productId, button);
    }

    removeFromCart(productId) {
        this.managers.cart.removeFromCart(productId);
    }

    updateCartQuantity(productId, change) {
        this.managers.cart.updateCartQuantity(productId, change);
    }

    setupEventListeners() {
        this.setupMenuEventListeners();
        this.setupSearchEventListeners();
        this.setupCartEventListeners();
        this.setupModalEventListeners();
        this.setupNavigationEventListeners();
        this.setupGlobalEventListeners();
    }

    setupMenuEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const closeMenu = document.getElementById('closeMenu');
        const overlay = document.getElementById('overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                if (this.managers.analytics) {
                    this.managers.analytics.trackMenuInteraction('mobile_menu');
                }
            });
        }

        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    }

    setupSearchEventListeners() {
        // Search toggle
        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchBar.classList.add('active');
                setTimeout(() => searchInput?.focus(), 300);
                
                if (this.managers.analytics) {
                    this.managers.analytics.trackMenuInteraction('search_bar');
                }
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchBar.classList.remove('active');
            });
        }

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchTerm = e.target.value.toLowerCase();
                
                // Track Google Analytics después de un pequeño delay
                clearTimeout(window.searchTrackingTimeout);
                window.searchTrackingTimeout = setTimeout(() => {
                    if (this.currentSearchTerm && this.managers.analytics) {
                        this.managers.analytics.trackSearch(this.currentSearchTerm);
                    }
                }, 1000);
                
                this.managers.products.filterProducts(this.currentSearchTerm);
            });
        }
    }

    setupCartEventListeners() {
        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const backButtonCart = document.getElementById('backButtonCart');

        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                this.managers.ui.openCartSidebar();
            });
        }

        if (backButtonCart) {
            backButtonCart.addEventListener('click', () => {
                this.managers.ui.closeCartSidebar();
            });
        }
    }

    setupModalEventListeners() {
        // Why Choose Us Modal
        const whyChooseBtn = document.getElementById('whyChooseBtn');
        const modalClose = document.getElementById('modalClose');

        if (whyChooseBtn) {
            whyChooseBtn.addEventListener('click', () => {
                this.openWhyChooseModal();
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeWhyChooseModal();
            });
        }

        // Product Details Modal
        const closeProductDetails = document.getElementById('closeProductDetails');
        if (closeProductDetails) {
            closeProductDetails.addEventListener('click', () => {
                this.managers.ui.closeProductDetailsModal();
            });
        }

        // Mobile menu item for Why Choose Us
        const whyChooseBtnMobile = document.querySelector('.why-choose-btn-mobile');
        if (whyChooseBtnMobile) {
            whyChooseBtnMobile.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
                setTimeout(() => this.openWhyChooseModal(), 300);
            });
        }
    }

    setupNavigationEventListeners() {
        // Category navigation
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                this.managers.ui.scrollToSection(targetId);
                
                // Update active category
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    setupGlobalEventListeners() {
        const overlay = document.getElementById('overlay');

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeAllModals();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Track tiempo en página cuando el usuario se va
        window.addEventListener('beforeunload', () => {
            if (this.managers.analytics) {
                this.managers.analytics.trackTimeSpentOnPage(document.title);
            }
        });

        // Track engagement cada 30 segundos
        setInterval(() => {
            if (this.managers.analytics && document.visibilityState === 'visible') {
                this.managers.analytics.trackEvent('Engagement', 'active_user', '30s_interval');
            }
        }, 30000);
    }

    closeAllModals() {
        const mobileMenu = document.getElementById('mobileMenu');
        const cartPage = document.getElementById('cartPage');
        const searchBar = document.getElementById('searchBar');
        const whyChooseModal = document.getElementById('whyChooseModal');
        const overlay = document.getElementById('overlay');
        
        mobileMenu?.classList.remove('active');
        cartPage?.classList.remove('active');
        searchBar?.classList.remove('active');
        whyChooseModal?.classList.remove('active');
        this.managers.ui.closeProductDetailsModal();
        
        // Close WhatsApp menu
        const whatsappMenu = document.getElementById('whatsappMenu');
        if (whatsappMenu) {
            whatsappMenu.classList.remove('active');
        }
        
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    openWhyChooseModal() {
        const modal = document.getElementById('whyChooseModal');
        const overlay = document.getElementById('overlay');
        
        if (this.managers.analytics) {
            this.managers.analytics.trackEvent('UI', 'open_modal', 'why_choose_us');
        }
        
        modal?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeWhyChooseModal() {
        const modal = document.getElementById('whyChooseModal');
        const overlay = document.getElementById('overlay');
        
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('overlay');
        
        mobileMenu?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== MANAGER DE PRODUCTOS =====
class ProductManager {
    constructor(app) {
        this.app = app;
        this.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8ftCNEw6hJBslOS4hyTNniPefNlA_Zsu5b8EO_NcUJmnGXfnuWJNL5tPUAdMsmt4PCw/exec';
        this.CACHE_KEY = 'elOsoProductsCache';
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
    }

    async loadProducts() {
        console.log('📥 Cargando productos desde Google Apps Script...');
        
        // PRIMERO intentar cargar desde cache
        const cachedData = this.getProductsFromCache();
        if (cachedData) {
            console.log('✅ Productos cargados desde cache');
            this.processProductsData(cachedData);
            
            // Cargar en segundo plano desde la red para actualizar cache
            this.loadProductsFromNetwork();
            return;
        }

        // SI NO HAY CACHE, cargar desde la red
        await this.loadProductsFromNetwork();
    }

    async loadProductsFromNetwork() {
        console.log('🌐 Cargando productos desde Google Apps Script...');
        
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackEvent('Products', 'load_start', 'google_apps_script');
        }
        
        try {
            const response = await this.fetchWithTimeout(this.APPS_SCRIPT_URL, 10000);
            
            if (response.ok) {
                const jsonData = await response.json();
                console.log('✅ JSON obtenido correctamente desde Apps Script');
                
                if (jsonData.success && jsonData.products) {
                    // Guardar en cache antes de procesar
                    this.saveProductsToCache(jsonData);
                    
                    this.processProductsData(jsonData);
                } else {
                    console.error('❌ Respuesta no exitosa:', jsonData);
                    throw new Error(jsonData.error || 'Respuesta no exitosa del servidor');
                }
                return;
            } else {
                console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando desde Apps Script:', error);
            
            // Intentar cargar desde cache como fallback
            const cachedData = this.getProductsFromCache();
            if (cachedData) {
                console.log('🔄 Usando cache como fallback');
                this.processProductsData(cachedData);
            } else {
                console.log('🔄 Cargando productos de respaldo');
                this.loadFallbackProducts();
            }
        }
    }

    async fetchWithTimeout(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`Timeout después de ${timeout}ms`));
            }, timeout);
            
            fetch(url, { 
                signal: controller.signal,
                mode: 'cors'
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

    processProductsData(jsonData) {
        // Ahora recibimos JSON directamente desde Apps Script
        if (jsonData.success && jsonData.products) {
            this.organizeProducts(jsonData.products);
            this.renderAllProducts();
            
            if (this.app.managers.analytics) {
                this.app.managers.analytics.trackEvent('Products', 'load_success', `Products: ${jsonData.products.length}`);
            }
        } else {
            throw new Error(jsonData.error || 'Datos de productos no válidos');
        }
    }

    // Método para forzar actualización (útil para debug)
    forceRefresh() {
        console.log('🔄 Forzando actualización de productos...');
        this.clearCache();
        this.loadProductsFromNetwork();
    }

    clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            if (this.cacheUpdateTimeout) {
                clearTimeout(this.cacheUpdateTimeout);
            }
            console.log('🗑️ Cache limpiado');
        } catch (error) {
            console.error('❌ Error limpiando cache:', error);
        }
    }

    getProductsFromCache() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            // Verificar si el cache ha expirado
            if (now - timestamp > this.CACHE_DURATION) {
                console.log('🗑️ Cache expirado, eliminando...');
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }

            console.log(`✅ Cache válido (${Math.round((now - timestamp) / 1000 / 60)} minutos)`);
            return data;
        } catch (error) {
            console.error('❌ Error leyendo cache:', error);
            return null;
        }
    }

    saveProductsToCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            console.log('💾 Productos guardados en cache');
            
            // Programar próxima actualización
            this.scheduleCacheUpdate();
        } catch (error) {
            console.error('❌ Error guardando en cache:', error);
            // Si hay error de almacenamiento, continuar sin cache
        }
    }

    scheduleCacheUpdate() {
        // Limpiar cualquier actualización programada anterior
        if (this.cacheUpdateTimeout) {
            clearTimeout(this.cacheUpdateTimeout);
        }

        // Programar actualización para cuando expire el cache
        this.cacheUpdateTimeout = setTimeout(() => {
            console.log('🔄 Actualizando cache programado...');
            this.loadProductsFromNetwork();
        }, this.CACHE_DURATION + 5000); // 5 segundos después de la expiración
    }

    organizeProducts(productsArray) {
        // Limpiar productos existentes
        for (const category in this.app.products) {
            this.app.products[category] = [];
        }

        productsArray.forEach(product => {
            if (product.active === 'false') return;
            
            const category = (product.category || '').toLowerCase();
            
            // Agregar a ofertas flash si tiene descuento
            if (product.badge && product.badge.toLowerCase().includes('flash') || product.oldPrice) {
                this.app.products.flash.push(product);
            }
            
            // Agregar a categoría correspondiente - SOLO UNA VEZ
            this.addToCategory(product, category);
        });

        // PROCESAR MÁS VENDIDOS - SOLO LOS 4 MÁS ALTOS
        this.processMostSoldProducts(productsArray);

        this.ensureMinimumProducts();
    }

    // Agregar este nuevo método a la clase ProductManager
    processMostSoldProducts(productsArray) {
        // Filtrar productos activos con ventas
        const activeProductsWithSales = productsArray.filter(product => 
            product.active !== 'false' && product.sold && parseInt(product.sold) > 0
        );
        
        // Ordenar por número de ventas (descendente)
        const sortedBySales = activeProductsWithSales.sort((a, b) => {
            const salesA = parseInt(a.sold) || 0;
            const salesB = parseInt(b.sold) || 0;
            return salesB - salesA;
        });
        
        // Tomar solo los 4 primeros y asegurarse de que no estén duplicados
        const uniqueMostSold = [];
        const usedIds = new Set();
        
        for (const product of sortedBySales) {
            if (!usedIds.has(product.id) && uniqueMostSold.length < 4) {
                uniqueMostSold.push(product);
                usedIds.add(product.id);
            }
        }
        
        this.app.products.mostSold = uniqueMostSold;
        
        console.log(`✅ ${this.app.products.mostSold.length} productos más vendidos cargados (sin duplicados)`);
    }

    addToCategory(product, category) {
        const categoryMap = {
            'beers': 'beers',
            'sauces': 'sauces', 
            'preserves': 'preserves',
            'combos': 'combos'
        };
        
        const targetCategory = categoryMap[category] || 'beers';
        
        // Verificar que el producto no esté ya en la categoría
        const existingProduct = this.app.products[targetCategory].find(p => p.id === product.id);
        if (!existingProduct) {
            this.app.products[targetCategory].push(product);
        }
    }

    ensureMinimumProducts() {
        // Asegurar que haya productos en flash
        if (this.app.products.flash.length === 0) {
            this.app.products.beers.slice(0, 4).forEach(product => {
                this.app.products.flash.push({
                    ...product,
                    oldPrice: product.price * 1.3,
                    badge: 'flash'
                });
            });
        }

        // Asegurar que haya productos en más vendidos (máximo 4)
        if (this.app.products.mostSold.length === 0) {
            // Tomar solo 4 productos para más vendidos
            this.app.products.mostSold = this.app.products.beers.slice(0, 4).map(p => ({
                ...p,
                sold: Math.floor(Math.random() * 100) + 50
            }));
        } else if (this.app.products.mostSold.length > 4) {
            // Asegurar que nunca haya más de 4 productos en más vendidos
            this.app.products.mostSold = this.app.products.mostSold.slice(0, 4);
        }
    }

    loadFallbackProducts() {
        this.app.products = {
            flash: [
                {
                    id: 1,
                    name: "IPA Artesanal - 500ml",
                    description: "Cerveza IPA con lúpulos americanos y notas cítricas",
                    price: 1800,
                    oldPrice: 2200,
                    image: "images/products/ipa.jpg",
                    badge: "flash",
                    stock: 15,
                    sold: 45,
                    rating: 4.8,
                    size: "500ml",
                    abv: 6.5,
                    ibu: 65,
                    ingredients: "Agua, malta, lúpulo, levadura"
                }
            ],
            mostSold: [
                {
                    id: 3,
                    name: "Golden Ale - 500ml", 
                    description: "Cerveza rubia suave y refrescante",
                    price: 1600,
                    image: "images/products/golden.jpg",
                    badge: "popular",
                    stock: 25,
                    sold: 78,
                    rating: 4.7,
                    size: "500ml",
                    abv: 5.2,
                    ibu: 25
                }
            ],
            beers: [], sauces: [], preserves: [], combos: []
        };
        
        this.renderAllProducts();
    }

    renderAllProducts() {
        this.renderProductsSection('flash-products', this.app.products.flash, true);
        this.renderProductsSection('most-sold-products', this.app.products.mostSold);
        this.renderProductsSection('beer-products', this.app.products.beers);
        this.renderProductsSection('sauce-products', this.app.products.sauces);
        this.renderProductsSection('preserve-products', this.app.products.preserves);
        this.renderProductsSection('combo-products', this.app.products.combos);

        this.updateRecommendations();
        this.updateProductViewers();
    }

    renderProductsSection(containerId, productList, isFlash = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!productList || productList.length === 0) {
            container.innerHTML = this.getEmptyProductsHTML();
            return;
        }

        container.innerHTML = productList.map(product => 
            this.createProductCard(product, isFlash)
        ).join('');
        
        this.attachProductEventListeners(container);
    }

    createProductCard(product, isFlash = false) {
        const discount = product.oldPrice ? 
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
        const stockPercentage = product.stock ? Math.min((product.stock / 50) * 100, 100) : 100;
        const isLowStock = product.stock && product.stock < 10;
        const isOutOfStock = product.stock === 0;
        const qualifiesForFreeShipping = product.price >= CONFIG.FREE_SHIPPING_THRESHOLD;
        
        const badgesHTML = this.generateProductBadges(product, qualifiesForFreeShipping, isLowStock, isOutOfStock);
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category || 'beer'}">
                <div class="product-badges">${badgesHTML}</div>
                
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="window.elOsoApp.managers.ui.handleImageError(this)">` : 
                        this.getCategoryIcon(product.category || 'beer')
                    }
                    ${product.stock && !isOutOfStock ? `
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${stockPercentage}%"></div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-meta">
                        ${product.sold ? `
                            <div class="product-sold">
                                <i class="fas fa-fire"></i>
                                <span>${product.sold}+ vendidos</span>
                            </div>
                        ` : ''}
                        
                        ${product.rating ? `
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <span>${product.rating}</span>
                            </div>
                        ` : ''}
                    </div>
                    <p class="product-description">${product.description || 'Producto de calidad premium'}</p>
                    
                    <div class="product-pricing">
                        <span class="product-price">$${product.price.toLocaleString()}</span>
                        ${product.oldPrice ? `
                            <span class="product-old-price">$${product.oldPrice.toLocaleString()}</span>
                            <span class="product-discount">-${discount}%</span>
                        ` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" alt="" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${isOutOfStock ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateProductBadges(product, qualifiesForFreeShipping, isLowStock, isOutOfStock) {

        return '';

        let badgeType = product.badge || '';
        if (!badgeType && product.oldPrice) badgeType = 'flash';
        if (!badgeType && product.sold > 100) badgeType = 'popular';
        
        let badgesHTML = '';
        
        if (badgeType) {
            badgesHTML += `<div class="product-badge badge-${badgeType}">${this.getBadgeText(badgeType)}</div>`;
        }
        
        if (qualifiesForFreeShipping) {
            badgesHTML += `<div class="product-badge badge-shipping">🚚 ENVÍO GRATIS</div>`;
        }
        
        if (isLowStock && !isOutOfStock) {
            badgesHTML += `<div class="product-badge badge-stock">⚠️ ÚLTIMAS</div>`;
        }
        
        if (isOutOfStock) {
            badgesHTML += `<div class="product-badge badge-stock">🔴 AGOTADO</div>`;
        }
        
        return badgesHTML;
    }

    getBadgeText(badge) {
        const badges = {
            'flash': '🔥 FLASH',
            'new': '🆕 NUEVO', 
            'popular': '⭐ POPULAR',
            'trending': '📈 TRENDING',
            'stock': '⚠️ ÚLTIMAS',
            'outofstock': '🔴 AGOTADO',
            'shipping': '🚚 ENVÍO GRATIS'
        };
        return badges[badge] || badge.toUpperCase();
    }

    getCategoryIcon(category) {
        const icons = {
            'beer': 'fas fa-beer',
            'beers': 'fas fa-beer',
            'cerveza': 'fas fa-beer',
            'cervezas': 'fas fa-beer',
            'sauce': 'fas fa-pepper-hot',
            'sauces': 'fas fa-pepper-hot',
            'salsa': 'fas fa-pepper-hot',
            'salsas': 'fas fa-pepper-hot',
            'preserve': 'fas fa-jar',
            'preserves': 'fas fa-jar',
            'conserva': 'fas fa-jar',
            'conservas': 'fas fa-jar',
            'combo': 'fas fa-gift',
            'combos': 'fas fa-gift'
        };
        
        const normalizedCategory = (category || '').toLowerCase();
        const iconClass = icons[normalizedCategory] || 'fas fa-beer';
        
        return `<i class="${iconClass}" style="font-size: 48px; color: #ccc;"></i>`;
    }

    getFreeShippingHTML() {
        return `
            <div class="free-shipping-info">
                <i class="fas fa-shipping-fast"></i>
                <span>Envío gratis en Quilmes Jueves y Viernes</span>
            </div>
        `;
    }

    getEmptyProductsHTML() {
        return `
            <div class="loading-products">
                <i class="fas fa-box-open"></i>
                <p>No hay productos disponibles</p>
            </div>
        `;
    }

    attachProductEventListeners(container) {
        // Botones agregar al carrito
        container.querySelectorAll('.add-to-cart-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                this.app.addToCart(productId, btn);
            });
        });

        // Botones compra rápida
        container.querySelectorAll('.quick-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                this.quickBuyProduct(productId);
            });
        });

        // Clicks en tarjetas de producto
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = parseInt(card.dataset.id);
                    this.showProductDetails(productId);
                }
            });
        });
    }

    quickBuyProduct(productId) {
        const product = this.getProductById(productId);
        if (!product) return;

        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackQuickBuy(product);
        }

        const message = `¡Hola! Quiero comprar *${product.name}* por $${product.price.toLocaleString()}. Por favor, necesito coordinar la entrega. ¡Gracias!`;
        this.app.managers.ui.openWhatsApp(message);
    }

    showProductDetails(productId) {
        const product = this.getProductById(productId);
        if (!product) return;

        this.app.managers.ui.showProductDetailsModal(product);
    }

    getProductById(id) {
        for (const category in this.app.products) {
            const product = this.app.products[category].find(p => p.id === id);
            if (product) return product;
        }
        return null;
    }

    updateRecommendations() {
        this.app.managers.cart.updateRecommendations();
    }

    updateProductViewers() {
        this.app.managers.ui.updateProductViewers();
    }

    filterProducts(searchTerm) {
        if (!searchTerm) {
            this.renderAllProducts();
            return;
        }

        const filteredProducts = {};
        
        for (const category in this.app.products) {
            filteredProducts[category] = this.app.products[category].filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        this.renderProductsSection('flash-products', filteredProducts.flash, true);
        this.renderProductsSection('most-sold-products', filteredProducts.mostSold);
        this.renderProductsSection('beer-products', filteredProducts.beers);
        this.renderProductsSection('sauce-products', filteredProducts.sauces);
        this.renderProductsSection('preserve-products', filteredProducts.preserves);
        this.renderProductsSection('combo-products', filteredProducts.combos);
    }
}

// ===== MANAGER DEL CARRITO - CON CHECKOUT DE 4 PASOS =====
class CartManager {
    constructor(app) {
        this.app = app;
        this.currentStep = 1;
        this.customerData = {};
        this.initCheckout();
    }

    initCheckout() {
        this.setupCheckoutEventListeners();
    }

    setupCheckoutEventListeners() {
        // Botón de checkout principal
        const checkoutBtnTemu = document.getElementById('checkoutBtnTemu');
        if (checkoutBtnTemu) {
            checkoutBtnTemu.addEventListener('click', () => {
                this.startCheckout();
            });
        }

        // Botón de confirmación final
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', () => {
                this.confirmOrder();
            });
        }

        // Navegación por teclado en formulario
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.validateAndNext();
                }
            });
        }
    }

    startCheckout() {
        if (this.app.cart.length === 0) {
            this.app.managers.ui.showNotification('❌ Tu carrito está vacío', 'error');
            return;
        }

        this.nextStep(2);
        
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackBeginCheckout(this.app.cart, this.calculateSubtotal());
        }
    }

    nextStep(step) {
        // Validar paso actual antes de avanzar
        if (step === 3 && !this.validateStep2()) {
            return;
        }

        // Ocultar paso actual
        document.querySelectorAll('.checkout-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        
        // Mostrar nuevo paso
        const nextStepEl = document.getElementById(`step${step}`);
        if (nextStepEl) {
            nextStepEl.classList.add('active');
        }

        // Actualizar stepper
        this.updateStepper(step);

        // Actualizar UI específica del paso
        this.updateStepUI(step);

        this.currentStep = step;
    }

    prevStep() {
        const prevStep = this.currentStep - 1;
        if (prevStep < 1) return;

        this.nextStep(prevStep);
    }

    updateStepper(step) {
        // Actualizar pasos del stepper
        document.querySelectorAll('.stepper-step').forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
        });

        // Marcar pasos anteriores como completados
        for (let i = 1; i < step; i++) {
            const prevStepEl = document.querySelector(`.stepper-step[data-step="${i}"]`);
            if (prevStepEl) {
                prevStepEl.classList.add('completed');
            }
        }

        // Marcar paso actual como activo
        const currentStepEl = document.querySelector(`.stepper-step[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Actualizar barra de progreso
        const progressFill = document.getElementById('stepperFill');
        if (progressFill) {
            const progress = ((step - 1) / 3) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // Actualizar clase del summary fixed
        const summaryFixed = document.getElementById('cartSummaryFixed');
        if (summaryFixed) {
            summaryFixed.className = `step${step}`;
        }
    }

    updateStepUI(step) {
        switch (step) {
            case 2:
                this.updateRecommendations();
                break;
            case 4:
                this.updateOrderSummary();
                break;
        }
    }

    validateStep2() {
        // No hay validaciones específicas para el paso 2 (sugerencias)
        return true;
    }

    validateAndNext() {
        if (this.currentStep === 3) {
            if (this.validateCustomerForm()) {
                this.saveCustomerData();
                this.nextStep(4);
            }
        }
    }

    validateCustomerForm() {
        const form = document.getElementById('customerForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--accent-red)';
                isValid = false;
                
                // Mostrar error
                this.app.managers.ui.showNotification(
                    `❌ Por favor completa el campo: ${field.previousElementSibling?.textContent || 'requerido'}`,
                    'error'
                );
            } else {
                field.style.borderColor = '';
            }
        });

        // Validación específica de teléfono
        const phoneField = document.getElementById('customerPhone');
        if (phoneField && phoneField.value.trim()) {
            const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
            if (!phoneRegex.test(phoneField.value)) {
                phoneField.style.borderColor = 'var(--accent-red)';
                this.app.managers.ui.showNotification('❌ Por favor ingresa un número de teléfono válido', 'error');
                isValid = false;
            }
        }

        return isValid;
    }

    saveCustomerData() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);
        
        this.customerData = {
            name: formData.get('name') || '',
            phone: formData.get('phone') || '',
            email: formData.get('email') || '',
            address: formData.get('address') || '',
            deliveryDate: formData.get('deliveryDate') || '',
            deliveryTime: formData.get('deliveryTime') || '',
            notes: formData.get('notes') || ''
        };
    }

    updateOrderSummary() {
        this.updateOrderItems();
        this.updateOrderTotals();
        this.updateCustomerSummary();
    }

    updateOrderItems() {
        const container = document.getElementById('orderSummaryItems');
        if (!container) return;

        container.innerHTML = this.app.cart.map(item => {
            const displayPrice = item.discountPrice || item.price;
            const totalPrice = displayPrice * item.quantity;
            
            return `
                <div class="order-item-summary">
                    <div class="order-item-info">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-meta">Cantidad: ${item.quantity} • $${displayPrice.toLocaleString()} c/u</div>
                    </div>
                    <div class="order-item-price">$${totalPrice.toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }

    updateOrderTotals() {
        const { subtotal, totalSavings } = this.calculateCartTotals();
        
        const subtotalEl = document.getElementById('summarySubtotal');
        const shippingEl = document.getElementById('summaryShipping');
        const totalEl = document.getElementById('summaryTotalFinal');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `$${subtotal.toLocaleString()}`;
        
        // Determinar costo de envío
        if (this.customerData.deliveryDate === 'jueves' || this.customerData.deliveryDate === 'viernes') {
            if (shippingEl) shippingEl.textContent = 'GRATIS';
        } else {
            if (shippingEl) {
                shippingEl.textContent = 'A CONSULTAR';
                shippingEl.style.color = 'var(--text-light)';
            }
        }
    }

    updateCustomerSummary() {
        const fields = {
            'summaryCustomerName': this.customerData.name,
            'summaryCustomerPhone': this.customerData.phone,
            'summaryCustomerAddress': this.customerData.address,
            'summaryDeliveryDate': this.getDeliveryDateDisplay(this.customerData.deliveryDate),
            'summaryDeliveryTime': this.getDeliveryTimeDisplay(this.customerData.deliveryTime),
            'summaryCustomerNotes': this.customerData.notes || 'Sin notas adicionales'
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Ocultar fila de notas si está vacía
        const notesRow = document.getElementById('summaryNotesRow');
        if (notesRow && !this.customerData.notes) {
            notesRow.style.display = 'none';
        }
    }

    getDeliveryDateDisplay(dateValue) {
        const dates = {
            'jueves': 'Jueves (Envío Gratis)',
            'viernes': 'Viernes (Envío Gratis)',
            'otro': 'Otro día (Consultar costo)'
        };
        return dates[dateValue] || 'A confirmar';
    }

    getDeliveryTimeDisplay(timeValue) {
        const times = {
            'mañana': 'Mañana (9:00 - 12:00)',
            'tarde': 'Tarde (14:00 - 18:00)',
            'noche': 'Noche (18:00 - 21:00)'
        };
        return times[timeValue] || 'Cualquier horario';
    }

    async confirmOrder() {
        if (this.app.cart.length === 0) {
            this.app.managers.ui.showNotification('❌ Tu carrito está vacío', 'error');
            return;
        }

        if (!this.customerData.name || !this.customerData.phone) {
            this.app.managers.ui.showNotification('❌ Por favor completa tus datos', 'error');
            this.nextStep(3);
            return;
        }

        const { subtotal, totalSavings } = this.calculateCartTotals();
        const message = this.buildCompleteWhatsAppMessage(subtotal, totalSavings);

        // Track Google Analytics
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackPurchase(
                'ELOSO_' + Date.now(), 
                this.app.cart, 
                subtotal
            );
        }

        // Enviar a Google Apps Script
        await this.submitCompleteOrderToAppsScript(subtotal);

        // Abrir WhatsApp
        this.app.managers.ui.openWhatsApp(message);
        
        // Limpiar y cerrar
        setTimeout(() => {
            this.clearCart();
            this.resetCheckout();
            this.app.managers.ui.closeCartSidebar();
        }, 1000);
    }

    buildCompleteWhatsAppMessage(subtotal, totalSavings) {
        let message = `¡Hola! Quiero realizar el siguiente pedido:\n\n`;
        message += `*📦 PEDIDO EL OSO*\n`;
        message += `------------------------\n\n`;
        
        // Productos
        message += `*Productos:*\n`;
        this.app.cart.forEach(item => {
            const displayPrice = item.discountPrice || item.price;
            message += `• ${item.name} x${item.quantity} - $${(displayPrice * item.quantity).toLocaleString()}\n`;
        });

        message += `\n------------------------\n`;
        
        // Totales
        message += `*Resumen de Pago:*\n`;
        message += `Subtotal: $${subtotal.toLocaleString()}\n`;
        
        if (totalSavings > 0) {
            message += `Ahorro: $${totalSavings.toLocaleString()}\n`;
        }
        
        const deliveryCost = this.getDeliveryCostMessage();
        message += `Envío: ${deliveryCost}\n`;
        message += `*TOTAL: $${subtotal.toLocaleString()}*\n\n`;

        // Datos del cliente
        message += `*👤 Datos del Cliente:*\n`;
        message += `Nombre: ${this.customerData.name}\n`;
        message += `Teléfono: ${this.customerData.phone}\n`;
        if (this.customerData.email) {
            message += `Email: ${this.customerData.email}\n`;
        }

        message += `\n*🚚 Información de Entrega:*\n`;
        message += `Dirección: ${this.customerData.address}\n`;
        message += `Fecha: ${this.getDeliveryDateDisplay(this.customerData.deliveryDate)}\n`;
        message += `Horario: ${this.getDeliveryTimeDisplay(this.customerData.deliveryTime)}\n`;
        
        if (this.customerData.notes) {
            message += `Notas: ${this.customerData.notes}\n`;
        }

        message += `\nPor favor, confirmar disponibilidad y coordinar el envío. ¡Gracias!`;

        return message;
    }

    getDeliveryCostMessage() {
        if (this.customerData.deliveryDate === 'jueves' || this.customerData.deliveryDate === 'viernes') {
            return 'GRATIS';
        } else {
            return 'A CONSULTAR';
        }
    }

    async submitCompleteOrderToAppsScript(subtotal) {
        const orderId = 'ELOSO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        if (this.app.managers.forms) {
            const orderData = {
                timestamp: new Date().toISOString(),
                orderId: orderId,
                items: this.app.cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.discountPrice || item.price,
                    total: (item.discountPrice || item.price) * item.quantity
                })),
                total: subtotal,
                customer: this.customerData.name,
                phone: this.customerData.phone,
                address: this.customerData.address,
                deliveryDate: this.customerData.deliveryDate,
                deliveryTime: this.customerData.deliveryTime,
                notes: this.customerData.notes || ''
            };
            
            try {
                await this.app.managers.forms.submitOrderToGoogleForm(orderData);
                console.log('✅ Pedido completo enviado a Google Apps Script');
            } catch (error) {
                console.error('❌ Error enviando pedido completo:', error);
            }
        }
    }

    resetCheckout() {
        this.currentStep = 1;
        this.customerData = {};
        
        // Resetear formulario
        const form = document.getElementById('customerForm');
        if (form) {
            form.reset();
        }
        
        // Volver al paso 1
        this.nextStep(1);
    }

    // ===== MÉTODOS EXISTENTES DEL CARRITO =====

    addToCart(productId, button = null) {
        const product = this.app.getProductById(productId);
        if (!product) return;

        const existingItem = this.app.cart.find(item => item.id === productId);
        
        // Verificar stock
        if (existingItem && product.stock && existingItem.quantity >= product.stock) {
            this.app.managers.ui.showNotification('❌ No hay más stock disponible', 'error');
            return;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.app.cart.push({
                ...product,
                quantity: 1
            });
        }

        // Track Google Analytics
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackAddToCart(product, 1);
        }

        // Animación del botón
        if (button) {
            button.classList.add('added');
            setTimeout(() => button.classList.remove('added'), 500);
        }

        this.app.updateCartUI();
        this.saveCart();
        this.app.managers.ui.showNotification('✅ Producto agregado al carrito', 'success');
    }

    removeFromCart(productId) {
        const product = this.app.getProductById(productId);
        if (!product) return;

        // Track Google Analytics
        const item = this.app.cart.find(item => item.id === productId);
        if (item && this.app.managers.analytics) {
            this.app.managers.analytics.trackRemoveFromCart(product, item.quantity);
        }

        this.app.cart = this.app.cart.filter(item => item.id !== productId);
        this.app.updateCartUI();
        this.saveCart();
        this.app.managers.ui.showNotification('🗑️ Producto eliminado', 'info');
    }

    updateCartQuantity(productId, change) {
        const item = this.app.cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        if (item.stock && newQuantity > item.stock) {
            this.app.managers.ui.showNotification('❌ No hay suficiente stock', 'error');
            return;
        }

        item.quantity = newQuantity;
        this.app.updateCartUI();
        this.saveCart();
    }

    updateCartUI() {
        this.updateCartItems();
        this.updateCartSummary();
        this.app.managers.ui.updateShippingProgress();
    }

    updateCartItems() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartItemsCount = document.getElementById('cartItemsCount');
        const checkoutItemsCount = document.getElementById('checkoutItemsCount');
        const cartCount = document.querySelector('.cart-count');

        // Actualizar lista de items
        if (cartItemsList) {
            if (this.app.cart.length === 0) {
                cartItemsList.innerHTML = this.getEmptyCartHTML();
            } else {
                cartItemsList.innerHTML = this.app.cart.map(item => 
                    this.createCartItemHTML(item)
                ).join('');
            }
        }

        // Actualizar contadores
        const totalItems = this.app.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemsCount) cartItemsCount.textContent = totalItems;
        if (checkoutItemsCount) checkoutItemsCount.textContent = totalItems;
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => cartCount.style.transform = 'scale(1)', 300);
        }
    }

    createCartItemHTML(item) {
        const displayPrice = item.discountPrice || item.price;
        const originalPrice = item.oldPrice || item.price;
        const discount = originalPrice > displayPrice ? 
            Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
        
        const variant = item.size || item.variety || 'Única variedad';
        const totalPrice = displayPrice * item.quantity;
        const totalOriginalPrice = originalPrice * item.quantity;

        return `
            <div class="cart-item-temu" data-id="${item.id}" data-category="${item.category || 'beer'}">
                <div class="cart-item-image-temu">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="window.elOsoApp.managers.ui.handleImageError(this)">` : 
                        this.app.managers.products.getCategoryIcon(item.category || 'beer')
                    }
                </div>
                <div class="cart-item-details-temu">
                    <div class="cart-item-name-temu">${item.name}</div>
                    <div class="cart-item-variant-temu">${variant} ✓</div>
                    <div class="cart-item-pricing-temu">
                        <span class="cart-item-current-price-temu">$${totalPrice.toLocaleString()}</span>
                        ${discount > 0 ? `
                            <span class="cart-item-old-price-temu">$${totalOriginalPrice.toLocaleString()}</span>
                            <span class="cart-item-discount-temu">-${discount}%</span>
                        ` : ''}
                    </div>
                    <div class="cart-item-actions-temu">
                        <div class="quantity-selector-temu">
                            <button class="quantity-btn-temu" alt="" onclick="window.elOsoApp.updateCartQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display-temu">${item.quantity}</span>
                            <button class="quantity-btn-temu" alt="" onclick="window.elOsoApp.updateCartQuantity(${item.id}, 1)" ${item.stock && item.quantity >= item.stock ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-item-temu" alt="" onclick="window.elOsoApp.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart-temu">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <span>Agrega productos increíbles</span>
            </div>
        `;
    }

    updateCartSummary() {
        const summaryTotal = document.getElementById('summaryTotal');
        const savingsAmount = document.getElementById('savingsAmount');

        const { subtotal, totalSavings } = this.calculateCartTotals();

        if (summaryTotal) summaryTotal.textContent = `$${subtotal.toLocaleString()}`;
        if (savingsAmount) savingsAmount.textContent = totalSavings.toLocaleString();
    }

    calculateCartTotals() {
        let subtotal = 0;
        let totalSavings = 0;

        this.app.cart.forEach(item => {
            const displayPrice = item.discountPrice || item.price;
            const originalPrice = item.oldPrice || item.price;
            
            subtotal += displayPrice * item.quantity;
            
            if (originalPrice > displayPrice) {
                totalSavings += (originalPrice - displayPrice) * item.quantity;
            }
        });

        return { subtotal, totalSavings };
    }

    updateRecommendations() {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        const recommendations = this.getRecommendations();
        
        if (recommendations.length === 0) {
            recommendationsGrid.innerHTML = '<div class="no-recommendations">No hay recomendaciones disponibles</div>';
            return;
        }

        recommendationsGrid.innerHTML = recommendations.map(product => 
            this.createRecommendationHTML(product)
        ).join('');
    }

    getRecommendations() {
        const allProducts = [
            ...this.app.products.beers, 
            ...this.app.products.sauces, 
            ...this.app.products.preserves, 
            ...this.app.products.combos
        ];
        
        const cartProductIds = this.app.cart.map(item => item.id);
        
        return allProducts
            .filter(product => !cartProductIds.includes(product.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
    }

    createRecommendationHTML(product) {
        const displayPrice = product.discountPrice || product.price;

        return `
            <div class="recommendation-item-temu" data-category="${product.category || 'beer'}">
                <div class="recommendation-image-temu">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="window.elOsoApp.managers.ui.handleImageError(this)">` : 
                        this.app.managers.products.getCategoryIcon(product.category || 'beer')
                    }
                </div>
                <div class="recommendation-name-temu">${product.name}</div>
                <div class="recommendation-price-temu">$${displayPrice.toLocaleString()}</div>
                <button class="recommendation-add-btn-temu" alt="" onclick="window.elOsoApp.addToCart(${product.id})">
                    <i class="fas fa-plus"></i>
                    Agregar
                </button>
            </div>
        `;
    }

    // Este método se reemplaza por el nuevo checkout de 4 pasos, pero mantenemos el nombre por compatibilidad
    checkout() {
        this.startCheckout();
    }

    clearCart() {
        if (this.app.managers.analytics && this.app.cart.length > 0) {
            this.app.managers.analytics.trackEvent('Ecommerce', 'clear_cart', `Items: ${this.app.cart.length}`);
        }
        
        this.app.cart = [];
        this.app.updateCartUI();
        this.saveCart();
        this.app.managers.ui.showNotification('🛒 Carrito vaciado', 'info');
    }

    saveCart() {
        localStorage.setItem('elOsoCart', JSON.stringify(this.app.cart));
    }

    loadCart() {
        const saved = localStorage.getItem('elOsoCart');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
        return [];
    }

    calculateSubtotal() {
        return this.app.cart.reduce((total, item) => {
            const price = item.discountPrice || item.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    }
}

// ===== MANAGER DE LA INTERFAZ DE USUARIO =====
class UIManager {
    constructor(app) {
        this.app = app;
        this.currentProduct = null;
        this.currentQuantity = 1;
        this.setupWhatsAppMenu();
        this.setupMobileEventListeners();
    }

    setupWhatsAppMenu() {
        const whatsappMenuToggle = document.getElementById('whatsappMenuToggle');
        const whatsappMenu = document.getElementById('whatsappMenu');
        const whatsappClose = document.getElementById('whatsappClose');

        if (whatsappMenuToggle) {
            whatsappMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                whatsappMenu.classList.toggle('active');
                
                if (this.app.managers.analytics) {
                    this.app.managers.analytics.trackMenuInteraction('whatsapp_menu');
                }
            });
        }

        if (whatsappClose) {
            whatsappClose.addEventListener('click', () => {
                whatsappMenu.classList.remove('active');
            });
        }

        // Track clicks en opciones específicas de WhatsApp
        document.querySelectorAll('.whatsapp-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const option = item.querySelector('.whatsapp-title')?.textContent || 'general';
                
                if (this.app.managers.analytics) {
                    this.app.managers.analytics.trackWhatsAppClick(option);
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (whatsappMenu && !whatsappMenu.contains(e.target) && 
                !whatsappMenuToggle?.contains(e.target)) {
                whatsappMenu.classList.remove('active');
            }
        });
    }

    setupMobileEventListeners() {
        // Mobile wishlist button
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                this.toggleWishlist();
            });
        }
    }

    toggleWishlist() {
        const wishlistBtn = document.querySelector('.wishlist-btn');
        const isInWishlist = wishlistBtn.classList.contains('active');
        
        if (isInWishlist) {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            this.showNotification('💔 Eliminado de favoritos', 'info');
        } else {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            this.showNotification('❤️ Agregado a favoritos', 'success');
            
            if (this.app.managers.analytics) {
                const productName = document.getElementById('detailsProductNameMobile')?.textContent || 'Unknown Product';
                this.app.managers.analytics.trackEvent('Ecommerce', 'add_to_wishlist', productName);
            }
        }
    }

    // ===== MÉTODOS PARA EL MODAL DE DETALLES DEL PRODUCTO =====
    showProductDetailsModal(product) {
        const modal = document.getElementById('productDetailsModal');
        const overlay = document.getElementById('overlay');
        
        this.currentProduct = product;
        this.currentQuantity = 1;
        
        this.setupProductModalContent(product);
        
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Track Google Analytics
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackProductView(product);
        }
    }

    setupProductModalContent(product) {
        this.setupProductImagesMobile(product);
        this.setupProductInfoMobile(product);
        this.setupProductPricingMobile(product);
        this.setupProductSpecsMobile(product);
        this.setupQuantitySectionMobile(product);
        this.setupActionButtonsMobile(product);
    }

    setupProductImagesMobile(product) {
        const fixedImageContainer = document.querySelector('.fixed-image-container');
        const badgesContainer = document.getElementById('detailsBadgesMobile');
        
        // Limpiar contenedores existentes
        if (fixedImageContainer) {
            fixedImageContainer.innerHTML = '';
        }
        if (badgesContainer) {
            badgesContainer.innerHTML = '';
        }
        
        // Crear y configurar la imagen principal
        if (fixedImageContainer) {
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.name;
                img.loading = 'lazy';
                img.onerror = () => this.handleImageError(img);
                fixedImageContainer.appendChild(img);
            } else {
                // Si no hay imagen, mostrar ícono de categoría
                const category = product.category || 'beer';
                fixedImageContainer.innerHTML = this.app.managers.products.getCategoryIcon(category);
            }
        }
        
        // Setup badges
        this.setupProductBadges(product, badgesContainer);
    }

    setupProductBadges(product, container) {

        return '';

        if (!container) return;

        let badgeType = product.badge || '';
        
        // Determinar badge type
        if (!badgeType && product.oldPrice && product.oldPrice > product.price) {
            badgeType = 'flash';
        }
        if (!badgeType && product.sold > 100) {
            badgeType = 'popular';
        }
        
        // Crear badges
        if (badgeType) {
            const badge = document.createElement('div');
            badge.className = `product-badge badge-${badgeType}`;
            badge.textContent = this.app.managers.products.getBadgeText(badgeType);
            container.appendChild(badge);
        }
        
        // Add stock badge si bajo stock
        if (product.stock && product.stock < 5 && product.stock > 0) {
            const stockBadge = document.createElement('div');
            stockBadge.className = 'product-badge badge-stock';
            stockBadge.textContent = 'ÚLTIMAS UNIDADES';
            container.appendChild(stockBadge);
        }
        
        // Add out of stock badge
        if (product.stock === 0) {
            const outOfStockBadge = document.createElement('div');
            outOfStockBadge.className = 'product-badge badge-stock';
            outOfStockBadge.textContent = 'AGOTADO';
            container.appendChild(outOfStockBadge);
        }
        
        // Add shipping badge si califica para envío gratis
        if (product.price >= CONFIG.FREE_SHIPPING_THRESHOLD) {
            const shippingBadge = document.createElement('div');
            shippingBadge.className = 'product-badge badge-shipping';
            shippingBadge.textContent = '🚚 ENVÍO GRATIS';
            container.appendChild(shippingBadge);
        }
    }

    setupProductInfoMobile(product) {
        // Product name
        const productNameElement = document.getElementById('detailsProductNameMobile');
        if (productNameElement) {
            productNameElement.textContent = product.name;
        }
        
        // Rating and stars
        this.setupProductRatingMobile(product);
        
        // Description
        const descriptionElement = document.getElementById('detailsDescriptionMobile');
        if (descriptionElement) {
            descriptionElement.textContent = product.description || 'Producto de calidad premium artesanal.';
        }
    }

    setupProductRatingMobile(product) {
        const rating = product.rating || 4.5;
        const soldCount = product.sold || Math.floor(Math.random() * 100) + 20;
        
        const starsContainer = document.getElementById('detailsRatingStarsMobile');
        const ratingText = document.getElementById('detailsRatingTextMobile');
        const soldElement = document.getElementById('detailsSoldMobile');
        
        // Generate stars
        if (starsContainer) {
            starsContainer.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                if (i <= Math.floor(rating)) {
                    star.className = 'fas fa-star star';
                } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                    star.className = 'fas fa-star-half-alt star';
                } else {
                    star.className = 'far fa-star star';
                }
                starsContainer.appendChild(star);
            }
        }
        
        if (ratingText) ratingText.textContent = rating.toFixed(1);
        if (soldElement) soldElement.textContent = `${soldCount}+ vendidos`;
    }

    setupProductPricingMobile(product) {
        const currentPriceElement = document.getElementById('detailsCurrentPriceMobile');
        const oldPriceElement = document.getElementById('detailsOldPriceMobile');
        const discountElement = document.getElementById('detailsDiscountMobile');
        const priceSaveElement = document.getElementById('priceSaveMobile');
        
        if (!currentPriceElement) return;
        
        // Use discountPrice if available, otherwise use price
        const displayPrice = product.discountPrice || product.price;
        currentPriceElement.textContent = `$${displayPrice.toLocaleString()}`;
        
        if (product.oldPrice && product.oldPrice > displayPrice) {
            const discount = Math.round(((product.oldPrice - displayPrice) / product.oldPrice) * 100);
            const savings = product.oldPrice - displayPrice;
            
            if (oldPriceElement) {
                oldPriceElement.textContent = `$${product.oldPrice.toLocaleString()}`;
                oldPriceElement.style.display = 'inline';
            }
            if (discountElement) {
                discountElement.textContent = `-${discount}%`;
                discountElement.style.display = 'inline';
            }
            if (priceSaveElement) {
                priceSaveElement.textContent = `Ahorras $${savings.toLocaleString()}`;
                priceSaveElement.style.display = 'block';
            }
        } else {
            if (oldPriceElement) oldPriceElement.style.display = 'none';
            if (discountElement) discountElement.style.display = 'none';
            if (priceSaveElement) priceSaveElement.style.display = 'none';
        }
    }

    setupProductSpecsMobile(product) {
        const specsContainer = document.getElementById('productSpecsMobile');
        if (!specsContainer) return;
        
        specsContainer.innerHTML = '';
        
        const specs = this.generateProductSpecsMobile(product);
        specsContainer.innerHTML = specs;
    }

    generateProductSpecsMobile(product) {
        const specs = [];
        const category = (product.category || '').toLowerCase();
        
        // Size
        if (product.size) {
            specs.push({ label: 'Tamaño', value: product.size });
        }
        
        // Beer specifications
        if (category.includes('beer') || category.includes('cerveza')) {
            if (product.abv) {
                specs.push({ label: 'Alcohol', value: `${product.abv}% ABV` });
            }
            
            if (product.ibu) {
                specs.push({ label: 'Amargor', value: `${product.ibu} IBU` });
            }
            
            if (product.style) {
                specs.push({ label: 'Estilo', value: product.style });
            }
        }
        
        // Sauce specifications
        if (category.includes('sauce') || category.includes('salsa')) {
            if (product.heatLevel) {
                specs.push({ label: 'Nivel de Picante', value: this.getHeatLevelDisplay(product.heatLevel) });
            }
        }
        
        // General specifications
        if (product.ingredients) {
            specs.push({ label: 'Ingredientes', value: product.ingredients });
        }
        
        // Stock information
        if (product.stock !== undefined) {
            if (product.stock === 0) {
                specs.push({ label: 'Disponibilidad', value: 'Agotado' });
            } else if (product.stock < 10) {
                specs.push({ label: 'Disponibilidad', value: `Solo ${product.stock} unidades` });
            } else {
                specs.push({ label: 'Disponibilidad', value: 'En stock' });
            }
        }
        
        // If no specifications, show message
        if (specs.length === 0) {
            return '<div class="no-specs">No hay especificaciones disponibles</div>';
        }
        
        // Generate HTML for specifications
        return specs.map(spec => `
            <div class="spec-row-mobile">
                <div class="spec-label-mobile">${spec.label}</div>
                <div class="spec-value-mobile">${spec.value}</div>
            </div>
        `).join('');
    }

    getHeatLevelDisplay(heatLevel) {
        const levels = {
            'mild': '🌶️ Suave',
            'medium': '🌶️🌶️ Medio',
            'hot': '🌶️🌶️🌶️ Picante',
            'extreme': '🌶️🌶️🌶️🌶️ Extremo'
        };
        
        return levels[heatLevel.toLowerCase()] || heatLevel;
    }

    setupQuantitySectionMobile(product) {
        const quantityDisplay = document.querySelector('.quantity-display-mobile');
        const decreaseBtn = document.querySelector('.quantity-btn-mobile.decrease');
        const increaseBtn = document.querySelector('.quantity-btn-mobile.increase');
        const stockInfo = document.getElementById('detailsStockInfoMobile');
        
        if (!quantityDisplay || !decreaseBtn || !increaseBtn || !stockInfo) return;
        
        // Reset quantity
        this.currentQuantity = 1;
        quantityDisplay.textContent = this.currentQuantity;
        
        // Setup stock information
        if (product.stock !== undefined) {
            if (product.stock === 0) {
                stockInfo.textContent = 'AGOTADO';
                stockInfo.className = 'stock-info-mobile stock-low';
                decreaseBtn.disabled = true;
                increaseBtn.disabled = true;
            } else if (product.stock < 10) {
                stockInfo.textContent = `Solo ${product.stock} disponibles`;
                stockInfo.className = 'stock-info-mobile stock-low';
            } else {
                stockInfo.textContent = 'En stock';
                stockInfo.className = 'stock-info-mobile';
            }
        } else {
            stockInfo.textContent = 'Disponible';
            stockInfo.className = 'stock-info-mobile';
        }
        
        // Setup quantity buttons
        decreaseBtn.onclick = () => {
            if (this.currentQuantity > 1) {
                this.currentQuantity--;
                quantityDisplay.textContent = this.currentQuantity;
                decreaseBtn.disabled = this.currentQuantity <= 1;
            }
        };
        
        increaseBtn.onclick = () => {
            if (!product.stock || this.currentQuantity < product.stock) {
                this.currentQuantity++;
                quantityDisplay.textContent = this.currentQuantity;
                decreaseBtn.disabled = false;
            } else {
                this.showNotification('❌ No hay más stock disponible', 'error');
            }
        };
        
        // Initialize decrease button state
        decreaseBtn.disabled = this.currentQuantity <= 1;
    }

    setupActionButtonsMobile(product) {
        const addToCartBtn = document.getElementById('detailsAddToCartFixed');
        
        if (!addToCartBtn) return;
        
        // Disable button if no stock
        if (product.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-times"></i><span>SIN STOCK</span>';
            return;
        }
        
        addToCartBtn.onclick = () => {
            for (let i = 0; i < this.currentQuantity; i++) {
                this.app.addToCart(product.id);
            }
            this.closeProductDetailsModal();
            this.showNotification(`✅ ${product.name} agregado al carrito`, 'success');
        };
        
        // Ensure button is enabled and has correct text
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i><span>AGREGAR AL CARRITO</span>';
    }

    closeProductDetailsModal() {
        const modal = document.getElementById('productDetailsModal');
        const overlay = document.getElementById('overlay');
        
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
        
        this.currentProduct = null;
        this.currentQuantity = 1;
    }

    // ===== MÉTODOS GENERALES DE UI =====
    handleImageError(img) {
        const imageElement = img.target || img;
        let category = 'beer';
        
        const productCard = imageElement.closest('.product-card');
        if (productCard) {
            category = productCard.dataset.category || 'beer';
        }
        
        const contextCategory = imageElement.closest('[data-category]');
        if (contextCategory) {
            category = contextCategory.dataset.category || category;
        }
        
        imageElement.style.display = 'none';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'image-error-fallback';
        iconContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: #f8f8f8;
            color: #ccc;
        `;
        
        const iconHTML = this.app.managers.products.getCategoryIcon(category);
        iconContainer.innerHTML = iconHTML;
        
        imageElement.parentNode.appendChild(iconContainer);
    }

    // Contadores
    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        const miniCountdown = document.getElementById('miniCountdown');
        
        if (!countdownElement) return;

        const countdownEndKey = 'elOsoCountdownEnd';
        let countdownEnd = localStorage.getItem(countdownEndKey);
        
        if (!countdownEnd) {
            countdownEnd = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem(countdownEndKey, countdownEnd);
        } else {
            countdownEnd = parseInt(countdownEnd);
        }

        const updateCountdown = () => {
            const now = Date.now();
            const timeLeft = Math.max(0, countdownEnd - now);
            
            if (timeLeft <= 0) {
                countdownEnd = Date.now() + (24 * 60 * 60 * 1000);
                localStorage.setItem(countdownEndKey, countdownEnd);
                updateCountdown();
                return;
            }

            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            if (countdownElement) {
                const [hoursEl, minutesEl, secondsEl] = countdownElement.querySelectorAll('.countdown-number');
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
            }

            if (miniCountdown) {
                miniCountdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    startShippingCountdown() {
        const countdownElement = document.getElementById('shippingCountdown');
        if (!countdownElement) return;

        const updateShippingCountdown = () => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
            
            let targetDate = this.calculateNextShippingDate(now, currentDay, currentHour);
            
            const timeDiff = targetDate - now;
            
            if (timeDiff <= 0) {
                countdownElement.textContent = "¡ENVÍO GRATIS DISPONIBLE AHORA!";
                countdownElement.style.color = '#FFD700';
                countdownElement.style.fontWeight = '700';
                return;
            }
            
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            let message = "";
            if (days > 0) {
                message = `Próximo envío gratis en: ${days}d ${hours}h`;
            } else if (hours > 0) {
                message = `¡ENVÍO GRATIS HOY! Termina en: ${hours}h ${minutes}m`;
                countdownElement.style.color = '#FFD700';
                countdownElement.style.fontWeight = '700';
            } else {
                message = `¡ENVÍO GRATIS HOY! Termina en: ${minutes}m`;
                countdownElement.style.color = '#FFD700';
                countdownElement.style.fontWeight = '700';
            }
            
            countdownElement.textContent = message;
        };

        updateShippingCountdown();
        setInterval(updateShippingCountdown, 60000);
    }

    calculateNextShippingDate(now, currentDay, currentHour) {
        let targetDate;
        
        if (CONFIG.FREE_SHIPPING_DAYS.includes(currentDay)) {
            if (currentHour < CONFIG.FREE_SHIPPING_HOUR) {
                targetDate = new Date(now);
                targetDate.setHours(CONFIG.FREE_SHIPPING_HOUR, 0, 0, 0);
            } else {
                const daysUntilNext = (CONFIG.FREE_SHIPPING_DAYS[0] - currentDay + 7) % 7;
                targetDate = new Date(now);
                targetDate.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
                targetDate.setHours(CONFIG.FREE_SHIPPING_HOUR, 0, 0, 0);
            }
        } else {
            const nextShippingDay = CONFIG.FREE_SHIPPING_DAYS.find(day => day > currentDay) || CONFIG.FREE_SHIPPING_DAYS[0];
            const daysUntilNext = (nextShippingDay - currentDay + 7) % 7;
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + daysUntilNext);
            targetDate.setHours(CONFIG.FREE_SHIPPING_HOUR, 0, 0, 0);
        }
        
        return targetDate;
    }

    startCompactShippingCountdown() {
        const countdownElement = document.getElementById('compactShippingCountdown');
        if (!countdownElement) return;

        const updateCompactShippingCountdown = () => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
            
            const targetDate = this.calculateNextShippingDate(now, currentDay, currentHour);
            const timeDiff = targetDate - now;
            
            if (timeDiff <= 0) {
                countdownElement.textContent = "¡HOY!";
                return;
            }
            
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            let countdownText = "";
            if (days > 0) {
                countdownText = `Próximo: ${days}d ${hours}h`;
            } else if (hours > 0) {
                countdownText = `Próximo: ${hours}h ${minutes}m`;
            } else {
                countdownText = `Próximo: ${minutes}m`;
            }
            
            countdownElement.textContent = countdownText;
        };

        updateCompactShippingCountdown();
        setInterval(updateCompactShippingCountdown, 60000);
    }

    updateShippingProgress() {
        const freeShippingThreshold = CONFIG.FREE_SHIPPING_THRESHOLD;
        const subtotal = this.app.managers.cart.calculateSubtotal();
        const remaining = Math.max(0, freeShippingThreshold - subtotal);
        
        const shippingRemaining = document.getElementById('shippingRemaining');
        const shippingProgressFill = document.getElementById('shippingProgressFill');
        
        if (!shippingRemaining || !shippingProgressFill) return;
        
        if (subtotal >= freeShippingThreshold) {
            shippingRemaining.textContent = '¡Envío gratis desbloqueado!';
            shippingProgressFill.style.width = '100%';
        } else {
            shippingRemaining.textContent = `¡Faltan $${remaining.toLocaleString()} para envío gratis!`;
            const progress = (subtotal / freeShippingThreshold) * 100;
            shippingProgressFill.style.width = `${progress}%`;
        }
        
        if (this.app.cart.length === 0) {
            shippingRemaining.textContent = `¡Faltan $${freeShippingThreshold.toLocaleString()} para envío gratis!`;
            shippingProgressFill.style.width = '0%';
        }
    }

    updateProductViewers() {
        document.querySelectorAll('.product-card').forEach(card => {
            const existingBadge = card.querySelector('.viewers-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            const viewers = Math.floor(Math.random() * 10) + 1;
            const viewersBadge = `
                <div class="viewers-badge">
                    <i class="fas fa-eye"></i>
                    <span>${viewers} VISTAS</span>
                </div>
            `;
            
            const badgesContainer = card.querySelector('.product-badges');
            if (badgesContainer) {
                badgesContainer.insertAdjacentHTML('beforeend', viewersBadge);
            }
        });
    }

    openCartSidebar() {
        const cartPage = document.getElementById('cartPage');
        const overlay = document.getElementById('overlay');
        
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackViewCart(this.app.cart, this.app.managers.cart.calculateSubtotal());
        }
        
        cartPage?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.app.updateCartUI();
    }

    closeCartSidebar() {
        const cartPage = document.getElementById('cartPage');
        const overlay = document.getElementById('overlay');
        
        cartPage?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Notificaciones
    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Color basado en el tipo
        if (type === 'success') {
            notification.style.background = 'var(--success-green)';
        } else if (type === 'error') {
            notification.style.background = 'var(--temu-red)';
        } else if (type === 'info') {
            notification.style.background = 'var(--primary-gold)';
            notification.style.color = 'var(--primary-black)';
        }

        document.body.appendChild(notification);

        // Auto remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // WhatsApp
    openWhatsApp(message) {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/5491123495971?text=${encodedMessage}`;
        window.open(url, '_blank');
        
        if (this.app.managers.analytics) {
            this.app.managers.analytics.trackEvent('Contact', 'whatsapp_message', 'checkout');
        }
    }

    // Navegación
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            
            if (this.app.managers.analytics) {
                const categorySections = ['cervezas', 'picantes', 'conservas', 'combos', 'ofertas', 'mas-vendidos'];
                if (categorySections.includes(sectionId)) {
                    this.app.managers.analytics.trackViewCategory(sectionId);
                }
                this.app.managers.analytics.trackScrollToSection(sectionId);
            }
            
            // Actualizar categoría activa
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    }
}

// ===== CLASES DE SERVICIO =====
class GoogleAnalyticsTracker {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        if (typeof gtag !== 'undefined') {
            this.initialized = true;
            console.log('✅ Google Analytics Tracker inicializado');
            gtag('event', 'page_view', {
                'page_title': document.title,
                'page_location': window.location.href
            });
        } else {
            console.warn('❌ gtag no está disponible');
            setTimeout(() => this.init(), 2000);
        }
    }

    trackEvent(category, action, label, value = null) {
        if (!this.initialized) {
            console.warn('Google Analytics no está inicializado');
            return;
        }

        const eventParams = {
            'event_category': category,
            'event_label': label
        };

        if (value !== null) {
            eventParams['value'] = value;
        }

        gtag('event', action, eventParams);
        console.log(`📊 GA Event: ${category} - ${action} - ${label}`, value ? `Value: ${value}` : '');
    }

    trackProductView(product) {
        this.trackEvent('Ecommerce', 'view_item', product.name, product.price);
        
        gtag('event', 'view_item', {
            'items': [{
                'item_id': product.id.toString(),
                'item_name': product.name,
                'category': product.category || 'beer',
                'price': product.price,
                'quantity': 1
            }]
        });
    }

    trackAddToCart(product, quantity = 1) {
        this.trackEvent('Ecommerce', 'add_to_cart', product.name, product.price * quantity);
        
        gtag('event', 'add_to_cart', {
            'currency': 'ARS',
            'value': product.price * quantity,
            'items': [{
                'item_id': product.id.toString(),
                'item_name': product.name,
                'category': product.category || 'beer',
                'price': product.price,
                'quantity': quantity
            }]
        });
    }

    trackRemoveFromCart(product, quantity = 1) {
        this.trackEvent('Ecommerce', 'remove_from_cart', product.name, product.price * quantity);
    }

    trackBeginCheckout(cartItems, totalValue) {
        this.trackEvent('Ecommerce', 'begin_checkout', `Items: ${cartItems.length}`, totalValue);
        
        gtag('event', 'begin_checkout', {
            'currency': 'ARS',
            'value': totalValue,
            'items': cartItems.map(item => ({
                'item_id': item.id.toString(),
                'item_name': item.name,
                'category': item.category || 'beer',
                'price': item.discountPrice || item.price,
                'quantity': item.quantity
            }))
        });
    }

    trackPurchase(orderId, cartItems, totalValue) {
        this.trackEvent('Ecommerce', 'purchase', orderId, totalValue);
        
        gtag('event', 'purchase', {
            'transaction_id': orderId,
            'currency': 'ARS',
            'value': totalValue,
            'items': cartItems.map(item => ({
                'item_id': item.id.toString(),
                'item_name': item.name,
                'category': item.category || 'beer',
                'price': item.discountPrice || item.price,
                'quantity': item.quantity
            }))
        });
    }

    trackProductClick(product, listName = 'Product Grid') {
        this.trackEvent('Ecommerce', 'select_item', product.name, product.price);
        
        gtag('event', 'select_item', {
            'item_list_name': listName,
            'items': [{
                'item_id': product.id.toString(),
                'item_name': product.name,
                'category': product.category || 'beer',
                'price': product.price,
                'quantity': 1
            }]
        });
    }

    trackSearch(searchTerm) {
        this.trackEvent('Search', 'search', searchTerm);
    }

    trackViewCart(cartItems, totalValue) {
        this.trackEvent('Ecommerce', 'view_cart', `Items: ${cartItems.length}`, totalValue);
    }

    trackQuickBuy(product) {
        this.trackEvent('Ecommerce', 'quick_buy', product.name, product.price);
    }

    trackScrollToSection(section) {
        this.trackEvent('Navigation', 'scroll_to_section', section);
    }

    trackViewCategory(category) {
        this.trackEvent('Navigation', 'view_category', category);
    }

    trackMenuInteraction(menuType) {
        this.trackEvent('UI', 'menu_interaction', menuType);
    }

    trackWhatsAppClick(option = 'general') {
        this.trackEvent('Contact', 'whatsapp_click', option);
    }

    trackTimeSpentOnPage(page) {
        this.trackEvent('Engagement', 'time_spent', page);
    }
}

class GoogleFormsManager {
    constructor() {
        this.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8ftCNEw6hJBslOS4hyTNniPefNlA_Zsu5b8EO_NcUJmnGXfnuWJNL5tPUAdMsmt4PCw/exec';
    }

    async submitOrderToGoogleForm(orderData) {
        try {
            const formData = {
                action: 'submitOrder',
                orderData: orderData
            };

            const response = await fetch(this.APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Usar no-cors para evitar problemas CORS
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('✅ Pedido enviado a Google Apps Script');
            return true;
            
        } catch (error) {
            console.log('⚠️ Pedido guardado localmente (fallback)');
            this.saveLocalBackup(orderData);
            return false;
        }
    }

    saveLocalBackup(orderData) {
        try {
            const backups = JSON.parse(localStorage.getItem('formBackups') || '[]');
            backups.push({
                ...orderData,
                timestamp: new Date().toISOString(),
                submitted: false
            });
            localStorage.setItem('formBackups', JSON.stringify(backups));
            console.log('💾 Pedido guardado localmente como respaldo');
        } catch (error) {
            console.error('❌ Error guardando respaldo local:', error);
        }
    }

    // Método para reintentar envíos pendientes
    async retryPendingSubmissions() {
        try {
            const backups = JSON.parse(localStorage.getItem('formBackups') || '[]');
            const pending = backups.filter(backup => !backup.submitted);
            
            for (const order of pending) {
                try {
                    await this.submitOrderToGoogleForm(order);
                    order.submitted = true;
                    console.log('✅ Reintento exitoso para pedido:', order.orderId);
                } catch (error) {
                    console.error('❌ Error en reintento:', error);
                }
            }
            
            // Actualizar localStorage
            localStorage.setItem('formBackups', JSON.stringify(backups));
        } catch (error) {
            console.error('❌ Error en retryPendingSubmissions:', error);
        }
    }
}

class SocialProof {
    constructor() {
        this.photos = [
            {
                image: 'images/ugc/photo1.webp',
                user: '@rosturmer',
                caption: 'Acompañamos las tostadas'
            },
            {
                image: 'images/ugc/photo2.webp', 
                user: '@adannmartinez_',
                caption: 'Una parada técnica'
            },
            {
                image: 'images/ugc/photo3.webp',
                user: '@marcebon395',
                caption: 'Vas a compartir los trafeos cerveceros'
            },
            {
                image: 'images/ugc/photo4.webp',
                user: '@manuu.soria',
                caption: 'De méxican'
            }
        ];
        this.init();
    }

    init() {
        this.loadUGCPhotos();
    }

    loadUGCPhotos() {
        const grid = document.getElementById('ugcGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.photos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'ugc-item';
            photoElement.innerHTML = `
                <img src="${photo.image}" alt="${photo.caption}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="ugc-fallback" style="display: none; align-items: center; justify-content: center; width: 100%; height: 100%; background: #f8f8f8; color: #ccc;">
                    <i class="fas fa-camera" style="font-size: 2rem;"></i>
                </div>
                <div class="ugc-user">
                    <div>${photo.user}</div>
                    <div>${photo.caption}</div>
                </div>
            `;
            grid.appendChild(photoElement);
        });
    }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global de la aplicación
    window.elOsoApp = new ElOsoApp();
    window.elOsoApp.init();
    
    // Exponer métodos globales necesarios
    window.handleImageError = (img) => window.elOsoApp.managers.ui.handleImageError(img);
    window.scrollToSection = (sectionId) => window.elOsoApp.managers.ui.scrollToSection(sectionId);
    window.openCartSidebar = () => window.elOsoApp.managers.ui.openCartSidebar();
    window.closeCartSidebar = () => window.elOsoApp.managers.ui.closeCartSidebar();
    window.addToCart = (productId, button = null) => window.elOsoApp.addToCart(productId, button);
    window.removeFromCart = (productId) => window.elOsoApp.removeFromCart(productId);
    window.updateCartQuantity = (productId, change) => window.elOsoApp.updateCartQuantity(productId, change);
    window.showProductDetails = (productId) => window.elOsoApp.managers.products.showProductDetails(productId);
    window.closeProductDetailsModal = () => window.elOsoApp.managers.ui.closeProductDetailsModal();
    window.openWhyChooseModal = () => window.elOsoApp.openWhyChooseModal();
    window.closeWhyChooseModal = () => window.elOsoApp.closeWhyChooseModal();
    window.quickBuyProduct = (productId) => window.elOsoApp.managers.products.quickBuyProduct(productId);
    window.clearCart = () => window.elOsoApp.managers.cart.clearCart();
    
    // NUEVOS MÉTODOS PARA APPS SCRIPT
    window.clearCache = () => window.elOsoApp.managers.products.clearCache();
    window.refreshProducts = () => window.elOsoApp.managers.products.forceRefresh();
    
    // Métodos para el checkout de 4 pasos
    window.nextStep = (step) => window.elOsoApp.managers.cart.nextStep(step);
    window.prevStep = () => window.elOsoApp.managers.cart.prevStep();
    window.validateAndNext = () => window.elOsoApp.managers.cart.validateAndNext();
    window.startCheckout = () => window.elOsoApp.managers.cart.startCheckout();
    window.confirmOrder = () => window.elOsoApp.managers.cart.confirmOrder();

    // Reintentar envíos pendientes al cargar la página
    setTimeout(() => {
        if (window.elOsoApp.managers.forms) {
            window.elOsoApp.managers.forms.retryPendingSubmissions();
        }
    }, 5000);
});