/**
 * Testes unitários para o serviço de geração de Segmentos C e D CNAB 240
 */

const { 
  gerarSegmentoC, 
  gerarSegmentoD,
  gerarSegmentoP,
  gerarSegmentoQ,
  gerarSegmentoR
} = require('../src/services/cnab240/segmentoSalarioService');

const { 
  BANK_CODES,
  RECORD_TYPES,
  INSCRIPTION_TYPES
} = require('../src/config/constants');

describe('Segmento Salario Service - CNAB 240', () => {
  describe('gerarSegmentoC', () => {
    test('deve gerar um segmento C válido com 240 caracteres para informações complementares de salário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        complemento: {
          valor_ir: 150.00,
          valor_iss: 50.00,
          valor_inss: 200.00,
          valor_fgts: 120.00,
          valor_desconto: 80.00,
          valor_abono: 100.00,
          valor_liquido: 1500.00
        }
      };

      const segmento = gerarSegmentoC(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('C'); // Código do segmento
      expect(segmento.substring(17, 32)).toBe('000000000015000'); // Valor do IR
      expect(segmento.substring(32, 47)).toBe('000000000005000'); // Valor do ISS
      expect(segmento.substring(107, 122)).toBe('000000000150000'); // Valor Líquido
    });

    test('deve gerar um segmento C válido com valores zerados quando não informados', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3
      };

      const segmento = gerarSegmentoC(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica que os valores estão zerados
      expect(segmento.substring(17, 32)).toBe('000000000000000'); // Valor do IR
      expect(segmento.substring(32, 47)).toBe('000000000000000'); // Valor do ISS
      expect(segmento.substring(107, 122)).toBe('000000000000000'); // Valor Líquido
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoC({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  describe('gerarSegmentoD', () => {
    test('deve gerar um segmento D válido com 240 caracteres para histórico de crédito', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 4,
        historico: {
          codigo: 10,
          mensagem: 'PAGAMENTO REFERENTE AO SALARIO DO MES DE ABRIL DE 2025'
        }
      };

      const segmento = gerarSegmentoD(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00004'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('D'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('10'); // Código do histórico
      // Verificar apenas os primeiros 50 caracteres da mensagem
      expect(segmento.substring(19, 69)).toBe('PAGAMENTO REFERENTE AO SALARIO DO MES DE ABRIL DE 2025'.substring(0, 50).padEnd(50, ' ')); // Parte da mensagem
    });

    test('deve gerar um segmento D válido com valores vazios quando não informados', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 4
      };

      const segmento = gerarSegmentoD(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica que os valores estão vazios/zerados
      expect(segmento.substring(17, 19)).toBe('00'); // Código do histórico
      expect(segmento.substring(19, 29)).toBe('          '); // Início da mensagem (vazia)
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoD({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });

  // Dados básicos para os testes
  const dadosBasicos = {
    numero_lote: 1,
    numero_registro: 1,
    funcionario: {
      nome: 'FUNCIONARIO TESTE',
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

  describe('gerarSegmentoP', () => {
    it('deve gerar segmento P corretamente', () => {
      const segmento = gerarSegmentoP(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('P'); // Código do segmento
      expect(segmento.substring(40, 70).trim()).toBe('FUNCIONARIO TESTE'); // Nome
      expect(segmento.substring(90, 98)).toBe('15032024'); // Data pagamento
      expect(segmento.substring(116, 131)).toBe('000000000100000'); // Valor
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoP({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoP({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoP({ ...dadosBasicos, funcionario: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar valores corretamente', () => {
      const dados = {
        ...dadosBasicos,
        valor: 1234.56,
        funcionario: {
          ...dadosBasicos.funcionario,
          nome: 'Nome Muito Longo Que Deve Ser Truncado Para Caber No Campo'
        }
      };

      const segmento = gerarSegmentoP(dados);
      
      expect(segmento.substring(40, 70).trim()).toBe('NOME MUITO LONGO QUE DEVE SER');
      expect(segmento.substring(116, 131)).toBe('000000000123456');
    });
  });

  describe('gerarSegmentoQ', () => {
    it('deve gerar segmento Q corretamente', () => {
      const segmento = gerarSegmentoQ(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('Q'); // Código do segmento
      expect(segmento.substring(17, 18)).toBe('1'); // Tipo de inscrição
      expect(segmento.substring(18, 32)).toBe('00012345678901'); // CPF
      expect(segmento.substring(32, 62).trim()).toBe('FUNCIONARIO TESTE'); // Nome
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoQ({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoQ({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoQ({ ...dadosBasicos, funcionario: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve formatar endereço corretamente', () => {
      const dados = {
        ...dadosBasicos,
        funcionario: {
          ...dadosBasicos.funcionario,
          endereco: {
            logradouro: 'Rua Muito Longa Que Deve Ser Truncada',
            bairro: 'Bairro Muito Longo',
            cidade: 'Cidade Muito Longa',
            cep: '12345678',
            uf: 'SP'
          }
        }
      };

      const segmento = gerarSegmentoQ(dados);
      
      expect(segmento.substring(62, 92).trim()).toBe('RUA MUITO LONGA QUE DEVE SER');
      expect(segmento.substring(92, 107).trim()).toBe('BAIRRO MUITO LON');
      expect(segmento.substring(115, 130).trim()).toBe('CIDADE MUITO LON');
    });
  });

  describe('gerarSegmentoR', () => {
    it('deve gerar segmento R corretamente', () => {
      const segmento = gerarSegmentoR(dadosBasicos);
      
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);
      
      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(13, 14)).toBe('R'); // Código do segmento
    });

    it('deve lançar erro se dados obrigatórios não forem fornecidos', () => {
      expect(() => gerarSegmentoR({})).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoR({ numero_lote: 1 })).toThrow('Parâmetros obrigatórios não fornecidos');
      expect(() => gerarSegmentoR({ ...dadosBasicos, funcionario: null })).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    it('deve preencher campos vazios corretamente', () => {
      const segmento = gerarSegmentoR(dadosBasicos);
      
      // Verifica campos que devem estar vazios
      expect(segmento.substring(17, 18)).toBe('0'); // Código do desconto 2
      expect(segmento.substring(18, 26)).toBe('00000000'); // Data do desconto 2
      expect(segmento.substring(26, 41)).toBe('000000000000000'); // Valor do desconto 2
      expect(segmento.substring(89, 99).trim()).toBe(''); // Informação ao pagador
    });
  });
});
