-- AlterTable
ALTER TABLE "Equipo" DROP COLUMN "limiteMiembros",
DROP COLUMN "plan",
DROP COLUMN "propietarioId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "rolEquipo";

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

