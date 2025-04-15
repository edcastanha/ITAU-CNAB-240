const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cnabRoutes = require('../src/routes/cnabRoutes');

// Configuração do ambiente de teste
const app = express();
app.use(express.json());
app.use('/api/cnab', cnabRoutes);

// Diretório para arquivos de teste
const TEST_DIR = path.join(__dirname, 'test_files');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR);
}

// Função auxiliar para limpar arquivos de teste
const limparArquivosTeste = () => {
  if (fs.existsSync(TEST_DIR)) {
    const arquivos = fs.readdirSync(TEST_DIR);
    arquivos.forEach(arquivo => {
      fs.unlinkSync(path.join(TEST_DIR, arquivo));
    });
  }
};

// Dados de exemplo para testes
const dadosEmpresa = {
  nome: 'EMPRESA ABC',
  cnpj: '12345678000190',
  banco: '033',
  agencia: '1234',
  conta: '1234567',
  digito_conta: '8'
};

const dadosFornecedor = {
  nome: 'FORNECEDOR XYZ',
  cnpj: '98765432000198',
  banco: '033',
  agencia: '5678',
  conta: '7654321',
  digito_conta: '9',
  valor: 1000.50
};

const dadosBoleto = {
  nome: 'CLIENTE ABC',
  cpf: '12345678901',
  valor: 500.75,
  data_vencimento: '2024-03-15',
  codigo_barras: '12345678901234567890123456789012345678901234'
};

const dadosFuncionario = {
  nome: 'FUNCIONARIO XYZ',
  cpf: '98765432109',
  banco: '033',
  agencia: '9012',
  conta: '1234567',
  digito_conta: '8',
  valor: 3000.00
};

const dadosTributo = {
  nome: 'TRIBUTO XYZ',
  cnpj: '12345678000190',
  valor: 1000.00,
  codigo_barras: '12345678901234567890123456789012345678901234'
};

const dadosPIX = {
  nome: 'BENEFICIARIO XYZ',
  cpf: '12345678901',
  valor: 100.00,
  chave_pix: '12345678901'
};

describe('Endpoints CNAB', () => {
  beforeEach(() => {
    limparArquivosTeste();
  });

  afterAll(() => {
    limparArquivosTeste();
  });

  describe('Pagamentos em Lote', () => {
    it('deve gerar arquivo CNAB para fornecedores', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [dadosFornecedor]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para boletos', async () => {
      const response = await request(app)
        .post('/api/cnab/boletos')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [dadosBoleto]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para salários', async () => {
      const response = await request(app)
        .post('/api/cnab/salarios')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [dadosFuncionario]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para tributos', async () => {
      const response = await request(app)
        .post('/api/cnab/tributos')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [dadosTributo]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para PIX', async () => {
      const response = await request(app)
        .post('/api/cnab/pix')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [dadosPIX]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });
  });

  describe('Pagamentos Individuais', () => {
    it('deve gerar arquivo CNAB para fornecedor individual', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores/individual')
        .send({
          empresa: dadosEmpresa,
          pagamento: dadosFornecedor
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para boleto individual', async () => {
      const response = await request(app)
        .post('/api/cnab/boletos/individual')
        .send({
          empresa: dadosEmpresa,
          pagamento: dadosBoleto
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para salário individual', async () => {
      const response = await request(app)
        .post('/api/cnab/salarios/individual')
        .send({
          empresa: dadosEmpresa,
          pagamento: dadosFuncionario
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para tributo individual', async () => {
      const response = await request(app)
        .post('/api/cnab/tributos/individual')
        .send({
          empresa: dadosEmpresa,
          pagamento: dadosTributo
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    it('deve gerar arquivo CNAB para PIX individual', async () => {
      const response = await request(app)
        .post('/api/cnab/pix/individual')
        .send({
          empresa: dadosEmpresa,
          pagamento: dadosPIX
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });
  });

  describe('Validações', () => {
    it('deve retornar erro ao enviar dados inválidos', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: {},
          pagamentos: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro ao faltar dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/cnab/boletos')
        .send({
          empresa: dadosEmpresa,
          pagamentos: [{
            nome: 'CLIENTE ABC',
            valor: 500.75
          }]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 