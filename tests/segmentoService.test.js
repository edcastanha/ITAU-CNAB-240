/**
 * Testes unitários para o serviço de geração de Segmentos A e B CNAB 240
 */

const { 
  gerarSegmentoA, 
  gerarSegmentoB 
} = require('../src/services/cnab240/segmentoService');

describe('Segmento Service - CNAB 240', () => {
  describe('gerarSegmentoA', () => {
    test('deve gerar um segmento A válido com 240 caracteres para pagamento via crédito em conta', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          nome: 'FORNECEDOR TESTE LTDA',
          banco: '341',
          agencia: '1234',
          conta: '123456789012',
          dac: '1'
        },
        pagamento: {
          data: '2025-04-10',
          valor: 1500.75,
          nosso_numero: '123456789',
          seu_numero: '987654321',
          documento: 'NF12345'
        },
        informacoes: {
          finalidade_doc: '01',
          finalidade_ted: '00001',
          codigo_instrucao: '00',
          emissao_aviso: '0'
        }
      };

      const segmento = gerarSegmentoA(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00001'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('A'); // Código do segmento
      expect(segmento.substring(43, 73)).toBe('FORNECEDOR TESTE LTDA'.padEnd(30, ' ')); // Nome do favorecido
      expect(segmento.substring(93, 101)).toBe('10042025'); // Data do pagamento
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoA({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  describe('gerarSegmentoB', () => {
    test('deve gerar um segmento B válido com 240 caracteres para informações complementares', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        favorecido: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          endereco: 'RUA TESTE',
          numero: 123,
          complemento: 'SALA 456',
          bairro: 'CENTRO',
          cidade: 'SAO PAULO',
          cep: '01234567',
          estado: 'SP',
          email: 'teste@exemplo.com'
        }
      };

      const segmento = gerarSegmentoB(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('B'); // Código do segmento
      expect(segmento.substring(17, 18)).toBe('2'); // Tipo de inscrição
      expect(segmento.substring(32, 62)).toBe('RUA TESTE'.padEnd(30, ' ')); // Endereço
    });

    test('deve gerar um segmento B válido para PIX Transferência', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        favorecido: {
          tipo_inscricao: 1,
          inscricao_numero: '12345678901',
          nome: 'FAVORECIDO TESTE',
          email: 'teste@exemplo.com'
        },
        pix: {
          tipo_chave: 3, // CPF/CNPJ
          chave: '12345678901'
        }
      };

      const segmento = gerarSegmentoB(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos do PIX
      expect(segmento.substring(210, 211)).toBe('3'); // Tipo de chave PIX
      expect(segmento.substring(211, 222)).toBe('12345678901'.padEnd(11, ' ')); // Chave PIX
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoB({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});
