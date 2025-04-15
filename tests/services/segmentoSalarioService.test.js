const { gerarSegmentoP, gerarSegmentoQ, gerarSegmentoR } = require('../../src/services/cnab240/segmentoSalarioService');

describe('segmentoSalarioService', () => {
  const funcionarioTeste = {
    tipo_inscricao: '1', // CPF
    cpf: '12345678901',
    nome: 'FUNCIONARIO TESTE',
    matricula: '123456',
    banco: {
      codigo: '033', // Santander
      agencia: '1234',
      agencia_dv: '5',
      conta: '123456',
      conta_dv: '7',
      agencia_conta_dv: '0'
    },
    endereco: {
      logradouro: 'RUA DOS TESTES',
      numero: '100',
      bairro: 'CENTRO',
      cidade: 'SAO PAULO',
      cep: '01234567',
      uf: 'SP'
    }
  };

  describe('gerarSegmentoP', () => {
    it('deve gerar um segmento P válido para pagamento de salário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        funcionario: funcionarioTeste,
        valor: 3500.45,
        data_pagamento: '2023-06-15',
        codigo_banco: '033' // Santander
      };

      const segmento = gerarSegmentoP(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('P'); // Código do segmento (P)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(17, 20)).toBe('033'); // Código do banco favorecido
      expect(segmento.substring(20, 25)).toBe('01234'); // Agência do favorecido
      expect(segmento.substring(40, 70)).toBe('FUNCIONARIO TESTE'.padEnd(30, ' ')); // Nome do funcionário
      expect(segmento.substring(70, 90)).toBe('123456'.padEnd(20, ' ')); // Seu número (matrícula)
      expect(segmento.substring(98, 101)).toBe('BRL'); // Tipo de moeda
      expect(segmento.substring(116, 131)).toBe('000000000350045'); // Valor do pagamento
    });

    it('deve usar banco emissor como padrão quando banco do funcionário não é informado', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        funcionario: {
          ...funcionarioTeste,
          banco: {
            // Sem código de banco
            agencia: '1234',
            conta: '123456'
          }
        },
        valor: 2000.00,
        data_pagamento: '2023-06-15'
      };

      const segmento = gerarSegmentoP(params);

      // Verifica se usa o banco padrão
      expect(segmento.substring(17, 20)).toBe('033'); // Código do banco favorecido (padrão)
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoP({
        numero_registro: 1,
        funcionario: funcionarioTeste,
        valor: 1000,
        data_pagamento: '2023-06-15'
      })).toThrow();

      // Sem dados do funcionário
      expect(() => gerarSegmentoP({
        numero_lote: 1,
        numero_registro: 1,
        valor: 1000,
        data_pagamento: '2023-06-15'
      })).toThrow();

      // Sem valor
      expect(() => gerarSegmentoP({
        numero_lote: 1,
        numero_registro: 1,
        funcionario: funcionarioTeste,
        data_pagamento: '2023-06-15'
      })).toThrow();
    });
  });

  describe('gerarSegmentoQ', () => {
    it('deve gerar um segmento Q válido com dados completos do funcionário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        funcionario: funcionarioTeste,
        codigo_banco: '033' // Santander
      };

      const segmento = gerarSegmentoQ(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('Q'); // Código do segmento (Q)
      expect(segmento.substring(17, 18)).toBe('1'); // Tipo de inscrição (1 = CPF)
      expect(segmento.substring(18, 32)).toBe('00012345678901'); // CPF (formatado com zeros à esquerda)
      expect(segmento.substring(32, 62)).toBe('FUNCIONARIO TESTE'.padEnd(30, ' ')); // Nome do favorecido
      
      // Endereço
      expect(segmento.substring(62, 92)).toBe('RUA DOS TESTES'.padEnd(30, ' ')); // Logradouro
      expect(segmento.substring(92, 107)).toBe('CENTRO'.padEnd(15, ' ')); // Bairro
      expect(segmento.substring(107, 115)).toBe('01234567'); // CEP
      expect(segmento.substring(115, 130)).toBe('SAO PAULO'.padEnd(15, ' ')); // Cidade
      expect(segmento.substring(130, 132)).toBe('SP'); // UF
    });

    it('deve gerar um segmento Q válido mesmo sem dados de endereço', () => {
      const funcionarioSemEndereco = {
        ...funcionarioTeste,
        endereco: null
      };

      const params = {
        numero_lote: 1,
        numero_registro: 3,
        funcionario: funcionarioSemEndereco,
        codigo_banco: '033'
      };

      const segmento = gerarSegmentoQ(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica se campos de endereço estão vazios
      expect(segmento.substring(62, 92).trim()).toBe(''); // Logradouro vazio
      expect(segmento.substring(92, 107).trim()).toBe(''); // Bairro vazio
      expect(segmento.substring(107, 115)).toBe('00000000'); // CEP vazio
      expect(segmento.substring(115, 130).trim()).toBe(''); // Cidade vazia
      expect(segmento.substring(130, 132).trim()).toBe(''); // UF vazia
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoQ({
        numero_registro: 1,
        funcionario: funcionarioTeste
      })).toThrow();

      // Sem dados do funcionário
      expect(() => gerarSegmentoQ({
        numero_lote: 1,
        numero_registro: 1
      })).toThrow();
    });
  });

  describe('gerarSegmentoR', () => {
    it('deve gerar um segmento R válido com dados do funcionário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        funcionario: funcionarioTeste
      };

      const segmento = gerarSegmentoR(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco (Itaú)
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('R'); // Código do segmento (R)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(15, 17)).toBe('00'); // Código de instrução
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoR({
        numero_registro: 1,
        funcionario: funcionarioTeste
      })).toThrow();

      // Sem número do registro
      expect(() => gerarSegmentoR({
        numero_lote: 1,
        funcionario: funcionarioTeste
      })).toThrow();

      // Sem dados do funcionário
      expect(() => gerarSegmentoR({
        numero_lote: 1,
        numero_registro: 1
      })).toThrow();
    });
  });
}); 