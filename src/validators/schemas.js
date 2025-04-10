/**
 * Esquemas de validação para as requisições da API CNAB 240
 */

const Joi = require('joi');

// Esquema para validação dos dados da empresa
const empresaSchema = Joi.object({
  tipo_inscricao: Joi.number().valid(1, 2).required()
    .messages({
      'any.required': 'Tipo de inscrição é obrigatório',
      'number.base': 'Tipo de inscrição deve ser um número',
      'any.only': 'Tipo de inscrição deve ser 1 (CPF) ou 2 (CNPJ)'
    }),
  inscricao_numero: Joi.string().required()
    .when('tipo_inscricao', {
      is: 1,
      then: Joi.string().length(11).pattern(/^\d+$/)
        .messages({
          'string.length': 'CPF deve ter 11 dígitos',
          'string.pattern.base': 'CPF deve conter apenas números'
        }),
      otherwise: Joi.string().length(14).pattern(/^\d+$/)
        .messages({
          'string.length': 'CNPJ deve ter 14 dígitos',
          'string.pattern.base': 'CNPJ deve conter apenas números'
        })
    }),
  nome: Joi.string().max(30).required()
    .messages({
      'any.required': 'Nome da empresa é obrigatório',
      'string.max': 'Nome da empresa deve ter no máximo 30 caracteres'
    }),
  agencia: Joi.string().pattern(/^\d+$/).max(5).required()
    .messages({
      'any.required': 'Agência é obrigatória',
      'string.pattern.base': 'Agência deve conter apenas números',
      'string.max': 'Agência deve ter no máximo 5 dígitos'
    }),
  conta: Joi.string().pattern(/^\d+$/).max(12).required()
    .messages({
      'any.required': 'Conta é obrigatória',
      'string.pattern.base': 'Conta deve conter apenas números',
      'string.max': 'Conta deve ter no máximo 12 dígitos'
    }),
  dac: Joi.string().pattern(/^\d+$/).max(1).required()
    .messages({
      'any.required': 'DAC é obrigatório',
      'string.pattern.base': 'DAC deve conter apenas números',
      'string.max': 'DAC deve ter no máximo 1 dígito'
    })
});

// Esquema para validação dos dados do favorecido
const favorecidoSchema = Joi.object({
  tipo_inscricao: Joi.number().valid(1, 2).required()
    .messages({
      'any.required': 'Tipo de inscrição do favorecido é obrigatório',
      'number.base': 'Tipo de inscrição do favorecido deve ser um número',
      'any.only': 'Tipo de inscrição do favorecido deve ser 1 (CPF) ou 2 (CNPJ)'
    }),
  inscricao_numero: Joi.string().required()
    .when('tipo_inscricao', {
      is: 1,
      then: Joi.string().length(11).pattern(/^\d+$/)
        .messages({
          'string.length': 'CPF do favorecido deve ter 11 dígitos',
          'string.pattern.base': 'CPF do favorecido deve conter apenas números'
        }),
      otherwise: Joi.string().length(14).pattern(/^\d+$/)
        .messages({
          'string.length': 'CNPJ do favorecido deve ter 14 dígitos',
          'string.pattern.base': 'CNPJ do favorecido deve conter apenas números'
        })
    }),
  nome: Joi.string().max(30).required()
    .messages({
      'any.required': 'Nome do favorecido é obrigatório',
      'string.max': 'Nome do favorecido deve ter no máximo 30 caracteres'
    }),
  banco: Joi.string().pattern(/^\d+$/).max(3).required()
    .messages({
      'any.required': 'Código do banco do favorecido é obrigatório',
      'string.pattern.base': 'Código do banco deve conter apenas números',
      'string.max': 'Código do banco deve ter no máximo 3 dígitos'
    }),
  agencia: Joi.string().pattern(/^\d+$/).max(5).required()
    .messages({
      'any.required': 'Agência do favorecido é obrigatória',
      'string.pattern.base': 'Agência do favorecido deve conter apenas números',
      'string.max': 'Agência do favorecido deve ter no máximo 5 dígitos'
    }),
  conta: Joi.string().pattern(/^\d+$/).max(12).required()
    .messages({
      'any.required': 'Conta do favorecido é obrigatória',
      'string.pattern.base': 'Conta do favorecido deve conter apenas números',
      'string.max': 'Conta do favorecido deve ter no máximo 12 dígitos'
    }),
  dac: Joi.string().pattern(/^\d+$/).max(1)
    .messages({
      'string.pattern.base': 'DAC do favorecido deve conter apenas números',
      'string.max': 'DAC do favorecido deve ter no máximo 1 dígito'
    }),
  endereco: Joi.string().max(30),
  numero: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+$/)).max(5),
  complemento: Joi.string().max(15),
  bairro: Joi.string().max(15),
  cidade: Joi.string().max(20),
  cep: Joi.string().pattern(/^\d+$/).length(8),
  estado: Joi.string().length(2),
  email: Joi.string().email()
});

// Esquema para validação dos dados de pagamento
const pagamentoSchema = Joi.object({
  data: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ).required()
    .messages({
      'any.required': 'Data de pagamento é obrigatória',
      'date.base': 'Data de pagamento deve ser uma data válida',
      'string.pattern.base': 'Data de pagamento deve estar no formato YYYY-MM-DD'
    }),
  valor: Joi.number().positive().required()
    .messages({
      'any.required': 'Valor do pagamento é obrigatório',
      'number.base': 'Valor do pagamento deve ser um número',
      'number.positive': 'Valor do pagamento deve ser positivo'
    }),
  moeda: Joi.string().default('BRL'),
  nosso_numero: Joi.string().max(20),
  seu_numero: Joi.string().max(20),
  documento: Joi.string().max(40)
});

// Esquema para validação dos dados de informações adicionais
const informacoesSchema = Joi.object({
  finalidade_doc: Joi.string().max(2),
  finalidade_ted: Joi.string().max(5),
  codigo_instrucao: Joi.string().max(2),
  emissao_aviso: Joi.string().max(1)
});

// Esquema para validação dos dados de PIX
const pixSchema = Joi.object({
  tipo_chave: Joi.number().valid(1, 2, 3, 4).required()
    .messages({
      'any.required': 'Tipo de chave PIX é obrigatório',
      'number.base': 'Tipo de chave PIX deve ser um número',
      'any.only': 'Tipo de chave PIX deve ser 1 (Telefone), 2 (Email), 3 (CPF/CNPJ) ou 4 (Chave aleatória)'
    }),
  chave: Joi.string().required()
    .messages({
      'any.required': 'Chave PIX é obrigatória'
    }),
  tx_id: Joi.string().max(32),
  info_adicional: Joi.string().max(50)
});

// Esquema para validação dos dados de boleto
const boletoSchema = Joi.object({
  codigo_barras: Joi.string().length(44).required()
    .messages({
      'any.required': 'Código de barras do boleto é obrigatório',
      'string.length': 'Código de barras do boleto deve ter 44 posições'
    }),
  nome_beneficiario: Joi.string().max(30),
  data_vencimento: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ),
  data_pagamento: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ).required()
    .messages({
      'any.required': 'Data de pagamento do boleto é obrigatória',
      'date.base': 'Data de pagamento do boleto deve ser uma data válida',
      'string.pattern.base': 'Data de pagamento do boleto deve estar no formato YYYY-MM-DD'
    }),
  valor: Joi.number().positive().required()
    .messages({
      'any.required': 'Valor do boleto é obrigatório',
      'number.base': 'Valor do boleto deve ser um número',
      'number.positive': 'Valor do boleto deve ser positivo'
    }),
  valor_desconto: Joi.number().min(0),
  valor_acrescimo: Joi.number().min(0),
  seu_numero: Joi.string().max(20)
});

// Esquema para validação dos dados de tributo
const tributoSchema = Joi.object({
  codigo_barras: Joi.string().length(44)
    .messages({
      'string.length': 'Código de barras do tributo deve ter 44 posições'
    }),
  nome_contribuinte: Joi.string().max(30),
  tipo: Joi.string().max(2),
  codigo_receita: Joi.string().max(4),
  tipo_inscricao: Joi.number().valid(1, 2),
  inscricao_numero: Joi.string(),
  periodo_apuracao: Joi.string().max(6),
  referencia: Joi.string().max(17),
  valor_principal: Joi.number().positive(),
  valor_multa: Joi.number().min(0),
  valor_juros: Joi.number().min(0),
  data_vencimento: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ),
  data_pagamento: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ).required()
    .messages({
      'any.required': 'Data de pagamento do tributo é obrigatória',
      'date.base': 'Data de pagamento do tributo deve ser uma data válida',
      'string.pattern.base': 'Data de pagamento do tributo deve estar no formato YYYY-MM-DD'
    }),
  valor: Joi.number().positive()
    .messages({
      'number.base': 'Valor do tributo deve ser um número',
      'number.positive': 'Valor do tributo deve ser positivo'
    })
})
.when(Joi.object({ codigo_barras: Joi.exist() }).unknown(), {
  then: Joi.object({
    valor: Joi.number().positive().required()
      .messages({
        'any.required': 'Valor do tributo é obrigatório',
        'number.base': 'Valor do tributo deve ser um número',
        'number.positive': 'Valor do tributo deve ser positivo'
      })
  }),
  otherwise: Joi.object({
    tipo: Joi.string().max(2).required()
      .messages({
        'any.required': 'Tipo de tributo é obrigatório'
      }),
    tipo_inscricao: Joi.number().valid(1, 2).required()
      .messages({
        'any.required': 'Tipo de inscrição do contribuinte é obrigatório',
        'number.base': 'Tipo de inscrição do contribuinte deve ser um número',
        'any.only': 'Tipo de inscrição do contribuinte deve ser 1 (CPF) ou 2 (CNPJ)'
      }),
    inscricao_numero: Joi.string().required()
      .messages({
        'any.required': 'Número de inscrição do contribuinte é obrigatório'
      }),
    valor_principal: Joi.number().positive().required()
      .messages({
        'any.required': 'Valor principal do tributo é obrigatório',
        'number.base': 'Valor principal do tributo deve ser um número',
        'number.positive': 'Valor principal do tributo deve ser positivo'
      })
  })
});

// Esquema para validação dos dados de complemento de salário
const complementoSalarioSchema = Joi.object({
  valor_ir: Joi.number().min(0),
  valor_iss: Joi.number().min(0),
  valor_inss: Joi.number().min(0),
  valor_fgts: Joi.number().min(0),
  valor_desconto: Joi.number().min(0),
  valor_abono: Joi.number().min(0),
  valor_liquido: Joi.number().min(0)
});

// Esquema para validação dos dados de histórico de crédito
const historicoSchema = Joi.object({
  codigo: Joi.number().min(0).max(99),
  mensagem: Joi.string().max(200)
});

// Esquema para validação dos dados de pagamento de fornecedor
const pagamentoFornecedorSchema = Joi.object({
  favorecido: favorecidoSchema.required()
    .messages({
      'any.required': 'Dados do favorecido são obrigatórios'
    }),
  dados: pagamentoSchema.required()
    .messages({
      'any.required': 'Dados do pagamento são obrigatórios'
    }),
  informacoes: informacoesSchema,
  pix: pixSchema
});

// Esquema para validação dos dados de pagamento de boleto
const pagamentoBoletoSchema = Joi.object({
  boleto: boletoSchema.required()
    .messages({
      'any.required': 'Dados do boleto são obrigatórios'
    }),
  pagador: Joi.object({
    tipo_inscricao: Joi.number().valid(1, 2).required(),
    inscricao_numero: Joi.string().required(),
    nome: Joi.string().max(40).required()
  }),
  beneficiario: Joi.object({
    tipo_inscricao: Joi.number().valid(1, 2).required(),
    inscricao_numero: Joi.string().required(),
    nome: Joi.string().max(40).required()
  }),
  sacador: Joi.object({
    tipo_inscricao: Joi.number().valid(1, 2),
    inscricao_numero: Joi.string(),
    nome: Joi.string().max(40)
  })
});

// Esquema para validação dos dados de pagamento PIX
const pagamentoPIXSchema = Joi.object({
  boleto: boletoSchema.required()
    .messages({
      'any.required': 'Dados do boleto são obrigatórios'
    }),
  pix: pixSchema.required()
    .messages({
      'any.required': 'Dados do PIX são obrigatórios'
    })
});

// Esquema para validação dos dados de pagamento de tributo
const pagamentoTributoSchema = Joi.object({
  tributo: tributoSchema.required()
    .messages({
      'any.required': 'Dados do tributo são obrigatórios'
    }),
  gare: Joi.object({
    inscricao_estadual: Joi.string().max(12),
    inscricao_divida: Joi.string().max(13),
    periodo_referencia: Joi.string().max(6),
    numero_parcela: Joi.number().min(0),
    valor_receita: Joi.number().min(0),
    valor_juros: Joi.number().min(0),
    valor_multa: Joi.number().min(0),
    valor_encargos: Joi.number().min(0)
  })
});

// Esquema para validação dos dados de pagamento de salário
const pagamentoSalarioSchema = Joi.object({
  favorecido: favorecidoSchema.required()
    .messages({
      'any.required': 'Dados do favorecido são obrigatórios'
    }),
  dados: pagamentoSchema.required()
    .messages({
      'any.required': 'Dados do pagamento são obrigatórios'
    }),
  informacoes: informacoesSchema,
  complemento: complementoSalarioSchema,
  historico: historicoSchema,
  pix: pixSchema
});

// Esquema para validação da requisição de pagamento de fornecedores
const fornecedoresRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  forma_pagamento: Joi.string().max(2),
  pagamentos: Joi.array().items(pagamentoFornecedorSchema).min(1).required()
    .messages({
      'any.required': 'Array de pagamentos é obrigatório',
      'array.min': 'Array de pagamentos deve conter pelo menos um item'
    })
});

// Esquema para validação da requisição de pagamento de boletos
const boletosRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  pagamentos: Joi.array().items(pagamentoBoletoSchema).min(1).required()
    .messages({
      'any.required': 'Array de pagamentos é obrigatório',
      'array.min': 'Array de pagamentos deve conter pelo menos um item'
    })
});

// Esquema para validação da requisição de pagamento PIX
const pixRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  tipo_pix: Joi.string().valid('transferencia', 'qrcode').required()
    .messages({
      'any.required': 'Tipo de PIX é obrigatório',
      'any.only': 'Tipo de PIX deve ser "transferencia" ou "qrcode"'
    }),
  pagamentos: Joi.array().items(
    Joi.when('tipo_pix', {
      is: 'transferencia',
      then: pagamentoFornecedorSchema,
      otherwise: pagamentoPIXSchema
    })
  ).min(1).required()
    .messages({
      'any.required': 'Array de pagamentos é obrigatório',
      'array.min': 'Array de pagamentos deve conter pelo menos um item'
    })
});

// Esquema para validação da requisição de pagamento de tributos
const tributosRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  forma_pagamento: Joi.string().max(2),
  pagamentos: Joi.array().items(pagamentoTributoSchema).min(1).required()
    .messages({
      'any.required': 'Array de pagamentos é obrigatório',
      'array.min': 'Array de pagamentos deve conter pelo menos um item'
    })
});

// Esquema para validação da requisição de pagamento de salários
const salariosRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  pagamentos: Joi.array().items(pagamentoSalarioSchema).min(1).required()
    .messages({
      'any.required': 'Array de pagamentos é obrigatório',
      'array.min': 'Array de pagamentos deve conter pelo menos um item'
    })
});

// Esquema para validação da requisição personalizada
const personalizadoRequestSchema = Joi.object({
  empresa: empresaSchema.required()
    .messages({
      'any.required': 'Dados da empresa são obrigatórios'
    }),
  lotes: Joi.array().items(
    Joi.object({
      tipo_servico: Joi.string().max(2).required()
        .messages({
   
(Content truncated due to size limit. Use line ranges to read in chunks)