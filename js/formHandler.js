let state = {
    // Liste des contacts avec un contact par défaut
    contacts: [
        { id: 1, nom: 'Aubert', prenom: 'Jean-Luc', email: 'jean-luc.aubert@aelion.fr', telephone: '0123456789' }
    ],
    // État d'affichage de la modal (true = visible, false = cachée)
    showModal: false
};

// Sélecteurs DOM
const elements = {

    // Boutons
    btnAdd: document.getElementById('btnAdd'),
    btnClose: document.getElementById('btnClose'),
    btnSubmit: document.getElementById('btnSubmit'),
    
    // Overlay de la modal
    modalOverlay: document.getElementById('modalOverlay'),
    
    // Formulaire de la modal
    contactForm: document.getElementById('contactForm'),
    
    // Conteneur de la table des contacts
    tableBody: document.getElementById('contactsTableBody'),
    
    // Champs de saisie du formulaire de la modal
    inputs: {
        nom: document.getElementById('nom'),
        prenom: document.getElementById('prenom'),
        email: document.getElementById('email'),
        telephone: document.getElementById('telephone')
    }
};

// Créer un nouvel objet contact à partir des données saisies dans le formulaire
const createContact = (formData) => ({
    id: Date.now(), // Utiliser Date.now() pour générer un identifiant unique
    ...formData // Copie toutes les propriétés de formData dans le nouvel objet (spread operator)
});

// Ajoute un contact à la liste des contacts
const addContact = (contacts, newContact) => [...contacts, newContact];

// Vérifie si les données saisies dans le formulaire sont valides
const validateForm = (formData) => {
    // Crée un objet vide pour stocker les erreurs
    const errors = {};

    // Vérifie que chaque champ n'est pas vide (après suppression des espaces)
    if (!formData.nom.trim()) errors.nom = true;
    if (!formData.prenom.trim()) errors.prenom = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.telephone.trim()) errors.telephone = true;

    // Vérifie que chaque champ n'est pas vide (après suppression des espaces)
    return { isValid: Object.keys(errors).length === 0, errors };
};

// Récupère les valeurs actuelles des champs du formulaire
const getFormData = () => ({
    nom: elements.inputs.nom.value,
    prenom: elements.inputs.prenom.value,
    email: elements.inputs.email.value,
    telephone: elements.inputs.telephone.value
});

// Génère le HTML pour afficher une ligne de contact dans le tableau
const renderContact = (contact) => `
    <tr>
        <td>${contact.nom}</td>
        <td>${contact.prenom}</td>
        <td><a href="mailto:${contact.email}" class="email-link">${contact.email}</a></td>
        <td>${contact.telephone}</td>
    </tr>
`;

// Met à jour l'affichage du tableau avec tous les contacts
const renderContacts = (contacts) => {
    elements.tableBody.innerHTML = contacts.map(renderContact).join('');
};

// Réinitialise le formulaire et retire toutes les classes d'erreur
const clearForm = () => {
    // Réinitialise tous les champs du formulaire
    elements.contactForm.reset();

    // Parcourt tous les inputs et retire la classe 'error'
    Object.values(elements.inputs).forEach(input => {
        input.classList.remove('error');
    });
};

// Affiche les erreurs dans les champs du formulaire
const showErrors = (errors) => {
    // Parcourt tous les champs
    Object.keys(elements.inputs).forEach(key => {
        if (errors[key]) { // Si le champ a une erreur, ajoute la classe CSS 'error'
            elements.inputs[key].classList.add('error');
        } else { // Sinon, retire la classe 'error'
            elements.inputs[key].classList.remove('error');
        }
    });
};

// Affiche un tooltip temporaire près d'un élément
const showTooltip = (element, message) => {
    // Crée un nouvel élément div pour le tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    // Calcule la position du tooltip pour qu'il soit centré au-dessus de l'élément
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

    // Supprime automatiquement le tooltip après 2 secondes
    setTimeout(() => tooltip.remove(), 2000);
};

// Gestionnaires d'événements
const openModal = () => {
    state.showModal = true; // Met à jour l'état
    elements.modalOverlay.classList.add('active'); // Affiche la modal via CSS
    clearForm(); // Réinitialise le formulaire
};

// Ferme la modal d'ajout de contact
const closeModal = () => {
    state.showModal = false; // Met à jour l'état
    elements.modalOverlay.classList.remove('active'); // Cache la modal via CSS
    clearForm(); // Réinitialise le formulaire
};

// Gère la soumission du formulaire d'ajout de contact
const handleSubmit = (e) => {
    e.preventDefault();
    
    // Récupère les données saisies dans le formulaire
    const formData = getFormData();

    // Vérifie que les données saisies sont valides
    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
        showErrors(errors);
        showTooltip(elements.btnSubmit, "Tous les champs doivent être remplis !");
        return;
    }

    // Crée un nouveau contact à partir des données saisies
    const newContact = createContact(formData);
    state.contacts = addContact(state.contacts, newContact);
    
    // Met à jour l'affichage du tableau avec les nouveaux contacts
    renderContacts(state.contacts);

    // Ferme la modal
    closeModal();
};

// Écouteurs d'événements
elements.btnAdd.addEventListener('click', openModal); // Ouvre la modal quand on clique sur le bouton "+"
elements.btnClose.addEventListener('click', closeModal); // Ferme la modal quand on clique sur le bouton "×"

// Ferme la modal quand on clique sur l'overlay (fond sombre)
elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) closeModal();
});

// Gère la soumission du formulaire d'ajout de contact
elements.contactForm.addEventListener('submit', handleSubmit);

// Retirer l'erreur lors de la saisie
Object.values(elements.inputs).forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Affiche les contacts initiaux au chargement de la page
renderContacts(state.contacts);