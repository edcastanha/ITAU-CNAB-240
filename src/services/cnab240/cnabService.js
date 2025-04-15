/**
 * Serviço orquestrador para geração de arquivos CNAB 240
 * Responsável por coordenar a geração dos diferentes tipos de registros
 * e montar o arquivo completo
 */

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { formatarData, formatarValor, formatarNumero, formatarTexto, formatarDocumento, formatarCodigoBanco, formatarAgencia, formatarConta } = require('../../utils/formatters');

const { gerarHeaderArquivo, gerarTrailerArquivo } = require('./headerService');
const { gerarHeaderLote, gerarTrailerLote } = require('./loteService');
const { gerarSegmentoA, gerarSegmentoB } = require('./segmentoService');
const { gerarSegmentoJ, gerarSegmentoJ52, gerarSegmentoJ52PIX } = require('./segmentoBoletoService');
const { gerarSegmentoO, gerarSegmentoN, gerarSegmentoW } = require('./segmentoTributoService');
const { gerarSegmentoP, gerarSegmentoQ, gerarSegmentoR } = require('./segmentoSalarioService');

const { SERVICE_TYPES, PAYMENT_FORMS } = require('../../config/constants');

// Diretório para salvar os arquivos gerados
const DIRETORIO_ARQUIVOS = path.join(__dirname, '../../../arquivos');

/**
 * Gera um arquivo CNAB 240
 * @param {Object} params - Parâmetros do arquivo
 * @param {Object} params.empresa - Dados da empresa
 * @param {Array} params.lotes - Lista de lotes
 * @param {string} outputPath - Caminho do arquivo de saída
 * @returns {Object} - Objeto com as linhas do arquivo e contadores
 */
async function gerarArquivoCNAB240(params, outputPath) {
  const { empresa, lotes } = params;
  
  // Validações básicas
  if (!empresa || !lotes) {
    throw new Error('Parâmetros obrigatórios não fornecidos para gerar o arquivo CNAB 240');
  }
  
  try {
    // Inicializa contadores e arrays
    let quantidadeLotes = 0;
    let quantidadeRegistros = 0;
    const linhas = [];
    
    // Gera o header do arquivo
    const headerArquivo = gerarHeaderArquivo(empresa);
    linhas.push(headerArquivo);
    quantidadeRegistros++;
    
    // Processa cada lote
    for (const lote of lotes) {
      // Valida o lote
      if (!lote.tipo_servico || !lote.pagamentos) {
        throw new Error(`Lote ${quantidadeLotes + 1} inválido: tipo de serviço ou pagamentos não fornecidos`);
      }
      
      // Incrementa o contador de lotes
      quantidadeLotes++;
      
      // Determina o tipo de pagamento e processa o lote adequadamente
      if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_SALARIOS) {
        // Processa o lote de salários
        const resultadoLote = processarLoteSalarios({
          empresa,
          numero_lote: quantidadeLotes,
          pagamentos: lote.pagamentos,
          codigo_banco: lote.codigo_banco,
          tipo_servico: lote.tipo_servico,
          forma_pagamento: lote.forma_pagamento,
          finalidade_lote: lote.finalidade_lote
        });
        
        // Adiciona as linhas geradas
        linhas.push(...resultadoLote.linhas);
        
        // Atualiza a quantidade de registros
        quantidadeRegistros += resultadoLote.quantidade_registros;
      } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_FORNECEDORES) {
        // Processa o lote de fornecedores
        const resultadoLote = processarLoteFornecedores({
          empresa,
          numero_lote: quantidadeLotes,
          tipo_servico: lote.tipo_servico,
          forma_pagamento: lote.forma_pagamento,
          pagamentos: lote.pagamentos
        });
        
        // Adiciona as linhas geradas
        linhas.push(...resultadoLote.linhas);
        
        // Atualiza a quantidade de registros
        quantidadeRegistros += resultadoLote.quantidade_registros;
      } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_TRIBUTOS) {
        // Processa o lote de tributos
        const resultadoLote = processarLoteTributos({
          empresa,
          numero_lote: quantidadeLotes,
          pagamentos: lote.pagamentos
        });
        
        // Adiciona as linhas geradas
        linhas.push(...resultadoLote.linhas);
        
        // Atualiza a quantidade de registros
        quantidadeRegistros += resultadoLote.quantidade_registros;
      } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_BOLETOS) {
        // Processa o lote de boletos
        const resultadoLote = processarLoteBoletos({
          empresa,
          numero_lote: quantidadeLotes,
          tipo_servico: lote.tipo_servico,
          forma_pagamento: lote.forma_pagamento,
          pagamentos: lote.pagamentos
        });
        
        // Adiciona as linhas geradas
        linhas.push(...resultadoLote.linhas);
        
        // Atualiza a quantidade de registros
        quantidadeRegistros += resultadoLote.quantidade_registros;
      } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_PIX) {
        // Processa o lote de PIX
        const resultadoLote = processarLotePIX({
          empresa,
          numero_lote: quantidadeLotes,
          tipo_servico: lote.tipo_servico,
          forma_pagamento: lote.forma_pagamento,
          pagamentos: lote.pagamentos
        });
        
        // Adiciona as linhas geradas
        linhas.push(...resultadoLote.linhas);
        
        // Atualiza a quantidade de registros
        quantidadeRegistros += resultadoLote.quantidade_registros;
      } else {
        throw new Error(`Tipo de serviço não suportado: ${lote.tipo_servico}`);
      }
    }
    
    // Gera o trailer do arquivo
    const trailerArquivo = gerarTrailerArquivo(quantidadeLotes, quantidadeRegistros + 1); // Inclui o próprio trailer
    linhas.push(trailerArquivo);
    quantidadeRegistros++;
    
    // Grava o arquivo
    await fs.promises.writeFile(outputPath, linhas.join('\n'), 'utf8');
    
    return {
      linhas,
      quantidade_lotes: quantidadeLotes,
      quantidade_registros: quantidadeRegistros
    };
    
  } catch (error) {
    throw new Error(`Erro ao gerar arquivo CNAB 240: ${error.message}`);
  }
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
  let quantidadeRegistros = 0;
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote(empresa, numero_lote, 'fornecedores');
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
    somatoriaValores += Number(pagamento.dados?.valor || 0);
    
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
  const trailerLote = gerarTrailerLote(numero_lote, quantidadeRegistros, somatoriaValores);
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros + 2 // Header e trailer do lote
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
  let quantidadeRegistros = 0;
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote(empresa, numero_lote, 'boletos');
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
    somatoriaValores += Number(pagamento.boleto?.valor || 0);
    
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
  const trailerLote = gerarTrailerLote(numero_lote, quantidadeRegistros, somatoriaValores);
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros + 2 // Header e trailer do lote
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
  let quantidadeRegistros = 0;
  let somatoriaValores = 0;
  
  // Gera o header de lote
  const headerLote = gerarHeaderLote(empresa, numero_lote, 'pix');
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
    somatoriaValores += Number(pagamento.boleto?.valor || 0);
    
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
  const trailerLote = gerarTrailerLote(numero_lote, quantidadeRegistros, somatoriaValores);
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros + 2 // Header e trailer do lote
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
  let quantidadeRegistros = 0;
  let somatoriaValores = 0;
  
  // Gera o header do lote
  const headerLote = gerarHeaderLote(empresa, numero_lote, 'tributos');
  linhas.push(headerLote);
  
  // Processa cada pagamento
  for (const pagamento of pagamentos) {
    const { tributo } = pagamento;
    
    if (!tributo) {
      throw new Error('Dados do tributo não fornecidos');
    }
    
    // Adiciona o valor ao somatório
    somatoriaValores += Number(tributo.valor || 0);
    
    // Gera os segmentos específicos para cada tipo de tributo
    if (tributo.codigo_barras) {
      // Tributo com código de barras
      const segmentoO = gerarSegmentoO(
        numero_lote,
        ++quantidadeRegistros,
        tributo
      );
      linhas.push(segmentoO);
      
      const segmentoN = gerarSegmentoN(
        numero_lote,
        ++quantidadeRegistros,
        tributo
      );
      linhas.push(segmentoN);
      
      if (tributo.tipo === 'GARE') {
        const segmentoW = gerarSegmentoW(
          numero_lote,
          ++quantidadeRegistros,
          tributo
        );
        linhas.push(segmentoW);
      }
    } else {
      // DARF
      const segmentoN = gerarSegmentoN(
        numero_lote,
        ++quantidadeRegistros,
        tributo
      );
      linhas.push(segmentoN);
    }
  }
  
  // Gera o trailer do lote
  const trailerLote = gerarTrailerLote(numero_lote, quantidadeRegistros, somatoriaValores);
  linhas.push(trailerLote);
  
  return {
    linhas,
    quantidade_registros: quantidadeRegistros + 2 // header e trailer do lote
  };
}

/**
 * Processa um lote de pagamentos de salários
 * @param {Object} params - Parâmetros do lote
 * @param {Object} params.empresa - Dados da empresa
 * @param {number} params.numero_lote - Número do lote
 * @param {Array} params.pagamentos - Lista de pagamentos
 * @param {string} params.codigo_banco - Código do banco (opcional, padrão '033')
 * @param {string} params.tipo_servico - Tipo de serviço (opcional, padrão '30')
 * @param {string} params.forma_pagamento - Forma de pagamento (opcional, padrão '01')
 * @param {string} params.finalidade_lote - Finalidade do lote (opcional, padrão '01')
 * @returns {Object} Objeto com as linhas geradas e contadores
 */
function processarLoteSalarios(params) {
  const {
    empresa,
    numero_lote,
    pagamentos,
    codigo_banco = '033', // Santander como padrão
    tipo_servico = '30',  // Pagamento de Salários como padrão
    forma_pagamento = '01', // Crédito em Conta como padrão
    finalidade_lote = '01' // Folha Mensal como padrão
  } = params;

  // Validações básicas
  if (!empresa) {
    throw new Error('Dados da empresa são obrigatórios');
  }

  if (!numero_lote) {
    throw new Error('Número do lote é obrigatório');
  }

  if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
    throw new Error('Lista de pagamentos é obrigatória e deve conter pelo menos um pagamento');
  }

  // Inicializa contadores e arrays
  let numero_registro = 0;
  let somatoriaValores = 0;
  const linhas = [];

  try {
    // Gera header do lote
    const headerLote = gerarHeaderLote(empresa, numero_lote, 'salarios');
    linhas.push(headerLote);

    // Processa cada pagamento
    for (const pagamento of pagamentos) {
      if (!pagamento.funcionario) {
        throw new Error('Dados do funcionário são obrigatórios para cada pagamento');
      }

      const { funcionario } = pagamento;

      // Valida dados do funcionário
      if (!funcionario.nome) {
        throw new Error('Nome do funcionário é obrigatório');
      }

      if (!funcionario.cpf) {
        throw new Error('CPF do funcionário é obrigatório');
      }

      if (!funcionario.banco) {
        throw new Error('Dados bancários do funcionário são obrigatórios');
      }

      if (!funcionario.banco.agencia || !funcionario.banco.conta) {
        throw new Error('Agência e conta do funcionário são obrigatórios');
      }

      // Gera segmento P
      const segmentoP = gerarSegmentoP({
        numero_lote,
        numero_registro: ++numero_registro,
        funcionario,
        valor: pagamento.valor,
        data_pagamento: pagamento.data_pagamento || new Date(),
        codigo_banco
      });
      linhas.push(segmentoP);
      somatoriaValores += Number(pagamento.valor || 0);

      // Gera segmento Q
      const segmentoQ = gerarSegmentoQ({
        numero_lote,
        numero_registro: ++numero_registro,
        funcionario,
        codigo_banco
      });
      linhas.push(segmentoQ);

      // Gera segmento R
      const segmentoR = gerarSegmentoR({
        numero_lote,
        numero_registro: ++numero_registro,
        funcionario
      });
      linhas.push(segmentoR);
    }

    // Gera trailer do lote
    const trailerLote = gerarTrailerLote(numero_lote, numero_registro, somatoriaValores);
    linhas.push(trailerLote);

    return {
      linhas,
      quantidade_registros: numero_registro + 2, // Header e trailer do lote
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
  processarLoteSalarios,
  processarLoteFornecedores,
  processarLoteBoletos,
  processarLoteTributos,
  processarLotePIX,
  salvarArquivo
};
