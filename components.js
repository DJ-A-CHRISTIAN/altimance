/**
 * ALTIMANCE - Component Loader
 * Charge automatiquement la navigation et le footer sur toutes les pages
 */

// Fonction pour charger un composant HTML
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            // Mettre à jour le lien actif dans la navigation
            if (elementId === 'navbar-container') {
                updateActiveNavLink();
            }
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de ${filePath}:`, error);
    }
}

// Fonction pour mettre à jour le lien actif dans la navigation
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Retire les classes actives
        link.classList.remove('text-primary', 'font-bold');
        link.classList.add('font-semibold');
        
        // Ajoute la classe active au lien correspondant
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('text-primary', 'font-bold');
            link.classList.remove('font-semibold');
        }
    });
}

// Charger les composants au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('navbar-container', 'navbar.html');
    loadComponent('footer-container', 'footer.html');
});
