/**
 * Serviço para geração do Header e Trailer de Lote CNAB 240
 * Baseado no Manual Técnico SISPAG CNAB 240 do Santander (versão 086)
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
 * Gera o header do lote para o Santander
 * @param {Object} params - Parâmetros do header do lote
 * @param {Object} params.empresa - Dados da empresa
 * @param {number} params.numero_lote - Número do lote
 * @param {string} params.tipo_servico - Tipo de serviço
 * @param {string} params.forma_pagamento - Forma de pagamento
 * @param {string} params.finalidade_lote - Finalidade do lote (opcional)
 * @returns {string} - Linha do header do lote
 */
function gerarHeaderLote(params) {
  const { empresa, numero_lote, tipo_servico, forma_pagamento, finalidade_lote = '01' } = params;

  if (!empresa || !numero_lote || !tipo_servico || !forma_pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para o header do lote');
  }

  try {
    return [
      BANK_CODES.SANTANDER, // 1-3 - Código do Banco (033)
      String(numero_lote).padStart(4, '0'), // 4-7 - Número do Lote
      '1', // 8-8 - Tipo de Registro (1 = Header de Lote)
      'C', // 9-9 - Tipo de Operação (C = Crédito)
      tipo_servico, // 10-11 - Tipo de Serviço
      forma_pagamento, // 12-13 - Forma de Lançamento
      '045', // 14-16 - Número da Versão do Layout do Lote
      ' ', // 17-17 - Uso Exclusivo FEBRABAN/CNAB
      empresa.tipo_inscricao, // 18-18 - Tipo de Inscrição da Empresa
      empresa.inscricao_numero.padStart(14, '0'), // 19-32 - Número de Inscrição da Empresa
      empresa.codigo_convenio.padStart(20, ' '), // 33-52 - Código do Convênio no Banco
      empresa.agencia.padStart(5, '0'), // 53-57 - Agência Mantenedora da Conta
      ' ', // 58-58 - Dígito Verificador da Agência
      empresa.conta.padStart(12, '0'), // 59-70 - Número da Conta
      empresa.dac.padStart(1, '0'), // 71-71 - Dígito Verificador da Conta
      ' ', // 72-72 - Dígito Verificador da Ag/Conta
      empresa.nome.padEnd(30, ' '), // 73-102 - Nome da Empresa
      ' '.repeat(40), // 103-142 - Finalidade do Lote
      ' '.repeat(30), // 143-172 - Histórico de C/C
      empresa.endereco.logradouro.padEnd(30, ' '), // 173-202 - Endereço
      empresa.endereco.numero.padStart(5, '0'), // 203-207 - Número
      empresa.endereco.complemento.padEnd(15, ' '), // 208-222 - Complemento
      empresa.endereco.cidade.padEnd(20, ' '), // 223-242 - Cidade
      empresa.endereco.cep.padStart(8, '0'), // 243-250 - CEP
      empresa.endereco.estado.padEnd(2, ' '), // 251-252 - Estado
      ' '.repeat(8), // 253-260 - Uso Exclusivo FEBRABAN/CNAB
      ' '.repeat(10), // 261-270 - Ocorrências para o Retorno
    ].join('');

  } catch (error) {
    throw new Error(`Erro ao gerar header do lote: ${error.message}`);
  }
}

/**
 * Gera o trailer do lote para o Santander
 * @param {Object} params - Parâmetros do trailer do lote
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.quantidade_registros - Quantidade de registros no lote
 * @param {number} params.somatoria_valores - Somatória dos valores do lote
 * @returns {string} - Linha do trailer do lote
 */
function gerarTrailerLote(params) {
  const { numero_lote, quantidade_registros, somatoria_valores } = params;

  if (!numero_lote || !quantidade_registros || !somatoria_valores) {
    throw new Error('Parâmetros obrigatórios não fornecidos para o trailer do lote');
  }

  try {
    const valorTotal = Math.round(somatoria_valores * 100).toString().padStart(18, '0');

    return [
      BANK_CODES.SANTANDER, // 1-3 - Código do Banco (033)
      String(numero_lote).padStart(4, '0'), // 4-7 - Número do Lote
      '5', // 8-8 - Tipo de Registro (5 = Trailer de Lote)
      ' '.repeat(9), // 9-17 - Uso Exclusivo FEBRABAN/CNAB
      String(quantidade_registros + 2).padStart(6, '0'), // 18-23 - Quantidade de Registros no Lote
      valorTotal, // 24-41 - Somatória dos Valores
      '0'.repeat(18), // 42-59 - Somatória Quantidade Moeda
      '0'.repeat(6), // 60-65 - Número Aviso Débito
      ' '.repeat(165), // 66-230 - Uso Exclusivo FEBRABAN/CNAB
      ' '.repeat(10), // 231-240 - Códigos de Ocorrência
    ].join('');

  } catch (error) {
    throw new Error(`Erro ao gerar trailer do lote: ${error.message}`);
  }
}

module.exports = {
  gerarHeaderLote,
  gerarTrailerLote
};
