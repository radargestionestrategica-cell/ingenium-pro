-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "consultasIaUsadas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consultasIaResetEn" TIMESTAMP(3);
