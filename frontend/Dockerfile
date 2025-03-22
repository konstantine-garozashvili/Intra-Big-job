FROM node:18-alpine

WORKDIR /app

# Nettoyage du cache npm
RUN npm cache clean --force

# Copie des fichiers de dépendances
COPY package.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]