-- CreateTable
CREATE TABLE "ActivoTelemetria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoActivo" TEXT NOT NULL,
    "geometriaJson" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivoTelemetria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturaTelemetria" (
    "id" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "magnitud" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "hash" TEXT,

    CONSTRAINT "LecturaTelemetria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivoTelemetria" ADD CONSTRAINT "ActivoTelemetria_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivoTelemetria" ADD CONSTRAINT "ActivoTelemetria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaTelemetria" ADD CONSTRAINT "LecturaTelemetria_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "ActivoTelemetria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaTelemetria" ADD CONSTRAINT "LecturaTelemetria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
