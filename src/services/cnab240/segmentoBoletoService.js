/**
 * Serviço para geração dos Segmentos J e J-52 para pagamentos de boletos
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
  RECORD_TYPES,
  NOTIFICATION_CODES
} = require('../../config/constants');

/**
 * Gera o registro Segmento J (Registro 3) para pagamentos de boletos
 * @param {Object} params - Parâmetros para geração do segmento J
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.boleto - Dados do boleto
 * @param {string} params.boleto.codigo_barras - Código de barras do boleto (44 posições)
 * @param {string} params.boleto.nome_beneficiario - Nome do beneficiário do boleto
 * @param {Date|string} params.boleto.data_vencimento - Data de vencimento do boleto
 * @param {Date|string} params.boleto.data_pagamento - Data de pagamento do boleto
 * @param {number} params.boleto.valor - Valor do pagamento
 * @param {number} params.boleto.valor_desconto - Valor do desconto (opcional)
 * @param {number} params.boleto.valor_acrescimo - Valor do acréscimo (opcional)
 * @param {string} params.boleto.seu_numero - Seu número (controle da empresa)
 * @returns {string} - Linha formatada do Segmento J
 */
function gerarSegmentoJ(params) {
  const { 
    numero_lote, 
    numero_registro, 
    boleto
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !boleto || !boleto.codigo_barras) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J');
  }
  
  // Validação do código de barras
  if (boleto.codigo_barras.length !== 44) {
    throw new Error('Código de barras deve ter 44 posições');
  }
  
  // Montagem do registro Segmento J
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento J, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento J, sempre 'J'
  segmento += 'J';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Código de Barras (posição: 18-61) - 44 posições
  segmento += formatAlpha(boleto.codigo_barras, 44);
  
  // Nome do Beneficiário (posição: 62-91)
  segmento += formatAlpha(boleto.nome_beneficiario || '', 30);
  
  // Data de Vencimento (posição: 92-99)
  segmento += formatDate(boleto.data_vencimento || '');
  
  // Data de Pagamento (posição: 100-107)
  segmento += formatDate(boleto.data_pagamento);
  
  // Valor do Título (posição: 108-122)
  segmento += formatValue(boleto.valor, 15, 2);
  
  // Valor do Desconto + Abatimento (posição: 123-137)
  segmento += formatValue(boleto.valor_desconto || 0, 15, 2);
  
  // Valor da Mora + Multa (posição: 138-152)
  segmento += formatValue(boleto.valor_acrescimo || 0, 15, 2);
  
  // Código da Moeda (posição: 153-154) - 01=Real
  segmento += formatNumeric('01', 2);
  
  // Código de Ocorrência (posição: 155-155) - Zeros na remessa
  segmento += formatNumeric(0, 1);
  
  // Seu Número (posição: 156-175) - Número de controle da empresa
  segmento += formatAlpha(boleto.seu_numero || '', 20);
  
  // Nosso Número (posição: 176-195) - Zeros na remessa
  segmento += formatNumeric(0, 20);
  
  // Código da Moeda (posição: 196-198) - Brancos na remessa
  segmento += formatAlpha('', 3);
  
  // Brancos (posição: 199-230)
  segmento += formatAlpha('', 32);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento J-52 (Registro 3) para informações complementares de boletos
 * @param {Object} params - Parâmetros para geração do segmento J-52
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.pagador - Dados do pagador
 * @param {string} params.pagador.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.pagador.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} params.pagador.nome - Nome do pagador
 * @param {Object} params.beneficiario - Dados do beneficiário
 * @param {string} params.beneficiario.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.beneficiario.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} params.beneficiario.nome - Nome do beneficiário
 * @param {Object} params.sacador - Dados do sacador avalista (opcional)
 * @param {string} [params.sacador.tipo_inscricao] - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} [params.sacador.inscricao_numero] - Número de inscrição (CPF/CNPJ)
 * @param {string} [params.sacador.nome] - Nome do sacador avalista
 * @returns {string} - Linha formatada do Segmento J-52
 */
function gerarSegmentoJ52(params) {
  const { 
    numero_lote, 
    numero_registro, 
    pagador,
    beneficiario,
    sacador = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !pagador || !beneficiario) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J-52');
  }
  
  // Montagem do registro Segmento J-52
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento J-52, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento J-52, sempre 'J'
  segmento += 'J';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Identificador do Registro Opcional (posição: 18-19) - Para J-52, sempre '52'
  segmento += formatNumeric('52', 2);
  
  // Pagador
  // Tipo de Inscrição do Pagador (posição: 20-20)
  segmento += formatNumeric(pagador.tipo_inscricao, 1);
  
  // Número de Inscrição do Pagador (posição: 21-35)
  segmento += formatNumeric(pagador.inscricao_numero, 15);
  
  // Nome do Pagador (posição: 36-75)
  segmento += formatAlpha(pagador.nome, 40);
  
  // Beneficiário
  // Tipo de Inscrição do Beneficiário (posição: 76-76)
  segmento += formatNumeric(beneficiario.tipo_inscricao, 1);
  
  // Número de Inscrição do Beneficiário (posição: 77-91)
  segmento += formatNumeric(beneficiario.inscricao_numero, 15);
  
  // Nome do Beneficiário (posição: 92-131)
  segmento += formatAlpha(beneficiario.nome, 40);
  
  // Sacador Avalista
  // Tipo de Inscrição do Sacador (posição: 132-132)
  segmento += formatNumeric(sacador.tipo_inscricao || 0, 1);
  
  // Número de Inscrição do Sacador (posição: 133-147)
  segmento += formatNumeric(sacador.inscricao_numero || 0, 15);
  
  // Nome do Sacador (posição: 148-187)
  segmento += formatAlpha(sacador.nome || '', 40);
  
  // Brancos (posição: 188-230)
  segmento += formatAlpha('', 43);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento J-52 PIX (Registro 3) para pagamentos via PIX QR Code
 * @param {Object} params - Parâmetros para geração do segmento J-52 PIX
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.pix - Dados do PIX
 * @param {string} params.pix.tipo_chave - Tipo de chave PIX (1=Telefone, 2=Email, 3=CPF/CNPJ, 4=Chave aleatória)
 * @param {string} params.pix.chave - Chave PIX
 * @param {string} params.pix.tx_id - Identificador da transação PIX (opcional)
 * @param {string} params.pix.info_adicional - Informação adicional (opcional)
 * @returns {string} - Linha formatada do Segmento J-52 PIX
 */
function gerarSegmentoJ52PIX(params) {
  const { 
    numero_lote, 
    numero_registro, 
    pix
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !pix || !pix.chave) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J-52 PIX');
  }
  
  // Montagem do registro Segmento J-52 PIX
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento J-52 PIX, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento J-52 PIX, sempre 'J'
  segmento += 'J';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Identificador do Registro Opcional (posição: 18-19) - Para J-52 PIX, sempre '52'
  segmento += formatNumeric('52', 2);
  
  // Tipo de Chave PIX (posição: 20-20)
  segmento += formatNumeric(pix.tipo_chave, 1);
  
  // Chave PIX (posição: 21-100)
  segmento += formatAlpha(pix.chave, 80);
  
  // TX ID (posição: 101-132)
  segmento += formatAlpha(pix.tx_id || '', 32);
  
  // Informação Adicional (posição: 133-182)
  segmento += formatAlpha(pix.info_adicional || '', 50);
  
  // Brancos (posição: 183-230)
  segmento += formatAlpha('', 48);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

module.exports = {
  gerarSegmentoJ,
  gerarSegmentoJ52,
  gerarSegmentoJ52PIX
};
