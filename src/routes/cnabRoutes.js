/**
 * Rotas para a API REST de geração de arquivos CNAB 240
 */

const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validate');
const {
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
} = require('../validations/cnabValidation');
const {
    gerarCNABFornecedor,
    gerarCNABBoleto,
    gerarCNABSalario,
    gerarCNABTributo,
    gerarCNABPIX,
    gerarCNABLoteFornecedores,
    gerarCNABLoteBoletos,
    gerarCNABLoteSalarios,
    gerarCNABLoteTributos,
    gerarCNABLotePIX
} = require('../controllers/cnabController');

// Rotas para pagamentos individuais
router.post('/fornecedor', validarFornecedor, gerarCNABFornecedor);
router.post('/boleto', validarBoleto, gerarCNABBoleto);
router.post('/salario', validarSalario, gerarCNABSalario);
router.post('/tributo', validarTributo, gerarCNABTributo);
router.post('/pix', validarPIX, gerarCNABPIX);

// Rotas para lotes de pagamentos
router.post('/lote/fornecedores', validarLoteFornecedores, gerarCNABLoteFornecedores);
router.post('/lote/boletos', validarLoteBoletos, gerarCNABLoteBoletos);
router.post('/lote/salarios', validarLoteSalarios, gerarCNABLoteSalarios);
router.post('/lote/tributos', validarLoteTributos, gerarCNABLoteTributos);
router.post('/lote/pix', validarLotePIX, gerarCNABLotePIX);

module.exports = router;
