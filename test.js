
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
                
                // Track Google Analytics
                if (gaTracker) {
                    gaTracker.trackEvent('Referral', 'show_modal', this.referralCode);
                }
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
                    
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Referral', 'copy_code', this.referralCode);
                    }
                });
            }

            const whatsappShare = document.getElementById('whatsappShare');
            if (whatsappShare) {
                const message = `¡Hola! Te invito a comprar en El Oso Cerveza. Usa mi código ${this.referralCode} y obtén $${this.referralDiscount} de descuento en tu primera compra. ¡Visita el sitio!`;
                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                whatsappShare.setAttribute('href', url);
                
                whatsappShare.addEventListener('click', () => {
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Referral', 'share_whatsapp', this.referralCode);
                    }
                });
            }

            const copyLink = document.getElementById('copyLink');
            if (copyLink) {
                copyLink.addEventListener('click', () => {
                    const message = `¡Hola! Te invito a comprar en El Oso Cerveza. Usa mi código ${this.referralCode} y obtén $${this.referralDiscount} de descuento. Visita: ${window.location.href}`;
                    this.copyToClipboard(message);
                    showNotification('Mensaje copiado al portapapeles', 'success');
                    
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Referral', 'copy_link', this.referralCode);
                    }
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
                        
                        // Track Google Analytics
                        if (gaTracker) {
                            gaTracker.trackEvent('Game', 'spin_wheel', 'daily_spin');
                        }
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
            
            // Track Google Analytics
            if (gaTracker) {
                gaTracker.trackEvent('Game', 'wheel_result', prize);
            }
            
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
                
                // Track Google Analytics
                if (gaTracker) {
                    gaTracker.trackEvent('Notification', 'show_permission_modal', 'push_notifications');
                }
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
                    
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Notification', 'permission_response', permission);
                    }
                    
                    closeModal();
                    
                    if (this.permissionGranted) {
                        showNotification('🔔 Notificaciones permitidas', 'success');
                    }
                });
            }

            if (denyButton) {
                denyButton.addEventListener('click', () => {
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Notification', 'permission_denied', 'push_notifications');
                    }
                    closeModal();
                });
            }

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
            
            // Track Google Analytics
            if (gaTracker) {
                gaTracker.trackEvent('Loyalty', 'earn_points', reason, amount);
            }
            
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
            
            // Track Google Analytics
            if (gaTracker) {
                gaTracker.trackEvent('Loyalty', 'redeem_points', 'points_redemption', pointsToRedeem);
            }
            
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
            
            // Track Google Analytics
            if (gaTracker) {
                gaTracker.trackEvent('Chatbot', 'init', 'product_recommender');
            }
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
                    
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Chatbot', 'toggle', container.classList.contains('active') ? 'open' : 'close');
                    }
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
                
                // Track Google Analytics
                if (gaTracker) {
                    gaTracker.trackEvent('Chatbot', 'user_message', message);
                }
                
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
                `<button class="quick-option" alt="" onclick="chatbot.selectOption('${option}')">${option}</button>`
            ).join('');
            
            this.addBotMessage(`Puedes elegir: ${optionsHTML}`);
        }

        selectOption(option) {
            const input = document.getElementById('chatbotInput');
            input.value = option;
            this.handleUserInput();
            
            // Track Google Analytics
            if (gaTracker) {
                gaTracker.trackEvent('Chatbot', 'quick_option', option);
            }
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
                        `<button class="product-link" alt="" onclick="showProductDetails(${product.id})">Ver detalles</button>`
                    );
                });
                
                // Track Google Analytics
                if (gaTracker) {
                    gaTracker.trackEvent('Chatbot', 'provide_recommendations', `Products: ${recommendedProducts.length}`);
                }
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
                    
                    // Track Google Analytics
                    if (gaTracker) {
                        gaTracker.trackEvent('Loyalty', 'view_details', 'level_details');
                    }
                });
            }
        }

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
                        <button class="modal-close" alt="" onclick="this.closest('.why-choose-modal').remove(); document.getElementById('overlay').classList.remove('active');">
                            <i class="fas fa-times"></i>
                        </button>
                        <h2 class="modal-title">🥇 Club El Oso - Programa de Fidelidad</h2>
                        <p class="modal-subtitle">Acumula puntos y disfruta de beneficios exclusivos</p>
                    </div>
                    <div class="modal-body">
                        ${detailsHTML}
                    </div>
                    <div class="modal-footer">
                        <button class="modal-cta" alt="" onclick="this.closest('.why-choose-modal').remove(); document.getElementById('overlay').classList.remove('active');">
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
