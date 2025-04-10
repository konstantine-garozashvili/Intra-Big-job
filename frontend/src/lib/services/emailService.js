import { init, send } from '@emailjs/browser';

/**
 * Service pour l'envoi d'emails via EmailJS
 */
class EmailService {
    constructor() {
        this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        
        // Initialiser EmailJS avec la clé publique
        init(this.publicKey);
        
        // Log uniquement en développement
        if (import.meta.env.DEV) {
            console.log('EmailService initialisé avec serviceId:', this.serviceId);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     * @param {Object} data - Données pour l'email
     * @param {string} data.email - Email du destinataire
     * @param {string} data.token - Token de réinitialisation
     * @returns {Promise} - Promesse résolue avec la réponse d'EmailJS
     */
    async sendPasswordResetEmail(data) {
        const templateId = import.meta.env.VITE_EMAILJS_RESET_PASSWORD_TEMPLATE_ID;
        
        // Préparer les paramètres du template
        const templateParams = {
            to_name: data.email.split('@')[0], // Nom d'utilisateur extrait de l'email
            reset_url: `${window.location.origin}/reset-password/${data.token}`, // Lien de réinitialisation
            to_email: data.email, // Champ pour le destinataire (IMPORTANT: doit correspondre au paramètre utilisé dans le template EmailJS)
            recipient: data.email, // Ajout d'un champ alternatif au cas où le template utilise un nom différent
            user_email: data.email, // Autre alternative
            email: data.email, // Maintenu pour compatibilité
            expires_in: "30", // Durée de validité en minutes
        };
        
        if (import.meta.env.DEV) {
            console.log('Envoi d\'email de réinitialisation à:', data.email);
            console.log('Utilisation du service:', this.serviceId);
            console.log('Utilisation du template:', templateId);
            console.log('Paramètres du template:', templateParams);
        }
        
        try {
            const response = await send(
                this.serviceId,
                templateId,
                templateParams,
                this.publicKey
            );
            
            if (import.meta.env.DEV) {
                console.log('Email de réinitialisation envoyé avec succès');
                console.log('Réponse EmailJS:', response);
            }
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
            throw error;
        }
    }

    /**
     * Envoie un email de bienvenue après l'inscription d'un utilisateur
     * @param {Object} data - Données pour l'email
     * @param {string} data.email - Email du destinataire
     * @param {string} data.firstName - Prénom de l'utilisateur
     * @param {string} data.lastName - Nom de l'utilisateur
     * @param {string} data.birthDate - Date de naissance (optionnel)
     * @param {string} data.nationality - Nationalité (optionnel)
     * @param {string} data.phoneNumber - Numéro de téléphone (optionnel)
     * @param {Object} data.address - Informations d'adresse (optionnel)
     * @returns {Promise} - Promesse résolue avec la réponse d'EmailJS
     */
    async sendWelcomeEmail(data) {
        // Utiliser le template ID spécifique pour l'email de bienvenue
        const templateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
        
        if (import.meta.env.DEV) {
            console.log('Envoi d\'email de bienvenue à:', data.email);
            console.log('Utilisation du service:', this.serviceId);
            console.log('Utilisation du template:', templateId);
        }
        
        // Formatage de la date de naissance si elle existe
        let formattedBirthDate = '';
        if (data.birthDate) {
            // Si c'est déjà un objet Date
            if (data.birthDate instanceof Date) {
                formattedBirthDate = data.birthDate.toLocaleDateString('fr-FR');
            } 
            // Si c'est une chaîne au format ISO
            else if (typeof data.birthDate === 'string') {
                formattedBirthDate = new Date(data.birthDate).toLocaleDateString('fr-FR');
            }
        }
        
        // Préparer les paramètres du template avec toutes les informations d'inscription
        const templateParams = {
            // Informations de base
            to_name: data.firstName || data.email.split('@')[0],
            full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            to_email: data.email,
            email: data.email,
            login_url: `${window.location.origin}/login`,
            subject: 'Bienvenue sur notre plateforme !',
            
            // Partie 2 : Informations personnelles
            birth_date: formattedBirthDate || 'Non renseignée',
            nationality: data.nationality || 'Non renseignée',
            phone_number: data.phoneNumber || 'Non renseigné',
            
            // Partie 3 : Informations d'adresse
            address: data.address?.name || 'Non renseignée',
            address_complement: data.address?.complement || '',
            postal_code: data.address?.postalCode || 'Non renseigné',
            city: data.address?.city || 'Non renseignée'
        };
        
        try {
            const response = await send(
                this.serviceId,
                templateId,
                templateParams,
                this.publicKey
            );
            
            if (import.meta.env.DEV) {
                console.log('Email de bienvenue envoyé avec succès');
            }
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
            throw error;
        }
    }
}

export default new EmailService();
