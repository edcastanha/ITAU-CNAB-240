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
 * Gera o registro Header de Lote (Registro 1)
 * @param {Object} params - Parâmetros para geração do header de lote
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {string} params.tipo_servico - Tipo de serviço/pagamento (20=Fornecedores, 30=Salários, 22=Tributos)
 * @param {string} params.forma_pagamento - Forma de pagamento (01=CC, 03=DOC, 41=TED, etc.)
 * @param {Object} params.empresa - Dados da empresa
 * @param {string} params.empresa.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.empresa.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} params.empresa.agencia - Número da agência
 * @param {string} params.empresa.conta - Número da conta
 * @param {string} params.empresa.dac - Dígito verificador da conta
 * @param {string} params.empresa.nome - Nome da empresa
 * @param {string} [params.finalidade_lote] - Finalidade do lote (opcional)
 * @param {string} [params.historico_cc] - Histórico para conta corrente (opcional)
 * @param {Object} [params.endereco] - Dados de endereço da empresa (opcional)
 * @returns {string} - Linha formatada do Header de Lote
 */
function gerarHeaderLote(params) {
  const { 
    numero_lote, 
    tipo_servico, 
    forma_pagamento, 
    empresa, 
    finalidade_lote = '',
    historico_cc = '',
    endereco = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !tipo_servico || !forma_pagamento || !empresa) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Header de Lote');
  }
  
  // Montagem do registro Header de Lote
  let header = '';
  
  // Código do Banco (posição: 1-3)
  header += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  header += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Header de Lote, sempre '1'
  header += RECORD_TYPES.HEADER_LOTE;
  
  // Tipo de Operação (posição: 9-9) - Para pagamentos, sempre 'C' (Crédito)
  header += OPERATION_TYPES.CREDITO;
  
  // Tipo de Serviço/Pagamento (posição: 10-11)
  header += formatNumeric(tipo_servico, 2);
  
  // Forma de Pagamento (posição: 12-13)
  header += formatNumeric(forma_pagamento, 2);
  
  // Layout do Lote (posição: 14-16)
  header += formatNumeric(LAYOUT_VERSIONS.LOTE, 3);
  
  // Brancos (posição: 17-17)
  header += formatAlpha('', 1);
  
  // Tipo de Inscrição da Empresa (posição: 18-18)
  header += formatNumeric(empresa.tipo_inscricao, 1);
  
  // Número de Inscrição da Empresa (posição: 19-32)
  header += formatNumeric(empresa.inscricao_numero, 14);
  
  // Identificação do Lançamento (posição: 33-36)
  header += formatAlpha(params.identificacao_lancamento || '', 4);
  
  // Brancos (posição: 37-52)
  header += formatAlpha('', 16);
  
  // Agência (posição: 53-57)
  header += formatNumeric(empresa.agencia, 5);
  
  // Brancos (posição: 58-58)
  header += formatAlpha('', 1);
  
  // Conta (posição: 59-70)
  header += formatNumeric(empresa.conta, 12);
  
  // Brancos (posição: 71-71)
  header += formatAlpha('', 1);
  
  // DAC (posição: 72-72)
  header += formatNumeric(empresa.dac, 1);
  
  // Nome da Empresa (posição: 73-102)
  header += formatAlpha(empresa.nome, 30);
  
  // Finalidade do Lote (posição: 103-132)
  header += formatAlpha(finalidade_lote, 30);
  
  // Histórico de C/C (posição: 133-142)
  header += formatAlpha(historico_cc, 10);
  
  // Endereço da Empresa (posição: 143-172)
  header += formatAlpha(endereco.logradouro || '', 30);
  
  // Número (posição: 173-177)
  header += formatNumeric(endereco.numero || 0, 5);
  
  // Complemento (posição: 178-192)
  header += formatAlpha(endereco.complemento || '', 15);
  
  // Cidade (posição: 193-212)
  header += formatAlpha(endereco.cidade || '', 20);
  
  // CEP (posição: 213-220)
  header += formatNumeric(endereco.cep || 0, 8);
  
  // Estado (posição: 221-222)
  header += formatAlpha(endereco.estado || '', 2);
  
  // Brancos (posição: 223-230)
  header += formatAlpha('', 8);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  header += formatAlpha('', 10);
  
  return header;
}

/**
 * Gera o registro Trailer de Lote (Registro 5)
 * @param {Object} params - Parâmetros para geração do trailer de lote
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.quantidade_registros - Quantidade de registros no lote (incluindo header e trailer)
 * @param {number} params.somatoria_valores - Somatória dos valores dos pagamentos do lote
 * @returns {string} - Linha formatada do Trailer de Lote
 */
function gerarTrailerLote(params) {
  const { numero_lote, quantidade_registros, somatoria_valores } = params;
  
  // Validações básicas
  if (numero_lote === undefined || quantidade_registros === undefined || somatoria_valores === undefined) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Trailer de Lote');
  }
  
  // Montagem do registro Trailer de Lote
  let trailer = '';
  
  // Código do Banco (posição: 1-3)
  trailer += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  trailer += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Trailer de Lote, sempre '5'
  trailer += RECORD_TYPES.TRAILER_LOTE;
  
  // Brancos (posição: 9-17)
  trailer += formatAlpha('', 9);
  
  // Quantidade de Registros do Lote (posição: 18-23)
  trailer += formatNumeric(quantidade_registros, 6);
  
  // Somatória dos Valores (posição: 24-41)
  // Valor com 2 casas decimais, 18 posições
  trailer += formatNumeric(Math.round(somatoria_valores * 100), 18);
  
  // Zeros (posição: 42-59)
  trailer += formatNumeric(0, 18);
  
  // Zeros (posição: 60-230)
  trailer += formatNumeric(0, 171);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  trailer += formatAlpha('', 10);
  
  return trailer;
}

module.exports = {
  gerarHeaderLote,
  gerarTrailerLote
};
