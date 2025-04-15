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

/**
 * Formata uma data para o padrão CNAB (DDMMAAAA)
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
const formatarData = (data) => {
    if (!(data instanceof Date)) {
        throw new Error('Data inválida');
    }
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '');
};

/**
 * Formata um valor monetário para o padrão CNAB (15 dígitos, 2 decimais)
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
const formatarValor = (valor) => {
    if (typeof valor !== 'number') {
        throw new Error('Valor inválido');
    }
    return valor.toFixed(2).replace('.', '').padStart(15, '0');
};

/**
 * Formata um número para o padrão CNAB (com zeros à esquerda)
 * @param {number|string} numero - Número a ser formatado
 * @param {number} tamanho - Tamanho total do campo
 * @returns {string} Número formatado
 */
const formatarNumero = (numero, tamanho) => {
    if (!numero && numero !== 0) {
        throw new Error('Número inválido');
    }
    return String(numero).padStart(tamanho, '0');
};

/**
 * Formata um texto para o padrão CNAB (com espaços à direita)
 * @param {string} texto - Texto a ser formatado
 * @param {number} tamanho - Tamanho total do campo
 * @returns {string} Texto formatado
 */
const formatarTexto = (texto, tamanho) => {
    if (typeof texto !== 'string') {
        throw new Error('Texto inválido');
    }
    return texto.padEnd(tamanho, ' ');
};

/**
 * Formata um CPF/CNPJ para o padrão CNAB
 * @param {string} documento - CPF ou CNPJ
 * @returns {string} Documento formatado
 */
const formatarDocumento = (documento) => {
    if (!documento) {
        throw new Error('Documento inválido');
    }
    return documento.replace(/[^\d]/g, '').padStart(14, '0');
};

/**
 * Formata um código de banco para o padrão CNAB
 * @param {string|number} codigo - Código do banco
 * @returns {string} Código formatado
 */
const formatarCodigoBanco = (codigo) => {
    if (!codigo) {
        throw new Error('Código do banco inválido');
    }
    return String(codigo).padStart(3, '0');
};

/**
 * Formata uma agência para o padrão CNAB
 * @param {string|number} agencia - Número da agência
 * @returns {string} Agência formatada
 */
const formatarAgencia = (agencia) => {
    if (!agencia) {
        throw new Error('Agência inválida');
    }
    return String(agencia).padStart(5, '0');
};

/**
 * Formata uma conta para o padrão CNAB
 * @param {string|number} conta - Número da conta
 * @param {string} digito - Dígito verificador
 * @returns {string} Conta formatada
 */
const formatarConta = (conta, digito) => {
    if (!conta) {
        throw new Error('Conta inválida');
    }
    return String(conta).padStart(12, '0') + (digito || ' ');
};

module.exports = {
  formatNumeric,
  formatAlpha,
  formatDate,
  formatValue,
  formatarData,
  formatarValor,
  formatarNumero,
  formatarTexto,
  formatarDocumento,
  formatarCodigoBanco,
  formatarAgencia,
  formatarConta
};
