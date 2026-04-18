'use client';
import ModuloPerforacion from '@/components/ModuloPerforacion';
import { useState, useRef, useEffect } from 'react';

type RL = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';

function calcMAOP(OD:number, t:number, SMYS:number, F=0.72, E_joint=1.0, T_op=20) {
  if(OD<=0||t<=0||SMYS<=0||t>=OD/2) return null;
  const T_factor = T_op<=120?1.0:T_op<=150?0.967:T_op<=175?0.933:T_op<=200?0.900:0.867;
  const ratio = t/OD, ro=OD/2, ri=ro-t;
  const Pb = (2*SMYS*t*F*E_joint*T_factor)/OD;
  const Pl = SMYS*F*E_joint*T_factor*(ro**2-ri**2)/(ro**2+ri**2);
  const P = ratio>0.15?Pl:ratio>0.10?Pb*(1-(ratio-0.10)/0.05)+Pl*(ratio-0.10)/0.05:Pb;
  return {
    P:+P.toFixed(3), bar:+(P*10).toFixed(2), psi:+(P*145).toFixed(0),
    reg:ratio>0.15?'PARED GRUESA  Lamé':ratio>0.10?'TRANSICIÁN':'PARED DELGADA  Barlow',
    ratio:+(ratio*100).toFixed(1), T_factor, E_joint
  };
}

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

function calcWaterHammer(Q:number, D:number, t:number, L:number, E_GPa:number, dV:number) {
  if(Q<=0||D<=0||L<=0) return null;
  const K_agua=2.2e9, E=E_GPa*1e9, rho=998;
  const a=Math.sqrt(K_agua/rho/(1+K_agua*D/(E*t)));
  const dP=rho*a*dV/1e6;
  const Tc=2*L/a;
  const risk:RL=dP>2?'CRITICAL':dP>1?'HIGH':dP>0.5?'MEDIUM':'LOW';
  return {a:+a.toFixed(0), dP_MPa:+dP.toFixed(3), dP_bar:+(dP*10).toFixed(2), Tc:+Tc.toFixed(2), risk};
}

function calcBishop(c:number, phi:number, gamma:number, H:number, beta:number) {
  if(H<=0||beta<=0) return null;
  const phiR=phi*Math.PI/180, betaR=beta*Math.PI/180;
  const N=gamma*H*Math.cos(betaR);
  const T=gamma*H*Math.sin(betaR);
  const FS=(c+N*Math.tan(phiR))/T;
  const risk:RL=FS<1.0?'CRITICAL':FS<1.25?'HIGH':FS<1.5?'MEDIUM':'LOW';
  return {FS:+FS.toFixed(3), N:+N.toFixed(1), T:+T.toFixed(1), risk};
}

function calcMeyerhof(c:number, phi:number, gamma:number, B:number, Df:number) {
  if(B<=0||Df<0) return null;
  const phiR=phi*Math.PI/180;
  const Nq=Math.exp(Math.PI*Math.tan(phiR))*Math.pow(Math.tan(Math.PI/4+phiR/2),2);
  const Nc=(Nq-1)/Math.tan(phiR);
  const Ng=2*(Nq+1)*Math.tan(phiR);
  const qu=c*Nc+gamma*Df*Nq+0.5*gamma*B*Ng;
  const qa=qu/3;
  const risk:RL=qa<50?'CRITICAL':qa<100?'HIGH':qa<200?'MEDIUM':'LOW';
  return {qu:+qu.toFixed(1), qa:+qa.toFixed(1), Nc:+Nc.toFixed(2), Nq:+Nq.toFixed(2), Ng:+Ng.toFixed(2), risk};
}

function calcThermal(L:number, T1:number, T2:number, mat='acero_carbono') {
  const alpha:Record<string,number>={'acero_carbono':11.7,'acero_inox_304':17.2,'hdpe':150,'cobre':17.0,'aluminio':23.6};
  const a=alpha[mat]||11.7;
  const dT=T2-T1;
  const dL=a*1e-6*L*dT*1000;
  const risk:RL=Math.abs(dL)>50?'CRITICAL':Math.abs(dL)>20?'HIGH':Math.abs(dL)>5?'MEDIUM':'LOW';
  return {dL:+dL.toFixed(1), dT, alpha:a, risk};
}

function interpretQuery(q: string) {
  const lower = q.toLowerCase();
  const nums = (q.match(/\d+\.?\d*/g)||[]).map(Number);

  if (lower.includes('maop')||lower.includes('presión máxima')||lower.includes('gasoducto')||lower.includes('oleoducto')) {
    const OD = nums.find(n=>n>50&&n<2000)||323.9;
    const t = nums.find(n=>n>2&&n<50)||9.5;
    const SMYS = nums.find(n=>n>200&&n<700)||359;
    const res = calcMAOP(OD/1000, t/1000, SMYS);
    if(!res) return null;
    return {
      type:'MAOP', title:'Presión Máxima Admisible (MAOP)', norma:'ASME B31.8 841.11',
      inputs:{OD:`${OD} mm`, t:`${t} mm`, SMYS:`${SMYS} MPa`, F:'0.72'},
      results:[
        {label:'MAOP', value:`${res.P} MPa`, highlight:true},
        {label:'MAOP', value:`${res.bar} bar`},
        {label:'MAOP', value:`${res.psi} psi`},
        {label:'Régimen', value:res.reg},
        {label:'Relación t/D', value:`${res.ratio}%`},
      ], risk:'LOW' as RL
    };
  }
  if (lower.includes('golpe')||lower.includes('ariete')||lower.includes('joukowsky')) {
    const D=(nums.find(n=>n>100&&n<2000)||400)/1000;
    const L=nums.find(n=>n>100&&n<50000)||2000;
    const res=calcWaterHammer(100,D,0.008,L,200,2);
    if(!res) return null;
    return {
      type:'WATERHAMMER', title:'Golpe de Ariete (Joukowsky)', norma:'AWWA M11 / Joukowsky',
      inputs:{D:`${D*1000} mm`, L:`${L} m`, dV:'2 m/s'},
      results:[
        {label:'Celeridad de onda', value:`${res.a} m/s`, highlight:true},
        {label:'Sobrepresión', value:`${res.dP_MPa} MPa`, highlight:true},
        {label:'Sobrepresión', value:`${res.dP_bar} bar`},
        {label:'Tiempo crítico', value:`${res.Tc} s`},
      ], risk:res.risk
    };
  }
  if (lower.includes('darcy')||lower.includes('pérdida')||lower.includes('caudal')||lower.includes('hidráulica')||lower.includes('tubería')) {
    const Q=nums.find(n=>n>0.1&&n<10000)||50;
    const D=(nums.find(n=>n>50&&n<2000)||200)/1000;
    const L=nums.find(n=>n>10&&n<100000)||1000;
    const res=calcDW(Q,D,L);
    if(!res) return null;
    return {
      type:'DARCY', title:'Pérdidas Hidráulicas (Darcy-Weisbach)', norma:'Darcy-Weisbach / Colebrook-White',
      inputs:{Q:`${Q} L/s`, D:`${D*1000} mm`, L:`${L} m`},
      results:[
        {label:'Velocidad', value:`${res.V} m/s`, highlight:true},
        {label:'Pérdida de carga', value:`${res.hf} m`, highlight:true},
        {label:'Reynolds', value:res.Re.toString()},
        {label:'Régimen', value:res.reg},
        {label:'P', value:`${res.dP} kPa`},
      ], risk:res.V>3?'HIGH':res.V>2?'MEDIUM':'LOW' as RL
    };
  }
  if (lower.includes('talud')||lower.includes('bishop')||lower.includes('estabilidad')) {
    const H=nums.find(n=>n>1&&n<100)||10;
    const beta=nums.find(n=>n>10&&n<80)||30;
    const res=calcBishop(20,25,18,H,beta);
    if(!res) return null;
    return {
      type:'BISHOP', title:'Estabilidad de Taludes (Bishop)', norma:'USACE EM 1110-2-1902',
      inputs:{H:`${H} m`, beta:`${beta}°`, c:'20 kPa', phi:'25°'},
      results:[
        {label:'Factor de seguridad', value:res.FS.toString(), highlight:true},
        {label:'Fuerza normal', value:`${res.N} kN/m`},
        {label:'Fuerza tangencial', value:`${res.T} kN/m`},
        {label:'Estado', value:res.FS>=1.5?'ESTABLE':res.FS>=1.25?'CONDICIONALMENTE ESTABLE':'INESTABLE'},
      ], risk:res.risk
    };
  }
  if (lower.includes('cimentación')||lower.includes('portante')||lower.includes('meyerhof')||lower.includes('suelo')||lower.includes('fundación')) {
    const B=nums.find(n=>n>0.5&&n<20)||2;
    const Df=nums.find(n=>n>0.3&&n<10)||1.5;
    const res=calcMeyerhof(20,25,18,B,Df);
    if(!res) return null;
    return {
      type:'MEYERHOF', title:'Capacidad Portante (Meyerhof)', norma:'Meyerhof (1963)',
      inputs:{B:`${B} m`, Df:`${Df} m`, c:'20 kPa', phi:'25°'},
      results:[
        {label:'Cap. última', value:`${res.qu} kPa`, highlight:true},
        {label:'Cap. admisible', value:`${res.qa} kPa`, highlight:true},
        {label:'Nc', value:res.Nc.toString()},
        {label:'Nq', value:res.Nq.toString()},
      ], risk:res.risk
    };
  }
  if (lower.includes('dilatación')||lower.includes('térmica')||lower.includes('expansión')||lower.includes('temperatura')) {
    const L=nums.find(n=>n>1&&n<10000)||100;
    const T1=nums.find(n=>n>-50&&n<100)||20;
    const T2=nums.find(n=>n>50&&n<500)||80;
    const res=calcThermal(L,T1,T2);
    if(!res) return null;
    return {
      type:'THERMAL', title:'Dilatación Térmica (ASME B31.3)', norma:'ASME B31.3 Appendix C',
      inputs:{L:`${L} m`, T1:`${T1}°C`, T2:`${T2}°C`},
      results:[
        {label:'Dilatación', value:`${res.dL} mm`, highlight:true},
        {label:'T', value:`${res.dT}°C`},
        {label:'', value:`${res.alpha} Á—10/°C`},
      ], risk:res.risk
    };
  }
  return null;
}

const riskColors:Record<RL,string>={
  LOW:'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  MEDIUM:'text-amber-400 bg-amber-400/10 border-amber-400/30',
  HIGH:'text-orange-400 bg-orange-400/10 border-orange-400/30',
  CRITICAL:'text-red-400 bg-red-400/10 border-red-400/30',
};
const riskLabel:Record<RL,string>={LOW:' SEGURO',MEDIUM:' MODERADO',HIGH:'¡ ALTO',CRITICAL:' CRÁTICO'};

interface CalcResult {
  type:string; title:string; norma:string;
  inputs:Record<string,string>;
  results:{label:string;value:string;highlight?:boolean}[];
  risk:RL;
}
interface Message {
  role:'user'|'assistant'; content:string;
  calcResult?:CalcResult; loading?:boolean;
}

export default function IngeniumPro() {
  const [messages,setMessages]=useState<Message[]>([{
    role:'assistant',
    content:'**Bienvenido a INGENIUM PRO v8.0**\n\nSoy tu asistente de ingeniería técnica de precisión. Calculá y analizá:\n\n **MAOP**  Presión máxima gasoductos/oleoductos (ASME B31.8)\n **Golpe de ariete**  Joukowsky completo\n **Pérdidas hidráulicas**  Darcy-Weisbach\n **Estabilidad de taludes**  Bishop\n **Capacidad portante**  Meyerhof\n **Dilatación térmica**  ASME B31.3\n\nEscribí tu consulta técnica con los datos del proyecto.'
  }]);
 const [moduloActivo, setModuloActivo] = useState('chat');
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const endRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages]);

  const send=async()=>{
    if(!input.trim()||loading) return;
    const userMsg=input.trim();
    setInput('');
    setLoading(true);
    setMessages(prev=>[...prev,{role:'user',content:userMsg}]);
    const calc=interpretQuery(userMsg);
    if(calc){
      setMessages(prev=>[...prev,{role:'assistant',content:'',calcResult:calc,loading:true}]);
      try{
        const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({message:`Eres INGENIUM PRO. El usuario consultó: "${userMsg}". Resultados de ${calc.title}: ${JSON.stringify(calc.results)}. Norma: ${calc.norma}. Analizá en 3 oraciones técnicas profesionales en español: interpretá los resultados, si son seguros y qué recomendar.`})});
        const data=await res.json();
        setMessages(prev=>prev.map(m=>m.loading?{...m,content:data.reply||'Análisis completado.',loading:false}:m));
      }catch{
        setMessages(prev=>prev.map(m=>m.loading?{...m,content:'Cálculo completado según normativa vigente.',loading:false}:m));
      }
    }else{
      try{
        const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg})});
        const data=await res.json();
        setMessages(prev=>[...prev,{role:'assistant',content:data.reply||'No pude procesar la consulta.'}]);
      }catch{
        setMessages(prev=>[...prev,{role:'assistant',content:'Error de conexión.'}]);
      }
    }
    setLoading(false);
  };

  const examples=['MAOP gasoducto 12" X65 junta ERW post-1970','Golpe de ariete acueducto DN400 L=2km','Pérdidas hidráulicas Q=80 L/s D=300mm L=500m','Estabilidad talud 30° H=8m arcilla','Capacidad portante cimentación B=2m Df=1.5m','Dilatación térmica 100m acero T=60°C'];

  return(
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
      <header className="border-b border-white/10 bg-[#0d1526]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-sm">©</div>
            <div>
              <div className="font-bold tracking-wide">INGENIUM PRO</div>
              <div className="text-xs text-slate-400">v8.0 · Plataforma de Ingeniería Técnica</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400 font-medium">ACTIVO</span>
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 bg-[#0d1526]/50">
        <div className="max-w-5xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
          {[{i:'',l:'Petróleo'},{i:'',l:'Hidráulica'},{i:'',l:'Minería'},{i:,l:'Civil'},{i:'',l:'Geotecnia'},{i:'',l:'Térmica'},{i:'',l:'Vialidad'},{i:'',l:'Arquitectura'}].map(m=>(
            <button key={m.l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 transition-all text-xs whitespace-nowrap">
              <span>{m.i}</span><span className="text-slate-300">{m.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg,i)=>(
            <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
              {msg.role==='assistant'&&<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold mr-3 mt-1 shrink-0">©</div>}
              <div className="max-w-2xl">
                {msg.role==='user'?(
                  <div className="bg-violet-600/20 border border-violet-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm">{msg.content}</div>
                ):(
                  <div className="space-y-3">
                    {msg.calcResult&&(
                      <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-900/40 to-cyan-900/40 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{msg.calcResult.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5"> {msg.calcResult.norma}</div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${riskColors[msg.calcResult.risk]}`}>{riskLabel[msg.calcResult.risk]}</span>
                        </div>
                        <div className="px-4 py-3 border-b border-white/5">
                          <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Parámetros</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(msg.calcResult.inputs).map(([k,v])=>(
                              <span key={k} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300"><span className="text-slate-500">{k}:</span> {v}</span>
                            ))}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Resultados</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {msg.calcResult.results.map((r,j)=>(
                              <div key={j} className={`rounded-lg p-3 ${r.highlight?'bg-violet-500/10 border border-violet-500/30':'bg-white/3 border border-white/5'}`}>
                                <div className="text-xs text-slate-400 mb-1">{r.label}</div>
                                <div className={`font-bold ${r.highlight?'text-violet-300 text-base':'text-slate-200 text-sm'}`}>{r.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {msg.loading?(
                      <div className="flex items-center gap-2 text-sm text-slate-400 px-1">
                        <div className="flex gap-1">
                          {[0,150,300].map(d=><div key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}></div>)}
                        </div>
                        <span>Analizando...</span>
                      </div>
                    ):msg.content?(
                      <div className="text-sm text-slate-300 leading-relaxed px-1">
                        {msg.content.split('**').map((part,idx)=>idx%2===1?<strong key={idx} className="text-white">{part}</strong>:part)}
                      </div>
                    ):null}
                  </div>
                )}
              </div>
            </div>
          ))}
          {messages.length<=1&&(
            <div className="text-center space-y-3">
              <div className="text-xs text-slate-500">Consultas de ejemplo</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {examples.map(ex=>(
                  <button key={ex} onClick={()=>setInput(ex)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 rounded-full text-slate-400 hover:text-violet-300 transition-all">{ex}</button>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0d1526]/90 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-white/5 border border-white/10 focus-within:border-violet-500/50 rounded-xl transition-all">
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
                placeholder="Consultá tu cálculo técnico de ingeniería... (Enter para enviar)"
                rows={1} disabled={loading}
                className="w-full bg-transparent px-4 py-3 text-sm placeholder-slate-500 resize-none outline-none"
                style={{maxHeight:'100px'}}
                onInput={e=>{const t=e.target as HTMLTextAreaElement;t.style.height='auto';t.style.height=Math.min(t.scrollHeight,100)+'px'}}
              />
            </div>
            <button onClick={send} disabled={loading||!input.trim()}
              className="w-11 h-11 bg-gradient-to-br from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-lg shadow-violet-500/20">
              {loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-600">INGENIUM PRO v8.0 · ASME · API · AWWA · USACE · © Silvana Belén Colombo 2026</span>
          </div>
        </div>
      </div>
      {moduloActivo === 'perforacion' && <ModuloPerforacion />}
    </div>
  );
  
}
