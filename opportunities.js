/**
 * ALTIMANCE - Script d'affichage des opportunités dynamiques
 */

document.addEventListener('DOMContentLoaded', loadPublicOpportunities);

async function loadPublicOpportunities() {
    const container = document.getElementById('jobs-container');
    if (!container) return; // Pas sur la page carrières

    try {
        const response = await fetch('/api/opportunities?published=true');
        const data = await response.json();

        if (!data.opportunities || data.opportunities.length === 0) {
            container.innerHTML = `
                <div class="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">search_off</span>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune offre pour le moment</h3>
                    <p class="text-slate-600 dark:text-slate-400">Revenez bientôt ou envoyez une candidature spontanée !</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.opportunities.map(job => `
            <div class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                            ${escapeHtml(job.contract_type)}
                        </span>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">${escapeHtml(job.title)}</h3>
                    </div>
                    <span class="text-slate-500 text-sm flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">location_on</span>
                        ${escapeHtml(job.location)}
                    </span>
                </div>
                
                <p class="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3">
                    ${escapeHtml(job.description)}
                </p>

                <div class="flex items-center justify-between mt-auto">
                    ${job.salary_range ? `
                        <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            ${escapeHtml(job.salary_range)}
                        </div>
                    ` : '<div></div>'}
                    
                    <button onclick="applyToJob('${escapeHtml(job.title.replace(/'/g, "\\'"))}')" class="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                        Postuler
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>

                <!-- Hidden details for modal -->
                <div id="job-details-${job.id}" class="hidden">
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">Description du poste</h4>
                            <p>${escapeHtml(job.description).replace(/\n/g, '<br>')}</p>
                        </div>
                        ${job.requirements ? `
                            <div>
                                <h4 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">Prérequis</h4>
                                <p>${escapeHtml(job.requirements).replace(/\n/g, '<br>')}</p>
                            </div>
                        ` : ''}
                        <div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                            <button onclick="scrollToApplication('${escapeHtml(job.title.replace(/'/g, "\\'"))}')" class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                Postuler maintenant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Ajout d'écouteurs pour les boutons "Voir détails" si on voulait un modal
        // Pour l'instant on scroll direct au form
    } catch (error) {
        console.error('Erreur chargement opportunités:', error);
    }
}

// Fonction pour défiler vers le formulaire et pré-remplir le poste
function applyToJob(jobTitle) {
    const form = document.getElementById('application-form');
    const positionInput = document.querySelector('input[name="position"]') || document.getElementById('position');

    if (positionInput) {
        positionInput.value = jobTitle;
        // Effet visuel
        positionInput.classList.add('ring-2', 'ring-primary');
        setTimeout(() => positionInput.classList.remove('ring-2', 'ring-primary'), 2000);
    }

    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Utilitaire d'échappement XSS simple (déjà présent dans admin.js mais répété ici pour indépendance)
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
