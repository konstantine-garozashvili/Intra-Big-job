# Guide du système de traduction 🌍

## Structure du système 📁

Pour implémenter la traduction dans un composant, vous aurez besoin de :

1. Le contexte de traduction
```jsx
import { useTranslation } from '@/contexts/TranslationContext';
```

2. Le composant de traduction simple
```jsx
import AsyncTranslation from '@/components/Translation/AsyncTranslation';
```

## Comment traduire ? 🤔

### 1. Pour du texte statique (boutons, titres, labels...)
```jsx
<h1><AsyncTranslation text="Mon titre" /></h1>
<Button><AsyncTranslation text="Valider" /></Button>
```

### 2. Pour du contenu dynamique (cartes, listes...)

```jsx
const MonComposant = () => {
  // 1. Importer le hook de traduction
  const { translate, currentLanguage } = useTranslation();
  
  // 2. Créer un state pour stocker les traductions
  const [translations, setTranslations] = useState({
    title: '',
    items: []
  });

  // 3. Créer une fonction de traduction
  const translateContent = useCallback(async () => {
    try {
      // Traduire tous les textes en une seule fois
      const [title, ...itemTranslations] = await Promise.all([
        translate('Mon titre'),
        ...items.map(async (item) => ({
          ...item,
          title: await translate(item.title),
          description: await translate(item.description)
        }))
      ]);

      setTranslations({
        title,
        items: itemTranslations
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [translate]);

  // 4. Déclencher la traduction quand la langue change
  useEffect(() => {
    translateContent();
  }, [currentLanguage, translateContent]);

  return (
    <div>
      <h1>{translations.title}</h1>
      {translations.items.map((item) => (
        <Card key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </Card>
      ))}
    </div>
  );
};
```


## Exemple de fichiers à regarder 📚

Pour voir des exemples concrets :
1. `frontend/src/pages/Admin/Dashboard.jsx` - Exemple complet avec cartes dynamiques
2. `frontend/src/contexts/TranslationContext.jsx` - Le contexte de traduction
3. `frontend/src/components/Translation/TranslationService.js` - Le service de traduction

## Exemple concret 🎯

```jsx
import React from 'react';
import AsyncTranslation from '@/components/Translation/AsyncTranslation';

const WelcomeCard = () => {
  return (
    <div>
      <h1><AsyncTranslation text="Bienvenue sur notre plateforme" /></h1>
      <p><AsyncTranslation text="Nous sommes ravis de vous voir" /></p>
      
      {/* Pour les textes avec variables, utilisez les templates literals */}
      <p>
        <AsyncTranslation text={`${userName}, bienvenue sur notre plateforme`} />
      </p>
    </div>
  );
};
```

## À ne pas faire ❌

- Ne pas essayer de rendre les traductions dynamiques avec useState/useEffect (Pas de soucis si   la page est rechargée)