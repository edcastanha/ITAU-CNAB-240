/**
 * Testes unitários para o serviço de geração de Header e Trailer de Arquivo CNAB 240
 */

const { 
  gerarHeaderArquivo, 
  gerarTrailerArquivo 
} = require('../src/services/cnab240/arquivoService');

describe('Arquivo Service - CNAB 240', () => {
  describe('gerarHeaderArquivo', () => {
    test('deve gerar um header de arquivo válido com 240 caracteres', () => {
      const params = {
        empresa: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          agencia: '1234',
          conta: '123456789012',
          dac: '1',
          nome: 'EMPRESA TESTE LTDA'
        },
        data_geracao: '2025-04-04',
        hora_geracao: '101010'
      };

      const header = gerarHeaderArquivo(params);
      
      // Verifica se o tamanho está correto
      expect(header.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(header.substring(0, 3)).toBe('341'); // Código do banco
      expect(header.substring(3, 7)).toBe('0000'); // Código do lote
      expect(header.substring(7, 8)).toBe('0'); // Tipo de registro
      expect(header.substring(142, 143)).toBe('1'); // Código remessa
      expect(header.substring(143, 151)).toBe('04042025'); // Data de geração
      expect(header.substring(151, 157)).toBe('101010'); // Hora de geração
    });

    test('deve usar a data e hora atual quando não informadas', () => {
      const params = {
        empresa: {
          tipo_inscricao: 2,
          inscricao_numero: '12345678901234',
          agencia: '1234',
          conta: '123456789012',
          dac: '1',
          nome: 'EMPRESA TESTE LTDA'
        }
      };

      const header = gerarHeaderArquivo(params);
      
      // Verifica se o tamanho está correto
      expect(header.length).toBe(240);
      
      // A data e hora devem ser preenchidas (não verificamos o valor exato, pois depende do momento do teste)
      expect(header.substring(143, 151)).not.toBe('00000000');
      expect(header.substring(151, 157)).not.toBe('000000');
    });

    test('deve lançar erro quando dados da empresa não são fornecidos', () => {
      expect(() => {
        gerarHeaderArquivo({});
      }).toThrow('Dados da empresa são obrigatórios');
    });
  });

  describe('gerarTrailerArquivo', () => {
    test('deve gerar um trailer de arquivo válido com 240 caracteres', () => {
      const params = {
        quantidade_lotes: 2,
        quantidade_registros: 10
      };

      const trailer = gerarTrailerArquivo(params);
      
      // Verifica se o tamanho está correto
      expect(trailer.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(trailer.substring(0, 3)).toBe('341'); // Código do banco
      expect(trailer.substring(3, 7)).toBe('9999'); // Código do lote
      expect(trailer.substring(7, 8)).toBe('9'); // Tipo de registro
      expect(trailer.substring(17, 23)).toBe('000002'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000010'); // Quantidade de registros
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarTrailerArquivo({});
      }).toThrow('Quantidade de lotes e registros são obrigatórios');
    });
  });
});
