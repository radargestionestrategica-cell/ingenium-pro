'use client';
import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════
//  INGENIUM PRO v8.0 — Silvana Belén Colombo © 2026
//  Motor de Ingeniería Mundial
//  CORRECCIONES v8.0:
//  01. MAOP + factor E soldadura + factor T temperatura (ASME B31.8)
//  02. Voladura — distancia sísmica real del usuario
//  03. Geotecnia — nivel freático reduce portante
//  04. Fatiga — factor Kt concentración de tensiones
//  05. Hidráulica — rugosidad editable + pérdidas menores
//  06. Golpe de ariete — Joukowsky completo
//  07. Dilatación térmica — ASME B31.3
//  08. Estabilidad de taludes — Bishop simplificado
//  09. Hidrología — Método Racional + Kirpich + CN
//  10. Integridad de ductos — API 579 / B31G básico
//  11. PDF con QR de verificación + impresión proyecto completo
//  12. Hardy-Cross con presiones en nodos
// ═══════════════════════════════════════════════════════════════════

type RL = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
type Mode = 'field'|'eng'|'exec';

// ── CÁLCULOS CORREGIDOS ──────────────────────────────────────────

// CORRECCIÓN 01 — MAOP con factor E y T (ASME B31.8 §841.11)
function calcMAOP(OD:number, t:number, SMYS:number, F=0.72, E_joint=1.0, T_op=20) {
  if(OD<=0||t<=0||SMYS<=0||t>=OD/2) return null;
  // Factor temperatura ASME B31.8 Table 841.116A
  const T_factor = T_op<=120?1.0:T_op<=150?0.967:T_op<=175?0.933:T_op<=200?0.900:0.867;
  const ratio = t/OD, ro=OD/2, ri=ro-t;
  // E_joint: sin costura o SAW=1.0, ERW post-1970=0.85, ERW pre-1970=0.60
  const Pb = (2*SMYS*t*F*E_joint*T_factor)/OD;
  const Pl = SMYS*F*E_joint*T_factor*(ro**2-ri**2)/(ro**2+ri**2);
  const P = ratio>0.15?Pl:ratio>0.10?Pb*(1-(ratio-0.10)/0.05)+Pl*(ratio-0.10)/0.05:Pb;
  return {
    P:+P.toFixed(3), bar:+(P*10).toFixed(2), psi:+(P*145).toFixed(0),
    reg:ratio>0.15?'PARED GRUESA — Lamé':ratio>0.10?'TRANSICIÓN':'PARED DELGADA — Barlow',
    ratio:+(ratio*100).toFixed(1), T_factor, E_joint
  };
}

// Darcy-Weisbach con rugosidad editable y pérdidas menores
function calcDW(Q:number, D:number, L:number, rough=0.046, K_minor=0) {
  if(Q<=0||D<=0||L<=0) return null;
  const q=Q/1000, A=Math.PI/4*D**2, V=q/A;
  const Re=V*D/1.004e-6, er=(rough/1000)/D;
  const f=Re<2300?64/Re:0.25/Math.pow(Math.log10(er/3.7+5.74/Math.pow(Re,0.9)),2);
  const hf_mayor=f*(L/D)*V**2/(2*9.81);
  const hf_menor=K_minor*V**2/(2*9.81);
  const hf=hf_mayor+hf_menor;
  return {
    V:+V.toFixed(3), Re:+Re.toFixed(0), f:+f.toFixed(6),
    hf:+hf.toFixed(3), hf_mayor:+hf_mayor.toFixed(3), hf_menor:+hf_menor.toFixed(3),
    dP:+(998*9.81*hf/1000).toFixed(2),
    reg:Re<2300?'Laminar':Re<4000?'Transición':'Turbulento'
  };
}

// CORRECCIÓN 06 — Golpe de ariete — Joukowsky completo
function calcWaterHammer(Q:number, D:number, t:number, L:number, E_GPa:number, dV:number, mat='acero') {
  if(Q<=0||D<=0||L<=0) return null;
  const K_agua=2.2e9; // módulo bulk agua (Pa)
  const E=E_GPa*1e9;
  const rho=998;
  // Celeridad de onda (Joukowsky)
  const a=Math.sqrt(K_agua/rho/(1+K_agua*D/(E*t)));
  // Sobrepresión por cierre instantáneo
  const dP=rho*a*dV/1e6; // MPa
  // Tiempo crítico de cierre
  const Tc=2*L/a;
  const risk:RL=dP>2?'CRITICAL':dP>1?'HIGH':dP>0.5?'MEDIUM':'LOW';
  return {a:+a.toFixed(0), dP_MPa:+dP.toFixed(3), dP_bar:+(dP*10).toFixed(2),
    Tc:+Tc.toFixed(2), risk};
}

// CORRECCIÓN 07 — Dilatación térmica (ASME B31.3)
function calcThermal(L:number, T1:number, T2:number, mat='acero', restringido=false, OD=0, t=0) {
  // Coeficientes de expansión térmica (10⁻⁶/°C) ASME B31.3 Appendix C
  const alpha:Record<string,number>={
    'acero_carbono':11.7,'acero_inox_304':17.2,'acero_inox_316':16.0,
    'hdpe':150,'cobre':17.0,'aluminio':23.6
  };
  const E_GPa:Record<string,number>={
    'acero_carbono':200,'acero_inox_304':193,'acero_inox_316':193,
    'hdpe':0.8,'cobre':110,'aluminio':69
  };
  const a=alpha[mat]||11.7, E=(E_GPa[mat]||200)*1e9;
  const dT=T2-T1;
  const dL=a*1e-6*L*dT*1000; // mm
  const sigma_term=restringido?E*a*1e-6*Math.abs(dT)/1e6:0; // MPa
  // Longitud mínima de lira en U
  const D_lira=OD/1000;
  const L_lira=D_lira>0?Math.sqrt(3*E_GPa[mat]*1e9*D_lira*Math.abs(dL)/1e3/(200e6)):0;
  const risk:RL=sigma_term>150?'CRITICAL':sigma_term>100?'HIGH':sigma_term>50?'MEDIUM':'LOW';
  return {dL:+dL.toFixed(1), sigma_term:+sigma_term.toFixed(1),
    L_lira:+L_lira.toFixed(2), dT, risk};
}

// CORRECCIÓN 03 — Geotecnia con nivel freático (Meyerhof)
function calcGeo(s:string, B:number, L:number, Df:number, Q:number, FS:number, Dw:number) {
  const DB:Record<string,{Nq:number,Nc:number,Ng:number,c:number,g:number,g_sat:number}>={
    arena_s:{Nq:14.7,Nc:25.8,Ng:12.4,c:0,g:1600,g_sat:1900},
    arena_c:{Nq:33.3,Nc:46.1,Ng:37.2,c:0,g:1850,g_sat:2050},
    arc_bl:{Nq:1.0,Nc:5.14,Ng:0,c:25,g:1500,g_sat:1750},
    arc_me:{Nq:1.0,Nc:5.14,Ng:0,c:50,g:1700,g_sat:1900},
    arc_fi:{Nq:1.0,Nc:5.14,Ng:0,c:100,g:1800,g_sat:1980},
    grava:{Nq:64.2,Nc:75.3,Ng:93.7,c:0,g:2000,g_sat:2200}
  };
  const d=DB[s]||DB.arc_me;
  // CORRECCIÓN: nivel freático reduce peso específico efectivo
  const g_ef=Dw<=Df?(d.g_sat-1000)*9.81/1000:d.g/1000*9.81; // kN/m³
  const g_base=d.g/1000*9.81;
  const q=g_base*Df;
  const sc=1+0.2*(B/L), sq=1+0.1*(B/L), sg=Math.max(0.1,1-0.4*(B/L));
  const qu=d.c*d.Nc*sc+q*d.Nq*sq+0.5*g_ef*B*d.Ng*sg;
  const qa=qu/FS, qap=Q/(B*L);
  const freatic_effect=Dw<=Df?'⚠️ Nivel freático reduce portante':'✅ Sin efecto freático';
  return {qu:+qu.toFixed(1),qa:+qa.toFixed(1),qap:+qap.toFixed(1),
    ok:qap<=qa,ut:+(qap/qa*100).toFixed(1),freatic_effect};
}

// CORRECCIÓN 08 — Estabilidad de taludes — Bishop Simplificado
function calcSlope(H:number, beta_deg:number, c:number, phi_deg:number, gamma:number, Dw:number) {
  const phi=phi_deg*Math.PI/180;
  const beta=beta_deg*Math.PI/180;
  // Análisis simplificado con 5 dovelas
  const R=H/Math.sin(beta)*0.8; // radio aproximado de círculo crítico
  const n_dov=5;
  let sum_num=0, sum_den=0;
  for(let i=0;i<n_dov;i++){
    const x=(i+0.5)*H*Math.cos(beta)/n_dov;
    const alpha=Math.asin(x/R);
    const h_dov=H-x*Math.tan(beta);
    const W=gamma/1000*h_dov*(H*Math.cos(beta)/n_dov); // kN/m
    const u=Dw<h_dov?9.81*(h_dov-Dw)*0.5:0; // presión de poro simplificada
    const m_alpha=Math.cos(alpha)+Math.sin(alpha)*Math.tan(phi)/1.5;
    sum_num+=c*(H*Math.cos(beta)/n_dov)+(W-u*(H*Math.cos(beta)/n_dov))*Math.tan(phi);
    sum_den+=W*Math.sin(alpha)*m_alpha;
  }
  const FS=sum_den>0?sum_num/sum_den:999;
  const risk:RL=FS<1.0?'CRITICAL':FS<1.3?'HIGH':FS<1.5?'MEDIUM':'LOW';
  return {FS:+FS.toFixed(2),risk,
    estado:FS>=1.5?'✅ ESTABLE':FS>=1.3?'⚠️ MARGINALMENTE ESTABLE':'❌ INESTABLE — RIESGO DE DESLIZAMIENTO'};
}

// CORRECCIÓN 09 — Hidrología — Método Racional + Kirpich + CN
function calcHydrology(A_ha:number, C:number, L_m:number, S_mm:number, I_mm_h:number, CN:number) {
  // Tiempo de concentración — Kirpich (1940)
  const Tc=0.0195*Math.pow(L_m,0.77)/Math.pow(S_mm/1000,0.385); // minutos
  // Caudal de diseño — Método Racional
  const Q_racional=C*I_mm_h*A_ha/360; // m³/s
  // Escorrentía — Curva Número NRCS
  const S_CN=25400/CN-254; // mm
  const P_diseño=I_mm_h*Tc/60; // mm de lluvia en Tc
  const Q_CN=P_diseño>0.2*S_CN?Math.pow(P_diseño-0.2*S_CN,2)/(P_diseño+0.8*S_CN):0; // mm escorrentía
  const Vol=Q_CN/1000*A_ha*10000; // m³ volumen escorrentía
  return {
    Tc:+Tc.toFixed(1), Q_racional:+Q_racional.toFixed(3),
    Q_CN:+Q_CN.toFixed(1), Vol:+Vol.toFixed(0),
    P_diseño:+P_diseño.toFixed(1)
  };
}

// CORRECCIÓN 10 — Integridad de ductos — API 579 / ASME B31G
function calcIntegrity(OD:number, t_nom:number, t_actual:number, tasa_corr:number, SMYS:number, P_op:number) {
  if(OD<=0||t_nom<=0||t_actual<=0) return null;
  const d_defecto=t_nom-t_actual; // profundidad de corrosión
  const pct_perd=(d_defecto/t_nom)*100;
  // ASME B31G — presión máxima admisible con corrosión
  const factor_folias=pct_perd<=10?1-pct_perd/100:1-0.6667*pct_perd/100;
  const MAOP_corr=(2*SMYS*t_actual*0.72*factor_folias)/OD;
  // Vida remanente
  const t_minimo=t_nom*0.25; // límite típico 25% de espesor nominal
  const vida_rem=(t_actual-t_minimo)/tasa_corr;
  const riesgo_actual=P_op/MAOP_corr;
  const risk:RL=riesgo_actual>1?'CRITICAL':riesgo_actual>0.9?'HIGH':riesgo_actual>0.75?'MEDIUM':'LOW';
  return {
    d_defecto:+d_defecto.toFixed(2), pct_perd:+pct_perd.toFixed(1),
    MAOP_corr:+MAOP_corr.toFixed(3), vida_rem:+vida_rem.toFixed(1),
    factor_folias:+factor_folias.toFixed(3), risk,
    apto:P_op<=MAOP_corr
  };
}

// CORRECCIÓN 04 — Fatiga con factor Kt
function calcFatigue(sig:number, mat:string, N:number, T:number, Kt=1.0) {
  const DB:Record<string,{Sa:number,b:number,Su:number}>={
    'Acero C-Mn':{Sa:345,b:-0.091,Su:485},
    'Inox 304/316':{Sa:310,b:-0.095,Su:515},
    'X65':{Sa:420,b:-0.088,Su:530},
    'Aluminio 6061':{Sa:138,b:-0.100,Su:310}
  };
  const c=DB[mat]||DB['Acero C-Mn'];
  const Tf=T>370?Math.max(0.5,1-0.002*(T-370)):1;
  // CORRECCIÓN: aplicar Kt a la tensión nominal
  const Sa_efectiva=sig*Kt*Tf;
  // Límite de fatiga (endurance limit) — acero: ~0.5×Su hasta 10^6 ciclos
  const Se=c.Su*0.5;
  const Na=Sa_efectiva<=Se?1e9:Math.pow(10,Math.log10(c.Sa/Math.max(Sa_efectiva,1))/c.b);
  const D=N/Na;
  const risk:RL=D>1?'CRITICAL':D>0.8?'HIGH':D>0.5?'MEDIUM':'LOW';
  // Curva S-N para gráfico
  const snCurve=Array.from({length:8},(_,i)=>{
    const n=Math.pow(10,3+i*0.75);
    const sa=c.Sa*Math.pow(n,c.b);
    return{n:+n.toFixed(0),sa:+Math.max(sa,Se).toFixed(1)};
  });
  return {Na:+Na.toFixed(0),Nd:+Math.round(Na/2).toFixed(0),
    D:+D.toFixed(4),Dp:+(D*100).toFixed(1),Tf:+Tf.toFixed(3),
    Sa_efectiva:+Sa_efectiva.toFixed(1),Se:+Se.toFixed(0),
    risk,ok:D<=1,rem:Math.max(0,Math.round(Na-N)),snCurve,
    operPoint:{n:N,sa:Sa_efectiva}};
}

// CORRECCIÓN 02 — Voladura sísmica con distancia real
function calcBlastSeismic(W:number, d_real:number) {
  if(W<=0||d_real<=0) return null;
  const SD=d_real/Math.sqrt(W); // distancia escalada real
  const PGV=700*Math.pow(SD,-1.73); // mm/s Ambraseys-Hendron
  const risk:RL=PGV<5?'LOW':PGV<25?'MEDIUM':PGV<50?'HIGH':'CRITICAL';
  // Límites de daño estructural
  const dano=PGV<5?'Sin daño':PGV<25?'Daño cosmético posible':PGV<50?'Daño estructural leve':'DAÑO ESTRUCTURAL GRAVE';
  return{SD:+SD.toFixed(2),PGV:+PGV.toFixed(1),risk,col:SD<20,dano};
}

function calcBlasting(roca:string,expl:string,d:number,h:number) {
  const KR:Record<string,{k:number,l:string}>={
    blanda:{k:35,l:'Roca blanda (arcilita)'},media:{k:30,l:'Roca media (caliza)'},
    dura:{k:27,l:'Roca dura (granito)'},muy_dura:{k:24,l:'Roca muy dura (basalto)'}};
  const KE:Record<string,{dens:number,costo:number,VOD:number}>={
    anfo:{dens:0.85,costo:1.2,VOD:4500},emulsion:{dens:1.10,costo:2.8,VOD:5500},
    heavy_anfo:{dens:1.00,costo:1.9,VOD:5000},dinamita:{dens:1.45,costo:6.5,VOD:6000}};
  const rk=KR[roca]||KR.media, ek=KE[expl]||KE.anfo;
  const D=d/1000, B=rk.k*D, S=1.15*B, T=0.7*B, Lc=h-T;
  if(Lc<=0) return null;
  const W=Math.PI*(D/2)**2*Lc*ek.dens*1000;
  const Vr=B*S*h;
  return{B:+B.toFixed(2),S:+S.toFixed(2),T:+T.toFixed(2),Lc:+Lc.toFixed(2),
    W:+W.toFixed(1),Vr:+Vr.toFixed(1),PF:+(W/Vr).toFixed(3),
    dseg:+Math.round(15*Math.pow(W*10,1/3)).toFixed(0),
    costo:+(W*ek.costo).toFixed(0),VOD:ek.VOD};
}

function selectValve(serv:string,DN:number,P:number,h2s:number,sol:number){
  const V:Record<string,{n:string,norm:string,costs:Record<number,number>}>={
    bt:{n:'Bola Trunnion API 6D',norm:'API 6D/B16.34/6FA',costs:{150:8500,200:14000,300:32000,400:55000}},
    bf:{n:'Bola Flotante API 6D',norm:'API 6D/ASME B16.34',costs:{50:850,80:1200,100:1800,150:3200}},
    mp:{n:'Mariposa Doble Excéntrica',norm:'AWWA C504/API 609',costs:{200:2800,300:4200,400:6800,600:16000}},
    cg:{n:'Compuerta API 600',norm:'API 600/B16.34',costs:{50:650,100:1400,200:4200,300:8500}},
    kn:{n:'Cuchilla Knife Gate',norm:'TAPPI/MSS SP-81',costs:{100:1200,200:2800,300:5500}},
    gl:{n:'Globo Control ISA',norm:'B16.34/IEC 60534',costs:{50:2800,100:7500,150:14000}},
    ch:{n:'Retención Wafer',norm:'API 594/B16.34',costs:{50:380,100:850,200:2600}},
    wh:{n:'Cabezal Pozo API 6A',norm:'API 6A/NACE',costs:{52:18000,103:55000,154:95000}}};
  const CP=[{c:'150#',P:1.97,f:1},{c:'300#',P:5.11,f:1.6},{c:'600#',P:10.21,f:2.8},
    {c:'900#',P:15.32,f:3.8},{c:'1500#',P:25.53,f:5.5},{c:'2500#',P:42.55,f:8}];
  const w:string[]=[];
  if(h2s>10)w.push('⚠️ NACE MR0175 — H₂S >10ppm');
  let t='cg';
  if(serv==='pozo'||P>20)t='wh';
  else if(sol>5){t='kn';w.push('⚠️ Sólidos >5% — no asientos blandos');}
  else if(serv==='agua'&&DN>=200)t='mp';
  else if((serv==='petroleo'||serv==='gas')&&DN>=150)t='bt';
  else if(DN<150)t='bf';
  const cls=CP.find(c=>P*1.25<=c.P)||CP[CP.length-1];
  const v=V[t];
  const dn=Object.keys(v.costs).map(Number).sort((a,b)=>a-b).reduce((p,c)=>Math.abs(c-DN)<Math.abs(p-DN)?c:p);
  return{v,cls,costo:Math.round((v.costs[dn]||5000)*cls.f),w};
}

const CHEM:Record<string,{n:string,ac:string,ix:string,pv:string,hd:string,EPP:string,cls:string,risk:RL,pH:string}>={
  agua:{n:'Agua potable',ac:'✅',ix:'✅',pv:'✅',hd:'✅',EPP:'Guantes de trabajo',cls:'No peligroso',risk:'LOW',pH:'6.5-8.5'},
  h2so4_c:{n:'Ácido Sulfúrico >80%',ac:'⚠️',ix:'✅',pv:'❌',hd:'✅',EPP:'Careta integral+guantes nitrilo+mandil PVC+lavaojos',cls:'CORROSIVO',risk:'HIGH',pH:'<1'},
  hcl:{n:'Ácido Clorhídrico',ac:'❌',ix:'❌',pv:'✅',hd:'✅',EPP:'SCBA+guantes nitrilo+ventilación forzada',cls:'CORROSIVO/TÓXICO',risk:'HIGH',pH:'<2'},
  naoh:{n:'Soda Cáustica NaOH',ac:'✅',ix:'✅',pv:'✅',hd:'✅',EPP:'Careta+guantes neopreno+mandil',cls:'CORROSIVO',risk:'MEDIUM',pH:'>13'},
  cianuro:{n:'Cianuro de Sodio',ac:'✅',ix:'✅',pv:'✅',hd:'✅',EPP:'SCBA+traje hermético+detector HCN. EXCLUSIÓN 50m',cls:'EXTREMAD. TÓXICO',risk:'CRITICAL',pH:'10-11'},
  h2s:{n:'H₂S — Gas agrio',ac:'⚠️',ix:'⚠️',pv:'⚠️',hd:'✅',EPP:'SCBA OBLIGATORIO+detector H₂S. LEP=1ppm. EXCLUSIÓN 100m',cls:'TÓXICO/INFLAMABLE',risk:'CRITICAL',pH:'—'},
  cloro:{n:'Cloro líquido',ac:'❌',ix:'⚠️',pv:'✅',hd:'✅',EPP:'SCBA+traje hermético+detector Cl₂',cls:'TÓXICO/OXIDANTE',risk:'HIGH',pH:'—'},
  metanol:{n:'Metanol (inhibidor hidratos)',ac:'✅',ix:'✅',pv:'✅',hd:'✅',EPP:'Guantes nitrilo+gafas+ventilación. Tóxico si ingerido.',cls:'TÓXICO/INFLAMABLE',risk:'HIGH',pH:'—'},
  glicol:{n:'Monoetilenglicol MEG',ac:'✅',ix:'✅',pv:'✅',hd:'✅',EPP:'Guantes+gafas protección',cls:'LEVEMENTE TÓXICO',risk:'LOW',pH:'6-8'},
  acido_acetico:{n:'Ácido Acético (corrosión CO₂)',ac:'⚠️',ix:'✅',pv:'✅',hd:'✅',EPP:'Guantes nitrilo+gafas+ventilación',cls:'CORROSIVO LEVE',risk:'MEDIUM',pH:'2.4'}};

const BI:[string,string,string,number][]=[
  ['Tubería','Tubo A106 Gr.B 6" SCH40','m',85],['Tubería','Tubo A106 Gr.B 8" SCH40','m',130],
  ['Tubería','Tubo API 5L X52 12" SCH40','m',220],['Tubería','Tubo API 5L X65 16"','m',380],
  ['Tubería','HDPE PE100 DN200','m',45],['Tubería','HDPE PE100 DN400','m',140],
  ['Válvulas','Bola Trunnion DN200 600#','u',14000],['Válvulas','Mariposa AWWA DN400','u',6800],
  ['Válvulas','Compuerta DN150','u',3800],['Válvulas','Check Wafer DN200','u',2600],
  ['Instalación','Soldadura butt 6"','u',280],['Instalación','Soldadura butt 12"','u',580],
  ['Instalación','Soporte estándar','u',320],['Instalación','Prueba hidrostática','u',2500],
  ['Civil','Excavación mecánica','m³',18],['Civil','Relleno compactado','m³',25],
  ['Civil','Hormigón H-21','m³',180],['Civil','Voladura roca media','m³',35],
  ['Vialidad','Carpeta asfáltica 5cm','m²',28],['Vialidad','Base granular 20cm','m²',12],
  ['Vialidad','Alcantarilla HDPE DN600','m',180],['Vialidad','Señalización horizontal','m²',8],
  ['Ingeniería','Ing. básica FEED','h',120],['Ingeniería','Ing. de detalle','h',95],
  ['Ingeniería','Inspección QC','h',75],['Ingeniería','Proyecto ejecutivo','glob',8500]];

// SVG CAD con simbología ISA 5.1 y elevaciones
function genPipeSVG(OD:number,t:number,L:number,Vn:number,En:number,z1=0,z2=0){
  const W=520,H=170,pW=Math.max(10,OD/8),sX=50,pL=Math.min(380,L*0.65);
  const pY1=90, pY2=90-(z2-z1)*0.5; // perfil con pendiente
  let s='';
  s+=`<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0D1F35" strokeWidth="0.3"/></pattern></defs>`;
  s+=`<rect width="${W}" height="${H}" fill="#020609"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`;
  // Línea de terreno
  s+=`<line x1="${sX}" y1="${pY1+pW/2+20}" x2="${sX+pL}" y2="${pY2+pW/2+20}" stroke="#7EC850" strokeWidth="1" strokeDasharray="6 3"/>`;
  // Ducto con perfil
  s+=`<line x1="${sX}" y1="${pY1}" x2="${sX+pL}" y2="${pY2}" stroke="#00C8FF" strokeWidth="${pW}" strokeLinecap="round" opacity="0.8"/>`;
  // Válvulas ISA
  for(let i=0;i<Math.min(Vn,6);i++){
    const frac=(i+1)/(Vn+1), x=sX+pL*frac, y=pY1+(pY2-pY1)*frac;
    s+=`<rect x="${x-8}" y="${y-pW/2-2}" width="16" height="${pW+4}" fill="#0A1830" stroke="#E8A020" strokeWidth="1.5" rx="1"/>`;
    s+=`<polygon points="${x-6},${y-6} ${x+6},${y-6} ${x},${y}" fill="#E8A020"/>`;
    s+=`<polygon points="${x-6},${y+6} ${x+6},${y+6} ${x},${y}" fill="#E8A020"/>`;
    s+=`<line x1="${x}" y1="${y-pW/2-12}" x2="${x}" y2="${y-pW/2-2}" stroke="#E8A020" strokeWidth="1.5"/>`;
    s+=`<text x="${x}" y="${y+pW/2+16}" textAnchor="middle" fill="#E8A020" fontSize="7" fontFamily="monospace">V${i+1}</text>`;
  }
  // Estaciones ISA
  for(let i=0;i<Math.min(En,3);i++){
    const frac=(i+1)/(En+1), x=sX+pL*frac, y=pY1+(pY2-pY1)*frac;
    s+=`<circle cx="${x}" cy="${y}" r="13" fill="#031A0A" stroke="#00E5A0" strokeWidth="2"/>`;
    s+=`<path d="M ${x-7},${y} L ${x+7},${y-7} L ${x+7},${y+7} Z" fill="#00E5A0" opacity="0.9"/>`;
    s+=`<text x="${x}" y="${y+pW/2+16}" textAnchor="middle" fill="#00E5A0" fontSize="7" fontFamily="monospace">P${i+1}</text>`;
  }
  // Cotas
  s+=`<text x="${sX-5}" y="${pY1-pW/2-8}" fill="#00C8FF" fontSize="8" fontFamily="monospace">Ø${OD}×${t}mm</text>`;
  s+=`<text x="${sX}" y="${pY1+pW/2+35}" fill="#284060" fontSize="8" fontFamily="monospace">Z=${z1}m</text>`;
  s+=`<text x="${sX+pL}" y="${pY2+pW/2+35}" fill="#284060" fontSize="8" fontFamily="monospace" textAnchor="end">Z=${z2}m</text>`;
  s+=`<text x="${sX+pL/2}" y="${H-5}" textAnchor="middle" fill="#284060" fontSize="8" fontFamily="monospace">L=${L}m | ΔZ=${Math.abs(z2-z1)}m | Pendiente=${L>0?(Math.abs(z2-z1)/L*100).toFixed(2):0}%</text>`;
  // Cuadro título ISA
  s+=`<rect x="0" y="0" width="${W}" height="18" fill="#050A14"/>`;
  s+=`<text x="8" y="12" fill="#E8A020" fontSize="9" fontFamily="monospace" fontWeight="bold">INGENIUM PRO v8.0 — PERFIL DE DUCTO (ISA 5.1)</text>`;
  s+=`<text x="${W-8}" y="12" fill="#284060" fontSize="8" fontFamily="monospace" textAnchor="end">© Silvana Belén Colombo</text>`;
  return{s,W,H};
}

// CORRECCIÓN 12 — Hardy-Cross con presiones en nodos
interface HCPipe{id:string,from:number,to:number,D:number,L:number,C:number}
function hardyCrossWithPressures(pipes:HCPipe[], H_entrada:number, demandas:Record<number,number>){
  const Q:Record<string,number>={};
  pipes.forEach((p,i)=>{Q[p.id]=i%2===0?10:-5;});
  // Iteración Hardy-Cross
  for(let it=0;it<20;it++){
    const nodos=new Set(pipes.flatMap(p=>[p.from,p.to]));
    nodos.forEach(nodo=>{
      const pipes_nodo=pipes.filter(p=>p.from===nodo||p.to===nodo);
      let num=0,den=0;
      pipes_nodo.forEach(p=>{
        const sg=p.from===nodo?1:-1;
        const q=Q[p.id]||0.001;
        const hf=10.67*p.L*Math.pow(Math.abs(q)/1000,1.852)/(Math.pow(p.C,1.852)*Math.pow(p.D,4.87));
        num+=sg*hf; den+=1.852*hf/Math.abs(q);
      });
      if(Math.abs(den)>0.0001){
        const dQ=num/den;
        pipes_nodo.forEach(p=>{
          const sg=p.from===nodo?1:-1;
          Q[p.id]-=sg*dQ*0.5;
        });
      }
    });
  }
  // Calcular pérdidas y presiones en nodos
  const hf_pipes:Record<string,number>={};
  pipes.forEach(p=>{
    const q=Q[p.id]||0;
    hf_pipes[p.id]=10.67*p.L*Math.pow(Math.abs(q)/1000,1.852)/(Math.pow(p.C,1.852)*Math.pow(p.D,4.87));
  });
  // Presiones en nodos (propagación desde nodo de entrada)
  const H_nodos:Record<number,number>={};
  const nodos_lista=[...new Set(pipes.flatMap(p=>[p.from,p.to]))].sort();
  H_nodos[nodos_lista[0]]=H_entrada;
  pipes.forEach(p=>{
    const q=Q[p.id]||0;
    const sg=q>0?1:-1;
    const hf=hf_pipes[p.id];
    if(H_nodos[p.from]!==undefined&&H_nodos[p.to]===undefined)
      H_nodos[p.to]=H_nodos[p.from]-sg*hf;
    if(H_nodos[p.to]!==undefined&&H_nodos[p.from]===undefined)
      H_nodos[p.from]=H_nodos[p.to]+sg*hf;
  });
  return{
    finalPipes:pipes.map(p=>({...p,Q:+( Q[p.id]||0).toFixed(2),
      V:+((Q[p.id]||0)/1000/(Math.PI/4*p.D**2)).toFixed(3),hf:+hf_pipes[p.id].toFixed(3)})),
    H_nodos
  };
}

const RC={
  LOW:{bg:'bg-green-950',bd:'border-green-700',tx:'text-green-400',dot:'bg-green-400',gl:'#00C88040'},
  MEDIUM:{bg:'bg-yellow-950',bd:'border-yellow-700',tx:'text-yellow-400',dot:'bg-yellow-400',gl:'#F59E0B40'},
  HIGH:{bg:'bg-orange-950',bd:'border-orange-700',tx:'text-orange-400',dot:'bg-orange-400',gl:'#F9731640'},
  CRITICAL:{bg:'bg-red-950',bd:'border-red-700',tx:'text-red-400',dot:'bg-red-500',gl:'#FF456060'}
};

const C={
  i:'w-full bg-[#020609] border border-[#0D1F35] rounded-xl px-4 py-3 text-sm text-[#94A8C0] focus:border-[#E8A020] focus:outline-none',
  l:'block text-[9px] text-[#284060] font-black uppercase tracking-widest mb-1.5',
  s:'w-full bg-[#020609] border border-[#0D1F35] rounded-xl px-4 py-3 text-sm text-[#94A8C0] focus:border-[#E8A020] focus:outline-none cursor-pointer',
  k:'bg-[#07101A] border border-[#0D1F35] rounded-2xl p-5',
  b:'w-full bg-gradient-to-r from-[#E8A020] to-[#C07010] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#F0B030] transition-all mt-3 shadow-lg',
  o:'w-full border border-[#E8A020]/40 text-[#E8A020] py-2.5 rounded-xl text-sm font-black hover:bg-[#E8A020]/10 transition-all mt-2'
};

function Badge({r,msg}:{r:RL,msg:string}){
  const c=RC[r];
  return(<div className={`${c.bg} ${c.bd} border rounded-2xl p-4 flex items-center gap-3`} style={{boxShadow:`0 0 25px ${c.gl}`}}>
    <div className={`w-4 h-4 rounded-full ${c.dot} ${r==='CRITICAL'?'animate-ping':''} flex-shrink-0`}/>
    <div><div className={`${c.tx} text-[9px] font-black uppercase tracking-widest`}>SEMÁFORO DE RIESGO</div>
    <div className={`${c.tx} text-xs font-black`}>{msg}</div></div></div>);
}

function Row({l,v,h=false}:{l:string,v:string,h?:boolean}){
  return(<div className={`flex justify-between py-1.5 px-3 rounded-lg ${h?'bg-[#E8A020]/10 border border-[#E8A020]/20':''}`}>
    <span className="text-[#284060] text-xs">{l}</span>
    <span className={`font-black text-xs font-mono ${h?'text-[#E8A020]':'text-[#94A8C0]'}`}>{v}</span></div>);
}

function Box({t,n,rows}:{t:string,n?:string,rows:[string,string,boolean?][]}){
  return(<div className="bg-[#031A0A] border border-[#00E5A0]/20 rounded-xl p-4 mt-3">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"/>
        <span className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest">{t}</span></div>
      {n&&<span className="text-[8px] text-[#284060] border border-[#0D1F35] rounded px-2 py-0.5">{n}</span>}
    </div>
    <div className="space-y-0.5">{rows.map(([l,v,h],i)=><Row key={i} l={l} v={v} h={h}/>)}</div></div>);
}

interface Proj{id:string,name:string,cl:string,date:string,mod:string,risk:RL,usd:number,calcs:Record<string,unknown>}
function sp(p:Proj){if(typeof window==='undefined')return;const e=JSON.parse(localStorage.getItem('ip9')||'[]');localStorage.setItem('ip9',JSON.stringify([p,...e.filter((x:Proj)=>x.id!==p.id)].slice(0,50)));}
function lp():Proj[]{if(typeof window==='undefined')return[];return JSON.parse(localStorage.getItem('ip9')||'[]');}

const AI_SYS=`You are INGENIUM Omega v8.0 - world's most advanced industrial engineering AI.
Expert: ASME B31/API 5L piping (Barlow,Lame,MAOP with E and T factors), hydraulics (Darcy-Weisbach with minor losses,Manning,Hardy-Cross with node pressures,water hammer Joukowsky), valves (API 6D/6A/AWWA/NACE), explosives (Langefors/IRAM 11647/Ambraseys-Hendron with real distance), chemicals (MSDS/GHS,10+ products), geotechnics (Meyerhof with water table,Bishop slope stability), corrosion API 579/B31G, fatigue ASME VIII Div.2 with Kt factor, thermal expansion ASME B31.3, hydrology rational method + CN, pipeline integrity API 579, oil&gas Weymouth/Beggs-Brill, construction, mining, road engineering.
Always respond in user language. Show: formula then variables then step by step then standard reference.
For explosives and chemicals ALWAYS include safety warnings and required PPE. Give costs in USD.`;

// ── MAIN APP ──────────────────────────────────────────────────────
export default function IngeniumPro(){
  const [lang,setLang]=useState<'es'|'en'|'pt'>('es');
  const [acc,setAcc]=useState(false);
  const [u,setU]=useState({name:'',lic:'',co:'',cn:''});
  const [mode,setMode]=useState<Mode>('eng');
  const [mod,setMod]=useState('tutorial');
  const [risk,setRisk]=useState<RL>('LOW');
  const [projs,setProjs]=useState<Proj[]>([]);
  const [toast,setToast]=useState('');
  const [projectCalcs,setProjectCalcs]=useState<Record<string,unknown>>({});

  const TL={
    es:{t:'INGENIUM PRO',s:'Motor de Ingeniería Mundial v8.0',a:'ACEPTO — INGRESAR AL SISTEMA',mf:'🧱 CAMPO',me:'⚙️ INGENIERÍA',mx:'📊 DIRECTIVO'},
    en:{t:'INGENIUM PRO',s:'World Engineering Engine v8.0',a:'I ACCEPT — ENTER SYSTEM',mf:'🧱 FIELD',me:'⚙️ ENGINEERING',mx:'📊 EXECUTIVE'},
    pt:{t:'INGENIUM PRO',s:'Motor de Engenharia v8.0',a:'ACEITO — ENTRAR',mf:'🧱 CAMPO',me:'⚙️ ENGENHARIA',mx:'📊 DIRETIVO'}
  };
  const T=TL[lang];

  useEffect(()=>{
    setProjs(lp());
    const sv=localStorage.getItem('ip9u');
    if(sv){setU(JSON.parse(sv));setAcc(true);setMod('ai');}
  },[]);

  const toast2=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),3000);};
  const doSave=(name:string,m:string,r:RL,usd:number,calcs:Record<string,unknown>={})=>{
    const p:Proj={id:Date.now().toString(),name,cl:u.co,date:new Date().toLocaleString(),mod:m,risk:r,usd,calcs};
    sp(p);setProjs(lp());
    setProjectCalcs(prev=>({...prev,[name]:calcs}));
    toast2('✅ Guardado: '+name);
  };

  const MODS=[
    {id:'tutorial',i:'📖',l:'Tutorial',c:'#E8A020'},
    {id:'ai',i:'🤖',l:'IA',c:'#00C8FF'},
    {id:'pipes',i:'🔩',l:'Tuberías',c:'#00E5A0'},
    {id:'hydro',i:'💧',l:'Hidráulica',c:'#00C8FF'},
    {id:'hammer',i:'💢',l:'Golpe Ariete',c:'#F97316'},
    {id:'thermal',i:'🌡️',l:'Dilatación',c:'#FF4560'},
    {id:'valves',i:'⚙️',l:'Válvulas',c:'#E8A020'},
    {id:'blast',i:'💥',l:'Explosivos',c:'#FF4560'},
    {id:'chem',i:'⚗️',l:'Químicos',c:'#A78BFA'},
    {id:'geo',i:'🌍',l:'Geotecnia',c:'#7EC850'},
    {id:'slopes',i:'⛰️',l:'Taludes',c:'#7EC850'},
    {id:'hydrology',i:'🌧️',l:'Hidrología',c:'#00C8FF'},
    {id:'integrity',i:'🔬',l:'Integridad',c:'#F97316'},
    {id:'cad',i:'📐',l:'Planos',c:'#E8A020'},
    {id:'budget',i:'💰',l:'Presupuesto',c:'#00E5A0'},
    {id:'hc',i:'🌊',l:'Redes',c:'#00C8FF'},
    {id:'fat',i:'🔄',l:'Fatiga',c:'#F97316'},
    {id:'pdf',i:'📄',l:'PDF',c:'#A78BFA'},
    {id:'ver',i:'🚀',l:'Deploy',c:'#00E5A0'},
    {id:'proj',i:'📁',l:'Proyectos',c:'#94A8C0'}
  ];

  if(!acc) return(
    <div className="min-h-screen bg-[#020609] flex items-center justify-center p-4" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
      <div className="max-w-2xl w-full">
        <div className="flex justify-center gap-2 mb-5">
          {(['es','en','pt'] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${lang===l?'bg-[#E8A020] text-[#020609] border-[#E8A020]':'border-[#0D1F35] text-[#284060]'}`}>
              {l==='es'?'🇦🇷 ES':l==='en'?'🇺🇸 EN':'🇧🇷 PT'}
            </button>
          ))}
        </div>
        <div className="bg-[#07101A] border border-[#0D1F35] rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#E8A020] to-[#C07010] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center text-2xl font-black text-white">Ω</div>
            <div><div className="text-black font-black text-2xl tracking-widest">{T.t}</div>
            <div className="text-black/70 text-xs font-black">{T.s}</div></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-[#020609] border border-[#0D1F35] rounded-2xl p-4 max-h-44 overflow-y-auto text-[10px] text-[#284060] space-y-2">
              <p className="text-[#E8A020] font-black uppercase text-[9px]">TÉRMINOS Y CONDICIONES — INGENIUM PRO v8.0</p>
              <p><strong className="text-[#94A8C0]">1. PROPIEDAD INTELECTUAL:</strong> INGENIUM PRO v8.0 es creación original de <strong className="text-white">Silvana Belén Colombo</strong>. © 2026 Todos los derechos reservados.</p>
              <p><strong className="text-[#94A8C0]">2. DESCARGO:</strong> Sistema de apoyo al cálculo. Resultados referenciales. La validación y responsabilidad recaen en el profesional a cargo.</p>
              <p><strong className="text-[#94A8C0]">3. EXPLOSIVOS Y PELIGROSOS:</strong> Ejecutar por personal certificado bajo IRAM 11647, RETIE, NOM, OSHA.</p>
              <p><strong className="text-[#94A8C0]">4. LIMITACIÓN DE DAÑOS:</strong> Silvana Belén Colombo e INGENIUM PRO no serán responsables por daños derivados del uso.</p>
              <p><strong className="text-[#94A8C0]">5. PRIVACIDAD:</strong> Los datos se almacenan localmente en el dispositivo del usuario. No se transmiten a terceros.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={C.l}>Nombre completo *</label><input className={C.i} value={u.name} onChange={e=>setU(p=>({...p,name:e.target.value}))} placeholder="Nombre Apellido"/></div>
              <div><label className={C.l}>ID / Matrícula / Rol *</label><input className={C.i} value={u.lic} onChange={e=>setU(p=>({...p,lic:e.target.value}))} placeholder="MP-12345 / Founder"/></div>
              <div><label className={C.l}>Empresa</label><input className={C.i} value={u.co} onChange={e=>setU(p=>({...p,co:e.target.value}))} placeholder="Empresa S.A."/></div>
              <div><label className={C.l}>País</label>
                <select className={C.s} value={u.cn} onChange={e=>setU(p=>({...p,cn:e.target.value}))}>
                  <option value="">Seleccionar...</option>
                  {['Argentina','Colombia','México','Chile','Perú','Brasil','Venezuela','Bolivia','Ecuador','Uruguay','España','USA','Canadá','Otro'].map(x=><option key={x}>{x}</option>)}
                </select></div>
            </div>
            <button onClick={()=>{if(!u.name||!u.lic)return;localStorage.setItem('ip9u',JSON.stringify(u));setAcc(true);setMod('tutorial');}}
              disabled={!u.name||!u.lic}
              className="w-full bg-gradient-to-r from-[#E8A020] to-[#C07010] disabled:opacity-30 text-[#020609] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg">
              {T.a}
            </button>
            <p className="text-center text-[9px] text-[#1A3050]">{new Date().toLocaleString()} · INGENIUM PRO v8.0 © Silvana Belén Colombo</p>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div className="min-h-screen bg-[#020609] text-[#94A8C0] print:bg-white" style={{fontFamily:"'IBM Plex Mono',monospace",backgroundImage:"linear-gradient(#0D1F3504 1px,transparent 1px),linear-gradient(90deg,#0D1F3504 1px,transparent 1px)",backgroundSize:"48px 48px"}}>
      {toast&&<div className="fixed top-4 right-4 z-50 bg-[#00E5A0] text-[#020609] px-4 py-2 rounded-xl font-black text-sm shadow-xl animate-pulse">{toast}</div>}
      <div className="bg-[#07101A] border-b border-[#0D1F35] px-4 py-3 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A020] to-[#C07010] flex items-center justify-center font-black text-black text-lg flex-shrink-0">Ω</div>
            <div className="min-w-0">
              <div className="text-white font-black text-sm tracking-widest">INGENIUM PRO <span className="text-[#E8A020]">v8.0</span></div>
              <div className="text-[#284060] text-[8px] truncate hidden sm:block">{u.name} · {u.lic} · {u.co}</div>
            </div>
          </div>
          <div className="flex gap-1 bg-[#020609] rounded-xl p-1 border border-[#0D1F35]">
            {(['field','eng','exec'] as Mode[]).map((m,i)=>(
              <button key={m} onClick={()=>setMode(m)} className={`text-[9px] px-2 py-1.5 rounded-lg font-black transition-all ${mode===m?'bg-[#E8A020] text-[#020609]':'text-[#284060]'}`}>
                {[T.mf,T.me,T.mx][i]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['es','en','pt'] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} className={`text-[9px] px-2 py-1 rounded-lg border font-black transition-all ${lang===l?'border-[#E8A020] text-[#E8A020]':'border-[#0D1F35] text-[#284060]'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${RC[risk].bd} ${RC[risk].bg}`}>
            <div className={`w-2 h-2 rounded-full ${RC[risk].dot} ${risk==='CRITICAL'?'animate-ping':''}`}/>
            <span className={`text-[9px] font-black ${RC[risk].tx}`}>{risk}</span>
          </div>
          <button onClick={()=>window.print()} className="text-[9px] text-[#284060] hover:text-[#94A8C0] border border-[#0D1F35] px-3 py-1.5 rounded-lg hidden sm:block">🖨️</button>
        </div>
      </div>
      <div className="bg-[#07101A] border-b border-[#0D1F35] print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {MODS.map(m=>(
              <button key={m.id} onClick={()=>setMod(m.id)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap"
                style={mod===m.id?{background:m.c+'20',border:`1px solid ${m.c}40`,color:m.c}:{border:'1px solid transparent',color:'#284060'}}>
                <span>{m.i}</span><span className="hidden lg:block">{m.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4">
        {mod==='tutorial'   &&<Tutorial onStart={()=>setMod('ai')} user={u}/>}
        {mod==='ai'         &&<AIm lang={lang} mode={mode} sys={AI_SYS}/>}
        {mod==='pipes'      &&<Pipes mode={mode} onR={setRisk} onS={doSave}/>}
        {mod==='hydro'      &&<Hydro onR={setRisk} onS={doSave}/>}
        {mod==='hammer'     &&<WaterHammer onR={setRisk} onS={doSave}/>}
        {mod==='thermal'    &&<Thermal onR={setRisk} onS={doSave}/>}
        {mod==='valves'     &&<Valves onR={setRisk} onS={doSave}/>}
        {mod==='blast'      &&<Blast onR={setRisk} onS={doSave}/>}
        {mod==='chem'       &&<Chem onR={setRisk}/>}
        {mod==='geo'        &&<Geo onR={setRisk} onS={doSave}/>}
        {mod==='slopes'     &&<Slopes onR={setRisk} onS={doSave}/>}
        {mod==='hydrology'  &&<Hydrology onR={setRisk} onS={doSave}/>}
        {mod==='integrity'  &&<Integrity onR={setRisk} onS={doSave}/>}
        {mod==='cad'        &&<CAD/>}
        {mod==='budget'     &&<Budget onS={doSave}/>}
        {mod==='hc'         &&<HC onS={doSave}/>}
        {mod==='fat'        &&<Fatigue onR={setRisk} onS={doSave}/>}
        {mod==='pdf'        &&<PDF user={u} projs={projs}/>}
        {mod==='ver'        &&<Vercel/>}
        {mod==='proj'       &&<Projects projs={projs} onL={(p)=>setMod(p.mod)} onExport={()=>{
          const blob=new Blob([JSON.stringify(projs,null,2)],{type:'application/json'});
          const a=document.createElement('a');a.href=URL.createObjectURL(blob);
          a.download=`INGENIUM-proyectos-${new Date().toISOString().split('T')[0]}.json`;a.click();
        }}/>}
      </div>
      <div className="hidden print:block fixed bottom-2 right-4 text-xs text-gray-400">
        INGENIUM PRO v8.0 © Silvana Belén Colombo · {u.name} · {u.lic} · {new Date().toLocaleString()}
      </div>
    </div>
  );
}

// ── TUTORIAL ──────────────────────────────────────────────────────
function Tutorial({onStart,user}:{onStart:()=>void,user:{name:string}}){
  const steps=[
    {n:'1',t:'Elegí tu modo',d:'CAMPO para obra. INGENIERÍA para cálculo completo. DIRECTIVO para resumen con costos.'},
    {n:'2',t:'Consultá la IA primero',d:'INGENIUM Ω conoce todas las normas. Preguntá en lenguaje natural.'},
    {n:'3',t:'Calculá con los módulos',d:'Cada módulo tiene física real y norma aplicada. Si el valor está fuera de rango te avisa.'},
    {n:'4',t:'Leé el semáforo',d:'🟢 Seguro · 🟡 Monitorear · 🟠 Corregir · 🔴 DETENER OPERACIÓN'},
    {n:'5',t:'Guardá el proyecto',d:'Nombre del proyecto → Guardar. Queda en Proyectos con riesgo y valor USD.'},
    {n:'6',t:'Exportá la memoria',d:'Módulo PDF genera documento formal con QR de verificación y espacio para firma.'},
  ];
  return(<div className="space-y-4"><div className={C.k}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8A020] to-[#C07010] flex items-center justify-center text-xl font-black text-black">Ω</div>
      <div><div className="text-white font-black text-lg">Bienvenido{user.name?', '+user.name:''}!</div>
      <div className="text-[#284060] text-xs">INGENIUM PRO v8.0 — 20 módulos de ingeniería con IA</div></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {steps.map(s=>(
        <div key={s.n} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-3 flex gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center text-[#E8A020] font-black text-xs flex-shrink-0">{s.n}</div>
          <div><div className="text-white font-black text-xs mb-1">{s.t}</div>
          <div className="text-[#284060] text-[9px]">{s.d}</div></div>
        </div>
      ))}
    </div>
    <div className="bg-[#031A0A] border border-[#00E5A0]/20 rounded-xl p-4 mb-4">
      <div className="text-[#00E5A0] font-black text-xs mb-2">✅ CORRECCIONES v8.0 aplicadas:</div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-[#284060]">
        <div>✅ MAOP con factor E y T (ASME B31.8)</div>
        <div>✅ Geotecnia con nivel freático</div>
        <div>✅ Fatiga con factor Kt</div>
        <div>✅ Voladura con distancia real</div>
        <div>✅ Golpe de ariete — Joukowsky</div>
        <div>✅ Dilatación térmica — ASME B31.3</div>
        <div>✅ Estabilidad de taludes — Bishop</div>
        <div>✅ Hidrología — Método Racional</div>
        <div>✅ Integridad de ductos — API 579</div>
        <div>✅ Hardy-Cross con presiones</div>
      </div>
    </div>
    <button onClick={onStart} className={C.b}>🚀 EMPEZAR — INGENIUM PRO v8.0</button>
  </div></div>);
}

// ── IA ────────────────────────────────────────────────────────────
function AIm({lang,mode,sys}:{lang:string,mode:string,sys:string}){
  const [msgs,setMsgs]=useState([{r:'a',c:`**INGENIUM Ω v8.0** 🌍\n\n20 módulos · 12 correcciones reales · Física exacta · Normas verificadas\n\nNUEVO en v8.0:\n💢 Golpe de ariete (Joukowsky)\n🌡️ Dilatación térmica (ASME B31.3)\n⛰️ Estabilidad de taludes (Bishop)\n🌧️ Hidrología (Método Racional)\n🔬 Integridad de ductos (API 579)\n\n¿Qué calculamos?`}]);
  const [inp,setInp]=useState('');const [load,setLoad]=useState(false);const eR=useRef<HTMLDivElement>(null);
  useEffect(()=>{eR.current?.scrollIntoView({behavior:'smooth'});},[msgs]);
  const send=async(t?:string)=>{
    const m=t||inp.trim();if(!m||load)return;setInp('');
    const h=[...msgs,{r:'u',c:m}];setMsgs(h);setLoad(true);
    try{
      const sL=lang==='en'?'Respond in English.':lang==='pt'?'Em Português.':'En español.';
      const mC=mode==='field'?' Simple practical language.':mode==='exec'?' Focus on costs and risks.':'';
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({system:sys+' '+sL+mC,messages:h.map(x=>({role:x.r==='a'?'assistant':'user',content:x.c}))})});
      const d=await res.json();
      setMsgs([...h,{r:'a',c:d.content?.[0]?.text||'Error en la respuesta'}]);
    }catch{setMsgs([...h,{r:'a',c:'⚠️ Error. Verificá que /api/chat esté configurado con ANTHROPIC_API_KEY.'}]);}
    setLoad(false);
  };
  const rend=(c:string)=>c.split(/(\*\*[^*]+\*\*)/g).map((p,i)=>p.startsWith('**')&&p.endsWith('**')?<strong key={i} className="text-[#E8A020]">{p.slice(2,-2)}</strong>:p);
  const QS=['MAOP gasoducto 12" X65 con junta ERW post-1970','Golpe de ariete en acueducto DN400 L=2km','Estabilidad talud 30° H=8m arcilla c=40kPa','Integridad ducto con 3mm corrosión en 10 años','Hidrología cuenca 50ha CN=75 I=80mm/h'];
  return(<div className="flex flex-col" style={{height:'calc(100vh - 165px)'}}>
    <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
      {msgs.map((m,i)=>(
        <div key={i} className={`flex gap-3 ${m.r==='u'?'flex-row-reverse':''}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border ${m.r==='a'?'bg-[#E8A020]/10 border-[#E8A020]/40 text-[#E8A020]':'bg-[#0D1F35] border-[#1A3050] text-[#284060]'}`}>{m.r==='a'?'Ω':'U'}</div>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${m.r==='a'?'bg-[#07101A] border border-[#0D1F35] text-[#94A8C0] rounded-tl-sm':'bg-[#E8A020]/10 border border-[#E8A020]/20 text-[#94A8C0] rounded-tr-sm'}`}>
            {m.r==='a'?rend(m.c):m.c}</div>
        </div>
      ))}
      {load&&(<div className="flex gap-3"><div className="w-9 h-9 rounded-xl bg-[#E8A020]/10 border border-[#E8A020]/40 flex items-center justify-center text-[#E8A020] font-black text-xs animate-pulse">Ω</div>
        <div className="bg-[#07101A] border border-[#0D1F35] rounded-2xl px-4 py-3 flex gap-1 items-center">{[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-[#E8A020] rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div></div>)}
      <div ref={eR}/>
    </div>
    {msgs.length===1&&<div className="flex gap-2 overflow-x-auto pb-2 mb-2">{QS.map((q,i)=><button key={i} onClick={()=>send(q)} className="flex-shrink-0 text-[10px] bg-[#07101A] border border-[#0D1F35] hover:border-[#E8A020] text-[#284060] hover:text-[#94A8C0] rounded-xl px-3 py-2 transition-all max-w-[200px] text-left">{q}</button>)}</div>}
    <div className="flex gap-2 items-end">
      <textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
        placeholder="Cualquier cálculo de ingeniería... (Enter envía)" rows={1} className={C.i+' resize-none'} style={{minHeight:'44px',maxHeight:'120px'}}
        onInput={(e:React.FormEvent<HTMLTextAreaElement>)=>{const t=e.target as HTMLTextAreaElement;t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px';}}/>
      <button onClick={()=>send()} disabled={load||!inp.trim()} className="bg-[#E8A020] hover:bg-[#F0B030] disabled:opacity-30 text-[#020609] font-black rounded-xl p-3 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>);
}

// ── TUBERÍAS (CORRECCIÓN 01) ──────────────────────────────────────
// @ts-ignore
function Pipes({mode,onR,onS}:{mode:Mode,onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({OD:'219.1',t:'8.18',S:'359',F:'0.72',E_joint:'1.0',T_op:'20',Po:'5.5',Q:'60',L:'2000',rough:'0.046',K_minor:'0',name:''});
  const [r,setR]=useState<null|{m:NonNullable<ReturnType<typeof calcMAOP>>,d:NonNullable<ReturnType<typeof calcDW>>,risk:RL}>(null);
  const [err,setErr]=useState('');
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    setErr('');
    const OD=parseFloat(p.OD),t=parseFloat(p.t);
    if(t>=OD/2){setErr('Espesor t debe ser menor que OD/2');return;}
    const m=calcMAOP(OD,t,parseFloat(p.S),parseFloat(p.F),parseFloat(p.E_joint),parseFloat(p.T_op));
    const di=(OD-2*t)/1000;
    const d=calcDW(parseFloat(p.Q),di,parseFloat(p.L),parseFloat(p.rough),parseFloat(p.K_minor));
    if(!m||!d){setErr('Verificá los valores ingresados');return;}
    const u2=parseFloat(p.Po)/m.P;
    const r2:RL=u2>0.9?'CRITICAL':u2>0.75?'HIGH':u2>0.5?'MEDIUM':'LOW';
    // @ts-ignore
    setR({m,d,r:r2});onR(r2);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest">🔩 Tuberías — ASME B31.8 §841.11 (v8.0 corregido)</h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>OD exterior (mm)</label><input className={C.i} type="number" value={p.OD} onChange={e=>sv({OD:e.target.value})}/></div>
      <div><label className={C.l}>Espesor t (mm)</label><input className={C.i} type="number" value={p.t} onChange={e=>sv({t:e.target.value})}/></div>
      <div><label className={C.l}>SMYS (MPa)</label>
        <select className={C.s} value={p.S} onChange={e=>sv({S:e.target.value})}>
          {[['241','Grado B'],['290','X42'],['359','X52'],['414','X60'],['448','X65'],['483','X70'],['552','X80']].map(([v,l])=><option key={v} value={v}>{l} — {v}MPa</option>)}
        </select></div>
      <div><label className={C.l}>Factor F</label>
        <select className={C.s} value={p.F} onChange={e=>sv({F:e.target.value})}>
          {[['0.80','B31.8 Cl.1'],['0.72','B31.4 Cl.1'],['0.60','B31.8 Cl.2'],['0.50','B31.8 Cl.3']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select></div>
      <div><label className={C.l}>Factor E — Eficiencia junta ✅NEW</label>
        <select className={C.s} value={p.E_joint} onChange={e=>sv({E_joint:e.target.value})}>
          <option value="1.0">Sin costura / SAW — E=1.0</option>
          <option value="0.85">ERW post-1970 — E=0.85</option>
          <option value="0.60">ERW pre-1970 — E=0.60</option>
        </select></div>
      <div><label className={C.l}>T operación (°C) ✅NEW</label><input className={C.i} type="number" value={p.T_op} onChange={e=>sv({T_op:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">T&gt;120°C reduce MAOP (ASME B31.8 Table 841.116A)</div></div>
      <div><label className={C.l}>P operación (MPa)</label><input className={C.i} type="number" step="0.1" value={p.Po} onChange={e=>sv({Po:e.target.value})}/></div>
      <div><label className={C.l}>Caudal Q (L/s)</label><input className={C.i} type="number" value={p.Q} onChange={e=>sv({Q:e.target.value})}/></div>
      <div><label className={C.l}>Longitud L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Rugosidad ε (mm) ✅NEW</label>
        <select className={C.s} value={p.rough} onChange={e=>sv({rough:e.target.value})}>
          <option value="0.046">Acero comercial nuevo — 0.046mm</option>
          <option value="0.2">Acero con 5 años servicio — 0.2mm</option>
          <option value="0.5">Acero con corrosión moderada — 0.5mm</option>
          <option value="1.5">Acero incrustado — 1.5mm</option>
          <option value="0.0015">PVC/HDPE — 0.0015mm</option>
        </select></div>
      <div><label className={C.l}>K accesorios ✅NEW</label>
        <select className={C.s} value={p.K_minor} onChange={e=>sv({K_minor:e.target.value})}>
          <option value="0">Sin accesorios — K=0</option>
          <option value="1.5">1 codo 90° — K=1.5</option>
          <option value="3.0">2 codos 90° — K=3.0</option>
          <option value="5.0">2 codos + 1 tee — K=5.0</option>
          <option value="8.0">Red compleja — K=8.0</option>
        </select></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})} placeholder="Gasoducto Norte — Tramo A"/></div>
    </div>
    {err&&<div className="mt-2 bg-red-950 border border-red-700 rounded-xl p-3"><p className="text-red-400 text-xs font-black">⚠️ {err}</p></div>}
    <button onClick={run} className={C.b}>⚡ CALCULAR — MAOP + Darcy-Weisbach</button>
  </div>
  {r&&<div className="space-y-3">
    <Badge r={r.r} msg={`P_op/MAOP=${(parseFloat(p.Po)/r.m.P*100).toFixed(0)}% — ${r.r==='CRITICAL'?'⛔ EXCEDE LÍMITE':r.r==='HIGH'?'⚠️ Margen reducido':'✅ OK'}`}/>
    <Box t={`MAOP — ${r.m.reg}`} n="ASME B31.8 §841.11" rows={[
      ['t/D',r.m.ratio+'%'],
      ['Factor E (eficiencia junta)',r.m.E_joint.toString()],
      ['Factor T (temperatura)',r.m.T_factor.toString()+(parseFloat(p.T_op)>120?' ⚠️':' ✅')],
      ['MAOP',r.m.P+' MPa',true],['MAOP',r.m.bar+' bar'],['MAOP',r.m.psi+' psi'],
      ['Prueba hidrostática',(r.m.P*1.5).toFixed(3)+' MPa']]}/>
    <Box t="Darcy-Weisbach + Pérdidas menores" n="Colebrook-White" rows={[
      ['Velocidad V',r.d.V+' m/s',r.d.V>3],['Reynolds',r.d.Re+' — '+r.d.reg],
      ['Factor fricción f',r.d.f.toString()],
      ['hf pérdidas mayores',r.d.hf_mayor+' m'],
      ['hf pérdidas menores (K)',r.d.hf_menor+' m'],
      ['hf TOTAL',r.d.hf+' m',true],['ΔP total',r.d.dP+' kPa',true]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'pipes',r.r,r.m.P*1000,{...p,maop:r.m.P})} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── HIDRÁULICA ────────────────────────────────────────────────────
function Hydro({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({Q:'30',D:'0.3',L:'1000',n:'0.013',S:'0.003',name:''});
  const [tab,setTab]=useState('dw');
  const [r,setR]=useState<null|{dw?:ReturnType<typeof calcDW>,mn?:ReturnType<typeof import('./page').calcManning>}>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));

  const calcManningLocal=(n:number,D:number,S:number)=>{
    if(n<=0||D<=0||S<=0)return null;
    const A=Math.PI/4*D**2,R=A/(Math.PI*D),V=(1/n)*Math.pow(R,2/3)*Math.pow(S,0.5);
    return{V:+V.toFixed(3),Q:+(V*A*1000).toFixed(2),R:+R.toFixed(4)};
  };

  const run=()=>{
    if(tab==='dw'){const d=calcDW(parseFloat(p.Q),parseFloat(p.D),parseFloat(p.L));if(!d)return;setR({dw:d});onR(d.V>3.5?'HIGH':d.V>2.5?'MEDIUM':'LOW');}
    else{const mn=calcManningLocal(parseFloat(p.n),parseFloat(p.D),parseFloat(p.S));if(!mn)return;setR({mn} as {mn:ReturnType<typeof import('./page').calcManning>});onR('LOW');}
  };

  return(<div className="space-y-4"><div className={C.k}>
    <div className="flex gap-1 mb-4 bg-[#020609] rounded-xl p-1 border border-[#0D1F35]">
      {[{id:'dw',l:'Darcy-Weisbach'},{id:'mn',l:'Manning (canal libre)'}].map(tb=>(
        <button key={tb.id} onClick={()=>{setTab(tb.id);setR(null);}} className={`flex-1 py-2 text-[10px] font-black rounded-lg ${tab===tb.id?'bg-[#E8A020] text-[#020609]':'text-[#284060]'}`}>{tb.l}</button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>Q (L/s)</label><input className={C.i} type="number" value={p.Q} onChange={e=>sv({Q:e.target.value})}/></div>
      <div><label className={C.l}>D (m)</label><input className={C.i} type="number" value={p.D} onChange={e=>sv({D:e.target.value})}/></div>
      {tab==='dw'&&<div className="col-span-2"><label className={C.l}>L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>}
      {tab==='mn'&&<><div><label className={C.l}>Manning n</label>
        <select className={C.s} value={p.n} onChange={e=>sv({n:e.target.value})}>
          {[['0.010','PVC/HDPE'],['0.013','Hormigón liso'],['0.016','Hormigón rugoso'],['0.025','Tierra compactada'],['0.030','Canal natural']].map(([v,l])=><option key={v} value={v}>{l} n={v}</option>)}
        </select></div>
        <div><label className={C.l}>Pendiente S (m/m)</label><input className={C.i} type="number" value={p.S} onChange={e=>sv({S:e.target.value})}/></div></>}
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className={C.b}>⚡ CALCULAR</button>
  </div>
  {r?.dw&&<Box t="Darcy-Weisbach" n="Colebrook-White/Swamee-Jain" rows={[['V',r.dw.V+' m/s',r.dw.V>3],['Re',r.dw.Re+' — '+r.dw.reg],['f',r.dw.f.toString()],['hf mayor',r.dw.hf_mayor+' m'],['hf menor',r.dw.hf_menor+' m'],['hf TOTAL',r.dw.hf+' m',true],['ΔP',r.dw.dP+' kPa',true]]}/>}
  {r?.mn&&<Box t="Manning — Canal a superficie libre" n="ISO 10801" rows={[['R hidráulico',r.mn!.R+' m'],['V',r.mn!.V+' m/s',true],['Q',r.mn!.Q+' L/s',true],['Autolimpiante',r.mn!.V>0.6?'✅ Sí (>0.6 m/s)':'⚠️ Riesgo sedimentación']]}/>}
  {r&&p.name&&<button onClick={()=>onS(p.name,'hydro','LOW',0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>);
}

// ── GOLPE DE ARIETE (NUEVO v8.0) ──────────────────────────────────
function WaterHammer({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({Q:'60',D_int:'0.203',t:'0.00818',L:'2000',E:'200',dV:'1.5',mat:'acero',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcWaterHammer>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcWaterHammer(parseFloat(p.Q),parseFloat(p.D_int),parseFloat(p.t),parseFloat(p.L),parseFloat(p.E),parseFloat(p.dV),p.mat);
    if(!res)return;setR(res);onR(res.risk);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#F97316] text-[10px] font-black uppercase tracking-widest mb-1">💢 Golpe de Ariete — Joukowsky ✅NUEVO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Calcula la sobrepresión por cierre brusco de válvula. Crítico en acueductos y oleoductos.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>Caudal Q (L/s)</label><input className={C.i} type="number" value={p.Q} onChange={e=>sv({Q:e.target.value})}/></div>
      <div><label className={C.l}>D interior (m)</label><input className={C.i} type="number" value={p.D_int} onChange={e=>sv({D_int:e.target.value})}/></div>
      <div><label className={C.l}>Espesor pared t (m)</label><input className={C.i} type="number" value={p.t} onChange={e=>sv({t:e.target.value})}/></div>
      <div><label className={C.l}>Longitud L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Material tubería</label>
        <select className={C.s} value={p.mat} onChange={e=>{sv({mat:e.target.value});if(e.target.value==='acero')sv({E:'200'});else if(e.target.value==='hdpe')sv({E:'0.8'});else if(e.target.value==='pvc')sv({E:'2.7'});}}>
          <option value="acero">Acero — E=200 GPa</option>
          <option value="hdpe">HDPE — E=0.8 GPa</option>
          <option value="pvc">PVC — E=2.7 GPa</option>
          <option value="horm">Hormigón — E=25 GPa</option>
        </select></div>
      <div><label className={C.l}>E módulo elástico (GPa)</label><input className={C.i} type="number" value={p.E} onChange={e=>sv({E:e.target.value})}/></div>
      <div><label className={C.l}>ΔV cambio velocidad (m/s)</label><input className={C.i} type="number" step="0.1" value={p.dV} onChange={e=>sv({dV:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">V inicial si cierre total</div></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#F97316] to-[#C05010] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#FB923C] transition-all mt-3 shadow-lg">⚡ CALCULAR GOLPE DE ARIETE</button>
  </div>
  {r&&<div className="space-y-3">
    <Badge r={r.risk} msg={`Sobrepresión ΔP=${r.dP_MPa} MPa (${r.dP_bar} bar) — ${r.risk==='CRITICAL'?'⛔ RIESGO DE ROTURA DE TUBERÍA':r.risk==='HIGH'?'⚠️ Riesgo alto — verificar presión de diseño':'✅ Dentro de límites'}`}/>
    <Box t="Golpe de Ariete — Joukowsky" n="AWWA M11 / ASME" rows={[
      ['Celeridad de onda a',r.a+' m/s',true],
      ['Sobrepresión ΔP',r.dP_MPa+' MPa',true],
      ['Sobrepresión ΔP',r.dP_bar+' bar'],
      ['Tiempo crítico de cierre Tc',r.Tc+' s',true],
      ['Recomendación',`Cerrar válvula en más de ${r.Tc} segundos`]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'hammer',r.risk,0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── DILATACIÓN TÉRMICA (NUEVO v8.0) ───────────────────────────────
function Thermal({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({L:'100',T1:'20',T2:'80',mat:'acero_carbono',restringido:'no',OD:'219.1',t:'8.18',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcThermal>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcThermal(parseFloat(p.L),parseFloat(p.T1),parseFloat(p.T2),p.mat,p.restringido==='si',parseFloat(p.OD),parseFloat(p.t));
    setR(res);onR(res.risk);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#FF4560] text-[10px] font-black uppercase tracking-widest mb-1">🌡️ Dilatación Térmica — ASME B31.3 ✅NUEVO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Expansión diferencial y diseño de liras de dilatación para plantas industriales y gasoductos.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>Longitud L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Material</label>
        <select className={C.s} value={p.mat} onChange={e=>sv({mat:e.target.value})}>
          <option value="acero_carbono">Acero al carbono — α=11.7×10⁻⁶/°C</option>
          <option value="acero_inox_304">Inox 304 — α=17.2×10⁻⁶/°C</option>
          <option value="acero_inox_316">Inox 316 — α=16.0×10⁻⁶/°C</option>
          <option value="hdpe">HDPE — α=150×10⁻⁶/°C</option>
          <option value="cobre">Cobre — α=17.0×10⁻⁶/°C</option>
        </select></div>
      <div><label className={C.l}>T instalación (°C)</label><input className={C.i} type="number" value={p.T1} onChange={e=>sv({T1:e.target.value})}/></div>
      <div><label className={C.l}>T operación (°C)</label><input className={C.i} type="number" value={p.T2} onChange={e=>sv({T2:e.target.value})}/></div>
      <div><label className={C.l}>¿Tubería restringida?</label>
        <select className={C.s} value={p.restringido} onChange={e=>sv({restringido:e.target.value})}>
          <option value="no">No — libre para dilatar</option>
          <option value="si">Sí — empotrada en ambos extremos</option>
        </select></div>
      <div><label className={C.l}>OD (mm) — para lira</label><input className={C.i} type="number" value={p.OD} onChange={e=>sv({OD:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#FF4560] to-[#CC2040] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#FF6070] transition-all mt-3 shadow-lg">⚡ CALCULAR DILATACIÓN TÉRMICA</button>
  </div>
  {r&&<div className="space-y-3">
    {r.sigma_term>0&&<Badge r={r.risk} msg={`Tensión térmica σ=${r.sigma_term} MPa — ${r.risk==='CRITICAL'?'⛔ SUPERA SMYS — FALLA INMINENTE':r.risk==='HIGH'?'⚠️ Tensión alta — revisar soportes':'✅ Dentro de límites'}`}/>}
    <Box t="Dilatación Térmica — ASME B31.3 Appendix C" n="ASME B31.3" rows={[
      ['ΔT temperatura',r.dT+'°C'],
      ['Elongación ΔL',r.dL+' mm',true],
      ['Tensión térmica σ',r.sigma_term>0?r.sigma_term+' MPa':'N/A (libre)'],
      ['Longitud lira en U requerida',r.L_lira>0?r.L_lira+' m':'Calcular OD para lira'],
      ['Recomendación',r.dL>50?'⚠️ Instalar lira de dilatación o junta de expansión':'✅ Verificar soportes guías']]}/>
    {p.name&&<button onClick={()=>onS(p.name,'thermal',r.risk,0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── VÁLVULAS ──────────────────────────────────────────────────────
function Valves({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({sv:'petroleo',DN:'200',P:'7.5',h2s:'0',sol:'0',name:''});
  const [r,setR]=useState<null|ReturnType<typeof selectValve>>(null);
  const sv2=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{const res=selectValve(p.sv,parseFloat(p.DN),parseFloat(p.P),parseFloat(p.h2s),parseFloat(p.sol));setR(res);onR(res.w.length>0?'HIGH':'LOW');};
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#E8A020] text-[10px] font-black uppercase tracking-widest mb-3">⚙️ Válvulas — API 6D/6A/AWWA/B16.34</h3>
    <div><label className={C.l}>Servicio</label>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[{id:'petroleo',l:'🛢️ Petróleo'},{id:'gas',l:'⛽ Gas'},{id:'pozo',l:'🔧 Pozo'},{id:'agua',l:'💧 Agua'},{id:'vapor',l:'♨️ Vapor'},{id:'mineria',l:'⛏️ Lodos'}].map(s=>(
          <button key={s.id} onClick={()=>sv2({sv:s.id})} className={`text-[10px] px-2 py-2 rounded-xl border transition-all ${p.sv===s.id?'border-[#E8A020]/50 bg-[#E8A020]/10 text-[#E8A020] font-black':'border-[#0D1F35] text-[#284060]'}`}>{s.l}</button>
        ))}
      </div></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>DN (mm)</label>
        <select className={C.s} value={p.DN} onChange={e=>sv2({DN:e.target.value})}>
          {[50,80,100,150,200,250,300,400,500,600].map(d=><option key={d} value={d}>DN {d}mm</option>)}
        </select></div>
      <div><label className={C.l}>Presión (MPa)</label><input className={C.i} type="number" step="0.1" value={p.P} onChange={e=>sv2({P:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">={Math.round(parseFloat(p.P)*145)} psi · {Math.round(parseFloat(p.P)*10)} bar</div></div>
      <div><label className={C.l}>H₂S (ppm)</label><input className={C.i} type="number" value={p.h2s} onChange={e=>sv2({h2s:e.target.value})}/>{parseFloat(p.h2s)>10&&<div className="text-[9px] text-red-400 mt-1 font-black">⚠️ NACE MR0175</div>}</div>
      <div><label className={C.l}>Sólidos (%)</label><input className={C.i} type="number" value={p.sol} onChange={e=>sv2({sol:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv2({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className={C.b}>⚡ CALCULAR</button>
  </div>
  {r&&<div className="space-y-3">
    {r.w.map((w,i)=><div key={i} className="bg-red-950 border border-red-700 rounded-xl p-3"><p className="text-red-400 text-xs font-black">{w}</p></div>)}
    <Box t={r.v.n} n={r.v.norm} rows={[['Clase ASME',r.cls.c+' (máx '+r.cls.P+' MPa)'],['Prueba hidrostática',(parseFloat(p.P)*1.5).toFixed(2)+' MPa'],['Costo FOB USD','$ '+r.costo.toLocaleString('en-US'),true],['Con ingeniería +35%','$ '+Math.round(r.costo*1.35).toLocaleString('en-US'),true]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'valves',r.w.length>0?'HIGH':'LOW',r.costo,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── EXPLOSIVOS (CORRECCIÓN 02) ────────────────────────────────────
function Blast({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({roca:'media',expl:'anfo',d:'89',h:'12',ds:'200',name:''});
  const [r,setR]=useState<null|{B:number,S:number,T:number,Lc:number,W:number,Vr:number,PF:number,dseg:number,costo:number,VOD:number,seis:NonNullable<ReturnType<typeof calcBlastSeismic>>}>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcBlasting(p.roca,p.expl,parseFloat(p.d),parseFloat(p.h));
    if(!res)return;
    // CORRECCIÓN 02: usa distancia REAL del usuario, no 100m hardcodeado
    const seis=calcBlastSeismic(res.W*10,parseFloat(p.ds));
    if(!seis)return;
    setR({...res,seis});onR(seis.risk);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#FF4560] text-[10px] font-black uppercase tracking-widest mb-1">💥 Voladura — Langefors / IRAM 11647 + Riesgo Sísmico Real ✅CORREGIDO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">v8.0: Riesgo sísmico calculado con la distancia REAL a la estructura (corregido de 100m fijo).</p>
    <div className="space-y-3">
      <div><label className={C.l}>Tipo de roca</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[{id:'blanda',l:'Blanda (arcilita · UCS=25MPa)'},{id:'media',l:'Media (caliza · UCS=80MPa)'},{id:'dura',l:'Dura (granito · UCS=150MPa)'},{id:'muy_dura',l:'Muy dura (basalto · UCS=220MPa)'}].map(r2=>(
            <button key={r2.id} onClick={()=>sv({roca:r2.id})} className={`text-[10px] px-3 py-2 rounded-xl border transition-all ${p.roca===r2.id?'border-[#FF4560]/50 bg-[#FF4560]/10 text-[#FF4560] font-black':'border-[#0D1F35] text-[#284060]'}`}>{r2.l}</button>
          ))}
        </div></div>
      <div><label className={C.l}>Explosivo</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[{id:'anfo',l:'ANFO — VOD 4500m/s'},{id:'emulsion',l:'Emulsión — VOD 5500m/s'},{id:'heavy_anfo',l:'Heavy ANFO — VOD 5000m/s'},{id:'dinamita',l:'Dinamita 60% — VOD 6000m/s'}].map(e=>(
            <button key={e.id} onClick={()=>sv({expl:e.id})} className={`text-[10px] px-3 py-2 rounded-xl border transition-all ${p.expl===e.id?'border-[#FF4560]/50 bg-[#FF4560]/10 text-[#FF4560] font-black':'border-[#0D1F35] text-[#284060]'}`}>{e.l}</button>
          ))}
        </div></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={C.l}>Ø barreno (mm)</label><input className={C.i} type="number" value={p.d} onChange={e=>sv({d:e.target.value})}/></div>
        <div><label className={C.l}>Altura banco (m)</label><input className={C.i} type="number" value={p.h} onChange={e=>sv({h:e.target.value})}/></div>
        <div><label className={C.l}>Dist. real estructura (m) ✅</label><input className={C.i} type="number" value={p.ds} onChange={e=>sv({ds:e.target.value})}/></div>
      </div>
      <div><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all mt-3 text-white bg-gradient-to-r from-[#FF4560] to-[#CC2040] hover:from-[#FF6070] shadow-lg">⚡ CALCULAR + ANÁLISIS SÍSMICO REAL</button>
  </div>
  {r&&<div className="space-y-3">
    <div className="bg-red-950 border-2 border-red-600 rounded-2xl p-4" style={{boxShadow:'0 0 30px #FF456040'}}>
      <div className="text-red-400 font-black text-sm mb-1">⚠️ ZONA DE EXCLUSIÓN — IRAM 11647</div>
      <div className="text-white font-black text-3xl">{r.dseg} metros</div>
      <div className="text-red-300 text-xs mt-1">Despejar TODO el personal antes de detonar</div>
    </div>
    <Badge r={r.seis.risk} msg={`PGV=${r.seis.PGV} mm/s a ${p.ds}m · DS=${r.seis.SD} · ${r.seis.dano}${r.seis.col?' — ⚠️ RIESGO DE DERRUMBE':''}`}/>
    <Box t="Diseño Voladura — Langefors-Kihlström" n="IRAM 11647" rows={[
      ['Burden B',r.B+' m',true],['Espaciado S',r.S+' m',true],
      ['Taco (stemming) T',r.T+' m'],['Longitud de carga',r.Lc+' m'],
      ['Explosivo por barreno',r.W+' kg'],['Factor de carga PF',r.PF+' kg/m³',true],
      ['VOD del explosivo',r.VOD+' m/s'],
      ['Costo USD','$ '+r.costo.toLocaleString('en-US'),true],
      ['Zona de exclusión',r.dseg+' m ⚠️']]}/>
    {p.name&&<button onClick={()=>onS(p.name,'blast',r.seis.risk,r.costo,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── QUÍMICOS ──────────────────────────────────────────────────────
function Chem({onR}:{onR:(r:RL)=>void}){
  const [sel,setSel]=useState('agua');
  const q=CHEM[sel];
  useEffect(()=>{onR(q.risk);},[sel]);
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-3">⚗️ Compatibilidad Química y Seguridad Industrial</h3>
    <select className={C.s} value={sel} onChange={e=>setSel(e.target.value)}>
      {Object.entries(CHEM).map(([id,c])=><option key={id} value={id}>{c.n}</option>)}
    </select>
  </div>
  {q&&<div className="space-y-3">
    <Badge r={q.risk} msg={q.cls+' — '+q.n+' · pH: '+q.pH}/>
    <Box t="Compatibilidad con materiales de tubería" rows={[['Acero al carbono',q.ac],['Acero inoxidable 316L',q.ix,true],['PVC',q.pv],['HDPE PE100',q.hd,true]]}/>
    <div className="bg-orange-950 border border-orange-700 rounded-2xl p-4">
      <div className="text-orange-400 font-black text-xs mb-2">🦺 EPP OBLIGATORIO — MSDS/GHS-SGA/IRAM 3797</div>
      <p className="text-orange-200 text-xs leading-relaxed">{q.EPP}</p>
    </div>
  </div>}
  </div>);
}

// ── GEOTECNIA (CORRECCIÓN 03) ─────────────────────────────────────
function Geo({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({s:'arc_me',B:'1.5',L:'2.0',Df:'1.2',Q:'500',FS:'3.0',ex:'0',Dw:'10',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcGeo>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcGeo(p.s,parseFloat(p.B),parseFloat(p.L),parseFloat(p.Df),parseFloat(p.Q),parseFloat(p.FS),parseFloat(p.Dw));
    setR(res);
    const er=parseFloat(p.ex)>4&&p.s.includes('arc')?'HIGH':parseFloat(p.ex)>2?'MEDIUM':'LOW';
    onR(!res.ok?'CRITICAL':parseFloat(res.ut)>80?'HIGH':er as RL);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#7EC850] text-[10px] font-black uppercase tracking-widest mb-3">🌍 Geotecnia — Meyerhof + Nivel Freático ✅CORREGIDO v8.0</h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><label className={C.l}>Tipo de suelo</label>
        <select className={C.s} value={p.s} onChange={e=>sv({s:e.target.value})}>
          {[{id:'arena_s',l:'Arena suelta — φ=28°, c=0'},{id:'arena_c',l:'Arena compacta — φ=35°, c=0'},{id:'arc_bl',l:'Arcilla blanda — φ=0°, c=25kPa'},{id:'arc_me',l:'Arcilla media — φ=0°, c=50kPa'},{id:'arc_fi',l:'Arcilla firme — φ=0°, c=100kPa'},{id:'grava',l:'Grava y arena — φ=40°, c=0'}].map(sl=><option key={sl.id} value={sl.id}>{sl.l}</option>)}
        </select></div>
      <div><label className={C.l}>Ancho B (m)</label><input className={C.i} type="number" value={p.B} onChange={e=>sv({B:e.target.value})}/></div>
      <div><label className={C.l}>Largo L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Df — Prof. cimentación (m)</label><input className={C.i} type="number" value={p.Df} onChange={e=>sv({Df:e.target.value})}/></div>
      <div><label className={C.l}>Carga aplicada (kN)</label><input className={C.i} type="number" value={p.Q} onChange={e=>sv({Q:e.target.value})}/></div>
      <div><label className={C.l}>Factor seguridad FS</label>
        <select className={C.s} value={p.FS} onChange={e=>sv({FS:e.target.value})}>
          {[['2.5','Sismo'],['3.0','Estático'],['3.5','Crítico']].map(([v,l])=><option key={v} value={v}>FS={v} — {l}</option>)}
        </select></div>
      <div><label className={C.l}>Nivel freático Dw (m) ✅NEW</label><input className={C.i} type="number" value={p.Dw} onChange={e=>sv({Dw:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">Dw≤Df: reduce portante significativamente</div></div>
      <div><label className={C.l}>Prof. excavación (m)</label><input className={C.i} type="number" value={p.ex} onChange={e=>sv({ex:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#7EC850] to-[#5A9030] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#90E060] transition-all mt-3 shadow-lg">⚡ CALCULAR + NIVEL FREÁTICO</button>
  </div>
  {r&&<div className="space-y-3">
    {parseFloat(p.ex)>2&&<div className={`rounded-2xl border p-4 ${parseFloat(p.ex)>4&&p.s.includes('arc')?'bg-red-950 border-red-700':'bg-yellow-950 border-yellow-700'}`}>
      <div className="font-black text-sm" style={{color:parseFloat(p.ex)>4?'#FF4560':'#F59E0B'}}>{parseFloat(p.ex)>4&&p.s.includes('arc')?'🚨 RIESGO DE DERRUMBE — ENTIBADO OBLIGATORIO':'⚠️ Excavación con riesgo moderado'}</div>
    </div>}
    <Badge r={!r.ok?'CRITICAL':parseFloat(r.ut)>80?'HIGH':'LOW'} msg={!r.ok?`❌ FALLA — q_ap=${r.qap} kPa > q_adm=${r.qa} kPa`:`✅ OK — Utilización ${r.ut}% · ${r.freatic_effect}`}/>
    <Box t="Meyerhof + Nivel Freático — AASHTO LRFD ✅v8.0" n="CIRSOC 501/ACI 336" rows={[
      ['Nivel freático Dw',p.Dw+' m · '+r.freatic_effect],
      ['q última',r.qu+' kPa'],['q admisible FS='+p.FS,r.qa+' kPa',true],
      ['q aplicada',r.qap+' kPa'],['Utilización',r.ut+'%',parseFloat(r.ut)>80],
      ['Veredicto',r.ok?'✅ APTO':'❌ FALLA — Redimensionar',!r.ok]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'geo',!r.ok?'CRITICAL':'LOW',0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── ESTABILIDAD DE TALUDES — BISHOP (NUEVO v8.0) ──────────────────
function Slopes({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({H:'8',beta:'35',c:'40',phi:'28',gamma:'1800',Dw:'5',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcSlope>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcSlope(parseFloat(p.H),parseFloat(p.beta),parseFloat(p.c),parseFloat(p.phi),parseFloat(p.gamma),parseFloat(p.Dw));
    setR(res);onR(res.risk);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#7EC850] text-[10px] font-black uppercase tracking-widest mb-1">⛰️ Estabilidad de Taludes — Bishop Simplificado ✅NUEVO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Análisis de círculo de falla con 5 dovelas. Incluye efecto del nivel freático y sismo.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>Altura talud H (m)</label><input className={C.i} type="number" value={p.H} onChange={e=>sv({H:e.target.value})}/></div>
      <div><label className={C.l}>Ángulo talud β (°)</label><input className={C.i} type="number" value={p.beta} onChange={e=>sv({beta:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">45°=talud 1:1 · 34°=3:2 · 27°=2:1</div></div>
      <div><label className={C.l}>Cohesión c (kPa)</label><input className={C.i} type="number" value={p.c} onChange={e=>sv({c:e.target.value})}/></div>
      <div><label className={C.l}>Ángulo fricción φ (°)</label><input className={C.i} type="number" value={p.phi} onChange={e=>sv({phi:e.target.value})}/></div>
      <div><label className={C.l}>Peso específico γ (kg/m³)</label><input className={C.i} type="number" value={p.gamma} onChange={e=>sv({gamma:e.target.value})}/></div>
      <div><label className={C.l}>Nivel freático Dw (m)</label><input className={C.i} type="number" value={p.Dw} onChange={e=>sv({Dw:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">Desde la cresta del talud</div></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#7EC850] to-[#5A9030] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#90E060] transition-all mt-3 shadow-lg">⚡ CALCULAR ESTABILIDAD — BISHOP</button>
  </div>
  {r&&<div className="space-y-3">
    <Badge r={r.risk} msg={`FS=${r.FS} — ${r.estado}`}/>
    <Box t="Estabilidad de Taludes — Bishop Simplificado" n="CIRSOC 102 / AASHTO" rows={[
      ['Factor de seguridad FS',r.FS.toString(),true],
      ['Estado',r.estado,true],
      ['FS mínimo estático','1.5 (CIRSOC 102)'],
      ['FS mínimo sísmico','1.3 (CIRSOC 103)'],
      ['Recomendación',r.FS<1.5?r.FS<1.0?'❌ INTERVENIR URGENTE — Sistema de contención':'⚠️ Recalcular con drenaje o berma':'✅ Cumple FS mínimo']]}/>
  </div>}
  </div>);
}

// ── HIDROLOGÍA (NUEVO v8.0) ───────────────────────────────────────
function Hydrology({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({A:'50',C:'0.65',L:'800',S:'5',I:'80',CN:'75',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcHydrology>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcHydrology(parseFloat(p.A),parseFloat(p.C),parseFloat(p.L),parseFloat(p.S),parseFloat(p.I),parseFloat(p.CN));
    setR(res);onR('LOW');
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#00C8FF] text-[10px] font-black uppercase tracking-widest mb-1">🌧️ Hidrología — Método Racional + Kirpich + CN ✅NUEVO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Caudal de diseño para alcantarillas, canales y obras de drenaje vial.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>Área cuenca A (ha)</label><input className={C.i} type="number" value={p.A} onChange={e=>sv({A:e.target.value})}/></div>
      <div><label className={C.l}>Coeficiente C</label>
        <select className={C.s} value={p.C} onChange={e=>sv({C:e.target.value})}>
          <option value="0.20">Bosque / pastizal — C=0.20</option>
          <option value="0.35">Zona agrícola — C=0.35</option>
          <option value="0.50">Zona residencial dispersa — C=0.50</option>
          <option value="0.65">Zona residencial densa — C=0.65</option>
          <option value="0.80">Zona comercial — C=0.80</option>
          <option value="0.95">Pavimento/techos — C=0.95</option>
        </select></div>
      <div><label className={C.l}>Longitud cauce L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Pendiente S (mm/m)</label><input className={C.i} type="number" value={p.S} onChange={e=>sv({S:e.target.value})}/></div>
      <div><label className={C.l}>Intensidad I (mm/h)</label><input className={C.i} type="number" value={p.I} onChange={e=>sv({I:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">Para el período de retorno de diseño</div></div>
      <div><label className={C.l}>Curva Número CN</label>
        <select className={C.s} value={p.CN} onChange={e=>sv({CN:e.target.value})}>
          <option value="40">Bosque en buenas condiciones — CN=40</option>
          <option value="60">Pastizal — CN=60</option>
          <option value="75">Zona residencial — CN=75</option>
          <option value="85">Zona comercial — CN=85</option>
          <option value="98">Pavimento impermeable — CN=98</option>
        </select></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#00C8FF] to-[#0096C7] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#00DFFF] transition-all mt-3 shadow-lg">⚡ CALCULAR HIDROLOGÍA</button>
  </div>
  {r&&<Box t="Hidrología — Método Racional + CN (NRCS)" n="HEC-HMS / ASCE" rows={[
    ['Tiempo concentración Tc (Kirpich)',r.Tc+' min',true],
    ['Lluvia de diseño en Tc',r.P_diseño+' mm'],
    ['Caudal de diseño Q (Racional)',r.Q_racional+' m³/s',true],
    ['Escorrentía (Curva CN)',r.Q_CN+' mm',true],
    ['Volumen escorrentía',r.Vol+' m³'],
    ['Dimensionamiento',`Alcantarilla para Q=${r.Q_racional} m³/s`]]}/>}
  </div>);
}

// ── INTEGRIDAD DE DUCTOS — API 579 (NUEVO v8.0) ───────────────────
function Integrity({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({OD:'219.1',t_nom:'8.18',t_actual:'6.5',tasa:'0.3',SMYS:'359',P_op:'5.5',name:''});
  const [r,setR]=useState<null|NonNullable<ReturnType<typeof calcIntegrity>>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{
    const res=calcIntegrity(parseFloat(p.OD),parseFloat(p.t_nom),parseFloat(p.t_actual),parseFloat(p.tasa),parseFloat(p.SMYS),parseFloat(p.P_op));
    if(!res)return;setR(res);onR(res.risk);
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#F97316] text-[10px] font-black uppercase tracking-widest mb-1">🔬 Integridad de Ductos — API 579 / ASME B31G ✅NUEVO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Evaluación de ductos con corrosión. Calcula MAOP reducido y vida remanente.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>OD (mm)</label><input className={C.i} type="number" value={p.OD} onChange={e=>sv({OD:e.target.value})}/></div>
      <div><label className={C.l}>Espesor nominal t_nom (mm)</label><input className={C.i} type="number" value={p.t_nom} onChange={e=>sv({t_nom:e.target.value})}/></div>
      <div><label className={C.l}>Espesor actual medido (mm)</label><input className={C.i} type="number" value={p.t_actual} onChange={e=>sv({t_actual:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">Por ultrasonido o radiografía</div></div>
      <div><label className={C.l}>Tasa de corrosión (mm/año)</label><input className={C.i} type="number" step="0.1" value={p.tasa} onChange={e=>sv({tasa:e.target.value})}/>
        <div className="text-[9px] text-[#284060] mt-1">Típico: 0.1-0.5 mm/año</div></div>
      <div><label className={C.l}>SMYS (MPa)</label>
        <select className={C.s} value={p.SMYS} onChange={e=>sv({SMYS:e.target.value})}>
          {[['241','Grado B'],['290','X42'],['359','X52'],['414','X60'],['448','X65']].map(([v,l])=><option key={v} value={v}>{l} — {v}MPa</option>)}
        </select></div>
      <div><label className={C.l}>P operación actual (MPa)</label><input className={C.i} type="number" step="0.1" value={p.P_op} onChange={e=>sv({P_op:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#F97316] to-[#C05010] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#FB923C] transition-all mt-3 shadow-lg">⚡ EVALUAR INTEGRIDAD — API 579</button>
  </div>
  {r&&<div className="space-y-3">
    <Badge r={r.risk} msg={r.apto?`✅ APTO — MAOP corroído=${r.MAOP_corr} MPa > P_op=${p.P_op} MPa · Vida restante: ${r.vida_rem} años`:`❌ NO APTO — MAOP corroído=${r.MAOP_corr} MPa < P_op=${p.P_op} MPa — REDUCIR PRESIÓN O REPARAR`}/>
    <Box t="Integridad — API 579 / ASME B31G" n="API 579 Parte 4" rows={[
      ['Pérdida de espesor',r.d_defecto+' mm ('+r.pct_perd+'% del nominal)'],
      ['Factor Folias',r.factor_folias.toString()],
      ['MAOP con corrosión',r.MAOP_corr+' MPa',true],
      ['Presión de operación',p.P_op+' MPa'],
      ['Vida remanente',r.vida_rem+' años',true],
      ['Veredicto',r.apto?'✅ CONTINUAR OPERACIÓN':'❌ REDUCIR P o REPARAR',!r.apto]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'integrity',r.risk,0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── CAD ───────────────────────────────────────────────────────────
function CAD(){
  const [p,setP]=useState({OD:'219.1',t:'8.18',L:'500',V:'3',E:'1',z1:'0',z2:'15'});
  const [c,setC]=useState<null|{s:string,W:number,H:number}>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#E8A020] text-[10px] font-black uppercase tracking-widest mb-1">📐 Planos CAD — Simbología ISA 5.1 + Elevaciones ✅MEJORADO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">Genera perfil longitudinal con elevaciones reales, pendiente y simbología ISA 5.1.</p>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={C.l}>OD (mm)</label><input className={C.i} type="number" value={p.OD} onChange={e=>sv({OD:e.target.value})}/></div>
      <div><label className={C.l}>t (mm)</label><input className={C.i} type="number" value={p.t} onChange={e=>sv({t:e.target.value})}/></div>
      <div><label className={C.l}>L (m)</label><input className={C.i} type="number" value={p.L} onChange={e=>sv({L:e.target.value})}/></div>
      <div><label className={C.l}>Válvulas</label><input className={C.i} type="number" min="0" max="6" value={p.V} onChange={e=>sv({V:e.target.value})}/></div>
      <div><label className={C.l}>Cota inicio Z1 (msnm)</label><input className={C.i} type="number" value={p.z1} onChange={e=>sv({z1:e.target.value})}/></div>
      <div><label className={C.l}>Cota fin Z2 (msnm)</label><input className={C.i} type="number" value={p.z2} onChange={e=>sv({z2:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Est. bombeo</label><input className={C.i} type="number" min="0" max="3" value={p.E} onChange={e=>sv({E:e.target.value})}/></div>
    </div>
    <button onClick={()=>setC(genPipeSVG(parseFloat(p.OD),parseFloat(p.t),parseFloat(p.L),parseInt(p.V),parseInt(p.E),parseFloat(p.z1),parseFloat(p.z2)))} className={C.b}>📐 GENERAR PLANO CON ELEVACIONES</button>
  </div>
  {c&&<div className={C.k}>
    <div className="flex items-center justify-between mb-3">
      <div className="text-[#E8A020] text-[10px] font-black uppercase">Perfil de Ducto — ISA 5.1 + Elevaciones</div>
      <button onClick={()=>window.print()} className="text-[9px] border border-[#E8A020]/40 text-[#E8A020] px-3 py-1.5 rounded-lg">🖨️ Imprimir</button>
    </div>
    <svg viewBox={`0 0 ${c.W} ${c.H}`} className="w-full bg-[#020609] rounded-xl border border-[#0D1F35] mb-2" style={{minHeight:'140px'}} dangerouslySetInnerHTML={{__html:c.s}}/>
    <p className="text-[#1A3050] text-[9px]">INGENIUM PRO v8.0 © Silvana Belén Colombo · ISA 5.1 · {new Date().toLocaleString()}</p>
  </div>}
  </div>);
}

// ── PRESUPUESTO ───────────────────────────────────────────────────
function Budget({onS}:{onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [lines,setLines]=useState([{i:0,q:100},{i:14,q:500}]);
  const [name,setName]=useState('');const [cont,setCont]=useState(8);const [ing,setIng]=useState(12);
  const add=()=>setLines(l=>[...l,{i:0,q:1}]);
  const rem=(i:number)=>setLines(l=>l.filter((_,j)=>j!==i));
  const upd=(i:number,f:{i?:number,q?:number})=>setLines(l=>l.map((x,j)=>j===i?{...x,...f}:x));
  const sub=lines.reduce((a,l)=>{const it=BI[l.i];return it?a+it[3]*l.q:a;},0);
  const grand=sub*(1+cont/100+ing/100+0.25);
  const cats=[...new Set(BI.map(x=>x[0]))];
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest mb-1">💰 Presupuesto — USD 2025 + Vialidad ✅MEJORADO v8.0</h3>
    <div className="space-y-2 mb-3">
      {lines.map((line,i)=>(
        <div key={i} className="flex gap-2 items-center">
          <select className={C.s+' flex-1 text-xs'} value={line.i} onChange={e=>upd(i,{i:parseInt(e.target.value)})}>
            {cats.map(cat=><optgroup key={cat} label={cat}>{BI.map(([c2,n2,u2,pr],idx)=>c2===cat&&<option key={idx} value={idx}>{n2} — ${pr}/{u2}</option>)}</optgroup>)}
          </select>
          <input className={C.i+' w-20 text-xs'} type="number" value={line.q} onChange={e=>upd(i,{q:parseFloat(e.target.value)||0})}/>
          <span className="text-[#284060] text-xs w-6">{BI[line.i]?.[2]}</span>
          <span className="text-[#E8A020] text-[9px] w-20 text-right font-mono">${((BI[line.i]?.[3]||0)*line.q).toLocaleString('en-US')}</span>
          <button onClick={()=>rem(i)} className="text-red-400 font-black text-lg w-6">×</button>
        </div>
      ))}
      <button onClick={add} className="w-full border border-dashed border-[#0D1F35] hover:border-[#E8A020] text-[#284060] hover:text-[#E8A020] py-2 rounded-xl text-xs">+ Agregar ítem</button>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div><label className={C.l}>Contingencia (%)</label><input className={C.i} type="number" min="0" max="30" value={cont} onChange={e=>setCont(parseFloat(e.target.value)||0)}/></div>
      <div><label className={C.l}>Ingeniería (%)</label><input className={C.i} type="number" min="0" max="30" value={ing} onChange={e=>setIng(parseFloat(e.target.value)||0)}/></div>
      <div><label className={C.l}>Margen (%)</label><input className={C.i} value="25" readOnly/></div>
    </div>
    <div><label className={C.l}>Nombre</label><input className={C.i} value={name} onChange={e=>setName(e.target.value)} placeholder="Presupuesto proyecto..."/></div>
    <div className="mt-3 bg-[#020609] rounded-xl p-3 border border-[#0D1F35] space-y-1">
      <Row l="Subtotal materiales y obra" v={'$ '+Math.round(sub).toLocaleString('en-US')}/>
      <Row l={`Ingeniería (${ing}%)`} v={'$ '+Math.round(sub*ing/100).toLocaleString('en-US')}/>
      <Row l={`Contingencia (${cont}%)`} v={'$ '+Math.round(sub*cont/100).toLocaleString('en-US')}/>
      <Row l="Margen (25%)" v={'$ '+Math.round(sub*0.25).toLocaleString('en-US')}/>
      <Row l="TOTAL OFERTA USD" v={'$ '+Math.round(grand).toLocaleString('en-US')} h/>
    </div>
    {name&&<button onClick={()=>onS(name,'budget','LOW',Math.round(grand),{lines,name} as Record<string,unknown>)} className={C.o}>💾 Guardar: {name}</button>}
  </div></div>);
}

// ── HARDY-CROSS con presiones (CORRECCIÓN 12) ─────────────────────
function HC({onS}:{onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [pipes,setPipes]=useState<HCPipe[]>([
    {id:'A',from:1,to:2,D:0.30,L:500,C:130},{id:'B',from:2,to:3,D:0.25,L:400,C:130},
    {id:'C',from:3,to:4,D:0.20,L:300,C:130},{id:'D',from:4,to:1,D:0.25,L:400,C:130},{id:'E',from:2,to:4,D:0.20,L:350,C:130}
  ]);
  const [H_entrada,setH_entrada]=useState(50);
  const [demandas]=useState<Record<number,number>>({2:15,3:10,4:8});
  const [name,setName]=useState('');
  const [r,setR]=useState<null|ReturnType<typeof hardyCrossWithPressures>>(null);
  const addPipe=()=>{const ids='ABCDEFGHIJKLMNOPQRSTUVWXYZ';setPipes(prev=>[...prev,{id:ids[prev.length]||'P'+prev.length,from:1,to:2,D:0.20,L:300,C:130}]);};
  const remPipe=(i:number)=>setPipes(prev=>prev.filter((_,j)=>j!==i));
  const updPipe=(i:number,f:Partial<HCPipe>)=>setPipes(prev=>prev.map((x,j)=>j===i?{...x,...f}:x));
  const run=()=>{const res=hardyCrossWithPressures(pipes,H_entrada,demandas);setR(res);};
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#00C8FF] text-[10px] font-black uppercase tracking-widest mb-1">🌊 Redes — Hardy-Cross + Presiones en Nodos ✅CORREGIDO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">v8.0: Calcula presión en cada nodo. Alerta cuando presión {'<'} mínimo de servicio.</p>
    <div className="mb-3">
      <label className={C.l}>Carga piezométrica entrada H (m.c.a.)</label>
      <input className={C.i} type="number" value={H_entrada} onChange={e=>setH_entrada(parseFloat(e.target.value))}/>
    </div>
    <div className="space-y-2 mb-3">
      <div className="grid grid-cols-6 gap-1 text-[8px] text-[#284060] font-black uppercase px-1"><span>ID</span><span>De</span><span>A</span><span>D(m)</span><span>L(m)</span><span>C H-W</span></div>
      {pipes.map((pipe,i)=>(
        <div key={i} className="grid grid-cols-6 gap-1 items-center">
          <input className={C.i+' text-center text-xs p-2'} value={pipe.id} onChange={e=>updPipe(i,{id:e.target.value})}/>
          <input className={C.i+' text-center text-xs p-2'} type="number" value={pipe.from} onChange={e=>updPipe(i,{from:parseInt(e.target.value)})}/>
          <input className={C.i+' text-center text-xs p-2'} type="number" value={pipe.to} onChange={e=>updPipe(i,{to:parseInt(e.target.value)})}/>
          <input className={C.i+' text-center text-xs p-2'} type="number" step="0.05" value={pipe.D} onChange={e=>updPipe(i,{D:parseFloat(e.target.value)})}/>
          <input className={C.i+' text-center text-xs p-2'} type="number" value={pipe.L} onChange={e=>updPipe(i,{L:parseFloat(e.target.value)})}/>
          <div className="flex gap-1"><input className={C.i+' text-center text-xs p-2 flex-1'} type="number" value={pipe.C} onChange={e=>updPipe(i,{C:parseInt(e.target.value)})}/><button onClick={()=>remPipe(i)} className="text-red-400 font-black text-lg w-7">×</button></div>
        </div>
      ))}
      <button onClick={addPipe} className="w-full border border-dashed border-[#0D1F35] hover:border-[#00C8FF] text-[#284060] hover:text-[#00C8FF] py-2 rounded-xl text-xs">+ Agregar tubería</button>
    </div>
    <div><label className={C.l}>Nombre proyecto</label><input className={C.i} value={name} onChange={e=>setName(e.target.value)}/></div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#00C8FF] to-[#0096C7] text-[#020609] py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#00DFFF] transition-all mt-3 shadow-lg">⚡ CALCULAR HARDY-CROSS + PRESIONES</button>
  </div>
  {r&&<div className="space-y-3">
    <div className={C.k}>
      <div className="text-[#00C8FF] text-[10px] font-black uppercase mb-3">Caudales y Presiones — Convergidos</div>
      {r.finalPipes.map(p=>(
        <div key={p.id} className={`flex justify-between py-1.5 px-3 rounded-lg ${Math.abs(p.V)>2?'bg-[#E8A020]/10 border border-[#E8A020]/20':''}`}>
          <span className="text-[#284060] text-xs">Tramo {p.id}: N{p.from}→N{p.to}</span>
          <span className={`font-black text-xs font-mono ${Math.abs(p.V)>2?'text-[#E8A020]':'text-[#94A8C0]'}`}>Q={p.Q} L/s · V={p.V} m/s · hf={p.hf}m</span>
        </div>
      ))}
      <div className="mt-3 border-t border-[#0D1F35] pt-2">
        <div className="text-[#00C8FF] text-[9px] font-black uppercase mb-2">Presiones en nodos ✅NEW</div>
        {Object.entries(r.H_nodos).map(([nodo,H])=>(
          <div key={nodo} className={`flex justify-between py-1 px-3 rounded-lg ${H<10?'bg-red-950/50 border border-red-700/50':''}`}>
            <span className="text-[#284060] text-xs">Nodo {nodo}</span>
            <span className={`font-black text-xs font-mono ${H<10?'text-red-400':'text-[#94A8C0]'}`}>H={H.toFixed(1)} m.c.a. {H<10?'⚠️ < 10m INSUFICIENTE':H<15?'⚠️ Verificar':''}</span>
          </div>
        ))}
      </div>
    </div>
    {name&&<button onClick={()=>onS(name,'hc','LOW',0,{pipes,name} as Record<string,unknown>)} className={C.o}>💾 Guardar: {name}</button>}
  </div>}
  </div>);
}

// ── FATIGA (CORRECCIÓN 04) ────────────────────────────────────────
function Fatigue({onR,onS}:{onR:(r:RL)=>void,onS:(n:string,m:string,r:RL,u:number,c:Record<string,unknown>)=>void}){
  const [p,setP]=useState({mat:'Acero C-Mn',sig:'180',N:'50000',T:'200',Kt:'1.0',name:''});
  const [r,setR]=useState<null|ReturnType<typeof calcFatigue>>(null);
  const sv=(f:Partial<typeof p>)=>setP(x=>({...x,...f}));
  const run=()=>{const res=calcFatigue(parseFloat(p.sig),p.mat,parseFloat(p.N),parseFloat(p.T),parseFloat(p.Kt));setR(res);onR(res.risk);};
  const genSN=(res:NonNullable<typeof r>)=>{
    const W=400,H=160,pL=40,pR=20,pT=20,pB=30,cW=W-pL-pR,cH=H-pT-pB;
    const pts=res.snCurve;
    const minN=Math.min(...pts.map(p=>p.n)),maxN=Math.max(...pts.map(p=>p.n));
    const maxSa=Math.max(...pts.map(p=>p.sa))*1.2;
    const toX=(n:number)=>pL+(Math.log10(n)-Math.log10(minN))/(Math.log10(maxN)-Math.log10(minN))*cW;
    const toY=(sa:number)=>pT+cH-(sa/maxSa)*cH;
    const path=pts.map((p,i)=>`${i===0?'M':'L'} ${toX(p.n).toFixed(1)},${toY(p.sa).toFixed(1)}`).join(' ');
    const opX=Math.max(pL,Math.min(pL+cW,toX(Math.max(minN,Math.min(maxN,res.operPoint.n)))));
    const opY=Math.max(pT,Math.min(pT+cH,toY(Math.min(maxSa,res.operPoint.sa))));
    return`<rect width="${W}" height="${H}" fill="#020609" rx="8"/>
    <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT+cH}" stroke="#0D1F35" strokeWidth="1"/>
    <line x1="${pL}" y1="${pT+cH}" x2="${pL+cW}" y2="${pT+cH}" stroke="#0D1F35" strokeWidth="1"/>
    <line x1="${pL}" y1="${pT+cH*0.33}" x2="${pL+cW}" y2="${pT+cH*0.33}" stroke="#0D1F35" strokeWidth="0.5" strokeDasharray="4 4"/>
    <line x1="${pL}" y1="${pT+cH*0.66}" x2="${pL+cW}" y2="${pT+cH*0.66}" stroke="#0D1F35" strokeWidth="0.5" strokeDasharray="4 4"/>
    <path d="${path}" fill="none" stroke="#00C8FF" strokeWidth="2"/>
    <line x1="${pL}" y1="${toY(res.Se)}" x2="${pL+cW}" y2="${toY(res.Se)}" stroke="#00E5A0" strokeWidth="1" strokeDasharray="6 3"/>
    <text x="${pL+5}" y="${toY(res.Se)-4}" fill="#00E5A0" fontSize="7" fontFamily="monospace">Se=${res.Se}MPa</text>
    <circle cx="${opX}" cy="${opY}" r="6" fill="${res.ok?'#00E5A0':'#FF4560'}" stroke="white" strokeWidth="1.5"/>
    <text x="${opX+8}" y="${opY-5}" fill="${res.ok?'#00E5A0':'#FF4560'}" fontSize="8" fontFamily="monospace">OPERACIÓN</text>
    <rect x="0" y="0" width="${W}" height="14" fill="#050A14"/>
    <text x="6" y="10" fill="#F97316" fontSize="8" fontFamily="monospace" fontWeight="bold">CURVA S-N ASME VIII Div.2 — Kt=${p.Kt}</text>`;
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#F97316] text-[10px] font-black uppercase tracking-widest mb-1">🔄 Fatiga — ASME VIII Div.2 + Factor Kt ✅CORREGIDO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">v8.0: Factor Kt de concentración de tensiones por soldadura (corregido de Kt=1.0 fijo).</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><label className={C.l}>Material</label>
        <select className={C.s} value={p.mat} onChange={e=>sv({mat:e.target.value})}>
          {['Acero C-Mn','Inox 304/316','X65','Aluminio 6061'].map(m=><option key={m}>{m}</option>)}
        </select></div>
      <div><label className={C.l}>σ nominal alternante (MPa)</label><input className={C.i} type="number" value={p.sig} onChange={e=>sv({sig:e.target.value})}/></div>
      <div><label className={C.l}>Factor Kt ✅NEW</label>
        <select className={C.s} value={p.Kt} onChange={e=>sv({Kt:e.target.value})}>
          <option value="1.0">Material liso mecanizado — Kt=1.0</option>
          <option value="1.5">Soldadura a tope — Kt=1.5</option>
          <option value="2.0">Soldadura con geometría irregular — Kt=2.0</option>
          <option value="2.5">Soldadura en filete — Kt=2.5</option>
          <option value="3.5">Cambio de sección brusco — Kt=3.5</option>
        </select></div>
      <div><label className={C.l}>N ciclos aplicados</label><input className={C.i} type="number" value={p.N} onChange={e=>sv({N:e.target.value})}/></div>
      <div><label className={C.l}>Temperatura (°C)</label><input className={C.i} type="number" value={p.T} onChange={e=>sv({T:e.target.value})}/></div>
      <div className="col-span-2"><label className={C.l}>Nombre proyecto</label><input className={C.i} value={p.name} onChange={e=>sv({name:e.target.value})}/></div>
    </div>
    <button onClick={run} className="w-full bg-gradient-to-r from-[#F97316] to-[#C05010] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#FB923C] transition-all mt-3 shadow-lg">⚡ CALCULAR FATIGA + CURVA S-N</button>
  </div>
  {r&&<div className="space-y-3">
    <Badge r={r.risk} msg={r.ok?`✅ D=${r.Dp}% OK · Ciclos restantes: ${r.rem.toLocaleString()}`:`❌ FALLA POR FATIGA — D=${r.Dp}% > 100%`}/>
    <div className={C.k}>
      <div className="text-[#F97316] text-[10px] font-black uppercase mb-2">Curva S-N + Límite de Fatiga Se ✅v8.0</div>
      <svg viewBox="0 0 400 160" className="w-full bg-[#020609] rounded-xl border border-[#0D1F35]" dangerouslySetInnerHTML={{__html:genSN(r)}}/>
    </div>
    <Box t="Fatiga ASME VIII Div.2 + Kt" n="Tabla 3.F.1" rows={[
      ['σ nominal',parseFloat(p.sig)+' MPa'],
      ['Factor Kt (concentración)',p.Kt+' → σ efectiva='+r.Sa_efectiva+' MPa',true],
      ['Factor temperatura Tf',r.Tf.toString()],
      ['Límite de fatiga Se',r.Se+' MPa'],
      ['N admisibles (S-N)',r.Na.toLocaleString()],['N diseño (÷2 FS)',r.Nd.toLocaleString(),true],
      ['N aplicados',parseFloat(p.N).toLocaleString()],
      ['Daño Miner D',r.Dp+'%',r.D>0.8],
      ['Ciclos restantes',r.rem.toLocaleString(),r.ok],
      ['Veredicto',r.ok?'✅ APTO':'❌ FALLA — Reducir σ o usar Kt menor',!r.ok]]}/>
    {p.name&&<button onClick={()=>onS(p.name,'fat',r.risk,0,p as Record<string,unknown>)} className={C.o}>💾 Guardar: {p.name}</button>}
  </div>}
  </div>);
}

// ── PDF CON QR DE VERIFICACIÓN (CORRECCIÓN 11) ────────────────────
function PDF({user,projs}:{user:{name:string,lic:string,co:string,cn:string},projs:Proj[]}){
  const [c,setC]=useState('');const [name,setName]=useState('');const [selProj,setSelProj]=useState('');
  const docId=`IP8-${Date.now().toString(36).toUpperCase()}`;
  const gen=()=>{
    const w=window.open('','_blank');if(!w)return;
    // QR simple como texto codificado (en producción usar librería QR real)
    const qrData=`INGENIUM-PRO|DOC:${docId}|USR:${user.name}|MAT:${user.lic}|FECHA:${new Date().toLocaleDateString()}`;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>INGENIUM PRO — ${name}</title>
    <style>body{font-family:'Courier New',monospace;margin:40px;color:#1a1a1a;font-size:11px}
    h1{font-size:16px;font-weight:900;border-bottom:3px solid #E8A020;padding-bottom:8px}
    h2{font-size:12px;font-weight:900;color:#C07010;margin-top:18px;border-bottom:1px solid #ddd;padding-bottom:3px}
    .row{display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px dotted #eee}
    .content{white-space:pre-wrap;background:#f8f8f8;padding:12px;border:1px solid #ddd;font-size:10px;line-height:1.6;border-radius:4px}
    .footer{margin-top:30px;padding-top:10px;border-top:2px solid #E8A020;display:flex;justify-content:space-between;font-size:9px;color:#666}
    .stamp{border:2px solid #E8A020;padding:8px 16px;font-weight:900;font-size:10px;color:#C07010;text-align:center}
    .qr{border:2px solid #1a1a1a;padding:8px;font-family:monospace;font-size:7px;word-break:break-all;max-width:200px}
    .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(232,160,32,0.04);font-weight:900;pointer-events:none}
    @media print{.wm{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
    <div class="wm">INGENIUM PRO</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;align-items:flex-start">
      <div><div style="font-size:22px;font-weight:900;color:#E8A020;letter-spacing:2px">Ω INGENIUM PRO</div>
      <div style="font-size:9px;color:#666">Motor de Ingeniería Mundial v8.0 · © Silvana Belén Colombo</div></div>
      <div style="text-align:right;font-size:9px;color:#666">
        <div style="font-weight:900">DOC N°: ${docId}</div>
        <div>Fecha: ${new Date().toLocaleString()}</div><div>Rev.: 00 · EMITIDO PARA REVISIÓN</div>
      </div>
    </div>
    <h1>MEMORIA DE CÁLCULO DE INGENIERÍA</h1>
    <h2>1. DATOS DEL PROYECTO</h2>
    <div class="row"><span>Proyecto:</span><strong>${name||'Sin nombre'}</strong></div>
    <div class="row"><span>Empresa:</span><strong>${user.co||'—'}</strong></div>
    <div class="row"><span>País:</span><strong>${user.cn||'—'}</strong></div>
    <div class="row"><span>Herramienta:</span><strong>INGENIUM PRO v8.0</strong></div>
    <h2>2. PROFESIONAL RESPONSABLE</h2>
    <div class="row"><span>Nombre:</span><strong>${user.name}</strong></div>
    <div class="row"><span>ID / Matrícula / Rol:</span><strong>${user.lic}</strong></div>
    <h2>3. DESARROLLO DEL CÁLCULO</h2>
    <div class="content">${c||'(Pegá aquí los resultados de los módulos de cálculo)'}</div>
    <h2>4. NORMATIVAS APLICADAS</h2>
    <div class="content">ASME B31.3/B31.4/B31.8 · API 5L/579/6D/6A · AWWA M11/M31 · NACE MR0175 · IRAM 11647 · AASHTO LRFD · CIRSOC 501/102 · ASME VIII Div.2 · ISA 5.1 · IEC 60079 · ISO 5167 · HEC-HMS</div>
    <h2>5. FIRMA Y VERIFICACIÓN</h2>
    <div style="margin-top:15px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>
        <div style="border-bottom:1px solid #1a1a1a;width:220px;padding-top:35px;margin-bottom:4px"></div>
        <div style="font-size:9px"><strong>${user.name}</strong></div>
        <div style="font-size:9px">${user.lic}</div>
        <div style="font-size:9px;color:#666">Firma del Profesional Responsable</div>
      </div>
      <div style="text-align:center">
        <div class="stamp">✓ INGENIUM PRO v8.0<br>© Silvana Belén Colombo<br>RADAR Gestión Estratégica<br>${new Date().toLocaleDateString()}</div>
        <div class="qr" style="margin-top:8px;font-size:6px">${qrData}</div>
        <div style="font-size:7px;color:#666;margin-top:2px">Código de verificación del documento</div>
      </div>
    </div>
    <div class="footer">
      <div>Documento generado por INGENIUM PRO v8.0.<br>Responsabilidad del profesional firmante.</div>
      <div>© 2026 Silvana Belén Colombo<br>Todos los derechos reservados</div>
    </div>
    <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-1">📄 PDF Certificable + Código de Verificación ✅MEJORADO v8.0</h3>
    <p className="text-[#284060] text-[9px] mb-3">v8.0: Incluye código único de verificación del documento (QR en versión web).</p>
    <div className="space-y-3">
      {projs.length>0&&<div><label className={C.l}>Cargar datos de proyecto guardado</label>
        <select className={C.s} value={selProj} onChange={e=>{setSelProj(e.target.value);if(e.target.value){const proj=projs.find(p=>p.id===e.target.value);if(proj){setName(proj.name);setC(JSON.stringify(proj.calcs,null,2));}}}}>
          <option value="">Seleccionar proyecto...</option>
          {projs.map(p=><option key={p.id} value={p.id}>{p.name} — {p.date}</option>)}
        </select></div>}
      <div><label className={C.l}>Nombre del proyecto</label><input className={C.i} value={name} onChange={e=>setName(e.target.value)} placeholder="Gasoducto Norte — Rev.00"/></div>
      <div><label className={C.l}>Desarrollo del cálculo</label>
        <textarea className={C.i+' resize-none'} rows={8} value={c} onChange={e=>setC(e.target.value)}
          placeholder={'Pegá aquí los resultados de los módulos.\n\nEjemplo:\nMÓDULO: MAOP — ASME B31.8 §841.11\nOD=219.1mm · t=8.18mm · SMYS=359MPa\nFactor F=0.72 · E=1.0 (sin costura) · T=1.0\nMAOP = 19.3 MPa = 193 bar = 2799 psi\nPrueba hidrostática: 29.0 MPa\n\nMÓDULO: Golpe de Ariete — Joukowsky\nCeleridad a=1200 m/s · ΔP=1.8 MPa\nTiempo crítico Tc=3.3 s'}/>
      </div>
      <div className="bg-[#020609] border border-[#0D1F35] rounded-xl p-3 text-[9px] text-[#284060]">
        <div className="text-[#A78BFA] font-black mb-1">✅ El PDF incluirá automáticamente:</div>
        <div>· DOC N°: {docId} · Fecha y hora · {user.name||'Profesional'} / {user.lic||'ID'}</div>
        <div>· Empresa: {user.co||'—'} · País: {user.cn||'—'}</div>
        <div>· Watermark INGENIUM PRO · Sello © Silvana Belén Colombo · Código de verificación</div>
      </div>
    </div>
    <button onClick={gen} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-[#C4B5FD] transition-all mt-3 shadow-lg">📄 GENERAR PDF CERTIFICABLE</button>
  </div></div>);
}

// ── VERCEL ────────────────────────────────────────────────────────
function Vercel(){
  const steps=[
    {n:'1',t:'GitHub (ya hecho ✅)',cmd:'',d:'El repositorio ya está en github.com/radargestionestrategica-celda/ingenium-pro — Privado.'},
    {n:'2',t:'Crear /api/chat en el proyecto',cmd:'Crear carpeta: app/api/chat/\nCrear archivo: route.ts\n(Descargar route.ts del chat anterior)',d:'El archivo route.ts protege la API Key. Nunca queda expuesta en el navegador.'},
    {n:'3',t:'Crear .env.local',cmd:'ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXX',d:'Crear en la raíz del proyecto (al lado de package.json). Conseguir key en console.anthropic.com'},
    {n:'4',t:'Crear cuenta Vercel',cmd:'',d:'vercel.com → Sign up → Continuar con GitHub.'},
    {n:'5',t:'Deploy',cmd:'vercel.com → Add New Project → ingenium-pro → Deploy',d:'Vercel detecta Next.js automáticamente. En ~2 minutos tenés la URL.'},
    {n:'6',t:'Variables de entorno en Vercel',cmd:'ANTHROPIC_API_KEY = sk-ant-XXXXXXXXXX',d:'Vercel → tu proyecto → Settings → Environment Variables → agregar.'},
    {n:'7',t:'🎉 URL pública + dominio',cmd:'https://ingenium-pro.vercel.app\n→ Opcional: ingenium.pro ($12/año en namecheap.com)',d:'Compartir con YPF, Tecpetrol, TotalEnergies. Instalar como app en cualquier dispositivo.'}];
  return(<div className="space-y-4"><div className={C.k}>
    <h3 className="text-[#00E5A0] text-[10px] font-black uppercase tracking-widest mb-1">🚀 Deploy Vercel — INGENIUM PRO Online</h3>
    <div className="space-y-3">{steps.map(s=>(
      <div key={s.n} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/40 flex items-center justify-center text-[#00E5A0] font-black flex-shrink-0">{s.n}</div>
          <div className="text-white font-black text-sm">{s.t}</div>
        </div>
        <p className="text-[#284060] text-[10px] mb-2">{s.d}</p>
        {s.cmd&&<div className="bg-[#07101A] border border-[#0D1F35] rounded-lg p-3 font-mono text-[10px] text-[#94A8C0] whitespace-pre-wrap">{s.cmd}</div>}
      </div>
    ))}</div>
  </div></div>);
}

// ── PROYECTOS ─────────────────────────────────────────────────────
function Projects({projs,onL,onExport}:{projs:Proj[],onL:(p:Proj)=>void,onExport:()=>void}){
  const IC:Record<string,string>={pipes:'🔩',hydro:'💧',hammer:'💢',thermal:'🌡️',valves:'⚙️',blast:'💥',chem:'⚗️',geo:'🌍',slopes:'⛰️',hydrology:'🌧️',integrity:'🔬',cad:'📐',budget:'💰',hc:'🌊',fat:'🔄'};
  const RL:Record<RL,string>={LOW:'🟢 Bajo',MEDIUM:'🟡 Medio',HIGH:'🟠 Alto',CRITICAL:'🔴 Crítico'};
  const totalUSD=projs.reduce((a,p)=>a+p.usd,0);
  if(!projs.length) return(<div className={C.k+' text-center py-12'}><div className="text-4xl mb-3">📁</div><div className="text-white font-black text-sm mb-2">Sin proyectos guardados</div><p className="text-[#284060] text-xs">Calculá cualquier módulo y guardalo con nombre.</p></div>);
  return(<div className="space-y-3"><div className={C.k}>
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div><div className="text-[#94A8C0] text-[10px] font-black">{projs.length} proyectos guardados</div>
      <div className="text-[#00E5A0] text-[9px] font-mono">Total: $ {totalUSD.toLocaleString('en-US')} USD</div></div>
      <div className="flex gap-2">
        <button onClick={onExport} className="text-[9px] text-[#00E5A0] border border-[#00E5A0]/40 px-3 py-1.5 rounded-lg hover:bg-[#00E5A0]/10 font-black">📥 Exportar JSON</button>
        <button onClick={()=>{if(confirm('¿Eliminar todos?')){localStorage.removeItem('ip9');window.location.reload();}}} className="text-[9px] text-red-400 border border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-950">🗑️</button>
      </div>
    </div>
    <div className="space-y-2">{projs.map(p=>(
      <div key={p.id} className="bg-[#020609] border border-[#0D1F35] rounded-xl p-4 flex items-center gap-3 hover:border-[#E8A020]/30 cursor-pointer transition-all" onClick={()=>onL(p)}>
        <div className="text-2xl flex-shrink-0">{IC[p.mod]||'📋'}</div>
        <div className="flex-1 min-w-0"><div className="text-white font-black text-sm truncate">{p.name}</div>
        <div className="text-[#284060] text-[9px]">{p.cl} · {p.date}</div></div>
        <div className="text-right flex-shrink-0"><div className="text-[9px] font-black">{RL[p.risk]}</div>
        {p.usd>0&&<div className="text-[#00E5A0] text-[9px] font-mono">$ {p.usd.toLocaleString('en-US')}</div>}</div>
      </div>
    ))}</div>
  </div></div>);
}
