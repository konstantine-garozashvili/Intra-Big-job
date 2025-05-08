// Script pour tester l'API de traduction Google en ligne de commande

import { TranslationServiceClient } from '@google-cloud/translate';

/**
 * Script pour tester la traduction Google Cloud
 * 
 * Utilisation:
 * Dans le conteneur docker frontend: 
 * node src/test/translateTest.js "Texte à traduire" fr en
 * 
 * Arguments:
 * 1. Texte à traduire (obligatoire)
 * 2. Langue cible (par défaut: fr)
 * 3. Langue source (optionnel)
 */

async function translateText() {
  // Récupérer les arguments de la ligne de commande
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    process.exit(1);
  }

  const text = args[0];
  const targetLang = args[1] || 'fr';
  const sourceLang = args[2] || null;

  try {
    // Chemin relatif depuis le conteneur docker
    const credentialsPath = '../backend/config/google/bigproject-456311-0550e6cf975d.json';
    const projectId = 'bigproject-456311';

    // Initialiser le client
    const client = new TranslationServiceClient({
      projectId,
      keyFilename: credentialsPath,
    });

    // Préparer la requête
    const request = {
      parent: `projects/${projectId}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLang,
    };

    if (sourceLang) {
      request.sourceLanguageCode = sourceLang;
    }

    // Effectuer la traduction
    const [response] = await client.translateText(request);
    
    // Afficher le résultat
    response.translations.forEach((translation, i) => {
    });

  } catch (error) {
    process.exit(1);
  }
}

// Exécuter la fonction
translateText(); 