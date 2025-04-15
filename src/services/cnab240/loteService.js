/**
 * Serviço para geração de headers e trailers de lotes CNAB240
 */

const { formatarNumero, formatarTexto, formatarDocumento, formatarValor } = require('../../utils/formatters');

/**
 * Gera o header do lote CNAB240
 * @param {Object} empresa - Dados da empresa
 * @param {number} numero_lote - Número do lote
 * @param {string} tipoPagamento - Tipo de pagamento ('salarios', 'fornecedores', etc.)
 * @returns {string} - Header do lote formatado
 */
function gerarHeaderLote(empresa, numero_lote, tipoPagamento) {
  if (!empresa) {
    throw new Error('Dados da empresa são obrigatórios para gerar o header do lote');
  }

  if (!numero_lote) {
    throw new Error('Número do lote é obrigatório para gerar o header do lote');
  }

  // Define os tipos de serviço e finalidade com base no tipo de pagamento
  let tipoServico = '30'; // Padrão para pagamento de salários
  let formaPagamento = '01'; // Padrão para crédito em conta
  let finalidadeLote = '01'; // Padrão para folha de pagamento

  switch (tipoPagamento) {
    case 'salarios':
      tipoServico = '30';
      finalidadeLote = '01';
      break;
    case 'fornecedores':
      tipoServico = '20';
      finalidadeLote = '20';
      break;
    case 'boletos':
      tipoServico = '98';
      finalidadeLote = '10';
      break;
    case 'tributos':
      tipoServico = '11';
      finalidadeLote = '35';
      break;
    case 'pix':
      tipoServico = '40';
      finalidadeLote = '100';
      break;
  }

  // Formata o número de inscrição (CPF/CNPJ)
  const inscricaoNumero = formatarDocumento(empresa.inscricao_numero);
  
  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);

  // Constrói o header do lote
  const header = [
    '033',                                      // 01.1 - Código do Banco na Compensação (Santander = 033)
    lote,                                       // 02.1 - Lote de Serviço
    '1',                                        // 03.1 - Tipo de Registro (1 = Header de Lote)
    'C',                                        // 04.1 - Tipo de Operação (C = Crédito)
    tipoServico,                                // 05.1 - Tipo de Serviço
    formaPagamento,                             // 06.1 - Forma de Lançamento
    '045',                                      // 07.1 - Nº da Versão do Layout do Lote
    ' ',                                        // 08.1 - Uso Exclusivo FEBRABAN/CNAB
    empresa.tipo_inscricao || '2',              // 09.1 - Tipo de Inscrição da Empresa (1=CPF, 2=CNPJ)
    inscricaoNumero,                            // 10.1 - Número de Inscrição da Empresa (CPF/CNPJ)
    formatarTexto(empresa.convenio || '', 20),  // 11.1 - Código do Convênio no Banco
    formatarNumero(empresa.agencia || '', 5),   // 12.1 - Agência Mantenedora da Conta
    formatarTexto(empresa.agencia_dv || '', 1), // 13.1 - Dígito Verificador da Agência
    formatarNumero(empresa.conta || '', 12),    // 14.1 - Número da Conta Corrente
    formatarTexto(empresa.dac || '', 1),        // 15.1 - Dígito Verificador da Conta
    ' ',                                        // 16.1 - Dígito Verificador da Ag/Conta
    formatarTexto(empresa.nome || '', 30),      // 17.1 - Nome da Empresa
    formatarTexto('', 40),                      // 18.1 - Mensagem
    formatarTexto(empresa.logradouro || '', 30),// 19.1 - Logradouro do Endereço da Empresa
    formatarNumero(empresa.numero || '', 5),    // 20.1 - Número do Endereço da Empresa
    formatarTexto(empresa.complemento || '', 15),// 21.1 - Complemento do Endereço
    formatarTexto(empresa.cidade || '', 20),    // 22.1 - Cidade
    formatarNumero(empresa.cep || '', 8),       // 23.1 - CEP
    formatarTexto(empresa.uf || '', 2),         // 24.1 - UF
    formatarTexto(finalidadeLote, 2),           // 25.1 - Finalidade do Lote
    ' '.repeat(16)                              // 26.1 - Uso Exclusivo FEBRABAN/CNAB (ajustado para 16 caracteres)
  ].join('');

  // Valida o tamanho do header (deve ter 240 posições)
  if (header.length !== 240) {
    throw new Error(`Tamanho inválido do header do lote: ${header.length} caracteres (esperado: 240)`);
  }

  return header;
}

/**
 * Gera o trailer do lote CNAB240
 * @param {number} numero_lote - Número do lote
 * @param {number} numero_registro - Número de registros no lote
 * @param {number} somatoria_valores - Somatória dos valores do lote
 * @returns {string} - Trailer do lote formatado
 */
function gerarTrailerLote(numero_lote, numero_registro, somatoria_valores = 0) {
  if (!numero_lote) {
    throw new Error('Número do lote é obrigatório para gerar o trailer do lote');
  }

  // Formata o número do lote
  const lote = formatarNumero(numero_lote, 4);

  // Formata a quantidade de registros no lote (incluindo header e trailer de lote)
  const qtdRegistros = formatarNumero(numero_registro + 2, 6);

  // Formata a somatória dos valores
  const somatoriaValores = formatarValor(somatoria_valores, 18, 2);

  // Constrói o trailer do lote
  const trailer = [
    '033',                                    // 01.5 - Código do Banco na Compensação
    lote,                                     // 02.5 - Lote de Serviço
    '5',                                      // 03.5 - Tipo de Registro (5 = Trailer de Lote)
    ' '.repeat(9),                            // 04.5 - Uso Exclusivo FEBRABAN/CNAB
    qtdRegistros,                             // 05.5 - Quantidade de Registros no Lote
    somatoriaValores,                         // 06.5 - Somatória dos Valores
    '000000000000000000',                     // 07.5 - Somatória de Quantidade de Moedas
    '000000000000',                           // 08.5 - Número Aviso de Débito
    ' '.repeat(165)                           // 09.5 - Uso Exclusivo FEBRABAN/CNAB
  ].join('');

  // Valida o tamanho do trailer (deve ter 240 posições)
  if (trailer.length !== 240) {
    throw new Error(`Tamanho inválido do trailer do lote: ${trailer.length} caracteres (esperado: 240)`);
  }

  return trailer;
}

module.exports = {
  gerarHeaderLote,
  gerarTrailerLote
};
