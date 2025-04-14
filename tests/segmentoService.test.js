/**
 * Testes unitários para o serviço de geração de Segmentos A e B CNAB 240
 */

const { 
  gerarSegmentoA, 
  gerarSegmentoB,
  gerarSegmentoC
} = require('../src/services/cnab240/segmentoService');

const { 
  INSCRIPTION_TYPES,
  BANK_CODES,
  RECORD_TYPES
} = require('../src/config/constants');

describe('Segmento Service - CNAB 240', () => {
  describe('gerarSegmentoA', () => {
    test('deve gerar um segmento A válido para pagamento de fornecedores', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: {
          tipo_inscricao: INSCRIPTION_TYPES.CNPJ,
          inscricao_numero: '12345678901234',
          nome: 'FORNECEDOR TESTE LTDA',
          banco: '341',
          agencia: '1234',
          conta: '123456',
          dac: '7'
        },
        pagamento: {
          data: '2025-04-05',
          valor: 1234.56,
          seu_numero: '123456789',
          nosso_numero: '987654321',
          finalidade_doc: '01',
          finalidade_ted: '00001',
          aviso: '2'
        }
      };

      const segmento = gerarSegmentoA(params);
      
      expect(segmento.length).toBe(240);
      expect(segmento.substring(0, 3)).toBe('341');
      expect(segmento.substring(7, 8)).toBe('3');
      expect(segmento.substring(13, 14)).toBe('A');
      expect(segmento.substring(43, 73)).toBe('FORNECEDOR TESTE LTDA'.padEnd(30, ' '));
    });

    test('deve gerar um segmento A válido para pagamento de salários', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        funcionario: {
          tipo_inscricao: INSCRIPTION_TYPES.CPF,
          inscricao_numero: '12345678901',
          nome: 'FUNCIONARIO TESTE',
          banco: '341',
          agencia: '1234',
          conta: '123456',
          dac: '7',
          dados: {
            data: '2025-04-05',
            valor: 3500.00,
            seu_numero: '123456789',
            nosso_numero: '987654321',
            finalidade_doc: '03',
            finalidade_ted: '00003',
            aviso: '2'
          }
        }
      };

      const segmento = gerarSegmentoA(params);
      
      expect(segmento.length).toBe(240);
      expect(segmento.substring(0, 3)).toBe('341');
      expect(segmento.substring(7, 8)).toBe('3');
      expect(segmento.substring(13, 14)).toBe('A');
      expect(segmento.substring(43, 73)).toBe('FUNCIONARIO TESTE'.padEnd(30, ' '));
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

  describe('gerarSegmentoC', () => {
    test('deve gerar um segmento C válido para informações complementares de funcionário', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        funcionario: {
          tipo_inscricao: INSCRIPTION_TYPES.CPF,
          inscricao_numero: '12345678901',
          nome: 'FUNCIONARIO TESTE',
          complemento: {
            valor_ir: 100.00,
            valor_iss: 50.00,
            valor_inss: 200.00,
            valor_fgts: 150.00,
            valor_descontos: 75.00,
            valor_adicional: 25.00,
            numero_processo: '123456789',
            numero_nota: '987654321'
          }
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
      expect(segmento.substring(17, 18)).toBe('1'); // Tipo de inscrição
      expect(segmento.substring(18, 32)).toBe('12345678901'.padEnd(14, ' ')); // Número de inscrição
    });

    test('deve gerar um segmento C válido com valores zerados quando não informados', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        funcionario: {
          tipo_inscricao: INSCRIPTION_TYPES.CPF,
          inscricao_numero: '12345678901',
          nome: 'FUNCIONARIO TESTE',
          complemento: {}
        }
      };

      const segmento = gerarSegmentoC(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica se os valores monetários estão zerados
      expect(segmento.substring(32, 47)).toBe('000000000000000'); // Valor IR
      expect(segmento.substring(47, 62)).toBe('000000000000000'); // Valor ISS
      expect(segmento.substring(62, 77)).toBe('000000000000000'); // Valor INSS
      expect(segmento.substring(77, 92)).toBe('000000000000000'); // Valor FGTS
      expect(segmento.substring(92, 107)).toBe('000000000000000'); // Valor Descontos
      expect(segmento.substring(107, 122)).toBe('000000000000000'); // Valor Adicional
    });

    test('deve gerar um segmento C válido com valores decimais', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        funcionario: {
          tipo_inscricao: INSCRIPTION_TYPES.CPF,
          inscricao_numero: '12345678901',
          nome: 'FUNCIONARIO TESTE',
          complemento: {
            valor_ir: 123.45,
            valor_iss: 67.89,
            valor_inss: 987.65,
            valor_fgts: 432.10,
            valor_descontos: 111.11,
            valor_adicional: 222.22
          }
        }
      };

      const segmento = gerarSegmentoC(params);
      
      // Verifica se os valores monetários estão formatados corretamente
      expect(segmento.substring(32, 47)).toBe('000000000012345'); // Valor IR
      expect(segmento.substring(47, 62)).toBe('000000000006789'); // Valor ISS
      expect(segmento.substring(62, 77)).toBe('000000000098765'); // Valor INSS
      expect(segmento.substring(77, 92)).toBe('000000000043210'); // Valor FGTS
      expect(segmento.substring(92, 107)).toBe('000000000011111'); // Valor Descontos
      expect(segmento.substring(107, 122)).toBe('000000000022222'); // Valor Adicional
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoC({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    test('deve lançar erro quando funcionario não é fornecido', () => {
      expect(() => {
        gerarSegmentoC({
          numero_lote: 1,
          numero_registro: 3
        });
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    test('deve lançar erro quando tipo_inscricao não é fornecido', () => {
      expect(() => {
        gerarSegmentoC({
          numero_lote: 1,
          numero_registro: 3,
          funcionario: {
            inscricao_numero: '12345678901',
            nome: 'FUNCIONARIO TESTE'
          }
        });
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });

    test('deve lançar erro quando inscricao_numero não é fornecido', () => {
      expect(() => {
        gerarSegmentoC({
          numero_lote: 1,
          numero_registro: 3,
          funcionario: {
            tipo_inscricao: INSCRIPTION_TYPES.CPF,
            nome: 'FUNCIONARIO TESTE'
          }
        });
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});
