# Use a imagem oficial do Node.js
FROM node:20-alpine

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json (se existir) para o contêiner
COPY package*.json ./

# Instale as dependências
RUN npm install --production

# Instale o NestJS CLI globalmente
RUN npm install -g @nestjs/cli

# Copie o restante do código para o contêiner
COPY . .

# Execute o build do projeto
RUN npm run build

# Comando para iniciar o servidor
CMD ["npm", "run", "start:prod"]

# Exponha a porta 3000 (padrão do NestJS)
EXPOSE 3000
