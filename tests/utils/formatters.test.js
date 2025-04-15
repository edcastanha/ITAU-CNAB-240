const { 
  formatarData, 
  formatarValor, 
  formatarNumero, 
  formatarTexto,
  formatarDocumento,
  formatarCodigoBanco,
  formatarAgencia,
  formatarConta
} = require('../../src/utils/formatters');

describe('Formatters', () => {
  describe('formatarData', () => {
    it('deve formatar uma data válida para o formato DDMMAAAA', () => {
      const data = new Date(2023, 0, 15); // 15/01/2023
      expect(formatarData(data)).toBe('15012023');
    });

    it('deve aceitar uma string de data ISO e formatar para DDMMAAAA', () => {
      const dataString = '2023-01-15';
      expect(formatarData(dataString)).toBe('15012023');
    });

    it('deve lançar erro para entrada inválida', () => {
      expect(() => formatarData('data-invalida')).toThrow();
      expect(() => formatarData(null)).toThrow();
    });
  });

  describe('formatarValor', () => {
    it('deve formatar um número para o padrão de valor monetário com zeros à esquerda', () => {
      expect(formatarValor(123.45)).toBe('0000000000012345');
      expect(formatarValor(1.23)).toBe('0000000000000123');
    });

    it('deve formatar um valor zero corretamente', () => {
      expect(formatarValor(0)).toBe('0000000000000000');
    });

    it('deve formatar string numérica corretamente', () => {
      expect(formatarValor('123.45')).toBe('0000000000012345');
    });

    it('deve lançar erro para entrada inválida', () => {
      expect(() => formatarValor('valor-invalido')).toThrow();
    });
  });

  describe('formatarNumero', () => {
    it('deve formatar um número com zeros à esquerda até o tamanho especificado', () => {
      expect(formatarNumero(123, 5)).toBe('00123');
      expect(formatarNumero('7', 3)).toBe('007');
    });

    it('deve truncar números maiores que o tamanho especificado', () => {
      expect(formatarNumero(12345, 3)).toBe('345');
    });

    it('deve preencher com zeros quando número é zero', () => {
      expect(formatarNumero(0, 5)).toBe('00000');
    });

    it('deve lançar erro para entrada inválida', () => {
      expect(() => formatarNumero('abc', 5)).toThrow();
    });
  });

  describe('formatarTexto', () => {
    it('deve preencher texto com espaços à direita até o tamanho especificado', () => {
      expect(formatarTexto('ABC', 5)).toBe('ABC  ');
    });

    it('deve truncar texto maior que o tamanho especificado', () => {
      expect(formatarTexto('ABCDEFG', 5)).toBe('ABCDE');
    });

    it('deve retornar apenas espaços quando texto é vazio', () => {
      expect(formatarTexto('', 3)).toBe('   ');
    });

    it('deve lidar com valores não-string convertendo-os para string', () => {
      expect(formatarTexto(123, 5)).toBe('123  ');
      expect(formatarTexto(null, 4)).toBe('null');
      expect(formatarTexto(undefined, 10)).toBe('undefined ');
    });
  });

  describe('formatarDocumento', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatarDocumento('12345678901', 14)).toBe('00012345678901');
    });

    it('deve formatar CNPJ corretamente', () => {
      expect(formatarDocumento('12345678901234', 14)).toBe('12345678901234');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(formatarDocumento('123.456.789-01', 14)).toBe('00012345678901');
      expect(formatarDocumento('12.345.678/9012-34', 14)).toBe('12345678901234');
    });

    it('deve lançar erro para documento inválido', () => {
      expect(() => formatarDocumento('123', 14)).toThrow();
      expect(() => formatarDocumento('', 14)).toThrow();
    });
  });

  describe('formatarCodigoBanco', () => {
    it('deve formatar código de banco corretamente', () => {
      expect(formatarCodigoBanco('033')).toBe('033');
      expect(formatarCodigoBanco('1')).toBe('001');
    });

    it('deve lançar erro para código de banco inválido', () => {
      expect(() => formatarCodigoBanco('12345')).toThrow();
      expect(() => formatarCodigoBanco('')).toThrow();
    });
  });

  describe('formatarAgencia', () => {
    it('deve formatar número de agência corretamente', () => {
      expect(formatarAgencia('1234')).toBe('01234');
      expect(formatarAgencia('12')).toBe('00012');
    });

    it('deve lançar erro para agência inválida', () => {
      expect(() => formatarAgencia('123456')).toThrow();
      expect(() => formatarAgencia('')).toThrow();
    });
  });

  describe('formatarConta', () => {
    it('deve formatar número de conta corretamente', () => {
      expect(formatarConta('12345')).toBe('000000012345');
      expect(formatarConta('1')).toBe('000000000001');
    });

    it('deve aceitar conta com dígito verificador', () => {
      expect(formatarConta('12345', '6')).toBe('000000012345', '6');
    });

    it('deve lançar erro para conta inválida', () => {
      expect(() => formatarConta('1234567890123')).toThrow();
      expect(() => formatarConta('')).toThrow();
    });
  });
}); 