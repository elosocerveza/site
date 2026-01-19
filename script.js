// Datos de productos
const productosData = [
    {
      "id": 1,
      "name": "PICATE",
      "subname": "Jalapeño Verde",
      "description": "Espesa y balanceada. Picor medio, sabor fresco. Para sumar picante sin tapar la comida.",
      "price": 6000,
      "category": "picante",
      "image": "images/products/sauces/picate-verde-100.png?v=9",
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
      "image": "images/products/sauces/picate-rojo-100.png?v=9",
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
      "image": "images/products/preserves/beren-330.png?v=9",
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
      "image": "images/products/preserves/peppi-330.png?v=9",
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
      "image": "images/products/preserves/chimi-330.png?v=9",
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
      "image": "images/products/beers/arun-330.png?v=9",
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
      "image": "images/products/beers/bennu-330.png?v=9",
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
      "image": "images/products/beers/ember-330.png?v=9",
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
      "image": "images/products/beers/kuma-330.png?v=9",
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
      "image": "images/products/beers/vika-330.png?v=9",
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
      "image": "images/products/beers/zora-330.png?v=9",
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
      "image": "images/products/beers/onyx-330.png?v=9",
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
      "image": "images/products/beers/mizu-330.png?v=9",
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
      "image": "images/products/beers/ndala-330.png?v=9",
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
      "image": "images/products/beers/riad-330.png?v=9",
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
      "image": "images/products/beers/tsia-330.png?v=9",
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
      "image": "images/products/beers/wendy-330.png?v=9",
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
      "image": "images/products/beers/clara-330.png?v=9",
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
      "image": "images/products/beers/dalma-330.png?v=9",
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

// ===== FUNCIÓN PARA RENDERIZAR CARRUSEL DE CERVEZAS =====
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
    
    // Generar diapositivas
    cervezas.forEach((cerveza, index) => {
        const agotado = cerveza.stock === 0;
        
        // Determinar estilo de cerveza
        const estiloCerveza = cerveza.subcategory ? 
            cerveza.subcategory.charAt(0).toUpperCase() + cerveza.subcategory.slice(1) : 
            'Especial';
        
        // Crear diapositiva
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;
        slide.setAttribute('role', 'listitem'); // ← CORRECCIÓN ARIA
        
        slide.innerHTML = `
            <div class="slide-image-wrapper">
                <img src="${cerveza.image}" 
                     alt="${cerveza.name}" 
                     class="slide-image"
                     loading="lazy"
                     width="400"
                     height="400"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
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
        dot.setAttribute('role', 'tab'); // ← CORRECCIÓN ARIA
        
        dotsContainer.appendChild(dot);
    });
    
    // Actualizar contador
    const currentSlideElement = document.getElementById('current-slide');
    const totalSlidesElement = document.getElementById('total-slides');
    
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = cervezas.length;
    }
    
    // Inicializar funcionalidad del carrusel
    initCarousel('cervezas');
    
    // Si no hay cervezas, mostrar mensaje
    if (cervezas.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay cervezas disponibles en este momento</h3>
                <p>Pronto tendremos nuevas cervezas artesanales.</p>
            </div>
        `;
    }
}

// ===== FUNCIÓN PARA RENDERIZAR CARRUSEL DE CONSERVAS =====
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
    
    // Generar diapositivas
    conservas.forEach((conserva, index) => {
        const agotado = conserva.stock === 0;
        
        // Crear diapositiva
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;
        slide.setAttribute('role', 'listitem'); // ← CORRECCIÓN ARIA
        
        slide.innerHTML = `
            <div class="slide-image-wrapper">
                <img src="${conserva.image}" 
                     alt="${conserva.name}" 
                     class="slide-image"
                     loading="lazy"
                     width="400"
                     height="400"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
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
        dot.setAttribute('role', 'tab'); // ← CORRECCIÓN ARIA
        
        dotsContainer.appendChild(dot);
    });
    
    // Actualizar contador
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = conservas.length;
    }
    
    // Inicializar carrusel de conservas
    initCarousel('conservas');
    
    // Si no hay conservas, mostrar mensaje
    if (conservas.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay conservas disponibles en este momento</h3>
                <p>Pronto tendremos nuevas conservas artesanales.</p>
            </div>
        `;
    }
}

// ===== FUNCIÓN PARA RENDERIZAR CARRUSEL DE PICANTES =====
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
    
    // Generar diapositivas
    picantes.forEach((picante, index) => {
        const agotado = picante.stock === 0;
        
        // Crear diapositiva
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;
        slide.setAttribute('role', 'listitem'); // ← CORRECCIÓN ARIA
        
        slide.innerHTML = `
            <div class="slide-image-wrapper">
                <img src="${picante.image}" 
                     alt="${picante.name}" 
                     class="slide-image"
                     loading="lazy"
                     width="400"
                     height="400"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
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
        dot.setAttribute('role', 'tab'); // ← CORRECCIÓN ARIA
        
        dotsContainer.appendChild(dot);
    });
    
    // Actualizar contador
    if (currentSlideElement && totalSlidesElement) {
        currentSlideElement.textContent = '1';
        totalSlidesElement.textContent = picantes.length;
    }
    
    // Inicializar carrusel de picantes
    initCarousel('picantes');
    
    // Si no hay picantes, mostrar mensaje
    if (picantes.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-products-message">
                <h3>No hay salsas picantes disponibles en este momento</h3>
                <p>Pronto tendremos nuevas salsas picantes artesanales.</p>
            </div>
        `;
    }
}

// ===== FUNCIÓN GENERAL PARA INICIALIZAR CARRUSELES =====
function initCarousel(section) {
    const slidesContainer = document.querySelector(`#${section}-slides`);
    const slides = document.querySelectorAll(`#${section}-slides .carousel-slide`);
    const dots = document.querySelectorAll(`#${section}-dots .carousel-dot`);
    const prevBtn = document.querySelector(`#${section} .carousel-nav.prev`);
    const nextBtn = document.querySelector(`#${section} .carousel-nav.next`);
    
    // Para cervezas usar IDs diferentes
    let currentSlideElement;
    if (section === 'cervezas') {
        currentSlideElement = document.getElementById('current-slide');
    } else {
        currentSlideElement = document.getElementById(`${section}-current`);
    }
    
    if (!slidesContainer || slides.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;
    
    // Función para actualizar la diapositiva activa
    function goToSlide(index, direction = 'next') {
        if (isTransitioning || index === currentSlide) return;
        
        isTransitioning = true;
        
        // Asegurar que el índice esté dentro del rango
        index = (index + totalSlides) % totalSlides;
        
        // Usar transformación porcentual en lugar de píxeles
        slidesContainer.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        
        // Actualizar clases activas después de la transición
        setTimeout(() => {
            // Quitar clase activa a todas las diapositivas y puntos
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Agregar clase activa a la diapositiva y punto actual
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            // Actualizar contador
            if (currentSlideElement) {
                currentSlideElement.textContent = index + 1;
            }
            
            currentSlide = index;
            isTransitioning = false;
        }, 500);
    }
    
    // Función para ir a la siguiente diapositiva
    function nextSlide() {
        goToSlide(currentSlide + 1, 'next');
    }
    
    // Función para ir a la diapositiva anterior
    function prevSlide() {
        goToSlide(currentSlide - 1, 'prev');
    }
    
    // Event listeners para los botones de navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // Event listeners para los puntos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        const activeSection = document.activeElement.closest(`#${section}`);
        if (activeSection || document.activeElement === document.body) {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        }
    });
    
    // Navegación táctil para móviles
    let touchStartX = 0;
    let touchEndX = 0;
    
    slidesContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe hacia la derecha = ir a la anterior
                prevSlide();
            } else {
                // Swipe hacia la izquierda = ir a la siguiente
                nextSlide();
            }
        }
    }
    
    // Ajustar al cambiar el tamaño de la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            goToSlide(currentSlide);
        }, 250);
    });
}

// ===== FUNCIONALIDAD PRINCIPAL DE LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.getElementById('main-nav');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Cargar carrusel de cervezas
    renderMinimalCarousel();
    
    // Cargar carruseles de conservas y picantes
    renderConservasCarousel();
    renderPicantesCarousel();
    
    // Cambiar estilo de navegación al hacer scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Toggle del menú móvil
    mobileToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileToggle.querySelector('i').classList.toggle('fa-bars');
        mobileToggle.querySelector('i').classList.toggle('fa-times');
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.remove('fa-times');
            mobileToggle.querySelector('i').classList.add('fa-bars');
        });
    });
    
    // Efecto parallax para el hero (desactivado en móviles para mejor rendimiento)
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero && scrolled < hero.offsetHeight) {
                hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
            }
        });
    }
    
    // Prevenir desbordamiento horizontal en toda la página
    function checkHorizontalScroll() {
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        
        if (bodyWidth > windowWidth) {
            console.warn('Desplazamiento horizontal detectado. Ajustando...');
            // Forzar el ancho del body
            document.body.style.width = '100%';
            document.body.style.overflowX = 'hidden';
            
            // Ajustar todos los elementos hijos
            document.querySelectorAll('*').forEach(el => {
                if (el.scrollWidth > windowWidth) {
                    el.style.maxWidth = '100%';
                    el.style.overflowX = 'hidden';
                }
            });
        }
    }
    
    // Verificar después de cargar la página y en redimensionamientos
    window.addEventListener('load', checkHorizontalScroll);
    window.addEventListener('resize', checkHorizontalScroll);
    
    // Verificar después de que todas las imágenes carguen
    window.addEventListener('load', function() {
        const images = document.querySelectorAll('img');
        let imagesLoaded = 0;
        
        images.forEach(img => {
            if (img.complete) {
                imagesLoaded++;
            } else {
                img.addEventListener('load', function() {
                    imagesLoaded++;
                    if (imagesLoaded === images.length) {
                        checkHorizontalScroll();
                    }
                });
            }
        });
        
        if (imagesLoaded === images.length) {
            checkHorizontalScroll();
        }
    });
    
    // Verificar periódicamente (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setInterval(checkHorizontalScroll, 2000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====

// Prevenir comportamientos por defecto que puedan causar scroll horizontal
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('wheel', function(e) {
    if (e.deltaX !== 0) {
        e.preventDefault();
    }
}, { passive: false });

// Función para manejar errores de imágenes globalmente
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        e.target.onerror = null;
    }
}, true);