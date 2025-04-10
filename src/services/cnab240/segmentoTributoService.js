/**
 * Serviço para geração dos Segmentos N e O para pagamentos de tributos
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
 * Gera o registro Segmento O (Registro 3) para pagamentos de tributos com código de barras
 * @param {Object} params - Parâmetros para geração do segmento O
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.tributo - Dados do tributo
 * @param {string} params.tributo.codigo_barras - Código de barras do tributo (44 posições)
 * @param {string} params.tributo.nome_contribuinte - Nome do contribuinte
 * @param {Date|string} params.tributo.data_vencimento - Data de vencimento do tributo
 * @param {Date|string} params.tributo.data_pagamento - Data de pagamento do tributo
 * @param {number} params.tributo.valor - Valor do pagamento
 * @param {string} params.tributo.seu_numero - Seu número (controle da empresa)
 * @returns {string} - Linha formatada do Segmento O
 */
function gerarSegmentoO(params) {
  const { 
    numero_lote, 
    numero_registro, 
    tributo
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !tributo || !tributo.codigo_barras) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento O');
  }
  
  // Validação do código de barras
  if (tributo.codigo_barras.length !== 44) {
    throw new Error('Código de barras deve ter 44 posições');
  }
  
  // Montagem do registro Segmento O
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento O, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento O, sempre 'O'
  segmento += 'O';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Código de Barras (posição: 18-61) - 44 posições
  segmento += formatAlpha(tributo.codigo_barras, 44);
  
  // Nome do Contribuinte (posição: 62-91)
  segmento += formatAlpha(tributo.nome_contribuinte || '', 30);
  
  // Data de Vencimento (posição: 92-99)
  segmento += formatDate(tributo.data_vencimento || '');
  
  // Data de Pagamento (posição: 100-107)
  segmento += formatDate(tributo.data_pagamento);
  
  // Valor do Pagamento (posição: 108-122)
  segmento += formatValue(tributo.valor, 15, 2);
  
  // Seu Número (posição: 123-142) - Número de controle da empresa
  segmento += formatAlpha(tributo.seu_numero || '', 20);
  
  // Nosso Número (posição: 143-162) - Zeros na remessa
  segmento += formatNumeric(0, 20);
  
  // Brancos (posição: 163-230)
  segmento += formatAlpha('', 68);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento N (Registro 3) para pagamentos de tributos sem código de barras
 * @param {Object} params - Parâmetros para geração do segmento N
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.tributo - Dados do tributo
 * @param {string} params.tributo.tipo - Tipo de tributo (01=DARF, 02=GPS, 03=DARF Simples, 04=GARE-SP, etc.)
 * @param {string} params.tributo.codigo_receita - Código da receita do tributo
 * @param {string} params.tributo.tipo_inscricao - Tipo de inscrição do contribuinte (1=CPF, 2=CNPJ)
 * @param {string} params.tributo.inscricao_numero - Número de inscrição do contribuinte (CPF/CNPJ)
 * @param {string} params.tributo.periodo_apuracao - Período de apuração (MMAAAA)
 * @param {string} params.tributo.referencia - Número de referência
 * @param {number} params.tributo.valor_principal - Valor principal
 * @param {number} params.tributo.valor_multa - Valor da multa (opcional)
 * @param {number} params.tributo.valor_juros - Valor dos juros/encargos (opcional)
 * @param {Date|string} params.tributo.data_vencimento - Data de vencimento do tributo
 * @param {Date|string} params.tributo.data_pagamento - Data de pagamento do tributo
 * @returns {string} - Linha formatada do Segmento N
 */
function gerarSegmentoN(params) {
  const { 
    numero_lote, 
    numero_registro, 
    tributo
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !tributo || !tributo.tipo) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento N');
  }
  
  // Montagem do registro Segmento N
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento N, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento N, sempre 'N'
  segmento += 'N';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Tipo de Tributo (posição: 18-19)
  segmento += formatNumeric(tributo.tipo, 2);
  
  // Código da Receita (posição: 20-23)
  segmento += formatNumeric(tributo.codigo_receita || 0, 4);
  
  // Tipo de Inscrição do Contribuinte (posição: 24-24)
  segmento += formatNumeric(tributo.tipo_inscricao, 1);
  
  // Número de Inscrição do Contribuinte (posição: 25-38)
  segmento += formatNumeric(tributo.inscricao_numero, 14);
  
  // Período de Apuração (posição: 39-44) - MMAAAA
  segmento += formatAlpha(tributo.periodo_apuracao || '', 6);
  
  // Número de Referência (posição: 45-61)
  segmento += formatAlpha(tributo.referencia || '', 17);
  
  // Valor Principal (posição: 62-76)
  segmento += formatValue(tributo.valor_principal, 15, 2);
  
  // Valor da Multa (posição: 77-91)
  segmento += formatValue(tributo.valor_multa || 0, 15, 2);
  
  // Valor dos Juros/Encargos (posição: 92-106)
  segmento += formatValue(tributo.valor_juros || 0, 15, 2);
  
  // Data de Vencimento (posição: 107-114)
  segmento += formatDate(tributo.data_vencimento);
  
  // Data de Pagamento (posição: 115-122)
  segmento += formatDate(tributo.data_pagamento);
  
  // Valor Total (posição: 123-137) - Soma dos valores principal, multa e juros
  const valorTotal = (tributo.valor_principal || 0) + 
                    (tributo.valor_multa || 0) + 
                    (tributo.valor_juros || 0);
  segmento += formatValue(valorTotal, 15, 2);
  
  // Brancos (posição: 138-230)
  segmento += formatAlpha('', 93);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento W (Registro 3) para informações complementares de GARE-SP
 * @param {Object} params - Parâmetros para geração do segmento W
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.gare - Dados complementares da GARE-SP
 * @param {string} params.gare.inscricao_estadual - Inscrição estadual do contribuinte
 * @param {string} params.gare.inscricao_divida - Número de inscrição da dívida ativa
 * @param {string} params.gare.periodo_referencia - Período de referência (MMAAAA)
 * @param {number} params.gare.numero_parcela - Número da parcela
 * @param {number} params.gare.valor_receita - Valor da receita
 * @param {number} params.gare.valor_juros - Valor dos juros
 * @param {number} params.gare.valor_multa - Valor da multa
 * @param {number} params.gare.valor_encargos - Valor dos encargos
 * @returns {string} - Linha formatada do Segmento W
 */
function gerarSegmentoW(params) {
  const { 
    numero_lote, 
    numero_registro, 
    gare
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !gare) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento W');
  }
  
  // Montagem do registro Segmento W
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento W, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento W, sempre 'W'
  segmento += 'W';
  
  // Brancos (posição: 15-17)
  segmento += formatAlpha('', 3);
  
  // Identificador de Tributo (posição: 18-19) - 01=GARE-SP
  segmento += formatNumeric('01', 2);
  
  // Inscrição Estadual (posição: 20-31)
  segmento += formatNumeric(gare.inscricao_estadual || 0, 12);
  
  // Inscrição da Dívida Ativa (posição: 32-44)
  segmento += formatNumeric(gare.inscricao_divida || 0, 13);
  
  // Período de Referência (posição: 45-50) - MMAAAA
  segmento += formatAlpha(gare.periodo_referencia || '', 6);
  
  // Número da Parcela (posição: 51-53)
  segmento += formatNumeric(gare.numero_parcela || 0, 3);
  
  // Valor da Receita (posição: 54-68)
  segmento += formatValue(gare.valor_receita || 0, 15, 2);
  
  // Valor dos Juros (posição: 69-83)
  segmento += formatValue(gare.valor_juros || 0, 15, 2);
  
  // Valor da Multa (posição: 84-98)
  segmento += formatValue(gare.valor_multa || 0, 15, 2);
  
  // Valor dos Encargos (posição: 99-113)
  segmento += formatValue(gare.valor_encargos || 0, 15, 2);
  
  // Brancos (posição: 114-230)
  segmento += formatAlpha('', 117);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

module.exports = {
  gerarSegmentoO,
  gerarSegmentoN,
  gerarSegmentoW
};
