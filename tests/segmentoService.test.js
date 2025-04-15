/**
 * Testes unitários para o serviço de geração de Segmentos A e B CNAB 240
 */

const { 
  gerarSegmentoA, 
  gerarSegmentoB,
  gerarSegmentoC,
  gerarSegmentoD
} = require('../src/services/cnab240/segmentoService');

const { 
  INSCRIPTION_TYPES,
  BANK_CODES,
  RECORD_TYPES
} = require('../src/config/constants');

describe('Segmento Service - CNAB 240', () => {
  // Dados básicos para os testes
  const dadosBasicos = {
    numero_lote: 1,
    numero_registro: 1,
    favorecido: {
      nome: 'FAVORECIDO TESTE',
      cnpj: '12345678901234',
      banco: {
        codigo: BANK_CODES.ITAU,
        agencia: '1234',
        agencia_dv: '5',
        conta: '12345678',
        conta_dv: '9'
      },
      endereco: {
        logradouro: 'RUA TESTE',
        numero: '123',
        bairro: 'CENTRO',
        cidade: 'SAO PAULO',
        cep: '12345678',
        uf: 'SP'
      }
    },
    valor: 1000.00,
    data_pagamento: '2024-03-15'
  };

  describe('gerarSegmentoA', () => {
    it('deve gerar segmento A corretamente', () => {
      const segmento = gerarSegmentoA(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('A'); // Código do segmento
      expect(segmento.substring(40, 70).trim()).toBe('FAVORECIDO TESTE'); // Nome
      expect(segmento.substring(90, 98)).toBe('15032024'); // Data pagamento
      expect(segmento.substring(116, 131)).toBe('000000000100000'); // Valor
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoA({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoA({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoA({ ...dadosBasicos, favorecido: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar valores corretamente', () => {
      const dados = {
        ...dadosBasicos,
        valor: 1234.56,
        favorecido: {
          ...dadosBasicos.favorecido,
          nome: 'Nome Muito Longo Que Deve Ser Truncado Para Caber No Campo'
        }
      };

      const segmento = gerarSegmentoA(dados);
      
      expect(segmento.substring(40, 70).trim()).toBe('NOME MUITO LONGO QUE DEVE SER');
      expect(segmento.substring(116, 131)).toBe('000000000123456');
    });
  });

  describe('gerarSegmentoB', () => {
    it('deve gerar segmento B corretamente', () => {
      const segmento = gerarSegmentoB(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('B'); // Código do segmento
      expect(segmento.substring(17, 18)).toBe('2'); // Tipo de inscrição
      expect(segmento.substring(18, 32)).toBe('12345678901234'); // CNPJ
      expect(segmento.substring(32, 62).trim()).toBe('FAVORECIDO TESTE'); // Nome
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoB({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoB({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoB({ ...dadosBasicos, favorecido: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar endereço corretamente', () => {
      const dados = {
        ...dadosBasicos,
        favorecido: {
          ...dadosBasicos.favorecido,
          endereco: {
            logradouro: 'Rua Muito Longa Que Deve Ser Truncada',
            bairro: 'Bairro Muito Longo',
            cidade: 'Cidade Muito Longa',
            cep: '12345678',
            uf: 'SP'
          }
        }
      };

      const segmento = gerarSegmentoB(dados);
      
      expect(segmento.substring(62, 92).trim()).toBe('RUA MUITO LONGA QUE DEVE SER');
      expect(segmento.substring(92, 107).trim()).toBe('BAIRRO MUITO LON');
      expect(segmento.substring(115, 130).trim()).toBe('CIDADE MUITO LON');
    });
  });

  describe('gerarSegmentoC', () => {
    it('deve gerar segmento C corretamente', () => {
      const segmento = gerarSegmentoC(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('C'); // Código do segmento
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoC({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoC({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoC({ ...dadosBasicos, favorecido: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve preencher campos vazios corretamente', () => {
      const segmento = gerarSegmentoC(dadosBasicos);
      
      // Verifica campos que devem estar vazios
      expect(segmento.substring(17, 18)).toBe('0'); // Código do desconto 2
      expect(segmento.substring(18, 26)).toBe('00000000'); // Data do desconto 2
      expect(segmento.substring(26, 41)).toBe('000000000000000'); // Valor do desconto 2
      expect(segmento.substring(89, 99).trim()).toBe(''); // Informação ao pagador
    });
  });

  describe('gerarSegmentoD', () => {
    it('deve gerar segmento D corretamente', () => {
      const segmento = gerarSegmentoD(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('D'); // Código do segmento
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoD({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoD({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoD({ ...dadosBasicos, favorecido: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve preencher campos vazios corretamente', () => {
      const segmento = gerarSegmentoD(dadosBasicos);
      
      // Verifica campos que devem estar vazios
      expect(segmento.substring(17, 18)).toBe('0'); // Código do desconto 2
      expect(segmento.substring(18, 26)).toBe('00000000'); // Data do desconto 2
      expect(segmento.substring(26, 41)).toBe('000000000000000'); // Valor do desconto 2
      expect(segmento.substring(89, 99).trim()).toBe(''); // Informação ao pagador
    });
  });
});
