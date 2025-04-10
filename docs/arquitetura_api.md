# Arquitetura da API REST para Pagamentos via CNAB 240 (SISPAG Itaú)

## Visão Geral

A API REST para geração de arquivos de remessa CNAB 240 será desenvolvida em JavaScript utilizando Node.js. A arquitetura será baseada em princípios de design modular, separação de responsabilidades e testabilidade.

## Tecnologias Escolhidas

- **Linguagem**: JavaScript (Node.js)
- **Framework Web**: Express.js
- **Validação de Dados**: Joi
- **Testes**: Jest com Supertest
- **Documentação da API**: Swagger/OpenAPI
- **Logging**: Winston
- **Formatação de Código**: ESLint + Prettier

## Estrutura de Diretórios

```
cnab240-api/
├── src/
│   ├── config/                 # Configurações da aplicação
│   │   ├── app.js              # Configuração do Express
│   │   └── logger.js           # Configuração de logs
│   │
│   ├── controllers/            # Controladores da API REST
│   │   ├── fornecedorController.js
│   │   ├── salarioController.js
│   │   ├── tributoController.js
│   │   ├── pixController.js
│   │   └── index.js
│   │
│   ├── middlewares/            # Middlewares do Express
│   │   ├── errorHandler.js     # Tratamento centralizado de erros
│   │   ├── requestValidator.js # Validação de requisições
│   │   └── index.js
│   │
│   ├── models/                 # Modelos de dados/schemas
│   │   ├── cnab/               # Modelos específicos CNAB 240
│   │   │   ├── arquivo.js      # Modelo para Header/Trailer de Arquivo
│   │   │   ├── lote.js         # Modelo para Header/Trailer de Lote
│   │   │   └── segmentos/      # Modelos para cada segmento
│   │   │       ├── segmentoA.js
│   │   │       ├── segmentoB.js
│   │   │       ├── segmentoJ.js
│   │   │       ├── segmentoJ52.js
│   │   │       ├── segmentoN.js
│   │   │       ├── segmentoO.js
│   │   │       └── ...
│   │   │
│   │   ├── request/            # Schemas de validação de requisição
│   │   │   ├── fornecedorSchema.js
│   │   │   ├── salarioSchema.js
│   │   │   ├── tributoSchema.js
│   │   │   ├── pixSchema.js
│   │   │   └── ...
│   │   │
│   │   └── index.js
│   │
│   ├── services/               # Lógica de negócio
│   │   ├── cnab/               # Serviços específicos CNAB
│   │   │   ├── arquivoService.js  # Geração de Header/Trailer de Arquivo
│   │   │   ├── loteService.js     # Geração de Header/Trailer de Lote
│   │   │   ├── segmentoService.js # Geração de Segmentos
│   │   │   └── orquestradorService.js # Orquestração da geração do arquivo
│   │   │
│   │   ├── pagamentos/         # Serviços específicos por tipo de pagamento
│   │   │   ├── fornecedorService.js
│   │   │   ├── salarioService.js
│   │   │   ├── tributoService.js
│   │   │   ├── pixService.js
│   │   │   └── ...
│   │   │
│   │   └── index.js
│   │
│   ├── utils/                  # Funções utilitárias
│   │   ├── formatters.js       # Formatadores CNAB (numérico, alfanumérico, data, valor)
│   │   ├── validators.js       # Validadores de dados
│   │   ├── constants.js        # Constantes e enumerações
│   │   └── index.js
│   │
│   ├── routes/                 # Definição de rotas da API
│   │   ├── fornecedorRoutes.js
│   │   ├── salarioRoutes.js
│   │   ├── tributoRoutes.js
│   │   ├── pixRoutes.js
│   │   └── index.js
│   │
│   └── app.js                  # Ponto de entrada da aplicação
│
├── tests/                      # Testes automatizados
│   ├── unit/                   # Testes unitários
│   │   ├── utils/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── integration/            # Testes de integração
│   │   ├── cnab/
│   │   └── ...
│   │
│   └── api/                    # Testes de API (end-to-end)
│       ├── fornecedor.test.js
│       ├── salario.test.js
│       └── ...
│
├── docs/                       # Documentação
│   ├── analise_requisitos.md
│   ├── arquitetura_api.md
│   └── infraestrutura.md
│
├── .eslintrc.js               # Configuração do ESLint
├── .prettierrc                # Configuração do Prettier
├── .gitignore                 # Configuração do Git
├── jest.config.js             # Configuração do Jest
├── package.json               # Dependências e scripts
└── README.md                  # Documentação principal
```

## Fluxo de Dados

1. **Requisição HTTP**: O cliente envia uma requisição HTTP para um dos endpoints da API.
2. **Validação**: Os middlewares validam a requisição e seus parâmetros.
3. **Controller**: O controller apropriado recebe a requisição validada.
4. **Serviço de Pagamento**: O serviço específico para o tipo de pagamento processa os dados.
5. **Orquestrador CNAB**: O orquestrador coordena a geração do arquivo CNAB 240.
6. **Serviços CNAB**: Os serviços específicos CNAB geram os registros necessários.
7. **Resposta HTTP**: O arquivo CNAB gerado é enviado como resposta ao cliente.

## Endpoints da API

### Pagamento de Fornecedores
- `POST /api/remessa/fornecedores/credito` - Pagamento via crédito em conta
- `POST /api/remessa/fornecedores/doc` - Pagamento via DOC
- `POST /api/remessa/fornecedores/ted` - Pagamento via TED
- `POST /api/remessa/fornecedores/boleto` - Pagamento de boletos

### Pagamento de Salários
- `POST /api/remessa/salarios` - Pagamento de salários (com opção para holerite)

### Pagamento de Tributos
- `POST /api/remessa/tributos/codigo-barras` - Pagamento de tributos com código de barras
- `POST /api/remessa/tributos/sem-codigo-barras` - Pagamento de tributos sem código de barras

### Pagamento PIX
- `POST /api/remessa/pix/transferencia` - Pagamento via PIX Transferência
- `POST /api/remessa/pix/qrcode` - Pagamento via PIX QR Code

## Modelos de Dados

### Modelo de Requisição para Pagamento de Fornecedores (Crédito em Conta)

```javascript
{
  "empresa": {
    "tipo_inscricao": 2, // 1=CPF, 2=CNPJ
    "inscricao_numero": "12345678901234",
    "agencia": "1234",
    "conta": "123456789",
    "dac": "1",
    "nome": "EMPRESA EXEMPLO LTDA"
  },
  "controle": {
    "lote": 1,
    "identificacao_lancamento": "FORN" // Identificação no extrato
  },
  "pagamentos": [
    {
      "favorecido": {
        "tipo_inscricao": 2, // 1=CPF, 2=CNPJ
        "inscricao_numero": "98765432101234",
        "nome": "FORNECEDOR EXEMPLO LTDA",
        "banco": "341",
        "agencia": "4321",
        "conta": "987654321",
        "dac": "9"
      },
      "pagamento": {
        "data": "2025-04-10", // YYYY-MM-DD
        "valor": 1500.75,
        "nosso_numero": "123456789",
        "seu_numero": "987654321",
        "documento": "NF12345"
      },
      "informacoes": {
        "finalidade_doc": "01", // Código de finalidade DOC/TED
        "finalidade_ted": "00001", // Código de finalidade TED
        "codigo_instrucao": "00", // Código de instrução para movimento
        "emissao_aviso": "0", // 0=Não emite, 1=Emite
        "mensagem": "PAGAMENTO REFERENTE A NF 12345"
      }
    }
    // Mais pagamentos...
  ]
}
```

### Modelo de Requisição para Pagamento de Salários

```javascript
{
  "empresa": {
    // Dados da empresa (similar ao modelo de fornecedores)
  },
  "controle": {
    "lote": 1,
    "identificacao_lancamento": "SALA" // Identificação no extrato
  },
  "pagamentos": [
    {
      "funcionario": {
        "tipo_inscricao": 1, // 1=CPF
        "inscricao_numero": "12345678901",
        "nome": "FUNCIONARIO EXEMPLO",
        "banco": "341",
        "agencia": "1234",
        "conta": "123456789",
        "dac": "1"
      },
      "pagamento": {
        "data": "2025-04-10",
        "valor": 3500.00,
        "seu_numero": "987654321"
      },
      "holerite": { // Opcional - para Segmentos C, D, E, F
        "mes_ano_referencia": "042025", // MMAAAA
        "centro_custo": "DEPTO TI",
        "info_complementar": "SALARIO MENSAL",
        "detalhes": [
          { "codigo": "0001", "descricao": "SALARIO BASE", "valor": 3000.00, "indicador_dc": "C" },
          { "codigo": "0002", "descricao": "BONUS", "valor": 500.00, "indicador_dc": "C" }
          // Mais itens do holerite...
        ]
      }
    }
    // Mais pagamentos...
  ]
}
```

## Tratamento de Erros

A API implementará um sistema centralizado de tratamento de erros que fornecerá respostas consistentes em caso de falhas:

```javascript
{
  "status": "error",
  "code": "VALIDATION_ERROR", // Código de erro
  "message": "Erro de validação nos dados de entrada",
  "details": [
    {
      "field": "pagamentos[0].favorecido.inscricao_numero",
      "message": "CNPJ inválido"
    }
    // Mais detalhes de erro...
  ]
}
```

## Considerações de Segurança

- Implementação de validação rigorosa de entrada para prevenir injeção de dados maliciosos
- Uso de HTTPS para todas as comunicações
- Implementação de autenticação e autorização (JWT, OAuth2, etc.)
- Sanitização de dados de saída para prevenir exposição de informações sensíveis
- Implementação de rate limiting para prevenir ataques de força bruta

## Próximos Passos

1. Configurar o ambiente de desenvolvimento
2. Implementar as funções utilitárias de formatação CNAB
3. Desenvolver os serviços core para geração de Header e Trailer de Arquivo
4. Implementar os serviços para geração de Segmentos específicos
5. Desenvolver os endpoints da API REST
6. Implementar validação e tratamento de erros
7. Criar testes automatizados
8. Documentar a API usando Swagger/OpenAPI
