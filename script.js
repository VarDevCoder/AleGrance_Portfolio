// ===== PORTFOLIO OPTIMIZADO PARA MOBILE =====
// JavaScript optimizado para mejor rendimiento en dispositivos móviles

console.log("Portfolio de Alejandra Grance - Versión Mobile Optimizada");

// ===== DETECCIÓN DE DISPOSITIVOS Y CAPACIDADES =====
const isMobile = window.innerWidth <= 768;
const isTouch = 'ontouchstart' in window;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const slowConnection = navigator.connection && (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g');

// DOM Elements - Lazy loading para mejor performance
let navbar, hamburger, navMenu, navLinks, backToTopBtn, contactForm;
let intersectionObserver;

// Variables de estado
let isNavOpen = false;
let lastScrollTop = 0;
let scrollTimeout;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    cacheElements();
    
    // Initialize core features immediately
    initCriticalFeatures();
    
    // Delay non-critical features for better initial load
    if (isMobile && slowConnection) {
        // Para conexiones lentas, delay más features
        setTimeout(initNonCriticalFeatures, 1000);
    } else {
        setTimeout(initNonCriticalFeatures, 100);
    }
    
    // Initialize mobile-specific optimizations
    if (isMobile) {
        initMobileOptimizations();
    }
});

// Cache DOM elements for better performance
function cacheElements() {
    navbar = document.getElementById('navbar');
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
    navLinks = document.querySelectorAll('.nav-link');
    backToTopBtn = document.getElementById('backToTop');
    contactForm = document.querySelector('.contact-form');
}

// Initialize critical features first
function initCriticalFeatures() {
    if (navbar && hamburger && navMenu) {
        initNavigation();
    }
    
    if (isMobile) {
        initViewportFix();
    }
}

// Initialize non-critical features
function initNonCriticalFeatures() {
    // Solo inicializar si no estamos en modo de motion reducido
    if (!reducedMotion) {
        initScrollAnimations();
    }
    
    initSkillBars();
    initStatCounters();
    
    // Solo para desktop o tablets
    if (!isMobile) {
        initTestimonialSlider();
        createParticles();
    }
    
    if (contactForm) {
        initContactForm();
    }
    
    if (backToTopBtn) {
        initBackToTop();
    }
    
    // Lazy load de imágenes
    initLazyLoading();
}

// ===== NAVEGACIÓN OPTIMIZADA =====
function initNavigation() {
    // Mobile menu toggle con mejor performance
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMobileMenu();
    }, { passive: false });

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu
            if (isNavOpen) {
                toggleMobileMenu();
            }
            
            // Smooth scroll optimizado
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                smoothScrollTo(targetSection);
            }
        });
    });

    // Optimized scroll handler con throttling
    if (!isMobile || !slowConnection) {
        window.addEventListener('scroll', throttle(handleScroll, 16), { passive: true });
    }
}

function toggleMobileMenu() {
    isNavOpen = !isNavOpen;
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('nav-open');
    
    // Prevenir scroll del body cuando menu está abierto
    if (isNavOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Navbar scroll effect
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link (solo en desktop)
    if (!isMobile) {
        updateActiveNavLink();
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// ===== SMOOTH SCROLL OPTIMIZADO =====
function smoothScrollTo(element) {
    const offsetTop = element.offsetTop - 70;
    
    // Usar scrollIntoView para mejor performance en mobile
    if (isMobile) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
    } else {
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// ===== ANIMACIONES SCROLL OPTIMIZADAS =====
function initScrollAnimations() {
    // Solo inicializar si no está en modo reducido
    if (reducedMotion) return;
    
    const observerOptions = {
        threshold: isMobile ? 0.05 : 0.1,
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
    };

    intersectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger specific animations
                if (entry.target.classList.contains('stat-item')) {
                    requestAnimationFrame(() => animateCounter(entry.target));
                }
                
                if (entry.target.classList.contains('skill-level')) {
                    requestAnimationFrame(() => animateSkillBar(entry.target));
                }
                
                // Unobserve para mejor performance
                intersectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Solo observar elementos visibles
    const elementsToAnimate = [
        '.section-header',
        '.about-content',
        '.skill-category',
        '.project-card',
        '.education-item',
        '.contact-item'
    ];

    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.classList.add('fade-in');
            // Delay más corto en mobile
            el.style.transitionDelay = `${index * (isMobile ? 0.05 : 0.1)}s`;
            intersectionObserver.observe(el);
        });
    });

    // Observe stat items and skill levels
    document.querySelectorAll('.stat-item, .skill-level').forEach(el => {
        intersectionObserver.observe(el);
    });
}

// ===== SKILL BARS OPTIMIZADAS =====
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    
    skillLevels.forEach(skill => {
        const level = skill.getAttribute('data-level');
        skill.style.setProperty('--level', `${level}%`);
    });
}

function animateSkillBar(skillBar) {
    if (!skillBar.classList.contains('animate')) {
        skillBar.classList.add('animate');
    }
}

// ===== COUNTERS OPTIMIZADOS =====
function initStatCounters() {
    // Ya están manejados por intersection observer
}

function animateCounter(statItem) {
    const counter = statItem.querySelector('.stat-number');
    if (!counter || counter.classList.contains('counted')) return;
    
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = isMobile ? 1000 : 2000; // Más rápido en mobile
    const increment = target / (duration / 16);
    let current = 0;

    counter.classList.add('counted');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current);
    }, 16);
}

// ===== TESTIMONIAL SLIDER (Solo Desktop) =====
function initTestimonialSlider() {
    if (isMobile) return; // Skip en mobile
    
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000;

    if (testimonials.length === 0) return;

    function showSlide(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (testimonials[index]) {
            testimonials[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    }

    // Initialize
    showSlide(0);
    
    // Auto advance
    setInterval(nextSlide, slideInterval);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

// ===== CONTACT FORM OPTIMIZADO =====
function initContactForm() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Validación simple
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        if (!name || !email || !message) {
            showMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Por favor, ingresa un email válido', 'error');
            return;
        }
        
        // Simular envío
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showMessage('¡Mensaje enviado correctamente! Te contactaré pronto.', 'success');
            this.reset();
        } catch (error) {
            showMessage('Error al enviar el mensaje. Inténtalo nuevamente.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type) {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Animar entrada
    requestAnimationFrame(() => {
        messageEl.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    // Remover después de 4 segundos
    setTimeout(() => {
        messageEl.style.transform = 'translateX(-50%) translateY(-100px)';
        messageEl.style.opacity = '0';
        setTimeout(() => messageEl.remove(), 300);
    }, 4000);
}

// ===== BACK TO TOP OPTIMIZADO =====
function initBackToTop() {
    if (!backToTopBtn) return;
    
    // Throttled scroll handler
    const scrollHandler = throttle(() => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, 100);
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Animación más suave para desktop
            const scrollToTop = () => {
                const c = document.documentElement.scrollTop || document.body.scrollTop;
                if (c > 0) {
                    window.requestAnimationFrame(scrollToTop);
                    window.scrollTo(0, c - c / 8);
                }
            };
            scrollToTop();
        }
    });
}

// ===== LAZY LOADING DE IMÁGENES =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Navegador soporta lazy loading nativo
        images.forEach(img => {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        });
    } else {
        // Fallback para navegadores que no soportan lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ===== OPTIMIZACIONES MOBILE =====
function initMobileOptimizations() {
    // Optimizar viewport height para mobile browsers
    initViewportFix();
    
    // Prevenir zoom en inputs
    preventFormZoom();
    
    // Optimizar touch interactions
    optimizeTouchInteractions();
    
    // Reducir efectos pesados
    if (slowConnection || reducedMotion) {
        optimizeForLowEnd();
    }
}

function initViewportFix() {
    // Fix para altura del viewport en mobile
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', debounce(setVH, 100));
    window.addEventListener('orientationchange', debounce(setVH, 100));
}

function preventFormZoom() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Asegurar que el font-size sea >= 16px para prevenir zoom en iOS
        const computedStyle = window.getComputedStyle(input);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        if (fontSize < 16) {
            input.style.fontSize = '16px';
        }
    });
}

function optimizeTouchInteractions() {
    // Mejorar respuesta táctil
    const touchElements = document.querySelectorAll('button, .btn, .nav-link, .highlight-item, .project-card');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
    });
}

function optimizeForLowEnd() {
    // Desactivar animaciones complejas
    const heavyElements = document.querySelectorAll('.iridescent-bg, .animated-bg');
    heavyElements.forEach(el => {
        el.style.animation = 'none';
        el.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.02), rgba(6, 95, 70, 0.02))';
    });
    
    // Simplificar shadows
    const shadowElements = document.querySelectorAll('.skill-category, .project-card, .highlight-item, .stat-item');
    shadowElements.forEach(el => {
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    });
}

// ===== UTILITY FUNCTIONS =====

// Throttle function para better performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create particles only for desktop
function createParticles() {
    if (isMobile || reducedMotion) return;
    
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    hero.appendChild(particlesContainer);
    
    // Crear menos partículas para mejor performance
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== DETECCIÓN DE CONEXIÓN LENTA =====
if ('connection' in navigator) {
    const connection = navigator.connection;
    
    const updateConnectionStatus = () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            document.body.classList.add('slow-connection');
            optimizeForLowEnd();
        } else {
            document.body.classList.remove('slow-connection');
        }
    };
    
    connection.addEventListener('change', updateConnectionStatus);
    updateConnectionStatus();
}

// ===== SERVICE WORKER PARA CACHE (OPCIONAL) =====
if ('serviceWorker' in navigator && !isMobile) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    // Cleanup intersection observers
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    
    // Clear any running timers
    if (scrollTimeout) clearTimeout(scrollTimeout);
});

// ===== PRELOAD CRITICAL RESOURCES =====
function preloadCriticalResources() {
    const criticalImages = [
        'images/alejandra-profile.webp',
        'images/alejandra-profile.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Preload only if not on slow connection
if (!slowConnection) {
    preloadCriticalResources();
}

// ===== PERFORMANCE MONITORING =====
if (window.performance && window.performance.mark) {
    window.performance.mark('portfolio-js-end');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            const metrics = {
                loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
                domReady: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
                firstPaint: window.performance.getEntriesByType('paint')[0]?.startTime || 0
            };
            
            console.log('Performance Metrics:', metrics);
        }, 0);
    });
}
console.log("✨ Portfolio completamente cargado y funcional!");