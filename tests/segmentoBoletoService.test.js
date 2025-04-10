/**
 * Testes unitários para o serviço de geração de Segmentos J e J-52 CNAB 240
 */

const { 
  gerarSegmentoJ, 
  gerarSegmentoJ52,
  gerarSegmentoJ52PIX
} = require('../src/services/cnab240/segmentoBoletoService');

describe('Segmento Boleto Service - CNAB 240', () => {
  describe('gerarSegmentoJ', () => {
    test('deve gerar um segmento J válido com 240 caracteres para pagamento de boleto', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        boleto: {
          codigo_barras: '12345678901234567890123456789012345678901234',
          nome_beneficiario: 'BENEFICIARIO TESTE LTDA',
          data_vencimento: '2025-04-15',
          data_pagamento: '2025-04-10',
          valor: 1500.75,
          valor_desconto: 10.00,
          valor_acrescimo: 5.25,
          seu_numero: '987654321'
        }
      };

      const segmento = gerarSegmentoJ(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00001'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento
      expect(segmento.substring(17, 61)).toBe('12345678901234567890123456789012345678901234'); // Código de barras
      expect(segmento.substring(91, 99)).toBe('15042025'); // Data de vencimento
      expect(segmento.substring(99, 107)).toBe('10042025'); // Data de pagamento
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoJ({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    test('deve lançar erro quando código de barras não tem 44 posições', () => {
      expect(() => {
        gerarSegmentoJ({
          numero_lote: 1,
          numero_registro: 1,
          boleto: {
            codigo_barras: '123456',
            data_pagamento: '2025-04-10',
            valor: 1500.75
          }
        });
      }).toThrow('Código de barras deve ter 44 posições');
    });
  });

  describe('gerarSegmentoJ52', () => {
    test('deve gerar um segmento J-52 válido com 240 caracteres para informações complementares de boleto', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        pagador: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          nome: 'PAGADOR TESTE LTDA'
        },
        beneficiario: {
          tipo_inscricao: 2,
          inscricao_numero: '98765432101234',
          nome: 'BENEFICIARIO TESTE LTDA'
        },
        sacador: {
          tipo_inscricao: 1,
          inscricao_numero: '12345678901',
          nome: 'SACADOR TESTE'
        }
      };

      const segmento = gerarSegmentoJ52(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('52'); // Identificador do registro opcional
      expect(segmento.substring(19, 20)).toBe('2'); // Tipo de inscrição do pagador
      expect(segmento.substring(75, 76)).toBe('2'); // Tipo de inscrição do beneficiário
    });

    test('deve gerar um segmento J-52 válido sem sacador avalista', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        pagador: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          nome: 'PAGADOR TESTE LTDA'
        },
        beneficiario: {
          tipo_inscricao: 2,
          inscricao_numero: '98765432101234',
          nome: 'BENEFICIARIO TESTE LTDA'
        }
      };

      const segmento = gerarSegmentoJ52(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica que os campos do sacador estão vazios/zerados
      expect(segmento.substring(131, 132)).toBe('0'); // Tipo de inscrição do sacador
      expect(segmento.substring(132, 147)).toBe('000000000000000'); // Número de inscrição do sacador
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoJ52({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  describe('gerarSegmentoJ52PIX', () => {
    test('deve gerar um segmento J-52 PIX válido com 240 caracteres para pagamento via QR Code', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        pix: {
          tipo_chave: 3, // CPF/CNPJ
          chave: '12345678901',
          tx_id: 'TX123456789012345',
          info_adicional: 'PAGAMENTO REFERENTE A FATURA 12345'
        }
      };

      const segmento = gerarSegmentoJ52PIX(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('52'); // Identificador do registro opcional
      expect(segmento.substring(19, 20)).toBe('3'); // Tipo de chave PIX
      expect(segmento.substring(20, 31)).toBe('12345678901'); // Chave PIX
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoJ52PIX({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});
