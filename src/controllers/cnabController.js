/**
 * Controlador para os endpoints de pagamentos via CNAB 240
 */

const path = require('path');
const cnabService = require('../services/cnab240/cnabService');
const { SERVICE_TYPES, PAYMENT_FORMS } = require('../config/constants');
const fs = require('fs');
const { gerarArquivoCNAB } = require('../services/cnab240/cnabService');
const { formatarData, formatarValor } = require('../utils/formatters');
const { processarLoteFornecedores } = require('../services/cnab240/fornecedorService');
const { processarLoteBoletos } = require('../services/cnab240/boletoService');
const { processarLoteSalarios } = require('../services/cnab240/salarioService');
const { processarLoteTributos } = require('../services/cnab240/tributoService');
const { processarLotePIX } = require('../services/cnab240/pixService');
const { validateFornecedores, validateBoletos, validatePIX, validateTributos, validateSalarios } = require('../validators/validator');

// Diretório para salvar os arquivos gerados
const OUTPUT_DIR = path.join(process.cwd(), 'output');

/**
 * Gera um arquivo CNAB 240 para pagamentos de fornecedores
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
const gerarCNABFornecedores = async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const arquivo = await gerarArquivoCNAB({
      empresa,
      pagamentos,
      tipo: 'fornecedores'
    });

    res.json({
      success: true,
      message: 'Arquivo CNAB gerado com sucesso',
      arquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB',
      error: error.message
    });
  }
};

/**
 * Gera um arquivo CNAB 240 para pagamentos de boletos
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
const gerarCNABBoletos = async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const arquivo = await gerarArquivoCNAB({
      empresa,
      pagamentos,
      tipo: 'boletos'
    });

    res.json({
      success: true,
      message: 'Arquivo CNAB gerado com sucesso',
      arquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB',
      error: error.message
    });
  }
};

/**
 * Gera um arquivo CNAB 240 para pagamentos de salários
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
const gerarCNABSalarios = async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const arquivo = await gerarArquivoCNAB({
      empresa,
      pagamentos,
      tipo: 'salarios'
    });

    res.json({
      success: true,
      message: 'Arquivo CNAB gerado com sucesso',
      arquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB',
      error: error.message
    });
  }
};

/**
 * Gera um arquivo CNAB 240 para pagamentos de tributos
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
const gerarCNABTributos = async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const arquivo = await gerarArquivoCNAB({
      empresa,
      pagamentos,
      tipo: 'tributos'
    });

    res.json({
      success: true,
      message: 'Arquivo CNAB gerado com sucesso',
      arquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB',
      error: error.message
    });
  }
};

/**
 * Gera um arquivo CNAB 240 para pagamentos PIX
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
const gerarCNABPIX = async (req, res) => {
  try {
    const { empresa, pagamentos } = req.body;
    const arquivo = await gerarArquivoCNAB({
      empresa,
      pagamentos,
      tipo: 'pix'
    });

    res.json({
      success: true,
      message: 'Arquivo CNAB gerado com sucesso',
      arquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo CNAB',
      error: error.message
    });
  }
};

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

// Função auxiliar para gerar arquivo CNAB
async function gerarArquivoCNAB(dados, tipo) {
    const cnab = await gerarCNAB(dados);
    const nomeArquivo = `${tipo}_${Date.now()}.rem`;
    const caminhoArquivo = path.join(__dirname, '..', '..', 'test_files', nomeArquivo);
    
    fs.writeFileSync(caminhoArquivo, cnab);
    return caminhoArquivo;
}

// Funções para pagamentos individuais
const gerarCNABFornecedor = async (req, res) => {
    try {
        const { empresa, pagamento } = req.body;
        const lote = await processarLoteFornecedores(empresa, 1, [pagamento]);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABBoleto = async (req, res) => {
    try {
        const { empresa, pagamento } = req.body;
        const lote = await processarLoteBoletos(empresa, 1, [pagamento]);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABSalario = async (req, res) => {
    try {
        const { empresa, pagamento } = req.body;
        const lote = await processarLoteSalarios(empresa, 1, [pagamento]);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABTributo = async (req, res) => {
    try {
        const { empresa, pagamento } = req.body;
        const lote = await processarLoteTributos(empresa, 1, [pagamento]);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABPIX = async (req, res) => {
    try {
        const { empresa, pagamento } = req.body;
        const lote = await processarLotePIX(empresa, 1, [pagamento]);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

// Funções para lotes de pagamentos
const gerarCNABLoteFornecedores = async (req, res) => {
    try {
        const { empresa, pagamentos } = req.body;
        const lote = await processarLoteFornecedores(empresa, 1, pagamentos);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABLoteBoletos = async (req, res) => {
    try {
        const { empresa, pagamentos } = req.body;
        const lote = await processarLoteBoletos(empresa, 1, pagamentos);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABLoteSalarios = async (req, res) => {
    try {
        const { empresa, pagamentos } = req.body;
        const lote = await processarLoteSalarios(empresa, 1, pagamentos);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABLoteTributos = async (req, res) => {
    try {
        const { empresa, pagamentos } = req.body;
        const lote = await processarLoteTributos(empresa, 1, pagamentos);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

const gerarCNABLotePIX = async (req, res) => {
    try {
        const { empresa, pagamentos } = req.body;
        const lote = await processarLotePIX(empresa, 1, pagamentos);
        res.json({ sucesso: true, lote });
    } catch (erro) {
        res.status(400).json({ sucesso: false, erro: erro.message });
    }
};

module.exports = {
  gerarCNABFornecedores,
  gerarCNABBoletos,
  gerarCNABSalarios,
  gerarCNABTributos,
  gerarCNABPIX,
  gerarArquivoPersonalizado,
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
};
