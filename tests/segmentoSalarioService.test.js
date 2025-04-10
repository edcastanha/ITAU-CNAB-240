/**
 * Testes unitários para o serviço de geração de Segmentos C e D CNAB 240
 */

const { 
  gerarSegmentoC, 
  gerarSegmentoD
} = require('../src/services/cnab240/segmentoSalarioService');

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
});
