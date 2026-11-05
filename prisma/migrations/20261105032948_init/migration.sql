-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'AGRONOMO', 'FINANCEIRO');

-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('SEMENTE', 'FERTILIZANTE', 'DEFENSIVO');

-- CreateEnum
CREATE TYPE "UnidadeInsumo" AS ENUM ('KG', 'L', 'SC');

-- CreateTable
CREATE TABLE "Fazenda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "areaTotalHa" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insumo" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaInsumo" NOT NULL,
    "unidade" "UnidadeInsumo" NOT NULL,
    "saldo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "custoMedio" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estoqueMinimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaNota" (
    "id" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "numeroNota" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "dataEmissao" DATE NOT NULL,
    "numeroParcelas" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntradaNota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_fazendaId_idx" ON "Usuario"("fazendaId");

-- CreateIndex
CREATE INDEX "Insumo_fazendaId_idx" ON "Insumo"("fazendaId");

-- CreateIndex
CREATE INDEX "EntradaNota_fazendaId_idx" ON "EntradaNota"("fazendaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insumo" ADD CONSTRAINT "Insumo_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaNota" ADD CONSTRAINT "EntradaNota_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaNota" ADD CONSTRAINT "EntradaNota_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
