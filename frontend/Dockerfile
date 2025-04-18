FROM node:18-alpine

WORKDIR /app

# Nettoyage du cache npm
RUN npm cache clean --force

# Copie des fichiers de dépendances
COPY package.json .npmrc ./

# Installation des dépendances avec gestion des dépendances optionnelles
RUN npm install --include=optional && \
    npm install @rollup/rollup-linux-x64-musl || true

# Copie du reste du code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]