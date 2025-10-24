# Usa imagen base Node.js
FROM node:22

# Crea directorio de trabajo
WORKDIR /usr/src/app

# Copia dependencias e instala
COPY package*.json ./
RUN npm install --production

# Copia el código
COPY . .

# Expone el puerto
EXPOSE 10000

# Comando de inicio
CMD ["npm", "start"]
