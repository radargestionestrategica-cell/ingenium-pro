"use client";

import { useState } from "react";

export default function BienvenidaModal() {
  // Lazy init: lee localStorage solo en cliente (typeof window evita error SSR)
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('ip_bienvenida_vista');
  });

  const handleComenzar = () => {
    localStorage.setItem("ip_bienvenida_vista", "1");
    setIsVisible(false);
  };

  // Si no debe ser visible o ya se cerró, no renderiza nada en el DOM
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Contenedor principal del modal */}
      <div
        className="w-full max-w-lg rounded-xl border border-[#E8A020]/40 shadow-2xl p-8"
        style={{ backgroundColor: "#020609" }}
      >
        {/* Cabecera / Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="text-[#E8A020] text-4xl sm:text-5xl font-extrabold mb-2 tracking-widest flex items-center gap-3">
            INGENIUM PRO <span className="text-3xl sm:text-4xl font-normal">Ω</span>
          </div>
          <h2 className="text-white text-xl sm:text-2xl font-semibold text-center mt-2 tracking-wide">
            Bienvenido a INGENIUM PRO
          </h2>
        </div>

        {/* Pasos operativos */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 transition-colors hover:border-[#E8A020]/30">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-[#E8A020] text-[#020609] font-bold text-lg">
              1
            </div>
            <div>
              <p className="text-gray-200 font-medium text-lg">Elegí un módulo</p>
              <p className="text-gray-400 text-sm mt-1">Seleccioná un módulo del panel izquierdo: Petróleo/MAOP, Hidráulica, Cañerías, Soldadura y más.</p>
            </div>
          </div>
         
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 transition-colors hover:border-[#E8A020]/30">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-[#E8A020] text-[#020609] font-bold text-lg">
              2
            </div>
            <div>
              <p className="text-gray-200 font-medium text-lg">Cargá tus datos y calculá</p>
              <p className="text-gray-400 text-sm mt-1">Ingresá los parámetros técnicos y obtené el resultado con semáforo de riesgo y la normativa aplicada.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 transition-colors hover:border-[#E8A020]/30">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-[#E8A020] text-[#020609] font-bold text-lg">
              3
            </div>
            <div>
              <p className="text-gray-200 font-medium text-lg">Exportá y verificá</p>
              <p className="text-gray-400 text-sm mt-1">Generá PDF con QR, Excel o DXF. La auditoría IA cruza módulos y detecta riesgos que un cálculo aislado no ve.</p>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleComenzar}
          className="w-full py-4 rounded-lg bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-xl tracking-wider transition-all duration-200 shadow-lg shadow-green-900/40"
        >
          COMENZAR
        </button>
      </div>
    </div>
  );
} 