/**
 * Testes unitários para o serviço de geração de Header e Trailer de Lote CNAB 240
 */

const {
  gerarHeaderLote,
  gerarTrailerLote,
  processarLoteSalarios
} = require('../../src/services/cnab240/loteService');

const { 
  INSCRIPTION_TYPES,
  SERVICE_TYPES,
  PAYMENT_FORMS,
  BANK_CODES,
  RECORD_TYPES
} = require('../../src/config/constants');

describe('Lote Service - CNAB 240', () => {
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

  describe('gerarHeaderLote', () => {
    it('deve gerar header de lote corretamente', () => {
      const header = gerarHeaderLote({
        empresa: dadosEmpresa,
        numero_lote: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_SALARIOS,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CONTA
      });

      expect(header).toBeDefined();
      expect(header.length).toBe(240);
      expect(header.substring(0, 3)).toBe(BANK_CODES.SANTANDER);
      expect(header.substring(3, 7)).toBe('0001');
      expect(header.substring(7, 8)).toBe('1');
      expect(header.substring(8, 9)).toBe('C');
      expect(header.substring(9, 11)).toBe(SERVICE_TYPES.PAGAMENTO_SALARIOS);
      expect(header.substring(11, 13)).toBe(PAYMENT_FORMS.CREDITO_CONTA);
      expect(header.substring(13, 16)).toBe('045');
      expect(header.substring(17, 18)).toBe(' ');
      expect(header.substring(17, 18)).toBe(' ');
      expect(header.substring(18, 19)).toBe(dadosEmpresa.tipo_inscricao);
      expect(header.substring(18, 32)).toBe(dadosEmpresa.inscricao_numero.padStart(14, '0'));
      expect(header.substring(72, 102).trim()).toBe(dadosEmpresa.nome);
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      expect(() => gerarHeaderLote({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarHeaderLote({ empresa: dadosEmpresa })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarHeaderLote({ 
        empresa: dadosEmpresa,
        numero_lote: 1
      })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar campos corretamente', () => {
      const header = gerarHeaderLote({
        empresa: dadosEmpresa,
        numero_lote: 1,
        tipo_servico: SERVICE_TYPES.PAGAMENTO_SALARIOS,
        forma_pagamento: PAYMENT_FORMS.CREDITO_CONTA
      });

      // Verifica formatação de campos numéricos
      expect(header.substring(3, 7)).toBe('0001');
      expect(header.substring(18, 32)).toBe('12345678901234');
      expect(header.substring(52, 57)).toBe('01234');

      // Verifica formatação de campos alfanuméricos
      expect(header.substring(72, 102).trim()).toBe('EMPRESA TESTE');
      expect(header.substring(172, 202).trim()).toBe('RUA TESTE');
      expect(header.substring(202, 207)).toBe('00123');
    });
  });

  describe('gerarTrailerLote', () => {
    it('deve gerar trailer de lote corretamente', () => {
      const trailer = gerarTrailerLote({
        numero_lote: 1,
        quantidade_registros: 10,
        somatoria_valores: 1000.50
      });

      expect(trailer).toBeDefined();
      expect(trailer.length).toBe(240);
      expect(trailer.substring(0, 3)).toBe(BANK_CODES.SANTANDER);
      expect(trailer.substring(3, 7)).toBe('0001');
      expect(trailer.substring(7, 8)).toBe('5');
      expect(trailer.substring(17, 23)).toBe('000012');
      expect(trailer.substring(23, 41)).toBe('000000000000100050');
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      expect(() => gerarTrailerLote({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarTrailerLote({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarTrailerLote({ 
        numero_lote: 1,
        quantidade_registros: 10
      })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar valores corretamente', () => {
      const trailer = gerarTrailerLote({
        numero_lote: 1,
        quantidade_registros: 10,
        somatoria_valores: 1234.56
      });

      expect(trailer.substring(17, 23)).toBe('000012');
      expect(trailer.substring(23, 41)).toBe('000000000000123456');
    });
  });

  describe('processarLoteSalarios', () => {
    test('deve processar um lote de salários corretamente', () => {
      const params = {
        empresa: {
          tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
          inscricao_numero: '12345678901234',
          nome: 'EMPRESA TESTE LTDA',
          agencia: '1234',
          conta: '123456',
          dac: '7'
        },
        numero_lote: 1,
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
      };

      const resultado = processarLoteSalarios(params);
      
      expect(resultado.linhas).toBeDefined();
      expect(resultado.linhas.length).toBe(5); // Header + 3 segmentos + Trailer
      expect(resultado.quantidade_registros).toBe(5);
      
      // Verifica o header do lote
      expect(resultado.linhas[0].substring(0, 3)).toBe('341');
      expect(resultado.linhas[0].substring(7, 8)).toBe('1');
      
      // Verifica os segmentos
      expect(resultado.linhas[1].substring(13, 14)).toBe('A');
      expect(resultado.linhas[2].substring(13, 14)).toBe('B');
      expect(resultado.linhas[3].substring(13, 14)).toBe('C');
      
      // Verifica o trailer do lote
      expect(resultado.linhas[4].substring(7, 8)).toBe('5');
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        processarLoteSalarios({});
      }).toThrow('Parâmetros obrigatórios não fornecidos para processar lote de salários');
    });

    test('deve lançar erro quando dados do funcionário não são fornecidos', () => {
      const params = {
        empresa: {
          tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
          inscricao_numero: '12345678901234',
          nome: 'EMPRESA TESTE LTDA',
          agencia: '1234',
          conta: '123456',
          dac: '7'
        },
        numero_lote: 1,
        pagamentos: [{}]
      };

      expect(() => {
        processarLoteSalarios(params);
      }).toThrow('Dados do funcionário não fornecidos');
    });
  });
});
