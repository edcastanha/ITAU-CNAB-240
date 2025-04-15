/**
 * Serviço para geração dos Segmentos A e B para pagamentos via crédito em conta, DOC, TED e PIX
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
  PAYMENT_FORMS,
  INSCRIPTION_TYPES,
  PURPOSE_CODES,
  NOTIFICATION_CODES
} = require('../../config/constants');

/**
 * Gera o registro Segmento A (Registro 3) para pagamentos
 * @param {Object} params - Parâmetros para geração do segmento A
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.favorecido - Dados do favorecido (para pagamentos a fornecedores)
 * @param {Object} params.funcionario - Dados do funcionário (para pagamentos de salários)
 * @param {Object} params.pagamento - Dados do pagamento
 * @param {Object} params.informacoes - Informações adicionais
 * @returns {string} - Linha formatada do Segmento A
 */
function gerarSegmentoA(params) {
  const { 
    numero_lote, 
    numero_registro, 
    favorecido,
    funcionario,
    pagamento,
    informacoes = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || (!favorecido && !funcionario)) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento A');
  }
  
  // Define os dados do beneficiário (favorecido ou funcionário)
  const beneficiario = funcionario || favorecido;
  const dadosPagamento = funcionario ? funcionario.dados : pagamento;
  const informacoesPagamento = funcionario ? {
    finalidade_doc: '03', // Pagamento de Salários
    finalidade_ted: '00003', // Pagamento de Salários
    aviso: '2'
  } : informacoes;

  // Validações adicionais conforme manual técnico
  if (!beneficiario.tipo_inscricao || !INSCRIPTION_TYPES[beneficiario.tipo_inscricao]) {
    throw new Error('Tipo de inscrição inválido. Deve ser 1 (CPF) ou 2 (CNPJ)');
  }

  if (!beneficiario.inscricao_numero) {
    throw new Error('Número de inscrição é obrigatório');
  }

  if (beneficiario.tipo_inscricao === INSCRIPTION_TYPES.CPF && beneficiario.inscricao_numero.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }

  if (beneficiario.tipo_inscricao === INSCRIPTION_TYPES.CNPJ && beneficiario.inscricao_numero.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  if (!beneficiario.banco || !BANK_CODES[beneficiario.banco]) {
    throw new Error('Código do banco favorecido é obrigatório');
  }

  if (!beneficiario.agencia || beneficiario.agencia.length !== 5) {
    throw new Error('Agência deve ter 5 dígitos');
  }

  if (!beneficiario.conta || beneficiario.conta.length > 10) {
    throw new Error('Conta deve ter até 10 dígitos');
  }

  if (!beneficiario.nome || beneficiario.nome.length > 30) {
    throw new Error('Nome do favorecido é obrigatório e deve ter até 30 caracteres');
  }
  
  // Montagem do registro Segmento A
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento A, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento A, sempre 'A'
  segmento += 'A';
  
  // Tipo de Movimento (posição: 15-17)
  segmento += '000';
  
  // Código da Instrução (posição: 18-19)
  segmento += formatNumeric(informacoesPagamento.codigo_instrucao || '00', 2);
  
  // Código da Câmara Centralizadora (posição: 20-22)
  segmento += formatNumeric(informacoesPagamento.camara || '000', 3);
  
  // Código do Banco Favorecido (posição: 23-25)
  segmento += formatNumeric(beneficiario.banco || BANK_CODES.ITAU, 3);
  
  // Código da Agência Favorecido (posição: 26-30)
  segmento += formatNumeric(beneficiario.agencia, 5);
  
  // Dígito da Agência Favorecido (posição: 31-31)
  segmento += formatAlpha(beneficiario.dac_agencia || ' ', 1);
  
  // Número da Conta Favorecido (posição: 32-41)
  segmento += formatNumeric(beneficiario.conta, 10);
  
  // Dígito da Conta Favorecido (posição: 42-42)
  segmento += formatAlpha(beneficiario.dac, 1);
  
  // Nome do Favorecido (posição: 43-72)
  segmento += formatAlpha(beneficiario.nome, 30);
  
  // Seu Número (posição: 73-92)
  segmento += formatAlpha(dadosPagamento.seu_numero || '', 20);
  
  // Data do Pagamento (posição: 93-100)
  segmento += formatDate(dadosPagamento.data);
  
  // Tipo da Moeda (posição: 101-103)
  segmento += 'BRL';
  
  // Quantidade de Moeda (posição: 104-118)
  segmento += formatNumeric('0', 15);
  
  // Valor do Pagamento (posição: 119-133)
  segmento += formatValue(dadosPagamento.valor, 15);
  
  // Nosso Número (posição: 134-153)
  segmento += formatAlpha(dadosPagamento.nosso_numero || '', 20);
  
  // Data Real do Pagamento (posição: 154-161)
  segmento += '        ';
  
  // Valor Real do Pagamento (posição: 162-176)
  segmento += formatValue('0', 15);
  
  // Informação 2 (posição: 177-216)
  segmento += formatAlpha(dadosPagamento.informacao2 || '', 40);
  
  // Código Finalidade DOC (posição: 217-219)
  segmento += formatAlpha(informacoesPagamento.finalidade_doc || '', 3);
  
  // Código Finalidade TED (posição: 220-224)
  segmento += formatAlpha(informacoesPagamento.finalidade_ted || '', 5);
  
  // Código Finalidade Complementar (posição: 225-226)
  segmento += formatAlpha(informacoesPagamento.finalidade_complementar || '', 2);
  
  // CNAB (posição: 227-229)
  segmento += formatAlpha('', 3);
  
  // Aviso ao Favorecido (posição: 230-230)
  segmento += formatNumeric(informacoesPagamento.aviso || '0', 1);
  
  // Ocorrências (posição: 231-240)
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento B (Registro 3) para dados complementares do favorecido
 * @param {Object} params - Parâmetros para geração do segmento B
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.favorecido - Dados do favorecido (para pagamentos a fornecedores)
 * @param {Object} params.funcionario - Dados do funcionário (para pagamentos de salários)
 * @returns {string} - Linha formatada do Segmento B
 */
function gerarSegmentoB(params) {
  const { 
    numero_lote, 
    numero_registro, 
    favorecido,
    funcionario
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || (!favorecido && !funcionario)) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento B');
  }
  
  // Define os dados do beneficiário (favorecido ou funcionário)
  const beneficiario = funcionario || favorecido;
  const endereco = beneficiario.endereco || {};

  // Validações adicionais conforme manual técnico
  if (!endereco.logradouro || endereco.logradouro.length > 30) {
    throw new Error('Logradouro é obrigatório e deve ter até 30 caracteres');
  }

  if (!endereco.numero || endereco.numero.length > 5) {
    throw new Error('Número é obrigatório e deve ter até 5 caracteres');
  }

  if (!endereco.cidade || endereco.cidade.length > 15) {
    throw new Error('Cidade é obrigatória e deve ter até 15 caracteres');
  }

  if (!endereco.cep || endereco.cep.length !== 8) {
    throw new Error('CEP é obrigatório e deve ter 8 dígitos');
  }

  if (!endereco.uf || endereco.uf.length !== 2) {
    throw new Error('UF é obrigatória e deve ter 2 caracteres');
  }

  // Validação do tipo de inscrição e número
  if (!beneficiario.tipo_inscricao || !INSCRIPTION_TYPES[beneficiario.tipo_inscricao]) {
    throw new Error('Tipo de inscrição inválido. Deve ser 1 (CPF) ou 2 (CNPJ)');
  }

  if (!beneficiario.inscricao_numero) {
    throw new Error('Número de inscrição é obrigatório');
  }

  if (beneficiario.tipo_inscricao === INSCRIPTION_TYPES.CPF && beneficiario.inscricao_numero.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }

  if (beneficiario.tipo_inscricao === INSCRIPTION_TYPES.CNPJ && beneficiario.inscricao_numero.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }
  
  // Montagem do registro Segmento B
  let segmento = '';
  
  // Código do Banco (posição: 1-3)
  segmento += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7)
  segmento += formatNumeric(numero_lote, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Segmento B, sempre '3'
  segmento += RECORD_TYPES.DETALHE;
  
  // Número do Registro (posição: 9-13)
  segmento += formatNumeric(numero_registro, 5);
  
  // Código do Segmento (posição: 14-14) - Para Segmento B, sempre 'B'
  segmento += 'B';
  
  // Tipo de Inscrição (posição: 15-15)
  segmento += formatNumeric(beneficiario.tipo_inscricao, 1);
  
  // Número de Inscrição (posição: 16-30)
  segmento += formatNumeric(beneficiario.inscricao_numero, 15);
  
  // Logradouro (posição: 31-60)
  segmento += formatAlpha(endereco.logradouro, 30);
  
  // Número (posição: 61-65)
  segmento += formatAlpha(endereco.numero, 5);
  
  // Complemento (posição: 66-80)
  segmento += formatAlpha(endereco.complemento || '', 15);
  
  // Bairro (posição: 81-95)
  segmento += formatAlpha(endereco.bairro || '', 15);
  
  // Cidade (posição: 96-110)
  segmento += formatAlpha(endereco.cidade, 15);
  
  // CEP (posição: 111-115)
  segmento += formatNumeric(endereco.cep.substring(0, 5), 5);
  
  // Complemento do CEP (posição: 116-120)
  segmento += formatNumeric(endereco.cep.substring(5), 3);
  
  // Estado (posição: 121-122)
  segmento += formatAlpha(endereco.uf, 2);
  
  // Data de Vencimento (posição: 123-130)
  segmento += formatDate(beneficiario.data_vencimento || '');
  
  // Valor do Documento (posição: 131-145)
  segmento += formatValue(beneficiario.valor_documento || '0', 15);
  
  // Valor do Abatimento (posição: 146-160)
  segmento += formatValue(beneficiario.valor_abatimento || '0', 15);
  
  // Valor do Desconto (posição: 161-175)
  segmento += formatValue(beneficiario.valor_desconto || '0', 15);
  
  // Valor da Mora (posição: 176-190)
  segmento += formatValue(beneficiario.valor_mora || '0', 15);
  
  // Valor da Multa (posição: 191-205)
  segmento += formatValue(beneficiario.valor_multa || '0', 15);
  
  // Código/Documento do Favorecido (posição: 206-220)
  segmento += formatAlpha(beneficiario.codigo_documento || '', 15);
  
  // Aviso ao Favorecido (posição: 221-221)
  segmento += formatNumeric(beneficiario.aviso || '0', 1);
  
  // Códigos das Agências dos Bancos ISPB (posição: 222-227)
  segmento += formatNumeric(beneficiario.ispb || '', 6);
  
  // Filler (posição: 228-240)
  segmento += formatAlpha('', 13);
  
  return segmento;
}

/**
 * Gera o registro Segmento C (Registro 3) para informações complementares de pagamento
 * @param {Object} params - Parâmetros para geração do segmento C
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.funcionario - Dados do funcionário
 * @returns {string} - Linha formatada do Segmento C
 */
function gerarSegmentoC(params) {
  const { 
    numero_lote, 
    numero_registro, 
    funcionario
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento C');
  }

  const complemento = funcionario.complemento || {};

  // Validações adicionais conforme manual técnico
  if (complemento.valor_ir && (isNaN(complemento.valor_ir) || complemento.valor_ir < 0)) {
    throw new Error('Valor do IR deve ser um número positivo');
  }

  if (complemento.valor_iss && (isNaN(complemento.valor_iss) || complemento.valor_iss < 0)) {
    throw new Error('Valor do ISS deve ser um número positivo');
  }

  if (complemento.valor_inss && (isNaN(complemento.valor_inss) || complemento.valor_inss < 0)) {
    throw new Error('Valor do INSS deve ser um número positivo');
  }

  if (complemento.valor_fgts && (isNaN(complemento.valor_fgts) || complemento.valor_fgts < 0)) {
    throw new Error('Valor do FGTS deve ser um número positivo');
  }

  if (complemento.numero_processo && complemento.numero_processo.length > 20) {
    throw new Error('Número do processo deve ter até 20 caracteres');
  }

  if (complemento.numero_nota && complemento.numero_nota.length > 20) {
    throw new Error('Número da nota fiscal deve ter até 20 caracteres');
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
  
  // Valor do IR (posição: 15-29)
  segmento += formatValue(complemento.valor_ir || '0', 15);
  
  // Valor do ISS (posição: 30-44)
  segmento += formatValue(complemento.valor_iss || '0', 15);
  
  // Valor do INSS (posição: 45-59)
  segmento += formatValue(complemento.valor_inss || '0', 15);
  
  // Valor do FGTS (posição: 60-74)
  segmento += formatValue(complemento.valor_fgts || '0', 15);
  
  // Valor dos Descontos (posição: 75-89)
  segmento += formatValue(complemento.valor_descontos || '0', 15);
  
  // Valor dos Acréscimos (posição: 90-104)
  segmento += formatValue(complemento.valor_acrescimos || '0', 15);
  
  // Número do Processo (posição: 105-124)
  segmento += formatAlpha(complemento.numero_processo || '', 20);
  
  // Número da Nota Fiscal (posição: 125-144)
  segmento += formatAlpha(complemento.numero_nota || '', 20);
  
  // Filler (posição: 145-240)
  segmento += formatAlpha('', 96);
  
  return segmento;
}

/**
 * Gera o segmento P para pagamentos
 * @param {Object} params - Parâmetros do segmento
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.numero_registro - Número do registro
 * @param {Object} params.funcionario - Dados do funcionário
 * @returns {string} - Linha do segmento P
 */
function gerarSegmentoP(params) {
  const { numero_lote, numero_registro, funcionario } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos');
  }
  
  // Formata os dados
  const codigoBanco = funcionario.banco.codigo || BANK_CODES.ITAU;
  const agencia = funcionario.banco.agencia.padStart(5, '0');
  const conta = funcionario.banco.conta.padStart(12, '0');
  const dac = funcionario.banco.dac.padStart(1, '0');
  const valor = Math.round(funcionario.valor * 100).toString().padStart(15, '0');
  
  // Gera o segmento P
  return [
    codigoBanco, // 1-3
    '0000', // 4-7
    numero_lote.toString().padStart(4, '0'), // 8-11
    '3', // 12-12
    numero_registro.toString().padStart(5, '0'), // 13-17
    'P', // 18-18
    ' ', // 19-19
    '01', // 20-21
    codigoBanco, // 22-24
    '0', // 25-25
    agencia, // 26-30
    ' ', // 31-31
    conta, // 32-43
    dac, // 44-44
    ' ', // 45-45
    funcionario.nome.padEnd(30, ' '), // 46-75
    funcionario.data_pagamento, // 76-83
    'BRL', // 84-86
    '000000000000000', // 87-101
    valor, // 102-116
    '000000000000000', // 117-131
    '000000000000000', // 132-146
    ' ', // 147-147
    ' ', // 148-149
    ' ', // 150-150
    ' ', // 151-165
    ' ', // 166-180
    ' ', // 181-195
    ' ', // 196-220
    ' ', // 221-240
  ].join('');
}

/**
 * Gera o segmento Q para pagamentos
 * @param {Object} params - Parâmetros do segmento
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.numero_registro - Número do registro
 * @param {Object} params.funcionario - Dados do funcionário
 * @returns {string} - Linha do segmento Q
 */
function gerarSegmentoQ(params) {
  const { numero_lote, numero_registro, funcionario } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos');
  }
  
  // Formata os dados
  const codigoBanco = funcionario.banco.codigo || BANK_CODES.ITAU;
  const cpf = funcionario.cpf.padStart(14, '0');
  const cep = funcionario.endereco.cep.substring(0, 5);
  const cepSufixo = funcionario.endereco.cep.substring(5);
  
  // Gera o segmento Q
  return [
    codigoBanco, // 1-3
    '0000', // 4-7
    numero_lote.toString().padStart(4, '0'), // 8-11
    '3', // 12-12
    numero_registro.toString().padStart(5, '0'), // 13-17
    'Q', // 18-18
    ' ', // 19-19
    '1', // 20-20
    cpf, // 21-34
    funcionario.nome.padEnd(30, ' '), // 35-64
    funcionario.endereco.logradouro.padEnd(35, ' '), // 65-99
    funcionario.endereco.bairro.padEnd(25, ' '), // 100-124
    cep, // 125-129
    cepSufixo, // 130-132
    funcionario.endereco.cidade.padEnd(20, ' '), // 133-152
    funcionario.endereco.estado, // 153-154
    ' ', // 155-155
    ' ', // 156-156
    ' ', // 157-172
    ' ', // 173-240
  ].join('');
}

/**
 * Gera o segmento R para pagamentos
 * @param {Object} params - Parâmetros do segmento
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.numero_registro - Número do registro
 * @param {Object} params.funcionario - Dados do funcionário
 * @returns {string} - Linha do segmento R
 */
function gerarSegmentoR(params) {
  const { numero_lote, numero_registro, funcionario } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !funcionario) {
    throw new Error('Parâmetros obrigatórios não fornecidos');
  }
  
  // Formata os dados
  const codigoBanco = funcionario.banco.codigo || BANK_CODES.ITAU;
  const valorIr = Math.round(funcionario.complemento.valor_ir * 100).toString().padStart(15, '0');
  const valorIss = Math.round(funcionario.complemento.valor_iss * 100).toString().padStart(15, '0');
  const valorInss = Math.round(funcionario.complemento.valor_inss * 100).toString().padStart(15, '0');
  const valorFgts = Math.round(funcionario.complemento.valor_fgts * 100).toString().padStart(15, '0');
  const valorDescontos = Math.round(funcionario.complemento.valor_descontos * 100).toString().padStart(15, '0');
  const valorBonus = Math.round(funcionario.complemento.valor_bonus * 100).toString().padStart(15, '0');
  const numeroProcesso = funcionario.complemento.numero_processo || '';
  const numeroNotaFiscal = funcionario.complemento.numero_nota_fiscal || '';
  
  // Gera o segmento R
  return [
    codigoBanco, // 1-3
    '0000', // 4-7
    numero_lote.toString().padStart(4, '0'), // 8-11
    '3', // 12-12
    numero_registro.toString().padStart(5, '0'), // 13-17
    'R', // 18-18
    ' ', // 19-19
    '0', // 20-20
    valorIr, // 21-35
    valorIss, // 36-50
    valorInss, // 51-65
    valorFgts, // 66-80
    valorDescontos, // 81-95
    valorBonus, // 96-110
    numeroProcesso.padEnd(30, ' '), // 111-140
    numeroNotaFiscal.padEnd(20, ' '), // 141-160
    ' '.repeat(80), // 161-240
  ].join('');
}

// Exporta as funções
module.exports = {
  gerarSegmentoA,
  gerarSegmentoB,
  gerarSegmentoC,
  gerarSegmentoP,
  gerarSegmentoQ,
  gerarSegmentoR
};
