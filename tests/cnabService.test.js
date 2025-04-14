/**
 * Testes de integração para o serviço de geração de arquivos CNAB 240
 */

const fs = require('fs');
const path = require('path');
const cnabService = require('../src/services/cnab240/cnabService');
const { SERVICE_TYPES, PAYMENT_FORMS, INSCRIPTION_TYPES } = require('../src/config/constants');

// Diretório para arquivos de teste
const TEST_OUTPUT_DIR = path.join(process.cwd(), 'tests', 'output');

// Cria o diretório de saída se não existir
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

describe('CNAB Service - Integração', () => {
  // Dados de exemplo para testes
  const dadosEmpresa = {
    tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
    inscricao_numero: '12345678901234',
    nome: 'EMPRESA TESTE LTDA',
    agencia: '1234',
    conta: '123456789',
    dac: '0',
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      complemento: 'SALA 1',
      bairro: 'CENTRO',
      cidade: 'SAO PAULO',
      uf: 'SP',
      cep: '12345678'
    }
  };

  describe('Validações de Entrada', () => {
    test('deve lançar erro quando empresa não for fornecida', async () => {
      const params = {
        lotes: []
      };
      await expect(cnabService.gerarArquivoCNAB240(params, 'teste.rem'))
        .rejects
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
    });

    test('deve lançar erro quando lotes não for fornecido', async () => {
      const params = {
        empresa: dadosEmpresa
      };
      await expect(cnabService.gerarArquivoCNAB240(params, 'teste.rem'))
        .rejects
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
    });

    test('deve lançar erro quando lote não tiver tipo de serviço', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
            pagamentos: []
          }
        ]
      };

      await expect(cnabService.gerarArquivoCNAB240(params, 'teste.rem'))
        .rejects
        .toThrow('Lote 1 inválido: tipo de serviço, forma de pagamento ou pagamentos não fornecidos');
    });
  });

  describe('Pagamento de Fornecedores', () => {
    test('deve gerar um arquivo CNAB 240 completo para pagamento de fornecedores', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            tipo_servico: SERVICE_TYPES.FORNECEDORES,
            forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
            pagamentos: [
              {
                favorecido: {
                  tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
                  inscricao_numero: '98765432101234',
                  nome: 'FORNECEDOR TESTE LTDA',
                  banco: '341',
                  agencia: '4321',
                  conta: '987654321',
                  dac: '1',
                  endereco: {
                    logradouro: 'RUA FORNECEDOR',
                    numero: '456',
                    complemento: 'SALA 2',
                    bairro: 'CENTRO',
                    cidade: 'RIO DE JANEIRO',
                    uf: 'RJ',
                    cep: '98765432'
                  }
                },
                dados: {
                  data: '2025-04-15',
                  valor: 1500.75,
                  seu_numero: '123456789',
                  nosso_numero: '987654321',
                  finalidade_doc: '01',
                  finalidade_ted: '00001',
                  aviso: '2'
                }
              }
            ]
          }
        ]
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'teste_fornecedores.rem');
      const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(resultado.quantidade_lotes).toBe(1);
      expect(resultado.quantidade_registros).toBeGreaterThan(5);

      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const linhas = conteudo.split('\n');

      expect(linhas.length).toBeGreaterThan(5);
      expect(linhas[0].substring(0, 3)).toBe('341');
      expect(linhas[0].substring(7, 8)).toBe('0');
      expect(linhas[1].substring(7, 8)).toBe('1');
      expect(linhas[linhas.length - 1].substring(7, 8)).toBe('9');
    });
  });

  describe('Pagamento de Boletos', () => {
    test('deve gerar um arquivo CNAB 240 completo para pagamento de boletos', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            tipo_servico: SERVICE_TYPES.DIVERSOS,
            forma_pagamento: PAYMENT_FORMS.BOLETO_ITAU,
            pagamentos: [
              {
                boleto: {
                  codigo_barras: '12345678901234567890123456789012345678901234',
                  nome_beneficiario: 'BENEFICIARIO TESTE LTDA',
                  data_vencimento: '2025-04-20',
                  data_pagamento: '2025-04-15',
                  valor: 1200.50,
                  seu_numero: '123456789',
                  nosso_numero: '987654321',
                  valor_desconto: 0,
                  valor_abatimento: 0,
                  valor_mora: 0,
                  valor_multa: 0
                },
                pagador: {
                  tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
                  inscricao_numero: '12345678901234',
                  nome: 'EMPRESA PAGADORA LTDA',
                  endereco: {
                    logradouro: 'RUA PAGADOR',
                    numero: '789',
                    complemento: 'SALA 3',
                    bairro: 'CENTRO',
                    cidade: 'BELO HORIZONTE',
                    uf: 'MG',
                    cep: '45678901'
                  }
                },
                beneficiario: {
                  tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
                  inscricao_numero: '98765432101234',
                  nome: 'BENEFICIARIO TESTE LTDA',
                  endereco: {
                    logradouro: 'RUA BENEFICIARIO',
                    numero: '321',
                    complemento: 'SALA 4',
                    bairro: 'CENTRO',
                    cidade: 'CURITIBA',
                    uf: 'PR',
                    cep: '78901234'
                  }
                }
              }
            ]
          }
        ]
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'teste_boletos.rem');
      const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(resultado.quantidade_lotes).toBe(1);
      expect(resultado.quantidade_registros).toBeGreaterThan(5);

      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const linhas = conteudo.split('\n');

      expect(linhas.length).toBeGreaterThan(5);
      expect(linhas[0].substring(0, 3)).toBe('341');
      expect(linhas[0].substring(7, 8)).toBe('0');
      expect(linhas[1].substring(7, 8)).toBe('1');
      expect(linhas[2].substring(13, 14)).toBe('J');
    });
  });

  describe('Pagamento de Tributos', () => {
    test('deve gerar um arquivo CNAB 240 completo para pagamento de tributos com código de barras', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            tipo_servico: SERVICE_TYPES.TRIBUTOS,
            forma_pagamento: PAYMENT_FORMS.TRIBUTO_CODIGO_BARRAS,
            pagamentos: [
              {
                tributo: {
                  codigo_barras: '12345678901234567890123456789012345678901234',
                  nome_contribuinte: 'CONTRIBUINTE TESTE LTDA',
                  data_vencimento: '2025-04-20',
                  data_pagamento: '2025-04-15',
                  valor: 1500.75,
                  seu_numero: '123456789',
                  valor_desconto: 0,
                  valor_multa: 0,
                  valor_juros: 0
                }
              }
            ]
          }
        ]
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'teste_tributos.rem');
      const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(resultado.quantidade_lotes).toBe(1);
      expect(resultado.quantidade_registros).toBeGreaterThan(5);

      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const linhas = conteudo.split('\n');

      expect(linhas.length).toBeGreaterThan(5);
      expect(linhas[0].substring(0, 3)).toBe('341');
      expect(linhas[0].substring(7, 8)).toBe('0');
      expect(linhas[1].substring(7, 8)).toBe('1');
      expect(linhas[2].substring(13, 14)).toBe('O');
    });

    test('deve gerar um arquivo CNAB 240 completo para pagamento de DARF', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            tipo_servico: SERVICE_TYPES.TRIBUTOS,
            forma_pagamento: PAYMENT_FORMS.TRIBUTO_DARF,
            pagamentos: [
              {
                tributo: {
                  tipo: '01',
                  codigo_receita: '1234',
                  tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
                  inscricao_numero: '12345678901234',
                  periodo_apuracao: '032025',
                  referencia: '12345678901234567',
                  valor_principal: 1000.00,
                  valor_multa: 100.00,
                  valor_juros: 50.00,
                  data_vencimento: '2025-04-20',
                  data_pagamento: '2025-04-15',
                  seu_numero: '123456789'
                }
              }
            ]
          }
        ]
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'teste_darf.rem');
      const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(resultado.quantidade_lotes).toBe(1);
      expect(resultado.quantidade_registros).toBeGreaterThan(5);

      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const linhas = conteudo.split('\n');

      expect(linhas.length).toBeGreaterThan(5);
      expect(linhas[0].substring(0, 3)).toBe('341');
      expect(linhas[0].substring(7, 8)).toBe('0');
      expect(linhas[1].substring(7, 8)).toBe('1');
      expect(linhas[2].substring(13, 14)).toBe('N');
    });
  });

  describe('Pagamento de Salários', () => {
    test('deve gerar um arquivo CNAB 240 completo para pagamento de salários', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [
          {
            tipo_servico: SERVICE_TYPES.SALARIOS,
            forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
            pagamentos: [
              {
                funcionario: {
                  tipo_inscricao: INSCRIPTION_TYPES.CPF,
                  inscricao_numero: '12345678901',
                  nome: 'FUNCIONARIO TESTE',
                  banco: '341',
                  agencia: '1234',
                  conta: '123456',
                  dac: '7',
                  endereco: {
                    logradouro: 'RUA FUNCIONARIO',
                    numero: '789',
                    complemento: 'APTO 101',
                    bairro: 'CENTRO',
                    cidade: 'SAO PAULO',
                    uf: 'SP',
                    cep: '12345678'
                  },
                  dados: {
                    data: '2025-04-05',
                    valor: 3500.00,
                    seu_numero: '123456789',
                    nosso_numero: '987654321',
                    finalidade_doc: '03',
                    finalidade_ted: '00003',
                    aviso: '2'
                  },
                  complemento: {
                    valor_ir: '350.00',
                    valor_inss: '385.00',
                    valor_fgts: '280.00'
                  }
                }
              }
            ]
          }
        ]
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'teste_salarios.rem');
      const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(resultado.quantidade_lotes).toBe(1);
      expect(resultado.quantidade_registros).toBeGreaterThan(5);

      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const linhas = conteudo.split('\n');

      expect(linhas.length).toBeGreaterThan(5);
      expect(linhas[0].substring(0, 3)).toBe('341');
      expect(linhas[0].substring(7, 8)).toBe('0');
      expect(linhas[1].substring(7, 8)).toBe('1');
      expect(linhas[2].substring(7, 8)).toBe('3');
      expect(linhas[3].substring(7, 8)).toBe('3');
      expect(linhas[4].substring(7, 8)).toBe('3');
      expect(linhas[5].substring(7, 8)).toBe('5');
    });
  });
});
