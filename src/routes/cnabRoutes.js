/**
 * Rotas para a API REST de geração de arquivos CNAB 240
 */

const express = require('express');
const router = express.Router();
const cnabController = require('../controllers/cnabController');

// Middleware para validação básica de requisições
const validateRequest = (req, res, next) => {
  const { empresa, pagamentos } = req.body;
  
  if (!empresa) {
    return res.status(400).json({
      success: false,
      message: 'Dados da empresa são obrigatórios'
    });
  }
  
  if (!empresa.tipo_inscricao || !empresa.inscricao_numero || !empresa.nome) {
    return res.status(400).json({
      success: false,
      message: 'Dados da empresa incompletos. Tipo de inscrição, número de inscrição e nome são obrigatórios'
    });
  }
  
  if (!empresa.agencia || !empresa.conta || !empresa.dac) {
    return res.status(400).json({
      success: false,
      message: 'Dados bancários da empresa incompletos. Agência, conta e DAC são obrigatórios'
    });
  }
  
  if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Array de pagamentos é obrigatório e não pode estar vazio'
    });
  }
  
  next();
};

// Middleware para validação de requisições personalizadas
const validateCustomRequest = (req, res, next) => {
  const { empresa, lotes } = req.body;
  
  if (!empresa) {
    return res.status(400).json({
      success: false,
      message: 'Dados da empresa são obrigatórios'
    });
  }
  
  if (!empresa.tipo_inscricao || !empresa.inscricao_numero || !empresa.nome) {
    return res.status(400).json({
      success: false,
      message: 'Dados da empresa incompletos. Tipo de inscrição, número de inscrição e nome são obrigatórios'
    });
  }
  
  if (!empresa.agencia || !empresa.conta || !empresa.dac) {
    return res.status(400).json({
      success: false,
      message: 'Dados bancários da empresa incompletos. Agência, conta e DAC são obrigatórios'
    });
  }
  
  if (!lotes || !Array.isArray(lotes) || lotes.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Array de lotes é obrigatório e não pode estar vazio'
    });
  }
  
  for (const lote of lotes) {
    if (!lote.tipo_servico) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de serviço é obrigatório para cada lote'
      });
    }
    
    if (!lote.pagamentos || !Array.isArray(lote.pagamentos) || lote.pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de pagamentos é obrigatório para cada lote e não pode estar vazio'
      });
    }
  }
  
  next();
};

// Rotas para geração de arquivos CNAB 240
router.post('/fornecedores', validateRequest, cnabController.gerarArquivoFornecedores);
router.post('/boletos', validateRequest, cnabController.gerarArquivoBoletos);
router.post('/salarios', validateRequest, cnabController.gerarArquivoSalarios);
router.post('/tributos', validateRequest, cnabController.gerarArquivoTributos);
router.post('/pix', validateRequest, cnabController.gerarArquivoPIX);
router.post('/personalizado', validateCustomRequest, cnabController.gerarArquivoPersonalizado);

module.exports = router;
