# Requisitos de Infraestrutura para API REST CNAB 240 (SISPAG Itaú)

Este documento descreve os requisitos de infraestrutura necessários para a implementação em produção da API REST para geração de arquivos de remessa CNAB 240 compatível com o SISPAG do Itaú.

## 1. Requisitos de Hardware

### 1.1. Servidor de Aplicação
- **CPU**: Mínimo de 2 vCPUs (recomendado 4 vCPUs)
- **Memória RAM**: Mínimo de 4GB (recomendado 8GB)
- **Armazenamento**: Mínimo de 20GB SSD (recomendado 50GB SSD)
- **Rede**: Conexão de rede estável com largura de banda mínima de 100 Mbps

### 1.2. Escalabilidade
- A aplicação foi projetada para ser escalável horizontalmente
- Recomenda-se a utilização de balanceadores de carga para distribuir as requisições entre múltiplas instâncias da aplicação em caso de alto volume de transações

## 2. Requisitos de Software

### 2.1. Sistema Operacional
- Linux (Ubuntu 20.04 LTS ou superior, CentOS 8 ou superior)
- Suporte a containers Docker também é possível

### 2.2. Runtime
- Node.js versão 16.x ou superior
- npm versão 8.x ou superior (ou yarn 1.22.x ou superior)

### 2.3. Banco de Dados
- Não é necessário um banco de dados para o funcionamento básico da API
- Opcionalmente, pode-se utilizar um banco de dados para armazenar histórico de arquivos gerados:
  - MongoDB (recomendado para armazenamento de logs e histórico)
  - PostgreSQL ou MySQL (para armazenamento estruturado de dados de transações)

### 2.4. Proxy Reverso
- Nginx ou Apache para gerenciamento de requisições HTTP
- Configuração de SSL/TLS para comunicação segura (HTTPS)

### 2.5. Containers e Orquestração
- Docker para containerização da aplicação
- Docker Compose ou Kubernetes para orquestração de múltiplos containers

## 3. Requisitos de Segurança

### 3.1. Rede
- Firewall configurado para permitir apenas tráfego nas portas necessárias (80/443 para HTTP/HTTPS)
- VPN ou rede privada para comunicação entre serviços internos
- Implementação de WAF (Web Application Firewall) para proteção contra ataques comuns

### 3.2. Autenticação e Autorização
- Implementação de autenticação via tokens JWT ou OAuth 2.0
- Definição de perfis de acesso e permissões para diferentes operações
- Armazenamento seguro de credenciais e chaves de API

### 3.3. Criptografia
- Certificados SSL/TLS para comunicação HTTPS
- Criptografia de dados sensíveis em trânsito e em repouso
- Rotação periódica de chaves e certificados

### 3.4. Auditoria e Logging
- Sistema de logs centralizado para rastreamento de operações
- Monitoramento de tentativas de acesso não autorizado
- Retenção de logs por período adequado (recomendado mínimo de 90 dias)

## 4. Requisitos de Monitoramento e Operação

### 4.1. Monitoramento
- Implementação de ferramentas de monitoramento como Prometheus, Grafana ou ELK Stack
- Alertas para eventos críticos (falhas, alta utilização de recursos, etc.)
- Dashboards para visualização de métricas de desempenho

### 4.2. Logging
- Centralização de logs usando ferramentas como ELK Stack (Elasticsearch, Logstash, Kibana) ou Graylog
- Estruturação de logs para facilitar análise e busca
- Rotação e retenção adequada de logs

### 4.3. Backup e Recuperação
- Backup periódico dos arquivos gerados e configurações
- Estratégia de recuperação de desastres documentada e testada
- Replicação de dados críticos em múltiplas zonas de disponibilidade

## 5. Requisitos de Integração

### 5.1. Comunicação com Sistemas Internos
- APIs RESTful para integração com sistemas de gestão financeira
- Mecanismos de filas (como RabbitMQ ou Apache Kafka) para processamento assíncrono de grandes volumes de pagamentos
- Webhooks para notificação de eventos importantes

### 5.2. Comunicação com o Banco Itaú
- Definição clara do processo de envio dos arquivos CNAB 240 gerados para o banco
- Implementação de processos de confirmação e validação de arquivos enviados
- Monitoramento de status de processamento dos arquivos pelo banco

## 6. Requisitos de Implantação

### 6.1. Ambiente de Desenvolvimento
- Ambiente isolado para desenvolvimento e testes
- Ferramentas de CI/CD para automação de testes e implantação
- Controle de versão (Git) para gerenciamento de código

### 6.2. Ambiente de Homologação
- Ambiente similar ao de produção para validação de novas versões
- Dados de teste representativos para validação de funcionalidades
- Processos de homologação documentados

### 6.3. Ambiente de Produção
- Infraestrutura redundante para alta disponibilidade
- Processos de implantação com zero downtime
- Estratégia de rollback em caso de problemas

## 7. Configuração do Servidor Node.js

### 7.1. Variáveis de Ambiente
```
# Configurações da aplicação
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Diretório para arquivos gerados
OUTPUT_DIR=/var/data/cnab240-api/output

# Configurações de segurança
JWT_SECRET=<chave-secreta-jwt>
JWT_EXPIRATION=8h

# Configurações de rate limiting
RATE_LIMIT_WINDOW_MS=15*60*1000  # 15 minutos
RATE_LIMIT_MAX=100  # 100 requisições por janela
```

### 7.2. Configuração do PM2 (Process Manager)
```json
{
  "apps": [
    {
      "name": "cnab240-api",
      "script": "src/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "max_memory_restart": "1G"
    }
  ]
}
```

### 7.3. Configuração do Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.seudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    
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

## 8. Configuração Docker

### 8.1. Dockerfile
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

### 8.2. Docker Compose
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

## 9. Considerações Finais

### 9.1. Dimensionamento
- O dimensionamento da infraestrutura deve considerar o volume esperado de transações
- Para volumes pequenos (até 1.000 arquivos/dia), a configuração mínima é suficiente
- Para volumes médios (1.000 a 10.000 arquivos/dia), recomenda-se a configuração recomendada
- Para volumes grandes (acima de 10.000 arquivos/dia), recomenda-se uma arquitetura distribuída com múltiplas instâncias

### 9.2. Custos Estimados
- Servidor de aplicação: $50-$200/mês (dependendo do provedor e configuração)
- Armazenamento: $10-$50/mês
- Transferência de dados: $10-$100/mês (dependendo do volume)
- Serviços adicionais (monitoramento, backup): $20-$100/mês

### 9.3. Recomendações Adicionais
- Implementar uma estratégia de cache para melhorar o desempenho
- Considerar a utilização de CDN para distribuição de arquivos estáticos
- Realizar testes de carga antes da implantação em produção
- Documentar todos os procedimentos operacionais (deploy, backup, recuperação)
- Manter um ambiente de homologação sempre atualizado com a versão de produção
