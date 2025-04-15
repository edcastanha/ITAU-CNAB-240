/**
 * Testes unitários para o serviço de geração de Segmentos N, O e W CNAB 240
 */

const { 
  gerarSegmentoO, 
  gerarSegmentoN,
  gerarSegmentoW
} = require('../src/services/cnab240/segmentoTributoService');
const { BANK_CODES, INSCRIPTION_TYPES } = require('../src/config/constants');

describe('Segmento Tributo Service - CNAB 240', () => {
  describe('gerarSegmentoO', () => {
    test('deve gerar um segmento O válido com 240 caracteres para pagamento de tributo com código de barras', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        tributo: {
          codigo_barras: '12345678901234567890123456789012345678901234',
          nome_contribuinte: 'CONTRIBUINTE TESTE LTDA',
          data_vencimento: '2025-04-15',
          data_pagamento: '2025-04-10',
          valor: 1500.75,
          seu_numero: '987654321'
        }
      };

      const segmento = gerarSegmentoO(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00001'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('O'); // Código do segmento
      expect(segmento.substring(17, 61)).toBe('12345678901234567890123456789012345678901234'); // Código de barras
      expect(segmento.substring(91, 99)).toBe('15042025'); // Data de vencimento
      expect(segmento.substring(99, 107)).toBe('10042025'); // Data de pagamento
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoO({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    test('deve lançar erro quando código de barras não tem 44 posições', () => {
      expect(() => {
        gerarSegmentoO({
          numero_lote: 1,
          numero_registro: 1,
          tributo: {
            codigo_barras: '123456',
            data_pagamento: '2025-04-10',
            valor: 1500.75
          }
        });
      }).toThrow('Código de barras deve ter 44 posições');
    });
  });

  describe('gerarSegmentoN', () => {
    test('deve gerar um segmento N válido com 240 caracteres para pagamento de DARF', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        tributo: {
          tipo: '01', // DARF
          codigo_receita: '1234',
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          periodo_apuracao: '032025',
          referencia: '12345678901234567',
          valor_principal: 1000.00,
          valor_multa: 100.00,
          valor_juros: 50.00,
          data_vencimento: '2025-04-15',
          data_pagamento: '2025-04-10'
        }
      };

      const segmento = gerarSegmentoN(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('N'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('01'); // Tipo de tributo (DARF)
      expect(segmento.substring(19, 23)).toBe('1234'); // Código da receita
      expect(segmento.substring(23, 24)).toBe('2'); // Tipo de inscrição
      expect(segmento.substring(38, 44)).toBe('032025'); // Período de apuração
    });

    test('deve calcular corretamente o valor total do tributo', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        tributo: {
          tipo: '01', // DARF
          codigo_receita: '1234',
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          periodo_apuracao: '032025',
          valor_principal: 1000.00,
          valor_multa: 100.00,
          valor_juros: 50.00,
          data_vencimento: '2025-04-15',
          data_pagamento: '2025-04-10'
        }
      };

      const segmento = gerarSegmentoN(params);
      
      // Verifica o valor total (soma de principal, multa e juros)
      // 1000.00 + 100.00 + 50.00 = 1150.00
      expect(segmento.substring(122, 137)).toBe('000000000115000');
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoN({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  describe('gerarSegmentoW', () => {
    test('deve gerar um segmento W válido com 240 caracteres para informações complementares de GARE-SP', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        gare: {
          inscricao_estadual: '123456789012',
          inscricao_divida: '1234567890123',
          periodo_referencia: '032025',
          numero_parcela: 1,
          valor_receita: 1000.00,
          valor_juros: 50.00,
          valor_multa: 100.00,
          valor_encargos: 25.00
        }
      };

      const segmento = gerarSegmentoW(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('W'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('01'); // Identificador de tributo (GARE-SP)
      expect(segmento.substring(19, 31)).toBe('123456789012'); // Inscrição estadual
      expect(segmento.substring(31, 44)).toBe('1234567890123'); // Inscrição da dívida ativa
      expect(segmento.substring(44, 50)).toBe('032025'); // Período de referência
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoW({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});

describe('Segmento Tributo Service', () => {
  const dadosFavorecido = {
    nome: 'FAVORECIDO TESTE',
    cpf: '12345678901',
    banco: '033',
    agencia: '1234',
    conta: '12345678',
    dac: '9',
    valor: 2000.00,
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      complemento: 'SALA 1',
      cidade: 'SAO PAULO',
      cep: '12345678',
      estado: 'SP'
    }
  };

  const dadosTributo = {
    valor: 2000.00,
    data_vencimento: '20240101',
    codigo_tributo: '0001',
    codigo_receita: '1234',
    tipo_identificacao: '1',
    numero_identificacao: '12345678901',
    codigo_identificacao: '1234',
    competencia: '202401',
    periodo: '202401',
    numero_referencia: '123456',
    valor_principal: 2000.00,
    valor_multa: 100.00,
    valor_juros: 50.00,
    valor_encargos: 25.00,
    valor_desconto: 0.00
  };

  const dadosGare = {
    inscricao_estadual: '123456789012',
    inscricao_divida: '1234567890123',
    periodo_referencia: '032025',
    numero_parcela: 1,
    valor_receita: 1000.00,
    valor_juros: 50.00,
    valor_multa: 100.00,
    valor_encargos: 25.00
  };

  describe('gerarSegmentoN', () => {
    it('deve gerar segmento N com sucesso', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: dadosFavorecido,
        dados_tributo: dadosTributo
      };

      const result = gerarSegmentoN(params);

      expect(result).toHaveLength(240);
      expect(result).toContain(BANK_CODES.SANTANDER);
      expect(result).toContain(dadosFavorecido.nome);
      expect(result).toContain(dadosTributo.valor.toString());
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1
      };

      expect(() => gerarSegmentoN(params))
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o Segmento N');
    });
  });

  describe('gerarSegmentoO', () => {
    it('deve gerar segmento O com sucesso', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: dadosFavorecido,
        dados_tributo: dadosTributo
      };

      const result = gerarSegmentoO(params);

      expect(result).toHaveLength(240);
      expect(result).toContain(BANK_CODES.SANTANDER);
      expect(result).toContain(dadosTributo.codigo_tributo);
      expect(result).toContain(dadosTributo.codigo_receita);
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1
      };

      expect(() => gerarSegmentoO(params))
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o Segmento O');
    });
  });

  describe('gerarSegmentoW', () => {
    it('deve gerar segmento W com sucesso', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        gare: dadosGare
      };

      const result = gerarSegmentoW(params);

      expect(result).toHaveLength(240);
      expect(result).toContain(BANK_CODES.SANTANDER);
      expect(result).toContain(dadosGare.inscricao_estadual);
      expect(result).toContain(dadosGare.inscricao_divida);
      expect(result).toContain(dadosGare.periodo_referencia);
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1
      };

      expect(() => gerarSegmentoW(params))
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o Segmento W');
    });
  });
});
