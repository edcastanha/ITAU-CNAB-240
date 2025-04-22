const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/server'); // Substitua pelo caminho do seu servidor

describe('Teste do endpoint CNAB', () => {
  it('deve gerar um arquivo CNAB equivalente ao exemplo', async () => {
    const response = await request(app)
      .post('/api/cnab/fornecedores') // Substitua pelo endpoint correto
      .send({
        empresa: {
          banco: '341',
          nome: 'EMPRESA TESTE',
          cnpj: '12345678000190',
        },
        pagamentos: [
          {
            favorecido: {
              nome: 'FORNECEDOR XYZ',
              cnpj: '98765432000198',
            },
            valor: 1000.50,
            data_pagamento: '2024-03-15',
          },
        ],
      });

    expect(response.status).toBe(200);

    const geradoPath = path.join(__dirname, '../output/arquivo_gerado.rem');
    const exemploPath = path.join(__dirname, '../exemplo_rem/exemplo_01.rem');

    const gerado = fs.readFileSync(geradoPath, 'utf8');
    const exemplo = fs.readFileSync(exemploPath, 'utf8');

    expect(gerado).toBe(exemplo);
  });
});