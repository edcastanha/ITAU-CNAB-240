# Lista de Tarefas - API REST para Pagamentos via CNAB 240 (SISPAG Itaú)

## Análise de Requisitos e Documentação
- [x] Analisar o Manual CNAB 240 SISPAG para entender a estrutura dos arquivos
- [x] Documentar os requisitos principais do projeto
- [ ] Revisar e documentar estrutura/campos do Header de Arquivo (Registro 0)
- [ ] Revisar e documentar estrutura/campos do Trailer de Arquivo (Registro 9)
- [ ] Revisar e documentar estrutura/campos do Header de Lote (Registro 1 - Foco em Fornecedores/Salários)
- [ ] Revisar e documentar estrutura/campos do Trailer de Lote (Registro 5 - Foco em Fornecedores/Salários)
- [ ] Detalhar estrutura/campos do Segmento A (Pagamentos Crédito C/C, DOC, TED, PIX)
- [ ] Detalhar estrutura/campos do Segmento B (Dados complementares PIX e Aviso)
- [ ] Detalhar estrutura/campos do Segmento J (Pagamento de Títulos/Boletos)
- [ ] Detalhar estrutura/campos do Segmento J-52 (Dados complementares de Títulos/Boletos)
- [ ] Detalhar Segmentos N e O (Tributos)

## Arquitetura do Projeto
- [x] Definir e criar a estrutura de pastas do projeto (controllers, services, utils, config, etc.)
- [x] Escolher e configurar o framework da API (Express.js)
- [x] Definir modelos de dados iniciais para a requisição da API
- [x] Definir estruturas/interfaces internas para representar os dados dos Segmentos CNAB

## Configuração do Ambiente de Desenvolvimento
- [x] Inicializar o projeto Node.js (`package.json`)
- [x] Instalar dependências base (framework, typescript, linter, formatter)
- [x] Configurar scripts básicos no `package.json` (start, dev, lint, build)
- [x] Inicializar e configurar repositório Git (`.gitignore`)

## Funções Utilitárias
- [x] Implementar função `formatNumeric(value, length)` (padding com zeros à esquerda)
- [x] Implementar função `formatAlpha(value, length)` (uppercase, padding com brancos à direita)
- [x] Implementar função `formatDate(date)` (formato DDMMAAAA)
- [x] Implementar função `formatValue(value, decimals)` (formato numérico com decimais implícitos)
- [x] Escrever testes unitários para as funções de formatação

## Implementação do Core - Header e Trailer de Arquivo
- [x] Implementar módulo/serviço para gerar a linha do Header de Arquivo (Registro 0)
- [x] Implementar módulo/serviço para gerar a linha do Trailer de Arquivo (Registro 9)
- [x] Escrever testes unitários para Header/Trailer de Arquivo

## Implementação - Pagamento de Fornecedores
- [x] Implementar módulo/serviço para gerar Header de Lote (Registro 1) para Serviço 20 (Fornecedores)
- [x] Implementar lógica para calcular e gerar Trailer de Lote (Registro 5)
- [x] Implementar módulo/serviço para mapear dados para os campos do Segmento A
- [x] Implementar função para gerar a linha formatada do Segmento A
- [x] Implementar módulo/serviço para mapear dados para os campos do Segmento B
- [x] Implementar função para gerar a linha formatada do Segmento B
- [x] Escrever testes unitários para Segmentos A e B

## Integração - Arquivo CNAB Básico
- [x] Criar um serviço/orquestrador para receber os dados de um lote de pagamentos
- [x] Implementar a ordem correta de geração dos registros
- [x] Implementar a atualização dos contadores e somatórias nos Trailers
- [ ] Escrever teste de integração para gerar um arquivo completo

## Implementação - Pagamento de Títulos (Boletos)
- [x] Adaptar/criar Header de Lote para Serviço 20, Forma 30/31
- [x] Garantir que o Trailer de Lote funcione corretamente com os totais
- [x] Implementar módulo/serviço para mapear dados para os campos do Segmento J
- [x] Implementar função para gerar a linha formatada do Segmento J
- [x] Implementar módulo/serviço para mapear dados para os campos do Segmento J-52
- [x] Implementar função para gerar a linha formatada do Segmento J-52
- [x] Escrever testes unitários para Segmentos J e J-52
- [ ] Adaptar o orquestrador para suportar lotes de Pagamento de Títulos
- [ ] Escrever teste de integração para gerar um arquivo com lote de pagamento de boletos

## API REST - Endpoint para Fornecedores
- [x] Definir a rota e o método HTTP para pagamentos de fornecedores
- [x] Implementar o controller da API para receber a requisição HTTP
- [x] Definir o schema de validação do payload da requisição
- [x] Implementar a lógica de validação no controller ou middleware
- [x] Integrar o endpoint com a lógica de geração CNAB existente
- [x] Implementar a resposta HTTP com o arquivo gerado
- [x] Implementar tratamento de erros centralizado
- [x] Configurar framework de teste de API
- [x] Escrever testes automatizados para o endpoint

## Implementação - Pagamento de Salários
- [x] Adaptar/criar a lógica para gerar o Header de Lote para Serviço 30
- [x] Garantir que o cálculo de totais no Trailer de Lote esteja correto
- [x] Adaptar ou reutilizar os módulos/serviços de geração dos Segmentos A e B
- [x] Implementar módulos/serviços para os Segmentos C, D, E, F (Holerite)
- [ ] Adaptar o serviço orquestrador para incluir os Segmentos opcionais
- [ ] Escrever testes de integração para gerar um arquivo com lote de salários

## API REST - Endpoint para Salários
- [ ] Definir e implementar a rota da API para pagamentos de salários
- [ ] Definir e implementar a validação do payload, incluindo campos opcionais
- [ ] Integrar o controller com o serviço orquestrador para o fluxo de salários
- [ ] Escrever testes de API para o endpoint de salários

## Implementação - Pagamento de Tributos
- [x] Adaptar/criar a lógica para gerar o Header de Lote para Serviço 22
- [x] Garantir que o cálculo de totais no Trailer de Lote esteja correto
- [x] Implementar módulo/serviço para o Segmento O (Tributos com código de barras)
- [x] Implementar módulo/serviço para o Segmento N (Tributos sem código de barras)
- [x] Implementar módulo/serviço para os Segmentos B e W (opcionais)
- [ ] Adaptar o serviço orquestrador para identificar o tipo de tributo
- [ ] Escrever testes de integração para gerar arquivos com lotes de tributos

## API REST - Endpoint para Tributos
- [ ] Definir e implementar a rota da API para pagamentos de tributos
- [ ] Definir e implementar a validação do payload para tributos
- [ ] Integrar o controller com o serviço orquestrador para o fluxo de tributos
- [ ] Escrever testes de API para o endpoint de tributos

## Implementação - Pagamento PIX
- [ ] Adaptar a lógica de geração de Header/Trailer de Arquivo para PIX
- [ ] Adaptar/criar a lógica para gerar o Header de Lote específico para PIX
- [ ] Adaptar os módulos/serviços dos Segmentos A e B para PIX Transferência
- [ ] Implementar módulos/serviços para os Segmentos J e J-52 PIX (QR Code)
- [ ] Adaptar o serviço orquestrador para gerar um arquivo contendo apenas lotes PIX
- [ ] Escrever testes de integração para gerar arquivos PIX completos

## API REST - Endpoints para PIX
- [ ] Definir e implementar as rotas da API para pagamentos PIX
- [ ] Definir e implementar a validação dos payloads específicos para cada tipo de PIX
- [ ] Integrar os controllers com a lógica do serviço orquestrador para PIX
- [ ] Escrever testes de API para os endpoints PIX

## Documentação e Infraestrutura
- [x] Documentar a API usando Swagger/OpenAPI
- [x] Criar documentação de uso da API
- [x] Documentar requisitos de infraestrutura para implementação em produção
- [x] Criar scripts de implantação e configuração
