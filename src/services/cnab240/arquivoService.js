/**
 * Serviço para geração do Header e Trailer de Arquivo CNAB 240
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
  LAYOUT_VERSIONS 
} = require('../../config/constants');

/**
 * Gera o registro Header de Arquivo (Registro 0)
 * @param {Object} params - Parâmetros para geração do header
 * @param {Object} params.empresa - Dados da empresa
 * @param {string} params.empresa.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} params.empresa.inscricao_numero - Número de inscrição (CPF/CNPJ)
 * @param {string} params.empresa.agencia - Número da agência
 * @param {string} params.empresa.conta - Número da conta
 * @param {string} params.empresa.dac - Dígito verificador da conta
 * @param {string} params.empresa.nome - Nome da empresa
 * @param {Date|string} [params.data_geracao] - Data de geração do arquivo (opcional, default: data atual)
 * @param {string} [params.hora_geracao] - Hora de geração do arquivo (opcional, default: hora atual)
 * @returns {string} - Linha formatada do Header de Arquivo
 */
function gerarHeaderArquivo(params) {
  const { empresa } = params;
  
  // Validações básicas
  if (!empresa) {
    throw new Error('Dados da empresa são obrigatórios para gerar o Header de Arquivo');
  }
  
  // Data e hora de geração (default: data/hora atual)
  const dataAtual = new Date();
  const dataGeracao = params.data_geracao || dataAtual;
  const horaGeracao = params.hora_geracao || 
    `${String(dataAtual.getHours()).padStart(2, '0')}${String(dataAtual.getMinutes()).padStart(2, '0')}${String(dataAtual.getSeconds()).padStart(2, '0')}`;
  
  // Montagem do registro Header de Arquivo
  let header = '';
  
  // Código do Banco (posição: 1-3)
  header += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7) - Para Header de Arquivo, sempre '0000'
  header += formatNumeric(0, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Header de Arquivo, sempre '0'
  header += RECORD_TYPES.HEADER_ARQUIVO;
  
  // Brancos (posição: 9-14)
  header += formatAlpha('', 6);
  
  // Layout do Arquivo (posição: 15-17)
  header += formatNumeric(LAYOUT_VERSIONS.ARQUIVO, 3);
  
  // Tipo de Inscrição da Empresa (posição: 18-18)
  header += formatNumeric(empresa.tipo_inscricao, 1);
  
  // Número de Inscrição da Empresa (posição: 19-32)
  header += formatNumeric(empresa.inscricao_numero, 14);
  
  // Brancos (posição: 33-52)
  header += formatAlpha('', 20);
  
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
  
  // Nome do Banco (posição: 103-132)
  header += formatAlpha('BANCO ITAU SA', 30);
  
  // Brancos (posição: 133-142)
  header += formatAlpha('', 10);
  
  // Código Remessa/Retorno (posição: 143-143) - '1' para Remessa
  header += formatNumeric(1, 1);
  
  // Data de Geração (posição: 144-151)
  header += formatDate(dataGeracao);
  
  // Hora de Geração (posição: 152-157)
  header += formatNumeric(horaGeracao, 6);
  
  // Zeros (posição: 158-166)
  header += formatNumeric(0, 9);
  
  // Densidade de Gravação (posição: 167-171)
  header += formatNumeric(0, 5);
  
  // Brancos (posição: 172-240)
  header += formatAlpha('', 69);
  
  return header;
}

/**
 * Gera o registro Trailer de Arquivo (Registro 9)
 * @param {Object} params - Parâmetros para geração do trailer
 * @param {number} params.quantidade_lotes - Quantidade de lotes no arquivo
 * @param {number} params.quantidade_registros - Quantidade total de registros no arquivo (incluindo header e trailer)
 * @returns {string} - Linha formatada do Trailer de Arquivo
 */
function gerarTrailerArquivo(params) {
  const { quantidade_lotes, quantidade_registros } = params;
  
  // Validações básicas
  if (quantidade_lotes === undefined || quantidade_registros === undefined) {
    throw new Error('Quantidade de lotes e registros são obrigatórios para gerar o Trailer de Arquivo');
  }
  
  // Montagem do registro Trailer de Arquivo
  let trailer = '';
  
  // Código do Banco (posição: 1-3)
  trailer += formatNumeric(BANK_CODES.ITAU, 3);
  
  // Código do Lote (posição: 4-7) - Para Trailer de Arquivo, sempre '9999'
  trailer += formatNumeric(9999, 4);
  
  // Tipo de Registro (posição: 8-8) - Para Trailer de Arquivo, sempre '9'
  trailer += RECORD_TYPES.TRAILER_ARQUIVO;
  
  // Brancos (posição: 9-17)
  trailer += formatAlpha('', 9);
  
  // Quantidade de Lotes (posição: 18-23)
  trailer += formatNumeric(quantidade_lotes, 6);
  
  // Quantidade de Registros (posição: 24-29)
  trailer += formatNumeric(quantidade_registros, 6);
  
  // Zeros (posição: 30-35)
  trailer += formatNumeric(0, 6);
  
  // Brancos (posição: 36-240)
  trailer += formatAlpha('', 205);
  
  return trailer;
}

module.exports = {
  gerarHeaderArquivo,
  gerarTrailerArquivo
};
