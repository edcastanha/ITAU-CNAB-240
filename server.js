/**
 * Arquivo de inicialização do servidor da API REST para geração de arquivos CNAB 240
 */

const app = require('./app');

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Inicialização do servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CNAB 240 API iniciado na porta ${PORT}`);
  console.log(`Verifique o status da API em http://localhost:${PORT}/api/status`);
});
