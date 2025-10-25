document.addEventListener('DOMContentLoaded', function() {
    let products = {
        featured: [],
        beers: [],
        sauces: [],
        preserves: [],
        combos: []
    };
    
    let cart = [];

    // Productos cargados directamente en el script
    const productData = {
        featured: [
            {
                id: 6,
                name: "Roja con Caramelo - 500ml",
                description: "Dulce y de textura sedosa, con notas acarameladas y un dejo tostado",
                price: 5000,
                image: "images/products/beers/ember.jpg",
                category: "beers",
                badge: "Más Vendida",
                features: [
                    "Alcohol: 5.0%",
                    "Amargor: Bajo",
                    "Notas tostadas y acarameladas"
                ],
                active: true,
                stock: 15,
                stockLimit: false
            },
            {
                id: 2,
                name: "Trigo Especiada - 500ml",
                description: "Ligeramente turbia, liviana y dulce, con notas a naranja, coriandro y menta",
                price: 5000,
                image: "images/products/beers/kuma.jpg",
                category: "beers",
                badge: "Nueva",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Notas de naranja y especias"
                ],
                active: true,
                stock: 8,
                stockLimit: false
            },
            {
                id: 17,
                name: "Combo Degustación",
                description: "6 cervezas artesanales a elección para explorar todos nuestros sabores",
                price: 27000,
                image: "images/products/combos/degustacion.jpg",
                category: "combos",
                badge: "10% OFF",
                features: [
                    "6 cervezas a tu elección",
                    "Ahorra 10%",
                    "Perfecto para conocer nuestra variedad"
                ],
                active: true
            },
            {
                id: 3,
                name: "Chimichurri Tradicional - 330ml",
                description: "Sabor intenso y bien criollo. El clásico condimento argentino para acompañar tus asados",
                price: 6000,
                image: "images/products/preserves/chimi.jpg",
                category: "preserves",
                badge: "Nuevo",
                features: [
                    "Sabor intenso y criollo",
                    "Perfecto para asados",
                    "Ingredientes naturales"
                ],
                active: true
            }
        ],
        beers: [
            {
                id: 1,
                name: "IPA Frutada - 500ml",
                description: "Amargor característico y muy aromática, con notas a frutas tropicales",
                price: 5000,
                image: "images/products/beers/vika.jpg",
                category: "beers",
                features: [
                    "Alcohol: 5,0%",
                    "Amargor: Medio",
                    "Notas frutales tropicales"
                ],
                active: true
            },
            {
                id: 2,
                name: "Trigo Especiada - 500ml",
                description: "Ligeramente turbia, liviana y dulce, con notas a naranja, coriandro y menta",
                price: 5000,
                image: "images/products/beers/kuma.jpg",
                category: "beers",
                badge: "Nueva",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Notas de naranja y especias"
                ],
                active: true
            },
            {
                id: 4,
                name: "Rubia con Caramelo - 500ml",
                description: "Dulce y de textura sedosa, con notas acarameladas",
                price: 5000,
                image: "images/products/beers/arun.jpg",
                category: "beers",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Notas acarameladas"
                ],
                active: true
            },
            {
                id: 5,
                name: "Trigo con Miel - 500ml",
                description: "Ligera, refrescante y levemente dulce, con notas sutiles a miel",
                price: 5000,
                image: "images/products/beers/bennu.jpg",
                category: "beers",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Notas de miel natural"
                ],
                active: false
            },
            {
                id: 6,
                name: "Roja con Caramelo - 500ml",
                description: "Dulce y de textura sedosa, con notas acarameladas y un dejo tostado",
                price: 5000,
                image: "images/products/beers/ember.jpg",
                category: "beers",
                features: [
                    "Alcohol: 5.0%",
                    "Amargor: Bajo",
                    "Notas tostadas y acarameladas"
                ],
                active: true
            },
            {
                id: 7,
                name: "Trigo con Limón - 500ml",
                description: "Liviana y muy refrescante, con un toque cítrico del limón",
                price: 5000,
                image: "images/products/beers/zora.jpg",
                category: "beers",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Toque cítrico de limón"
                ],
                active: false
            },
            {
                id: 8,
                name: "Negra Dulce y Cremosa - 500ml",
                description: "Carácter maltoso y espuma cremosa, con notas a café y chocolate",
                price: 5000,
                image: "images/products/beers/onyx.jpg",
                category: "beers",
                features: [
                    "Alcohol: 6,0%",
                    "Amargor: Medio",
                    "Notas de café y chocolate"
                ],
                active: true
            },
            {
                id: 9,
                name: "Rubia de arroz - 500ml",
                description: "Refrescante, ligera y seca. Una lager con arroz que la hace más suave y tomable",
                price: 5000,
                image: "images/products/beers/mizu.jpg",
                category: "beers",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Suave y refrescante"
                ],
                active: true
            },
            {
                id: 10,
                name: "Negra con Cacao - 500ml",
                description: "Oscura y seca, con notas intensas de cacao y café tostado",
                price: 5000,
                image: "images/products/beers/ndala.jpg",
                category: "beers",
                features: [
                    "Alcohol: 6,0%",
                    "Amargor: Medio",
                    "Notas intensas de cacao"
                ],
                active: true
            },
            {
                id: 11,
                name: "Roja Lupulada - 500ml",
                description: "Combina lo maltoso tostado con un toque cítrico del lúpulo",
                price: 5000,
                image: "images/products/beers/riad.jpg",
                category: "beers",
                features: [
                    "Alcohol: 5,0%",
                    "Amargor: Medio",
                    "Toque cítrico del lúpulo"
                ],
                active: true
            },
            {
                id: 12,
                name: "Trigo - 500ml",
                description: "Ligeramente turbia, liviana y muy refrescante, con notas a clavo y banana",
                price: 5000,
                image: "images/products/beers/tsia.jpg",
                category: "beers",
                features: [
                    "Alcohol: 4,5%",
                    "Amargor: Bajo",
                    "Notas a clavo y banana"
                ],
                active: true
            }
        ],
        sauces: [
            {
                id: 13,
                name: "Jalapeño Verde - 100ml",
                description: "Espesa, sabrosa y balanceada. Perfecta para los aventureros del sabor",
                price: 6000,
                image: "images/products/sauces/picate-verde.jpg",
                category: "sauces",
                features: [
                    "Picor: medio",
                    "Textura: espesa",
                    "Jalapeño verde natural"
                ],
                active: true
            },
            {
                id: 14,
                name: "Jalapeño Rojo - 100ml",
                description: "Espesa, sabrosa y explosiva. Solo para valientes que buscan intensidad",
                price: 6000,
                image: "images/products/sauces/picate-rojo.jpg",
                category: "sauces",
                features: [
                    "Picor: Alto",
                    "Textura: espesa",
                    "Jalapeño rojo intenso"
                ],
                active: true
            }
        ],
        preserves: [
            {
                id: 3,
                name: "Chimichurri Tradicional - 330ml",
                description: "Sabor intenso y bien criollo. El clásico condimento argentino para acompañar tus asados",
                price: 6000,
                image: "images/products/preserves/chimi.jpg",
                category: "preserves",
                badge: "Nuevo",
                features: [
                    "Sabor intenso y criollo",
                    "Perfecto para asados",
                    "Ingredientes naturales"
                ],
                active: true
            },
            {
                id: 15,
                name: "Berenjenas en Escabeche - 330ml",
                description: "Tiernas, sabor intenso y especiado. El clásico antipasto argentino",
                price: 6000,
                image: "images/products/preserves/beren.jpg",
                category: "preserves",
                features: [
                    "Sabor intenso y especiado",
                    "Perfecto para picadas",
                    "Tiernas y sabrosas"
                ],
                active: true
            },
            {
                id: 16,
                name: "Pepinos agridulces - 330ml",
                description: "Dulces y con un toque ácido. Ideal para sándwiches, ensaladas o directo del frasco",
                price: 6000,
                image: "images/products/preserves/peppi.jpg",
                category: "preserves",
                features: [
                    "Dulce con toque ácido",
                    "Versátil en preparaciones",
                    "Textura crujiente"
                ],
                active: true
            }
        ],
        combos: [
            {
                id: 17,
                name: "Combo Degustación",
                description: "6 cervezas artesanales a elección para explorar todos nuestros sabores",
                price: 27000,
                image: "images/products/combos/degustacion.jpg",
                category: "combos",
                badge: "Más Vendido",
                badge: "10% OFF",
                features: [
                    "6 cervezas a tu elección",
                    "Ahorra 10% vs compra individual",
                    "Perfecto para conocer nuestra variedad"
                ],
                active: true
            },
            {
                id: 18,
                name: "Combo Gourmet",
                description: "2 conservas artesanales a elección para realzar tus comidas",
                price: 10000,
                image: "images/products/combos/gourmet.jpg",
                category: "combos",
                badge: "17% OFF",
                features: [
                    "2 conservas a tu elección",
                    "Ahorra 17% vs compra individual",
                    "Ideal para picadas y asados"
                ],
                active: true
            },
            {
                id: 19,
                name: "Combo Explosión",
                description: "2 salsas picantes a elección para los amantes del picante",
                price: 10000,
                image: "images/products/combos/explosion.jpg",
                category: "combos",
                badge: "17% OFF",
                features: [
                    "2 salsas picantes a elección",
                    "Ahorra 17% vs compra individual",
                    "Verde y rojo para todos los gustos"
                ],
                active: true
            },
            {
                id: 20,
                name: "Combo Para Regalar",
                description: "2 cervezas a elección, 1 conserva y 1 salsa picante - Perfecto para regalo",
                price: 20000,
                image: "images/products/combos/regalo.jpg",
                category: "combos",
                badge: "20% OFF",
                features: [
                    "2 cervezas artesanales a elección",
                    "1 conserva casera a elección", 
                    "1 salsa picante a elección",
                    "Ahorra 20% vs compra individual",
                    "Presentación ideal para regalo"
                ],
                active: true
            }
        ]
    };

    // Cargar productos desde el objeto JavaScript
    function loadProductsFromObject() {
        return productData;
    }

    // Función para manejar imágenes que no se cargan
    function handleImageError(imgElement, product) {
        console.log(`Image not found: ${product.image}`);
        
        // Use default image based on category
        if (product.image && product.image.includes('beers')) {
            imgElement.src = 'images/icons/default-beer.jpg';
        } else if (product.image && product.image.includes('sauces')) {
            imgElement.src = 'images/icons/default-sauce.jpg';
        } else if (product.image && product.image.includes('preserves')) {
            imgElement.src = 'images/icons/default-jar.jpg';
        } else {
            imgElement.src = 'images/icons/default-product.jpg';
        }
        
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
        
        // Use default image based on category
        if (product.image && product.image.includes('beers')) {
            imgElement.src = 'images/icons/default-beer.jpg';
        } else if (product.image && product.image.includes('sauces')) {
            imgElement.src = 'images/icons/default-sauce.jpg';
        } else if (product.image && product.image.includes('preserves')) {
            imgElement.src = 'images/icons/default-jar.jpg';
        } else {
            imgElement.src = 'images/icons/default-product.jpg';
        }
        
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
                    ${product.stockLimit ? `<div class="stock-badge">Solo ${product.stock} unidades</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toLocaleString()}</div>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Agregar al carrito
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

        // Agregar event listeners a las tarjetas de producto para abrir modal
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // No abrir modal si se hizo click en el botón de agregar al carrito
                if (!e.target.closest('.add-to-cart-btn')) {
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
                    ${product.stockLimit ? `<div class="stock-badge">Solo ${product.stock} unidades</div>` : ''}
                </div>
                <div class="modal-details">
                    <h2 class="modal-title">${product.name}</h2>
                    <p class="modal-description">${product.description}</p>
                    <div class="modal-price">$${product.price.toLocaleString()}</div>
                    
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
        });
    }

    // Funciones del carrito
    function addToCart(product, quantity = 1) {
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
            notification.textContent = `❌ ${customMessage}`;
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
        showAddToCartFeedback(0, "Carrito vaciado");
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
                showAddToCartFeedback(0, "Tu carrito está vacío");
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
        let message = '¡Hola! Me interesan los siguientes productos:\n\n';
        
        cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\nTotal: $${total.toLocaleString()}\n\n`;
        
        //message += 'Información de entrega:\n';
        //message += 'Nombre: [Tu nombre]\n';
        //message += 'Dirección: [Tu dirección]\n';
        //message += 'Teléfono: [Tu teléfono]\n';
        //message += 'Horario preferido: [Horario de entrega]';

        return message;
    }

    // Función para contacto de eventos
    function contactEvent() {
        const message = `¡Hola! Estoy interesado/a en cotizar productos para un evento. Por favor, necesito información sobre:\n\n• Tipo de evento:\n• Cantidad aproximada de personas:\n• Fecha del evento:\n• Productos de interés:\n\nGracias!`;
        const phoneNumber = '5491123495971';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(url, '_blank');
    }

    // Programa de fidelización
    function initLoyaltyProgram() {
        const loyaltyData = JSON.parse(localStorage.getItem('elOsoLoyalty')) || { points: 0, purchases: 0 };
        
        // Actualizar puntos cuando se realiza checkout
        document.getElementById('checkoutBtn').addEventListener('click', function() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            loyaltyData.points += Math.floor(total / 1000);
            loyaltyData.purchases += 1;
            localStorage.setItem('elOsoLoyalty', JSON.stringify(loyaltyData));
            
            // Mostrar notificación de puntos ganados
            if (Math.floor(total / 1000) > 0) {
                showAddToCartFeedback(0, `¡Ganaste ${Math.floor(total / 1000)} puntos!`);
            }
        });
    }

    // Hacer las funciones de manejo de errores globales
    window.handleImageError = handleImageError;
    window.handleModalImageError = handleModalImageError;
    window.handleCartImageError = handleCartImageError;
    window.contactEvent = contactEvent;
    window.clearCart = clearCart;

    // Inicializar
    function init() {
        products = loadProductsFromObject();
        loadProducts();
        // Cargar carrito guardado
        loadCart();
        initLoyaltyProgram();
    }

    init();
});