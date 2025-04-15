const { gerarSegmentoA, gerarSegmentoB } = require('../../src/services/cnab240/segmentoService');

describe('segmentoService', () => {
  describe('gerarSegmentoA', () => {
    it('deve gerar um segmento A válido para pagamento a fornecedor', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 2,
        favorecido: {
          tipo_inscricao: '2', // CNPJ
          inscricao_numero: '12345678901234',
          nome: 'FORNECEDOR XYZ LTDA',
          banco: {
            codigo: '033', // Santander
            agencia: '1234',
            agencia_dv: '5',
            conta: '123456',
            conta_dv: '7'
          }
        },
        pagamento: {
          valor: 1500.75,
          data_pagamento: '2023-06-15'
        },
        informacoes: {
          finalidade_doc: '01', // Crédito em Conta
          finalidade_ted: '00001', // Crédito em Conta
          aviso: '0' // Não emite aviso
        }
      };

      const segmento = gerarSegmentoA(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('A'); // Código do segmento (A)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(17, 20)).toBe('033'); // Código do banco favorecido
      expect(segmento.substring(20, 25)).toBe('01234'); // Agência do favorecido
      expect(segmento.substring(46, 76)).toBe('FORNECEDOR XYZ LTDA'.padEnd(30, ' ')); // Nome do favorecido
    });

    it('deve gerar um segmento A válido para pagamento de salário', () => {
      const params = {
        numero_lote: 2,
        numero_registro: 1,
        funcionario: {
          tipo_inscricao: '1', // CPF
          cpf: '12345678901',
          nome: 'FUNCIONARIO ABC',
          banco: {
            codigo: '341', // Itaú
            agencia: '5678',
            agencia_dv: '0',
            conta: '98765',
            conta_dv: '4'
          },
          dados: {
            valor: 2500.00,
            data_pagamento: '2023-06-15'
          }
        }
      };

      const segmento = gerarSegmentoA(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco emissor
      expect(segmento.substring(3, 7)).toBe('0002'); // Número do lote
      expect(segmento.substring(8, 13)).toBe('00001'); // Número do registro
      expect(segmento.substring(17, 20)).toBe('341'); // Código do banco favorecido
      expect(segmento.substring(20, 25)).toBe('05678'); // Agência do favorecido
      expect(segmento.substring(46, 76)).toBe('FUNCIONARIO ABC'.padEnd(30, ' ')); // Nome do funcionário
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarSegmentoA(null)).toThrow();
      expect(() => gerarSegmentoA({})).toThrow();
      
      // Parâmetros mínimos incompletos
      expect(() => gerarSegmentoA({
        numero_lote: 1,
        numero_registro: 1
        // Sem favorecido nem funcionário
      })).toThrow();
    });
  });

  describe('gerarSegmentoB', () => {
    it('deve gerar um segmento B válido com dados de endereço', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        favorecido: {
          nome: 'FORNECEDOR XYZ LTDA',
          endereco: {
            logradouro: 'RUA EXEMPLO',
            numero: '123',
            complemento: 'SALA 45',
            bairro: 'CENTRO',
            cidade: 'SAO PAULO',
            cep: '01234567',
            uf: 'SP'
          }
        }
      };

      const segmento = gerarSegmentoB(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('B'); // Código do segmento (B)
      
      // Verifica endereço
      const logradouroCompleto = `${params.favorecido.endereco.logradouro}, ${params.favorecido.endereco.numero} ${params.favorecido.endereco.complemento}`.substring(0, 30);
      expect(segmento.substring(18, 48)).toBe(logradouroCompleto.padEnd(30, ' ')); // Logradouro
      expect(segmento.substring(48, 63)).toBe('CENTRO'.padEnd(15, ' ')); // Bairro
      expect(segmento.substring(63, 71)).toBe('01234567'); // CEP
      expect(segmento.substring(71, 86)).toBe('SAO PAULO'.padEnd(15, ' ')); // Cidade
      expect(segmento.substring(86, 88)).toBe('SP'); // UF
    });

    it('deve gerar um segmento B válido com dados de chave PIX', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 4,
        favorecido: {
          nome: 'FORNECEDOR XYZ LTDA'
        },
        pix: {
          tipo_chave: '1', // CPF/CNPJ
          chave: '12345678901234'
        }
      };

      const segmento = gerarSegmentoB(params);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(8, 13)).toBe('00004'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('B'); // Código do segmento (B)
      
      // Verifica chave PIX
      expect(segmento.substring(18, 19)).toBe('1'); // Tipo de chave PIX
      expect(segmento.substring(19, 33)).toBe('12345678901234'); // Chave PIX
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarSegmentoB(null)).toThrow();
      expect(() => gerarSegmentoB({})).toThrow();
      
      // Parâmetros mínimos incompletos
      expect(() => gerarSegmentoB({
        numero_lote: 1,
        numero_registro: 1
        // Sem favorecido
      })).toThrow();
    });
  });
}); 