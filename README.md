# agrogest-api

![CI](https://github.com/smarianglc/agrogest-api/actions/workflows/ci.yml/badge.svg)

API REST fictícia de um ERP agro (AgroGest), usada como sistema testado no portfólio de QA.
Toda a empresa, regras e dados são fictícios.

## Versão atual: 0.1.0

Acesso, perfis e troca de fazenda (RN-01 a RN-04, RN-21) e estoque de insumos (RN-05 a RN-07).
Documentação OpenAPI em `/docs`.

## Como rodar

Requisitos: Docker Desktop.

A partir do código:

    docker compose up --build -d --wait
    docker compose exec api npx prisma db seed

A partir da imagem publicada:

    docker compose -f docker-compose.yml -f docker-compose.ghcr.yml up -d --wait
    docker compose exec api npx prisma db seed

Swagger: http://localhost:3000/docs

## Bugs propositais

A API tem defeitos plantados para provar que a suíte de testes os encontra.
Ligue com `BUGS_ENABLED=true` (todos) ou `BUGS_ENABLED=BUG-01` (um específico).

| ID | Regra | Defeito |
| --- | --- | --- |
| BUG-01 | RN-01 | Listagem de insumos ignora o filtro de fazenda |

Os testes que detectam cada bug ficam no repositório `agrogest-qa`.
