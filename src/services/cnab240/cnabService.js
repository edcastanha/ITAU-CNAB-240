/**
 * Serviço orquestrador para geração de arquivos CNAB 240
 * Responsável por coordenar a geração dos diferentes tipos de registros
 * e montar o arquivo completo
 */

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { formatarData, formatarValor } = require('../../utils/formatters');

const { gerarHeaderArquivo, gerarTrailerArquivo } = require('./headerService');
const { gerarHeaderLote, gerarTrailerLote } = require('./loteService');
const { gerarSegmentoA, gerarSegmentoB, gerarSegmentoP, gerarSegmentoQ, gerarSegmentoR } = require('./segmentoService');
const { gerarSegmentoJ, gerarSegmentoJ52, gerarSegmentoJ52PIX } = require('./segmentoBoletoService');
const { gerarSegmentoO, gerarSegmentoN, gerarSegmentoW } = require('./segmentoTributoService');
const { gerarSegmentoC, gerarSegmentoD } = require('./segmentoSalarioService');

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
    const headerArquivo = gerarHeaderArquivo({
      empresa,
      data_geracao: moment().format('DDMMYYYY'),
      hora_geracao: moment().format('HHmmss')
    });
    linhas.push(headerArquivo);
    quantidadeRegistros++;
    
    // Processa cada lote
    for (const lote of lotes) {
      // Valida o lote
      if (!lote.tipo_servico || !lote.forma_pagamento || !lote.pagamentos) {
        throw new Error(`Lote ${quantidadeLotes + 1} inválido: tipo de serviço, forma de pagamento ou pagamentos não fornecidos`);
      }
      
      // Incrementa o contador de lotes
      quantidadeLotes++;
      
      // Gera o header do lote
      const headerLote = gerarHeaderLote({
        empresa,
        numero_lote: quantidadeLotes,
        tipo_servico: lote.tipo_servico,
        forma_pagamento: lote.forma_pagamento,
        finalidade_lote: lote.finalidade_lote
      });
      linhas.push(headerLote);
      quantidadeRegistros++;
      
      // Processa cada pagamento do lote
      for (const pagamento of lote.pagamentos) {
        // Verifica o tipo de serviço
        if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_SALARIOS) {
          // Gera os segmentos P, Q e R para pagamento de salários
          const segmentoP = gerarSegmentoP({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            funcionario: pagamento.funcionario
          });
          linhas.push(segmentoP);
          quantidadeRegistros++;
          
          const segmentoQ = gerarSegmentoQ({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            funcionario: pagamento.funcionario
          });
          linhas.push(segmentoQ);
          quantidadeRegistros++;
          
          const segmentoR = gerarSegmentoR({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            funcionario: pagamento.funcionario
          });
          linhas.push(segmentoR);
          quantidadeRegistros++;
          
        } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_FORNECEDORES) {
          // Gera os segmentos A e B para pagamento de fornecedores
          const segmentoA = gerarSegmentoA({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            favorecido: pagamento.favorecido,
            pagamento: pagamento.dados
          });
          linhas.push(segmentoA);
          quantidadeRegistros++;
          
          const segmentoB = gerarSegmentoB({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            favorecido: pagamento.favorecido
          });
          linhas.push(segmentoB);
          quantidadeRegistros++;
          
        } else if (lote.tipo_servico === SERVICE_TYPES.PAGAMENTO_TRIBUTOS) {
          // Gera os segmentos N, O e W para pagamento de tributos
          const segmentoN = gerarSegmentoN({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            tributo: pagamento.tributo
          });
          linhas.push(segmentoN);
          quantidadeRegistros++;
          
          if (pagamento.tributo.codigo_barras) {
            const segmentoO = gerarSegmentoO({
              numero_lote: quantidadeLotes,
              numero_registro: quantidadeRegistros + 1,
              tributo: pagamento.tributo
            });
            linhas.push(segmentoO);
            quantidadeRegistros++;
          }
          
          const segmentoW = gerarSegmentoW({
            numero_lote: quantidadeLotes,
            numero_registro: quantidadeRegistros + 1,
            tributo: pagamento.tributo
          });
          linhas.push(segmentoW);
          quantidadeRegistros++;
        }
      }
      
      // Gera o trailer do lote
      const trailerLote = gerarTrailerLote({
        numero_lote: quantidadeLotes,
        quantidade_registros: quantidadeRegistros,
        somatoria_valores: lote.pagamentos.reduce((total, pagamento) => {
          if (pagamento.funcionario) {
            return total + pagamento.funcionario.valor;
          } else if (pagamento.favorecido && pagamento.dados) {
            return total + pagamento.dados.valor;
          } else if (pagamento.tributo) {
            return total + pagamento.tributo.valor;
          }
          return total;
        }, 0)
      });
      linhas.push(trailerLote);
      quantidadeRegistros++;
    }
    
    // Gera o trailer do arquivo
    const trailerArquivo = gerarTrailerArquivo({
      quantidade_lotes: quantidadeLotes,
      quantidade_registros: quantidadeRegistros + 1 // Inclui o próprio trailer
    });
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
 * @param {Array} params.pagamentos - Lista de pagamentos
 * @param {string} params.codigo_banco - Código do banco (opcional, padrão '033')
 * @param {string} params.tipo_servico - Tipo de serviço (opcional, padrão '30')
 * @param {string} params.forma_pagamento - Forma de pagamento (opcional, padrão '01')
 * @param {string} params.finalidade_lote - Finalidade do lote (opcional)
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
    finalidade_lote = '101' // Folha Mensal como padrão
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
  let numero_registro = 1;
  let somatoriaValores = 0;
  const linhas = [];

  try {
    // Gera header do lote
    const headerLote = gerarHeaderLote({
      empresa,
      numero_lote,
      codigo_banco,
      tipo_servico,
      forma_pagamento,
      finalidade_lote
    });
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
        numero_registro,
        funcionario,
        valor: pagamento.valor,
        data_pagamento: pagamento.data_pagamento,
        codigo_banco
      });
      linhas.push(segmentoP);
      numero_registro++;
      somatoriaValores += pagamento.valor;

      // Gera segmento Q
      const segmentoQ = gerarSegmentoQ({
        numero_lote,
        numero_registro,
        funcionario,
        codigo_banco
      });
      linhas.push(segmentoQ);
      numero_registro++;

      // Gera segmento R
      const segmentoR = gerarSegmentoR({
        numero_lote,
        numero_registro,
        funcionario
      });
      linhas.push(segmentoR);
      numero_registro++;
    }

    // Gera trailer do lote
    const trailerLote = gerarTrailerLote({
      numero_lote,
      numero_registro,
      somatoria_valores: somatoriaValores,
      codigo_banco
    });
    linhas.push(trailerLote);

    return {
      linhas,
      numero_registro,
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

/**
 * Gera o trailer do lote
 * @param {Object} params - Parâmetros do trailer
 * @param {number} params.numero_lote - Número do lote
 * @param {number} params.numero_registro - Número do registro
 * @param {number} params.somatoria_valores - Somatória dos valores
 * @param {string} params.codigo_banco - Código do banco (opcional, padrão '033')
 * @returns {string} Linha do trailer do lote
 */
function gerarTrailerLote(params) {
  const {
    numero_lote,
    numero_registro,
    somatoria_valores,
    codigo_banco = '033'
  } = params;

  // Validações básicas
  if (!numero_lote) {
    throw new Error('Número do lote é obrigatório');
  }

  if (!numero_registro) {
    throw new Error('Número do registro é obrigatório');
  }

  if (somatoria_valores === undefined) {
    throw new Error('Somatória dos valores é obrigatória');
  }

  // Formata os campos
  const codigoBanco = codigo_banco.padStart(3, '0');
  const numeroLote = numero_lote.toString().padStart(4, '0');
  const numeroRegistro = numero_registro.toString().padStart(6, '0');
  const somatoriaValores = somatoria_valores.toString().padStart(18, '0');

  // Constrói o trailer do lote
  const trailerLote = [
    codigoBanco,                    // 1-3: Código do banco
    '0001',                         // 4-7: Lote de serviço
    '5',                            // 8-8: Tipo de registro
    ' '.repeat(9),                  // 9-17: Uso exclusivo FEBRABAN/CNAB
    numeroRegistro,                 // 18-23: Quantidade de registros
    somatoriaValores,               // 24-41: Somatória dos valores
    ' '.repeat(199)                 // 42-240: Uso exclusivo FEBRABAN/CNAB
  ].join('');

  if (trailerLote.length !== 240) {
    throw new Error('Trailer do lote deve ter 240 posições');
  }

  return trailerLote;
}

module.exports = {
  gerarArquivoCNAB240,
  processarLoteFornecedores,
  processarLoteBoletos,
  processarLotePIX,
  processarLoteTributos,
  processarLoteSalarios
};
