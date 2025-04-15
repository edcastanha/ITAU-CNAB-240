const fs = require('fs');
const path = require('path');
const { 
  gerarArquivoCNAB, 
  processarLoteFornecedores, 
  processarLoteSalarios, 
  processarLoteBoletos, 
  processarLoteTributos,
  processarLotePix 
} = require('../../src/services/cnab240/cnabService');

jest.mock('fs');
jest.mock('path');

describe('cnabService', () => {
  const empresaTeste = {
    tipo_inscricao: '2', // CNPJ
    inscricao_numero: '12345678901234',
    nome: 'EMPRESA TESTE LTDA',
    agencia: '1234',
    conta: '56789',
    dac: '0',
    codigo_banco: '341' // Itaú
  };

  // Mock para funções que geram conteúdo para o arquivo
  beforeEach(() => {
    // Restaura os mocks antes de cada teste
    jest.clearAllMocks();

    // Configura mocks para funções do fs
    fs.writeFileSync = jest.fn();
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();

    // Configura mock para path.join
    path.join = jest.fn().mockImplementation((...args) => args.join('/'));
  });

  describe('gerarArquivoCNAB', () => {
    it('deve gerar um arquivo CNAB para pagamento de fornecedores', async () => {
      // Dados de entrada
      const dadosPagamento = {
        empresa: empresaTeste,
        pagamentos: [
          {
            tipo_inscricao: '1', // CPF
            inscricao_numero: '12345678901',
            nome: 'FORNECEDOR 1',
            banco: {
              codigo: '033', // Santander
              agencia: '1234',
              conta: '56789',
              dac: '1'
            },
            valor: 1000.00,
            data_pagamento: '2023-06-15'
          },
          {
            tipo_inscricao: '2', // CNPJ
            inscricao_numero: '12345678901234',
            nome: 'FORNECEDOR 2',
            banco: {
              codigo: '341', // Itaú
              agencia: '4321',
              conta: '98765',
              dac: '2'
            },
            valor: 2000.50,
            data_pagamento: '2023-06-15'
          }
        ]
      };

      // Chama a função
      const resultado = await gerarArquivoCNAB('fornecedores', dadosPagamento);

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);
      expect(resultado.arquivo).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve gerar um arquivo CNAB para pagamento de salários', async () => {
      // Dados de entrada
      const dadosPagamento = {
        empresa: empresaTeste,
        pagamentos: [
          {
            tipo_inscricao: '1', // CPF
            inscricao_numero: '12345678901',
            nome: 'FUNCIONARIO 1',
            banco: {
              codigo: '033', // Santander
              agencia: '1234',
              conta: '56789',
              dac: '1'
            },
            valor: 3000.00,
            data_pagamento: '2023-06-15'
          }
        ]
      };

      // Chama a função
      const resultado = await gerarArquivoCNAB('salarios', dadosPagamento);

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);
      expect(resultado.arquivo).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve gerar um arquivo CNAB para pagamento de boletos', async () => {
      // Dados de entrada
      const dadosPagamento = {
        empresa: empresaTeste,
        pagamentos: [
          {
            codigo_barras: '12345678901234567890123456789012345678901234',
            valor: 500.75,
            data_vencimento: '2023-06-20',
            data_pagamento: '2023-06-15'
          }
        ]
      };

      // Chama a função
      const resultado = await gerarArquivoCNAB('boletos', dadosPagamento);

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);
      expect(resultado.arquivo).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve gerar um arquivo CNAB para pagamento de tributos', async () => {
      // Dados de entrada
      const dadosPagamento = {
        empresa: empresaTeste,
        pagamentos: [
          {
            tipo: 'DARF',
            codigo_receita: '1234',
            tipo_inscricao: '2',
            inscricao_numero: '12345678901234',
            periodo_apuracao: '31052023',
            valor_principal: 750.00,
            valor_multa: 75.00,
            valor_juros_encargos: 25.00,
            data_vencimento: '20230615',
            data_pagamento: '20230615'
          }
        ]
      };

      // Chama a função
      const resultado = await gerarArquivoCNAB('tributos', dadosPagamento);

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);
      expect(resultado.arquivo).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve gerar um arquivo CNAB para pagamento PIX', async () => {
      // Dados de entrada
      const dadosPagamento = {
        empresa: empresaTeste,
        pagamentos: [
          {
            tipo_inscricao: '1', // CPF
            inscricao_numero: '12345678901',
            nome: 'BENEFICIARIO PIX',
            pix: {
              tipo_chave: '1', // CPF/CNPJ
              chave: '12345678901',
              valor: 800.25,
              data_pagamento: '2023-06-15'
            }
          }
        ]
      };

      // Chama a função
      const resultado = await gerarArquivoCNAB('pix', dadosPagamento);

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);
      expect(resultado.arquivo).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve retornar erro para tipo de pagamento inválido', async () => {
      // Chama a função com tipo inválido
      const resultado = await gerarArquivoCNAB('tipo_invalido', { empresa: empresaTeste, pagamentos: [] });

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(false);
      expect(resultado.mensagem).toContain('não suportado');
    });

    it('deve retornar erro para dados incompletos', async () => {
      // Sem empresa
      let resultado = await gerarArquivoCNAB('fornecedores', { pagamentos: [] });
      expect(resultado.success).toBe(false);

      // Sem pagamentos
      resultado = await gerarArquivoCNAB('fornecedores', { empresa: empresaTeste });
      expect(resultado.success).toBe(false);
    });
  });

  describe('processarLoteFornecedores', () => {
    it('deve processar um lote de pagamento a fornecedores corretamente', () => {
      const pagamentos = [
        {
          tipo_inscricao: '2', // CNPJ
          inscricao_numero: '12345678901234',
          nome: 'FORNECEDOR TESTE',
          banco: {
            codigo: '033', // Santander
            agencia: '1234',
            conta: '56789',
            dac: '1'
          },
          valor: 1500.50,
          data_pagamento: '2023-06-15',
          finalidade_ted: '00001',
          finalidade_doc: '01'
        }
      ];

      const lote = processarLoteFornecedores(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Deve ter um header, pelo menos um registro de detalhe e um trailer
      expect(lote.length).toBeGreaterThanOrEqual(3);
      
      // Verifica tipos de segmentos em cada registro (para detalhe)
      let temSegmentoA = false;
      let temSegmentoB = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'A') temSegmentoA = true;
          if (linha.substring(13, 14) === 'B') temSegmentoB = true;
        }
      });
      
      expect(temSegmentoA).toBe(true);
      expect(temSegmentoB).toBe(true);
    });
  });

  describe('processarLoteSalarios', () => {
    it('deve processar um lote de pagamento de salários corretamente', () => {
      const pagamentos = [
        {
          tipo_inscricao: '1', // CPF
          inscricao_numero: '12345678901',
          nome: 'FUNCIONARIO TESTE',
          banco: {
            codigo: '033', // Santander
            agencia: '1234',
            conta: '56789',
            dac: '1'
          },
          valor: 3500.75,
          data_pagamento: '2023-06-15'
        }
      ];

      const lote = processarLoteSalarios(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Deve ter um header, pelo menos um registro de detalhe e um trailer
      expect(lote.length).toBeGreaterThanOrEqual(3);
      
      // Verifica tipos de segmentos em cada registro (para detalhe)
      let temSegmentoP = false;
      let temSegmentoQ = false;
      let temSegmentoR = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'P') temSegmentoP = true;
          if (linha.substring(13, 14) === 'Q') temSegmentoQ = true;
          if (linha.substring(13, 14) === 'R') temSegmentoR = true;
        }
      });
      
      expect(temSegmentoP).toBe(true);
      expect(temSegmentoQ).toBe(true);
      expect(temSegmentoR).toBe(true);
    });
  });

  describe('processarLoteBoletos', () => {
    it('deve processar um lote de pagamento de boletos corretamente', () => {
      const pagamentos = [
        {
          codigo_barras: '12345678901234567890123456789012345678901234',
          valor: 650.25,
          data_vencimento: '2023-06-20',
          data_pagamento: '2023-06-15',
          desconto: 10.00,
          acrescimo: 5.00
        }
      ];

      const lote = processarLoteBoletos(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Verifica tipos de segmentos em cada registro (para detalhe)
      let temSegmentoJ = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'J') temSegmentoJ = true;
        }
      });
      
      expect(temSegmentoJ).toBe(true);
    });
  });

  describe('processarLoteTributos', () => {
    it('deve processar um lote de pagamento de tributos DARF corretamente', () => {
      const pagamentos = [
        {
          tipo: 'DARF',
          codigo_receita: '1234',
          tipo_inscricao: '2',
          inscricao_numero: '12345678901234',
          periodo_apuracao: '31052023',
          valor_principal: 750.00,
          valor_multa: 75.00,
          valor_juros_encargos: 25.00,
          data_vencimento: '20230615',
          data_pagamento: '20230615'
        }
      ];

      const lote = processarLoteTributos(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Verifica tipos de segmentos em cada registro (para detalhe)
      let temSegmentoN = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'N') temSegmentoN = true;
        }
      });
      
      expect(temSegmentoN).toBe(true);
    });

    it('deve processar um lote de pagamento de tributos com código de barras corretamente', () => {
      const pagamentos = [
        {
          tipo: 'GARE',
          codigo_barras: '85660000001046000851152',
          data_vencimento: '20230615',
          data_pagamento: '20230615',
          valor: 1046.00
        }
      ];

      const lote = processarLoteTributos(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Verifica tipos de segmentos em cada registro (para detalhe)
      let temSegmentoO = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'O') temSegmentoO = true;
        }
      });
      
      expect(temSegmentoO).toBe(true);
    });
  });

  describe('processarLotePix', () => {
    it('deve processar um lote de pagamento PIX corretamente', () => {
      const pagamentos = [
        {
          tipo_inscricao: '1', // CPF
          inscricao_numero: '12345678901',
          nome: 'BENEFICIARIO PIX',
          pix: {
            tipo_chave: '1', // CPF/CNPJ
            chave: '12345678901',
            valor: 800.25,
            data_pagamento: '2023-06-15'
          }
        }
      ];

      const lote = processarLotePix(empresaTeste, 1, pagamentos);

      // Verificações
      expect(lote).toBeDefined();
      expect(Array.isArray(lote)).toBe(true);
      expect(lote.length).toBeGreaterThan(0);
      
      // Verifica se existem segmentos para PIX
      let temSegmentoA = false;
      let temSegmentoB = false;
      
      lote.forEach(linha => {
        if (linha.substring(7, 8) === '3') { // Tipo de registro = 3 (detalhe)
          if (linha.substring(13, 14) === 'A') temSegmentoA = true;
          if (linha.substring(13, 14) === 'B') temSegmentoB = true;
        }
      });
      
      expect(temSegmentoA).toBe(true);
      expect(temSegmentoB).toBe(true);
    });
  });
}); 