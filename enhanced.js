/**
 * ALTIMANCE - Script de Fonctionnalités Améliorées
 * Corrections et nouvelles fonctionnalités pour le site
 */

// ============================================
// MENU MOBILE AMÉLIORÉ
// ============================================
function initImprovedMobileMenu() {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            const header = document.querySelector('header');
            if (!header) return;

            // Créer le bouton menu mobile s'il n'existe pas
            let mobileButton = header.querySelector('.mobile-menu-btn');
            if (!mobileButton) {
                mobileButton = document.createElement('button');
                mobileButton.className = 'md:hidden p-2 text-slate-900 dark:text-white mobile-menu-btn';
                mobileButton.innerHTML = '<span class="material-symbols-outlined">menu</span>';
                header.appendChild(mobileButton);
            }

            // Créer le menu mobile
            const mobileMenu = document.createElement('div');
            mobileMenu.id = 'mobile-menu';
            mobileMenu.className = 'hidden md:hidden fixed inset-0 bg-black/50 z-50';
            mobileMenu.innerHTML = `
                <div class="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-background-dark shadow-xl transform transition-transform duration-300 translate-x-full" id="mobile-menu-panel">
                    <div class="p-6">
                        <button class="close-mobile-menu mb-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                        <nav class="flex flex-col gap-4">
                            <a href="index.html" class="text-lg font-semibold hover:text-primary transition-colors py-2">Accueil</a>
                            <a href="ourservices.html" class="text-lg font-semibold hover:text-primary transition-colors py-2">Services</a>
                            <a href="aboutus.html" class="text-lg font-semibold hover:text-primary transition-colors py-2">À propos</a>
                            <a href="careers.html" class="text-lg font-semibold hover:text-primary transition-colors py-2">Carrières</a>
                            <a href="contactus.html" class="text-lg font-semibold hover:text-primary transition-colors py-2">Contact</a>
                            <button onclick="window.location.href='contactus.html'" class="mt-4 w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                Devis Gratuit
                            </button>
                        </nav>
                    </div>
                </div>
            `;
            document.body.appendChild(mobileMenu);

            const panel = document.getElementById('mobile-menu-panel');

            // Ouvrir le menu
            mobileButton.addEventListener('click', function () {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => {
                    panel.classList.remove('translate-x-full');
                }, 10);
            });

            // Fermer le menu
            function closeMenu() {
                panel.classList.add('translate-x-full');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }

            mobileMenu.querySelector('.close-mobile-menu').addEventListener('click', closeMenu);
            mobileMenu.addEventListener('click', function (e) {
                if (e.target === mobileMenu) closeMenu();
            });

            // Fermer au clic sur un lien
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMenu);
            });
        }, 600);
    });
}

// ============================================
// BOUTON RETOUR EN HAUT
// ============================================
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.className = 'fixed bottom-8 right-8 bg-primary hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 pointer-events-none z-40';
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    document.body.appendChild(backToTop);

    // Afficher/masquer selon le scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            backToTop.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTop.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    // Scroll vers le haut au clic
    backToTop.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// LOADER POUR FORMULAIRES
// ============================================
function showFormLoader(form) {
    const loader = document.createElement('div');
    loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    loader.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4">
            <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <p class="text-lg font-semibold text-slate-900 dark:text-white">Envoi en cours...</p>
        </div>
    `;
    document.body.appendChild(loader);
    return loader;
}

function hideFormLoader(loader) {
    if (loader && loader.parentNode) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s';
        setTimeout(() => loader.remove(), 300);
    }
}

// ============================================
// MODAL POUR DÉTAILS
// ============================================
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${title}</h3>
                <button class="close-modal p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-6 text-slate-700 dark:text-slate-300">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fermer le modal
    function closeModal() {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s';
        setTimeout(() => modal.remove(), 300);
    }

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    // ESC pour fermer
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });

    return modal;
}

// ============================================
// AMÉLIORATION DES BOUTONS CTA
// ============================================
function initCTAButtons() {
    document.addEventListener('DOMContentLoaded', function () {
        // Tous les boutons "Contact", "Devis", etc.
        const ctaButtons = document.querySelectorAll('button:not([type="submit"])');

        ctaButtons.forEach(button => {
            const text = button.textContent.trim().toLowerCase();

            if (text.includes('contact') || text.includes('devis') || text.includes('gratuit')) {
                button.style.cursor = 'pointer';
                if (!button.onclick) {
                    button.addEventListener('click', function () {
                        window.location.href = 'contactus.html';
                    });
                }
            }

            if (text.includes('postuler') || text.includes('candidat')) {
                button.style.cursor = 'pointer';
                if (!button.onclick) {
                    button.addEventListener('click', function () {
                        // Scroll vers le formulaire de candidature
                        const form = document.querySelector('form');
                        if (form) {
                            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                }
            }
        });
    });
}

// ============================================
// SLIDER SIMPLE POUR TÉMOIGNAGES
// ============================================
function createTestimonialSlider(testimonials) {
    let currentIndex = 0;

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'relative overflow-hidden';
    sliderContainer.innerHTML = `
        <div class="testimonial-track flex transition-transform duration-500">
            ${testimonials.map(t => `
                <div class="testimonial-slide min-w-full flex-shrink-0 p-8">
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                ${t.initials}
                            </div>
                            <div>
                                <h4 class="font-bold text-lg text-slate-900 dark:text-white">${t.name}</h4>
                                <p class="text-sm text-slate-600 dark:text-slate-400">${t.position}</p>
                            </div>
                        </div>
                        <p class="text-slate-700 dark:text-slate-300 italic">"${t.text}"</p>
                        <div class="flex gap-1 mt-4">
                            ${Array(5).fill('⭐').join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="prev-btn absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button class="next-btn absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined">chevron_right</span>
        </button>
        <div class="flex justify-center gap-2 mt-6">
            ${testimonials.map((_, i) => `
                <button class="dot w-3 h-3 rounded-full ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}" data-index="${i}"></button>
            `).join('')}
        </div>
    `;

    const track = sliderContainer.querySelector('.testimonial-track');
    const dots = sliderContainer.querySelectorAll('.dot');

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-primary', i === currentIndex);
            dot.classList.toggle('bg-slate-300', i !== currentIndex);
            dot.classList.toggle('dark:bg-slate-600', i !== currentIndex);
        });
    }

    sliderContainer.querySelector('.prev-btn').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateSlider();
    });

    sliderContainer.querySelector('.next-btn').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateSlider();
        });
    });

    // Auto-play
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    }, 5000);

    return sliderContainer;
}

// ============================================
// AMÉLIORATION DES ANIMATIONS
// ============================================
function initEnhancedAnimations() {
    // Observer pour animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.addEventListener('DOMContentLoaded', () => {
        // Animer les sections principales
        const animatedElements = document.querySelectorAll('section, .grid > div, article');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
            observer.observe(el);
        });
    });
}

// ============================================
// CORRECTION DES FORMULAIRES
// ============================================
function enhanceFormSubmission() {
    document.addEventListener('DOMContentLoaded', function () {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function (e) {
                // Le formulaire sera géré par api-integration.js
                // On ajoute juste le loader ici
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const loader = showFormLoader(this);

                    // Attendre un peu pour la simulation si pas de backend
                    setTimeout(() => {
                        hideFormLoader(loader);
                    }, 2000);
                }
            });
        });
    });
}

// ============================================
// PAGE 404 REDIRECT
// ============================================
function init404Handler() {
    window.addEventListener('load', function () {
        // Vérifier si on est sur une page qui n'existe pas
        const path = window.location.pathname;
        const validPages = ['index.html', 'aboutus.html', 'ourservices.html', 'contactus.html', 'careers.html', 'privacy.html', 'terms.html', 'legal.html', 'admin.html', 'login.html'];

        const currentPage = path.split('/').pop();
        if (currentPage && !validPages.includes(currentPage) && currentPage.endsWith('.html')) {
            // Créer une page 404 inline
            document.body.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
                    <div class="text-center max-w-2xl">
                        <div class="text-9xl font-bold text-primary mb-4">404</div>
                        <h1 class="text-4xl font-bold text-slate-900 mb-4">Page non trouvée</h1>
                        <p class="text-lg text-slate-600 mb-8">Désolé, la page que vous recherchez n'existe pas.</p>
                        <a href="index.html" class="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            <span class="material-symbols-outlined">home</span>
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            `;
        }
    });
}

// ============================================
// INITIALISATION
// ============================================
initImprovedMobileMenu();
initBackToTop();
initCTAButtons();
initEnhancedAnimations();
enhanceFormSubmission();
init404Handler();

// Export des fonctions utiles
window.ALTIMANCE_ENHANCED = {
    createModal,
    createTestimonialSlider,
    showFormLoader,
    hideFormLoader
};
