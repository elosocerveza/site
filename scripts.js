document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let products = {
        flash: [],
        mostSold: [],
        beers: [],
        sauces: [],
        preserves: [],
        combos: []
    };
    
    let cart = [];
    let currentSearchTerm = '';

    // Nuevas variables para funcionalidades Temu/Shein
    let referralSystem, discountWheel, pushNotifications, loyaltyProgram, chatbot, clubElOso, socialProof;

    // URL de tu Google Sheet (ACTUALIZA ESTE ID)
    const YOUR_SHEET_ID = '2PACX-1vTy8faJa3rHsf2msyB-OH5zyOD9WTD40Ry1O_Jng3p29Z6-58SCNw2KH14y1mr66JoDAkBVQDIXZv8q';
    const YOUR_GID = '1302727963';
    
    // Proxies CORS para evitar bloqueos
    const PROXIES = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/'
    ];

    // URL base de Google Sheets
    const BASE_SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${YOUR_SHEET_ID}/pub?gid=${YOUR_GID}&single=true&output=csv`;

    // ===== MANEJO DE ERRORES DE IMAGEN UNIFICADO =====
    function handleImageError(img) {
        const imageElement = img.target || img;
        let category = 'beer'; // categoría por defecto
        
        // Intentar obtener la categoría del elemento padre
        const productCard = imageElement.closest('.product-card');
        if (productCard) {
            category = productCard.dataset.category || 'beer';
        }
        
        // Intentar obtener la categoría del contexto actual
        const contextCategory = imageElement.closest('[data-category]');
        if (contextCategory) {
            category = contextCategory.dataset.category || category;
        }
        
        imageElement.style.display = 'none';
        
        // Crear elemento de icono de categoría
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
        
        const iconHTML = getCategoryIcon(category);
        iconContainer.innerHTML = iconHTML;
        
        imageElement.parentNode.appendChild(iconContainer);
    }

    // Función específica para el modal de detalles (usa handleImageError internamente)
    function handleProductImageError(img) {
        handleImageError(img);
    }

    // ===== CLASES NUEVAS TEMU/SHEIN =====

    // 1. Sistema de Referidos
    class ReferralSystem {
        constructor() {
            this.referralCode = this.generateReferralCode();
            this.referralDiscount = 500;
            this.init();
        }

        generateReferralCode() {
            let code = localStorage.getItem('elOsoReferralCode');
            if (!code) {
                code = 'ELOSO' + Math.random().toString(36).substr(2, 6).toUpperCase();
                localStorage.setItem('elOsoReferralCode', code);
            }
            return code;
        }

        init() {
            this.checkFirstPurchase();
            this.setupEventListeners();
        }

        checkFirstPurchase() {
            const hasPurchased = localStorage.getItem('elOsoFirstPurchase');
            if (!hasPurchased) {
                setTimeout(() => {
                    this.showReferralModal();
                }, 10000);
            }
        }

        showReferralModal() {
            const modal = document.getElementById('referralModal');
            if (modal) {
                modal.classList.add('active');
                document.getElementById('overlay').classList.add('active');
                document.getElementById('referralCode').textContent = this.referralCode;
            }
        }

        hideReferralModal() {
            const modal = document.getElementById('referralModal');
            if (modal) {
                modal.classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            }
        }

        setupEventListeners() {
            const closeButton = document.getElementById('closeReferralModal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.hideReferralModal();
                });
            }

            const copyButton = document.getElementById('copyReferralCode');
            if (copyButton) {
                copyButton.addEventListener('click', () => {
                    this.copyToClipboard(this.referralCode);
                    showNotification('Código copiado al portapapeles', 'success');
                });
            }

            const whatsappShare = document.getElementById('whatsappShare');
            if (whatsappShare) {
                const message = `¡Hola! Te invito a comprar en El Oso Cerveza. Usa mi código ${this.referralCode} y obtén $${this.referralDiscount} de descuento en tu primera compra. ¡Visita el sitio!`;
                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                whatsappShare.setAttribute('href', url);
            }

            const copyLink = document.getElementById('copyLink');
            if (copyLink) {
                copyLink.addEventListener('click', () => {
                    const message = `¡Hola! Te invito a comprar en El Oso Cerveza. Usa mi código ${this.referralCode} y obtén $${this.referralDiscount} de descuento. Visita: ${window.location.href}`;
                    this.copyToClipboard(message);
                    showNotification('Mensaje copiado al portapapeles', 'success');
                });
            }
        }

        copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    // 2. Ruleta de Descuentos
    class DiscountWheel {
        constructor() {
            this.wheel = document.getElementById('discountWheel');
            this.spinButton = document.getElementById('spinWheel');
            this.isSpinning = false;
            this.lastSpin = localStorage.getItem('lastWheelSpin');
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.checkDailySpin();
        }

        setupEventListeners() {
            if (this.spinButton) {
                this.spinButton.addEventListener('click', () => {
                    if (!this.isSpinning) {
                        this.spin();
                    }
                });
            }
        }

        checkDailySpin() {
            const today = new Date().toDateString();
            if (this.lastSpin === today && this.spinButton) {
                this.spinButton.disabled = true;
                this.spinButton.textContent = 'Ya girado hoy';
            }
        }

        spin() {
            this.isSpinning = true;
            this.spinButton.disabled = true;

            const extraSpins = 2;
            const segmentAngle = 60;
            const randomSegment = Math.floor(Math.random() * 6);
            const targetAngle = 360 * extraSpins + (segmentAngle * randomSegment);

            this.wheel.style.transform = `rotate(${targetAngle}deg)`;

            const today = new Date().toDateString();
            localStorage.setItem('lastWheelSpin', today);

            setTimeout(() => {
                this.showResult(randomSegment);
                this.isSpinning = false;
            }, 4000);
        }

        showResult(segmentIndex) {
            const prizes = [
                '5% OFF',
                '10% OFF',
                '15% OFF',
                '20% OFF',
                'ENVÍO GRATIS',
                '$500 OFF'
            ];
            
            const prize = prizes[segmentIndex];
            showNotification(`🎉 ¡Ganaste: ${prize}! Válido por 24 horas`, 'success');
            
            this.saveDiscount(prize);
            
            // Agregar puntos por girar la ruleta
            if (loyaltyProgram) {
                loyaltyProgram.addPoints(10, 'Por girar la ruleta');
            }
        }

        saveDiscount(prize) {
            const discount = {
                type: this.getDiscountType(prize),
                value: this.getDiscountValue(prize),
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            localStorage.setItem('wheelDiscount', JSON.stringify(discount));
        }

        getDiscountType(prize) {
            if (prize.includes('%')) return 'percentage';
            if (prize.includes('ENVÍO')) return 'shipping';
            return 'fixed';
        }

        getDiscountValue(prize) {
            if (prize.includes('%')) return parseInt(prize);
            if (prize.includes('ENVÍO')) return 0;
            return 500;
        }
    }

    // 3. Notificaciones Push
    class PushNotifications {
        constructor() {
            this.permissionGranted = false;
            this.init();
        }

        async init() {
            if ('Notification' in window) {
                this.permissionGranted = Notification.permission === 'granted';
                
                if (!this.permissionGranted && Notification.permission !== 'denied') {
                    setTimeout(() => {
                        this.showPermissionRequest();
                    }, 30000);
                }
            }
        }

        showPermissionRequest() {
            const modal = document.getElementById('pushPermissionModal');
            if (modal) {
                modal.classList.add('active');
                document.getElementById('overlay').classList.add('active');
                this.setupPermissionEventListeners();
            }
        }

        setupPermissionEventListeners() {
            const allowButton = document.getElementById('allowNotifications');
            const denyButton = document.getElementById('denyNotifications');
            const closeButton = document.getElementById('closePushPermission');
            const modal = document.getElementById('pushPermissionModal');

            const closeModal = () => {
                if (modal) {
                    modal.classList.remove('active');
                    document.getElementById('overlay').classList.remove('active');
                }
            };

            if (allowButton) {
                allowButton.addEventListener('click', async () => {
                    const permission = await Notification.requestPermission();
                    this.permissionGranted = permission === 'granted';
                    closeModal();
                    
                    if (this.permissionGranted) {
                        showNotification('🔔 Notificaciones permitidas', 'success');
                    }
                });
            }

            if (denyButton) denyButton.addEventListener('click', closeModal);
            if (closeButton) closeButton.addEventListener('click', closeModal);
        }

        sendOfferNotification(title, message) {
            if (this.permissionGranted) {
                new Notification(title, {
                    body: message,
                    icon: 'images/logo-blanco.png'
                });
            }
        }

        sendFlashSaleNotification(product) {
            this.sendOfferNotification(
                '🔥 Oferta Flash Activa',
                `${product.name} - ${product.discount}% OFF - Solo por tiempo limitado!`
            );
        }
    }

    // 4. Sistema de Puntos y Recompensas
    class LoyaltyProgram {
        constructor() {
            this.points = parseInt(localStorage.getItem('elOsoPoints')) || 0;
            this.updatePointsDisplay();
        }

        addPoints(amount, reason) {
            this.points += amount;
            localStorage.setItem('elOsoPoints', this.points.toString());
            
            this.showPointsNotification(amount, reason);
            this.updatePointsDisplay();
            
            // Actualizar Club El Oso
            if (clubElOso) {
                clubElOso.updateDisplay();
            }
        }

        showPointsNotification(amount, reason) {
            const notification = document.createElement('div');
            notification.className = 'points-notification';
            notification.innerHTML = `
                <div class="points-icon">⭐</div>
                <div class="points-content">
                    <strong>+${amount} puntos</strong>
                    <span>${reason}</span>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid var(--primary-gold);
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        updatePointsDisplay() {
            const pointsDisplay = document.getElementById('loyaltyPoints');
            if (pointsDisplay) {
                pointsDisplay.textContent = this.points.toLocaleString();
            }
        }

        redeemPoints(pointsToRedeem) {
            if (pointsToRedeem > this.points) {
                showNotification('No tienes suficientes puntos', 'error');
                return false;
            }

            this.points -= pointsToRedeem;
            localStorage.setItem('elOsoPoints', this.points.toString());
            this.updatePointsDisplay();
            
            showNotification(`Canjeaste ${pointsToRedeem} puntos`, 'success');
            return true;
        }
    }

    // 5. Chatbot de Recomendaciones
    class ProductRecommender {
        constructor() {
            this.currentStep = 0;
            this.answers = {};
            this.questions = [
                {
                    question: "¿Qué tipo de cerveza te gusta?",
                    options: ["Lager", "IPA", "Stout", "Trigo", "No sé"]
                },
                {
                    question: "¿Prefieres sabores suaves o intensos?",
                    options: ["Suaves", "Intensos", "Equilibrados"]
                },
                {
                    question: "¿Algún ingrediente favorito?",
                    options: ["Cítricos", "Frutos rojos", "Chocolate", "Café", "No prefiero"]
                }
            ];
            this.init();
        }

        init() {
            this.setupEventListeners();
        }

        setupEventListeners() {
            const toggle = document.getElementById('chatbotToggle');
            const close = document.getElementById('chatbotClose');
            const container = document.getElementById('chatbotContainer');
            const sendButton = document.getElementById('chatbotSend');
            const input = document.getElementById('chatbotInput');

            if (toggle) {
                toggle.addEventListener('click', () => {
                    container.classList.toggle('active');
                });
            }

            if (close) {
                close.addEventListener('click', () => {
                    container.classList.remove('active');
                });
            }

            if (sendButton) {
                sendButton.addEventListener('click', () => {
                    this.handleUserInput();
                });
            }

            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleUserInput();
                    }
                });
            }
        }

        handleUserInput() {
            const input = document.getElementById('chatbotInput');
            const message = input.value.trim();
            
            if (message) {
                this.addUserMessage(message);
                input.value = '';
                
                setTimeout(() => {
                    this.processAnswer(message);
                }, 500);
            }
        }

        addUserMessage(message) {
            const messagesContainer = document.getElementById('chatbotMessages');
            if (!messagesContainer) return;
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message user-message';
            messageElement.innerHTML = `<p>${message}</p>`;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        addBotMessage(message) {
            const messagesContainer = document.getElementById('chatbotMessages');
            if (!messagesContainer) return;
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message bot-message';
            messageElement.innerHTML = `<p>${message}</p>`;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        processAnswer(answer) {
            this.answers[this.currentStep] = answer;
            this.currentStep++;

            if (this.currentStep < this.questions.length) {
                this.askQuestion();
            } else {
                this.provideRecommendation();
            }
        }

        askQuestion() {
            const question = this.questions[this.currentStep];
            this.addBotMessage(question.question);
            
            const optionsHTML = question.options.map(option => 
                `<button class="quick-option" onclick="chatbot.selectOption('${option}')">${option}</button>`
            ).join('');
            
            this.addBotMessage(`Puedes elegir: ${optionsHTML}`);
        }

        selectOption(option) {
            const input = document.getElementById('chatbotInput');
            input.value = option;
            this.handleUserInput();
        }

        provideRecommendation() {
            let recommendedProducts = [];
            
            if (this.answers[0] === 'IPA') {
                recommendedProducts = products.beers.filter(p => 
                    p.name && (p.name.toLowerCase().includes('ipa') || 
                    p.description.toLowerCase().includes('ipa'))
                );
            } else if (this.answers[0] === 'Stout') {
                recommendedProducts = products.beers.filter(p => 
                    p.name && (p.name.toLowerCase().includes('stout') || 
                    p.description.toLowerCase().includes('stout'))
                );
            } else {
                recommendedProducts = products.beers.slice(0, 3);
            }

            if (recommendedProducts.length > 0) {
                this.addBotMessage("Basándome en tus preferencias, te recomiendo:");
                
                recommendedProducts.forEach(product => {
                    this.addBotMessage(
                        `🍺 ${product.name} - $${product.price.toLocaleString()} - ` +
                        `<button class="product-link" onclick="showProductDetails(${product.id})">Ver detalles</button>`
                    );
                });
            } else {
                this.addBotMessage("Te recomiendo explorar nuestra sección de cervezas artesanales.");
            }

            this.addBotMessage("¿Te gustaría que te recomiende algo más?");
            this.currentStep = 0;
            this.answers = {};
        }
    }

    // 6. Club El Oso - Programa de Fidelidad
    class ClubElOso {
        constructor() {
            this.levels = {
                bronze: { minPoints: 0, benefits: ['5% descuento'] },
                silver: { minPoints: 1000, benefits: ['10% descuento', 'Envío gratis'] },
                gold: { minPoints: 2500, benefits: ['15% descuento', 'Envío gratis', 'Acceso anticipado'] }
            };
            this.init();
        }

        init() {
            this.updateDisplay();
            this.setupEventListeners();
        }

        updateDisplay() {
            const points = loyaltyProgram ? loyaltyProgram.points : 0;
            const level = this.getCurrentLevel(points);
            const progress = this.getLevelProgress(points, level);

            const levelElement = document.getElementById('loyaltyLevel');
            const pointsElement = document.getElementById('loyaltyPoints');
            const progressElement = document.getElementById('loyaltyProgressFill');

            if (levelElement) levelElement.textContent = `Nivel ${this.capitalizeFirstLetter(level)}`;
            if (pointsElement) pointsElement.textContent = points.toLocaleString();
            if (progressElement) progressElement.style.width = `${progress}%`;
        }

        getCurrentLevel(points) {
            if (points >= this.levels.gold.minPoints) return 'gold';
            if (points >= this.levels.silver.minPoints) return 'silver';
            return 'bronze';
        }

        getLevelProgress(points, level) {
            const currentLevel = this.levels[level];
            const nextLevel = this.getNextLevel(level);
            
            if (!nextLevel) return 100;

            const pointsInLevel = points - currentLevel.minPoints;
            const levelRange = nextLevel.minPoints - currentLevel.minPoints;
            
            return Math.min((pointsInLevel / levelRange) * 100, 100);
        }

        getNextLevel(level) {
            const levelKeys = Object.keys(this.levels);
            const currentIndex = levelKeys.indexOf(level);
            return levelKeys[currentIndex + 1] ? this.levels[levelKeys[currentIndex + 1]] : null;
        }

        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        setupEventListeners() {
            const detailsBtn = document.getElementById('loyaltyDetailsBtn');
            if (detailsBtn) {
                detailsBtn.addEventListener('click', () => {
                    this.showLevelDetails();
                });
            }
        }

        // En la clase ClubElOso, reemplaza el método showLevelDetails:
        showLevelDetails() {
            const points = loyaltyProgram ? loyaltyProgram.points : 0;
            const currentLevel = this.getCurrentLevel(points);
            
            let detailsHTML = `
                <div class="level-details">
                    <h3>🥇 Detalles del Club El Oso</h3>
                    <div class="levels-list">
            `;

            Object.entries(this.levels).forEach(([level, data]) => {
                const isCurrent = level === currentLevel;
                const isUnlocked = points >= data.minPoints;
                
                detailsHTML += `
                    <div class="level-item ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="level-header">
                            <span class="level-name">${this.capitalizeFirstLetter(level)}</span>
                            <span class="level-points">${data.minPoints} puntos</span>
                        </div>
                        <div class="level-benefits">
                            ${data.benefits.map(benefit => `<span class="benefit">✓ ${benefit}</span>`).join('')}
                        </div>
                    </div>
                `;
            });

            detailsHTML += `
                    </div>
                    <div class="current-points-info">
                        <p><strong>Tus puntos actuales:</strong> ${points.toLocaleString()}</p>
                        <p class="points-help">Gana puntos realizando compras y actividades en el sitio</p>
                    </div>
                </div>
            `;

            // Crear modal con la misma estructura que los demás
            const modal = document.createElement('div');
            modal.className = 'why-choose-modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <button class="modal-close" onclick="this.closest('.why-choose-modal').remove(); document.getElementById('overlay').classList.remove('active');">
                            <i class="fas fa-times"></i>
                        </button>
                        <h2 class="modal-title">🥇 Club El Oso - Programa de Fidelidad</h2>
                        <p class="modal-subtitle">Acumula puntos y disfruta de beneficios exclusivos</p>
                    </div>
                    <div class="modal-body">
                        ${detailsHTML}
                    </div>
                    <div class="modal-footer">
                        <button class="modal-cta" onclick="this.closest('.why-choose-modal').remove(); document.getElementById('overlay').classList.remove('active');">
                            <i class="fas fa-check"></i>
                            Entendido
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            document.getElementById('overlay').classList.add('active');
        }
    }

    // 7. Fotos de Clientes UGC
    class SocialProof {
        constructor() {
            this.photos = [
                {
                    image: 'images/ugc/photo1.jpg',
                    user: '@rosturmer',
                    caption: 'Acompañamos las tostadas'
                },
                {
                    image: 'images/ugc/photo2.jpg', 
                    user: '@adannmartinez_',
                    caption: 'Una parada técnica'
                },
                {
                    image: 'images/ugc/photo3.jpg',
                    user: '@marcebon395',
                    caption: 'Vas a compartir los trafeos cerveceros'
                },
                {
                    image: 'images/ugc/photo4.jpg',
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

            // Limpiar grid
            grid.innerHTML = '';

            this.photos.forEach(photo => {
                const photoElement = document.createElement('div');
                photoElement.className = 'ugc-item';
                photoElement.innerHTML = `
                    <img src="${photo.image}" alt="${photo.caption}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
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

    // ===== FUNCIONES GLOBALES NUEVAS =====

    // Barra de progreso envío gratis
    function updateShippingProgress() {
        const freeShippingThreshold = 15000;
        const subtotal = calculateSubtotal();
        const remaining = Math.max(0, freeShippingThreshold - subtotal);
        
        const shippingProgress = document.getElementById('shippingProgress');
        const shippingRemaining = document.getElementById('shippingRemaining');
        const shippingProgressFill = document.getElementById('shippingProgressFill');
        
        // Si no existen los elementos, salir
        if (!shippingRemaining || !shippingProgressFill) return;
        
        if (subtotal >= freeShippingThreshold) {
            // Envío gratis alcanzado
            shippingRemaining.textContent = '¡Envío gratis en Quilmes desbloqueado!';
            shippingProgressFill.style.width = '100%';
        } else {
            // Aún no alcanza el envío gratis
            shippingRemaining.textContent = `¡Faltan $${remaining.toLocaleString()} para envío gratis en Quilmes!`;
            
            const progress = (subtotal / freeShippingThreshold) * 100;
            shippingProgressFill.style.width = `${progress}%`;
        }
        
        // Si el carrito está vacío, resetear completamente
        if (cart.length === 0) {
            shippingRemaining.textContent = `¡Faltan $${freeShippingThreshold.toLocaleString()} para envío gratis en Quilmes!`;
            shippingProgressFill.style.width = '0%';
        }
    }

    function calculateSubtotal() {
        return cart.reduce((total, item) => {
            const price = item.discountPrice || item.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    }

    // Contador de personas viendo producto
    function updateProductViewers() {
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

    // Modo compra rápida
    function setupQuickBuy() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-buy-btn')) {
                const productId = parseInt(e.target.dataset.id);
                const product = findProductById(productId);
                
                if (product) {
                    addToCart(productId);
                    
                    showNotification(`✅ ${product.name} agregado`, 'success');
                    
                    setTimeout(() => {
                        checkoutViaWhatsAppTemu();
                    }, 1000);
                }
            }
        });
    }

    // Initialize everything
    async function init() {
        await loadProducts();
        setupEventListeners();
        setupWhatsAppMenu();
        setupMobileEventListeners();
        startCountdown();
        loadCart();
        updateCartUI();
        startShippingCountdown();
        
        // Inicializar nuevas funcionalidades
        //referralSystem = new ReferralSystem();
        discountWheel = new DiscountWheel();
        //pushNotifications = new PushNotifications();
        loyaltyProgram = new LoyaltyProgram();
        //chatbot = new ProductRecommender();
        clubElOso = new ClubElOso();
        socialProof = new SocialProof();
        setupQuickBuy();
        
        console.log('🛒 El Oso - Ecommerce con funcionalidades Temu/Shein inicializado');
    }

    // WhatsApp Menu Functions
    function setupWhatsAppMenu() {
        const whatsappMenuToggle = document.getElementById('whatsappMenuToggle');
        const whatsappMenu = document.getElementById('whatsappMenu');
        const whatsappClose = document.getElementById('whatsappClose');
        const overlay = document.getElementById('overlay');

        if (whatsappMenuToggle) {
            whatsappMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                whatsappMenu.classList.toggle('active');
            });
        }

        if (whatsappClose) {
            whatsappClose.addEventListener('click', () => {
                whatsappMenu.classList.remove('active');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (whatsappMenu && !whatsappMenu.contains(e.target) && !whatsappMenuToggle.contains(e.target)) {
                whatsappMenu.classList.remove('active');
            }
        });

        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && whatsappMenu && whatsappMenu.classList.contains('active')) {
                whatsappMenu.classList.remove('active');
            }
        });
    }

    // Mobile Event Listeners
    function setupMobileEventListeners() {
        // Mobile back button
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', closeProductDetailsModal);
        }
        
        // Mobile wishlist button
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', toggleWishlist);
        }
    }

    // Share product functionality
    function shareProduct() {
        const productName = document.getElementById('detailsProductNameMobile')?.textContent || 'Producto de El Oso';
        const productPrice = document.getElementById('detailsCurrentPriceMobile')?.textContent || '';
        
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: `Mira este producto de El Oso: ${productName} - ${productPrice}`,
                url: window.location.href,
            })
            .then(() => showNotification('✅ Producto compartido', 'success'))
            .catch((error) => console.log('Error sharing:', error));
        }
    }

    // Toggle wishlist functionality
    function toggleWishlist() {
        const wishlistBtn = document.querySelector('.wishlist-btn');
        const isInWishlist = wishlistBtn.classList.contains('active');
        
        if (isInWishlist) {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            showNotification('💔 Eliminado de favoritos', 'info');
        } else {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            showNotification('❤️ Agregado a favoritos', 'success');
        }
    }

    // Load products from Google Sheets with CORS proxy
    async function loadProducts() {
        console.log('📥 Cargando productos desde Google Sheets...');
        
        // Intentar con diferentes proxies
        for (const proxy of PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(BASE_SHEET_URL);
                console.log(`🔧 Probando proxy: ${proxy}`);
                
                const response = await fetchWithTimeout(proxyUrl, 8000);
                
                if (response.ok) {
                    const csvText = await response.text();
                    console.log('✅ CSV obtenido correctamente');
                    const parsedData = parseCSV(csvText);
                    organizeProducts(parsedData);
                    renderAllProducts();
                    return; // Éxito, salir del bucle
                }
            } catch (error) {
                console.warn(`❌ Proxy falló: ${error.message}`);
                continue; // Intentar con el siguiente proxy
            }
        }
        
        // Si todos los proxies fallan, usar datos de respaldo
        console.error('❌ Todos los proxies fallaron, usando datos locales');
        loadFallbackProducts();
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

    // Parse CSV data - UPDATED to handle all properties
    function parseCSV(csvText) {
        console.log('📊 Parseando CSV...');
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            throw new Error('CSV vacío');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        console.log('📋 Headers encontrados:', headers);
        
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            try {
                const values = parseCSVLine(lines[i]);
                const product = {};
                
                headers.forEach((header, index) => {
                    if (values[index] !== undefined && header) {
                        // Limpiar y procesar el valor
                        let value = values[index].trim();
                        
                        // Convertir tipos de datos
                        if (header === 'price' || header === 'oldprice' || header === 'discountprice' || header === 'abv' || header === 'ibu') {
                            value = parseFloat(value) || 0;
                        } else if (header === 'stock' || header === 'sold' || header === 'salescount' || header === 'id') {
                            value = parseInt(value) || 0;
                        } else if (header === 'rating') {
                            value = parseFloat(value) || 4.5;
                        } else if (header === 'active' || header === 'stocklimit') {
                            value = value === 'TRUE' || value === 'true' || value === '1';
                        }
                        
                        // Mapear nombres de propiedades si es necesario
                        const propertyMap = {
                            'oldprice': 'oldPrice',
                            'discountprice': 'discountPrice',
                            'salescount': 'salesCount',
                            'heatlevel': 'heatLevel',
                            'images': 'images',
                            'sizes': 'sizes',
                            'varieties': 'varieties',
                            'style': 'style'
                        };
                        
                        const propertyName = propertyMap[header] || header;
                        
                        // Procesar arrays (imágenes, tamaños, variedades)
                        if ((header === 'images' || header === 'sizes' || header === 'varieties') && value) {
                            value = value.split(';').map(item => item.trim());
                        }
                        
                        product[propertyName] = value;
                    }
                });
                
                // Validar producto mínimo
                if (product.id && product.name && product.category) {
                    products.push(product);
                }
                
            } catch (error) {
                console.warn(`❌ Error procesando línea ${i}:`, error);
            }
        }
        
        console.log(`✅ ${products.length} productos parseados correctamente`);
        return products;
    }

    // Handle CSV lines with commas in values
    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let char of line) {
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
        return values.map(v => v.replace(/^"|"$/g, ''));
    }

    // Organize products into categories
    function organizeProducts(productsArray) {
        // Clear existing products
        for (const category in products) {
            products[category] = [];
        }

        productsArray.forEach(product => {
            if (product.active === 'false') return;
            
            const category = (product.category || '').toLowerCase();
            
            // Add to flash sales if has discount or special badge
            if (product.badge && product.badge.toLowerCase().includes('flash') || product.oldPrice) {
                products.flash.push(product);
            }
            
            // Add to most sold if has high sales count
            if (product.sold && parseInt(product.sold) > 20) {
                products.mostSold.push(product);
            }
            
            // Add to respective category
            switch(category) {
                case 'beers':
                    products.beers.push(product);
                    break;
                case 'sauces':
                    products.sauces.push(product);
                    break;
                case 'preserves':
                    products.preserves.push(product);
                    break;
                case 'combos':
                    products.combos.push(product);
                    break;
                default:
                    // If no category, add to beers as default
                    products.beers.push(product);
            }
        });

        // If flash is empty, add some products with discounts
        if (products.flash.length === 0) {
            products.beers.slice(0, 4).forEach(product => {
                products.flash.push({
                    ...product,
                    oldPrice: product.price * 1.3,
                    badge: 'flash'
                });
            });
        }

        // If mostSold is empty, add top products
        if (products.mostSold.length === 0) {
            products.mostSold = products.beers.slice(0, 6).map(p => ({
                ...p,
                sold: Math.floor(Math.random() * 100) + 50
            }));
        }
        
        console.log('📊 Products organized:', products);
    }

    // Fallback products if Sheets fails
    function loadFallbackProducts() {
        products = {
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
                },
                {
                    id: 2,
                    name: "Salsa Picante Habanero",
                    description: "Salsa artesanal con habanero y especias naturales",
                    price: 1200,
                    oldPrice: 1500,
                    image: "images/products/habanero.jpg",
                    badge: "flash",
                    stock: 8,
                    sold: 32,
                    rating: 4.9,
                    size: "250ml",
                    heatLevel: "hot",
                    ingredients: "Habanero, vinagre, ajo, especias"
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
            beers: [],
            sauces: [],
            preserves: [],
            combos: []
        };
        
        renderAllProducts();
    }

    // Render all product sections
    function renderAllProducts() {
        renderProductsSection('flash-products', products.flash, true);
        renderProductsSection('most-sold-products', products.mostSold);
        renderProductsSection('beer-products', products.beers);
        renderProductsSection('sauce-products', products.sauces);
        renderProductsSection('preserve-products', products.preserves);
        renderProductsSection('combo-products', products.combos);

        updateTemuRecommendations();
        updateProductViewers();
    }

    // Render products in a specific section
    function renderProductsSection(containerId, productList, isFlash = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!productList || productList.length === 0) {
            container.innerHTML = `
                <div class="loading-products">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productList.map(product => createProductCard(product, isFlash)).join('');
        
        // Add event listeners to new product cards
        attachProductEventListeners(container);
    }

    // Create product card HTML Temu Style
    function createProductCard(product, isFlash = false) {
        const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
        const stockPercentage = product.stock ? Math.min((product.stock / 50) * 100, 100) : 100;
        const isLowStock = product.stock && product.stock < 10;
        const isOutOfStock = product.stock === 0;
        const qualifiesForFreeShipping = product.price >= 15000;
        
        // Determine badge
        let badgeType = product.badge || '';
        if (!badgeType && discount > 20) badgeType = 'flash';
        if (!badgeType && product.sold > 100) badgeType = 'popular';
        
        // Build badges HTML
        let badgesHTML = '';
        
        // Badge principal
        if (badgeType) {
            badgesHTML += `<div class="product-badge badge-${badgeType}">${getBadgeText(badgeType)}</div>`;
        }
        
        // Badge de envío gratis
        if (qualifiesForFreeShipping) {
            badgesHTML += `<div class="product-badge badge-shipping">🚚 ENVÍO GRATIS</div>`;
        }
        
        // Badge de stock bajo
        if (isLowStock && !isOutOfStock) {
            badgesHTML += `<div class="product-badge badge-stock">⚠️ ÚLTIMAS</div>`;
        }
        
        // Badge de agotado
        if (isOutOfStock) {
            badgesHTML += `<div class="product-badge badge-stock">🔴 AGOTADO</div>`;
        }
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category || 'beer'}">
                <div class="product-badges">
                    ${badgesHTML}
                </div>
                
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImageError(this)">` : 
                        getCategoryIcon(product.category || 'beer')
                    }
                    ${product.stock && !isOutOfStock ? `
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${stockPercentage}%"></div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'Producto de calidad premium'}</p>
                    
                    <div class="product-pricing">
                        <span class="product-price">$${product.price.toLocaleString()}</span>
                        ${product.oldPrice ? `
                            <span class="product-old-price">$${product.oldPrice.toLocaleString()}</span>
                            <span class="product-discount">-${discount}%</span>
                        ` : ''}
                    </div>
                    
                    ${qualifiesForFreeShipping ? `
                        <div class="free-shipping-info">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Envío gratis en Quilmes Jueves y Viernes</span>
                        </div>
                    ` : ''}
                    
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
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${isOutOfStock ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                        </button>
                        <button class="quick-buy-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-bolt"></i>
                            COMPRAR RÁPIDO
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Get badge text
    function getBadgeText(badge) {
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

    // Get category icon
    function getCategoryIcon(category) {
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

    // Attach event listeners to products
    function attachProductEventListeners(container) {
        // Add to cart buttons
        container.querySelectorAll('.add-to-cart-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                addToCart(productId, btn);
            });
        });

        // Quick buy buttons
        container.querySelectorAll('.quick-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                quickBuyProduct(productId);
            });
        });

        // Product card clicks
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = parseInt(card.dataset.id);
                    showProductDetails(productId);
                }
            });
        });
    }

    // Show product details for mobile
    function showProductDetails(productId) {
        const product = findProductById(productId);
        if (!product) return;

        const modal = document.getElementById('productDetailsModal');
        const overlay = document.getElementById('overlay');
        
        // Setup all product details for mobile
        setupProductImagesMobile(product);
        setupProductInfoMobile(product);
        setupSelectionOptionsMobile(product);
        setupQuantityAndStockMobile(product);
        setupActionButtonsMobile(product);
        
        // Open modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // En setupProductImagesMobile, asegurar que se cargue la imagen principal
    function setupProductImagesMobile(product) {
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
                img.onerror = handleImageError;
                fixedImageContainer.appendChild(img);
            } else {
                // Si no hay imagen, mostrar ícono de categoría
                const category = product.category || 'beer';
                fixedImageContainer.innerHTML = getCategoryIcon(category);
            }
        }
        
        // Setup badges
        if (badgesContainer) {
            setupProductBadges(product, badgesContainer);
        }
    }

    // Setup badges igual que en listado principal - CORREGIDA
    function setupProductBadges(product, container) {
        let badgeType = product.badge || '';
        
        // Determinar badge type igual que en createProductCard
        if (!badgeType && product.oldPrice && product.oldPrice > product.price) {
            badgeType = 'flash';
        }
        if (!badgeType && (product.sold || product.salesCount) > 50) {
            badgeType = 'popular';
        }
        if (!badgeType && product.stock && product.stock < 10) {
            badgeType = 'stock';
        }
        
        // Crear badges
        if (badgeType) {
            const badge = document.createElement('div');
            badge.className = `product-badge badge-${badgeType}`;
            badge.textContent = getBadgeText(badgeType);
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
        if (product.price >= 15000) {
            const shippingBadge = document.createElement('div');
            shippingBadge.className = 'product-badge badge-shipping';
            shippingBadge.textContent = '🚚 ENVÍO GRATIS';
            container.appendChild(shippingBadge);
        }
    }

    // Setup product info for mobile
    function setupProductInfoMobile(product) {
        // Product name
        const productNameElement = document.getElementById('detailsProductNameMobile');
        if (productNameElement) {
            productNameElement.textContent = product.name;
        }
        
        // Rating and stars
        setupProductRatingMobile(product);
        
        // Pricing - Mismo estilo que listado principal
        setupProductPricingMobile(product);
        
        // Description
        const descriptionElement = document.getElementById('detailsDescriptionMobile');
        if (descriptionElement) {
            descriptionElement.textContent = product.description || 'Producto de calidad premium artesanal.';
        }
        
        // Specifications
        setupProductSpecsMobile(product);
    }

    // Setup product rating for mobile
    function setupProductRatingMobile(product) {
        const rating = product.rating || 4.5;
        const soldCount = product.salesCount || product.sold || Math.floor(Math.random() * 100) + 20;
        
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

    // Setup product pricing for mobile - Mismo estilo que listado principal
    function setupProductPricingMobile(product) {
        const currentPriceElement = document.getElementById('detailsCurrentPriceMobile');
        const oldPriceElement = document.getElementById('detailsOldPriceMobile');
        const discountElement = document.getElementById('detailsDiscountMobile');
        
        if (!currentPriceElement) return;
        
        // Use discountPrice if available, otherwise use price
        const displayPrice = product.discountPrice || product.price;
        currentPriceElement.textContent = `$${displayPrice.toLocaleString()}`;
        
        if (product.oldPrice && product.oldPrice > displayPrice) {
            const discount = Math.round(((product.oldPrice - displayPrice) / product.oldPrice) * 100);
            
            if (oldPriceElement) {
                oldPriceElement.textContent = `$${product.oldPrice.toLocaleString()}`;
                oldPriceElement.style.display = 'inline';
            }
            if (discountElement) {
                discountElement.textContent = `-${discount}%`;
                discountElement.style.display = 'inline';
            }
        } else {
            if (oldPriceElement) oldPriceElement.style.display = 'none';
            if (discountElement) discountElement.style.display = 'none';
        }
    }

    // Setup product specifications for mobile
    function setupProductSpecsMobile(product) {
        const specsContainer = document.getElementById('productSpecsMobile');
        if (!specsContainer) return;
        
        specsContainer.innerHTML = '';
        
        const specs = generateProductSpecsMobile(product);
        specsContainer.innerHTML = specs;
    }

    // Generate product specifications for mobile
    function generateProductSpecsMobile(product) {
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
                specs.push({ label: 'Nivel de Picante', value: getHeatLevelDisplay(product.heatLevel) });
            }
            
            if (product.ingredients) {
                specs.push({ label: 'Ingredientes', value: product.ingredients });
            }
        }
        
        // General specifications
        if (product.ingredients && !category.includes('sauce') && !category.includes('salsa')) {
            specs.push({ label: 'Ingredientes', value: product.ingredients });
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

    // Setup selection options for mobile
    function setupSelectionOptionsMobile(product) {
        // Size options
        const sizeSection = document.getElementById('sizeOptionSectionMobile');
        const sizeOptions = document.getElementById('sizeOptionsMobile');
        
        // Color/variety options
        const colorSection = document.getElementById('colorOptionSectionMobile');
        const colorOptions = document.getElementById('colorOptionsMobile');
        
        // Clear existing options
        if (sizeOptions) sizeOptions.innerHTML = '';
        if (colorOptions) colorOptions.innerHTML = '';
        
        // Setup size options if available
        if (product.sizes && product.sizes.length > 0 && sizeSection && sizeOptions) {
            sizeSection.style.display = 'flex';
            product.sizes.forEach(size => {
                const option = createOptionElement(size, sizeOptions, 'size');
                sizeOptions.appendChild(option);
            });
        } else if (sizeSection) {
            sizeSection.style.display = 'none';
        }
        
        // Setup color/variety options if available
        if (product.varieties && product.varieties.length > 0 && colorSection && colorOptions) {
            colorSection.style.display = 'flex';
            product.varieties.forEach(variety => {
                const option = createOptionElement(variety, colorOptions, 'variety');
                colorOptions.appendChild(option);
            });
        } else if (colorSection) {
            colorSection.style.display = 'none';
        }
    }

    // Create option element for mobile
    function createOptionElement(value, container, type) {
        const option = document.createElement('div');
        option.className = 'option-value-mobile';
        option.textContent = value;
        option.dataset.value = value;
        option.dataset.type = type;
        
        option.addEventListener('click', () => {
            selectOptionMobile(option, container);
        });
        
        // Select first option by default
        if (container.children.length === 0) {
            option.classList.add('selected');
        }
        
        return option;
    }

    // Select option for mobile
    function selectOptionMobile(selectedOption, container) {
        // Deselect all options in container
        container.querySelectorAll('.option-value-mobile').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select clicked option
        selectedOption.classList.add('selected');
        
        // You can add logic here to update product based on selection
        // For example, update price or image based on selected variant
    }

    // Setup quantity and stock for mobile
    function setupQuantityAndStockMobile(product) {
        const quantityDisplay = document.querySelector('.quantity-display-mobile');
        const decreaseBtn = document.querySelector('.quantity-btn-mobile.decrease');
        const increaseBtn = document.querySelector('.quantity-btn-mobile.increase');
        const stockInfo = document.getElementById('detailsStockInfoMobile');
        
        if (!quantityDisplay || !decreaseBtn || !increaseBtn || !stockInfo) return;
        
        let quantity = 1;
        quantityDisplay.textContent = quantity;
        
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
            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
                decreaseBtn.disabled = quantity <= 1;
            }
        };
        
        increaseBtn.onclick = () => {
            if (!product.stock || quantity < product.stock) {
                quantity++;
                quantityDisplay.textContent = quantity;
                decreaseBtn.disabled = false;
            } else {
                showNotification('❌ No hay más stock disponible', 'error');
            }
        };
        
        // Initialize decrease button state
        decreaseBtn.disabled = quantity <= 1;
    }

    // En setupActionButtonsMobile, eliminar la parte del botón "Comprar ahora"
    function setupActionButtonsMobile(product) {
        const addToCartBtn = document.getElementById('detailsAddToCartFixed');
        const quantityDisplay = document.querySelector('.quantity-display-mobile');
        
        if (!addToCartBtn || !quantityDisplay) return;
        
        // Disable button if no stock
        if (product.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-times"></i><span>Sin Stock</span>';
            return;
        }
        
        addToCartBtn.onclick = () => {
            const quantity = parseInt(quantityDisplay.textContent);
            for (let i = 0; i < quantity; i++) {
                addToCart(product.id);
            }
            closeProductDetailsModal();
            showNotification('✅ Producto agregado al carrito', 'success');
        };
    }

    // Close product details modal for mobile
    function closeProductDetailsModal() {
        const modal = document.getElementById('productDetailsModal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Helper function to get heat level display
    function getHeatLevelDisplay(heatLevel) {
        const levels = {
            'mild': '🌶️ Suave',
            'medium': '🌶️🌶️ Medio',
            'hot': '🌶️🌶️🌶️ Picante',
            'extreme': '🌶️🌶️🌶️🌶️ Extremo'
        };
        
        return levels[heatLevel.toLowerCase()] || heatLevel;
    }

    // Add to cart with Temu style animation
    function addToCart(productId, button = null) {
        const product = findProductById(productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        
        // Check stock
        if (existingItem && product.stock && existingItem.quantity >= product.stock) {
            showNotification('❌ No hay más stock disponible', 'error');
            return;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        // Add animation to button
        if (button) {
            button.classList.add('added');
            setTimeout(() => button.classList.remove('added'), 500);
        }

        updateCartUI();
        saveCart();
        showNotification('✅ Producto agregado al carrito', 'success');
        
        // Agregar puntos por agregar al carrito
        if (loyaltyProgram) {
            loyaltyProgram.addPoints(5, 'Por agregar al carrito');
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        saveCart();
        showNotification('🗑️ Producto eliminado', 'info');
    }

    function updateCartQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        if (item.stock && newQuantity > item.stock) {
            showNotification('❌ No hay suficiente stock', 'error');
            return;
        }

        item.quantity = newQuantity;
        updateCartUI();
        saveCart();
    }

    // TEMU/SHEIN CART FUNCTIONS
    function updateCartUI() {
        updateTemuCartUI();
        updateShippingProgress();
    }

    function updateTemuCartUI() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartItemsCount = document.getElementById('cartItemsCount');
        const checkoutItemsCount = document.getElementById('checkoutItemsCount');
        const summaryTotal = document.getElementById('summaryTotal');
        const savingsAmount = document.getElementById('savingsAmount');
        const cartCount = document.querySelector('.cart-count');

        // Update cart items list
        if (cartItemsList) {
            if (cart.length === 0) {
                cartItemsList.innerHTML = `
                    <div class="empty-cart-temu">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Tu carrito está vacío</p>
                        <span>Agrega productos increíbles</span>
                    </div>
                `;
            } else {
                cartItemsList.innerHTML = cart.map(item => {
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
                                    `<img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">` : 
                                    getCategoryIcon(item.category || 'beer')
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
                                        <button class="quantity-btn-temu" onclick="updateCartQuantity(${item.id}, -1)">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <span class="quantity-display-temu">${item.quantity}</span>
                                        <button class="quantity-btn-temu" onclick="updateCartQuantity(${item.id}, 1)" ${item.stock && item.quantity >= item.stock ? 'disabled' : ''}>
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <button class="remove-item-temu" onclick="removeFromCart(${item.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Update counts
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemsCount) cartItemsCount.textContent = totalItems;
        if (checkoutItemsCount) checkoutItemsCount.textContent = totalItems;
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => cartCount.style.transform = 'scale(1)', 300);
        }

        // Update summary and savings
        let subtotal = 0;
        let totalSavings = 0;

        cart.forEach(item => {
            const displayPrice = item.discountPrice || item.price;
            const originalPrice = item.oldPrice || item.price;
            
            subtotal += displayPrice * item.quantity;
            
            if (originalPrice > displayPrice) {
                totalSavings += (originalPrice - displayPrice) * item.quantity;
            }
        });

        if (summaryTotal) summaryTotal.textContent = `$${subtotal.toLocaleString()}`;
        if (savingsAmount) savingsAmount.textContent = totalSavings.toLocaleString();

        // Actualizar la barra de progreso
        updateShippingProgress();
        
        // Update recommendations
        updateTemuRecommendations();
    }

    function updateTemuRecommendations() {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        // Get products not in cart for recommendations
        const allProducts = [...products.beers, ...products.sauces, ...products.preserves, ...products.combos];
        const cartProductIds = cart.map(item => item.id);
        const recommendations = allProducts
            .filter(product => !cartProductIds.includes(product.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        if (recommendations.length === 0) {
            recommendationsGrid.innerHTML = '<div class="no-recommendations">No hay recomendaciones disponibles</div>';
            return;
        }

        recommendationsGrid.innerHTML = recommendations.map(product => {
            const displayPrice = product.discountPrice || product.price;
            const originalPrice = product.oldPrice || product.price;
            const discount = originalPrice > displayPrice ? 
                Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

            return `
                <div class="recommendation-item-temu" data-category="${product.category || 'beer'}">
                    <div class="recommendation-image-temu">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" onerror="handleImageError(this)">` : 
                            getCategoryIcon(product.category || 'beer')
                        }
                    </div>
                    <div class="recommendation-name-temu">${product.name}</div>
                    <div class="recommendation-price-temu">$${displayPrice.toLocaleString()}</div>
                    <button class="recommendation-add-btn-temu" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                        Agregar
                    </button>
                </div>
            `;
        }).join('');
    }

    function checkoutViaWhatsAppTemu() {
        if (cart.length === 0) {
            showNotification('❌ Tu carrito está vacío', 'error');
            return;
        }

        let message = `¡Hola! Quiero realizar el siguiente pedido:\n\n`;
        
        let subtotal = 0;
        let totalSavings = 0;

        cart.forEach(item => {
            const displayPrice = item.discountPrice || item.price;
            const originalPrice = item.oldPrice || item.price;
            
            subtotal += displayPrice * item.quantity;
            
            if (originalPrice > displayPrice) {
                totalSavings += (originalPrice - displayPrice) * item.quantity;
            }

            message += `• ${item.name} x${item.quantity} - $${(displayPrice * item.quantity).toLocaleString()}\n`;
        });

        message += `\n*Resumen del pedido:*`;
        message += `\nSubtotal: $${subtotal.toLocaleString()}`;
        
        if (totalSavings > 0) {
            message += `\nAhorro: $${totalSavings.toLocaleString()}`;
        }
        
        message += `\n*Total: $${subtotal.toLocaleString()}*\n\n`;
        message += `Por favor, necesito coordinar la entrega. ¡Gracias!`;

        openWhatsApp(message);
        
        // Agregar puntos por compra
        if (loyaltyProgram) {
            const pointsEarned = Math.floor(subtotal / 100); // 1 punto cada $100
            loyaltyProgram.addPoints(pointsEarned, 'Por tu compra');
            
            // Marcar primera compra para referidos
            localStorage.setItem('elOsoFirstPurchase', 'true');
        }
        
        // Clear cart after successful checkout
        setTimeout(() => {
            clearCart();
            closeCartSidebar();
        }, 1000);
    }

    function clearCart() {
        cart = [];
        updateCartUI();
        saveCart();
        showNotification('🛒 Carrito vaciado', 'info');
    }

    function saveCart() {
        localStorage.setItem('elOsoCart', JSON.stringify(cart));
    }

    function loadCart() {
        const saved = localStorage.getItem('elOsoCart');
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading cart:', e);
                cart = [];
            }
        }
    }

    // WhatsApp integration
    function quickBuyProduct(productId) {
        const product = findProductById(productId);
        if (!product) return;

        const message = `¡Hola! Quiero comprar *${product.name}* por $${product.price.toLocaleString()}. Por favor, necesito coordinar la entrega. ¡Gracias!`;
        openWhatsApp(message);
    }

    function openWhatsApp(message) {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/5491123495971?text=${encodedMessage}`;
        window.open(url, '_blank');
    }

    // Find product by ID
    function findProductById(id) {
        for (const category in products) {
            const product = products[category].find(p => p.id === id);
            if (product) return product;
        }
        return null;
    }

    // Countdown timer
    function startCountdown() {
        const countdownElement = document.getElementById('countdown');
        const miniCountdown = document.getElementById('miniCountdown');
        
        if (!countdownElement) return;

        let timeLeft = 2 * 60 * 60 + 45 * 60 + 30; // 2 hours, 45 minutes, 30 seconds

        function updateCountdown() {
            if (timeLeft <= 0) {
                timeLeft = 24 * 60 * 60; // Reset to 24 hours
            }

            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            // Update main countdown
            if (countdownElement) {
                const [hoursEl, minutesEl, secondsEl] = countdownElement.querySelectorAll('.countdown-number');
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
            }

            // Update mini countdown
            if (miniCountdown) {
                miniCountdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            timeLeft--;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Shipping Countdown Timer - CORREGIDA
    function startShippingCountdown() {
        const countdownElement = document.getElementById('shippingCountdown');
        if (!countdownElement) return;

        function updateShippingCountdown() {
            const now = new Date();
            const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 4 = Jueves, 5 = Viernes, 6 = Sábado
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            let nextShippingDay;
            let daysUntilNextShipping;
            let targetDate;
            
            // Determinar el próximo día de envío gratis
            if (currentDay === 4 || currentDay === 5) { // Jueves o Viernes
                if (currentHour < 18) {
                    // Si es jueves o viernes antes de las 18:00, el envío es hoy
                    nextShippingDay = currentDay;
                    targetDate = new Date(now);
                    targetDate.setHours(18, 0, 0, 0);
                } else {
                    // Si es jueves o viernes después de las 18:00, el próximo es el próximo jueves
                    nextShippingDay = 4; // Jueves
                    daysUntilNextShipping = (4 - currentDay + 7) % 7;
                    if (daysUntilNextShipping === 0) daysUntilNextShipping = 7;
                    targetDate = new Date(now);
                    targetDate.setDate(now.getDate() + daysUntilNextShipping);
                    targetDate.setHours(18, 0, 0, 0);
                }
            } else {
                // Si no es jueves ni viernes
                if (currentDay < 4) { // Domingo (0) a Miércoles (3)
                    nextShippingDay = 4; // Próximo jueves
                    daysUntilNextShipping = 4 - currentDay;
                } else { // Sábado (6)
                    nextShippingDay = 4; // Próximo jueves
                    daysUntilNextShipping = 4 + (7 - currentDay); // 4 + 1 = 5 días
                }
                targetDate = new Date(now);
                targetDate.setDate(now.getDate() + daysUntilNextShipping);
                targetDate.setHours(18, 0, 0, 0);
            }
            
            // Calcular diferencia de tiempo
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
            
            // Formatear el mensaje
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
        }

        updateShippingCountdown();
        setInterval(updateShippingCountdown, 60000); // Actualizar cada minuto
    }

    // Notifications Temu Style
    function showNotification(message, type = 'info') {
        // Remove existing notification
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

        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'var(--success-green)';
        } else if (type === 'error') {
            notification.style.background = 'var(--temu-red)';
        } else if (type === 'info') {
            notification.style.background = 'var(--primary-gold)';
            notification.style.color = 'var(--primary-black)';
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Cart sidebar functions
    function openCartSidebar() {
        const cartPage = document.getElementById('cartPage');
        const overlay = document.getElementById('overlay');
        
        cartPage.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateTemuCartUI();
    }

    function closeCartSidebar() {
        const cartPage = document.getElementById('cartPage');
        const overlay = document.getElementById('overlay');
        
        cartPage.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Why Choose Us Modal Functions
    function openWhyChooseModal() {
        const modal = document.getElementById('whyChooseModal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeWhyChooseModal() {
        const modal = document.getElementById('whyChooseModal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('overlay');
        
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Funciones para controlar la ruleta modal
    function openRuletaModal() {
        const modal = document.getElementById('ruletaModal');
        const overlay = document.getElementById('overlay');
        
        if (modal) {
            modal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeRuletaModal() {
        const modal = document.getElementById('ruletaModal');
        const overlay = document.getElementById('overlay');
        
        if (modal) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Event listeners setup
    function setupEventListeners() {
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
            });
        }

        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Search toggle
        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchBar.classList.add('active');
                setTimeout(() => searchInput.focus(), 300);
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchBar.classList.remove('active');
            });
        }

        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const cartPage = document.getElementById('cartPage');
        const backButtonCart = document.getElementById('backButtonCart');

        if (cartToggle) {
            cartToggle.addEventListener('click', openCartSidebar);
        }

        if (backButtonCart) {
            backButtonCart.addEventListener('click', closeCartSidebar);
        }

        // Why Choose Us Modal
        const whyChooseBtn = document.getElementById('whyChooseBtn');
        const modalClose = document.getElementById('modalClose');
        const whyChooseModal = document.getElementById('whyChooseModal');

        if (whyChooseBtn) {
            whyChooseBtn.addEventListener('click', openWhyChooseModal);
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeWhyChooseModal);
        }

        // Product Details Modal
        const closeProductDetails = document.getElementById('closeProductDetails');
        if (closeProductDetails) {
            closeProductDetails.addEventListener('click', closeProductDetailsModal);
        }

        // Mobile menu item for Why Choose Us
        const whyChooseBtnMobile = document.querySelector('.why-choose-btn-mobile');
        if (whyChooseBtnMobile) {
            whyChooseBtnMobile.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
                setTimeout(openWhyChooseModal, 300);
            });
        }

        // Checkout button TEMU
        const checkoutBtnTemu = document.getElementById('checkoutBtnTemu');
        if (checkoutBtnTemu) {
            checkoutBtnTemu.addEventListener('click', checkoutViaWhatsAppTemu);
        }

        // Login button TEMU
        const loginBtnTemu = document.querySelector('.login-btn-temu');
        if (loginBtnTemu) {
            loginBtnTemu.addEventListener('click', () => {
                showNotification('🔐 Funcionalidad de login en desarrollo', 'info');
            });
        }

        // Ruleta modal events
        const closeRuletaModalBtn = document.getElementById('closeRuletaModal');
        if (closeRuletaModalBtn) {
            closeRuletaModalBtn.addEventListener('click', closeRuletaModal);
        }

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                cartPage.classList.remove('active');
                searchBar.classList.remove('active');
                whyChooseModal.classList.remove('active');
                closeProductDetailsModal();
                closeRuletaModal();
                
                // Close WhatsApp menu
                const whatsappMenu = document.getElementById('whatsappMenu');
                if (whatsappMenu) {
                    whatsappMenu.classList.remove('active');
                }
                
                // Close referral modal
                const referralModal = document.getElementById('referralModal');
                if (referralModal) {
                    referralModal.classList.remove('active');
                }
                
                // Close push permission modal
                const pushPermissionModal = document.getElementById('pushPermissionModal');
                if (pushPermissionModal) {
                    pushPermissionModal.classList.remove('active');
                }
                
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value.toLowerCase();
                filterProducts(currentSearchTerm);
            });
        }

        // Category navigation
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Update active category
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCartSidebar();
                mobileMenu.classList.remove('active');
                searchBar.classList.remove('active');
                whyChooseModal.classList.remove('active');
                closeProductDetailsModal();
                
                // Close WhatsApp menu
                const whatsappMenu = document.getElementById('whatsappMenu');
                if (whatsappMenu) {
                    whatsappMenu.classList.remove('active');
                }
                
                // Close referral modal
                const referralModal = document.getElementById('referralModal');
                if (referralModal) {
                    referralModal.classList.remove('active');
                }
                
                // Close push permission modal
                const pushPermissionModal = document.getElementById('pushPermissionModal');
                if (pushPermissionModal) {
                    pushPermissionModal.classList.remove('active');
                }
                
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Filter products by search term
    function filterProducts(searchTerm) {
        if (!searchTerm) {
            renderAllProducts();
            return;
        }

        const filteredProducts = {
            flash: products.flash.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            ),
            mostSold: products.mostSold.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            ),
            beers: products.beers.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            ),
            sauces: products.sauces.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            ),
            preserves: products.preserves.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            ),
            combos: products.combos.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            )
        };

        renderProductsSection('flash-products', filteredProducts.flash, true);
        renderProductsSection('most-sold-products', filteredProducts.mostSold);
        renderProductsSection('beer-products', filteredProducts.beers);
        renderProductsSection('sauce-products', filteredProducts.sauces);
        renderProductsSection('preserve-products', filteredProducts.preserves);
        renderProductsSection('combo-products', filteredProducts.combos);
    }

    // Utility functions for global access
    window.updateCartQuantity = updateCartQuantity;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.addToCart = addToCart;
    window.handleImageError = handleImageError;
    window.handleProductImageError = handleProductImageError;
    window.scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            // Update active category
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    };
    window.closeCartSidebar = closeCartSidebar;
    window.openCartSidebar = openCartSidebar;
    window.showProductDetails = showProductDetails;
    window.closeProductDetailsModal = closeProductDetailsModal;
    window.openWhyChooseModal = openWhyChooseModal;
    window.closeWhyChooseModal = closeWhyChooseModal;
    window.quickBuyProduct = quickBuyProduct;
    window.openWhatsApp = openWhatsApp;
    window.openWhatsAppMenu = function() {
        const whatsappMenu = document.getElementById('whatsappMenu');
        if (whatsappMenu) {
            whatsappMenu.classList.add('active');
        }
    };
    window.closeWhatsAppMenu = function() {
        const whatsappMenu = document.getElementById('whatsappMenu');
        if (whatsappMenu) {
            whatsappMenu.classList.remove('active');
        }
    };

    // Chatbot functions
    window.chatbot = chatbot;

    window.openRuletaModal = openRuletaModal;
    window.closeRuletaModal = closeRuletaModal;

    // Initialize the app
    init();
});