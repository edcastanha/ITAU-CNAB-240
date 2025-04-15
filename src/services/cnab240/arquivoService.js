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
 * Gera o header do arquivo CNAB240 para o banco Santander
 * @param {Object} empresa - Dados da empresa
 * @param {string} empresa.nome - Nome da empresa
 * @param {string} empresa.tipo_inscricao - Tipo de inscrição (1=CPF, 2=CNPJ)
 * @param {string} empresa.numero_inscricao - Número de inscrição (CPF/CNPJ)
 * @param {string} empresa.codigo_convenio - Código do convênio no banco
 * @param {string} empresa.agencia - Número da agência
 * @param {string} empresa.conta - Número da conta
 * @param {string} empresa.dac - Dígito verificador da conta
 * @returns {string} - Linha do header do arquivo
 */
function gerarHeaderArquivo(empresa) {
  try {
    // Validações básicas
    if (!empresa.nome || !empresa.tipo_inscricao || !empresa.numero_inscricao || 
        !empresa.codigo_convenio || !empresa.agencia || !empresa.conta || !empresa.dac) {
      throw new Error('Dados da empresa incompletos para gerar o header do arquivo');
    }

    const dataGeracao = new Date();
    const horaGeracao = new Date();
    const nomeEmpresa = empresa.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

    return [
      '033', // 1-3 - Código do Banco (Santander = 033)
      '0000', // 4-7 - Lote de Serviço
      '0', // 8-8 - Tipo de Registro
      ' '.repeat(9), // 9-17 - Uso Exclusivo FEBRABAN/CNAB
      String(empresa.tipo_inscricao).padStart(1, '0'), // 18-18 - Tipo de Inscrição
      String(empresa.numero_inscricao).padStart(14, '0'), // 19-32 - Número de Inscrição
      String(empresa.codigo_convenio).padStart(20, ' '), // 33-52 - Código do Convênio no Banco
      String(empresa.agencia).padStart(5, '0'), // 53-57 - Agência Mantenedora da Conta
      ' ', // 58-58 - Dígito Verificador da Agência
      String(empresa.conta).padStart(12, '0'), // 59-70 - Número da Conta
      ' ', // 71-71 - Dígito Verificador da Conta
      String(empresa.dac).padStart(1, '0'), // 72-72 - Dígito Verificador da Ag/Conta
      nomeEmpresa.padEnd(30, ' '), // 73-102 - Nome da Empresa
      'BANCO SANTANDER'.padEnd(30, ' '), // 103-132 - Nome do Banco
      ' '.repeat(10), // 133-142 - Uso Exclusivo FEBRABAN/CNAB
      '1', // 143-143 - Código Remessa/Retorno (1=Remessa)
      dataGeracao.toISOString().slice(0, 10).replace(/-/g, ''), // 144-151 - Data de Geração
      String(horaGeracao.getHours()).padStart(2, '0') + 
      String(horaGeracao.getMinutes()).padStart(2, '0') + 
      String(horaGeracao.getSeconds()).padStart(2, '0'), // 152-157 - Hora de Geração
      '000001', // 158-163 - Número Sequencial do Arquivo
      '040', // 164-166 - Versão do Layout do Arquivo
      '01600', // 167-171 - Densidade de Gravação
      ' '.repeat(20), // 172-191 - Uso Reservado do Banco
      'CSP'.padEnd(20, ' '), // 192-211 - Uso Reservado da Empresa
      ' '.repeat(29), // 212-240 - Uso Exclusivo FEBRABAN/CNAB
    ].join('');

  } catch (error) {
    throw new Error(`Erro ao gerar header do arquivo: ${error.message}`);
  }
}

/**
 * Gera o registro Trailer de Arquivo (Registro 9) para o banco Santander
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
  
  return [
    '033', // 1-3 - Código do Banco (Santander = 033)
    '9999', // 4-7 - Lote de Serviço
    '9', // 8-8 - Tipo de Registro
    ' '.repeat(9), // 9-17 - Uso Exclusivo FEBRABAN/CNAB
    String(quantidade_lotes).padStart(6, '0'), // 18-23 - Quantidade de lotes do arquivo
    String(quantidade_registros).padStart(6, '0'), // 24-29 - Quantidade de registros do arquivo
    ' '.repeat(211), // 30-240 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');
}

module.exports = {
  gerarHeaderArquivo,
  gerarTrailerArquivo
};
