const { gerarSegmentoN, gerarSegmentoO, gerarSegmentoW } = require('../../src/services/cnab240/segmentoTributoService');

describe('segmentoTributoService', () => {
  const tributoDarfTeste = {
    tipo: 'DARF',
    codigo_receita: '1234',
    tipo_inscricao: '2', // CNPJ
    inscricao_numero: '12345678901234',
    periodo_apuracao: '31052023',
    referencia: '123456789012345',
    valor_principal: 1000.00,
    valor_multa: 100.00,
    valor_juros_encargos: 50.00,
    data_vencimento: '20230615',
    data_pagamento: '20230615'
  };

  const tributoBarrasTeste = {
    tipo: 'GARE',
    codigo_barras: '85660000001046000851152',
    data_vencimento: '20230615',
    data_pagamento: '20230615',
    valor: 1046.00
  };

  describe('gerarSegmentoN', () => {
    it('deve gerar um segmento N válido para DARF', () => {
      const numeroLote = 1;
      const numeroRegistro = 2;

      const segmento = gerarSegmentoN(numeroLote, numeroRegistro, tributoDarfTeste);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('N'); // Código do segmento (N)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(17, 19)).toBe('02'); // Tipo de tributo (02 = DARF)
      expect(segmento.substring(19, 23)).toBe('1234'); // Código da receita
      expect(segmento.substring(23, 24)).toBe('2'); // Tipo de inscrição
      expect(segmento.substring(24, 38)).toBe('12345678901234'); // Número de inscrição
      expect(segmento.substring(38, 46)).toBe('31052023'); // Período de apuracao
      expect(segmento.substring(46, 61)).toBe('123456789012345'); // Referência
      expect(segmento.substring(61, 70)).toBe('0000100000'); // Valor principal
      expect(segmento.substring(70, 79)).toBe('0000010000'); // Valor multa
      expect(segmento.substring(79, 88)).toBe('0000005000'); // Valor juros
      expect(segmento.substring(88, 96)).toBe('20230615'); // Data de vencimento
      expect(segmento.substring(96, 104)).toBe('20230615'); // Data de pagamento
    });

    it('deve gerar um segmento N válido para tributos com código de barras', () => {
      const numeroLote = 1;
      const numeroRegistro = 3;

      const segmento = gerarSegmentoN(numeroLote, numeroRegistro, tributoBarrasTeste);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('N'); // Código do segmento (N)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(17, 19)).toBe('11'); // Tipo de tributo (11 = GARE)
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoN(null, 2, tributoDarfTeste)).toThrow();

      // Sem número do registro
      expect(() => gerarSegmentoN(1, null, tributoDarfTeste)).toThrow();

      // Sem dados do tributo
      expect(() => gerarSegmentoN(1, 2, null)).toThrow();
    });

    it('deve lançar erro quando dados do tributo são incompletos', () => {
      const tributoIncompleto = {
        tipo: 'DARF',
        // Faltando campos obrigatórios
      };

      expect(() => gerarSegmentoN(1, 2, tributoIncompleto)).toThrow();
    });
  });

  describe('gerarSegmentoO', () => {
    it('deve gerar um segmento O válido para tributo com código de barras', () => {
      const numeroLote = 1;
      const numeroRegistro = 2;

      const segmento = gerarSegmentoO(numeroLote, numeroRegistro, tributoBarrasTeste);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('O'); // Código do segmento (O)
      expect(segmento.substring(14, 15)).toBe('0'); // Tipo de movimento (0 = inclusão)
      expect(segmento.substring(17, 61)).toBe('85660000001046000851152'.padEnd(44, ' ')); // Código de barras
      expect(segmento.substring(77, 85)).toBe('20230615'); // Data de pagamento
      expect(segmento.substring(85, 100)).toBe('000000000104600'); // Valor do pagamento
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoO(null, 2, tributoBarrasTeste)).toThrow();

      // Sem número do registro
      expect(() => gerarSegmentoO(1, null, tributoBarrasTeste)).toThrow();

      // Sem dados do tributo
      expect(() => gerarSegmentoO(1, 2, null)).toThrow();
    });

    it('deve lançar erro quando tributo não possui código de barras', () => {
      const tributoSemCodBarras = {
        tipo: 'GARE',
        // Sem código de barras
        data_vencimento: '20230615',
        data_pagamento: '20230615',
        valor: 1046.00
      };

      expect(() => gerarSegmentoO(1, 2, tributoSemCodBarras)).toThrow();
    });
  });

  describe('gerarSegmentoW', () => {
    it('deve gerar um segmento W válido para GARE', () => {
      const numeroLote = 1;
      const numeroRegistro = 2;

      const gare = {
        tipo_identificacao: '1', // IE
        identificacao: '123456789',
        inscricao_estadual: '123456789',
        origem: '1',
        valor_receita: 800.00,
        valor_juros: 30.00,
        valor_multa: 20.00,
        valor_atualizacao: 10.00,
        data_vencimento: '20230615',
        data_pagamento: '20230615'
      };

      const segmento = gerarSegmentoW(numeroLote, numeroRegistro, gare);

      // Verificações básicas
      expect(segmento).toBeDefined();
      expect(segmento.length).toBe(240);

      // Verifica campos específicos
      expect(segmento.substring(0, 3)).toBe('033'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Número do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro (3 = detalhe)
      expect(segmento.substring(8, 13)).toBe('00002'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('W'); // Código do segmento (W)
      expect(segmento.substring(18, 19)).toBe('1'); // Tipo de identificação
      expect(segmento.substring(19, 32)).toBe('000123456789'.padEnd(13, ' ')); // Identificação
      expect(segmento.substring(32, 47)).toBe('123456789'.padEnd(15, ' ')); // Inscrição estadual
      expect(segmento.substring(55, 70)).toBe('000000000080000'); // Valor receita
      expect(segmento.substring(70, 85)).toBe('000000000003000'); // Valor juros
      expect(segmento.substring(85, 100)).toBe('000000000002000'); // Valor multa
      expect(segmento.substring(100, 115)).toBe('000000000001000'); // Valor atualização
      expect(segmento.substring(115, 123)).toBe('20230615'); // Data de vencimento
      expect(segmento.substring(123, 131)).toBe('20230615'); // Data de pagamento
    });

    it('deve lançar erro quando parâmetros obrigatórios estão ausentes', () => {
      // Sem número do lote
      expect(() => gerarSegmentoW(null, 2, {
        tipo_identificacao: '1',
        identificacao: '123456789',
        data_vencimento: '20230615',
        data_pagamento: '20230615'
      })).toThrow();

      // Sem número do registro
      expect(() => gerarSegmentoW(1, null, {
        tipo_identificacao: '1',
        identificacao: '123456789',
        data_vencimento: '20230615',
        data_pagamento: '20230615'
      })).toThrow();

      // Sem dados do GARE
      expect(() => gerarSegmentoW(1, 2, null)).toThrow();
    });

    it('deve lançar erro quando dados do GARE são incompletos', () => {
      const gareIncompleto = {
        // Sem campos obrigatórios
        valor_receita: 800.00
      };

      expect(() => gerarSegmentoW(1, 2, gareIncompleto)).toThrow();
    });
  });
}); 