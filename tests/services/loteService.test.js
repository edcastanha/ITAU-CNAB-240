const { gerarHeaderLote, gerarTrailerLote } = require('../../src/services/cnab240/loteService');

describe('loteService', () => {
  const empresaTeste = {
    tipo_inscricao: '2', // CNPJ
    inscricao_numero: '12345678901234',
    nome: 'EMPRESA TESTE LTDA',
    agencia: '1234',
    conta: '56789',
    dac: '0',
    codigo_banco: '033' // Santander
  };

  describe('gerarHeaderLote', () => {
    it('deve gerar um header de lote válido para pagamentos de fornecedores', () => {
      const numeroLote = 1;
      const tipoOperacao = 'fornecedores';

      const header = gerarHeaderLote(empresaTeste, numeroLote, tipoOperacao);

      // Verificações básicas
      expect(header).toBeDefined();
      expect(header.length).toBe(240);

      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
      expect(header.substring(3, 7)).toBe('0001'); // Número do lote
      expect(header.substring(7, 8)).toBe('1'); // Tipo de registro (1 = header de lote)
      expect(header.substring(8, 9)).toBe('C'); // Tipo de operação (C = crédito)
      expect(header.substring(9, 11)).toBe('20'); // Tipo de serviço (20 = pagamento a fornecedores)
    });

    it('deve gerar um header de lote válido para pagamentos de salários', () => {
      const numeroLote = 2;
      const tipoOperacao = 'salarios';

      const header = gerarHeaderLote(empresaTeste, numeroLote, tipoOperacao);

      // Verificações básicas
      expect(header).toBeDefined();
      expect(header.length).toBe(240);

      // Verifica campos específicos
      expect(header.substring(0, 3)).toBe('033'); // Código do banco
      expect(header.substring(3, 7)).toBe('0002'); // Número do lote
      expect(header.substring(9, 11)).toBe('30'); // Tipo de serviço (30 = pagamento de salários)
    });

    it('deve gerar um header de lote válido para pagamentos de tributos', () => {
      const numeroLote = 3;
      const tipoOperacao = 'tributos';

      const header = gerarHeaderLote(empresaTeste, numeroLote, tipoOperacao);

      // Verificações
      expect(header).toBeDefined();
      expect(header.length).toBe(240);
      expect(header.substring(9, 11)).toBe('22'); // Tipo de serviço (22 = pagamento de tributos)
    });

    it('deve gerar um header de lote válido para pagamentos de boletos', () => {
      const numeroLote = 4;
      const tipoOperacao = 'boletos';

      const header = gerarHeaderLote(empresaTeste, numeroLote, tipoOperacao);

      // Verificações
      expect(header).toBeDefined();
      expect(header.length).toBe(240);
      expect(header.substring(9, 11)).toBe('98'); // Tipo de serviço (98 = pagamento de boletos)
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarHeaderLote(null, 1, 'fornecedores')).toThrow();
      expect(() => gerarHeaderLote(empresaTeste, null, 'fornecedores')).toThrow();
      expect(() => gerarHeaderLote(empresaTeste, 1, null)).toThrow();
    });
  });

  describe('gerarTrailerLote', () => {
    it('deve gerar um trailer de lote válido', () => {
      const numeroLote = 1;
      const qtdRegistros = 5;
      const somatoriaValores = 1500.75;

      const trailer = gerarTrailerLote(numeroLote, qtdRegistros, somatoriaValores);

      // Verificações básicas
      expect(trailer).toBeDefined();
      expect(trailer.length).toBe(240);

      // Verifica campos específicos
      expect(trailer.substring(0, 3)).toBe('033'); // Código do banco
      expect(trailer.substring(3, 7)).toBe('0001'); // Número do lote
      expect(trailer.substring(7, 8)).toBe('5'); // Tipo de registro (5 = trailer de lote)
      expect(trailer.substring(17, 23)).toBe('000005'); // Quantidade de registros
      expect(trailer.substring(23, 41)).toBe('000000000000150075'); // Somatório dos valores
    });

    it('deve gerar um trailer com valores zerados quando não especificados', () => {
      const trailer = gerarTrailerLote(1, 0, 0);

      // Verificações básicas
      expect(trailer).toBeDefined();
      expect(trailer.length).toBe(240);

      // Verifica campos específicos
      expect(trailer.substring(17, 23)).toBe('000000'); // Quantidade de registros
      expect(trailer.substring(23, 41)).toBe('000000000000000000'); // Somatório dos valores
    });

    it('deve lançar erro quando parâmetros são inválidos', () => {
      expect(() => gerarTrailerLote(null, 10, 1000)).toThrow();
      expect(() => gerarTrailerLote(1, null, 1000)).toThrow();
      // O valor pode ser nulo, será tratado como zero
      expect(() => gerarTrailerLote(1, 10, null)).not.toThrow();
    });
  });
}); 