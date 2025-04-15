const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cnabRoutes = require('../src/routes/cnabRoutes');

// Configuração do app de teste
const app = express();
app.use(express.json());
app.use('/api/cnab', cnabRoutes);

// Dados de teste
const empresaTeste = {
  tipo_inscricao: '1',
  inscricao_numero: '12345678901234',
  nome: 'EMPRESA TESTE',
  agencia: '1234',
  conta: '123456',
  dac: '7'
};

const pagamentoFornecedor = {
  tipo_inscricao: '1',
  inscricao_numero: '98765432101234',
  nome: 'FORNECEDOR TESTE',
  valor: 1000.00,
  data_pagamento: '20240315',
  finalidade: '01',
  historico: 'PAGAMENTO TESTE'
};

const pagamentoBoleto = {
  tipo_inscricao: '1',
  inscricao_numero: '98765432101234',
  nome: 'CLIENTE TESTE',
  valor: 500.00,
  data_vencimento: '20240315',
  numero_documento: '123456',
  nosso_numero: '123456789012'
};

const pagamentoSalario = {
  tipo_inscricao: '1',
  inscricao_numero: '98765432101234',
  nome: 'FUNCIONARIO TESTE',
  valor: 3000.00,
  data_pagamento: '20240315',
  finalidade: '01'
};

const pagamentoTributo = {
  tipo_inscricao: '1',
  inscricao_numero: '98765432101234',
  nome: 'ORGAO TESTE',
  valor: 1000.00,
  data_vencimento: '20240315',
  codigo_tributo: '0001',
  numero_documento: '123456'
};

const pagamentoPIX = {
  tipo_inscricao: '1',
  inscricao_numero: '98765432101234',
  nome: 'FAVORECIDO TESTE',
  valor: 200.00,
  data_pagamento: '20240315',
  chave_pix: '12345678901',
  tipo_chave: 'CPF'
};

// Função auxiliar para limpar arquivos de teste
const limparArquivosTeste = () => {
  const outputDir = path.join(__dirname, '../output');
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      if (file.endsWith('.rem')) {
        fs.unlinkSync(path.join(outputDir, file));
      }
    });
  }
};

// Limpa arquivos antes e depois dos testes
beforeEach(limparArquivosTeste);
afterEach(limparArquivosTeste);

describe('Testes dos Endpoints CNAB', () => {
  // Testes para pagamentos em lote
  describe('Pagamentos em Lote', () => {
    test('POST /api/cnab/fornecedores - Deve gerar arquivo CNAB para fornecedores', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: empresaTeste,
          pagamentos: [pagamentoFornecedor]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
      
      const arquivoPath = path.join(__dirname, '../output', response.body.arquivo);
      expect(fs.existsSync(arquivoPath)).toBe(true);
    });

    test('POST /api/cnab/boletos - Deve gerar arquivo CNAB para boletos', async () => {
      const response = await request(app)
        .post('/api/cnab/boletos')
        .send({
          empresa: empresaTeste,
          pagamentos: [pagamentoBoleto]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/salarios - Deve gerar arquivo CNAB para salários', async () => {
      const response = await request(app)
        .post('/api/cnab/salarios')
        .send({
          empresa: empresaTeste,
          pagamentos: [pagamentoSalario]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/tributos - Deve gerar arquivo CNAB para tributos', async () => {
      const response = await request(app)
        .post('/api/cnab/tributos')
        .send({
          empresa: empresaTeste,
          pagamentos: [pagamentoTributo]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/pix - Deve gerar arquivo CNAB para PIX', async () => {
      const response = await request(app)
        .post('/api/cnab/pix')
        .send({
          empresa: empresaTeste,
          pagamentos: [pagamentoPIX]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });
  });

  // Testes para pagamentos individuais
  describe('Pagamentos Individuais', () => {
    test('POST /api/cnab/fornecedores/individual - Deve gerar arquivo CNAB para fornecedor individual', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores/individual')
        .send({
          empresa: empresaTeste,
          pagamento: pagamentoFornecedor
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/boletos/individual - Deve gerar arquivo CNAB para boleto individual', async () => {
      const response = await request(app)
        .post('/api/cnab/boletos/individual')
        .send({
          empresa: empresaTeste,
          pagamento: pagamentoBoleto
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/salarios/individual - Deve gerar arquivo CNAB para salário individual', async () => {
      const response = await request(app)
        .post('/api/cnab/salarios/individual')
        .send({
          empresa: empresaTeste,
          pagamento: pagamentoSalario
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/tributos/individual - Deve gerar arquivo CNAB para tributo individual', async () => {
      const response = await request(app)
        .post('/api/cnab/tributos/individual')
        .send({
          empresa: empresaTeste,
          pagamento: pagamentoTributo
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });

    test('POST /api/cnab/pix/individual - Deve gerar arquivo CNAB para PIX individual', async () => {
      const response = await request(app)
        .post('/api/cnab/pix/individual')
        .send({
          empresa: empresaTeste,
          pagamento: pagamentoPIX
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.arquivo).toBeDefined();
    });
  });

  // Testes de validação
  describe('Validações', () => {
    test('Deve retornar erro 400 para dados inválidos', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: {},
          pagamentos: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Deve retornar erro 400 para empresa sem dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: {
            nome: 'TESTE'
          },
          pagamentos: [pagamentoFornecedor]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Deve retornar erro 400 para pagamento sem dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/cnab/fornecedores')
        .send({
          empresa: empresaTeste,
          pagamentos: [{
            nome: 'TESTE'
          }]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 