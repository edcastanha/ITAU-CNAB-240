/**
 * Testes unitários para o serviço de geração de Header e Trailer de Lote CNAB 240
 */

const { 
  gerarHeaderLote, 
  gerarTrailerLote 
} = require('../src/services/cnab240/loteService');

describe('Lote Service - CNAB 240', () => {
  describe('gerarHeaderLote', () => {
    test('deve gerar um header de lote válido com 240 caracteres para pagamento de fornecedores', () => {
      const params = {
        numero_lote: 1,
        tipo_servico: '20', // Fornecedores
        forma_pagamento: '01', // Crédito em Conta Corrente
        empresa: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          agencia: '1234',
          conta: '123456789012',
          dac: '1',
          nome: 'EMPRESA TESTE LTDA'
        },
        identificacao_lancamento: 'FORN',
        finalidade_lote: 'PAGAMENTO A FORNECEDORES',
        endereco: {
          logradouro: 'RUA TESTE',
          numero: 123,
          complemento: 'SALA 456',
          cidade: 'SAO PAULO',
          cep: '01234567',
          estado: 'SP'
        }
      };

      const header = gerarHeaderLote(params);
      
      // Verifica se o tamanho está correto
      expect(header.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(header.substring(0, 3)).toBe('341'); // Código do banco
      expect(header.substring(3, 7)).toBe('0001'); // Código do lote
      expect(header.substring(7, 8)).toBe('1'); // Tipo de registro
      expect(header.substring(8, 9)).toBe('C'); // Tipo de operação
      expect(header.substring(9, 11)).toBe('20'); // Tipo de serviço
      expect(header.substring(11, 13)).toBe('01'); // Forma de pagamento
      expect(header.substring(32, 36)).toBe('FORN'); // Identificação do lançamento
    });

    test('deve gerar um header de lote válido para pagamento de salários', () => {
      const params = {
        numero_lote: 2,
        tipo_servico: '30', // Salários
        forma_pagamento: '01', // Crédito em Conta Corrente
        empresa: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          agencia: '1234',
          conta: '123456789012',
          dac: '1',
          nome: 'EMPRESA TESTE LTDA'
        },
        identificacao_lancamento: 'SALA',
        finalidade_lote: 'PAGAMENTO DE SALARIOS'
      };

      const header = gerarHeaderLote(params);
      
      // Verifica se o tamanho está correto
      expect(header.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(header.substring(9, 11)).toBe('30'); // Tipo de serviço (Salários)
      expect(header.substring(32, 36)).toBe('SALA'); // Identificação do lançamento
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarHeaderLote({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  describe('gerarTrailerLote', () => {
    test('deve gerar um trailer de lote válido com 240 caracteres', () => {
      const params = {
        numero_lote: 1,
        quantidade_registros: 5,
        somatoria_valores: 1500.75
      };

      const trailer = gerarTrailerLote(params);
      
      // Verifica se o tamanho está correto
      expect(trailer.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(trailer.substring(0, 3)).toBe('341'); // Código do banco
      expect(trailer.substring(3, 7)).toBe('0001'); // Código do lote
      expect(trailer.substring(7, 8)).toBe('5'); // Tipo de registro
      expect(trailer.substring(17, 23)).toBe('000005'); // Quantidade de registros
      expect(trailer.substring(23, 41)).toBe('000000000000150075'); // Somatória dos valores
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarTrailerLote({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});
