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
    console.error('Erreur: Veuillez fournir un texte à traduire');
    console.log('Utilisation: node translateTest.js "Texte à traduire" [langue_cible] [langue_source]');
    process.exit(1);
  }

  const text = args[0];
  const targetLang = args[1] || 'fr';
  const sourceLang = args[2] || null;

  console.log(`Texte à traduire: "${text}"`);
  console.log(`Langue cible: ${targetLang}`);
  if (sourceLang) {
    console.log(`Langue source: ${sourceLang}`);
  } else {
    console.log('Langue source: détection automatique');
  }

  try {
    // Chemin relatif depuis le conteneur docker
    const credentialsPath = '../backend/config/google/bigproject-456311-0550e6cf975d.json';
    const projectId = 'bigproject-456311';

    // Initialiser le client
    const client = new TranslationServiceClient({
      projectId,
      keyFilename: credentialsPath,
    });

    console.log('Client de traduction initialisé');

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

    console.log('Envoi de la requête de traduction...');

    // Effectuer la traduction
    const [response] = await client.translateText(request);
    
    // Afficher le résultat
    console.log('\nRésultat de la traduction:');
    console.log('--------------------------');
    
    response.translations.forEach((translation, i) => {
      console.log(`Traduction ${i+1}: ${translation.translatedText}`);
      if (translation.detectedLanguageCode) {
        console.log(`Langue détectée: ${translation.detectedLanguageCode}`);
      }
    });

  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
  }
}

// Exécuter la fonction
translateText(); 