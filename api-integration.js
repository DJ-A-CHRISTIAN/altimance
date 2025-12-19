/**
 * ALTIMANCE - API Integration
 * Connecte les formulaires frontend au backend
 */

const API_URL = 'http://localhost:3000/api';

// Amélioration de la fonction validateForm existante
const originalValidateForm = window.ALTIMANCE?.validateForm;
const originalShowSuccessMessage = window.ALTIMANCE?.showSuccessMessage;

// Intégration du formulaire de contact
function initContactAPI() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // Retirer les anciens listeners
    const newForm = contactForm.cloneNode(true);
    contactForm.parentNode.replaceChild(newForm, contactForm);

    newForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Valider le formulaire
        if (originalValidateForm && !originalValidateForm(this)) {
            return;
        }

        // Récupérer les données via les IDs
        const formData = {
            full_name: document.getElementById('contact-name')?.value,
            email: document.getElementById('contact-email')?.value,
            company: document.getElementById('contact-company')?.value || '',
            subject: document.getElementById('contact-subject')?.value || '',
            message: document.getElementById('contact-message')?.value
        };

        try {
            const response = await fetch(`${API_URL}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Afficher le message de succès
                if (originalShowSuccessMessage) {
                    originalShowSuccessMessage(this);
                } else {
                    showSuccessNotification('Message envoyé avec succès !');
                }

                // Réinitialiser le formulaire
                setTimeout(() => {
                    this.reset();
                }, 1500);
            } else {
                showErrorNotification(result.error || 'Erreur lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showErrorNotification('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        }
    });
}

// Intégration du formulaire de candidature
function initCareersAPI() {
    const careersForm = document.getElementById('application-form');
    if (!careersForm) return;

    // Retirer l'ancien listener
    const newForm = careersForm.cloneNode(true);
    careersForm.parentNode.replaceChild(newForm, careersForm);

    newForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Récupérer les données via FormData pour gérer l'upload de fichier
        const formData = new FormData();

        formData.append('first_name', document.getElementById('applicant-firstname')?.value);
        formData.append('last_name', document.getElementById('applicant-lastname')?.value);
        formData.append('email', document.getElementById('applicant-email')?.value);
        formData.append('phone', document.getElementById('applicant-phone')?.value || '');
        formData.append('position', document.getElementById('position')?.value || '');
        formData.append('message', document.getElementById('applicant-message')?.value || '');

        // Ajouter le fichier CV s'il est présent
        const fileInput = this.querySelector('input[type="file"]');
        if (fileInput && fileInput.files[0]) {
            formData.append('cv', fileInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                // Ne pas définir Content-Type manuellement avec FormData, le navigateur le fait
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccessNotification('Candidature envoyée avec succès ! Nous vous contacterons bientôt.');

                setTimeout(() => {
                    this.reset();
                }, 1500);
            } else {
                showErrorNotification(result.error || 'Erreur lors de l\'envoi de la candidature');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showErrorNotification('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        }
    });
}

// Afficher une notification de succès
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in';
    notification.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Afficher une notification d'erreur
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in';
    notification.innerHTML = `
        <span class="material-symbols-outlined">error</span>
        <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initContactAPI();
    initCareersAPI();
});
