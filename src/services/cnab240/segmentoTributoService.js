/**
 * Serviço para geração de segmentos específicos de pagamento de tributos CNAB240
 */

const { formatarNumero, formatarTexto, formatarDocumento, formatarValor, formatarData } = require('../../utils/formatters');

/**
 * Gera o Segmento N para pagamentos de tributos
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento N formatado
 */
function gerarSegmentoN(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento N');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do tributo
  const tributo = pagamento.tributo || pagamento;

  // Formata valores e datas
  const valor = formatarValor(tributo.valor || 0, 15, 2);
  const dataPagamento = formatarData(tributo.data_pagamento || new Date());
  const dataVencimento = formatarData(tributo.data_vencimento || tributo.data_pagamento || new Date());
  
  // Constrói o segmento N
  const segmentoN = [
    '033',                                       // 01.3N - Código do Banco
    lote,                                        // 02.3N - Lote de Serviço
    '3',                                         // 03.3N - Tipo de Registro (3 = Detalhe)
    registro,                                    // 04.3N - Número Sequencial do Registro no Lote
    'N',                                         // 05.3N - Código Segmento do Registro Detalhe
    '0',                                         // 06.3N - Tipo de Movimento (0 = Inclusão)
    '00',                                        // 07.3N - Código de Instrução para Movimento
    formatarTexto(tributo.tipo_tributo || '', 2),// 08.3N - Tipo do Tributo
    formatarTexto(tributo.codigo_receita || '', 4),// 09.3N - Código da Receita
    formatarTexto(tributo.categoria || '01', 2), // 10.3N - Categoria do Tributo
    formatarTexto(tributo.competencia || '', 6), // 11.3N - Período de Apuração
    formatarTexto(tributo.referencia || '', 17), // 12.3N - Número de Referência
    formatarTexto(tributo.identificador || '', 14),// 13.3N - Número do Documento/Identificador
    dataVencimento,                              // 14.3N - Data de Vencimento
    valor,                                       // 15.3N - Valor Principal
    formatarValor(tributo.valor_multa || 0, 15, 2),// 16.3N - Valor da Multa
    formatarValor(tributo.valor_juros || 0, 15, 2),// 17.3N - Valor dos Juros/Encargos
    formatarValor(tributo.valor_desconto || 0, 15, 2),// 18.3N - Valor do Desconto
    formatarTexto(tributo.contribuinte_tipo || '1', 1),// 19.3N - Tipo de Inscrição do Contribuinte
    formatarDocumento(tributo.contribuinte_documento || ''),// 20.3N - Número de Inscrição do Contribuinte
    formatarTexto(tributo.contribuinte_nome || '', 30),// 21.3N - Nome do Contribuinte
    formatarTexto(tributo.numero_documento || '', 20),// 22.3N - Número do Documento
    dataPagamento,                               // 23.3N - Data de Pagamento
    formatarTexto('', 30)                        // 24.3N - Informações Complementares
  ].join('');

  // Valida o tamanho do segmento N (deve ter 240 posições)
  if (segmentoN.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento N: ${segmentoN.length} caracteres (esperado: 240)`);
  }

  return segmentoN;
}

/**
 * Gera o Segmento O para pagamentos de tributos com código de barras
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento O formatado
 */
function gerarSegmentoO(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento O');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do tributo
  const tributo = pagamento.tributo || pagamento;

  // Formata valores e datas
  const valor = formatarValor(tributo.valor || 0, 15, 2);
  const dataPagamento = formatarData(tributo.data_pagamento || new Date());
  
  // Formata o código de barras
  const codigoBarras = formatarTexto(tributo.codigo_barras || '', 48);

  // Constrói o segmento O
  const segmentoO = [
    '033',                                       // 01.3O - Código do Banco
    lote,                                        // 02.3O - Lote de Serviço
    '3',                                         // 03.3O - Tipo de Registro (3 = Detalhe)
    registro,                                    // 04.3O - Número Sequencial do Registro no Lote
    'O',                                         // 05.3O - Código Segmento do Registro Detalhe
    '0',                                         // 06.3O - Tipo de Movimento (0 = Inclusão)
    '00',                                        // 07.3O - Código de Instrução para Movimento
    codigoBarras,                                // 08.3O - Código de Barras
    formatarTexto(tributo.nome_beneficiario || '', 30),// 09.3O - Nome do Beneficiário
    dataPagamento,                               // 10.3O - Data de Vencimento
    valor,                                       // 11.3O - Valor do Documento
    formatarValor(tributo.valor_desconto || 0, 15, 2),// 12.3O - Valor do Desconto/Abatimento
    formatarValor(tributo.valor_acrescimo || 0, 15, 2),// 13.3O - Valor da Multa/Mora
    dataPagamento,                               // 14.3O - Data do Pagamento
    valor,                                       // 15.3O - Valor do Pagamento
    formatarTexto('', 30),                       // 16.3O - Informações Complementares
    formatarTexto('', 40)                        // 17.3O - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do segmento O (deve ter 240 posições)
  if (segmentoO.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento O: ${segmentoO.length} caracteres (esperado: 240)`);
  }

  return segmentoO;
}

/**
 * Gera o Segmento W para pagamentos de GARE (SP)
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número do registro
 * @param {Object} pagamento - Dados do pagamento
 * @returns {string} - Segmento W formatado
 */
function gerarSegmentoW(numero_lote, numero_registro, pagamento) {
  if (!numero_lote || !numero_registro || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento W');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);
  
  // Formata o número do registro
  const registro = formatarNumero(numero_registro, 5);
  
  // Extrai dados do tributo
  const gare = pagamento.gare || pagamento;

  // Formata valores e datas
  const dataReceita = formatarData(gare.data_receita || new Date());

  // Constrói o segmento W
  const segmentoW = [
    '033',                                       // 01.3W - Código do Banco
    lote,                                        // 02.3W - Lote de Serviço
    '3',                                         // 03.3W - Tipo de Registro (3 = Detalhe)
    registro,                                    // 04.3W - Número Sequencial do Registro no Lote
    'W',                                         // 05.3W - Código Segmento do Registro Detalhe
    '0',                                         // 06.3W - Tipo de Movimento (0 = Inclusão)
    '00',                                        // 07.3W - Código de Instrução para Movimento
    formatarTexto(gare.inscricao_estadual || '', 12),// 08.3W - Inscrição Estadual
    formatarTexto(gare.inscricao_debito || '', 16),// 09.3W - Número da Inscrição do Débito
    dataReceita,                                 // 10.3W - Data da Receita
    formatarTexto(gare.tipo_identificacao || '1', 1),// 11.3W - Tipo de Identificação
    formatarTexto(gare.identificacao || '', 14), // 12.3W - Número da Identificação
    formatarValor(gare.valor_principal || 0, 15, 2),// 13.3W - Valor da Receita (Principal)
    formatarValor(gare.valor_juros || 0, 15, 2), // 14.3W - Valor dos Juros
    formatarValor(gare.valor_multa || 0, 15, 2), // 15.3W - Valor da Multa
    formatarValor(gare.valor_descontos || 0, 15, 2),// 16.3W - Valor dos Descontos
    formatarTexto(gare.periodo_referencia || '', 6),// 17.3W - Período de Referência
    formatarTexto('', 112)                       // 18.3W - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do segmento W (deve ter 240 posições)
  if (segmentoW.length !== 240) {
    throw new Error(`Tamanho inválido do Segmento W: ${segmentoW.length} caracteres (esperado: 240)`);
  }

  return segmentoW;
}

module.exports = {
  gerarSegmentoN,
  gerarSegmentoO,
  gerarSegmentoW
};
