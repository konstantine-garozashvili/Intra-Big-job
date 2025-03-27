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
        
        // Log des informations au démarrage du service
        console.log('EmailService initialisé avec:');
        console.log('Service ID:', this.serviceId);
        console.log('Public Key:', this.publicKey);
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     * @param {Object} data - Données pour l'email
     * @param {string} data.email - Email du destinataire
     * @param {string} data.token - Token de réinitialisation
     * @returns {Promise} - Promesse résolue avec la réponse d'EmailJS
     */
    async sendPasswordResetEmail(data) {
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        
        console.log('Envoi d\'email avec:');
        console.log('Service ID:', this.serviceId);
        console.log('Template ID:', templateId);
        console.log('Public Key:', this.publicKey);
        console.log('Email destinataire:', data.email);
        console.log('Token:', data.token ? data.token.substring(0, 10) + '...' : 'non défini');
        
        // Préparer les paramètres du template
        const templateParams = {
            to_name: data.email.split('@')[0], // Nom d'utilisateur extrait de l'email
            reset_url: `${window.location.origin}/reset-password/${data.token}`, // Lien de réinitialisation
            to_email: data.email, // Ajout du champ to_email pour le destinataire
            expires_in: "30", // Durée de validité en minutes
            email: data.email // Email complet (pour compatibilité)
        };
        
        console.log('Paramètres du template:', templateParams);
        
        try {
            // Utilisation directe des valeurs hardcodées pour tester
            console.log('Tentative d\'envoi avec valeurs hardcodées:');
            console.log('Service ID hardcodé: service_q5cwwom');
            console.log('Template ID hardcodé: template_evcziac');
            console.log('Public Key hardcodée: cTAnGuHvCEX3qZi8d');
            
            // Essai avec les valeurs hardcodées
            const response = await send(
                'service_q5cwwom',
                'template_evcziac',
                templateParams,
                'cTAnGuHvCEX3qZi8d'
            );
            
            console.log('Email envoyé avec succès (valeurs hardcodées):', response);
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email (valeurs hardcodées):', error);
            console.error('Message d\'erreur:', error.message);
            console.error('Détails:', error.text || 'Pas de détails supplémentaires');
            
            // Essai avec les variables d'environnement
            try {
                console.log('Tentative d\'envoi avec variables d\'environnement:');
                const response = await send(
                    this.serviceId,
                    templateId,
                    templateParams,
                    this.publicKey
                );
                
                console.log('Email envoyé avec succès (variables d\'environnement):', response);
                return response;
            } catch (envError) {
                console.error('Erreur lors de l\'envoi de l\'email (variables d\'environnement):', envError);
                console.error('Message d\'erreur:', envError.message);
                console.error('Détails:', envError.text || 'Pas de détails supplémentaires');
                throw envError;
            }
        }
    }
}

export default new EmailService();
