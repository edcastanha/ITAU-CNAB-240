/**
 * Constantes e enumerações para o CNAB 240
 * Baseado no Manual Técnico SISPAG CNAB 240 (versão 086)
 */

// Códigos de banco
const BANK_CODES = {
  ITAU: '341'
};

// Tipos de registro
const RECORD_TYPES = {
  HEADER_ARQUIVO: '0',
  HEADER_LOTE: '1',
  DETALHE: '3',
  TRAILER_LOTE: '5',
  TRAILER_ARQUIVO: '9'
};

// Tipos de operação
const OPERATION_TYPES = {
  CREDITO: 'C'
};

// Tipos de serviço/pagamento
const SERVICE_TYPES = {
  FORNECEDORES: '20',
  SALARIOS: '30',
  TRIBUTOS: '22',
  DIVERSOS: '98'
};

// Formas de pagamento
const PAYMENT_FORMS = {
  CREDITO_CC: '01',
  CHEQUE_PAGAMENTO: '02',
  DOC: '03',
  TED: '41',
  PIX_TRANSFERENCIA: '45',
  PIX_QR_CODE: '47',
  BOLETO_ITAU: '30',
  BOLETO_OUTROS: '31',
  TRIBUTO_CODIGO_BARRAS: '13',
  TRIBUTO_DARF: '16',
  TRIBUTO_GPS: '17',
  TRIBUTO_GARE_SP: '18',
  TRIBUTO_IPVA: '19',
  TRIBUTO_DPVAT: '20',
  TRIBUTO_FGTS: '35'
};

// Tipos de inscrição
const INSCRIPTION_TYPES = {
  CPF: '1',
  CNPJ: '2'
};

// Códigos de finalidade DOC/TED
const PURPOSE_CODES = {
  CREDITO_EM_CONTA: '01',
  PAGAMENTO_FORNECEDORES: '02',
  PAGAMENTO_SALARIOS: '03',
  PAGAMENTO_ALUGUEL: '04',
  PAGAMENTO_DUPLICATAS: '05',
  OUTROS: '99'
};

// Códigos de aviso ao favorecido
const NOTIFICATION_CODES = {
  NAO_EMITE: '0',
  EMITE: '2',
  EMAIL: '5',
  SMS: '6'
};

// Layout de arquivo e lote
const LAYOUT_VERSIONS = {
  ARQUIVO: '080',
  LOTE: '040'
};

// Códigos de retorno/erro
const RETURN_CODES = {
  SUCESSO: '00',
  ERRO_VALIDACAO: '01',
  REGISTRO_DUPLICADO: '02',
  REGISTRO_INEXISTENTE: '03',
  VALOR_INVALIDO: '04',
  DATA_INVALIDA: '05',
  CONTA_INVALIDA: '06',
  SALDO_INSUFICIENTE: '07',
  LIMITE_EXCEDIDO: '08',
  ERRO_PROCESSAMENTO: '99'
};

module.exports = {
  BANK_CODES,
  RECORD_TYPES,
  OPERATION_TYPES,
  SERVICE_TYPES,
  PAYMENT_FORMS,
  INSCRIPTION_TYPES,
  PURPOSE_CODES,
  NOTIFICATION_CODES,
  LAYOUT_VERSIONS,
  RETURN_CODES
};
