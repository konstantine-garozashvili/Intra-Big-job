FROM node:18-alpine

WORKDIR /app

# Utiliser une installation efficace
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build l'application en mode production
RUN npm run build

EXPOSE 5173

# Servir l'application en mode statique
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]