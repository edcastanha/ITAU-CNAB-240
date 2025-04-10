# Documentação de Implantação - API REST CNAB 240 (SISPAG Itaú)

Este documento fornece instruções detalhadas para a implantação da API REST para geração de arquivos de remessa CNAB 240 compatível com o SISPAG do Itaú.

## 1. Pré-requisitos

Antes de iniciar a implantação, certifique-se de que o ambiente atende aos seguintes requisitos:

- Node.js versão 16.x ou superior
- npm versão 8.x ou superior
- Git para controle de versão
- Servidor Linux (Ubuntu 20.04 LTS ou superior recomendado)
- Nginx (opcional, para proxy reverso)
- Docker e Docker Compose (opcional, para implantação containerizada)

## 2. Implantação Direta (Sem Docker)

### 2.1. Obtenção do Código

```bash
# Clone o repositório
git clone https://seu-repositorio/cnab240-api.git
cd cnab240-api

# Instale as dependências
npm ci --only=production
```

### 2.2. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Configurações da aplicação
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Diretório para arquivos gerados
OUTPUT_DIR=/var/data/cnab240-api/output

# Configurações de segurança (se implementadas)
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRATION=8h
```

Crie o diretório para armazenamento dos arquivos gerados:

```bash
sudo mkdir -p /var/data/cnab240-api/output
sudo chown -R $USER:$USER /var/data/cnab240-api/output
```

### 2.3. Instalação do PM2 (Process Manager)

```bash
# Instale o PM2 globalmente
npm install -g pm2

# Crie o arquivo de configuração do PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cnab240-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G'
  }]
};
EOF

# Inicie a aplicação com PM2
pm2 start ecosystem.config.js

# Configure o PM2 para iniciar automaticamente após o reboot
pm2 startup
pm2 save
```

### 2.4. Configuração do Nginx (Opcional)

Instale o Nginx:

```bash
sudo apt update
sudo apt install -y nginx
```

Crie um arquivo de configuração para o site:

```bash
sudo nano /etc/nginx/sites-available/cnab240-api
```

Adicione o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/downloads {
        alias /var/data/cnab240-api/output;
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/cnab240-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 3. Implantação com Docker

### 3.1. Preparação do Ambiente

Instale o Docker e o Docker Compose:

```bash
# Instale o Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instale o Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 3.2. Configuração do Docker

Crie um arquivo `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p /var/data/cnab240-api/output
VOLUME ["/var/data/cnab240-api/output"]

EXPOSE 3000

CMD ["node", "src/server.js"]
```

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OUTPUT_DIR=/var/data/cnab240-api/output
    volumes:
      - cnab_data:/var/data/cnab240-api/output
    networks:
      - cnab_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - cnab_data:/var/data/cnab240-api/output:ro
    depends_on:
      - api
    networks:
      - cnab_network

volumes:
  cnab_data:

networks:
  cnab_network:
```

### 3.3. Configuração do Nginx para Docker

Crie os diretórios necessários:

```bash
mkdir -p nginx/conf.d nginx/ssl
```

Crie o arquivo de configuração do Nginx:

```bash
cat > nginx/conf.d/default.conf << EOF
server {
    listen 80;
    server_name localhost;
    
    location / {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/downloads {
        alias /var/data/cnab240-api/output;
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
```

### 3.4. Iniciar os Containers

```bash
# Construa e inicie os containers
docker-compose up -d

# Verifique se os containers estão rodando
docker-compose ps
```

## 4. Verificação da Implantação

Após a implantação, verifique se a API está funcionando corretamente:

```bash
# Verifique o status da API
curl http://localhost:3000/api/status

# Resposta esperada:
# {"success":true,"message":"API CNAB 240 está funcionando","version":"1.0.0","timestamp":"..."}
```

## 5. Configuração de SSL/TLS (HTTPS)

Para ambientes de produção, é altamente recomendável configurar HTTPS. Você pode usar o Let's Encrypt para obter certificados gratuitos:

```bash
# Instale o Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenha o certificado
sudo certbot --nginx -d seu-dominio.com

# Renove automaticamente o certificado
sudo certbot renew --dry-run
```

## 6. Monitoramento e Logs

### 6.1. Logs da Aplicação

Para visualizar os logs da aplicação:

```bash
# Se estiver usando PM2
pm2 logs cnab240-api

# Se estiver usando Docker
docker-compose logs -f api
```

### 6.2. Configuração de Monitoramento (Opcional)

Para monitoramento básico com PM2:

```bash
# Instale o PM2 Monitoring
pm2 install pm2-server-monit

# Visualize o dashboard
pm2 monit
```

## 7. Backup e Manutenção

### 7.1. Backup dos Arquivos Gerados

Configure um backup periódico do diretório de saída:

```bash
# Exemplo de script de backup (salve como /etc/cron.daily/backup-cnab)
#!/bin/bash
BACKUP_DIR="/var/backups/cnab240-api"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/cnab_files_$DATE.tar.gz /var/data/cnab240-api/output
find $BACKUP_DIR -type f -name "cnab_files_*.tar.gz" -mtime +30 -delete
```

Torne o script executável:

```bash
sudo chmod +x /etc/cron.daily/backup-cnab
```

### 7.2. Atualização da Aplicação

Para atualizar a aplicação:

```bash
# Se estiver usando implantação direta
cd /caminho/para/cnab240-api
git pull
npm ci --only=production
pm2 restart cnab240-api

# Se estiver usando Docker
cd /caminho/para/cnab240-api
git pull
docker-compose build
docker-compose up -d
```

## 8. Considerações de Segurança

- Mantenha o sistema operacional e todas as dependências atualizadas
- Configure um firewall (UFW) para permitir apenas as portas necessárias
- Implemente autenticação e autorização para a API
- Monitore regularmente os logs em busca de atividades suspeitas
- Realize backups periódicos e teste o processo de restauração

## 9. Solução de Problemas

### 9.1. A API não está acessível

- Verifique se o serviço está em execução: `pm2 status` ou `docker-compose ps`
- Verifique os logs em busca de erros: `pm2 logs` ou `docker-compose logs`
- Verifique se as portas estão abertas: `sudo netstat -tulpn | grep 3000`
- Verifique a configuração do Nginx: `sudo nginx -t`

### 9.2. Erros na geração de arquivos

- Verifique as permissões do diretório de saída: `ls -la /var/data/cnab240-api/output`
- Verifique o espaço em disco disponível: `df -h`
- Verifique os logs da aplicação em busca de erros específicos

## 10. Contato e Suporte

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento:

- Email: suporte@seudominio.com
- Sistema de tickets: https://suporte.seudominio.com
