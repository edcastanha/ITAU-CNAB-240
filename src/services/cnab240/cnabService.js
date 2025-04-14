/**
 * Serviço orquestrador para geração de arquivos CNAB 240
 * Responsável por coordenar a geração dos diferentes tipos de registros
 * e montar o arquivo completo
 */

const fs = require('fs');
const path = require('path');

const { gerarHeaderArquivo, gerarTrailerArquivo } = require('./arquivoService');
const { gerarHeaderLote, gerarTrailerLote } = require('./loteService');
const { gerarSegmentoA, gerarSegmentoB } = require('./segmentoService');
const { gerarSegmentoJ, gerarSegmentoJ52, gerarSegmentoJ52PIX } = require('./segmentoBoletoService');
const { gerarSegmentoO, gerarSegmentoN, gerarSegmentoW } = require('./segmentoTributoService');
const { gerarSegmentoC, gerarSegmentoD } = require('./segmentoSalarioService');

const { SERVICE_TYPES, PAYMENT_FORMS } = require('../../config/constants');

/**
 * Gera um arquivo CNAB 240 completo com múltiplos lotes
 * @param {Object} params - Parâmetros para geração do arquivo
 * @param {Object} params.empresa - Dados da empresa
 * @param {Array} params.lotes - Array de lotes a serem incluídos no arquivo
 * @param {string} outputPath - Caminho onde o arquivo será salvo
 * @returns {Object} - Informações sobre o arquivo gerado
 */
async function gerarArquivoCNAB240(params, outputPath) {
  const { empresa, lotes } = params;
  
  if (!empresa || !lotes || !lotes.length) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
  }
  
  // Inicializa contadores e arrays para armazenar as linhas
  let linhas = [];
  let quantidadeLotes = 0;
  let quantidadeRegistros = 1; // Começa com 1 para incluir o header de arquivo
  
  // Gera o header de arquivo
  const headerArquivo = gerarHeaderArquivo({ empresa });
  linhas.push(headerArquivo);
  
  // Processa cada lote
  for (const lote of lotes) {
    const { tipo_servico, forma_pagamento, pagamentos } = lote;
    
    if (!tipo_servico || !forma_pagamento || !pagamentos || !pagamentos.length) {
      throw new Error(`Lote ${quantidadeLotes + 1} inválido: tipo de serviço, forma de pagamento ou pagamentos não fornecidos`);
    }
    
    // Incrementa o contador de lotes
    quantidadeLotes++;
    
    // Determina o processador de lote adequado com base no tipo de serviço e forma de pagamento
    let processadorLote;
    switch (tipo_servico) {
      case SERVICE_TYPES.FORNECEDORES:
        processadorLote = processarLoteFornecedores;
        break;
      case SERVICE_TYPES.SALARIOS:
        processadorLote = processarLoteSalarios;
        break;
      case SERVICE_TYPES.TRIBUTOS:
        processadorLote = processarLoteTributos;
        break;
      case SERVICE_TYPES.DIVERSOS:
        if (forma_pagamento === PAYMENT_FORMS.PIX_QR_CODE) {
          processadorLote = processarLotePIX;
        } else if (
          forma_pagamento === PAYMENT_FORMS.BOLETO_ITAU || 
          forma_pagamento === PAYMENT_FORMS.BOLETO_OUTROS
        ) {
          processadorLote = processarLoteBoletos;
        } else {
          processadorLote = processarLoteFornecedores;
        }
        break;
      default:
        throw new Error(`Tipo de serviço não suportado: ${tipo_servico}`);
    }
    
    // Processa o lote e obtém as linhas e a quantidade de registros
    const resultado = processadorLote({
      empresa,
      numero_lote: quantidadeLotes,
      ...lote
    });
    
    // Adiciona as linhas do lote ao array de linhas
    linhas = linhas.concat(resultado.linhas);
    
    // Incrementa o contador de registros
    quantidadeRegistros += resultado.quantidade_registros;
  }
  
  // Gera o trailer de arquivo
  const trailerArquivo = gerarTrailerArquivo({
    quantidade_lotes: quantidadeLotes,
    quantidade_registros: quantidadeRegistros + 1 // +1 para incluir o trailer de arquivo
  });
  linhas.push(trailerArquivo);
  
  // Salva o arquivo
  await salvarArquivo(linhas, outputPath);
  
  return {
    arquivo: path.basename(outputPath),
    caminho: outputPath,
    quantidade_lotes: quantidadeLotes,
    quantidade_registros: quantidadeRegistros + 1,
    tamanho_bytes: linhas.join('\n').length
  };
}

/**
 * Processa um lote de pagamentos de fornecedores (Segmentos A e B)
 * @param {Object} params - Parâmetros para processamento do lote
 * @returns {Object} - Linhas geradas e quantidade de registros
 */
function processarLoteFornecedores(params) {
  const { empresa, numero_lote, tipo_servico, forma_pagamento, pagamentos } = params;
  
  // Inicializa arrays e contadores
  const linhas = [];
  let quantidadeRegistros = 2; // Header e Trailer de lote
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote({
    numero_lote,
    tipo_servico,
    forma_pagamento,
    empresa
  });
  linhas.push(headerLote);
  
  // Processa cada pagamento
  let numeroRegistro = 0;
  for (const pagamento of pagamentos) {
    // Incrementa o contador de registros
    numeroRegistro++;
    
    // Gera o segmento A
    const segmentoA = gerarSegmentoA({
      numero_lote,
      numero_registro: numeroRegistro,
      favorecido: pagamento.favorecido,
      pagamento: pagamento.dados,
      informacoes: pagamento.informacoes
    });
    linhas.push(segmentoA);
    quantidadeRegistros++;
    
    // Adiciona o valor ao somatório
    somatoriaValores += pagamento.dados.valor || 0;
    
    // Gera o segmento B se necessário
    if (pagamento.favorecido.endereco || pagamento.pix) {
      numeroRegistro++;
      const segmentoB = gerarSegmentoB({
        numero_lote,
        numero_registro: numeroRegistro,
        favorecido: pagamento.favorecido,
        pix: pagamento.pix
      });
      linhas.push(segmentoB);
      quantidadeRegistros++;
    }
  }
  
  // Gera o trailer de lote
  const trailerLote = gerarTrailerLote({
    numero_lote,
    quantidade_registros: quantidadeRegistros,
    somatoria_valores: somatoriaValores
  });
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros
  };
}

/**
 * Processa um lote de pagamentos de boletos (Segmentos J e J-52)
 * @param {Object} params - Parâmetros para processamento do lote
 * @returns {Object} - Linhas geradas e quantidade de registros
 */
function processarLoteBoletos(params) {
  const { empresa, numero_lote, tipo_servico, forma_pagamento, pagamentos } = params;
  
  // Inicializa arrays e contadores
  const linhas = [];
  let quantidadeRegistros = 2; // Header e Trailer de lote
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote({
    numero_lote,
    tipo_servico,
    forma_pagamento,
    empresa
  });
  linhas.push(headerLote);
  
  // Processa cada pagamento
  let numeroRegistro = 0;
  for (const pagamento of pagamentos) {
    // Incrementa o contador de registros
    numeroRegistro++;
    
    // Gera o segmento J
    const segmentoJ = gerarSegmentoJ({
      numero_lote,
      numero_registro: numeroRegistro,
      boleto: pagamento.boleto
    });
    linhas.push(segmentoJ);
    quantidadeRegistros++;
    
    // Adiciona o valor ao somatório
    somatoriaValores += pagamento.boleto.valor || 0;
    
    // Gera o segmento J-52 se necessário
    if (pagamento.pagador || pagamento.beneficiario) {
      numeroRegistro++;
      const segmentoJ52 = gerarSegmentoJ52({
        numero_lote,
        numero_registro: numeroRegistro,
        pagador: pagamento.pagador,
        beneficiario: pagamento.beneficiario,
        sacador: pagamento.sacador
      });
      linhas.push(segmentoJ52);
      quantidadeRegistros++;
    }
  }
  
  // Gera o trailer de lote
  const trailerLote = gerarTrailerLote({
    numero_lote,
    quantidade_registros: quantidadeRegistros,
    somatoria_valores: somatoriaValores
  });
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros
  };
}

/**
 * Processa um lote de pagamentos PIX via QR Code (Segmentos J e J-52 PIX)
 * @param {Object} params - Parâmetros para processamento do lote
 * @returns {Object} - Linhas geradas e quantidade de registros
 */
function processarLotePIX(params) {
  const { empresa, numero_lote, tipo_servico, forma_pagamento, pagamentos } = params;
  
  // Inicializa arrays e contadores
  const linhas = [];
  let quantidadeRegistros = 2; // Header e Trailer de lote
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote({
    numero_lote,
    tipo_servico,
    forma_pagamento,
    empresa
  });
  linhas.push(headerLote);
  
  // Processa cada pagamento
  let numeroRegistro = 0;
  for (const pagamento of pagamentos) {
    // Incrementa o contador de registros
    numeroRegistro++;
    
    // Gera o segmento J
    const segmentoJ = gerarSegmentoJ({
      numero_lote,
      numero_registro: numeroRegistro,
      boleto: pagamento.boleto
    });
    linhas.push(segmentoJ);
    quantidadeRegistros++;
    
    // Adiciona o valor ao somatório
    somatoriaValores += pagamento.boleto.valor || 0;
    
    // Gera o segmento J-52 PIX
    numeroRegistro++;
    const segmentoJ52PIX = gerarSegmentoJ52PIX({
      numero_lote,
      numero_registro: numeroRegistro,
      pix: pagamento.pix
    });
    linhas.push(segmentoJ52PIX);
    quantidadeRegistros++;
  }
  
  // Gera o trailer de lote
  const trailerLote = gerarTrailerLote({
    numero_lote,
    quantidade_registros: quantidadeRegistros,
    somatoria_valores: somatoriaValores
  });
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros
  };
}

/**
 * Processa um lote de pagamentos de tributos
 * @param {Object} params - Parâmetros do lote
 * @returns {Object} - Linhas geradas e quantidade de registros
 */
function processarLoteTributos(params) {
  const { empresa, numero_lote, pagamentos } = params;
  
  // Validações básicas
  if (!empresa || !numero_lote || !pagamentos || !pagamentos.length) {
    throw new Error('Parâmetros obrigatórios não fornecidos para processar lote de tributos');
  }
  
  // Inicializa contadores e arrays
  let linhas = [];
  let quantidadeRegistros = 2; // Header e trailer de lote
  
  // Gera o header do lote
  const headerLote = gerarHeaderLote({
    empresa,
    numero_lote,
    tipo_servico: SERVICE_TYPES.TRIBUTOS
  });
  linhas.push(headerLote);
  
  // Processa cada pagamento
  for (const pagamento of pagamentos) {
    const { tributo } = pagamento;
    
    if (!tributo) {
      throw new Error('Dados do tributo não fornecidos');
    }
    
    // Gera os segmentos específicos para cada tipo de tributo
    if (tributo.codigo_barras) {
      // Tributo com código de barras
      const segmentoO = gerarSegmentoO({
        numero_lote,
        numero_registro: quantidadeRegistros,
        tributo
      });
      linhas.push(segmentoO);
      quantidadeRegistros++;
      
      const segmentoN = gerarSegmentoN({
        numero_lote,
        numero_registro: quantidadeRegistros,
        tributo
      });
      linhas.push(segmentoN);
      quantidadeRegistros++;
      
      const segmentoW = gerarSegmentoW({
        numero_lote,
        numero_registro: quantidadeRegistros,
        tributo
      });
      linhas.push(segmentoW);
      quantidadeRegistros++;
    } else {
      // DARF
      const segmentoO = gerarSegmentoO({
        numero_lote,
        numero_registro: quantidadeRegistros,
        tributo
      });
      linhas.push(segmentoO);
      quantidadeRegistros++;
      
      const segmentoN = gerarSegmentoN({
        numero_lote,
        numero_registro: quantidadeRegistros,
        tributo
      });
      linhas.push(segmentoN);
      quantidadeRegistros++;
    }
  }
  
  // Gera o trailer do lote
  const trailerLote = gerarTrailerLote({
    numero_lote,
    quantidade_registros: quantidadeRegistros
  });
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros
  };
}

/**
 * Processa um lote de pagamentos de salários
 * @param {Object} params - Parâmetros do lote
 * @param {Object} params.empresa - Dados da empresa
 * @param {number} params.numero_lote - Número do lote
 * @param {Array} params.pagamentos - Array de pagamentos
 * @returns {Object} - Linhas geradas e quantidade de registros
 * @throws {Error} - Se os parâmetros obrigatórios não forem fornecidos ou forem inválidos
 */
function processarLoteSalarios(params) {
  const { empresa, numero_lote, pagamentos } = params;
  
  // Validações básicas
  if (!empresa) {
    throw new Error('Dados da empresa não fornecidos');
  }
  
  if (!numero_lote || numero_lote <= 0) {
    throw new Error('Número do lote inválido');
  }
  
  if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
    throw new Error('Lista de pagamentos inválida ou vazia');
  }
  
  // Validações da empresa
  if (!empresa.agencia || !empresa.conta || !empresa.dac || !empresa.nome) {
    throw new Error('Dados da empresa incompletos');
  }
  
  // Inicializa contadores e arrays
  let linhas = [];
  let quantidadeRegistros = 2; // Header e trailer de lote
  let somatoriaValores = 0;
  
  try {
    // Gera o header do lote
    const headerLote = gerarHeaderLote({
      empresa,
      numero_lote,
      tipo_servico: SERVICE_TYPES.SALARIOS,
      forma_pagamento: PAYMENT_FORMS.CREDITO_CC,
      finalidade_lote: 'PAGAMENTO DE SALARIOS'
    });
    linhas.push(headerLote);
    
    // Processa cada pagamento
    for (const pagamento of pagamentos) {
      const { funcionario } = pagamento;
      
      if (!funcionario) {
        throw new Error('Dados do funcionário não fornecidos');
      }
      
      // Validações do funcionário
      if (!funcionario.nome || !funcionario.cpf || !funcionario.banco || 
          !funcionario.agencia || !funcionario.conta || !funcionario.dac) {
        throw new Error('Dados do funcionário incompletos');
      }
      
      // Gera os segmentos para cada funcionário
      const segmentoA = gerarSegmentoA({
        numero_lote,
        numero_registro: quantidadeRegistros,
        funcionario
      });
      linhas.push(segmentoA);
      quantidadeRegistros++;
      
      const segmentoB = gerarSegmentoB({
        numero_lote,
        numero_registro: quantidadeRegistros,
        funcionario
      });
      linhas.push(segmentoB);
      quantidadeRegistros++;
      
      const segmentoC = gerarSegmentoC({
        numero_lote,
        numero_registro: quantidadeRegistros,
        funcionario
      });
      linhas.push(segmentoC);
      quantidadeRegistros++;
      
      // Adiciona o valor ao somatório
      if (funcionario.valor) {
        somatoriaValores += funcionario.valor;
      }
    }
    
    // Gera o trailer do lote
    const trailerLote = gerarTrailerLote({
      numero_lote,
      quantidade_registros: quantidadeRegistros,
      somatoria_valores: somatoriaValores
    });
    linhas.push(trailerLote);
    
    return {
      linhas,
      quantidade_registros: quantidadeRegistros,
      somatoria_valores: somatoriaValores
    };
    
  } catch (error) {
    throw new Error(`Erro ao processar lote de salários: ${error.message}`);
  }
}

/**
 * Salva o arquivo CNAB 240 no sistema de arquivos
 * @param {Array} linhas - Array de linhas do arquivo
 * @param {string} outputPath - Caminho onde o arquivo será salvo
 */
async function salvarArquivo(linhas, outputPath) {
  // Cria o diretório se não existir
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Salva o arquivo
  await fs.promises.writeFile(outputPath, linhas.join('\n'), 'utf8');
}

module.exports = {
  gerarArquivoCNAB240,
  processarLoteFornecedores,
  processarLoteBoletos,
  processarLotePIX,
  processarLoteTributos,
  processarLoteSalarios
};
