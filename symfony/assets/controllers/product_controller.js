import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['form', 'list', 'modal'];
    static values = {
        url: String
    }

    async submitForm(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Recharger la page pour voir les changements
                window.location.reload();
            } else {
                console.error('Erreur lors de la soumission');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    closeModal() {
        // Fermer le modal après soumission
        const modal = this.element.querySelector('.modal.show');
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }

    // Réinitialiser le formulaire quand le modal est fermé
    resetForm(event) {
        const modal = event.target;
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
} 