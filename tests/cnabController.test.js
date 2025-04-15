const {
  gerarArquivoFornecedores,
  gerarArquivoBoletos,
  gerarArquivoSalarios,
  gerarArquivoTributos,
  gerarArquivoPIX,
  gerarArquivoPersonalizado
} = require('../src/controllers/cnabController');
const { SERVICE_TYPES, PAYMENT_FORMS } = require('../src/config/constants');

// Mock do cnabService
jest.mock('../src/services/cnab240/cnabService', () => ({
  gerarArquivoCNAB240: jest.fn().mockResolvedValue({
    arquivo: 'arquivo.rem',
    caminho: '/caminho/arquivo.rem',
    quantidade_lotes: 1,
    quantidade_registros: 10,
    tamanho_bytes: 2400
  })
}));

describe('CNAB Controller', () => {
  const dadosEmpresa = {
    tipo_inscricao: '2',
    inscricao_numero: '12345678901234',
    codigo_convenio: '123456',
    agencia: '1234',
    conta: '12345678',
    dac: '9',
    nome: 'EMPRESA TESTE',
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      complemento: 'SALA 1',
      cidade: 'SAO PAULO',
      cep: '12345678',
      estado: 'SP'
    }
  };

  const pagamento = {
    nome: 'FUNCIONARIO TESTE',
    cpf: '12345678901',
    banco: '033',
    agencia: '1234',
    conta: '12345678',
    dac: '9',
    valor: 1000.50
  };

  const mockReq = {
    body: {
      empresa: dadosEmpresa,
      pagamentos: [pagamento]
    }
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gerarArquivoFornecedores', () => {
    it('deve gerar arquivo CNAB para fornecedores com sucesso', async () => {
      await gerarArquivoFornecedores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoFornecedores(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    });
  });

  describe('gerarArquivoBoletos', () => {
    it('deve gerar arquivo CNAB para boletos com sucesso', async () => {
      await gerarArquivoBoletos(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoBoletos(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    });
  });

  describe('gerarArquivoSalarios', () => {
    it('deve gerar arquivo CNAB para salários com sucesso', async () => {
      await gerarArquivoSalarios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoSalarios(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    });
  });

  describe('gerarArquivoTributos', () => {
    it('deve gerar arquivo CNAB para tributos com sucesso', async () => {
      await gerarArquivoTributos(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoTributos(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    });
  });

  describe('gerarArquivoPIX', () => {
    it('deve gerar arquivo CNAB para PIX com sucesso', async () => {
      await gerarArquivoPIX(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoPIX(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa e array de pagamentos são obrigatórios.'
      });
    });
  });

  describe('gerarArquivoPersonalizado', () => {
    it('deve gerar arquivo CNAB personalizado com sucesso', async () => {
      const reqPersonalizado = {
        body: {
          ...mockReq.body,
          tipo_servico: SERVICE_TYPES.FORNECEDORES,
          forma_pagamento: PAYMENT_FORMS.CREDITO_CC
        }
      };

      await gerarArquivoPersonalizado(reqPersonalizado, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Arquivo CNAB 240 gerado com sucesso',
        arquivo: 'arquivo.rem',
        caminho: '/caminho/arquivo.rem',
        estatisticas: {
          quantidade_lotes: 1,
          quantidade_registros: 10,
          tamanho_bytes: 2400
        }
      });
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const reqInvalido = { body: {} };
      await gerarArquivoPersonalizado(reqInvalido, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos. Empresa, array de pagamentos, tipo_servico e forma_pagamento são obrigatórios.'
      });
    });
  });
}); 