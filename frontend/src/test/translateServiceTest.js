/**
 * Test script for Google Cloud Translation using Service Account
 * 
 * Run with:
 * docker exec -it infra-frontend-1 node src/test/translateServiceTest.js
 */

import { TranslationServiceClient } from '@google-cloud/translate';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTranslation() {
  try {
    // Configuration parameters
    const projectId = 'bigproject-456311';
    const keyFilename = path.resolve(__dirname, '../../../backend/config/google/bigproject-456311-0550e6cf975d.json');
    
    // Initialize the client
    const client = new TranslationServiceClient({
      projectId,
      keyFilename,
    });
    
    // Text to translate
    const text = 'Hello, world!';
    const targetLanguage = 'fr';
    
    // Prepare request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLanguage,
    };
    
    // Send request
    const [response] = await client.translateText(request);
    
    // Output results
    response.translations.forEach((translation, i) => {
      if (translation.detectedLanguageCode) {
      });
    });
    
    // Test language detection
    const detectRequest = {
      parent: `projects/${projectId}/locations/global`,
      content: text,
    };
    
    const [detectResponse] = await client.detectLanguage(detectRequest);
    
    // Test language list
    const listRequest = {
      parent: `projects/${projectId}/locations/global`,
      displayLanguageCode: 'fr',
    };
    
    const [listResponse] = await client.getSupportedLanguages(listRequest);
  } catch (error) {
    // More detailed error info
    if (error.details) {
    }
  }
}

// Run the test
testTranslation(); 