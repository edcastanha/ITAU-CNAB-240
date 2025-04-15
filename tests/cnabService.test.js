/**
 * Testes de integração para o serviço de geração de arquivos CNAB 240
 */

const fs = require('fs');
const path = require('path');
const { 
  gerarArquivoCNAB240,
  processarLoteSalarios,
  processarLoteFornecedores,
  processarLoteBoletos,
  processarLoteTributos,
  processarLotePIX,
  salvarArquivo
} = require('../src/services/cnab240/cnabService');
const { SERVICE_TYPES, PAYMENT_FORMS, INSCRIPTION_TYPES, BANK_CODES } = require('../src/config/constants');

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
      await expect(gerarArquivoCNAB240(params, 'teste.rem'))
        .rejects
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
    });

    test('deve lançar erro quando lotes não for fornecido', async () => {
      const params = {
        empresa: dadosEmpresa
      };
      await expect(gerarArquivoCNAB240(params, 'teste.rem'))
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

      await expect(gerarArquivoCNAB240(params, 'teste.rem'))
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
      const resultado = await gerarArquivoCNAB240(params, outputPath);

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
      const resultado = await gerarArquivoCNAB240(params, outputPath);

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
      const resultado = await gerarArquivoCNAB240(params, outputPath);

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
      const resultado = await gerarArquivoCNAB240(params, outputPath);

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
      const resultado = await gerarArquivoCNAB240(params, outputPath);

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

describe('Exemplo CNAB 240', () => {
  test('deve gerar um arquivo CNAB 240 igual ao exemplo', async () => {
    const params = {
      empresa: {
        codigo_banco: '033',
        nome: 'EMPRESA ABC',
        agencia: '3300',
        conta: '000000106682',
        dac: '0',
        tipo_inscricao: '2',
        inscricao_numero: '00000000000000'
      },
      lotes: [
        {
          tipo_servico: '30',
          forma_pagamento: '01',
          finalidade_lote: 'PAGAMENTO DE SALARIOS',
          pagamentos: [
            {
              funcionario: {
                nome: 'JOSE DA SILVA ALVES',
                cpf: '000012312212356',
                endereco: {
                  logradouro: 'RUA DOS DEVELOPERS,123 SL 103',
                  bairro: 'BAIRRO DA INSON',
                  cep: '12345123',
                  cidade: 'LONDRINA',
                  estado: 'PR'
                },
                banco: {
                  codigo: '033',
                  agencia: '3300',
                  conta: '601234567890123456789',
                  dac: '0'
                },
                valor: 507.51,
                data_pagamento: '09042016',
                complemento: {
                  valor_ir: 0,
                  valor_iss: 0,
                  valor_inss: 0,
                  valor_fgts: 0,
                  valor_descontos: 0,
                  valor_bonus: 0,
                  numero_processo: '0000000000000000',
                  numero_nota_fiscal: '000000000000'
                }
              }
            }
          ]
        }
      ]
    };

    const outputPath = path.join(TEST_OUTPUT_DIR, 'exemplo_01.rem');
    const resultado = await gerarArquivoCNAB240(params, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
    expect(resultado.quantidade_lotes).toBe(1);
    expect(resultado.quantidade_registros).toBe(10);

    const conteudo = fs.readFileSync(outputPath, 'utf8');
    const linhas = conteudo.split('\n');

    // Verifica o header do arquivo
    expect(linhas[0].substring(0, 3)).toBe('033');
    expect(linhas[0].substring(7, 8)).toBe('0');
    expect(linhas[0].substring(17, 18)).toBe('2');
    expect(linhas[0].substring(18, 32)).toBe('00000000000000');
    expect(linhas[0].substring(72, 102)).toBe('EMPRESA ABC'.padEnd(30, ' '));
    expect(linhas[0].substring(102, 132)).toBe('BANCO SANTANDER'.padEnd(30, ' '));

    // Verifica o header do lote
    expect(linhas[1].substring(0, 3)).toBe('033');
    expect(linhas[1].substring(7, 8)).toBe('1');
    expect(linhas[1].substring(9, 11)).toBe('30');
    expect(linhas[1].substring(17, 18)).toBe('2');
    expect(linhas[1].substring(18, 32)).toBe('00000000000000');
    expect(linhas[1].substring(72, 102)).toBe('EMPRESA ABC'.padEnd(30, ' '));

    // Verifica o segmento P
    expect(linhas[2].substring(0, 3)).toBe('033');
    expect(linhas[2].substring(13, 14)).toBe('P');
    expect(linhas[2].substring(15, 19)).toBe('0330');
    expect(linhas[2].substring(19, 23)).toBe('3300');
    expect(linhas[2].substring(23, 35)).toBe('601234567890');
    expect(linhas[2].substring(42, 49)).toBe('09042016');
    expect(linhas[2].substring(77, 92)).toBe('000000000050751');

    // Verifica o segmento Q
    expect(linhas[3].substring(0, 3)).toBe('033');
    expect(linhas[3].substring(13, 14)).toBe('Q');
    expect(linhas[3].substring(15, 16)).toBe('1');
    expect(linhas[3].substring(16, 30)).toBe('000012312212356');
    expect(linhas[3].substring(30, 60)).toBe('JOSE DA SILVA ALVES'.padEnd(30, ' '));
    expect(linhas[3].substring(60, 95)).toBe('RUA DOS DEVELOPERS,123 SL 103'.padEnd(35, ' '));
    expect(linhas[3].substring(95, 120)).toBe('BAIRRO DA INSON'.padEnd(25, ' '));
    expect(linhas[3].substring(120, 125)).toBe('12345');
    expect(linhas[3].substring(125, 130)).toBe('123');
    expect(linhas[3].substring(130, 150)).toBe('LONDRINA'.padEnd(20, ' '));
    expect(linhas[3].substring(150, 152)).toBe('PR');

    // Verifica o segmento R
    expect(linhas[4].substring(0, 3)).toBe('033');
    expect(linhas[4].substring(13, 14)).toBe('R');
    expect(linhas[4].substring(14, 15)).toBe('0');

    // Verifica o trailer do lote
    expect(linhas[linhas.length - 2].substring(0, 3)).toBe('033');
    expect(linhas[linhas.length - 2].substring(7, 8)).toBe('5');
    expect(linhas[linhas.length - 2].substring(17, 23)).toBe('000008');

    // Verifica o trailer do arquivo
    expect(linhas[linhas.length - 1].substring(0, 3)).toBe('033');
    expect(linhas[linhas.length - 1].substring(7, 8)).toBe('9');
    expect(linhas[linhas.length - 1].substring(17, 23)).toBe('000001');
    expect(linhas[linhas.length - 1].substring(23, 29)).toBe('000010');
  });
});

describe('CNAB Service - Fluxos Completos', () => {
  // Dados da empresa para todos os testes
  const empresa = {
    codigo: '123456',
    nome: 'EMPRESA ABC',
    cnpj: '12345678901234',
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      cidade: 'SAO PAULO',
      cep: '12345678',
      uf: 'SP'
    }
  };

  describe('Fluxo de Pagamento de Salários', () => {
    it('deve gerar arquivo CNAB 240 para pagamento de salários', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_SALARIOS,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CONTA,
        finalidade_lote: '101',
          pagamentos: [
            {
            funcionario: {
              nome: 'FUNCIONARIO 1',
              cpf: '12345678901',
              matricula: '12345',
              banco: {
                codigo: BANK_CODES.SANTANDER,
                agencia: '1234',
                agencia_dv: '5',
                conta: '12345678',
                conta_dv: '9'
              },
              endereco: {
                logradouro: 'RUA FUNCIONARIO',
                numero: '123',
                bairro: 'CENTRO',
                cidade: 'SAO PAULO',
                cep: '12345678',
                uf: 'SP'
              }
            },
            valor: 1000.00,
            data_pagamento: '2024-03-15'
          }
        ]
      };

      const arquivo = gerarArquivoCNAB240(empresa, [lote]);
      
      // Verifica estrutura básica
      expect(arquivo).toBeDefined();
      expect(arquivo.linhas).toBeDefined();
      expect(arquivo.linhas.length).toBeGreaterThan(0);
      
      // Verifica header do arquivo
      const headerArquivo = arquivo.linhas[0];
      expect(headerArquivo.substring(1, 3)).toBe('33'); // Código do banco
      expect(headerArquivo.substring(8, 8)).toBe('0'); // Tipo de registro
      
      // Verifica header do lote
      const headerLote = arquivo.linhas[1];
      expect(headerLote.substring(8, 8)).toBe('1'); // Tipo de registro
      expect(headerLote.substring(13, 13)).toBe('P'); // Tipo de serviço
      
      // Verifica segmentos P, Q, R
      const segmentoP = arquivo.linhas[2];
      const segmentoQ = arquivo.linhas[3];
      const segmentoR = arquivo.linhas[4];
      
      expect(segmentoP.substring(13, 13)).toBe('P');
      expect(segmentoQ.substring(13, 13)).toBe('Q');
      expect(segmentoR.substring(13, 13)).toBe('R');
      
      // Verifica trailer do lote
      const trailerLote = arquivo.linhas[5];
      expect(trailerLote.substring(8, 8)).toBe('5');
      
      // Verifica trailer do arquivo
      const trailerArquivo = arquivo.linhas[6];
      expect(trailerArquivo.substring(8, 8)).toBe('9');
    });
  });

  describe('Fluxo de Pagamento de Fornecedores', () => {
    it('deve gerar arquivo CNAB 240 para pagamento de fornecedores', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_FORNECEDORES,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CONTA,
          pagamentos: [
            {
              favorecido: {
              nome: 'FORNECEDOR 1',
              cnpj: '12345678901234',
              banco: {
                codigo: BANK_CODES.ITAU,
                agencia: '1234',
                agencia_dv: '5',
                conta: '12345678',
                conta_dv: '9'
              },
              endereco: {
                logradouro: 'RUA FORNECEDOR',
                numero: '123',
                bairro: 'CENTRO',
                cidade: 'SAO PAULO',
                cep: '12345678',
                uf: 'SP'
              }
            },
            valor: 1000.00,
            data_pagamento: '2024-03-15'
          }
        ]
      };

      const arquivo = gerarArquivoCNAB240(empresa, [lote]);
      
      // Verifica estrutura básica
      expect(arquivo).toBeDefined();
      expect(arquivo.linhas).toBeDefined();
      expect(arquivo.linhas.length).toBeGreaterThan(0);
      
      // Verifica segmentos A e B
      const segmentoA = arquivo.linhas[2];
      const segmentoB = arquivo.linhas[3];
      
      expect(segmentoA.substring(13, 13)).toBe('A');
      expect(segmentoB.substring(13, 13)).toBe('B');
    });
  });

  describe('Fluxo de Pagamento de Boletos', () => {
    it('deve gerar arquivo CNAB 240 para pagamento de boletos', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_BOLETOS,
        forma_pagamento: PAYMENT_FORMS.BOLETO,
        pagamentos: [
          {
            boleto: {
              numero: '123456789012',
              valor: 1000.00,
              data_vencimento: '2024-03-15',
              data_pagamento: '2024-03-15',
              codigo_barras: '12345678901234567890123456789012345678901234',
              linha_digitavel: '12345678901234567890123456789012345678901234567890',
              favorecido: {
                nome: 'FAVORECIDO BOLETO',
                cnpj: '12345678901234'
              }
            }
          }
        ]
      };

      const arquivo = gerarArquivoCNAB240(empresa, [lote]);
      
      // Verifica estrutura básica
      expect(arquivo).toBeDefined();
      expect(arquivo.linhas).toBeDefined();
      expect(arquivo.linhas.length).toBeGreaterThan(0);
      
      // Verifica segmentos J e J-52
      const segmentoJ = arquivo.linhas[2];
      const segmentoJ52 = arquivo.linhas[3];
      
      expect(segmentoJ.substring(13, 13)).toBe('J');
      expect(segmentoJ52.substring(13, 13)).toBe('J');
    });
  });

  describe('Fluxo de Pagamento de Tributos', () => {
    it('deve gerar arquivo CNAB 240 para pagamento de tributos', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_TRIBUTOS,
        forma_pagamento: PAYMENT_FORMS.TRIBUTO,
          pagamentos: [
            {
              tributo: {
              codigo: '123456',
              valor: 1000.00,
              data_vencimento: '2024-03-15',
              data_pagamento: '2024-03-15',
                codigo_barras: '12345678901234567890123456789012345678901234',
              linha_digitavel: '12345678901234567890123456789012345678901234567890',
              favorecido: {
                nome: 'FAVORECIDO TRIBUTO',
                cnpj: '12345678901234'
              }
            }
          }
        ]
      };

      const arquivo = gerarArquivoCNAB240(empresa, [lote]);
      
      // Verifica estrutura básica
      expect(arquivo).toBeDefined();
      expect(arquivo.linhas).toBeDefined();
      expect(arquivo.linhas.length).toBeGreaterThan(0);
      
      // Verifica segmentos O, N e W
      const segmentoO = arquivo.linhas[2];
      const segmentoN = arquivo.linhas[3];
      const segmentoW = arquivo.linhas[4];
      
      expect(segmentoO.substring(13, 13)).toBe('O');
      expect(segmentoN.substring(13, 13)).toBe('N');
      expect(segmentoW.substring(13, 13)).toBe('W');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lançar erro ao tentar gerar arquivo sem dados da empresa', () => {
      expect(() => {
        gerarArquivoCNAB240(null, []);
      }).toThrow('Dados da empresa são obrigatórios');
    });

    it('deve lançar erro ao tentar gerar arquivo sem lotes', () => {
      expect(() => {
        gerarArquivoCNAB240(empresa, []);
      }).toThrow('Pelo menos um lote deve ser fornecido');
    });

    it('deve lançar erro ao tentar gerar lote de salários sem dados do funcionário', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_SALARIOS,
        pagamentos: [{}]
      };

      expect(() => {
        processarLoteSalarios(empresa, lote);
      }).toThrow('Dados do funcionário são obrigatórios');
    });

    it('deve lançar erro ao tentar gerar lote de fornecedores sem dados do favorecido', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_FORNECEDORES,
        pagamentos: [{}]
      };

      expect(() => {
        processarLoteFornecedores(empresa, lote);
      }).toThrow('Dados do favorecido são obrigatórios');
    });

    it('deve lançar erro ao tentar gerar lote de boletos sem dados do boleto', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_BOLETOS,
        pagamentos: [{}]
      };

      expect(() => {
        processarLoteBoletos(empresa, lote);
      }).toThrow('Dados do boleto são obrigatórios');
    });

    it('deve lançar erro ao tentar gerar lote de tributos sem dados do tributo', () => {
      const lote = {
        numero: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_TRIBUTOS,
        pagamentos: [{}]
      };

      expect(() => {
        processarLoteTributos(empresa, lote);
      }).toThrow('Dados do tributo são obrigatórios');
    });
  });
});

describe('CNAB Service', () => {
  const dadosEmpresa = {
    tipo_inscricao: '2',
    inscricao_numero: '12345678901234',
    codigo_convenio: '123456',
    agencia: '1234',
    conta: '12345678',
    dac: '9',
    nome: 'EMPRESA TESTE',
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      complemento: 'SALA 1',
      cidade: 'SAO PAULO',
      cep: '12345678',
      estado: 'SP'
    }
  };

  const pagamentoFornecedor = {
    favorecido: {
      nome: 'FORNECEDOR TESTE',
      cpf: '12345678901',
      banco: '033',
      agencia: '1234',
      conta: '12345678',
      dac: '9'
    },
    dados: {
      valor: 1000.50,
      data_pagamento: '20240101'
    }
  };

  const pagamentoSalario = {
    funcionario: {
      nome: 'FUNCIONARIO TESTE',
      cpf: '12345678901',
      banco: '033',
      agencia: '1234',
      conta: '12345678',
      dac: '9',
      valor: 2000.00
    }
  };

  const pagamentoTributo = {
    tributo: {
      codigo_barras: '12345678901234567890123456789012345678901234',
      valor: 500.00,
      data_vencimento: '20240101'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gerarArquivoCNAB240', () => {
    it('deve gerar arquivo CNAB 240 com sucesso', async () => {
      const params = {
        empresa: dadosEmpresa,
        lotes: [{
          tipo_servico: SERVICE_TYPES.PAGAMENTO_FORNECEDORES,
          forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
          pagamentos: [pagamentoFornecedor]
        }]
      };

      const result = await gerarArquivoCNAB240(params, '/caminho/arquivo.rem');

      expect(result).toEqual({
        linhas: expect.any(Array),
        quantidade_lotes: 1,
        quantidade_registros: expect.any(Number)
      });
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', async () => {
      await expect(gerarArquivoCNAB240({}, '/caminho/arquivo.rem'))
        .rejects
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
    });
  });

  describe('processarLoteFornecedores', () => {
    it('deve processar lote de fornecedores com sucesso', () => {
      const params = {
        empresa: dadosEmpresa,
        numero_lote: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_FORNECEDORES,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
        pagamentos: [pagamentoFornecedor]
      };

      const result = processarLoteFornecedores(params);

      expect(result).toEqual({
        linhas: expect.any(Array),
        quantidade_registros: expect.any(Number),
        somatoria_valores: pagamentoFornecedor.dados.valor
      });
    });
  });

  describe('processarLoteSalarios', () => {
    it('deve processar lote de salários com sucesso', () => {
      const params = {
        empresa: dadosEmpresa,
        numero_lote: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_SALARIOS,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
        pagamentos: [pagamentoSalario]
      };

      const result = processarLoteSalarios(params);

      expect(result).toEqual({
        linhas: expect.any(Array),
        quantidade_registros: expect.any(Number),
        somatoria_valores: pagamentoSalario.funcionario.valor
      });
    });
  });

  describe('processarLoteTributos', () => {
    it('deve processar lote de tributos com sucesso', () => {
      const params = {
        empresa: dadosEmpresa,
        numero_lote: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_TRIBUTOS,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
        pagamentos: [pagamentoTributo]
      };

      const result = processarLoteTributos(params);

      expect(result).toEqual({
        linhas: expect.any(Array),
        quantidade_registros: expect.any(Number),
        somatoria_valores: pagamentoTributo.tributo.valor
      });
    });
  });

  describe('salvarArquivo', () => {
    it('deve salvar arquivo com sucesso', async () => {
      const linhas = ['LINHA1', 'LINHA2'];
      const outputPath = '/caminho/arquivo.rem';

      await salvarArquivo(linhas, outputPath);

      expect(require('fs').promises.writeFile).toHaveBeenCalledWith(
        outputPath,
        linhas.join('\n'),
        'utf8'
      );
    });
  });
});
