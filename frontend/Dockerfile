FROM node:18-alpine

WORKDIR /app

# Nettoyage du cache npm
RUN npm cache clean --force

# Copie des fichiers de dépendances
COPY package.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Copie du reste du code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]