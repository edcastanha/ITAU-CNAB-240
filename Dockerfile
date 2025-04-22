# Use a imagem oficial do Node.js 16
FROM node:16

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e package-lock.json para o container
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código para o container
COPY . .

# Exponha a porta que o aplicativo utiliza (ajuste conforme necessário)
EXPOSE 3000