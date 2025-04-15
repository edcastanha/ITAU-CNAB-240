/**
 * Testes para o serviço de geração de header e trailer de arquivo CNAB 240
 */

const { gerarHeaderArquivo, gerarTrailerArquivo } = require('../../src/services/cnab240/headerService');

describe('headerService', () => {
  describe('gerarHeaderArquivo', () => {
    // Dados de exemplo para os testes
    const empresaTeste = {
      tipo_inscricao: 2,
      inscricao_numero: '12345678901234',
      nome: 'EMPRESA TESTE LTDA',
      agencia: '1234',
      conta: '123456789',
      dac: '1'
    };

    it('deve gerar um header de arquivo válido para o Santander', () => {
      // Chama a função
      const header = gerarHeaderArquivo(empresaTeste);
      
      // Verifica se o retorno tem o tamanho correto
      expect(header.length).toBe(240);
      
      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
      expect(header.substring(3, 7)).toBe('0000'); // Lote
      expect(header.substring(7, 8)).toBe('0'); // Tipo de registro
    });

    it('deve gerar um header de arquivo válido para o Itaú', () => {
      // Chama a função com banco específico
      const header = gerarHeaderArquivo({ ...empresaTeste, codigo_banco: '033' });
      
      // Verifica se o retorno tem o tamanho correto
      expect(header.length).toBe(240);
      
      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
    });

    it('deve lançar erro ao tentar gerar header sem dados da empresa', () => {
      expect(() => gerarHeaderArquivo(null)).toThrow();
      expect(() => gerarHeaderArquivo(undefined)).toThrow();
    });

    it('deve lançar erro com dados de empresa incompletos', () => {
      const empresaIncompleta = {
        nome: 'EMPRESA TESTE SEM CNPJ'
      };

      expect(() => gerarHeaderArquivo(empresaIncompleta)).toThrow();
    });
  });

  describe('gerarTrailerArquivo', () => {
    it('deve gerar um trailer de arquivo válido', () => {
      // Chama a função
      const trailer = gerarTrailerArquivo(10, 100);
      
      // Verifica se o retorno tem o tamanho correto
      expect(trailer.length).toBe(240);
      
      // Verifica campos específicos
      expect(trailer.substring(7, 8)).toBe('9'); // Tipo de registro
      expect(trailer.substring(17, 23)).toBe('000010'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000100'); // Quantidade de registros
    });

    it('deve gerar um trailer com valores zerados quando não especificados', () => {
      // Chama a função com valores zerados mas não nulos
      const trailer = gerarTrailerArquivo(0, 0);
      
      // Verifica se o retorno tem o tamanho correto
      expect(trailer.length).toBe(240);
      
      // Verifica campos específicos
      expect(trailer.substring(17, 23)).toBe('000000'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000000'); // Quantidade de registros
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarTrailerArquivo(null, 100)).toThrow();
      expect(() => gerarTrailerArquivo(10, null)).toThrow();
      expect(() => gerarTrailerArquivo(undefined, 100)).toThrow();
      expect(() => gerarTrailerArquivo(10, undefined)).toThrow();
    });
  });
}); 