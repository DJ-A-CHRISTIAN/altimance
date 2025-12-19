/**
 * ALTIMANCE - Admin Dashboard JavaScript
 * Gestion du tableau de bord d'administration
 */

const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let contactsChart = null;
let applicationsChart = null;

// Vérifier l'authentification
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }

    currentUser = JSON.parse(user);
    document.getElementById('user-name').textContent = currentUser.username;
    return true;
}

// Déconnexion
function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
}

// Effectuer une requête API avec authentification
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        showNotification('Erreur de connexion au serveur', 'error');
        return null;
    }
}

// Afficher une notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold animate-slide-in`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Navigation entre sections
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // Afficher la section demandée
    document.getElementById(`section-${sectionName}`).classList.remove('hidden');

    // Mettre à jour le menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'bg-primary', 'text-white');
        item.classList.add('text-slate-600', 'hover:bg-slate-100');
    });

    event.target.closest('.nav-item').classList.add('active', 'bg-primary', 'text-white');
    event.target.closest('.nav-item').classList.remove('text-slate-600', 'hover:bg-slate-100');

    // Charger les données de la section
    if (sectionName === 'contacts') {
        loadContacts();
    } else if (sectionName === 'applications') {
        loadApplications();
    } else if (sectionName === 'opportunities') {
        loadOpportunities();
    }
}

// Charger les statistiques
async function loadStats() {
    const stats = await apiRequest('/stats');

    if (stats) {
        document.getElementById('stat-total-contacts').textContent = stats.totalContacts || 0;
        document.getElementById('stat-total-apps').textContent = stats.totalApplications || 0;
        document.getElementById('stat-recent').textContent = stats.recentContacts || 0;

        // Calculer le nombre en attente
        const pending = (stats.contactsByStatus?.find(s => s.status === 'nouveau')?.count || 0) +
            (stats.applicationsByStatus?.find(s => s.status === 'en_attente')?.count || 0);
        document.getElementById('stat-pending').textContent = pending;

        // Mettre à jour les badges
        const nouveauxContacts = stats.contactsByStatus?.find(s => s.status === 'nouveau')?.count || 0;
        if (nouveauxContacts > 0) {
            document.getElementById('contacts-badge').textContent = nouveauxContacts;
            document.getElementById('contacts-badge').classList.remove('hidden');
        }

        const appsPending = stats.applicationsByStatus?.find(s => s.status === 'en_attente')?.count || 0;
        if (appsPending > 0) {
            document.getElementById('apps-badge').textContent = appsPending;
            document.getElementById('apps-badge').classList.remove('hidden');
        }

        // Créer les graphiques
        createCharts(stats);
    }
}

// Créer les graphiques
function createCharts(stats) {
    // Graphique des contacts
    const contactsCtx = document.getElementById('contactsChart');
    if (contactsChart) contactsChart.destroy();

    const contactsData = {
        nouveau: 0,
        en_cours: 0,
        traite: 0
    };

    stats.contactsByStatus?.forEach(item => {
        contactsData[item.status] = item.count;
    });

    contactsChart = new Chart(contactsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Nouveau', 'En cours', 'Traité'],
            datasets: [{
                data: [contactsData.nouveau, contactsData.en_cours, contactsData.traite],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Graphique des candidatures
    const appsCtx = document.getElementById('applicationsChart');
    if (applicationsChart) applicationsChart.destroy();

    const appsData = {
        en_attente: 0,
        accepte: 0,
        refuse: 0
    };

    stats.applicationsByStatus?.forEach(item => {
        appsData[item.status] = item.count;
    });

    applicationsChart = new Chart(appsCtx, {
        type: 'doughnut',
        data: {
            labels: ['En attente', 'Accepté', 'Refusé'],
            datasets: [{
                data: [appsData.en_attente, appsData.accepte, appsData.refuse],
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Charger les contacts
async function loadContacts() {
    const data = await apiRequest('/contacts');

    if (data && data.contacts) {
        const tbody = document.getElementById('contacts-table');

        if (data.contacts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                        <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p>Aucun message pour le moment</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.contacts.map(contact => `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 text-sm text-slate-600">${formatDate(contact.created_at)}</td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-900">${escapeHtml(contact.full_name)}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(contact.email)}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(contact.company || '-')}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(contact.subject || '-')}</td>
                <td class="px-6 py-4">
                    <select 
                        onchange="updateContactStatus(${contact.id}, this.value)" 
                        class="text-sm px-3 py-1 rounded-full font-semibold ${getStatusClass(contact.status)}"
                    >
                        <option value="nouveau" ${contact.status === 'nouveau' ? 'selected' : ''}>Nouveau</option>
                        <option value="en_cours" ${contact.status === 'en_cours' ? 'selected' : ''}>En cours</option>
                        <option value="traite" ${contact.status === 'traite' ? 'selected' : ''}>Traité</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="viewContact(${contact.id}, '${escapeHtml(contact.full_name)}', '${escapeHtml(contact.message)}')" class="text-primary hover:text-blue-700">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button onclick="deleteContact(${contact.id})" class="text-red-500 hover:text-red-700">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Charger les candidatures
async function loadApplications() {
    const data = await apiRequest('/applications');

    if (data && data.applications) {
        const tbody = document.getElementById('applications-table');

        if (data.applications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                        <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p>Aucune candidature pour le moment</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.applications.map(app => `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 text-sm text-slate-600">${formatDate(app.created_at)}</td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-900">${escapeHtml(app.first_name)} ${escapeHtml(app.last_name)}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(app.email)}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(app.phone || '-')}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(app.position || 'Spontanée')}</td>
                <td class="px-6 py-4">
                    <select 
                        onchange="updateApplicationStatus(${app.id}, this.value)" 
                        class="text-sm px-3 py-1 rounded-full font-semibold ${getStatusClass(app.status)}"
                    >
                        <option value="en_attente" ${app.status === 'en_attente' ? 'selected' : ''}>En attente</option>
                        <option value="accepte" ${app.status === 'accepte' ? 'selected' : ''}>Accepté</option>
                        <option value="refuse" ${app.status === 'refuse' ? 'selected' : ''}>Refusé</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="viewApplication(${app.id}, '${escapeHtml(app.first_name)} ${escapeHtml(app.last_name)}', '${escapeHtml(app.message || '')}')" class="text-primary hover:text-blue-700" title="Voir Message">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        ${app.cv_path ? `
                        <a href="${app.cv_path}" target="_blank" class="text-green-600 hover:text-green-800" title="Télécharger CV">
                             <span class="material-symbols-outlined text-lg">download</span>
                        </a>` : ''}
                        <button onclick="deleteApplication(${app.id})" class="text-red-500 hover:text-red-700" title="Supprimer">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Mettre à jour le statut d'un contact
async function updateContactStatus(id, status) {
    const result = await apiRequest(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });

    if (result && result.success) {
        showNotification('Statut mis à jour', 'success');
        loadStats();
    }
}

// Mettre à jour le statut d'une candidature
async function updateApplicationStatus(id, status) {
    const result = await apiRequest(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });

    if (result && result.success) {
        showNotification('Statut mis à jour', 'success');
        loadStats();
    }
}

// Supprimer un contact
async function deleteContact(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    const result = await apiRequest(`/contacts/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        showNotification('Contact supprimé', 'success');
        loadContacts();
        loadStats();
    }
}

// Supprimer une candidature
async function deleteApplication(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) return;

    const result = await apiRequest(`/applications/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        showNotification('Candidature supprimée', 'success');
        loadApplications();
        loadStats();
    }
}

// Afficher le détail d'un contact
function viewContact(id, name, message) {
    showModal('Message de Contact', name, message);
}

// Afficher le détail d'une candidature
function viewApplication(id, name, message) {
    showModal('Lettre de Motivation', name, message || 'Aucun message');
}

// Afficher une modal avec le message
function showModal(title, name, message) {
    // Créer la modal si elle n'existe pas
    let modal = document.getElementById('message-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'message-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 id="modal-title" class="text-xl font-bold text-slate-900"></h3>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="px-6 py-4 overflow-y-auto flex-1">
                    <p id="modal-name" class="font-semibold text-primary mb-3"></p>
                    <div id="modal-message" class="text-slate-700 whitespace-pre-wrap"></div>
                </div>
                <div class="px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button onclick="closeModal()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Remplir le contenu
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-name').textContent = name;
    document.getElementById('modal-message').textContent = message;

    // Afficher la modal
    modal.classList.remove('hidden');
}

// Fermer la modal
function closeModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================
// GESTION OPPORTUNITÉS
// ============================================

// Charger les opportunités
async function loadOpportunities() {
    const data = await apiRequest('/opportunities');

    if (data && data.opportunities) {
        const tbody = document.getElementById('opportunities-table');

        if (data.opportunities.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                        <span class="material-symbols-outlined text-4xl mb-2">work_off</span>
                        <p>Aucune offre d'emploi créée</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.opportunities.map(opp => `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-900">${escapeHtml(opp.title)}</div>
                    <div class="text-xs text-slate-500">Créé le ${formatDate(opp.created_at)}</div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(opp.location)}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">${escapeHtml(opp.contract_type)}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">${escapeHtml(opp.salary_range || '-')}</td>
                <td class="px-6 py-4">
                    <button onclick="togglePublishOpportunity(${opp.id})" class="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${opp.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}">
                        <span class="material-symbols-outlined text-sm">${opp.is_published ? 'public' : 'public_off'}</span>
                        ${opp.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                </td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="editOpportunity(${opp.id})" class="text-primary hover:text-blue-700" title="Modifier">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onclick="deleteOpportunity(${opp.id})" class="text-red-500 hover:text-red-700" title="Supprimer">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Ouvrir le modal opportunité
function openOpportunityModal(opp = null) {
    const modal = document.getElementById('opportunity-modal');
    const form = document.getElementById('opportunity-form');
    const title = document.getElementById('modal-title');

    form.reset();

    if (opp) {
        title.textContent = 'Modifier l\'opportunité';
        document.getElementById('opp-id').value = opp.id;
        document.getElementById('opp-title').value = opp.title;
        document.getElementById('opp-location').value = opp.location;
        document.getElementById('opp-contract').value = opp.contract_type;
        document.getElementById('opp-salary').value = opp.salary_range || '';
        document.getElementById('opp-description').value = opp.description;
        document.getElementById('opp-requirements').value = opp.requirements || '';
        document.getElementById('opp-published').checked = opp.is_published === 1;
    } else {
        title.textContent = 'Nouvelle Opportunité';
        document.getElementById('opp-id').value = '';
    }

    modal.classList.remove('hidden');
}

// Fermer le modal
function closeOpportunityModal() {
    document.getElementById('opportunity-modal').classList.add('hidden');
}

// Gérer la soumission du formulaire
document.getElementById('opportunity-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('opp-id').value;
    const data = {
        title: document.getElementById('opp-title').value,
        location: document.getElementById('opp-location').value,
        contract_type: document.getElementById('opp-contract').value,
        salary_range: document.getElementById('opp-salary').value,
        description: document.getElementById('opp-description').value,
        requirements: document.getElementById('opp-requirements').value,
        is_published: document.getElementById('opp-published').checked
    };

    let result;
    if (id) {
        result = await apiRequest(`/opportunities/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    } else {
        result = await apiRequest('/opportunities', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    if (result && result.success) {
        showNotification(id ? 'Opportunité mise à jour' : 'Opportunité créée', 'success');
        closeOpportunityModal();
        loadOpportunities();
    }
});

// Éditer une opportunité
async function editOpportunity(id) {
    // Récupérer les détails (ici on les recupère depuis l'API ou on pourrait optimiser en passant l'objet)
    // Pour simplifier on va chercher l'objet dans la liste chargée si possible, sinon re-fetch
    // Ici on fait simple: on re-fetch pas, on imagine qu'on a un endpoint GET /opportunities/:id ou on filtre
    // Pour l'instant on a /api/opportunities qui retourne tout

    const data = await apiRequest('/opportunities');
    if (data && data.opportunities) {
        const opp = data.opportunities.find(o => o.id === id);
        if (opp) {
            openOpportunityModal(opp);
        }
    }
}

// Supprimer une opportunité
async function deleteOpportunity(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) return;

    const result = await apiRequest(`/opportunities/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        showNotification('Offre supprimée', 'success');
        loadOpportunities();
    }
}

// Publier/Dépublier
async function togglePublishOpportunity(id) {
    const result = await apiRequest(`/opportunities/${id}/toggle-publish`, {
        method: 'PATCH'
    });

    if (result && result.success) {
        showNotification(`Offre ${result.is_published ? 'publiée' : 'dépubliée'}`, 'success');
        loadOpportunities();
    }
}

// Utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    const classes = {
        'nouveau': 'bg-blue-100 text-blue-700',
        'en_cours': 'bg-orange-100 text-orange-700',
        'traite': 'bg-green-100 text-green-700',
        'en_attente': 'bg-orange-100 text-orange-700',
        'accepte': 'bg-green-100 text-green-700',
        'refuse': 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadStats();

        // Actualiser toutes les 30 secondes
        setInterval(() => {
            loadStats();
        }, 30000);
    }
});
