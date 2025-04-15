const { gerarHeaderArquivo, gerarTrailerArquivo } = require('../../src/services/cnab240/headerService');

describe('headerService', () => {
  describe('gerarHeaderArquivo', () => {
    it('deve gerar um header de arquivo válido para o Santander', () => {
      const empresa = {
        tipo_inscricao: '2', // CNPJ
        inscricao_numero: '12345678901234',
        nome: 'EMPRESA TESTE LTDA',
        agencia: '1234',
        conta: '56789',
        dac: '0',
        codigo_banco: '033' // Santander
      };

      const header = gerarHeaderArquivo(empresa);

      // Verificações básicas
      expect(header).toBeDefined();
      expect(header.length).toBe(240);

      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
      expect(header.substring(3, 7)).toBe('0000'); // Lote
      expect(header.substring(7, 8)).toBe('0'); // Tipo de registro (0 = header de arquivo)
      expect(header.substring(17, 18)).toBe('2'); // Tipo de inscrição
      expect(header.substring(18, 32)).toBe('12345678901234'); // Número de inscrição
    });

    it('deve gerar um header de arquivo válido para o Itaú', () => {
      const empresa = {
        tipo_inscricao: '2', // CNPJ
        inscricao_numero: '12345678901234',
        nome: 'EMPRESA TESTE LTDA',
        agencia: '1234',
        conta: '56789',
        dac: '0',
        codigo_banco: '341' // Itaú
      };

      const header = gerarHeaderArquivo(empresa);

      // Verificações básicas
      expect(header).toBeDefined();
      expect(header.length).toBe(240);

      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('341'); // Código do banco
    });

    it('deve lançar erro ao tentar gerar header sem dados da empresa', () => {
      expect(() => gerarHeaderArquivo(null)).toThrow();
      expect(() => gerarHeaderArquivo({})).toThrow();
    });

    it('deve lançar erro com dados de empresa incompletos', () => {
      const empresaIncompleta = {
        tipo_inscricao: '2',
        // inscricao_numero faltando
        nome: 'EMPRESA TESTE'
      };

      expect(() => gerarHeaderArquivo(empresaIncompleta)).toThrow();
    });
  });

  describe('gerarTrailerArquivo', () => {
    it('deve gerar um trailer de arquivo válido', () => {
      const qtd_lotes = 2;
      const qtd_registros = 10;

      const trailer = gerarTrailerArquivo(qtd_lotes, qtd_registros);

      // Verificações básicas
      expect(trailer).toBeDefined();
      expect(trailer.length).toBe(240);

      // Verifica campos específicos
      expect(trailer.substring(0, 3)).toBe('033'); // Código do banco
      expect(trailer.substring(3, 7)).toBe('9999'); // Lote
      expect(trailer.substring(7, 8)).toBe('9'); // Tipo de registro (9 = trailer de arquivo)
      expect(trailer.substring(17, 23)).toBe('000002'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000010'); // Quantidade de registros
    });

    it('deve gerar um trailer com valores zerados quando não especificados', () => {
      const trailer = gerarTrailerArquivo(0, 0);

      // Verificações básicas
      expect(trailer).toBeDefined();
      expect(trailer.length).toBe(240);

      // Verifica campos específicos
      expect(trailer.substring(17, 23)).toBe('000000'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000000'); // Quantidade de registros
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarTrailerArquivo(null, 10)).toThrow();
      expect(() => gerarTrailerArquivo(5, null)).toThrow();
    });
  });
}); 