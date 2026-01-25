// Datos de productos
const productosData = [
    {
      "id": 1,
      "name": "PICATE",
      "subname": "Jalapeño Verde",
      "description": "Espesa y balanceada. Picor medio, sabor fresco. Para sumar picante sin tapar la comida.",
      "price": 6000,
      "category": "picante",
      "image": "images/products/sauces/picate-verde-100.png?v=15",
      "stock": 6,
      "sold": 84,
      "rating": 4.5,
      "active": true,
      "spec1value": "Medio",
      "spec2value": "Espesa",
      "size": "100ml",
      "ingredients": "Jalapeño verde, vinagre, sal, azúcar",
      "product": "PICATE VERDE (100)"
    },
    {
      "id": 2,
      "name": "PICATE HOT",
      "subname": "Jalapeño Rojo",
      "description": "Espesa y directa. Picante intenso, sin vueltas. Para los que siempre quieren un poco más.",
      "price": 6000,
      "category": "picante",
      "image": "images/products/sauces/picate-rojo-100.png?v=15",
      "stock": 15,
      "sold": 69,
      "rating": 4.4,
      "active": true,
      "spec1value": "Alto",
      "spec2value": "Espesa",
      "size": "100ml",
      "ingredients": "Jalapeño rojo, vinagre, sal, azúcar",
      "product": "PICATE ROJO (100)"
    },
    {
      "id": 3,
      "name": "BEREN",
      "subname": "Berenjenas en Escabeche",
      "description": "Suaves y bien sabrosas. Clásicas para picar o acompañar cualquier plato.",
      "price": 6000,
      "category": "conserva",
      "image": "images/products/preserves/beren-330.png?v=15",
      "stock": 15,
      "sold": 172,
      "rating": 5,
      "active": true,
      "spec1value": "100% Natural",
      "spec2value": "Sin Conservantes",
      "size": "330ml",
      "ingredients": "Berenjenas, vinagre, aceite de girasol, sal, orégano, ají molido, ajo deshidratado",
      "product": "BEREN (330)"
    },
    {
      "id": 4,
      "name": "PEPPI",
      "subname": "Pepinos agridulces",
      "description": "Crujientes y bien equilibrados. Dulce y ácido en su punto. Van con todo. O solos.",
      "price": 6000,
      "category": "conserva",
      "image": "images/products/preserves/peppi-330.png?v=15",
      "stock": 7,
      "sold": 35,
      "rating": 4.2,
      "active": true,
      "spec1value": "100% Natural",
      "spec2value": "Sin Conservantes",
      "size": "330ml",
      "ingredients": "Pepinos, sal, vinagre, azúcar, semillas de eneldo, cúrcuma",
      "product": "PEPPI (330)"
    },
    {
      "id": 5,
      "name": "CHIMI",
      "subname": "Chimichurri Tradicional",
      "description": "Intenso y bien criollo. El clásico argentino. Para asado, milanesas o lo que pinte.",
      "price": 6000,
      "category": "conserva",
      "image": "images/products/preserves/chimi-330.png?v=15",
      "stock": 2,
      "sold": 3,
      "rating": 4,
      "active": false,
      "spec1value": "100% Natural",
      "spec2value": "Sin Conservantes",
      "size": "330ml",
      "ingredients": "Orégano, ají molido, provenzal, sal, soja, vinagre, aceto balsámico, aceite de girasol",
      "product": "CHIMI (330)"
    },
    {
      "id": 6,
      "name": "ARUN",
      "subname": "Blonde",
      "description": "Dorada, suave y fácil de tomar. Sabor a caramelo; perfecta para cualquier momento.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "rubia",
      "image": "images/products/beers/arun-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": false,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, lúpulo, levadura, caramelo suave",
      "product": "ARUN (330)"
    },
    {
      "id": 7,
      "name": "BENNU",
      "subname": "Honey Wheat",
      "description": "Trigo con toque de miel. Suave y dulce natural, ideal para relax.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "trigo",
      "image": "images/products/beers/bennu-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": false,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura, miel natural",
      "product": "BENNU (330)"
    },
    {
      "id": 8,
      "name": "EMBER",
      "subname": "Dubbel",
      "description": "Roja, maltosa y profunda. Sabor a caramelo y frutos secos, para disfrutar tranquilo.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "roja",
      "image": "images/products/beers/ember-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": true,
      "spec1value": "5.0%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, lúpulo, levadura, caramelo suave",
      "product": "EMBER (330)"
    },
    {
      "id": 9,
      "name": "KUMA",
      "subname": "Witbier",
      "description": "Trigo, ligera y aromática. Naranja y hierbas, muy refrescante de verdad.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "trigo",
      "image": "images/products/beers/kuma-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura, cáscara de naranja, semillas de coriandro, menta",
      "product": "KUMA (330)"
    },
    {
      "id": 10,
      "name": "VIKA",
      "subname": "New England IPA",
      "description": "IPA turbia, frutal y sedosa. Explosión de fruta en nariz, tomable y equilibrada.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "ipa",
      "image": "images/products/beers/vika-330.png?v=15",
      "stock": 35,
      "sold": 15,
      "rating": 4.1,
      "active": true,
      "spec1value": "5.0%",
      "spec2value": "Medio",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "VIKA (330)"
    },
    {
      "id": 11,
      "name": "ZORA",
      "subname": "Lemon Wheat",
      "description": "Trigo, ligera y bien refrescante. Limón real, ideal para el calor.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "trigo",
      "image": "images/products/beers/zora-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura, cáscara de limón, menta",
      "product": "ZORA (330)"
    },
    {
      "id": 12,
      "name": "ONYX",
      "subname": "Sweet Stout",
      "description": "Negra, cremosa y reconfortante. Toques de café suave y final dulce.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "negra",
      "image": "images/products/beers/onyx-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": false,
      "spec1value": "6.0%",
      "spec2value": "Medio",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada y avena, lúpulo, levadura",
      "product": "ONYX (330)"
    },
    {
      "id": 13,
      "name": "MIZU",
      "subname": "Rice Lager",
      "description": "Rubia, muy ligera y seca. Perfil limpio que se toma sola.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "rubia",
      "image": "images/products/beers/mizu-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": false,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, avena y arroz, lúpulo, levadura",
      "product": "MIZU (330)"
    },
    {
      "id": 14,
      "name": "NDALA",
      "subname": "Chocolate Stout",
      "description": "Negra intensa y golosa. Chocolate oscuro que se siente como postre.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "negra",
      "image": "images/products/beers/ndala-330.png?v=15",
      "stock": 42,
      "sold": 8,
      "rating": 4,
      "active": true,
      "spec1value": "6.0%",
      "spec2value": "Medio",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada y avena, lúpulo, levadura, cacao",
      "product": "NDALA (330)"
    },
    {
      "id": 15,
      "name": "RIAD",
      "subname": "Red APA",
      "description": "Roja afrutada y amarga. Equilibrada, buen cuerpo y sabor directo.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "roja",
      "image": "images/products/beers/riad-330.png?v=15",
      "stock": 28,
      "sold": 22,
      "rating": 4.1,
      "active": true,
      "spec1value": "5.0%",
      "spec2value": "Medio",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, lúpulo, levadura",
      "product": "RIAD (330)"
    },
    {
      "id": 16,
      "name": "TSIA",
      "subname": "Hefeweizen",
      "description": "Trigo, suave y refrescante. Banana, clavo y un leve toque ácido. Clásica y fácil.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "trigo",
      "image": "images/products/beers/tsia-330.png?v=15",
      "stock": 0,
      "sold": 0,
      "active": false,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "TSIA (330)"
    },
    {
      "id": 17,
      "name": "WENDY",
      "subname": "Hybrid Lager",
      "description": "Ligera y fresca. Maltas suaves, final seco y refrescante.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "rubia",
      "image": "images/products/beers/wendy-330.png?v=15",
      "stock": 14,
      "sold": 36,
      "rating": 4.2,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "WENDY (330)"
    },
    {
      "id": 18,
      "name": "CLARA",
      "subname": "American Blonde",
      "description": "Limpia, equilibrada y fácil de tomar. Maltas claras, toque floral y final suave.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "rubia",
      "image": "images/products/beers/clara-330.png?v=15",
      "stock": 14,
      "sold": 36,
      "rating": 4.2,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "CLARA (330)"
    },
    {
      "id": 19,
      "name": "DALMA",
      "subname": "Honey",
      "description": "Dorada, suave y fácil de tomar. Sabor a miel; perfecta para cualquier momento.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "rubia",
      "image": "images/products/beers/dalma-330.png?v=15",
      "stock": 50,
      "sold": 0,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "DALMA (330)"
    },
    {
      "id": 20,
      "name": "GRETA",
      "subname": "Passion Blonde",
      "description": "Ligera y refrescante. Maltas claras, maracuyá natural y un leve toque ácido.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "especial",
      "image": "images/products/beers/greta-330.png?v=10",
      "stock": 45,
      "sold": 5,
      "rating": 4,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "GRETA (330)"
    },
    {
      "id": 21,
      "name": "FIONA",
      "subname": "Raspberry Blonde",
      "description": "Ligera y refrescante. Maltas claras, frambuesa natural y un leve toque ácido.",
      "price": 5000,
      "category": "cerveza",
      "subcategory": "especial",
      "image": "images/products/beers/fiona-330.png?v=11",
      "stock": 0,
      "sold": 0,
      "active": true,
      "spec1value": "4.5%",
      "spec2value": "Bajo",
      "size": "330ml",
      "ingredients": "Agua purificada, maltas de cebada, trigo y avena, lúpulo, levadura",
      "product": "FIONA (330)"
    }
];

// ===== VARIABLES GLOBALES PARA CONTROL DE CARGAS =====
let carouselsInitialized = {
    cervezas: false,
    conservas: false,
    picantes: false
};

// ===== SISTEMA DE CACHÉ PARA IMÁGENES =====
const imageCache = new Map();
const MAX_CACHE_SIZE = 20;

function cacheImage(url) {
    return new Promise((resolve, reject) => {
        if (imageCache.has(url)) {
            resolve(imageCache.get(url));
            return;
        }

        if (imageCache.size >= MAX_CACHE_SIZE) {
            // Eliminar la primera entrada del caché si está lleno
            const firstKey = imageCache.keys().next().value;
            imageCache.delete(firstKey);
        }

        const img = new Image();
        img.src = url;
        
        img.onload = () => {
            imageCache.set(url, img);
            resolve(img);
        };
        
        img.onerror = () => {
            // Usar imagen de fallback
            const fallbackUrl = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            const fallbackImg = new Image();
            fallbackImg.src = fallbackUrl;
            
            fallbackImg.onload = () => {
                imageCache.set(url, fallbackImg);
                resolve(fallbackImg);
            };
            
            fallbackImg.onerror = () => {
                reject(new Error(`No se pudo cargar la imagen: ${url}`));
            };
        };
    });
}

// ===== FUNCIÓN PARA INICIALIZAR CARRUSELES CON RETRASO INTELIGENTE =====
function initializeCarouselsAfterLoad() {
    // Precachear imágenes críticas primero
    precacheCriticalImages().then(() => {
        // Inicializar carrusel de cervezas inmediatamente (es el más importante)
        setTimeout(() => {
            if (!carouselsInitialized.cervezas) {
                renderMinimalCarousel();
                carouselsInitialized.cervezas = true;
            }
        }, 100);
        
        // Inicializar otros carruseles con retraso escalonado
        setTimeout(() => {
            if (!carouselsInitialized.conservas) {
                renderConservasCarousel();
                carouselsInitialized.conservas = true;
            }
        }, 300);
        
        setTimeout(() => {
            if (!carouselsInitialized.picantes) {
                renderPicantesCarousel();
                carouselsInitialized.picantes = true;
            }
        }, 500);
        
        // Forzar redibujado para móviles después de un tiempo
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                forceCarouselRedraw();
            }, 1000);
        }
    }).catch(() => {
        // Fallback: inicializar de todos modos aunque falle el precaché
        setTimeout(() => {
            renderMinimalCarousel();
            renderConservasCarousel();
            renderPicantesCarousel();
        }, 500);
    });
}

// ===== PRECACHÉ DE IMÁGENES CRÍTICAS =====
function precacheCriticalImages() {
    const criticalImages = [];
    
    // Agregar primeras imágenes de cada categoría
    const cervezas = productosData.filter(p => p.category === 'cerveza' && p.active !== false);
    const conservas = productosData.filter(p => p.category === 'conserva' && p.active !== false);
    const picantes = productosData.filter(p => p.category === 'picante' && p.active !== false);
    
    if (cervezas.length > 0) criticalImages.push(cervezas[0].image);
    if (conservas.length > 0) criticalImages.push(conservas[0].image);
    if (picantes.length > 0) criticalImages.push(picantes[0].image);
    
    // Precaché paralelo con límite de tiempo
    const promises = criticalImages.map(url => 
        Promise.race([
            cacheImage(url),
            new Promise(resolve => setTimeout(resolve, 2000)) // Timeout de 2 segundos
        ])
    );
    
    return Promise.all(promises);
}

// ===== FUNCIÓN PARA FORZAR REDIBUJADO DE CARRUSELES EN MÓVILES =====
function forceCarouselRedraw() {
    const carousels = ['cervezas', 'conservas', 'picantes'];
    
    carousels.forEach(section => {
        const slidesContainer = document.querySelector(`#${section}-slides`);
        if (slidesContainer && slidesContainer.children.length > 0) {
            // Forzar reflow para asegurar que se renderice correctamente
            slidesContainer.style.display = 'none';
            setTimeout(() => {
                slidesContainer.style.display = 'flex';
                // Re-inicializar el carrusel
                initCarousel(section);
            }, 50);
        }
    });
}

// ===== RENDERIZADO CON LAZY LOADING MEJORADO =====
function renderMinimalCarousel() {
    const slidesContainer = document.getElementById('cervezas-slides');
    const dotsContainer = document.getElementById('cervezas-dots');
    
    if (!slidesContainer || !dotsContainer) return;
    
    // Filtrar solo cervezas activas
    const cervezas = productosData.filter(producto => 
        producto.category === 'cerveza' && producto.active !== false
    );
    
    // Limpiar contenedores
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Si no hay cervezas, mostrar mensaje
    if (cervezas.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay cervezas disponibles en este momento</h3>
                <p>Pronto tendremos nuevas cervezas artesanales.</p>
            </div>
        `;
        return;
    }
    
    // Generar diapositivas
    const slidePromises = cervezas.map((cerveza, index) => {
        return new Promise((resolve) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            slide.setAttribute('role', 'listitem');
            
            const estiloCerveza = cerveza.subcategory ? 
                cerveza.subcategory.charAt(0).toUpperCase() + cerveza.subcategory.slice(1) : 
                'Especial';
            
            slide.innerHTML = `
                <div class="slide-image-wrapper">
                    <div class="image-placeholder" style="width: 400px; height: 400px; background: #f0f0f0;"></div>
                    <img src="" 
                         data-src="${cerveza.image}" 
                         alt="${cerveza.name}" 
                         class="slide-image lazy"
                         width="400"
                         height="400">
                </div>
                
                <div class="slide-content">
                    <div class="product-header">
                        <div class="product-title">
                            <h3>${cerveza.name}</h3>
                            <span class="product-style">${estiloCerveza}</span>
                        </div>
                    </div>
                    
                    <p class="product-subtitle">${cerveza.subname || ''}</p>
                    
                    <p class="product-description">${cerveza.description}</p>
                </div>
            `;
            
            slidesContainer.appendChild(slide);
            
            // Crear punto indicador
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Ir a producto ${index + 1}`);
            dot.setAttribute('role', 'tab');
            
            dotsContainer.appendChild(dot);
            
            // Precargar imagen
            const img = slide.querySelector('img');
            if (img) {
                const loadImage = () => {
                    const src = img.getAttribute('data-src');
                    cacheImage(src).then(cachedImg => {
                        img.src = cachedImg.src;
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove(); // Remover placeholder
                    }).catch(() => {
                        // Usar fallback
                        img.src = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove();
                    }).finally(() => {
                        resolve();
                    });
                };
                
                // Cargar imagen con retraso escalonado para evitar saturación
                setTimeout(loadImage, index * 200);
            } else {
                resolve();
            }
        });
    });
    
    // Actualizar contadores
    const currentSlideElement = document.getElementById('current-slide');
    const totalSlidesElement = document.getElementById('total-slides');
    
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = cervezas.length;
    }
    
    // Inicializar carrusel después de que todas las imágenes estén listas o timeout
    Promise.race([
        Promise.all(slidePromises),
        new Promise(resolve => setTimeout(resolve, 3000)) // Timeout de 3 segundos
    ]).then(() => {
        initCarousel('cervezas');
    });
}

// ===== RENDERIZADO DE CONSERVAS CON LAZY LOADING =====
function renderConservasCarousel() {
    const slidesContainer = document.getElementById('conservas-slides');
    const dotsContainer = document.getElementById('conservas-dots');
    const currentSlideElement = document.getElementById('conservas-current');
    const totalSlidesElement = document.getElementById('conservas-total');
    
    if (!slidesContainer || !dotsContainer) return;
    
    // Filtrar conservas activas
    const conservas = productosData.filter(producto => 
        producto.category === 'conserva' && producto.active !== false
    );
    
    // Limpiar contenedores
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Si no hay conservas, mostrar mensaje
    if (conservas.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay conservas disponibles en este momento</h3>
                <p>Pronto tendremos nuevas conservas artesanales.</p>
            </div>
        `;
        return;
    }
    
    // Generar diapositivas
    const slidePromises = conservas.map((conserva, index) => {
        return new Promise((resolve) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            slide.setAttribute('role', 'listitem');
            
            slide.innerHTML = `
                <div class="slide-image-wrapper">
                    <div class="image-placeholder" style="width: 400px; height: 400px; background: #f0f0f0;"></div>
                    <img src="" 
                         data-src="${conserva.image}" 
                         alt="${conserva.name}" 
                         class="slide-image lazy"
                         width="400"
                         height="400">
                </div>
                
                <div class="slide-content">
                    <div class="product-header">
                        <div class="product-title">
                            <h3>${conserva.name}</h3>
                            <span class="product-style">${conserva.spec1value || 'Natural'}</span>
                        </div>
                    </div>
                    
                    <p class="product-subtitle">${conserva.subname || ''}</p>
                    
                    <p class="product-description">${conserva.description}</p>
                </div>
            `;
            
            slidesContainer.appendChild(slide);
            
            // Crear punto indicador
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Ir a conserva ${index + 1}`);
            dot.setAttribute('role', 'tab');
            
            dotsContainer.appendChild(dot);
            
            // Precargar imagen
            const img = slide.querySelector('img');
            if (img) {
                const loadImage = () => {
                    const src = img.getAttribute('data-src');
                    cacheImage(src).then(cachedImg => {
                        img.src = cachedImg.src;
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove();
                    }).catch(() => {
                        img.src = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove();
                    }).finally(() => {
                        resolve();
                    });
                };
                
                setTimeout(loadImage, index * 200);
            } else {
                resolve();
            }
        });
    });
    
    // Actualizar contadores
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = conservas.length;
    }
    
    // Inicializar carrusel con timeout
    Promise.race([
        Promise.all(slidePromises),
        new Promise(resolve => setTimeout(resolve, 3000))
    ]).then(() => {
        initCarousel('conservas');
    });
}

// ===== RENDERIZADO DE PICANTES CON LAZY LOADING =====
function renderPicantesCarousel() {
    const slidesContainer = document.getElementById('picantes-slides');
    const dotsContainer = document.getElementById('picantes-dots');
    const currentSlideElement = document.getElementById('picantes-current');
    const totalSlidesElement = document.getElementById('picantes-total');
    
    if (!slidesContainer || !dotsContainer) return;
    
    // Filtrar picantes activos
    const picantes = productosData.filter(producto => 
        producto.category === 'picante' && producto.active !== false
    );
    
    // Limpiar contenedores
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Si no hay picantes, mostrar mensaje
    if (picantes.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay salsas picantes disponibles en este momento</h3>
                <p>Pronto tendremos nuevas salsas picantes artesanales.</p>
            </div>
        `;
        return;
    }
    
    // Generar diapositivas
    const slidePromises = picantes.map((picante, index) => {
        return new Promise((resolve) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            slide.setAttribute('role', 'listitem');
            
            slide.innerHTML = `
                <div class="slide-image-wrapper">
                    <div class="image-placeholder" style="width: 400px; height: 400px; background: #f0f0f0;"></div>
                    <img src="" 
                         data-src="${picante.image}" 
                         alt="${picante.name}" 
                         class="slide-image lazy"
                         width="400"
                         height="400">
                </div>
                
                <div class="slide-content">
                    <div class="product-header">
                        <div class="product-title">
                            <h3>${picante.name}</h3>
                            <span class="product-style">${picante.spec1value || 'Picante'}</span>
                        </div>
                    </div>
                    
                    <p class="product-subtitle">${picante.subname || ''}</p>
                    
                    <p class="product-description">${picante.description}</p>
                </div>
            `;
            
            slidesContainer.appendChild(slide);
            
            // Crear punto indicador
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Ir a picante ${index + 1}`);
            dot.setAttribute('role', 'tab');
            
            dotsContainer.appendChild(dot);
            
            // Precargar imagen
            const img = slide.querySelector('img');
            if (img) {
                const loadImage = () => {
                    const src = img.getAttribute('data-src');
                    cacheImage(src).then(cachedImg => {
                        img.src = cachedImg.src;
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove();
                    }).catch(() => {
                        img.src = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        img.classList.remove('lazy');
                        img.previousElementSibling?.remove();
                    }).finally(() => {
                        resolve();
                    });
                };
                
                setTimeout(loadImage, index * 200);
            } else {
                resolve();
            }
        });
    });
    
    // Actualizar contadores
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = picantes.length;
    }
    
    // Inicializar carrusel con timeout
    Promise.race([
        Promise.all(slidePromises),
        new Promise(resolve => setTimeout(resolve, 3000))
    ]).then(() => {
        initCarousel('picantes');
    });
}

// ===== INIT CARRUSEL CON FALLBACKS MEJORADOS =====
function initCarousel(section) {
    // Si ya está inicializado, no hacer nada
    if (document.querySelector(`#${section}.carousel-initialized`)) return;
    
    const slidesContainer = document.querySelector(`#${section}-slides`);
    const slides = document.querySelectorAll(`#${section}-slides .carousel-slide`);
    const dots = document.querySelectorAll(`#${section}-dots .carousel-dot`);
    const prevBtn = document.querySelector(`#${section} .carousel-nav.prev`);
    const nextBtn = document.querySelector(`#${section} .carousel-nav.next`);
    
    if (!slidesContainer || slides.length === 0) {
        // Intentar de nuevo después de un tiempo
        setTimeout(() => {
            if (!document.querySelector(`#${section}.carousel-initialized`)) {
                initCarousel(section);
            }
        }, 500);
        return;
    }
    
    // Marcar como inicializado
    document.querySelector(`#${section}`).classList.add('carousel-initialized');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;
    
    // Inicializar ancho
    slidesContainer.style.width = `${totalSlides * 100}%`;
    
    function goToSlide(index) {
        if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;
        
        isTransitioning = true;
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        
        setTimeout(() => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            
            if (slides[index]) slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            
            // Actualizar contador
            const currentSlideElement = section === 'cervezas' 
                ? document.getElementById('current-slide')
                : document.getElementById(`${section}-current`);
            if (currentSlideElement) currentSlideElement.textContent = index + 1;
            
            currentSlide = index;
            isTransitioning = false;
        }, 500);
    }
    
    function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); }
    function prevSlide() { goToSlide((currentSlide - 1 + totalSlides) % totalSlides); }
    
    // Botones
    if (prevBtn) {
        prevBtn.onclick = prevSlide;
        prevBtn.style.pointerEvents = 'auto'; // Asegurar que sea clickeable
    }
    
    if (nextBtn) {
        nextBtn.onclick = nextSlide;
        nextBtn.style.pointerEvents = 'auto'; // Asegurar que sea clickeable
    }
    
    // Dots
    dots.forEach((dot, index) => {
        dot.onclick = () => goToSlide(index);
        dot.style.pointerEvents = 'auto';
    });
    
    // Touch para móviles
    let touchStartX = 0;
    slidesContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });
    
    // Inicializar primera diapositiva
    goToSlide(0);
    
    // Ajustar en resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            slidesContainer.style.width = `${totalSlides * 100}%`;
            goToSlide(currentSlide);
        }, 250);
    });
}

// ===== FUNCIONALIDAD PRINCIPAL MEJORADA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carruseles...');
    
    // Elementos de navegación
    const nav = document.getElementById('main-nav');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Inicializar carruseles inmediatamente
    initializeCarouselsAfterLoad();
    
    // Reintentar inicialización después de 2 segundos por si falla
    setTimeout(() => {
        if (!carouselsInitialized.cervezas || !carouselsInitialized.conservas || !carouselsInitialized.picantes) {
            console.log('Reintentando inicialización de carruseles...');
            initializeCarouselsAfterLoad();
        }
    }, 2000);
    
    // Navegación scroll
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Menú móvil
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    
    // Cerrar menú al hacer clic en enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Inicializar cuando las imágenes críticas cargan
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!carouselsInitialized.cervezas || !carouselsInitialized.conservas || !carouselsInitialized.picantes) {
                console.log('Window loaded, verificando carruseles...');
                initializeCarouselsAfterLoad();
            }
        }, 1000);
    });
    
    // Reintentar en orientación change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            console.log('Orientación cambiada, reinicializando...');
            carouselsInitialized = { cervezas: false, conservas: false, picantes: false };
            initializeCarouselsAfterLoad();
        }, 500);
    });
    
    // Detectar conexión lenta
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection) {
            if (connection.saveData || connection.effectiveType.includes('2g') || connection.effectiveType.includes('slow-2g')) {
                console.log('Conexión lenta detectada, optimizando...');
                // Deshabilitar precaché para conexiones lentas
                window.precacheDisabled = true;
            }
        }
    }
});

// ===== DETECCIÓN DE VISIBILIDAD PARA CARGAS DIFERIDAS =====
if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.classList.contains('lazy')) {
                    const src = img.getAttribute('data-src');
                    if (src) {
                        cacheImage(src).then(cachedImg => {
                            img.src = cachedImg.src;
                            img.classList.remove('lazy');
                        });
                    }
                }
            }
        });
    });
    
    // Observar imágenes lazy después de que el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img.lazy').forEach(img => {
            lazyImageObserver.observe(img);
        });
    });
}

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        e.target.onerror = null;
    }
}, true);