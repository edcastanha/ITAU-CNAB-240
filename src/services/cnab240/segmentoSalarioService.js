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
  RECORD_TYPES,
  INSCRIPTION_TYPES
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

/**
 * Gera o registro Segmento P (Registro 3) para pagamentos de salários
 * @param {Object} params - Parâmetros para geração do segmento P
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.funcionario - Dados do funcionário
 * @param {number} params.valor - Valor do pagamento
 * @param {Date|string} params.data_pagamento - Data de pagamento
 * @param {string} params.codigo_banco - Código do banco (opcional, padrão '033')
 * @returns {string} - Linha formatada do Segmento P
 */
function gerarSegmentoP(params) {
  const { 
    numero_lote, 
    numero_registro, 
    funcionario,
    valor,
    data_pagamento,
    codigo_banco = '033'
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario || !valor || !data_pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento P');
  }
  
  // Montagem do registro Segmento P
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(codigo_banco, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento P, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento P, sempre 'P'
  segmento += 'P';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Código do Banco Favorecido (posição: 18-20)
  segmento += formatNumeric(funcionario.banco.codigo || codigo_banco, 3);
  
  // Código da Agência Favorecido (posição: 21-25)
  segmento += formatNumeric(funcionario.banco.agencia, 5);
  
  // Dígito da Agência Favorecido (posição: 26-26)
  segmento += formatAlpha(funcionario.banco.agencia_dv || ' ', 1);
  
  // Número da Conta Favorecido (posição: 27-38)
  segmento += formatNumeric(funcionario.banco.conta, 12);
  
  // Dígito da Conta Favorecido (posição: 39-39)
  segmento += formatAlpha(funcionario.banco.conta_dv || ' ', 1);
  
  // Dígito da Agência/Conta Favorecido (posição: 40-40)
  segmento += formatAlpha(funcionario.banco.agencia_conta_dv || ' ', 1);
  
  // Nome do Favorecido (posição: 41-70)
  segmento += formatAlpha(funcionario.nome, 30);
  
  // Seu Número (posição: 71-90)
  segmento += formatAlpha(funcionario.matricula || '', 20);
  
  // Data do Pagamento (posição: 91-98)
  segmento += formatDate(data_pagamento);
  
  // Tipo da Moeda (posição: 99-101)
  segmento += 'BRL';
  
  // Quantidade de Moeda (posição: 102-116)
  segmento += formatNumeric('0', 15);
  
  // Valor do Pagamento (posição: 117-131)
  segmento += formatValue(valor, 15, 2);
  
  // Nosso Número (posição: 132-151)
  segmento += formatAlpha('', 20);
  
  // Data Real da Efetivação do Pagamento (posição: 152-159)
  segmento += formatDate(data_pagamento);
  
  // Valor Real da Efetivação do Pagamento (posição: 160-174)
  segmento += formatValue(valor, 15, 2);
  
  // Outras Informações (posição: 175-230)
  segmento += formatAlpha('', 56);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento Q (Registro 3) para informações do favorecido
 * @param {Object} params - Parâmetros para geração do segmento Q
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.funcionario - Dados do funcionário
 * @param {string} params.codigo_banco - Código do banco (opcional, padrão '033')
 * @returns {string} - Linha formatada do Segmento Q
 */
function gerarSegmentoQ(params) {
  const { 
    numero_lote, 
    numero_registro, 
    funcionario,
    codigo_banco = '033'
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento Q');
  }
  
  // Montagem do registro Segmento Q
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(codigo_banco, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento Q, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento Q, sempre 'Q'
  segmento += 'Q';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Tipo de Inscrição do Favorecido (posição: 18-18)
  segmento += formatNumeric(funcionario.tipo_inscricao || INSCRIPTION_TYPES.CPF, 1);
  
  // Número de Inscrição do Favorecido (posição: 19-32)
  segmento += formatNumeric(funcionario.cpf, 14);
  
  // Nome do Favorecido (posição: 33-62)
  segmento += formatAlpha(funcionario.nome, 30);
  
  // Endereço do Favorecido (posição: 63-92)
  segmento += formatAlpha(funcionario.endereco?.logradouro || '', 30);
  
  // Bairro do Favorecido (posição: 93-107)
  segmento += formatAlpha(funcionario.endereco?.bairro || '', 15);
  
  // CEP do Favorecido (posição: 108-115)
  segmento += formatNumeric(funcionario.endereco?.cep || '', 8);
  
  // Cidade do Favorecido (posição: 116-130)
  segmento += formatAlpha(funcionario.endereco?.cidade || '', 15);
  
  // UF do Favorecido (posição: 131-132)
  segmento += formatAlpha(funcionario.endereco?.uf || '', 2);
  
  // Tipo de Inscrição do Sacador/Avalista (posição: 133-133)
  segmento += formatNumeric(0, 1);
  
  // Número de Inscrição do Sacador/Avalista (posição: 134-147)
  segmento += formatNumeric(0, 14);
  
  // Nome do Sacador/Avalista (posição: 148-177)
  segmento += formatAlpha('', 30);
  
  // Código do Banco Correspondente na Compensação (posição: 178-180)
  segmento += formatNumeric(codigo_banco, 3);
  
  // Nosso Número no Banco Correspondente (posição: 181-200)
  segmento += formatAlpha('', 20);
  
  // Ocorrências (posição: 201-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 40);
  
  return segmento;
}

/**
 * Gera o registro Segmento R (Registro 3) para informações complementares
 * @param {Object} params - Parâmetros para geração do segmento R
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.funcionario - Dados do funcionário
 * @returns {string} - Linha formatada do Segmento R
 */
function gerarSegmentoR(params) {
  const { 
    numero_lote, 
    numero_registro, 
    funcionario
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento R');
  }
  
  // Montagem do registro Segmento R
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento R, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento R, sempre 'R'
  segmento += 'R';
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17) - 00=Inclusão
  segmento += formatNumeric('00', 2);
  
  // Código do Desconto 2 (posição: 18-18)
  segmento += formatNumeric(0, 1);
  
  // Data do Desconto 2 (posição: 19-26)
  segmento += formatNumeric(0, 8);
  
  // Valor/Percentual do Desconto 2 (posição: 27-41)
  segmento += formatNumeric(0, 15);
  
  // Código do Desconto 3 (posição: 42-42)
  segmento += formatNumeric(0, 1);
  
  // Data do Desconto 3 (posição: 43-50)
  segmento += formatNumeric(0, 8);
  
  // Valor/Percentual do Desconto 3 (posição: 51-65)
  segmento += formatNumeric(0, 15);
  
  // Código da Multa (posição: 66-66)
  segmento += formatNumeric(0, 1);
  
  // Data da Multa (posição: 67-74)
  segmento += formatNumeric(0, 8);
  
  // Valor/Percentual da Multa (posição: 75-89)
  segmento += formatNumeric(0, 15);
  
  // Informação ao Pagador (posição: 90-99)
  segmento += formatAlpha('', 10);
  
  // Informação 3 (posição: 100-139)
  segmento += formatAlpha('', 40);
  
  // Informação 4 (posição: 140-179)
  segmento += formatAlpha('', 40);
  
  // Ocorrências (posição: 180-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 61);
  
  return segmento;
}

module.exports = {
  gerarSegmentoC,
  gerarSegmentoD,
  gerarSegmentoP,
  gerarSegmentoQ,
  gerarSegmentoR
};
