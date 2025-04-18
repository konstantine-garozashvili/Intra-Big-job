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
    
    console.log('Initializing Translation client...');
    console.log(`Project ID: ${projectId}`);
    console.log(`Key file: ${keyFilename}`);
    
    // Initialize the client
    const client = new TranslationServiceClient({
      projectId,
      keyFilename,
    });
    
    console.log('Translation client initialized successfully');
    
    // Text to translate
    const text = 'Hello, world!';
    const targetLanguage = 'fr';
    
    console.log(`\nTranslating: "${text}" to ${targetLanguage}`);
    
    // Prepare request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLanguage,
    };
    
    // Send request
    console.log('Sending translation request...');
    const [response] = await client.translateText(request);
    
    // Output results
    console.log('\nTranslation results:');
    console.log('--------------------------');
    response.translations.forEach((translation, i) => {
      console.log(`Translation ${i+1}: ${translation.translatedText}`);
      if (translation.detectedLanguageCode) {
        console.log(`Detected language: ${translation.detectedLanguageCode}`);
      }
    });
    
    // Test language detection
    console.log('\nTesting language detection...');
    const detectRequest = {
      parent: `projects/${projectId}/locations/global`,
      content: text,
    };
    
    const [detectResponse] = await client.detectLanguage(detectRequest);
    console.log('Language detection results:');
    console.log('--------------------------');
    detectResponse.languages.forEach((language, i) => {
      console.log(`Language ${i+1}: ${language.languageCode} (confidence: ${language.confidence})`);
    });
    
    // Test language list
    console.log('\nFetching available languages...');
    const listRequest = {
      parent: `projects/${projectId}/locations/global`,
      displayLanguageCode: 'fr',
    };
    
    const [listResponse] = await client.getSupportedLanguages(listRequest);
    console.log(`Found ${listResponse.languages.length} supported languages`);
    console.log('Sample languages:');
    listResponse.languages.slice(0, 5).forEach((language, i) => {
      console.log(`- ${language.languageCode}: ${language.displayName}`);
    });
    
  } catch (error) {
    console.error('Error in test script:', error);
    // More detailed error info
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the test
testTranslation(); 