/**
 * Serviço para geração de headers e trailers de arquivo CNAB240
 */

const { formatarNumero, formatarTexto, formatarDocumento, formatarData } = require('../../utils/formatters');

/**
 * Gera o header do arquivo CNAB240
 * @param {Object} params - Parâmetros para geração do header
 * @param {Object} params.empresa - Dados da empresa
 * @param {string} params.codigo_banco - Código do banco (ex: '033' para Santander)
 * @param {string} params.nome_banco - Nome do banco
 * @param {number} params.numero_arquivo - Número sequencial do arquivo
 * @param {string} params.versao_layout - Versão do layout do arquivo
 * @returns {string} - Header do arquivo formatado
 */
function gerarHeaderArquivo(params) {
  if (!params || !params.empresa) {
    throw new Error('Dados da empresa são obrigatórios para gerar o header do arquivo');
  }
  
  const { 
    empresa, 
    codigo_banco, 
    nome_banco, 
    numero_arquivo = 1, 
    versao_layout = '089',
    data_geracao,
    tipo_remessa = '1' // 1 = Remessa
  } = params;
  
  // Verifica se os campos obrigatórios da empresa estão presentes
  if (!empresa.nome || !empresa.inscricao_numero) {
    throw new Error('Dados da empresa incompletos. Nome e número de inscrição são obrigatórios.');
  }

  if (!codigo_banco) {
    throw new Error('Código do banco é obrigatório');
  }
  
  const dataObj = data_geracao ? new Date(data_geracao) : new Date();
  const dataFormatada = formatarData(dataObj);
  const horaFormatada = formatarNumero(dataObj.getHours(), 2) + formatarNumero(dataObj.getMinutes(), 2) + formatarNumero(dataObj.getSeconds(), 2);
  
  // Formata o número de inscrição (CPF/CNPJ)
  const inscricaoNumero = formatarDocumento(empresa.inscricao_numero);
  
  // Constrói o header do arquivo
  const header = [
    formatarNumero(codigo_banco, 3),              // 01.0 - Código do Banco na Compensação
    '0000',                                       // 02.0 - Lote de Serviço
    '0',                                          // 03.0 - Tipo de Registro (0 = Header de Arquivo)
    formatarTexto('', 9),                         // 04.0 - Uso Exclusivo FEBRABAN/CNAB
    empresa.tipo_inscricao || '2',                // 05.0 - Tipo de Inscrição da Empresa (1=CPF, 2=CNPJ)
    inscricaoNumero,                              // 06.0 - Número de Inscrição da Empresa (CPF/CNPJ)
    formatarTexto(empresa.convenio || '', 20),    // 07.0 - Código do Convênio no Banco
    formatarNumero(empresa.agencia || '', 5),     // 08.0 - Agência Mantenedora da Conta
    formatarTexto(empresa.agencia_dv || '', 1),   // 09.0 - Dígito Verificador da Agência
    formatarNumero(empresa.conta || '', 12),      // 10.0 - Número da Conta Corrente
    formatarTexto(empresa.dac || '', 1),          // 11.0 - Dígito Verificador da Conta
    ' ',                                          // 12.0 - Dígito Verificador da Ag/Conta
    formatarTexto(empresa.nome || '', 30),        // 13.0 - Nome da Empresa
    formatarTexto(nome_banco || '', 30),          // 14.0 - Nome do Banco
    formatarTexto('', 10),                        // 15.0 - Uso Exclusivo FEBRABAN/CNAB
    tipo_remessa,                                 // 16.0 - Código Remessa/Retorno (1 = Remessa)
    dataFormatada,                                // 17.0 - Data de Geração do Arquivo
    horaFormatada,                                // 18.0 - Hora de Geração do Arquivo
    formatarNumero(numero_arquivo, 6),            // 19.0 - Número Sequencial do Arquivo
    formatarNumero(versao_layout, 3),             // 20.0 - Versão do Layout
    '00000',                                      // 21.0 - Densidade de Gravação
    formatarTexto('', 20),                        // 22.0 - Uso Reservado ao Banco
    formatarTexto('', 20),                        // 23.0 - Uso Reservado à Empresa
    formatarTexto('', 29)                         // 24.0 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do header (deve ter 240 posições)
  if (header.length !== 240) {
    throw new Error(`Tamanho inválido do header do arquivo: ${header.length} caracteres (esperado: 240)`);
  }

  return header;
}

/**
 * Gera o trailer do arquivo CNAB240
 * @param {Object} params - Parâmetros para geração do trailer
 * @param {string} params.codigo_banco - Código do banco (ex: '033' para Santander)
 * @param {number} params.qtd_lotes - Quantidade de lotes no arquivo
 * @param {number} params.qtd_registros - Quantidade total de registros no arquivo
 * @param {number} params.qtd_contas - Quantidade de contas para conciliação (opcional)
 * @returns {string} - Trailer do arquivo formatado
 */
function gerarTrailerArquivo(params) {
  // Verificar se os parâmetros são inválidos
  if (!params || !params.codigo_banco || 
      params.qtd_lotes === null || params.qtd_lotes === undefined || 
      params.qtd_registros === null || params.qtd_registros === undefined) {
    throw new Error('Parâmetros inválidos para gerar o trailer do arquivo');
  }
  
  const { 
    codigo_banco, 
    qtd_lotes, 
    qtd_registros, 
    qtd_contas = 0 
  } = params;
  
  // Constrói o trailer do arquivo
  const trailer = [
    formatarNumero(codigo_banco, 3),      // 01.9 - Código do Banco na Compensação
    '9999',                               // 02.9 - Lote de Serviço
    '9',                                  // 03.9 - Tipo de Registro (9 = Trailer de Arquivo)
    formatarTexto('', 9),                 // 04.9 - Uso Exclusivo FEBRABAN/CNAB
    formatarNumero(qtd_lotes, 6),         // 05.9 - Quantidade de Lotes do Arquivo
    formatarNumero(qtd_registros, 6),     // 06.9 - Quantidade de Registros do Arquivo
    formatarNumero(qtd_contas, 6),        // 07.9 - Quantidade de Contas para Conciliação
    formatarTexto('', 205)                // 08.9 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do trailer (deve ter 240 posições)
  if (trailer.length !== 240) {
    throw new Error(`Tamanho inválido do trailer do arquivo: ${trailer.length} caracteres (esperado: 240)`);
  }

  return trailer;
}

module.exports = {
  gerarHeaderArquivo,
  gerarTrailerArquivo
}; 