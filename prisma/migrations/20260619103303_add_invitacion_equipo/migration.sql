-- CreateTable
CREATE TABLE "InvitacionEquipo" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitacionEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitacionEquipo_token_key" ON "InvitacionEquipo"("token");

-- AddForeignKey
ALTER TABLE "InvitacionEquipo" ADD CONSTRAINT "InvitacionEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

