/**
 * Rotas para a API REST de geração de arquivos CNAB 240
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { gerarArquivoCNAB240 } = require('../services/cnab240/cnabService');
const { formatarData } = require('../utils/formatters');
const { 
  validateFornecedores, 
  validateBoletos, 
  validatePIX, 
  validateTributos, 
  validateSalarios, 
  validatePersonalizado 
} = require('../validators/validator');

// Diretório para armazenar os arquivos gerados
const OUTPUT_DIR = path.join(__dirname, '../../output');

// Função auxiliar para determinar o tipo de serviço
const getTipoServico = (tipo) => {
  switch (tipo) {
    case 'fornecedores': return '20';
    case 'boletos': return '98';
    case 'salarios': return '30';
    case 'tributos': return '11';
    case 'pix': return '40';
    default: return '30';
  }
};

// Função auxiliar para determinar a forma de pagamento
const getFormaPagamento = (tipo) => {
  switch (tipo) {
    case 'fornecedores': return '01'; // Crédito em conta
    case 'boletos': return '30';      // Pagamento de títulos
    case 'salarios': return '01';     // Crédito em conta
    case 'tributos': return '85';     // DARF
    case 'pix': return '45';          // PIX
    default: return '01';
  }
};

// Função auxiliar para gerar nome do arquivo
const gerarNomeArquivo = (tipo) => {
  const dataAtual = formatarData(new Date());
  return `CNAB240_${tipo.toUpperCase()}_${dataAtual}.rem`;
}

// Rotas para pagamentos em lote
router.post('/fornecedores', validateFornecedores, async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const nomeArquivo = gerarNomeArquivo('fornecedores');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('fornecedores'),
        forma_pagamento: getFormaPagamento('fornecedores'),
        pagamentos
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/boletos', validateBoletos, async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const nomeArquivo = gerarNomeArquivo('boletos');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('boletos'),
        forma_pagamento: getFormaPagamento('boletos'),
        pagamentos
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/salarios', validateSalarios, async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const nomeArquivo = gerarNomeArquivo('salarios');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('salarios'),
        forma_pagamento: getFormaPagamento('salarios'),
        pagamentos
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tributos', validateTributos, async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const nomeArquivo = gerarNomeArquivo('tributos');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('tributos'),
        forma_pagamento: getFormaPagamento('tributos'),
        pagamentos
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pix', validatePIX, async (req, res) => {
  try {
    const { empresa, pagamentos, tipo_pix } = req.body;
    const nomeArquivo = gerarNomeArquivo('pix');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('pix'),
        forma_pagamento: getFormaPagamento('pix'),
        pagamentos,
        tipo_pix
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rotas para pagamentos individuais
router.post('/fornecedores/individual', validateFornecedores, async (req, res) => {
  try {
    const { empresa, pagamento } = req.body;
    const nomeArquivo = gerarNomeArquivo('fornecedores');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('fornecedores'),
        forma_pagamento: getFormaPagamento('fornecedores'),
        pagamentos: [pagamento]
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/boletos/individual', validateBoletos, async (req, res) => {
  try {
    const { empresa, pagamento } = req.body;
    const nomeArquivo = gerarNomeArquivo('boletos');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('boletos'),
        forma_pagamento: getFormaPagamento('boletos'),
        pagamentos: [pagamento]
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/salarios/individual', validateSalarios, async (req, res) => {
  try {
    const { empresa, pagamento } = req.body;
    const nomeArquivo = gerarNomeArquivo('salarios');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('salarios'),
        forma_pagamento: getFormaPagamento('salarios'),
        pagamentos: [pagamento]
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tributos/individual', validateTributos, async (req, res) => {
  try {
    const { empresa, pagamento } = req.body;
    const nomeArquivo = gerarNomeArquivo('tributos');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('tributos'),
        forma_pagamento: getFormaPagamento('tributos'),
        pagamentos: [pagamento]
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pix/individual', validatePIX, async (req, res) => {
  try {
    const { empresa, pagamento, tipo_pix } = req.body;
    const nomeArquivo = gerarNomeArquivo('pix');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes: [{
        tipo_servico: getTipoServico('pix'),
        forma_pagamento: getFormaPagamento('pix'),
        pagamentos: [pagamento],
        tipo_pix
      }]
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adicionar rota para pagamentos personalizados com múltiplos lotes
router.post('/personalizado', validatePersonalizado, async (req, res) => {
  try {
    const { empresa, lotes } = req.body;
    const nomeArquivo = gerarNomeArquivo('personalizado');
    const caminhoArquivo = path.join(OUTPUT_DIR, nomeArquivo);
    
    await gerarArquivoCNAB240({
      empresa,
      lotes
    }, caminhoArquivo);
    
    res.json({ success: true, arquivo: nomeArquivo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
