/**
 * ALTIMANCE - Main JavaScript Utilities
 * Gestion des fonctionnalités interactives du site
 */

// ============================================
// Menu Mobile Toggle
// ============================================
function initMobileMenu() {
    document.addEventListener('DOMContentLoaded', function () {
        // Attendre que la navbar soit chargée
        setTimeout(function () {
            const mobileMenuButton = document.querySelector('header button.md\\:hidden, .md\\:hidden button');
            const nav = document.querySelector('nav');

            if (mobileMenuButton && nav) {
                // Créer le menu mobile
                const mobileMenu = document.createElement('div');
                mobileMenu.className = 'hidden md:hidden absolute top-full left-0 right-0 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 shadow-lg';
                mobileMenu.id = 'mobile-menu';

                // Cloner les liens de navigation
                const navLinks = nav.cloneNode(true);
                navLinks.className = 'flex flex-col gap-4 p-6';
                navLinks.querySelectorAll('a').forEach(link => {
                    link.className = 'text-base font-semibold hover:text-primary transition-colors py-2';
                });

                mobileMenu.appendChild(navLinks);

                // Ajouter le bouton CTA
                const ctaButton = document.querySelector('header button.bg-primary');
                if (ctaButton) {
                    const mobileCtaButton = ctaButton.cloneNode(true);
                    mobileCtaButton.className = 'w-full flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold shadow-sm mt-4';
                    mobileMenu.appendChild(mobileCtaButton);
                }

                // Insérer le menu mobile après le header
                const header = document.querySelector('header');
                if (header) {
                    header.style.position = 'relative';
                    header.appendChild(mobileMenu);
                }

                // Toggle du menu mobile
                mobileMenuButton.addEventListener('click', function () {
                    const isHidden = mobileMenu.classList.contains('hidden');
                    mobileMenu.classList.toggle('hidden');

                    // Animer l'icône
                    const icon = this.querySelector('.material-symbols-outlined');
                    if (icon) {
                        icon.textContent = isHidden ? 'close' : 'menu';
                    }
                });

                // Fermer le menu quand on clique sur un lien
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', function () {
                        mobileMenu.classList.add('hidden');
                        const icon = mobileMenuButton.querySelector('.material-symbols-outlined');
                        if (icon) icon.textContent = 'menu';
                    });
                });
            }
        }, 500); // Attendre que components.js charge la navbar
    });
}

// ============================================
// Form Validation
// ============================================
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        // Retirer les messages d'erreur précédents
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) existingError.remove();
        input.classList.remove('border-red-500');

        // Validation
        if (!input.value.trim()) {
            isValid = false;
            showError(input, 'Ce champ est requis');
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            isValid = false;
            showError(input, 'Email invalide');
        } else if (input.type === 'tel' && !isValidPhone(input.value)) {
            isValid = false;
            showError(input, 'Numéro de téléphone invalide');
        }
    });

    return isValid;
}

function showError(input, message) {
    input.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{10,}$/.test(phone);
}

// ============================================
// Contact Form Handler
// ============================================
function initContactForms() {
    document.addEventListener('DOMContentLoaded', function () {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                if (validateForm(this)) {
                    // Afficher un message de succès
                    showSuccessMessage(this);

                    // Réinitialiser le formulaire après 2 secondes
                    setTimeout(() => {
                        this.reset();
                    }, 2000);
                }
            });
        });
    });
}

function showSuccessMessage(form) {
    // Créer le message de succès
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in';
    successDiv.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span class="font-semibold">Message envoyé avec succès !</span>
    `;

    document.body.appendChild(successDiv);

    // Retirer après 5 secondes
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer les éléments animables
    document.addEventListener('DOMContentLoaded', function () {
        const animatedElements = document.querySelectorAll('.grid > div, section > div, .flex.flex-col.gap-4');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    });
}

// ============================================
// Dark Mode Toggle
// ============================================
function initDarkMode() {
    // Vérifier la préférence sauvegardée
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }

    // Créer le bouton de toggle (à ajouter dans la navbar)
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            const nav = document.querySelector('header nav');
            if (nav) {
                const darkModeButton = document.createElement('button');
                darkModeButton.className = 'p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
                darkModeButton.innerHTML = '<span class="material-symbols-outlined text-slate-900 dark:text-white">dark_mode</span>';
                darkModeButton.setAttribute('aria-label', 'Toggle dark mode');

                darkModeButton.addEventListener('click', function () {
                    document.documentElement.classList.toggle('dark');
                    const isDark = document.documentElement.classList.contains('dark');
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                    this.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
                });

                nav.appendChild(darkModeButton);
            }
        }, 600);
    });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    });
}

// ============================================
// Add Custom CSS for Animations
// ============================================
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
        }
        
        @keyframes slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .animate-slide-in {
            animation: slide-in 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Initialize All
// ============================================
addCustomStyles();
initMobileMenu();
initContactForms();
initScrollAnimations();
initDarkMode();
initSmoothScroll();

// Export pour utilisation dans d'autres fichiers
window.ALTIMANCE = {
    validateForm,
    showSuccessMessage
};
