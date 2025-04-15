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
 * Formata uma data para o padrão DDMMAAAA
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} - Data formatada como DDMMAAAA
 */
function formatarData(data) {
  if (!data) return '00000000';
  
  let dataObj;
  if (typeof data === 'string') {
    // Se já estiver no formato DDMMAAAA ou AAAAMMDD, apenas retorna
    if (/^\d{8}$/.test(data)) {
      // Se estiver no formato AAAAMMDD, converte para DDMMAAAA
      if (parseInt(data.substr(0, 4)) > 1900) {
        return data.substr(6, 2) + data.substr(4, 2) + data.substr(0, 4);
      }
      return data;
    }
    // Tenta converter a string em data
    dataObj = new Date(data);
  } else if (data instanceof Date) {
    dataObj = data;
  } else {
    return '00000000';
  }
  
  // Verifica se a data é válida
  if (isNaN(dataObj.getTime())) {
    return '00000000';
  }
  
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear());
  
  return dia + mes + ano;
}

/**
 * Formata um valor monetário para o padrão CNAB (sem separadores e com casas decimais)
 * @param {number|string} valor - Valor a ser formatado
 * @param {number} tamanho - Tamanho total do campo (incluindo decimais)
 * @param {number} decimais - Quantidade de casas decimais
 * @returns {string} - Valor formatado
 */
function formatarValor(valor, tamanho = 15, decimais = 2) {
  if (valor === null || valor === undefined) {
    return '0'.repeat(tamanho);
  }
  
  let valorNum;
  if (typeof valor === 'string') {
    // Remove caracteres não numéricos, exceto ponto decimal
    valorNum = parseFloat(valor.replace(/[^\d.]/g, ''));
  } else {
    valorNum = parseFloat(valor);
  }
  
  // Verifica se o valor é um número válido
  if (isNaN(valorNum)) {
    return '0'.repeat(tamanho);
  }
  
  // Multiplica pelo fator de casas decimais para remover o ponto
  const fator = Math.pow(10, decimais);
  const valorInteiro = Math.round(valorNum * fator);
  
  // Formata o valor como string preenchendo com zeros à esquerda
  return String(valorInteiro).padStart(tamanho, '0');
}

/**
 * Formata um número com zeros à esquerda
 * @param {number|string} numero - Número a ser formatado
 * @param {number} tamanho - Tamanho total do campo
 * @returns {string} - Número formatado com zeros à esquerda
 */
function formatarNumero(numero, tamanho) {
  if (numero === null || numero === undefined || numero === '') {
    return '0'.repeat(tamanho);
  }
  
  // Remove caracteres não numéricos
  const numeroLimpo = String(numero).replace(/\D/g, '');
  
  return numeroLimpo.padStart(tamanho, '0');
}

/**
 * Formata um texto com espaços à direita
 * @param {string} texto - Texto a ser formatado
 * @param {number} tamanho - Tamanho total do campo
 * @returns {string} - Texto formatado com espaços à direita
 */
function formatarTexto(texto, tamanho) {
  if (texto === null || texto === undefined) {
    return ' '.repeat(tamanho);
  }
  
  // Converte para string e limita o tamanho
  const textoStr = String(texto).substring(0, tamanho);
  
  // Preenche com espaços à direita
  return textoStr.padEnd(tamanho, ' ');
}

/**
 * Formata um documento (CPF/CNPJ) com zeros à esquerda
 * @param {string} documento - Documento a ser formatado
 * @returns {string} - Documento formatado
 */
function formatarDocumento(documento) {
  if (!documento) return '00000000000000';
  
  // Remove caracteres não numéricos
  const documentoLimpo = String(documento).replace(/\D/g, '');
  
  // Preenche com zeros à esquerda (padrão CNPJ com 14 posições)
  return documentoLimpo.padStart(14, '0');
}

/**
 * Formata um código de banco com zeros à esquerda
 * @param {string} codigo - Código do banco a ser formatado
 * @returns {string} - Código do banco formatado
 */
function formatarCodigoBanco(codigo) {
  if (!codigo) return '000';
  
  // Remove caracteres não numéricos
  const codigoLimpo = String(codigo).replace(/\D/g, '');
  
  // Preenche com zeros à esquerda (padrão 3 posições)
  return codigoLimpo.padStart(3, '0');
}

/**
 * Formata um número de agência com zeros à esquerda
 * @param {string} agencia - Número da agência a ser formatado
 * @returns {string} - Número da agência formatado
 */
function formatarAgencia(agencia) {
  if (!agencia) return '00000';
  
  // Remove caracteres não numéricos
  const agenciaLimpa = String(agencia).replace(/\D/g, '');
  
  // Preenche com zeros à esquerda (padrão 5 posições)
  return agenciaLimpa.padStart(5, '0');
}

/**
 * Formata um número de conta com zeros à esquerda
 * @param {string} conta - Número da conta a ser formatado
 * @param {string} dv - Dígito verificador da conta
 * @returns {string} - Número da conta formatado
 */
function formatarConta(conta, dv) {
  if (!conta) return '0000000000000';
  
  // Remove caracteres não numéricos
  const contaLimpa = String(conta).replace(/\D/g, '');
  let dvLimpo = '';
  
  if (dv) {
    dvLimpo = String(dv).replace(/\D/g, '');
  }
  
  // Preenche a conta com zeros à esquerda (padrão 12 posições)
  const contaFormatada = contaLimpa.padStart(12, '0');
  
  // Adiciona o dígito verificador se fornecido
  if (dvLimpo) {
    return contaFormatada + dvLimpo.padStart(1, '0');
  }
  
  return contaFormatada + '0';
}

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
