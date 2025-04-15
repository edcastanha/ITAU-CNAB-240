const { gerarSegmentoJ, gerarSegmentoJ52, gerarSegmentoJ52PIX } = require('../../src/services/cnab240/segmentoBoletoService');

describe('segmentoBoletoService', () => {
  const boletoTeste = {
    codigo_barras: '12345678901234567890123456789012345678901234',
    data_vencimento: '20230620',
    data_pagamento: '20230615',
    valor: 1250.75,
    desconto: 20.00,
    acrescimo: 10.00,
    seu_numero: '123456789012345',
    nosso_numero: '987654321098765'
  };

  describe('gerarSegmentoJ', () => {
    it('deve gerar um segmento J válido para pagamento de boleto', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        boleto: boletoTeste
      };

      const segmento = gerarSegmentoJ(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento (J)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(15, 17)).toBe('00'); // Código de instrução
      expect(segmento.substring(17, 61)).toBe('12345678901234567890123456789012345678901234'); // Código de barras
      expect(segmento.substring(61, 91)).toBe(boletoTeste.seu_numero.padEnd(30, ' ')); // Seu número
      expect(segmento.substring(91, 99)).toBe('20230620'); // Data de vencimento
      expect(segmento.substring(99, 114)).toBe('000000000125075'); // Valor do título
      expect(segmento.substring(114, 129)).toBe('000000000002000'); // Valor do desconto
      expect(segmento.substring(129, 144)).toBe('000000000001000'); // Valor do acréscimo
      expect(segmento.substring(144, 152)).toBe('20230615'); // Data do pagamento
      expect(segmento.substring(152, 167)).toBe('000000000125075'); // Valor do pagamento
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoJ({
        numero_registro: 2,
        boleto: boletoTeste
      })).toThrow();

      // Sem número do registro
      expect(() => gerarSegmentoJ({
        numero_lote: 1,
        boleto: boletoTeste
      })).toThrow();

      // Sem dados do boleto
      expect(() => gerarSegmentoJ({
        numero_lote: 1,
        numero_registro: 2
      })).toThrow();
    });

    it('deve lançar erro quando dados do boleto são incompletos', () => {
      const boletoIncompleto = {
        // Sem código de barras
        valor: 1000.00,
        data_pagamento: '20230615'
      };

      expect(() => gerarSegmentoJ({
        numero_lote: 1,
        numero_registro: 2,
        boleto: boletoIncompleto
      })).toThrow();
    });
  });

  describe('gerarSegmentoJ52', () => {
    it('deve gerar um segmento J52 válido com dados do pagador e beneficiário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        pagador: {
          tipo_inscricao: '2', // CNPJ
          inscricao_numero: '12345678901234',
          nome: 'EMPRESA PAGADORA LTDA'
        },
        beneficiario: {
          tipo_inscricao: '1', // CPF
          inscricao_numero: '12345678901',
          nome: 'CREDOR INDIVIDUAL'
        },
        sacador: {
          tipo_inscricao: '2', // CNPJ
          inscricao_numero: '98765432109876',
          nome: 'EMPRESA SACADORA'
        }
      };

      const segmento = gerarSegmentoJ52(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento (J)
      expect(segmento.substring(20, 23)).toBe('052'); // Identificador de segmento J52

      // Verifica dados do pagador
      expect(segmento.substring(23, 24)).toBe('2'); // Tipo de inscrição do pagador
      expect(segmento.substring(24, 38)).toBe('12345678901234'); // Inscrição do pagador
      expect(segmento.substring(38, 68)).toBe('EMPRESA PAGADORA LTDA'.padEnd(30, ' ')); // Nome do pagador

      // Verifica dados do beneficiário
      expect(segmento.substring(68, 69)).toBe('1'); // Tipo de inscrição do beneficiário
      expect(segmento.substring(69, 83)).toBe('00012345678901'); // Inscrição do beneficiário
      expect(segmento.substring(83, 113)).toBe('CREDOR INDIVIDUAL'.padEnd(30, ' ')); // Nome do beneficiário

      // Verifica dados do sacador
      expect(segmento.substring(113, 114)).toBe('2'); // Tipo de inscrição do sacador
      expect(segmento.substring(114, 128)).toBe('98765432109876'); // Inscrição do sacador
      expect(segmento.substring(128, 158)).toBe('EMPRESA SACADORA'.padEnd(30, ' ')); // Nome do sacador
    });

    it('deve gerar um segmento J52 válido mesmo sem sacador', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 4,
        pagador: {
          tipo_inscricao: '2',
          inscricao_numero: '12345678901234',
          nome: 'EMPRESA PAGADORA LTDA'
        },
        beneficiario: {
          tipo_inscricao: '1',
          inscricao_numero: '12345678901',
          nome: 'CREDOR INDIVIDUAL'
        }
        // Sem sacador
      };

      const segmento = gerarSegmentoJ52(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica que campos do sacador estão em branco
      expect(segmento.substring(113, 114)).toBe('0'); // Tipo de inscrição do sacador (0 = não informado)
      expect(segmento.substring(114, 128)).toBe('00000000000000'); // Inscrição do sacador em branco
      expect(segmento.substring(128, 158).trim()).toBe(''); // Nome do sacador em branco
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoJ52({
        numero_registro: 3,
        pagador: { tipo_inscricao: '2', inscricao_numero: '12345678901234', nome: 'EMPRESA' },
        beneficiario: { tipo_inscricao: '1', inscricao_numero: '12345678901', nome: 'CREDOR' }
      })).toThrow();

      // Sem informações mínimas
      expect(() => gerarSegmentoJ52({
        numero_lote: 1,
        numero_registro: 3
        // Sem pagador e beneficiário
      })).toThrow();
    });
  });

  describe('gerarSegmentoJ52PIX', () => {
    it('deve gerar um segmento J52 PIX válido', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 5,
        pix: {
          tipo_chave: '1', // CPF/CNPJ
          chave: '12345678901',
          txid: 'ABCDEF1234567890',
          descricao: 'PAGAMENTO PIX REF 123'
        }
      };

      const segmento = gerarSegmentoJ52PIX(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00005'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento (J)
      expect(segmento.substring(20, 23)).toBe('052'); // Identificador de segmento J52

      // Verifica dados do PIX
      expect(segmento.substring(23, 24)).toBe('1'); // Tipo de chave PIX
      expect(segmento.substring(24, 81)).toBe('12345678901'.padEnd(57, ' ')); // Chave PIX
      expect(segmento.substring(81, 113)).toBe('ABCDEF1234567890'.padEnd(32, ' ')); // TXID
      expect(segmento.substring(113, 153)).toBe('PAGAMENTO PIX REF 123'.padEnd(40, ' ')); // Descrição
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoJ52PIX({
        numero_registro: 5,
        pix: {
          tipo_chave: '1',
          chave: '12345678901'
        }
      })).toThrow();

      // Sem dados PIX
      expect(() => gerarSegmentoJ52PIX({
        numero_lote: 1,
        numero_registro: 5
      })).toThrow();
    });

    it('deve lançar erro quando dados PIX são incompletos', () => {
      const pixIncompleto = {
        // Sem tipo de chave
        chave: '12345678901'
      };

      expect(() => gerarSegmentoJ52PIX({
        numero_lote: 1,
        numero_registro: 5,
        pix: pixIncompleto
      })).toThrow();
    });
  });
}); 