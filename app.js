/**
 * Aplicação principal da API REST para geração de arquivos CNAB 240
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Importação das rotas
const cnabRoutes = require('./src/routes/cnabRoutes');

// Inicialização da aplicação Express
const app = express();

// Configuração do diretório de saída
const outputDir = path.join(process.cwd(), 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Middleware para parsing de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para CORS
app.use(cors());

// Middleware para logging
app.use(morgan('dev'));

// Rota de status/health check
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API CNAB 240 está funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/cnab240', cnabRoutes);

// Rota para documentação
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Documentação da API CNAB 240',
    endpoints: [
      {
        path: '/api/cnab240/fornecedores',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 para pagamentos de fornecedores'
      },
      {
        path: '/api/cnab240/boletos',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 para pagamentos de boletos'
      },
      {
        path: '/api/cnab240/salarios',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 para pagamentos de salários'
      },
      {
        path: '/api/cnab240/tributos',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 para pagamentos de tributos'
      },
      {
        path: '/api/cnab240/pix',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 para pagamentos PIX'
      },
      {
        path: '/api/cnab240/personalizado',
        method: 'POST',
        description: 'Gera arquivo CNAB 240 personalizado com múltiplos lotes'
      }
    ]
  });
});

// Rota para arquivos estáticos (para download dos arquivos gerados)
app.use('/api/downloads', express.static(outputDir));

// Rota 404 para endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: err.message
  });
});

// Definindo a porta
const PORT = process.env.PORT || 3000;

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Exportação da aplicação
module.exports = app;
