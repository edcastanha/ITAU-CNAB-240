/**
 * Serviço para geração de segmentos específicos de pagamento de boletos CNAB240
 */

const { formatarNumero, formatarTexto, formatarDocumento, formatarValor, formatarData } = require('../../utils/formatters');

/**
 * Gera o Segmento J para pagamentos de boletos
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento J formatado
 */
function gerarSegmentoJ(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do boleto
  const boleto = pagamento.boleto || pagamento;

  // Formata valores e datas
  const valor = formatarValor(boleto.valor || 0, 15, 2);
  const dataPagamento = formatarData(boleto.data_pagamento || new Date());
  const dataVencimento = formatarData(boleto.data_vencimento || boleto.data_pagamento || new Date());
  
  // Formata o código de barras ou linha digitável
  const codigoBarras = formatarTexto(boleto.codigo_barras || '', 44);
  
  // Constrói o segmento J
  const segmentoJ = [
    '033',                                     // 01.3J - Código do Banco
    lote,                                      // 02.3J - Lote de Serviço
    '3',                                       // 03.3J - Tipo de Registro (3 = Detalhe)
    registro,                                  // 04.3J - Número Sequencial do Registro no Lote
    'J',                                       // 05.3J - Código Segmento do Registro Detalhe
    '0',                                       // 06.3J - Tipo de Movimento (0 = Inclusão)
    '00',                                      // 07.3J - Código de Instrução para Movimento
    codigoBarras,                              // 08.3J - Código de Barras
    formatarTexto(boleto.nome_beneficiario || '', 30), // 09.3J - Nome do Beneficiário
    dataVencimento,                            // 10.3J - Data de Vencimento
    valor,                                     // 11.3J - Valor
    formatarValor(boleto.desconto || 0, 15, 2), // 12.3J - Valor do Desconto/Abatimento
    formatarValor(boleto.acrescimo || 0, 15, 2), // 13.3J - Valor da Mora/Multa
    dataPagamento,                             // 14.3J - Data do Pagamento
    valor,                                     // 15.3J - Valor do Pagamento
    formatarValor(0, 15, 2),                   // 16.3J - Quantidade de Moeda
    formatarTexto(boleto.numero_documento || '', 20), // 17.3J - Número do Documento Cliente
    formatarTexto(boleto.nosso_numero || '', 20), // 18.3J - Número do Documento Banco
    '09',                                      // 19.3J - Código da Moeda (09 = Real)
    ' '.repeat(13)                             // 20.3J - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do segmento J (deve ter 240 posições)
  if (segmentoJ.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento J: ${segmentoJ.length} caracteres (esperado: 240)`);
  }

  return segmentoJ;
}

/**
 * Gera o Segmento J-52 para pagamentos de boletos (informações do sacador/avalista)
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento J-52 formatado
 */
function gerarSegmentoJ52(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J-52');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do pagador e beneficiário
  const pagador = pagamento.pagador || {};
  const beneficiario = pagamento.beneficiario || {};

  // Constrói o segmento J-52
  const segmentoJ52 = [
    '033',                                      // 01.3J52 - Código do Banco
    lote,                                       // 02.3J52 - Lote de Serviço
    '3',                                        // 03.3J52 - Tipo de Registro (3 = Detalhe)
    registro,                                   // 04.3J52 - Número Sequencial do Registro no Lote
    'J',                                        // 05.3J52 - Código Segmento do Registro Detalhe
    '0',                                        // 06.3J52 - Tipo de Movimento (0 = Inclusão)
    '00',                                       // 07.3J52 - Código de Instrução para Movimento
    '52',                                       // 08.3J52 - Código do Registro Opcional
    pagador.tipo_inscricao || '0',              // 09.3J52 - Tipo de Inscrição do Pagador
    formatarDocumento(pagador.inscricao_numero || ''), // 10.3J52 - Número de Inscrição do Pagador
    formatarTexto(pagador.nome || '', 40),      // 11.3J52 - Nome do Pagador
    beneficiario.tipo_inscricao || '0',         // 12.3J52 - Tipo de Inscrição do Beneficiário
    formatarDocumento(beneficiario.inscricao_numero || ''), // 13.3J52 - Número de Inscrição do Beneficiário
    formatarTexto(beneficiario.nome || '', 40), // 14.3J52 - Nome do Beneficiário
    formatarTexto(beneficiario.tipo_inscricao || '0', 1), // 15.3J52 - Tipo de Inscrição do Sacador Avalista
    formatarDocumento(beneficiario.inscricao_numero || ''), // 16.3J52 - Número de Inscrição do Sacador Avalista
    formatarTexto(beneficiario.nome || '', 40), // 17.3J52 - Nome do Sacador Avalista
    ' '.repeat(53)                              // 18.3J52 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do segmento J-52 (deve ter 240 posições)
  if (segmentoJ52.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento J-52: ${segmentoJ52.length} caracteres (esperado: 240)`);
  }

  return segmentoJ52;
}

/**
 * Gera o Segmento J-52 para pagamentos PIX via QR Code
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento J-52 PIX formatado
 */
function gerarSegmentoJ52PIX(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento J-52 PIX');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do PIX
  const pix = pagamento.pix || {};

  // Constrói o segmento J-52 PIX
  const segmentoJ52PIX = [
    '033',                                      // 01.3J52 - Código do Banco
    lote,                                       // 02.3J52 - Lote de Serviço
    '3',                                        // 03.3J52 - Tipo de Registro (3 = Detalhe)
    registro,                                   // 04.3J52 - Número Sequencial do Registro no Lote
    'J',                                        // 05.3J52 - Código Segmento do Registro Detalhe
    '0',                                        // 06.3J52 - Tipo de Movimento (0 = Inclusão)
    '00',                                       // 07.3J52 - Código de Instrução para Movimento
    '52',                                       // 08.3J52 - Código do Registro Opcional
    '99',                                       // 09.3J52 - Identificador de QR Code PIX
    formatarTexto(pix.qrcode || '', 99),        // 10.3J52 - String do QR Code PIX
    formatarTexto(pix.tipo_chave || '', 2),     // 11.3J52 - Tipo de Chave PIX
    formatarTexto(pix.chave || '', 77),         // 12.3J52 - Chave PIX
    ' '.repeat(35)                              // 13.3J52 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do segmento J-52 PIX (deve ter 240 posições)
  if (segmentoJ52PIX.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento J-52 PIX: ${segmentoJ52PIX.length} caracteres (esperado: 240)`);
  }

  return segmentoJ52PIX;
}

module.exports = {
  gerarSegmentoJ,
  gerarSegmentoJ52,
  gerarSegmentoJ52PIX
};
