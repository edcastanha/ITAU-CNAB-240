# API CNAB 240

Este projeto implementa uma API para geração de arquivos CNAB 240 para diferentes tipos de pagamentos, incluindo:

- Pagamentos de Salários
- Pagamentos de Fornecedores
- Pagamentos de Boletos
- Pagamentos de Tributos
- Pagamentos via PIX

## Alterações Recentes

### Atualização dos Segmentos para Pagamentos de Salários

- Implementação dos segmentos P, Q e R para pagamentos de salários conforme o padrão CNAB 240 para o Banco Santander.
- O segmento P contém informações como banco, agência, conta e valor do pagamento.
- O segmento Q contém informações do favorecido, como nome, CPF e endereço.
- O segmento R contém informações complementares, como valores de descontos e tributos.

### Otimização da Estrutura do Código

- Remoção de funções duplicadas e arquivos redundantes
- Organização clara dos módulos de serviço para melhor separação de responsabilidades:
  - `headerService.js`: Funções para gerar header e trailer do arquivo
  - `loteService.js`: Funções para gerar header e trailer de lotes
  - `segmentoService.js`: Segmentos A, B e C (fornecedores)
  - `segmentoSalarioService.js`: Segmentos P, Q e R (salários)
  - `segmentoBoletoService.js`: Segmentos J e J-52 (boletos)
  - `segmentoTributoService.js`: Segmentos N, O e W (tributos)

### Validações e Tratamento de Erros

- Adição de validações detalhadas para garantir que todos os dados obrigatórios sejam fornecidos
- Implementação de tratamento de erros consistente em todas as funções
- Verificação de tipos e formatos de dados para evitar problemas na geração dos arquivos

### Processamento Flexível de Pagamentos

- Suporte para múltiplos tipos de pagamento em um único arquivo
- Processamento de cada tipo de pagamento com os segmentos adequados
- Cálculo correto de somatórias de valores e contadores de registros

## Estrutura do Código

```
src/
  ├── config/
  │   └── constants.js          # Constantes e enumerações para o CNAB 240
  ├── services/
  │   └── cnab240/
  │       ├── cnabService.js    # Serviço principal para gerar arquivos CNAB
  │       ├── headerService.js  # Geração de header e trailer do arquivo
  │       ├── loteService.js    # Geração de header e trailer de lotes
  │       ├── segmentoService.js         # Segmentos A, B e C (fornecedores)
  │       ├── segmentoSalarioService.js  # Segmentos P, Q e R (salários)
  │       ├── segmentoBoletoService.js   # Segmentos J e J-52 (boletos)
  │       └── segmentoTributoService.js  # Segmentos N, O e W (tributos)
  └── utils/
      └── formatters.js         # Funções para formatação de dados
```

## Códigos de Banco Suportados

- 033 - Banco Santander
- 341 - Banco Itaú
- 001 - Banco do Brasil
- 104 - Caixa Econômica Federal
- 237 - Banco Bradesco
- (outros bancos conforme definido em constants.js)

## Uso do Serviço CNAB

```javascript
// Exemplo de geração de arquivo CNAB para pagamentos de salários
const resultado = await gerarArquivoCNAB240({
  empresa: {
    tipo_inscricao: '2',           // 2 = CNPJ
    inscricao_numero: '12345678901234',
    nome: 'EMPRESA ABC LTDA',
    agencia: '12345',
    conta: '123456789012',
    dac: '1'
  },
  lotes: [
    {
      tipo_servico: '30',          // 30 = Pagamento de Salários
      forma_pagamento: '01',       // 01 = Crédito em Conta
      pagamentos: [
        {
          funcionario: {
            nome: 'JOAO DA SILVA',
            cpf: '12345678901',
            banco: {
              codigo: '033',       // Santander
              agencia: '12345',
              conta: '123456789',
              dac: '1'
            },
            valor: 1234.56,
            data_pagamento: '20240612'
          }
        }
      ]
    }
  ]
}, 'output/arquivo.rem');
``` 