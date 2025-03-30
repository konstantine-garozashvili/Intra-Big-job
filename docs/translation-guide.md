# Guide d'utilisation du système de traduction

Ce document explique comment utiliser le système de traduction basé sur Google Translate API dans le projet Big Job.

## 📚 Vue d'ensemble

Le système de traduction est composé de deux parties principales :

1. **Backend (Symfony)** : Un service qui encapsule les appels à l'API Google Translate et expose des endpoints REST pour effectuer des traductions.
2. **Frontend (React)** : Des composants et hooks qui facilitent l'intégration des traductions dans l'interface utilisateur.

## 🔧 Configuration

### Configuration du backend

La clé API Google Translate est configurée dans le fichier `.env` :

```
GOOGLE_TRANSLATE_API_KEY=votre_clé_api
```

Pour obtenir une clé API Google Translate :

1. Créez un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activez l'API Cloud Translation
3. Générez une clé API dans la section "Identifiants"
4. Copiez la clé et ajoutez-la à votre fichier `.env`

### Configuration du frontend

Le frontend utilise un contexte React pour gérer l'état global de la traduction. Ce contexte est configuré dans `main.jsx` :

```jsx
<TranslationProvider options={{ defaultLanguage: 'fr', cacheInSession: true }}>
  <App />
</TranslationProvider>
```

## 💻 Utilisation côté backend

### Appels directs au service de traduction

```php
use App\Service\TranslationService;

class MonController extends AbstractController
{
    public function maMethode(TranslationService $translationService)
    {
        // Traduire un texte
        $texteTraduit = $translationService->translateText(
            'Bonjour le monde',  // Texte à traduire
            'en',                // Langue cible (anglais)
            'fr'                 // Langue source (français) - optionnel
        );
        
        // Traduire plusieurs textes d'un coup
        $textesTraduits = $translationService->translateBatch(
            ['Bonjour', 'Au revoir'],  // Textes à traduire
            'en',                      // Langue cible
            'fr'                       // Langue source - optionnel
        );
        
        // Détecter la langue d'un texte
        $langueDétectée = $translationService->detectLanguage('Bonjour le monde');
    }
}
```

### API REST de traduction

Le système expose les endpoints suivants pour la traduction :

| Endpoint | Méthode | Paramètres | Description |
|----------|---------|------------|-------------|
| `/api/translation/translate` | POST | `{ "text": "Texte à traduire", "targetLang": "en", "sourceLang": "fr" }` | Traduit un texte unique |
| `/api/translation/translate-batch` | POST | `{ "texts": ["Texte 1", "Texte 2"], "targetLang": "en", "sourceLang": "fr" }` | Traduit plusieurs textes |
| `/api/translation/detect` | POST | `{ "text": "Texte à analyser" }` | Détecte la langue d'un texte |
| `/api/translation/languages` | GET | `?target=fr` (optionnel) | Liste les langues disponibles |

## 🖥️ Utilisation côté frontend

### 1. Hook de traduction

Le hook `useTranslation` peut être utilisé directement dans n'importe quel composant :

```jsx
import { useTranslation } from '../hooks';

function MonComposant() {
  const { 
    translateText, 
    translateBatch, 
    translateObject,
    currentLanguage,
    changeLanguage,
    isLoading,
    error 
  } = useTranslation();
  
  // Exemple de traduction
  const handleTraduction = async () => {
    const texteTraduit = await translateText('Bonjour le monde', 'en');
    console.log(texteTraduit); // "Hello world"
  };
  
  return (
    <div>
      <button onClick={handleTraduction}>Traduire</button>
    </div>
  );
}
```

### 2. Contexte de traduction

Pour accéder aux fonctionnalités de traduction depuis n'importe quel composant sans avoir à passer des props :

```jsx
import { useTranslationContext } from '../context/TranslationContext';

function MonComposant() {
  const { translateText, currentLanguage } = useTranslationContext();
  
  // Utilisation comme avec le hook
}
```

### 3. Composant Translation

Pour les traductions simples dans l'interface :

```jsx
import Translation from '../components/shared/Translation';

function MonComposant() {
  return (
    <div>
      <h1>
        <Translation 
          text="Bienvenue sur notre application" 
          fallback="Chargement..."
        />
      </h1>
      <p>
        <Translation 
          text="Cliquez ici pour continuer" 
          lazy={true} // Traduit au montage du composant
        />
      </p>
    </div>
  );
}
```

### 4. Composant T (plus simple)

Pour des traductions encore plus simples :

```jsx
import { T } from '../context/TranslationContext';

function MonComposant() {
  return (
    <div>
      <h1><T text="Bienvenue sur notre application" /></h1>
      <p><T text="Cliquez ici pour continuer" /></p>
    </div>
  );
}
```

### 5. Sélecteur de langue

Pour permettre aux utilisateurs de changer de langue :

```jsx
import LanguageSelector from '../components/shared/LanguageSelector';

function MonComposant() {
  return (
    <header>
      <h1>Mon Application</h1>
      <LanguageSelector 
        onLanguageChange={(newLang) => console.log(`Langue changée: ${newLang}`)}
      />
    </header>
  );
}
```

## 🚀 Bonnes pratiques

1. **Utiliser le composant T** pour les textes courts et statiques sans paramètres.
2. **Utiliser le composant Translation** pour les textes qui nécessitent plus de contrôle ou des configurations spéciales.
3. **Utiliser translateBatch** plutôt que plusieurs appels à translateText pour de meilleures performances.
4. **Éviter de traduire** du contenu généré par l'utilisateur sans son consentement.
5. **Utiliser le cache** fourni par le système pour éviter des requêtes inutiles à l'API.

## ⚠️ Limitations

- L'API Google Translate a des quotas et peut engendrer des coûts. Consultez la [documentation Google](https://cloud.google.com/translate/pricing) pour plus d'informations.
- Les traductions automatiques ne sont pas parfaites, particulièrement pour certaines langues ou expressions idiomatiques.
- La détection de langue peut être imprécise pour les textes très courts.

## 📖 Ressources utiles

- [Documentation de l'API Google Translate](https://cloud.google.com/translate/docs)
- [Codes de langue ISO 639-1](https://fr.wikipedia.org/wiki/Liste_des_codes_ISO_639-1)
- [Exemple d'utilisation avancée](./frontend/src/components/shared/TranslationExample.jsx) 