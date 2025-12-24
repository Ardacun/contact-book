// Configuration de l'URL de l'API json-server
const API_URL = 'http://localhost:3000/contacts';

// État global de l'application
let state = {
    contacts: [],      // Liste des contacts chargés depuis le serveur
    showModal: false,  // État d'affichage de la modal (true = visible, false = cachée)
    loading: false     // Indicateur de chargement pour éviter les requêtes multiples
};

// Sélecteurs DOM - Référence tous les éléments HTML utilisés dans le script
const elements = {
    // Boutons
    btnAdd: document.getElementById('btnAdd'),       // Bouton "+" pour ouvrir la modal
    btnClose: document.getElementById('btnClose'),   // Bouton "×" pour fermer la modal
    btnSubmit: document.getElementById('btnSubmit'), // Bouton "Valider" du formulaire
    
    // Overlay de la modal
    modalOverlay: document.getElementById('modalOverlay'), // Fond sombre de la modal
    
    // Formulaire de la modal
    contactForm: document.getElementById('contactForm'), // Formulaire d'ajout de contact
    
    // Conteneur de la table des contacts
    tableBody: document.getElementById('contactsTableBody'), // Corps du tableau (<tbody>)
    
    // Champs de saisie du formulaire
    inputs: {
        nom: document.getElementById('nom'),
        prenom: document.getElementById('prenom'),
        email: document.getElementById('email'),
        telephone: document.getElementById('telephone')
    }
};

// === FONCTIONS API ===

/**
 * Récupère tous les contacts depuis le serveur json-server
 * Effectue une requête GET vers l'API et met à jour l'état et l'affichage
 */
const fetchContacts = async () => {
    try {
        state.loading = true; // Active l'indicateur de chargement
        
        // Effectue une requête GET vers l'API
        const response = await fetch(API_URL);
        
        // Vérifie si la requête a réussi
        if (!response.ok) throw new Error('Erreur lors du chargement des contacts');
        
        // Convertit la réponse JSON en objet JavaScript
        const contacts = await response.json();
        
        // Met à jour l'état avec les contacts récupérés
        state.contacts = contacts;
        
        // Affiche les contacts dans le tableau
        renderContacts(state.contacts);
        
    } catch (error) {
        // En cas d'erreur, affiche un message dans la console
        console.error('Erreur:', error);
        // Informe l'utilisateur que le chargement a échoué
        alert('Impossible de charger les contacts. Vérifiez que json-server est lancé.');
    } finally {
        // Désactive l'indicateur de chargement dans tous les cas
        state.loading = false;
    }
};

/**
 * Ajoute un nouveau contact sur le serveur
 */
const postContact = async (contactData) => {
    try {
        // Effectue une requête POST vers l'API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indique qu'on envoie du JSON
            },
            body: JSON.stringify(contactData) // Convertit l'objet en JSON
        });
        
        // Vérifie si la requête a réussi
        if (!response.ok) throw new Error('Erreur lors de l\'ajout du contact');
        
        // Récupère le contact créé avec son ID généré par json-server
        const newContact = await response.json();
        
        return newContact;
        
    } catch (error) {
        // En cas d'erreur, affiche un message dans la console
        console.error('Erreur:', error);
        // Informe l'utilisateur que l'ajout a échoué
        alert('Impossible d\'ajouter le contact');
        throw error; // Relance l'erreur pour la gérer dans handleSubmit
    }
};

// === FONCTIONS UTILITAIRES ===

/**
 * Récupère les valeurs actuelles des champs du formulaire
 */
const getFormData = () => ({
    nom: elements.inputs.nom.value.trim(),           // trim() supprime les espaces en début/fin
    prenom: elements.inputs.prenom.value.trim(),
    email: elements.inputs.email.value.trim(),
    telephone: elements.inputs.telephone.value.trim()
});

/**
 * Réinitialise le formulaire à son état initial
 * Vide tous les champs et retire les classes d'erreur
 */
const clearForm = () => {
    elements.contactForm.reset(); // Vide tous les champs du formulaire
    
    // Retire la classe 'error' de tous les champs
    Object.values(elements.inputs).forEach(input => {
        input.classList.remove('error');
    });
    
    // Désactive le bouton "Valider" (sera réactivé quand le formulaire sera valide)
    elements.btnSubmit.disabled = true;
};

/**
 * Génère le HTML pour afficher une ligne de contact dans le tableau
 */
const renderContact = (contact) => `
    <tr data-id="${contact.id}">
        <td>${contact.nom}</td>
        <td>${contact.prenom}</td>
        <td><a href="mailto:${contact.email}" class="email-link">${contact.email}</a></td>
        <td>${contact.telephone}</td>
    </tr>
`;

/**
 * Met à jour l'affichage du tableau avec tous les contacts
 */
const renderContacts = (contacts) => {
    // Si aucun contact, affiche un message
    if (contacts.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #666;">
                    Aucun contact à afficher
                </td>
            </tr>
        `;
    } else {
        // Génère le HTML pour chaque contact et les assemble
        elements.tableBody.innerHTML = contacts.map(renderContact).join('');
    }
};

// === GESTION DE LA MODAL ===

/**
 * Ouvre la modal d'ajout de contact
 * Met à jour l'état, affiche la modal et réinitialise le formulaire
 */
const openModal = () => {
    state.showModal = true; // Met à jour l'état
    elements.modalOverlay.classList.add('active'); // Affiche la modal via CSS
    clearForm(); // Réinitialise le formulaire
};

/**
 * Ferme la modal d'ajout de contact
 * Met à jour l'état, cache la modal et réinitialise le formulaire
 */
const closeModal = () => {
    state.showModal = false; // Met à jour l'état
    elements.modalOverlay.classList.remove('active'); // Cache la modal via CSS
    clearForm(); // Réinitialise le formulaire
};

// === GESTIONNAIRES D'ÉVÉNEMENTS ===

/**
 * Gère la soumission du formulaire d'ajout de contact
 * @param {Event} e - Événement de soumission du formulaire
 */
const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    // Si un chargement est en cours, on ignore la soumission
    if (state.loading) return;
    
    // Récupère les données du formulaire
    const formData = getFormData();
    
    // Validation côté client (double vérification)
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
        alert('Tous les champs sont obligatoires');
        return;
    }
    
    try {
        // Désactive le bouton pendant l'envoi pour éviter les doubles soumissions
        elements.btnSubmit.disabled = true;
        elements.btnSubmit.textContent = 'Envoi...'; // Indication visuelle du chargement
        
        // Envoie le contact au serveur json-server
        const newContact = await postContact(formData);
        
        // Ajoute le nouveau contact à l'état local (sans modifier le tableau original)
        state.contacts = [...state.contacts, newContact];
        
        // Met à jour l'affichage du tableau
        renderContacts(state.contacts);
        
        // Ferme la modal après un ajout réussi
        closeModal();
        
    } catch (error) {
        // En cas d'erreur, réactive le bouton pour permettre une nouvelle tentative
        elements.btnSubmit.disabled = false;
        elements.btnSubmit.textContent = 'Valider';
    }
};

// === ÉCOUTEURS D'ÉVÉNEMENTS ===

// Ouvre la modal quand on clique sur le bouton "+"
elements.btnAdd.addEventListener('click', openModal);

// Ferme la modal quand on clique sur le bouton "×"
elements.btnClose.addEventListener('click', closeModal);

// Ferme la modal quand on clique sur l'overlay (fond sombre)
elements.modalOverlay.addEventListener('click', (e) => {
    // Vérifie que le clic est bien sur l'overlay et non sur la modal elle-même
    if (e.target === elements.modalOverlay) closeModal();
});

// Gère la soumission du formulaire
elements.contactForm.addEventListener('submit', handleSubmit);

// Retire la classe 'error' d'un champ quand l'utilisateur commence à taper
Object.values(elements.inputs).forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Active/désactive le bouton "Valider" en fonction de la validité du formulaire
elements.contactForm.addEventListener('input', () => {
    // checkValidity() vérifie automatiquement tous les attributs HTML5 (required, type="email", etc.)
    elements.btnSubmit.disabled = !elements.contactForm.checkValidity();
    // Remet le texte du bouton à "Valider" si on modifie le formulaire après une erreur
    elements.btnSubmit.textContent = 'Valider';
});

// === INITIALISATION ===

// Charge tous les contacts depuis le serveur au démarrage de l'application
fetchContacts();