/**
 * Serviço para geração dos Segmentos específicos para pagamentos de salários
 * Baseado no Manual Técnico SISPAG CNAB 240 (versão 086)
 */

const { 
  formatNumeric, 
  formatAlpha, 
  formatDate,
  formatValue 
} = require('../../utils/formatters');

const { 
  BANK_CODES, 
  RECORD_TYPES
} = require('../../config/constants');

/**
 * Gera o registro Segmento C (Registro 3) para informações complementares de pagamento de salários
 * @param {Object} params - Parâmetros para geração do segmento C
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.complemento - Dados complementares do pagamento
 * @param {string} params.complemento.valor_ir - Valor do IR
 * @param {string} params.complemento.valor_iss - Valor do ISS
 * @param {string} params.complemento.valor_inss - Valor do INSS
 * @param {string} params.complemento.valor_fgts - Valor do FGTS
 * @param {string} params.complemento.valor_desconto - Valor de outros descontos
 * @param {string} params.complemento.valor_abono - Valor de abonos/adicionais
 * @returns {string} - Linha formatada do Segmento C
 */
function gerarSegmentoC(params) {
  const { 
    numero_lote, 
    numero_registro, 
    complemento = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento C');
  }
  
  // Montagem do registro Segmento C
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento C, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento C, sempre 'C'
  segmento += 'C';
  
  // Brancos (posição: 15-17)
  segmento += formatAlpha('', 3);
  
  // Valor do IR (posição: 18-32)
  segmento += formatValue(complemento.valor_ir || 0, 15, 2);
  
  // Valor do ISS (posição: 33-47)
  segmento += formatValue(complemento.valor_iss || 0, 15, 2);
  
  // Valor do INSS (posição: 48-62)
  segmento += formatValue(complemento.valor_inss || 0, 15, 2);
  
  // Valor do FGTS (posição: 63-77)
  segmento += formatValue(complemento.valor_fgts || 0, 15, 2);
  
  // Valor do Desconto (posição: 78-92)
  segmento += formatValue(complemento.valor_desconto || 0, 15, 2);
  
  // Valor do Abono/Adicional (posição: 93-107)
  segmento += formatValue(complemento.valor_abono || 0, 15, 2);
  
  // Valor Líquido (posição: 108-122) - Calculado automaticamente
  const valorLiquido = (complemento.valor_liquido !== undefined) ? 
    complemento.valor_liquido : 0;
  segmento += formatValue(valorLiquido, 15, 2);
  
  // Brancos (posição: 123-230)
  segmento += formatAlpha('', 108);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento D (Registro 3) para informações de histórico de crédito
 * @param {Object} params - Parâmetros para geração do segmento D
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.historico - Dados do histórico de crédito
 * @param {string} params.historico.codigo - Código do histórico de crédito
 * @param {string} params.historico.mensagem - Mensagem do histórico de crédito
 * @returns {string} - Linha formatada do Segmento D
 */
function gerarSegmentoD(params) {
  const { 
    numero_lote, 
    numero_registro, 
    historico = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento D');
  }
  
  // Montagem do registro Segmento D
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento D, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento D, sempre 'D'
  segmento += 'D';
  
  // Brancos (posição: 15-17)
  segmento += formatAlpha('', 3);
  
  // Código do Histórico de Crédito (posição: 18-19)
  segmento += formatNumeric(historico.codigo || 0, 2);
  
  // Mensagem do Histórico de Crédito (posição: 20-219)
  segmento += formatAlpha(historico.mensagem || '', 200);
  
  // Brancos (posição: 220-230)
  segmento += formatAlpha('', 11);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

module.exports = {
  gerarSegmentoC,
  gerarSegmentoD
};
