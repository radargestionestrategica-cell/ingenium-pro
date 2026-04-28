# integrar-exportar.ps1
# INGENIUM PRO v8.1 — Ejecutar desde radar-app: .\integrar-exportar.ps1

$importLine = "import { publicarResultado } from '@/components/ResultadoContexto';"

$archivos = @(
  @{ nombre="ModuloPetroleo.tsx"; tipo="MAOP" },
  @{ nombre="ModuloHidraulica.tsx"; tipo="HIDRAULICA" },
  @{ nombre="ModuloGeotecnia.tsx"; tipo="GEOTECNIA" },
  @{ nombre="ModuloSoldadura.tsx"; tipo="SOLDADURA" },
  @{ nombre="ModuloMMO.tsx"; tipo="MMO" },
  @{ nombre="ModuloCivil.tsx"; tipo="ESTRUCTURAL" },
  @{ nombre="ModuloVialidad.tsx"; tipo="VIALIDAD" },
  @{ nombre="ModuloRepresas.tsx"; tipo="REPRESAS" },
  @{ nombre="ModuloMineria.tsx"; tipo="MINERIA" },
  @{ nombre="ModuloTermica.tsx"; tipo="TERMAL" },
  @{ nombre="ModuloArquitectura.tsx"; tipo="ESTRUCTURAL" },
  @{ nombre="ModuloCanerias.tsx"; tipo="HIDRAULICA" },
  @{ nombre="ModuloPerforacion.tsx"; tipo="PERFORACION" },
  @{ nombre="ModuloElectricidad.tsx"; tipo="ELECTRICIDAD"},
  @{ nombre="ModuloValvulas.tsx"; tipo="VALVULAS" }
)

$ok = 0
$skip = 0

foreach ($m in $archivos) {
  $path = "components\" + $m.nombre
  $tipo = $m.tipo

  if (-not (Test-Path $path)) {
    Write-Host "No encontrado: $path" -ForegroundColor Yellow
    $skip++
    continue
  }

  $c = Get-Content $path -Raw -Encoding UTF8

  if ($c -match "publicarResultado") {
    Write-Host "Ya integrado: $($m.nombre)" -ForegroundColor Cyan
    $ok++
    continue
  }

  # Agregar import despues de 'use client'
  $c = $c.Replace("'use client';", "'use client';" + [Environment]::NewLine + $importLine)

  # Reemplazar setRes(r) con setRes(r) + publicarResultado
  $publicar = "publicarResultado({ tipo: '" + $tipo + "', parametros: {} as Record<string,unknown>, resultado: r as Record<string,unknown> })"
  $c = $c.Replace("setRes(r);", "setRes(r); " + $publicar + ";")

  Set-Content -Path $path -Value $c -Encoding UTF8 -NoNewline
  Write-Host "Integrado: $($m.nombre)" -ForegroundColor Green
  $ok++
}

Write-Host ""
Write-Host "Integrados: $ok | Saltados: $skip" -ForegroundColor Cyan
Write-Host "Siguiente: npm run build" -ForegroundColor Yellow
