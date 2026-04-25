/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Calculo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Calculo" ADD COLUMN     "activoNombre" TEXT,
ADD COLUMN     "alerta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alertaMsg" TEXT,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "moduloId" TEXT,
ADD COLUMN     "normativa" TEXT,
ADD COLUMN     "proyectoId" TEXT,
ADD COLUMN     "submodulo" TEXT;

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "industria" TEXT NOT NULL DEFAULT 'Petróleo / Gas',
    "fluido" TEXT,
    "presion_bar" DOUBLE PRECISION,
    "temp_c" DOUBLE PRECISION,
    "nps" TEXT,
    "material" TEXT,
    "norma" TEXT NOT NULL DEFAULT 'ASME B31.8',
    "H2S_ppm" DOUBLE PRECISION DEFAULT 0,
    "zona_elec" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'Argentina',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calculo_hash_key" ON "Calculo"("hash");

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculo" ADD CONSTRAINT "Calculo_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
