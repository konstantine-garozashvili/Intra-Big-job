// Script pour trouver les imports de react-i18next
import fs from 'fs';
import path from 'path';

// Récursivité pour parcourir les répertoires
function searchDirectory(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et build
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results.push(...searchDirectory(filePath, pattern));
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(pattern)) {
          results.push({
            file: filePath,
            lines: content.split('\n')
              .map((line, i) => ({ line: i + 1, content: line }))
              .filter(line => line.content.includes(pattern))
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
      }
    }
  }
  
  return results;
}

// Démarrer la recherche depuis le répertoire src
const searchResults = searchDirectory(path.resolve('./src'), 'react-i18next');

// Afficher les résultats
console.log('Fichiers contenant des imports de react-i18next:');
if (searchResults.length === 0) {
  console.log('Aucun import trouvé');
} else {
  searchResults.forEach(result => {
    console.log(`\nFichier: ${result.file}`);
    result.lines.forEach(line => {
      console.log(`  Ligne ${line.line}: ${line.content.trim()}`);
    });
  });
}

// Écrire les résultats dans un fichier JSON pour référence
fs.writeFileSync('imports-results.json', JSON.stringify(searchResults, null, 2));
console.log('\nRésultats enregistrés dans imports-results.json'); 