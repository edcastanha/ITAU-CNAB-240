/**
 * Controlador para os endpoints de pagamentos via CNAB 240
 */

const path = require('path');
const cnabService = require('../services/cnab240/cnabService');
const { SERVICE_TYPES, PAYMENT_FORMS } = require('../config/constants');

// Diretório para salvar os arquivos gerados
const OUTPUT_DIR = path.join(process.cwd(), 'output');

/**
 * Gera um arquivo CNAB 240 para pagamentos de fornecedores
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoFornecedores(req, res) {
  try {
    const { empresa, pagamentos } = req.body;
    
    // Validação básica
    if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes: [
        {
          tipo_servico: SERVICE_TYPES.FORNECEDORES,
          forma_pagamento: req.body.forma_pagamento || PAYMENT_FORMS.CREDITO_CC,
          pagamentos
        }
      ]
    };
    
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_fornecedores_${timestamp}.rem`);
    
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 para fornecedores:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

/**
 * Gera um arquivo CNAB 240 para pagamentos de boletos
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoBoletos(req, res) {
  try {
    const { empresa, pagamentos } = req.body;
    
    // Validação básica
    if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes: [
        {
          tipo_servico: SERVICE_TYPES.FORNECEDORES,
          forma_pagamento: PAYMENT_FORMS.BOLETO_OUTROS,
          pagamentos
        }
      ]
    };
    
    console.log(params);
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_boletos_${timestamp}.rem`);
    console.log(outputPath);
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 para boletos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

/**
 * Gera um arquivo CNAB 240 para pagamentos de salários
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoSalarios(req, res) {
  try {
    const { empresa, pagamentos } = req.body;
    
    // Validação básica
    if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes: [
        {
          tipo_servico: SERVICE_TYPES.SALARIOS,
          forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
          pagamentos
        }
      ]
    };
    
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_salarios_${timestamp}.rem`);
    
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 para salários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

/**
 * Gera um arquivo CNAB 240 para pagamentos de tributos
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoTributos(req, res) {
  try {
    const { empresa, pagamentos } = req.body;
    
    // Validação básica
    if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes: [
        {
          tipo_servico: SERVICE_TYPES.TRIBUTOS,
          forma_pagamento: req.body.forma_pagamento || PAYMENT_FORMS.TRIBUTO_CODIGO_BARRAS,
          pagamentos
        }
      ]
    };
    
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_tributos_${timestamp}.rem`);
    
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 para tributos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

/**
 * Gera um arquivo CNAB 240 para pagamentos PIX
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoPIX(req, res) {
  try {
    const { empresa, pagamentos, tipo_pix } = req.body;
    
    // Validação básica
    if (!empresa || !pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    }
    
    // Determina a forma de pagamento com base no tipo de PIX
    let forma_pagamento = PAYMENT_FORMS.PIX_TRANSFERENCIA;
    if (tipo_pix === 'qrcode') {
      forma_pagamento = PAYMENT_FORMS.PIX_QR_CODE;
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes: [
        {
          tipo_servico: SERVICE_TYPES.DIVERSOS,
          forma_pagamento,
          pagamentos
        }
      ]
    };
    
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_pix_${timestamp}.rem`);
    
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 para PIX:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

/**
 * Gera um arquivo CNAB 240 personalizado com múltiplos lotes
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
async function gerarArquivoPersonalizado(req, res) {
  try {
    const { empresa, lotes } = req.body;
    
    // Validação básica
    if (!empresa || !lotes || !Array.isArray(lotes) || lotes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Empresa e array de lotes são obrigatórios.'
      });
    }
    
    // Prepara os parâmetros para o serviço
    const params = {
      empresa,
      lotes
    };
    
    // Nome do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const outputPath = path.join(OUTPUT_DIR, `cnab240_personalizado_${timestamp}.rem`);
    
    // Gera o arquivo
    const resultado = await cnabService.gerarArquivoCNAB240(params, outputPath);
    
    // Retorna o resultado
    return res.status(200).json({
      success: true,
      message: 'Arquivo CNAB 240 gerado com sucesso',
      arquivo: resultado.arquivo,
      caminho: resultado.caminho,
      estatisticas: {
        quantidade_lotes: resultado.quantidade_lotes,
        quantidade_registros: resultado.quantidade_registros,
        tamanho_bytes: resultado.tamanho_bytes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar arquivo CNAB 240 personalizado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB 240',
      error: error.message
    });
  }
}

module.exports = {
  gerarArquivoFornecedores,
  gerarArquivoBoletos,
  gerarArquivoSalarios,
  gerarArquivoTributos,
  gerarArquivoPIX,
  gerarArquivoPersonalizado
};
