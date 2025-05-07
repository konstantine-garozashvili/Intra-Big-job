# 🛡️ Checklist CORS & Sécurité pour le passage en production

## 1. nginx (`default.conf`)
- **En production, n'autorise jamais `localhost` ou `*` dans les headers CORS.**
- Autorise uniquement le vrai domaine du frontend, par exemple :
  ```nginx
  add_header 'Access-Control-Allow-Origin' 'https://app.bigproject.com' always;
  ```
- Mets à jour tous les blocs où ce header apparaît (notamment dans `location /` et pour les OPTIONS si besoin).
- Adapte aussi le `server_name` à ton domaine API.

---

## 2. NelmioCorsBundle (`nelmio_cors.yaml`)
- **Adapte la variable d'environnement** pour autoriser le vrai domaine du frontend :
  ```yaml
  allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
  ```
- Dans la section `paths`, mets le domaine réel :
  ```yaml
  paths:
      '^/api/':
          allow_origin: ['https://app.bigproject.com']
          allow_headers: ['*']
          allow_methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS']
          max_age: 3600
          allow_credentials: true
  ```
- **Ne laisse jamais `localhost` ou `*` en production**.

---

## 3. .env / .env.prod
- Mets à jour la variable :
  ```
  CORS_ALLOW_ORIGIN='^https://app\.bigproject\.com$'
  ```
- **Ne laisse pas `localhost`**.

---

## 4. Sécurité
- **Vérifie que les tokens JWT sont bien transmis** et que les droits d'accès sont corrects.
- **Teste toujours sur un environnement de préproduction** avec les vrais domaines avant de déployer en prod.

---

## 5. À NE JAMAIS FAIRE EN PROD
- Ne jamais autoriser `localhost`, `*` ou tout domaine non maîtrisé dans les headers CORS.
- Ne jamais exposer l'API à tous les domaines.

---

## 6. Exemple de config pour la prod

```nginx
add_header 'Access-Control-Allow-Origin' 'https://app.bigproject.com' always;
```
```yaml
allow_origin: ['https://app.bigproject.com']
```
```
CORS_ALLOW_ORIGIN='^https://app\.bigproject\.com$'
```

---

**Pense à adapter ces valeurs à tes vrais domaines de production !**

---

Garde ce mémo dans ton repo ou dans ta doc de déploiement pour éviter tout oubli lors du merge vers la prod 🚀 