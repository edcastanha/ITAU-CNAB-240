/**
 * Testes de API para os endpoints de geração de arquivos CNAB 240
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');

// Diretório para arquivos de teste
const TEST_OUTPUT_DIR = path.join(process.cwd(), 'output');

// Cria o diretório de saída se não existir
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

describe('API CNAB 240', () => {
  // Dados de exemplo para testes
  const dadosEmpresa = {
    tipo_inscricao: 2,
    inscricao_numero: '12345678901234',
    nome: 'EMPRESA TESTE LTDA',
    agencia: '1234',
    conta: '123456789',
    dac: '0'
  };


  test('GET /api/status deve retornar status 200 e informações da API', async () => {
    const response = await request(app).get('/api/status');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API CNAB 240 está funcionando');
    expect(response.body.version).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /api/docs deve retornar status 200 e documentação da API', async () => {
    const response = await request(app).get('/api/docs');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Documentação da API CNAB 240');
    expect(response.body.endpoints).toBeDefined();
    expect(response.body.endpoints.length).toBeGreaterThan(0);
  });

  test('POST /api/cnab240/fornecedores deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      pagamentos: [
        {
          favorecido: {
            tipo_inscricao: 2,
            inscricao_numero: '98765432101234',
            nome: 'FORNECEDOR TESTE LTDA',
            banco: '341',
            agencia: '4321',
            conta: '987654321',
            dac: '1'
          },
          dados: {
            data: '2025-04-15',
            valor: 1500.75,
            seu_numero: '123456789',
            nosso_numero: '987654321'
          },
          informacoes: {
            finalidade_doc: '01',
            finalidade_ted: '00001'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/fornecedores')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(1);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/boletos deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      pagamentos: [
        {
          boleto: {
            codigo_barras: '12345678901234567890123456789012345678901234',
            nome_beneficiario: 'BENEFICIARIO TESTE LTDA',
            data_vencimento: '2025-04-20',
            data_pagamento: '2025-04-15',
            valor: 1200.50,
            seu_numero: '123456789'
          },
          pagador: {
            tipo_inscricao: 2,
            inscricao_numero: '12345678901234',
            nome: 'EMPRESA PAGADORA LTDA'
          },
          beneficiario: {
            tipo_inscricao: 2,
            inscricao_numero: '98765432101234',
            nome: 'BENEFICIARIO TESTE LTDA'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/boletos')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(1);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/tributos deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      pagamentos: [
        {
          tributo: {
            codigo_barras: '12345678901234567890123456789012345678901234',
            nome_contribuinte: 'CONTRIBUINTE TESTE LTDA',
            data_vencimento: '2025-04-20',
            data_pagamento: '2025-04-15',
            valor: 1500.75,
            seu_numero: '123456789'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/tributos')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(1);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/salarios deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      pagamentos: [
        {
          favorecido: {
            tipo_inscricao: 1,
            inscricao_numero: '12345678901',
            nome: 'FUNCIONARIO TESTE',
            banco: '341',
            agencia: '1234',
            conta: '123456',
            dac: '7'
          },
          dados: {
            data: '2025-04-05',
            valor: 3500.00,
            seu_numero: '123456789'
          },
          complemento: {
            valor_ir: 350.00,
            valor_inss: 280.00,
            valor_fgts: 280.00,
            valor_liquido: 2870.00
          },
          historico: {
            codigo: 10,
            mensagem: 'PAGAMENTO REFERENTE AO SALARIO DO MES DE ABRIL DE 2025'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/salarios')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(1);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/pix deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      tipo_pix: 'transferencia',
      pagamentos: [
        {
          favorecido: {
            tipo_inscricao: 2,
            inscricao_numero: '98765432101234',
            nome: 'FAVORECIDO PIX TESTE',
            banco: '341',
            agencia: '1234',
            conta: '123456',
            dac: '7'
          },
          dados: {
            data: '2025-04-05',
            valor: 1000.00,
            seu_numero: '123456789'
          },
          pix: {
            tipo_chave: 3, // CPF/CNPJ
            chave: '98765432101234',
            info_adicional: 'Pagamento de serviços'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/pix')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(1);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/personalizado deve retornar status 200 e gerar arquivo CNAB 240', async () => {
    const payload = {
      empresa: dadosEmpresa,
      lotes: [
        {
          tipo_servico: '20', // Pagamento de Fornecedores
          forma_pagamento: '01', // Crédito em Conta Corrente
          pagamentos: [
            {
              favorecido: {
                tipo_inscricao: 2,
                inscricao_numero: '98765432101234',
                nome: 'FORNECEDOR TESTE LTDA',
                banco: '341',
                agencia: '4321',
                conta: '987654321',
                dac: '1'
              },
              dados: {
                data: '2025-04-15',
                valor: 1500.75,
                seu_numero: '123456789'
              }
            }
          ]
        },
        {
          tipo_servico: '30', // Pagamento de Salários
          forma_pagamento: '01', // Crédito em Conta Corrente
          pagamentos: [
            {
              favorecido: {
                tipo_inscricao: 1,
                inscricao_numero: '12345678901',
                nome: 'FUNCIONARIO TESTE',
                banco: '341',
                agencia: '1234',
                conta: '123456',
                dac: '7'
              },
              dados: {
                data: '2025-04-05',
                valor: 3500.00,
                seu_numero: '123456789'
              }
            }
          ]
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/personalizado')
      .send(payload);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Arquivo CNAB 240 gerado com sucesso');
    expect(response.body.arquivo).toBeDefined();
    expect(response.body.caminho).toBeDefined();
    expect(response.body.estatisticas).toBeDefined();
    expect(response.body.estatisticas.quantidade_lotes).toBe(2);
    expect(response.body.estatisticas.quantidade_registros).toBeGreaterThan(0);
    
    // Verifica se o arquivo foi gerado
    expect(fs.existsSync(response.body.caminho)).toBe(true);
  });

  test('POST /api/cnab240/fornecedores com dados inválidos deve retornar status 400', async () => {
    const payload = {
      empresa: {
        // Dados incompletos da empresa
        tipo_inscricao: 2,
        inscricao_numero: '12345678901234'
        // Faltando nome, agencia, conta, dac
      },
      pagamentos: [
        {
          favorecido: {
            tipo_inscricao: 2,
            inscricao_numero: '98765432101234',
            nome: 'FORNECEDOR TESTE LTDA',
            banco: '341',
            agencia: '4321',
            conta: '987654321',
            dac: '1'
          },
          dados: {
            data: '2025-04-15',
            valor: 1500.75,
            seu_numero: '123456789'
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/cnab240/fornecedores')
      .send(payload);
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Erro de validação');
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /api/cnab240/fornecedores sem pagamentos deve retornar status 400', async () => {
    const payload = {
      empresa: dadosEmpresa,
      pagamentos: [] // Array vazio
    };

    const response = await request(app)
      .post('/api/cnab240/fornecedores')
      .send(payload);
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Erro de validação');
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('POST para endpoint inexistente deve retornar status 404', async () => {
    const response = await request(app)
      .post('/api/cnab240/inexistente')
      .send({});
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Endpoint não encontrado');
  });
});
