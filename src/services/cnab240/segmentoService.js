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
 * Gera o registro Segmento A (Registro 3) para pagamentos via crédito em conta, DOC, TED e PIX
 * @param {Object} params - Parâmetros para geração do segmento A
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.favorecido - Dados do favorecido
 * @param {string} params.favorecido.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.favorecido.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} params.favorecido.nome - Nome do favorecido
 * @param {string} params.favorecido.banco - Código do banco do favorecido
 * @param {string} params.favorecido.agencia - Número da agência do favorecido
 * @param {string} params.favorecido.conta - Número da conta do favorecido
 * @param {string} params.favorecido.dac - Dígito verificador da conta do favorecido
 * @param {Object} params.pagamento - Dados do pagamento
 * @param {Date|string} params.pagamento.data - Data do pagamento
 * @param {string} params.pagamento.moeda - Código da moeda (default: 'BRL')
 * @param {number} params.pagamento.valor - Valor do pagamento
 * @param {string} params.pagamento.nosso_numero - Nosso número (controle do banco)
 * @param {string} params.pagamento.seu_numero - Seu número (controle da empresa)
 * @param {Object} params.informacoes - Informações adicionais
 * @param {string} params.informacoes.finalidade_doc - Código de finalidade DOC
 * @param {string} params.informacoes.finalidade_ted - Código de finalidade TED
 * @param {string} params.informacoes.codigo_instrucao - Código de instrução para movimento
 * @param {string} params.informacoes.emissao_aviso - Código para emissão de aviso
 * @returns {string} - Linha formatada do Segmento A
 */
function gerarSegmentoA(params) {
  const { 
    numero_lote, 
    numero_registro, 
    favorecido, 
    pagamento,
    informacoes = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !favorecido || !pagamento) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento A');
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
  
  // Tipo de Movimento (posição: 15-15) - 0=Inclusão
  segmento += formatNumeric(informacoes.tipo_movimento || 0, 1);
  
  // Código de Instrução para Movimento (posição: 16-17)
  segmento += formatNumeric(informacoes.codigo_instrucao || '00', 2);
  
  // Código da Câmara Compensação (posição: 18-20)
  // 018=TED, 700=DOC, 888=PIX
  segmento += formatNumeric(informacoes.codigo_camara || '000', 3);
  
  // Código do Banco Favorecido (posição: 21-23)
  segmento += formatNumeric(favorecido.banco, 3);
  
  // Agência Conta Favorecido (posição: 24-43)
  segmento += formatNumeric(favorecido.agencia, 5);        // Agência
  segmento += formatAlpha(favorecido.agencia_dv || '', 1); // DV da Agência
  segmento += formatNumeric(favorecido.conta, 12);         // Conta
  segmento += formatAlpha(favorecido.conta_dv || '', 1);   // DV da Conta
  segmento += formatAlpha(favorecido.dac || '', 1);        // DV da Agência/Conta
  
  // Nome do Favorecido (posição: 44-73)
  segmento += formatAlpha(favorecido.nome, 30);
  
  // Seu Número (posição: 74-93) - Número de controle da empresa
  segmento += formatAlpha(pagamento.seu_numero || '', 20);
  
  // Data do Pagamento (posição: 94-101)
  segmento += formatDate(pagamento.data);
  
  // Tipo da Moeda (posição: 102-104) - 'BRL' = Real
  segmento += formatAlpha(pagamento.moeda || 'BRL', 3);
  
  // Quantidade de Moeda (posição: 105-119) - Zeros para Real
  segmento += formatNumeric(0, 15);
  
  // Valor do Pagamento (posição: 120-134)
  segmento += formatValue(pagamento.valor, 15, 2);
  
  // Nosso Número (posição: 135-154) - Número de controle do banco
  segmento += formatAlpha(pagamento.nosso_numero || '', 20);
  
  // Data Real do Pagamento (posição: 155-162) - Zeros na remessa
  segmento += formatNumeric(0, 8);
  
  // Valor Real do Pagamento (posição: 163-177) - Zeros na remessa
  segmento += formatNumeric(0, 15);
  
  // Informação 2 (posição: 178-217) - Mensagem ou número do documento
  segmento += formatAlpha(pagamento.documento || '', 40);
  
  // Finalidade do DOC (posição: 218-219)
  segmento += formatAlpha(informacoes.finalidade_doc || '', 2);
  
  // Finalidade da TED (posição: 220-224)
  segmento += formatAlpha(informacoes.finalidade_ted || '', 5);
  
  // Código Finalidade Complementar (posição: 225-226)
  segmento += formatAlpha(informacoes.finalidade_complementar || '', 2);
  
  // Brancos (posição: 227-229)
  segmento += formatAlpha('', 3);
  
  // Emissão de Aviso (posição: 230-230)
  segmento += formatNumeric(informacoes.emissao_aviso || NOTIFICATION_CODES.NAO_EMITE, 1);
  
  // Ocorrências (posição: 231-240) - Apenas para retorno, na remessa preencher com brancos
  segmento += formatAlpha('', 10);
  
  return segmento;
}

/**
 * Gera o registro Segmento B (Registro 3) para informações complementares
 * @param {Object} params - Parâmetros para geração do segmento B
 * @param {number} params.numero_lote - Número sequencial do lote
 * @param {number} params.numero_registro - Número sequencial do registro no lote
 * @param {Object} params.favorecido - Dados do favorecido
 * @param {string} params.favorecido.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.favorecido.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} [params.favorecido.endereco] - Endereço do favorecido
 * @param {string} [params.favorecido.numero] - Número do endereço
 * @param {string} [params.favorecido.complemento] - Complemento do endereço
 * @param {string} [params.favorecido.bairro] - Bairro
 * @param {string} [params.favorecido.cidade] - Cidade
 * @param {string} [params.favorecido.cep] - CEP
 * @param {string} [params.favorecido.estado] - Estado (UF)
 * @param {string} [params.favorecido.email] - Email do favorecido
 * @param {Object} [params.pix] - Dados específicos para PIX (obrigatório para PIX Transferência)
 * @param {string} [params.pix.tipo_chave] - Tipo de chave PIX (1=Telefone, 2=Email, 3=CPF/CNPJ, 4=Chave aleatória)
 * @param {string} [params.pix.chave] - Chave PIX
 * @param {string} [params.pix.tx_id] - Identificador da transação PIX
 * @returns {string} - Linha formatada do Segmento B
 */
function gerarSegmentoB(params) {
  const { 
    numero_lote, 
    numero_registro, 
    favorecido,
    pix = {}
  } = params;
  
  // Validações básicas
  if (!numero_lote || !numero_registro || !favorecido) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o Segmento B');
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
  
  // Brancos (posição: 15-17)
  segmento += formatAlpha('', 3);
  
  // Tipo de Inscrição do Favorecido (posição: 18-18)
  segmento += formatNumeric(favorecido.tipo_inscricao, 1);
  
  // Número de Inscrição do Favorecido (posição: 19-32)
  segmento += formatNumeric(favorecido.inscricao_numero, 14);
  
  // Endereço (posição: 33-62)
  segmento += formatAlpha(favorecido.endereco || '', 30);
  
  // Número (posição: 63-67)
  segmento += formatNumeric(favorecido.numero || 0, 5);
  
  // Complemento (posição: 68-82)
  segmento += formatAlpha(favorecido.complemento || '', 15);
  
  // Bairro (posição: 83-97)
  segmento += formatAlpha(favorecido.bairro || '', 15);
  
  // Cidade (posição: 98-117)
  segmento += formatAlpha(favorecido.cidade || '', 20);
  
  // CEP (posição: 118-125)
  segmento += formatNumeric(favorecido.cep || 0, 8);
  
  // Estado (posição: 126-127)
  segmento += formatAlpha(favorecido.estado || '', 2);
  
  // Data de Vencimento (posição: 128-135) - Zeros para pagamentos
  segmento += formatNumeric(0, 8);
  
  // Valor do Documento (posição: 136-150) - Zeros para pagamentos
  segmento += formatNumeric(0, 15);
  
  // Valor do Abatimento (posição: 151-165) - Zeros para pagamentos
  segmento += formatNumeric(0, 15);
  
  // Valor do Desconto (posição: 166-180) - Zeros para pagamentos
  segmento += formatNumeric(0, 15);
  
  // Valor da Mora (posição: 181-195) - Zeros para pagamentos
  segmento += formatNumeric(0, 15);
  
  // Valor da Multa (posição: 196-210) - Zeros para pagamentos
  segmento += formatNumeric(0, 15);
  
  // Informações para PIX (posição: 211-230)
  if (pix && pix.tipo_chave) {
    // Tipo de Chave PIX (posição: 211)
    segmento += formatNumeric(pix.tipo_chave, 1);
    
    // Chave PIX (posição: 212-230)
    segmento += formatAlpha(pix.chave || '', 19);
  } else {
    // Se não for PIX, preencher com brancos
    segmento += formatAlpha('', 20);
  }
  
  // Email do Favorecido (posição: 231-240)
  segmento += formatAlpha(favorecido.email || '', 10);
  
  return segmento;
}

module.exports = {
  gerarSegmentoA,
  gerarSegmentoB
};
