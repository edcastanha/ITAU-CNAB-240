/**
 * Testes unitários para as funções utilitárias de formatação CNAB 240
 */

const { 
  formatNumeric, 
  formatAlpha, 
  formatDate, 
  formatValue 
} = require('../src/utils/formatters');

describe('CNAB 240 Formatters', () => {
  describe('formatNumeric', () => {
    test('deve formatar números com zeros à esquerda', () => {
      expect(formatNumeric(123, 5)).toBe('00123');
      expect(formatNumeric('456', 5)).toBe('00456');
      expect(formatNumeric(7890, 10)).toBe('0000007890');
    });

    test('deve truncar números maiores que o tamanho especificado', () => {
      expect(formatNumeric(123456, 5)).toBe('23456');
      expect(formatNumeric('7890123', 4)).toBe('0123');
    });

    test('deve remover caracteres não numéricos', () => {
      expect(formatNumeric('123-456', 6)).toBe('123456');
      expect(formatNumeric('ABC123', 5)).toBe('00123');
    });

    test('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatNumeric(null, 5)).toBe('00000');
      expect(formatNumeric(undefined, 3)).toBe('000');
    });
  });

  describe('formatAlpha', () => {
    test('deve formatar strings com espaços à direita', () => {
      expect(formatAlpha('ABC', 5)).toBe('ABC  ');
      expect(formatAlpha('TESTE', 10)).toBe('TESTE     ');
    });

    test('deve truncar strings maiores que o tamanho especificado', () => {
      expect(formatAlpha('ABCDEFGH', 5)).toBe('ABCDE');
      expect(formatAlpha('TESTE LONGO', 7)).toBe('TESTE L');
    });

    test('deve converter para maiúsculas', () => {
      expect(formatAlpha('abc', 5)).toBe('ABC  ');
      expect(formatAlpha('Teste', 7)).toBe('TESTE  ');
    });

    test('deve remover acentos e caracteres especiais', () => {
      expect(formatAlpha('AÇÚCAR', 6)).toBe('ACUCAR');
      expect(formatAlpha('JOÃO@123', 8)).toBe('JOAO123 ');
    });

    test('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatAlpha(null, 5)).toBe('     ');
      expect(formatAlpha(undefined, 3)).toBe('   ');
    });
  });

  describe('formatDate', () => {
    test('deve formatar datas no padrão DDMMAAAA', () => {
      expect(formatDate('2025-04-10')).toBe('10042025');
      expect(formatDate(new Date(2025, 0, 15))).toBe('15012025'); // Janeiro é 0
    });

    test('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatDate(null)).toBe('00000000');
      expect(formatDate(undefined)).toBe('00000000');
    });

    test('deve lidar com formatos de data inválidos', () => {
      expect(formatDate('data-invalida')).toBe('00000000');
      expect(formatDate({})).toBe('00000000');
    });
  });

  describe('formatValue', () => {
    test('deve formatar valores monetários com decimais implícitos', () => {
      expect(formatValue(123.45, 10)).toBe('0000012345');
      expect(formatValue(1000, 8)).toBe('00100000');
      expect(formatValue(0.99, 6)).toBe('000099');
    });

    test('deve arredondar valores para o número correto de casas decimais', () => {
      expect(formatValue(123.456, 10)).toBe('0000012346');
      expect(formatValue(0.995, 5)).toBe('00100');
    });

    test('deve permitir especificar o número de casas decimais', () => {
      expect(formatValue(123.45, 10, 3)).toBe('0000123450');
      expect(formatValue(0.9876, 8, 4)).toBe('00009876');
    });

    test('deve lidar com valores nulos ou indefinidos', () => {
      expect(formatValue(null, 5)).toBe('00000');
      expect(formatValue(undefined, 3)).toBe('000');
    });
  });
});
