-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_fazendaId_fkey";

-- DropIndex
DROP INDEX "Usuario_fazendaId_idx";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "fazendaId",
DROP COLUMN "perfil";

-- CreateTable
CREATE TABLE "Vinculo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vinculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vinculo_fazendaId_idx" ON "Vinculo"("fazendaId");

-- CreateIndex
CREATE UNIQUE INDEX "Vinculo_usuarioId_fazendaId_key" ON "Vinculo"("usuarioId", "fazendaId");

-- AddForeignKey
ALTER TABLE "Vinculo" ADD CONSTRAINT "Vinculo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinculo" ADD CONSTRAINT "Vinculo_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

