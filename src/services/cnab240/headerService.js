/**
 * Serviço para geração de headers e trailers de arquivo CNAB240
 */

const { formatarNumero, formatarTexto, formatarDocumento, formatarData } = require('../../utils/formatters');

/**
 * Gera o header do arquivo CNAB240
 * @param {Object} empresa - Dados da empresa
 * @param {number} numero_arquivo - Número sequencial do arquivo
 * @returns {string} - Header do arquivo formatado
 */
function gerarHeaderArquivo(empresa, numero_arquivo = 1) {
  if (!empresa) {
    throw new Error('Dados da empresa são obrigatórios para gerar o header do arquivo');
  }

  const dataGeracao = new Date();
  const dataFormatada = formatarData(dataGeracao);
  const horaFormatada = formatarNumero(dataGeracao.getHours(), 2) + formatarNumero(dataGeracao.getMinutes(), 2) + formatarNumero(dataGeracao.getSeconds(), 2);
  
  // Formata o número de inscrição (CPF/CNPJ)
  const inscricaoNumero = formatarDocumento(empresa.inscricao_numero);
  
  // Constrói o header do arquivo
  const header = [
    '033',                                      // 01.0 - Código do Banco na Compensação (Santander = 033)
    '0000',                                     // 02.0 - Lote de Serviço
    '0',                                        // 03.0 - Tipo de Registro (0 = Header de Arquivo)
    formatarTexto('', 9),                       // 04.0 - Uso Exclusivo FEBRABAN/CNAB
    empresa.tipo_inscricao || '2',              // 05.0 - Tipo de Inscrição da Empresa (1=CPF, 2=CNPJ)
    inscricaoNumero,                            // 06.0 - Número de Inscrição da Empresa (CPF/CNPJ)
    formatarTexto(empresa.convenio || '', 20),  // 07.0 - Código do Convênio no Banco
    formatarNumero(empresa.agencia || '', 5),   // 08.0 - Agência Mantenedora da Conta
    formatarTexto(empresa.agencia_dv || '', 1), // 09.0 - Dígito Verificador da Agência
    formatarNumero(empresa.conta || '', 12),    // 10.0 - Número da Conta Corrente
    formatarTexto(empresa.dac || '', 1),        // 11.0 - Dígito Verificador da Conta
    ' ',                                        // 12.0 - Dígito Verificador da Ag/Conta
    formatarTexto(empresa.nome || '', 30),      // 13.0 - Nome da Empresa
    formatarTexto('BANCO SANTANDER', 30),       // 14.0 - Nome do Banco
    formatarTexto('', 10),                      // 15.0 - Uso Exclusivo FEBRABAN/CNAB
    '1',                                        // 16.0 - Código Remessa/Retorno (1 = Remessa)
    dataFormatada,                              // 17.0 - Data de Geração do Arquivo
    horaFormatada,                              // 18.0 - Hora de Geração do Arquivo
    formatarNumero(numero_arquivo, 6),          // 19.0 - Número Sequencial do Arquivo
    '089',                                      // 20.0 - Versão do Layout
    '00000',                                    // 21.0 - Densidade de Gravação
    formatarTexto('', 20),                      // 22.0 - Uso Reservado ao Banco
    formatarTexto('', 20),                      // 23.0 - Uso Reservado à Empresa
    formatarTexto('', 29)                       // 24.0 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do header (deve ter 240 posições)
  if (header.length !== 240) {
    throw new Error(`Tamanho inválido do header do arquivo: ${header.length} caracteres (esperado: 240)`);
  }

  return header;
}

/**
 * Gera o trailer do arquivo CNAB240
 * @param {number} qtd_lotes - Quantidade de lotes no arquivo
 * @param {number} qtd_registros - Quantidade total de registros no arquivo
 * @returns {string} - Trailer do arquivo formatado
 */
function gerarTrailerArquivo(qtd_lotes, qtd_registros) {
  // Valida os parâmetros
  if (!qtd_lotes || !qtd_registros) {
    throw new Error('A quantidade de lotes e de registros é obrigatória para gerar o trailer do arquivo');
  }

  // Constrói o trailer do arquivo
  const trailer = [
    '033',                          // 01.9 - Código do Banco na Compensação (Santander = 033)
    '9999',                         // 02.9 - Lote de Serviço
    '9',                            // 03.9 - Tipo de Registro (9 = Trailer de Arquivo)
    formatarTexto('', 9),           // 04.9 - Uso Exclusivo FEBRABAN/CNAB
    formatarNumero(qtd_lotes, 6),   // 05.9 - Quantidade de Lotes do Arquivo
    formatarNumero(qtd_registros, 6), // 06.9 - Quantidade de Registros do Arquivo
    formatarNumero('', 6),          // 07.9 - Quantidade de Contas para Conciliação
    formatarTexto('', 205)          // 08.9 - Uso Exclusivo FEBRABAN/CNAB
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