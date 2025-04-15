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

    const paramsTeste = {
      empresa: empresaTeste,
      codigo_banco: '033',
      nome_banco: 'BANCO SANTANDER',
      numero_arquivo: 1,
      versao_layout: '089'
    };

    it('deve gerar um header de arquivo válido para o Santander', () => {
      // Chama a função
      const header = gerarHeaderArquivo(paramsTeste);
      
      // Verifica se o retorno tem o tamanho correto
      expect(header.length).toBe(240);
      
      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
      expect(header.substring(3, 7)).toBe('0000'); // Lote
      expect(header.substring(7, 8)).toBe('0'); // Tipo de registro
    });

    it('deve gerar um header de arquivo válido para o Itaú', () => {
      // Chama a função com código de banco específico
      const paramsItau = {
        ...paramsTeste,
        codigo_banco: '341',
        nome_banco: 'BANCO ITAU SA'
      };
      
      const header = gerarHeaderArquivo(paramsItau);
      
      // Verifica se o retorno tem o tamanho correto
      expect(header.length).toBe(240);
      
      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('341'); // Código do banco
    });

    it('deve lançar erro ao tentar gerar header sem dados da empresa', () => {
      expect(() => gerarHeaderArquivo(null)).toThrow();
      expect(() => gerarHeaderArquivo({})).toThrow();
      expect(() => gerarHeaderArquivo({ codigo_banco: '033' })).toThrow();
    });

    it('deve lançar erro com dados de empresa incompletos', () => {
      const paramsIncompletos = {
        empresa: { nome: 'EMPRESA TESTE SEM CNPJ' },
        codigo_banco: '033'
      };

      expect(() => gerarHeaderArquivo(paramsIncompletos)).toThrow();
    });

    it('deve lançar erro quando o código do banco não for informado', () => {
      const paramsSemBanco = {
        empresa: empresaTeste
      };

      expect(() => gerarHeaderArquivo(paramsSemBanco)).toThrow();
    });
  });

  describe('gerarTrailerArquivo', () => {
    it('deve gerar um trailer de arquivo válido', () => {
      // Chama a função
      const params = {
        codigo_banco: '033',
        qtd_lotes: 10,
        qtd_registros: 100
      };
      
      const trailer = gerarTrailerArquivo(params);
      
      // Verifica se o retorno tem o tamanho correto
      expect(trailer.length).toBe(240);
      
      // Verifica campos específicos
      expect(trailer.substring(0, 3)).toBe('033'); // Código do banco
      expect(trailer.substring(7, 8)).toBe('9'); // Tipo de registro
      expect(trailer.substring(17, 23)).toBe('000010'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000100'); // Quantidade de registros
    });

    it('deve gerar um trailer com valores zerados quando informados como zero', () => {
      // Chama a função com valores zerados mas não nulos
      const params = {
        codigo_banco: '033',
        qtd_lotes: 0,
        qtd_registros: 0
      };
      
      const trailer = gerarTrailerArquivo(params);
      
      // Verifica se o retorno tem o tamanho correto
      expect(trailer.length).toBe(240);
      
      // Verifica campos específicos
      expect(trailer.substring(17, 23)).toBe('000000'); // Quantidade de lotes
      expect(trailer.substring(23, 29)).toBe('000000'); // Quantidade de registros
    });

    it('deve lançar erro quando parâmetros obrigatórios não forem informados', () => {
      expect(() => gerarTrailerArquivo(null)).toThrow();
      expect(() => gerarTrailerArquivo({})).toThrow();
      expect(() => gerarTrailerArquivo({ codigo_banco: '033' })).toThrow();
      expect(() => gerarTrailerArquivo({ codigo_banco: '033', qtd_lotes: 10 })).toThrow();
      expect(() => gerarTrailerArquivo({ codigo_banco: '033', qtd_registros: 100 })).toThrow();
    });

    it('deve lançar erro quando valores inválidos forem fornecidos', () => {
      expect(() => gerarTrailerArquivo({ 
        codigo_banco: '033', 
        qtd_lotes: null, 
        qtd_registros: 100 
      })).toThrow();
      
      expect(() => gerarTrailerArquivo({ 
        codigo_banco: '033', 
        qtd_lotes: 10, 
        qtd_registros: null 
      })).toThrow();
      
      expect(() => gerarTrailerArquivo({ 
        codigo_banco: '033', 
        qtd_lotes: undefined, 
        qtd_registros: 100 
      })).toThrow();
      
      expect(() => gerarTrailerArquivo({ 
        codigo_banco: '033', 
        qtd_lotes: 10, 
        qtd_registros: undefined 
      })).toThrow();
    });
  });
}); 