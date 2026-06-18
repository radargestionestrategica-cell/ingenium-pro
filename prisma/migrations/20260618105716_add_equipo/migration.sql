-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "equipoId" TEXT,
ADD COLUMN     "rolEquipo" TEXT NOT NULL DEFAULT 'miembro';

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'team',
    "propietarioId" TEXT NOT NULL,
    "limiteMiembros" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

