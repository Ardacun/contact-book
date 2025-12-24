// État de l'application (approche fonctionnelle)
// L'état global de l'application contient toutes les données nécessaires
// Approche fonctionnelle : l'état est centralisé et modifié de manière immutable
let state = {
    // Liste des contacts avec un contact par défaut
    contacts: [
        { id: 1, nom: 'Aubert', prenom: 'Jean-Luc', email: 'jean-luc.aubert@aelion.fr', telephone: '0123456789' }
    ],
    // État d'affichage de la modal (true = visible, false = cachée)
    showModal: false
};

// Sélecteurs DOM
// Récupération et stockage de toutes les références aux éléments HTML
// Cela permet d'éviter de rechercher les éléments à chaque fois dans le DOM
const elements = {
    btnAdd: document.getElementById('btnAdd'),
    btnClose: document.getElementById('btnClose'),
    btnSubmit: document.getElementById('btnSubmit'),
    modalOverlay: document.getElementById('modalOverlay'),
    contactForm: document.getElementById('contactForm'),
    tableBody: document.getElementById('contactsTableBody'),
    inputs: {
        nom: document.getElementById('nom'),
        prenom: document.getElementById('prenom'),
        email: document.getElementById('email'),
        telephone: document.getElementById('telephone')
    }
};

// Fonctions pures
const createContact = (formData) => ({
    id: Date.now(),
    ...formData
});

const addContact = (contacts, newContact) => [...contacts, newContact];

const validateForm = (formData) => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = true;
    if (!formData.prenom.trim()) errors.prenom = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.telephone.trim()) errors.telephone = true;
    return { isValid: Object.keys(errors).length === 0, errors };
};

const getFormData = () => ({
    nom: elements.inputs.nom.value,
    prenom: elements.inputs.prenom.value,
    email: elements.inputs.email.value,
    telephone: elements.inputs.telephone.value
});

// Fonctions de rendu
const renderContact = (contact) => `
    <tr>
        <td>${contact.nom}</td>
        <td>${contact.prenom}</td>
        <td><a href="mailto:${contact.email}" class="email-link">${contact.email}</a></td>
        <td>${contact.telephone}</td>
    </tr>
`;

const renderContacts = (contacts) => {
    elements.tableBody.innerHTML = contacts.map(renderContact).join('');
};

const clearForm = () => {
    elements.contactForm.reset();
    Object.values(elements.inputs).forEach(input => {
        input.classList.remove('error');
    });
};

const showErrors = (errors) => {
    Object.keys(elements.inputs).forEach(key => {
        if (errors[key]) {
            elements.inputs[key].classList.add('error');
        } else {
            elements.inputs[key].classList.remove('error');
        }
    });
};

const showTooltip = (element, message) => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

    setTimeout(() => tooltip.remove(), 2000);
};

// Gestionnaires d'événements
const openModal = () => {
    state.showModal = true;
    elements.modalOverlay.classList.add('active');
    clearForm();
};

const closeModal = () => {
    state.showModal = false;
    elements.modalOverlay.classList.remove('active');
    clearForm();
};

const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = getFormData();
    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
        showErrors(errors);
        showTooltip(elements.btnSubmit, "Tous les champs doivent être remplis !");
        return;
    }

    const newContact = createContact(formData);
    state.contacts = addContact(state.contacts, newContact);
    
    renderContacts(state.contacts);
    closeModal();
};

// Écouteurs d'événements
elements.btnAdd.addEventListener('click', openModal);
elements.btnClose.addEventListener('click', closeModal);
elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) closeModal();
});
elements.contactForm.addEventListener('submit', handleSubmit);

// Retirer l'erreur lors de la saisie
Object.values(elements.inputs).forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Initialisation
renderContacts(state.contacts);