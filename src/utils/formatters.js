/**
 * Funções utilitárias para formatação de campos CNAB 240
 * Baseado no Manual Técnico SISPAG CNAB 240 (versão 086)
 */

/**
 * Formata um valor para um campo numérico com padding de zeros à esquerda
 * @param {number|string} value - Valor a ser formatado
 * @param {number} length - Tamanho do campo
 * @returns {string} - Valor formatado com zeros à esquerda
 */
function formatNumeric(value, length) {
  if (value === null || value === undefined) {
    return '0'.repeat(length);
  }
  
  const stringValue = String(value).replace(/[^0-9]/g, '');
  
  // Se o valor for maior que o tamanho, pega os últimos 'length' caracteres
  if (stringValue.length > length) {
    return stringValue.substring(stringValue.length - length);
  }
  
  return stringValue.padStart(length, '0');
}

/**
 * Formata um valor para um campo alfanumérico com padding de espaços à direita
 * @param {string} value - Valor a ser formatado
 * @param {number} length - Tamanho do campo
 * @returns {string} - Valor formatado com espaços à direita
 */
function formatAlpha(value, length) {
  if (value === null || value === undefined) {
    return ' '.repeat(length);
  }
  
  // Converte para string, remove caracteres especiais e acentos, e converte para maiúsculas
  const stringValue = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toUpperCase();
  
  return stringValue.padEnd(length, ' ').substring(0, length);
}

/**
 * Formata uma data para o formato DDMMAAAA
 * @param {Date|string} date - Data a ser formatada (Date ou string no formato YYYY-MM-DD)
 * @returns {string} - Data formatada no padrão DDMMAAAA
 */
function formatDate(date) {
  if (!date) {
    return '00000000';
  }
  
  let dateObj;
  if (typeof date === 'string') {
    // Para strings no formato YYYY-MM-DD, é necessário ajustar o fuso horário
    const [year, month, day] = date.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return '00000000';
  }
  
  if (isNaN(dateObj.getTime())) {
    return '00000000';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear());
  
  return `${day}${month}${year}`;
}

/**
 * Formata um valor monetário para o formato numérico com decimais implícitos
 * @param {number} value - Valor monetário (ex: 1234.56)
 * @param {number} length - Tamanho total do campo
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Valor formatado (ex: 000000123456)
 */
function formatValue(value, length, decimals = 2) {
  if (value === null || value === undefined) {
    return '0'.repeat(length);
  }
  
  // Multiplica pelo fator de conversão para eliminar o ponto decimal
  const factor = Math.pow(10, decimals);
  const intValue = Math.round(Number(value) * factor);
  
  // Converte para string e aplica padding com zeros à esquerda
  return String(intValue).padStart(length, '0').substring(0, length);
}

module.exports = {
  formatNumeric,
  formatAlpha,
  formatDate,
  formatValue
};
