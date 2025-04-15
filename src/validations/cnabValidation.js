const { body } = require('express-validator');

// Validações comuns
const validarDadosEmpresa = [
    body('empresa.cnpj')
        .isLength({ min: 14, max: 14 })
        .withMessage('CNPJ deve ter 14 dígitos'),
    body('empresa.nome')
        .notEmpty()
        .withMessage('Nome da empresa é obrigatório'),
    body('empresa.agencia')
        .notEmpty()
        .withMessage('Agência é obrigatória'),
    body('empresa.conta')
        .notEmpty()
        .withMessage('Conta é obrigatória'),
    body('empresa.dac')
        .notEmpty()
        .withMessage('DAC é obrigatório')
];

const validarDadosPagamento = [
    body('pagamento.valor')
        .isFloat({ min: 0.01 })
        .withMessage('Valor do pagamento deve ser maior que zero'),
    body('pagamento.data_pagamento')
        .isISO8601()
        .withMessage('Data de pagamento inválida'),
    body('pagamento.favorecido.nome')
        .notEmpty()
        .withMessage('Nome do favorecido é obrigatório'),
    body('pagamento.favorecido.cpf_cnpj')
        .notEmpty()
        .withMessage('CPF/CNPJ do favorecido é obrigatório')
];

// Validações específicas para cada tipo de pagamento
const validarFornecedor = [
    ...validarDadosEmpresa,
    ...validarDadosPagamento,
    body('pagamento.favorecido.banco')
        .notEmpty()
        .withMessage('Banco do fornecedor é obrigatório'),
    body('pagamento.favorecido.agencia')
        .notEmpty()
        .withMessage('Agência do fornecedor é obrigatória'),
    body('pagamento.favorecido.conta')
        .notEmpty()
        .withMessage('Conta do fornecedor é obrigatória')
];

const validarBoleto = [
    ...validarDadosEmpresa,
    ...validarDadosPagamento,
    body('pagamento.numero_boleto')
        .notEmpty()
        .withMessage('Número do boleto é obrigatório'),
    body('pagamento.data_vencimento')
        .isISO8601()
        .withMessage('Data de vencimento inválida')
];

const validarSalario = [
    ...validarDadosEmpresa,
    ...validarDadosPagamento,
    body('pagamento.funcionario.matricula')
        .notEmpty()
        .withMessage('Matrícula do funcionário é obrigatória'),
    body('pagamento.funcionario.banco')
        .notEmpty()
        .withMessage('Banco do funcionário é obrigatório'),
    body('pagamento.funcionario.agencia')
        .notEmpty()
        .withMessage('Agência do funcionário é obrigatória'),
    body('pagamento.funcionario.conta')
        .notEmpty()
        .withMessage('Conta do funcionário é obrigatória')
];

const validarTributo = [
    ...validarDadosEmpresa,
    ...validarDadosPagamento,
    body('pagamento.codigo_tributo')
        .notEmpty()
        .withMessage('Código do tributo é obrigatório'),
    body('pagamento.periodo')
        .notEmpty()
        .withMessage('Período é obrigatório'),
    body('pagamento.uf')
        .isLength({ min: 2, max: 2 })
        .withMessage('UF deve ter 2 caracteres')
];

const validarPIX = [
    ...validarDadosEmpresa,
    ...validarDadosPagamento,
    body('pagamento.chave_pix')
        .notEmpty()
        .withMessage('Chave PIX é obrigatória'),
    body('pagamento.tipo_pix')
        .isIn(['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'CHAVE_ALEATORIA'])
        .withMessage('Tipo de PIX inválido')
];

// Validações para lotes de pagamentos
const validarLoteFornecedores = [
    ...validarDadosEmpresa,
    body('pagamentos')
        .isArray({ min: 1 })
        .withMessage('Deve haver pelo menos um pagamento'),
    body('pagamentos.*').custom((pagamento) => {
        if (!pagamento.valor || !pagamento.data_pagamento || !pagamento.favorecido) {
            throw new Error('Dados do pagamento incompletos');
        }
        if (!pagamento.favorecido.banco || !pagamento.favorecido.agencia || !pagamento.favorecido.conta) {
            throw new Error('Dados bancários do fornecedor incompletos');
        }
        return true;
    })
];

const validarLoteBoletos = [
    ...validarDadosEmpresa,
    body('pagamentos')
        .isArray({ min: 1 })
        .withMessage('Deve haver pelo menos um pagamento'),
    body('pagamentos.*').custom((pagamento) => {
        if (!pagamento.valor || !pagamento.data_pagamento || !pagamento.numero_boleto || !pagamento.data_vencimento) {
            throw new Error('Dados do boleto incompletos');
        }
        return true;
    })
];

const validarLoteSalarios = [
    ...validarDadosEmpresa,
    body('pagamentos')
        .isArray({ min: 1 })
        .withMessage('Deve haver pelo menos um pagamento'),
    body('pagamentos.*').custom((pagamento) => {
        if (!pagamento.valor || !pagamento.data_pagamento || !pagamento.funcionario) {
            throw new Error('Dados do pagamento incompletos');
        }
        if (!pagamento.funcionario.matricula || !pagamento.funcionario.banco || 
            !pagamento.funcionario.agencia || !pagamento.funcionario.conta) {
            throw new Error('Dados do funcionário incompletos');
        }
        return true;
    })
];

const validarLoteTributos = [
    ...validarDadosEmpresa,
    body('pagamentos')
        .isArray({ min: 1 })
        .withMessage('Deve haver pelo menos um pagamento'),
    body('pagamentos.*').custom((pagamento) => {
        if (!pagamento.valor || !pagamento.data_pagamento || !pagamento.codigo_tributo || 
            !pagamento.periodo || !pagamento.uf) {
            throw new Error('Dados do tributo incompletos');
        }
        return true;
    })
];

const validarLotePIX = [
    ...validarDadosEmpresa,
    body('pagamentos')
        .isArray({ min: 1 })
        .withMessage('Deve haver pelo menos um pagamento'),
    body('pagamentos.*').custom((pagamento) => {
        if (!pagamento.valor || !pagamento.data_pagamento || !pagamento.chave_pix || !pagamento.tipo_pix) {
            throw new Error('Dados do PIX incompletos');
        }
        return true;
    })
];

module.exports = {
    validarFornecedor,
    validarBoleto,
    validarSalario,
    validarTributo,
    validarPIX,
    validarLoteFornecedores,
    validarLoteBoletos,
    validarLoteSalarios,
    validarLoteTributos,
    validarLotePIX
}; 