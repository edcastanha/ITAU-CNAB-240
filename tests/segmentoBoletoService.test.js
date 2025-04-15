/**
 * Testes unitários para o serviço de geração de Segmentos J e J-52 CNAB 240
 */

const { 
  gerarSegmentoJ, 
  gerarSegmentoJ52,
  gerarSegmentoJ52PIX
} = require('../src/services/cnab240/segmentoBoletoService');
const { BANK_CODES, INSCRIPTION_TYPES } = require('../src/config/constants');

describe('Segmento Boleto Service', () => {
  const dadosFavorecido = {
    nome: 'FAVORECIDO TESTE',
    cpf: '12345678901',
    banco: '033',
    agencia: '1234',
    conta: '12345678',
    dac: '9',
    valor: 2000.00,
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      complemento: 'SALA 1',
      cidade: 'SAO PAULO',
      cep: '12345678',
      estado: 'SP'
    }
  };

  const dadosBoleto = {
    valor: 2000.00,
    data_vencimento: '20240101',
    seu_numero: '123456',
    data_emissao: '20231201',
    data_desconto: '20231215',
    valor_desconto: 100.00,
    valor_abatimento: 50.00,
    valor_mora: 10.00,
    valor_multa: 20.00,
    codigo_protesto: '1',
    prazo_protesto: '5',
    codigo_baixa: '1',
    prazo_baixa: '30'
  };

  describe('gerarSegmentoJ', () => {
    it('deve gerar segmento J com sucesso', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: dadosFavorecido,
        dados_boleto: dadosBoleto
      };

      const result = gerarSegmentoJ(params);

      expect(result).toHaveLength(240);
      expect(result).toContain(BANK_CODES.SANTANDER);
      expect(result).toContain(dadosFavorecido.nome);
      expect(result).toContain(dadosBoleto.valor.toString());
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1
      };

      expect(() => gerarSegmentoJ(params))
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o Segmento J');
    });
  });

  describe('gerarSegmentoJ52', () => {
    it('deve gerar segmento J52 com sucesso', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1,
        favorecido: dadosFavorecido,
        dados_boleto: dadosBoleto
      };

      const result = gerarSegmentoJ52(params);

      expect(result).toHaveLength(240);
      expect(result).toContain(BANK_CODES.SANTANDER);
      expect(result).toContain(dadosBoleto.data_vencimento);
      expect(result).toContain(dadosBoleto.valor.toString());
    });

    it('deve lançar erro se parâmetros obrigatórios não forem fornecidos', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 1
      };

      expect(() => gerarSegmentoJ52(params))
        .toThrow('Parâmetros obrigatórios não fornecidos para gerar o Segmento J52');
    });
  });

  describe('gerarSegmentoJ52PIX', () => {
    test('deve gerar um segmento J-52 PIX válido com 240 caracteres para pagamento via QR Code', () => {
      const params = {
        numero_lote: 1,
        numero_registro: 3,
        pix: {
          tipo_chave: 3, // CPF/CNPJ
          chave: '12345678901',
          tx_id: 'TX123456789012345',
          info_adicional: 'PAGAMENTO REFERENTE A FATURA 12345'
        }
      };

      const segmento = gerarSegmentoJ52PIX(params);
      
      // Verifica se o tamanho está correto
      expect(segmento.length).toBe(240);
      
      // Verifica alguns campos específicos
      expect(segmento.substring(0, 3)).toBe('341'); // Código do banco
      expect(segmento.substring(3, 7)).toBe('0001'); // Código do lote
      expect(segmento.substring(7, 8)).toBe('3'); // Tipo de registro
      expect(segmento.substring(8, 13)).toBe('00003'); // Número do registro
      expect(segmento.substring(13, 14)).toBe('J'); // Código do segmento
      expect(segmento.substring(17, 19)).toBe('52'); // Identificador do registro opcional
      expect(segmento.substring(19, 20)).toBe('3'); // Tipo de chave PIX
      expect(segmento.substring(20, 31)).toBe('12345678901'); // Chave PIX
    });

    test('deve lançar erro quando parâmetros obrigatórios não são fornecidos', () => {
      expect(() => {
        gerarSegmentoJ52PIX({});
      }).toThrow('Parâmetros obrigatórios não fornecidos');
    });
  });
});
