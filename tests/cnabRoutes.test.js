/**
 * Testes para as rotas da API CNAB 240
 */

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cnabRoutes = require('../src/routes/cnabRoutes');

// Mock do serviço CNAB
jest.mock('../src/services/cnab240/cnabService', () => ({
  gerarArquivoCNAB240: jest.fn().mockImplementation(() => Promise.resolve())
}));

// Setup do app Express para testes
const app = express();
app.use(express.json());
app.use('/api/cnab240', cnabRoutes);

// Setup e teardown para diretório de output
const OUTPUT_DIR = path.join(__dirname, '../output');

beforeAll(() => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
});

// Limpar arquivos de teste após cada teste
const limparArquivosTeste = () => {
  const arquivos = fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.rem'));
  arquivos.forEach(arquivo => {
    fs.unlinkSync(path.join(OUTPUT_DIR, arquivo));
  });
};

afterEach(() => {
  limparArquivosTeste();
  jest.clearAllMocks();
});

// Dados de teste
const empresaTeste = {
  tipo_inscricao: 2,
  inscricao_numero: "12345678901234",
  nome: "EMPRESA TESTE LTDA",
  agencia: "1234",
  conta: "123456789",
  dac: "1"
};

const pagamentoFornecedor = {
  favorecido: {
    tipo_inscricao: 2,
    inscricao_numero: "98765432101234",
    nome: "FORNECEDOR TESTE LTDA",
    banco: "341",
    agencia: "4321",
    conta: "987654321",
    dac: "9"
  },
  dados: {
    data: "2025-01-01",
    valor: 1000.00,
    nosso_numero: "123456",
    seu_numero: "654321"
  }
};

const pagamentoBoleto = {
  boleto: {
    codigo_barras: "12345678901234567890123456789012345678901234",
    data_pagamento: "2025-01-01",
    valor: 1000.00
  },
  pagador: {
    tipo_inscricao: 2,
    inscricao_numero: "12345678901234",
    nome: "PAGADOR TESTE"
  },
  beneficiario: {
    tipo_inscricao: 2,
    inscricao_numero: "98765432101234",
    nome: "BENEFICIARIO TESTE"
  }
};

const pagamentoSalario = {
  favorecido: {
    tipo_inscricao: 1,
    inscricao_numero: "12345678901",
    nome: "FUNCIONARIO TESTE",
    banco: "341",
    agencia: "1234",
    conta: "123456789",
    dac: "1"
  },
  dados: {
    data: "2025-01-01",
    valor: 2500.00,
    seu_numero: "123456"
  },
  complemento: {
    valor_ir: 300.00,
    valor_inss: 200.00
  }
};

const pagamentoTributo = {
  tributo: {
    codigo_barras: "12345678901234567890123456789012345678901234",
    data_pagamento: "2025-01-01",
    valor: 1000.00
  }
};

const pagamentoPIX = {
  favorecido: {
    tipo_inscricao: 1,
    inscricao_numero: "12345678901",
    nome: "FAVORECIDO PIX",
    banco: "341",
    agencia: "1234",
    conta: "123456789",
    dac: "1"
  },
  dados: {
    data: "2025-01-01",
    valor: 1000.00,
    nosso_numero: "123456",
    seu_numero: "654321"
  },
  pix: {
    tipo_chave: 3,
    chave: "12345678901"
  }
};

// Testes para pagamentos em lote
describe('Pagamentos em Lote', () => {
  
  test('POST /api/cnab240/fornecedores - deve gerar arquivo para fornecedores', async () => {
    const res = await request(app)
      .post('/api/cnab240/fornecedores')
      .send({
        empresa: empresaTeste,
        pagamentos: [pagamentoFornecedor]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_FORNECEDORES_\d+\.rem/);
  });

  test('POST /api/cnab240/boletos - deve gerar arquivo para boletos', async () => {
    const res = await request(app)
      .post('/api/cnab240/boletos')
      .send({
        empresa: empresaTeste,
        pagamentos: [pagamentoBoleto]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_BOLETOS_\d+\.rem/);
  });

  test('POST /api/cnab240/salarios - deve gerar arquivo para salários', async () => {
    const res = await request(app)
      .post('/api/cnab240/salarios')
      .send({
        empresa: empresaTeste,
        pagamentos: [pagamentoSalario]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_SALARIOS_\d+\.rem/);
  });

  test('POST /api/cnab240/tributos - deve gerar arquivo para tributos', async () => {
    const res = await request(app)
      .post('/api/cnab240/tributos')
      .send({
        empresa: empresaTeste,
        pagamentos: [pagamentoTributo]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_TRIBUTOS_\d+\.rem/);
  });

  test('POST /api/cnab240/pix - deve gerar arquivo para PIX', async () => {
    const res = await request(app)
      .post('/api/cnab240/pix')
      .send({
        empresa: empresaTeste,
        tipo_pix: 'transferencia',
        pagamentos: [pagamentoPIX]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_PIX_\d+\.rem/);
  });
});

// Testes para pagamentos individuais
describe('Pagamentos Individuais', () => {
  
  test('POST /api/cnab240/fornecedores/individual - deve gerar arquivo para um fornecedor', async () => {
    const res = await request(app)
      .post('/api/cnab240/fornecedores/individual')
      .send({
        empresa: empresaTeste,
        pagamento: pagamentoFornecedor
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_FORNECEDORES_\d+\.rem/);
  });

  test('POST /api/cnab240/boletos/individual - deve gerar arquivo para um boleto', async () => {
    const res = await request(app)
      .post('/api/cnab240/boletos/individual')
      .send({
        empresa: empresaTeste,
        pagamento: pagamentoBoleto
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_BOLETOS_\d+\.rem/);
  });

  test('POST /api/cnab240/salarios/individual - deve gerar arquivo para um salário', async () => {
    const res = await request(app)
      .post('/api/cnab240/salarios/individual')
      .send({
        empresa: empresaTeste,
        pagamento: pagamentoSalario
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_SALARIOS_\d+\.rem/);
  });

  test('POST /api/cnab240/tributos/individual - deve gerar arquivo para um tributo', async () => {
    const res = await request(app)
      .post('/api/cnab240/tributos/individual')
      .send({
        empresa: empresaTeste,
        pagamento: pagamentoTributo
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_TRIBUTOS_\d+\.rem/);
  });

  test('POST /api/cnab240/pix/individual - deve gerar arquivo para um PIX', async () => {
    const res = await request(app)
      .post('/api/cnab240/pix/individual')
      .send({
        empresa: empresaTeste,
        tipo_pix: 'transferencia',
        pagamento: pagamentoPIX
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_PIX_\d+\.rem/);
  });
});

// Testes de validação
describe('Validações', () => {
  
  test('POST /api/cnab240/fornecedores - deve retornar erro para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/cnab240/fornecedores')
      .send({
        empresa: { tipo_inscricao: 3 }, // Inválido, deve ser 1 ou 2
        pagamentos: []
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/cnab240/boletos - deve retornar erro para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/cnab240/boletos')
      .send({
        empresa: empresaTeste,
        pagamentos: [{ boleto: { valor: -100 } }] // Valor negativo inválido
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/cnab240/personalizado - deve gerar arquivo personalizado', async () => {
    const res = await request(app)
      .post('/api/cnab240/personalizado')
      .send({
        empresa: empresaTeste,
        lotes: [
          {
            tipo_servico: "20",
            pagamentos: [pagamentoFornecedor]
          },
          {
            tipo_servico: "30",
            pagamentos: [pagamentoSalario]
          }
        ]
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.arquivo).toMatch(/CNAB240_PERSONALIZADO_\d+\.rem/);
  });
}); 