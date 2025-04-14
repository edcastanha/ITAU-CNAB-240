/**
 * Serviço para geração do Header e Trailer de Lote CNAB 240
 * Baseado no Manual Técnico SISPAG CNAB 240 (versão 086)
 */

const { 
  formatNumeric, 
  formatAlpha, 
  formatDate 
} = require('../../utils/formatters');

const { 
  BANK_CODES, 
  RECORD_TYPES, 
  OPERATION_TYPES,
  SERVICE_TYPES,
  PAYMENT_FORMS,
  LAYOUT_VERSIONS 
} = require('../../config/constants');

/**
 * Gera o header do lote
 * @param {Object} params - Parâmetros do header
 * @param {Object} params.empresa - Dados da empresa
 * @param {number} params.numero_lote - Número do lote
 * @param {string} params.tipo_servico - Tipo de serviço
 * @param {string} params.forma_pagamento - Forma de pagamento
 * @param {string} params.finalidade_lote - Finalidade do lote
 * @returns {string} - Linha do header do lote
 * @throws {Error} - Se os parâmetros obrigatórios não forem fornecidos ou forem inválidos
 */
function gerarHeaderLote(params) {
  const { empresa, numero_lote, tipo_servico, forma_pagamento, finalidade_lote } = params;
  
  // Validações básicas
  if (!empresa) {
    throw new Error('Dados da empresa não fornecidos');
  }
  
  if (!numero_lote || numero_lote <= 0) {
    throw new Error('Número do lote inválido');
  }
  
  if (!tipo_servico) {
    throw new Error('Tipo de serviço não fornecido');
  }
  
  if (!forma_pagamento) {
    throw new Error('Forma de pagamento não fornecida');
  }
  
  // Validações da empresa
  if (!empresa.agencia || !empresa.conta || !empresa.dac || !empresa.nome) {
    throw new Error('Dados da empresa incompletos');
  }
  
  try {
    // Formata os dados
    const codigoBanco = empresa.codigo_banco || BANK_CODES.ITAU;
    const agencia = empresa.agencia.padStart(5, '0');
    const conta = empresa.conta.padStart(12, '0');
    const dac = empresa.dac.padStart(1, '0');
    const nomeEmpresa = empresa.nome.padEnd(30, ' ');
    
    // Gera o header do lote
    return [
      RECORD_TYPES.HEADER_LOTE, // 1-1
      codigoBanco, // 2-4
      '0000', // 5-8
      '1', // 9-9
      tipo_servico, // 10-11
      forma_pagamento, // 12-13
      '040', // 14-16
      ' ', // 17-17
      numero_lote.toString().padStart(4, '0'), // 18-21
      ' ', // 22-22
      '2', // 23-23
      ' ', // 24-24
      agencia, // 25-29
      ' ', // 30-30
      conta, // 31-42
      dac, // 43-43
      ' ', // 44-44
      nomeEmpresa, // 45-74
      ' ', // 75-75
      finalidade_lote.padEnd(30, ' '), // 76-105
      ' ', // 106-106
      ' ', // 107-108
      ' ', // 109-110
      ' ', // 111-117
      ' ', // 118-123
      ' ', // 124-240
    ].join('');
    
  } catch (error) {
    throw new Error(`Erro ao gerar header do lote: ${error.message}`);
  }
}

/**
 * Gera o trailer do lote
 * @param {Object} params - Parâmetros do trailer
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.quantidade_registros - Quantidade total de registros no lote
 * @param {number} [params.somatoria_valores] - Somatória dos valores do lote (opcional)
 * @returns {string} - Linha do trailer do lote
 * @throws {Error} - Se os parâmetros obrigatórios não forem fornecidos ou forem inválidos
 */
function gerarTrailerLote(params) {
  const { numero_lote, quantidade_registros, somatoria_valores = 0 } = params;
  
  // Validações básicas
  if (!numero_lote || numero_lote <= 0) {
    throw new Error('Número do lote inválido');
  }
  
  if (!quantidade_registros || quantidade_registros <= 0) {
    throw new Error('Quantidade de registros inválida');
  }
  
  if (typeof somatoria_valores !== 'number') {
    throw new Error('Somatória de valores inválida');
  }
  
  try {
    // Formata os dados
    const qtdRegistros = quantidade_registros.toString().padStart(6, '0');
    const valorTotal = somatoria_valores.toFixed(2).replace('.', '').padStart(18, '0');
    
    // Gera o trailer do lote
    return [
      RECORD_TYPES.TRAILER_LOTE, // 1-1
      BANK_CODES.ITAU, // 2-4
      '0000', // 5-8
      '5', // 9-9
      ' ', // 10-240
      qtdRegistros, // 18-23
      valorTotal, // 24-41
      ' '.repeat(199), // 42-240
    ].join('');
    
  } catch (error) {
    throw new Error(`Erro ao gerar trailer do lote: ${error.message}`);
  }
}

module.exports = {
  gerarHeaderLote,
  gerarTrailerLote
};
