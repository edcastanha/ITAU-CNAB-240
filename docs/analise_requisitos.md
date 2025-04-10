# Análise de Requisitos - API REST para Pagamentos via CNAB 240 (SISPAG Itaú)

## Introdução

Este documento apresenta a análise dos requisitos para o desenvolvimento de uma API REST para geração de arquivos de remessa CNAB 240, compatível com o SISPAG do Itaú. A análise é baseada no Manual Técnico SISPAG CNAB 240 (versão 086, atualização de 05.05.2022) e nas tarefas do JIRA fornecidas.

## Objetivo do Projeto

Desenvolver uma API REST em JavaScript para geração de arquivos de remessa CNAB 240, compatível com os seguintes tipos de pagamento:
- Fornecedores
- Salários
- Tributos
- Diversos

E as seguintes formas de pagamento:
- Crédito em Conta Corrente
- DOC
- TED
- PIX (Transferência e QR Code)
- Boletos
- Tributos com e sem código de barras

## Estrutura do Arquivo CNAB 240

Conforme o manual técnico, cada arquivo CNAB 240 é composto por:
- Um Header de Arquivo (Registro 0)
- Um ou mais Lotes de Serviço
- Um Trailer de Arquivo (Registro 9)

Cada Lote de Serviço é constituído por:
- Um Header de Lote (Registro 1)
- Registros de Detalhe (Registro 3) - Segmentos específicos para cada forma de pagamento
- Um Trailer de Lote (Registro 5)

Importante: Um lote de serviço só pode conter pagamentos de um único tipo e uma única forma.

### Observação sobre PIX
Os lotes de serviços de pagamentos na forma de PIX devem ser enviados obrigatoriamente em arquivo separado das demais formas de pagamento.

## Segmentos por Forma de Pagamento

### Pagamento através de Cheque, OP, DOC, TED, PIX Transferência ou crédito em conta corrente:
- Segmento A (Obrigatório)
- Segmento B (Opcional para avisos, obrigatório para PIX Transferência no modelo "Chave")
- Segmento C (Opcional para Demonstrativo de Pagamentos)
- Segmentos D, E, F (Opcionais para Holerite/Informe de Rendimentos)
- Segmento Z (Opcional - apenas no arquivo retorno)

### Liquidação de títulos (boletos) e QR Codes:
- Segmento J (Obrigatório)
- Segmento J-52 (Obrigatório)
- Segmento J-52 PIX (Obrigatório para PIX QR Code)
- Segmento B (Opcional)
- Segmento C (Opcional)
- Segmento Z (Opcional - apenas no arquivo retorno)

### Pagamento de Concessionárias e Tributos com código de barras:
- Segmento O (Obrigatório)
- Segmento Z (Opcional - apenas no arquivo retorno)

### Pagamento de Tributos sem código de barras e FGTS:
- Segmento N (Obrigatório)
- Segmento B (Opcional)
- Segmento W (Opcional para GARE-SP ICMS)
- Segmento Z (Opcional - apenas no arquivo retorno)

## Formato dos Campos

Os campos nos registros CNAB 240 são apresentados em dois formatos principais:

### Alfanumérico (picture X):
- Alinhados à esquerda com brancos à direita
- Preferencialmente em maiúsculas
- Evitar caracteres especiais e acentuação
- Campos não utilizados devem ser preenchidos com brancos

### Numérico (picture 9):
- Alinhados à direita com zeros à esquerda
- Campos não utilizados devem ser preenchidos com zeros

### Vírgula assumida (picture V):
- Indica a posição da vírgula dentro de um campo numérico
- Exemplo: num campo com picture "9(5)V9(2)", o número "876,54" será representado por "0087654"

## Tipos de Pagamento e Formas de Pagamento

O manual técnico apresenta uma matriz de tipos de pagamento e formas de pagamento possíveis, incluindo:

### Tipos de Pagamento:
- Salários
- Dividendos
- Juros sobre Debêntures
- Despesas de Viajantes
- Representantes Vendedores
- Fornecedores
- Benefícios
- Sinistro de Seguro
- Fundos de Investimentos
- Diversos
- Tributos

### Formas de Pagamento:
- Conta Corrente (Mesmo/Outro Titular)
- Conta Poupança
- Cheque Pagamento
- DOC (C/D)
- TED (Mesmo/Outro Titular)
- Ordem de Pagamento
- Boletos (Itaú/Outros Bancos)
- Tributos diversos (DARF, GPS, GARE, GNRE, FGTS, etc.)
- PIX Transferência
- PIX QR Code

## Prazos para Envio dos Arquivos

O manual também especifica os prazos mínimos para envio dos arquivos, que variam conforme a forma de pagamento. Esta informação é importante para a documentação da API.
