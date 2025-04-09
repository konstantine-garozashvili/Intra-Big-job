FROM node:18-alpine

WORKDIR /app

# Copier d'abord package.json et package-lock.json pour utiliser le cache Docker
COPY package*.json ./

# Installer les dépendances 
RUN npm install

# Ensuite copier les fichiers de l'application
COPY . .

# Exposer le port utilisé par Vite
EXPOSE 5173

# Commande par défaut pour démarrer en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]