'use client';
import { useState } from 'react';

// MÃ“DULO ELECTRICIDAD INDUSTRIAL â€” INGENIUM PRO v8.0
// Verificado: IEC 60228, NEC 2023 Â§310.15(B)(16), IEC 60364-5-52,
// IEC 60909, API RP 500:2012, IEC 60079-10-1, IEC 60079-0,
// IEEE 80, IES/IESNA, EN 12464-1, API RP 54 Â§5.9, IEC 60076, IEEE C57

const COLOR = '#22c55e';

// â•â•â• RESISTENCIA IEC 60228 + AMPACIDAD NEC 310.15(B)(16) â•â•â•
// R a 20Â°C en Î©/km â€” Ampacidad a 75Â°C en conduit, Cu y Al
const CABLES: Record<string, { R_cu: number; R_al: number; Iz_cu: number; Iz_al: number }> = {
  '1.5 mmÂ²':  { R_cu: 12.10, R_al: 0,     Iz_cu: 15, Iz_al: 0   },
  '2.5 mmÂ²':  { R_cu: 7.41,  R_al: 12.10, Iz_cu: 20,  Iz_al: 15  },
  '4 mmÂ²':    { R_cu: 4.61,  R_al: 7.41,  Iz_cu: 30,  Iz_al: 25  },
  '6 mmÂ²':    { R_cu: 3.08,  R_al: 4.61,  Iz_cu: 50,  Iz_al: 40  },
  '10 mmÂ²':   { R_cu: 1.83,  R_al: 3.08, Iz_cu: 65,  Iz_al: 50  },
'16 mmÂ²':   { R_cu: 1.15,  R_al: 1.91, Iz_cu: 85,  Iz_al: 65  },
  '25 mmÂ²':   { R_cu: 0.727, R_al: 1.20,  Iz_cu: 100, Iz_al: 80  },
  '35 mmÂ²':   { R_cu: 0.524, R_al: 0.868, Iz_cu: 115, Iz_al: 95  },
  '50 mmÂ²':   { R_cu: 0.387, R_al: 0.641, Iz_cu: 130, Iz_al: 105 },
  '70 mmÂ²':   { R_cu: 0.268, R_al: 0.443, Iz_cu: 150, Iz_al: 125 },
  '95 mmÂ²':  { R_cu: 0.193, R_al: 0.320, Iz_cu: 175, Iz_al: 150 },
  '120 mmÂ²':  { R_cu: 0.153, R_al: 0.253, Iz_cu: 200, Iz_al: 165 },
  '150 mmÂ²':  { R_cu: 0.124, R_al: 0.206, Iz_cu: 230, Iz_al: 190 },
  '185 mmÂ²':  { R_cu: 0.0991,R_al: 0.164, Iz_cu: 255, Iz_al: 210 },
  '240 mmÂ²':  { R_cu: 0.0754,R_al: 0.125, Iz_cu: 310, Iz_al: 260 },
};

// â•â•â• LUX MÃNIMOS â€” IES/IESNA, EN 12464-1, API RP 54, ISO 8995 â•â•â•
const LUX_APP: Record<string, { lux: number; norma: string; sector: string }> = {
  emergencia:       { lux: 10,  norma: 'IEC 60364-5-55',    sector: 'Todas' },
  almacen:          { lux: 200, norma: 'EN 12464-1',         sector: 'MMO/Civil' },
galeria_minera:   { lux: 200, norma: 'MSHA / ISO 8995',   sector: 'MinerÃ­a' },
  drill_floor:    { lux: 300, norma: 'API RP 54 Â§5.9',    sector: 'PerforaciÃ³n' },
  turbinas_represa: { lux: 300, norma: 'USACE EM 1110-2',   sector: 'Represas' },
  sala_control:     { lux: 500, norma: 'IEC 61511',         sector: 'PetrÃ³leo/Gas' },
  taller:          { lux: 500, norma: 'EN 12464-1',        sector: 'Industrial' },
  oficina:          { lux: 500, norma: 'EN 12464-1',        sector: 'Todas' },
  laboratorio:     { lux: 750, norma: 'EN 12464-1',        sector: 'Civil/PetrÃ³leo' },
};

// â•â•â• ZONAS PELIGROSAS â€” IEC 60079-10-1 / API RP 500:2012 â•â•â•
const ZONAS = {
  zona0: { iec:'Zona 0',  api:'DivisiÃ³n 1', desc:'AtmÃ³sfera explosiva CONTINUA (>1000 h/aÃ±o)',  equipo:'Ex ia â€” CategorÃ­a 1G', color:'#ef4444' },
  zona1: { iec:'Zona 1',  api:'DivisiÃ³n 1', desc:'AtmÃ³sfera explosiva OCASIONAL (10-1000 h/aÃ±o)', equipo:'Ex d, Ex e, Ex ib â€” CategorÃ­a 2G', color:'#f59e0b' },
zona2: { iec:'Zona 2', api:'DivisiÃ³n 2', desc:'AtmÃ³sfera explosiva INFRECUENTE (<10 h/aÃ±o)', equipo:'Ex nA, Ex nC â€” CategorÃ­a 3G', color:'#22c55e' },
};

type Sub = 'cable'|'caida'|'cc'|'fp'|'motor'|'peligrosa'|'luz'|'trafo';
const SUBS: {id:Sub; label:string; icon:string}[] = [
  { id:'cable',     label:'Calibre Cable',  icon:'ðŸ”Œ' },
  { id:'caida',     label:'CaÃ­da TensiÃ³n',   icon:'âš¡' },
{ id:'cc',        label:'Cortocircuito',   icon:'ðŸ’¥' },
{ id:'fp',        label:'Factor Potencia', icon:'ðŸ”‹' },
{ id:'motor',    label:'Motor',           icon:'âš™ï¸' },
  { id:'peligrosa', label:'Ãrea Peligrosa',  icon:'â˜ ï¸' },
  { id:'luz',      label:'IluminaciÃ³n',     icon:'ðŸ’¡' },
  { id:'trafo',     label:'Transformador', icon:'ðŸ”„' },
];

const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#0a0f1e', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box' };
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontWeight:600, color:'#64748b', marginBottom:6, letterSpacing:0.5, textTransform:'uppercase' };
const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 };
const g3: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 };
const g4: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:16 };

function Tit({t}:{t:string}){ return <div style={{fontSize:11,color:COLOR,fontWeight:700,letterSpacing:1,marginBottom:16,textTransform:'uppercase' as const}}>{t}</div>; }
function Btn({onClick,text}:{onClick:()=>void;text:string}){ return <button onClick={onClick} style={{width:'100%',padding:'13px 0',marginBottom:20,background:`linear-gradient(135deg,${COLOR},#16a34a)`,border:'none',borderRadius:12,color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(34,197,94,0.4)'}}>{text}</button>; }
function Info({t}:{t:string}){ return <div style={{fontSize:12,color:'#475569',marginBottom:12,padding:'8px 12px',background:'rgba(34,197,94,0.05)',borderRadius:8}}>{t}</div>; }
function Warn({t}:{t:string}){ return <div style={{fontSize:11,color:'#f59e0b',padding:'8px 12px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,marginTop:8}}>{t}</div>; }
function Err({t}:{t:string}){ return <div style={{padding:'10px 16px',borderRadius:10,marginBottom:16,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13}}>{t}</div>; }
function Card({label,val,sub,color}:{label:string;val:string;sub?:string;color?:string}){
  return <div style={{background:'#0a0f1e',borderRadius:10,padding:14}}>
  <div style={{fontSize:9,color:'#475569',textTransform:'uppercase' as const,marginBottom:4,letterSpacing:0.4}}>{label}</div>
    <div style={{fontSize:16,fontWeight:800,color:color||COLOR}}>{val}</div>
  {sub&&<div style={{fontSize:11,color:'#334155',marginTop:2}}>{sub}</div>}
  </div>;
}
function ResBox({children,ok}:{children:React.ReactNode;ok?:boolean}){
  const bg=ok===undefined?'rgba(34,197,94,0.08)':ok?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)';
  const br=ok===undefined?'rgba(34,197,94,0.25)':ok?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)';
  return <div style={{background:bg,border:`1px solid ${br}`,borderRadius:16,padding:20}}>{children}</div>;
}

export default function ModuloElectricidad() {
const [sub, setSub] = useState<Sub>('cable');
  const [err, setErr] = useState('');

  // CABLE STATE
  const [cI, setCi] = useState('100');
  const [cMat, setCmat] = useState<'cu'|'al'>('cu');
  const [cTipo, setCt] = useState<'monof'|'trif'>('trif');
  const [resCable, setResCable] = useState<null|{calibre:string;Iz:number;I:number}>(null);

  // CAÃDA STATE
const [cdCable, setCdcable] = useState('25 mmÂ²');
  const [cdL, setCdl] = useState('100');
  const [cdI, setCdi] = useState('80');
  const [cdV, setCdv] = useState('380');
  const [cdTipo, setCdtipo] = useState<'monof'|'trif'>('trif');
const [cdFP, setCdfp] = useState('0.85');
  const [resCd, setResCd] = useState<null|{dV:number;pct:number;ok:boolean}>(null);

  // CC STATE
  const [ccS, setCcs] = useState('1000');
  const [ccUk, setCcuk] = useState('5');
  const [ccV, setCcv] = useState('400');
const [ccL, setCcl] = useState('50');
  const [ccCable, setCccable] = useState('25 mmÂ²');
  const [resCc, setResCc] = useState<null|{Imax:number;Imin:number;Pcc:number}>(null);

  // FP STATE
const [fpP, setFpp] = useState('500');
  const [fpFP1, setFpfp1] = useState('0.75');
  const [fpFP2, setFpfp2] = useState('0.95');
const [fpV, setFpv] = useState('380');
  const [fpF, setFpf] = useState('50');
  const [resFP, setResFP] = useState<null|{Qc:number;C:number;I1:number;I2:number}>(null);

  // MOTOR STATE
const [mP, setMp] = useState('75');
const [mV, setMv] = useState('380');
  const [mFP, setMfp] = useState('0.85');
const [mEta, setMeta] = useState('0.93');
const [resMot, setResMot] = useState<null|{Inom:number;Iarr:number;Pelec:number;calibre:string}>(null);

  // ÃREA PELIGROSA STATE
  const [apZona, setApzona] = useState<'zona0'|'zona1'|'zona2'>('zona1');
  const [apGas, setApgas] = useState('Metano (CHâ‚„) â€” Grupo IIA');
  const [apInd, setApind] = useState('PetrÃ³leo / Gas');

  // LUZ STATE
  const [lApp, setLapp] = useState('drill_floor');
const [lArea, setLarea] = useState('200');
  const [lLm, setLlm] = useState('5000');
  const [lEta, setLeta] = useState('0.75');
  const [lMF, setLmf] = useState('0.75');
const [resLuz, setResLuz] = useState<null|{N:number;luxReal:number;ok:boolean}>(null);

  // TRAFO STATE
  const [trP, setTrp] = useState('500');
const [trFP, setTrfp] = useState('0.85');
  const [trEta, setTreta] = useState('0.98');
  const [trVp, setTrvp] = useState('13200');
  const [trVs, setTrvs] = useState('400');
  const [resTr, setResTr] = useState<null|{S:number;Ip:number;Is:number;Iarr:number}>(null);

  const R = () => setErr('');

  const calcCable = () => {
   R();
   const I = parseFloat(cI);
   if (isNaN(I)||I<=0){setErr('Corriente invÃ¡lida');return;}
    const entry = Object.entries(CABLES).find(([,c])=>(cMat==='cu'?c.Iz_cu:c.Iz_al)>=I);
    if(!entry){setErr('Corriente excede catÃ¡logo â€” consultar ingenierÃ­a especializada');return;}
    setResCable({calibre:entry[0], Iz:cMat==='cu'?entry[1].Iz_cu:entry[1].Iz_al, I});
  };

const calcCaida = () => {
   R();
  const L=parseFloat(cdL),I=parseFloat(cdI),V=parseFloat(cdV),FP=parseFloat(cdFP);
   if([L,I,V,FP].some(n=>isNaN(n)||n<=0)){setErr('Valores invÃ¡lidos');return;}
    const c=CABLES[cdCable];
    if(!c){setErr('Cable no encontrado');return;}
    // R a 75Â°C: R_75 = R_20 Ã— (1 + 0.00393 Ã— 55) = R_20 Ã— 1.216 â€” IEC 60228
  const R75 = c.R_cu*1.216/1000; // Î©/m
    const X = 0.00008; // Î©/m reactancia tÃ­pica para cable en conduit
    const sinFP = Math.sqrt(1-FP*FP);
    const dV = cdTipo==='monof'
     ? 2*L*I*(R75*FP+X*sinFP)
  : Math.sqrt(3)*L*I*(R75*FP+X*sinFP);
   const pct = (dV/V)*100;
   setResCd({dV:Math.round(dV*100)/100, pct:Math.round(pct*100)/100, ok:pct<=4});
  };

  const calcCC = () => {
   R();
   const S=parseFloat(ccS),uk=parseFloat(ccUk),V=parseFloat(ccV),L=parseFloat(ccL);
   if([S,uk,V,L].some(n=>isNaN(n)||n<=0)){setErr('Valores invÃ¡lidos');return;}
    const c=CABLES[ccCable];
   if(!c){setErr('Cable no encontrado');return;}
   // Zt = (uk% Ã— VÂ²) / (100 Ã— S_VA) â€” IEC 60909
   const Zt = (uk/100)*(V*V)/(S*1000);
   const R75 = c.R_cu*1.216/1000;
    const Zc = R75*L;
   // Icc_max: c=1.1, Icc_min: c=0.95 (IEC 60909 Â§4.3.1)
  const Imax = (1.1*V)/(Math.sqrt(3)*(Zt+Zc));
const Imin = (0.95*V)/(Math.sqrt(3)*(Zt+2*Zc));
    const Pcc = Math.sqrt(3)*V*Imax/1000;
setResCc({Imax:Math.round(Imax/10)*10, Imin:Math.round(Imin/10)*10, Pcc:Math.round(Pcc)});
  };

const calcFP = () => {
  R();
  const P=parseFloat(fpP),FP1=parseFloat(fpFP1),FP2=parseFloat(fpFP2),V=parseFloat(fpV),f=parseFloat(fpF);
  if([P,FP1,FP2,V,f].some(n=>isNaN(n)||n<=0)||FP1>=FP2){setErr('FP2 debe ser mayor que FP1');return;}
const tan1=Math.tan(Math.acos(FP1)), tan2=Math.tan(Math.acos(FP2));
  const Qc=P*(tan1-tan2);
   // C = QcÃ—1000 / (2Ï€ Ã— f Ã— VÂ²) â€” en ÂµF por fase
    const C=(Qc*1000)/(2*Math.PI*f*V*V)*1e6;
  const I1=(P*1000)/(Math.sqrt(3)*V*FP1);
    const I2=(P*1000)/(Math.sqrt(3)*V*FP2);
  setResFP({Qc:Math.round(Qc*10)/10, C:Math.round(C*10)/10, I1:Math.round(I1), I2:Math.round(I2)});
  };

  const calcMotor = () => {
    R();
  const P=parseFloat(mP),V=parseFloat(mV),FP=parseFloat(mFP),eta=parseFloat(mEta);
    if([P,V,FP,eta].some(n=>isNaN(n)||n<=0)){setErr('Valores invÃ¡lidos');return;}
const Pelec=P/eta;
   const Inom=(Pelec*1000)/(Math.sqrt(3)*V*FP);
   const Iarr=6*Inom; // DOL tÃ­pico Ã— 6
  // Cable: 1.25 Ã— I_nom â€” NEC 430.52
    const Idis=1.25*Inom;
    const ce=Object.entries(CABLES).find(([,c])=>c.Iz_cu>=Idis);
   setResMot({Inom:Math.round(Inom*10)/10, Iarr:Math.round(Iarr), Pelec:Math.round(Pelec*10)/10, calibre:ce?ce[0]:'Consultar especialista'});
  };

  const calcLuz = () => {
    R();
    const A=parseFloat(lArea),Phi=parseFloat(lLm),eta=parseFloat(lEta),MF=parseFloat(lMF);
    if([A,Phi,eta,MF].some(n=>isNaN(n)||n<=0)){setErr('Valores invÃ¡lidos');return;}
    const app=LUX_APP[lApp];
    const CU=0.60; // Coeficiente de utilizaciÃ³n estÃ¡ndar IES
  const N=Math.ceil((app.lux*A)/(Phi*eta*MF*CU));
   const luxReal=Math.round((N*Phi*eta*MF*CU)/A);
  setResLuz({N, luxReal, ok:luxReal>=app.lux});
  };

const calcTrafo = () => {
    R();
    const P=parseFloat(trP),FP=parseFloat(trFP),eta=parseFloat(trEta),Vp=parseFloat(trVp),Vs=parseFloat(trVs);
    if([P,FP,eta,Vp,Vs].some(n=>isNaN(n)||n<=0)){setErr('Valores invÃ¡lidos');return;}
    const S=P/(FP*eta);
   const Ip=(S*1000)/(Math.sqrt(3)*Vp);
    const Is=(S*1000)/(Math.sqrt(3)*Vs);
    const Iarr=10*Is; // Inrush IEC 60076: 8-12 Ã— I_nom, tÃ­pico 10Ã—
   setResTr({S:Math.round(S*10)/10, Ip:Math.round(Ip*10)/10, Is:Math.round(Is), Iarr:Math.round(Iarr)});
  };

  const zd = ZONAS[apZona];

  return (
    <div style={{padding:24,color:'#f1f5f9',fontFamily:'Inter,sans-serif',maxWidth:960,margin:'0 auto'}}>

     {/* HEADER */}
     <div style={{background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05))',border:'1px solid rgba(34,197,94,0.3)',borderRadius:16,padding:24,marginBottom:16,display:'flex',alignItems:'center',gap:16}}>
       <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>âš¡</div>
        <div style={{flex:1}}>
        <div style={{fontSize:20,fontWeight:800}}>Electricidad Industrial</div>
          <div style={{fontSize:12,color:'#64748b'}}>PerforaciÃ³n Â· PetrÃ³leo Â· MinerÃ­a Â· Represas Â· MMO Â· Civil â€” Calibre Â· CaÃ­da Â· CC Â· FP Â· Motor Â· Ãrea Peligrosa Â· IluminaciÃ³n Â· Transformador</div>
          <div style={{fontSize:11,color:COLOR,marginTop:4}}>NEC 2023 Â· IEC 60228 Â· IEC 60364 Â· IEC 60909 Â· IEC 60079 Â· API RP 500 Â· IEEE 80 Â· IES/IESNA Â· EN 12464-1 Â· API RP 54 Â· IEC 60076</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:'flex',background:'#0a0f1e',borderRadius:12,padding:4,marginBottom:24,border:'1px solid rgba(34,197,94,0.15)',overflowX:'auto' as const,gap:3}}>
       {SUBS.map(s=>(
          <button key={s.id} onClick={()=>{setSub(s.id);R();}}
            style={{flex:1,padding:'9px 8px',border:'none',borderRadius:9,cursor:'pointer',fontSize:11,fontWeight:700,whiteSpace:'nowrap' as const,background:sub===s.id?'linear-gradient(135deg,#22c55e,#16a34a)':'transparent',color:sub===s.id?'#fff':'#475569',boxShadow:sub===s.id?'0 4px 12px rgba(34,197,94,0.4)':'none'}}>
            {s.icon} {s.label}
         </button>
       ))}
      </div>

      {err&&<Err t={err}/>}

     {/* â•â• CALIBRE CABLE â•â• */}
      {sub==='cable'&&(
        <div>
          <Tit t="SelecciÃ³n de calibre de cable â€” NEC 310.15(B)(16) / IEC 60364-5-52"/>
          <div style={g3}>
            <div><label style={lbl}>Tipo circuito</label>
              <select value={cTipo} onChange={e=>setCt(e.target.value as 'monof'|'trif')} style={inp}>
                <option value="monof" style={{background:'#0a0f1e'}}>MonofÃ¡sico 1F</option>
             <option value="trif" style={{background:'#0a0f1e'}}>TrifÃ¡sico 3F</option>
             </select>
            </div>
            <div><label style={lbl}>Corriente de diseÃ±o (A)</label>
              <input value={cI} onChange={e=>setCi(e.target.value)} style={inp} type="number" min="1" step="1"/>
            </div>
            <div><label style={lbl}>Material conductor</label>
              <select value={cMat} onChange={e=>setCmat(e.target.value as 'cu'|'al')} style={inp}>
               <option value="cu" style={{background:'#0a0f1e'}}>Cobre (Cu) â€” Recomendado</option>
                <option value="al" style={{background:'#0a0f1e'}}>Aluminio (Al) â€” â‰¥16 mmÂ²</option>
              </select>
            </div>
          </div>
          <Info t="Ampacidades a 75Â°C en conduit, temperatura ambiente 30Â°C â€” NEC 310.15(B)(16) / IEC 60364-5-52 Tabla B.52.4"/>
        <Btn onClick={calcCable} text="Seleccionar calibre mÃ­nimo"/>
          {resCable&&(
           <ResBox>
        <div style={{fontSize:12,color:COLOR,fontWeight:700,marginBottom:14}}>âœ… CALIBRE RECOMENDADO</div>
           <div style={g3}>
                <Card label="Calibre mÃ­nimo" val={resCable.calibre}/>
              <Card label="Capacidad Iz" val={`${resCable.Iz} A`} sub="A 75Â°C en conduit"/>
              <Card label="Corriente diseÃ±o" val={`${resCable.I} A`}/>
             </div>
             <div style={{background:'#0a0f1e',borderRadius:10,padding:14,marginTop:12}}>
               <div style={{fontSize:10,color:COLOR,fontWeight:700,marginBottom:8}}>TABLA COMPLETA IEC 60228 / NEC â€” COBRE 75Â°C EN CONDUIT</div>
               <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:2}}>
                  <div style={{fontSize:9,color:'#334155',fontWeight:700}}>CALIBRE</div>
                  <div style={{fontSize:9,color:'#334155',fontWeight:700}}>R (Î©/km) 20Â°C</div>
                 <div style={{fontSize:9,color:'#334155',fontWeight:700}}>Iz COBRE</div>
                  {Object.entries(CABLES).map(([k,v])=>[
                    <div key={k+'a'} style={{fontSize:10,color:k===resCable.calibre?COLOR:'#475569',fontWeight:k===resCable.calibre?700:400,padding:'2px 0'}}>{k}</div>,
                    <div key={k+'b'} style={{fontSize:10,color:'#475569',padding:'2px 0'}}>{v.R_cu}</div>,
                 <div key={k+'c'} style={{fontSize:10,color:k===resCable.calibre?COLOR:'#64748b',padding:'2px 0'}}>{v.Iz_cu} A</div>
                ])}
                </div>
             </div>
           </ResBox>
        )}
        </div>
  )}

    {/* â•â• CAÃDA DE TENSIÃ“N â•â• */}
  {sub==='caida'&&(
       <div>
          <Tit t="CaÃ­da de tensiÃ³n â€” IEC 60364-5-52 / NEC 210.19 / CIRSOC 900"/>
         <div style={g2}>
            <div><label style={lbl}>Cable seleccionado</label>
              <select value={cdCable} onChange={e=>setCdcable(e.target.value)} style={inp}>
                {Object.keys(CABLES).map(k=><option key={k} value={k} style={{background:'#0a0f1e'}}>{k}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Tipo de circuito</label>
              <select value={cdTipo} onChange={e=>setCdtipo(e.target.value as 'monof'|'trif')} style={inp}>
                <option value="monof" style={{background:'#0a0f1e'}}>MonofÃ¡sico (2Ã—L)</option>
            <option value="trif" style={{background:'#0a0f1e'}}>TrifÃ¡sico (âˆš3Ã—L)</option>
              </select>
            </div>
          <div><label style={lbl}>Longitud del cable (m)</label>
              <input value={cdL} onChange={e=>setCdl(e.target.value)} style={inp} type="number" min="1" step="1"/>
            </div>
          <div><label style={lbl}>Corriente (A)</label>
              <input value={cdI} onChange={e=>setCdi(e.target.value)} style={inp} type="number" min="1" step="1"/>
            </div>
            <div><label style={lbl}>TensiÃ³n nominal (V)</label>
              <select value={cdV} onChange={e=>setCdv(e.target.value)} style={inp}>
                {['127','220','380','400','440','660','1000','6600','13200'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{v} V</option>)}
              </select>
        </div>
           <div><label style={lbl}>Factor de potencia (cos Ï†)</label>
              <input value={cdFP} onChange={e=>setCdfp(e.target.value)} style={inp} type="number" min="0.1" max="1" step="0.01"/>
           </div>
        </div>
        <Info t="TrifÃ¡sico: Î”V = âˆš3 Ã— L Ã— I Ã— (RÃ—cosÏ† + XÃ—sinÏ†) | R a 75Â°C: R_20 Ã— 1.216 | LÃ­mite: 4% IEC Â· 3% NEC 210.19"/>
         <Btn onClick={calcCaida} text="Calcular caÃ­da de tensiÃ³n"/>
         {resCd&&(
          <ResBox ok={resCd.ok}>
              <div style={{fontSize:12,color:resCd.ok?COLOR:'#f87171',fontWeight:700,marginBottom:14}}>
              {resCd.ok?'âœ… DENTRO DEL LÃMITE â€” IEC/NEC':'âŒ EXCEDE LÃMITE â€” Aumentar calibre o reducir longitud'}
              </div>
              <div style={g3}>
                <Card label="CaÃ­da de tensiÃ³n" val={`${resCd.dV} V`}/>
                <Card label="CaÃ­da %" val={`${resCd.pct}%`} color={resCd.ok?COLOR:'#ef4444'}/>
            <Card label="LÃ­mite mÃ¡ximo" val="4% IEC Â· 3% NEC" sub="IEC 60364 / NEC 210.19"/>
           </div>
            </ResBox>
          )}
        </div>
      )}

      {/* â•â• CORTOCIRCUITO â•â• */}
     {sub==='cc'&&(
        <div>
          <Tit t="Corriente de cortocircuito â€” IEC 60909 / IRAM 2299"/>
         <div style={g2}>
         <div><label style={lbl}>Potencia transformador (kVA)</label>
            <input value={ccS} onChange={e=>setCcs(e.target.value)} style={inp} type="number" min="1" step="25"/>
          </div>
            <div><label style={lbl}>Impedancia de cc uk (%)</label>
              <input value={ccUk} onChange={e=>setCcuk(e.target.value)} style={inp} type="number" min="1" max="20" step="0.5"/>
            <div style={{fontSize:10,color:'#334155',marginTop:4}}>DistribuciÃ³n: 4-6% Â· Alta tensiÃ³n: 8-12%</div>
            </div>
           <div><label style={lbl}>TensiÃ³n secundaria (V)</label>
             <select value={ccV} onChange={e=>setCcv(e.target.value)} style={inp}>
               {['220','380','400','440','660'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{v} V</option>)}
              </select>
           </div>
          <div><label style={lbl}>Cable al tablero principal</label>
           <select value={ccCable} onChange={e=>setCccable(e.target.value)} style={inp}>
                {Object.keys(CABLES).map(k=><option key={k} value={k} style={{background:'#0a0f1e'}}>{k}</option>)}
            </select>
          </div>
           <div><label style={lbl}>Longitud cable al tablero (m)</label>
             <input value={ccL} onChange={e=>setCcl(e.target.value)} style={inp} type="number" min="1" step="1"/>
            </div>
          </div>
          <Info t="IEC 60909: Icc = (c Ã— Un) / (âˆš3 Ã— Z_total) | c=1.1 mÃ¡ximo (selecciÃ³n interruptores) | c=0.95 mÃ­nimo (verificar disparo)"/>
        <Btn onClick={calcCC} text="Calcular corriente de cortocircuito"/>
          {resCc&&(
            <ResBox>
            <div style={{fontSize:12,color:COLOR,fontWeight:700,marginBottom:14}}>RESULTADO â€” CORTOCIRCUITO TRIFÃSICO (IEC 60909)</div>
              <div style={g3}>
                <Card label="Icc mÃ¡ximo (c=1.1)" val={`${resCc.Imax.toLocaleString()} A`} color="#ef4444" sub="Poder corte interruptores"/>
            <Card label="Icc mÃ­nimo (c=0.95)" val={`${resCc.Imin.toLocaleString()} A`} sub="Verificar disparo protecciones"/>
              <Card label="Potencia cortocircuito" val={`${resCc.Pcc.toLocaleString()} kVA`}/>
            </div>
             <Warn t="âš ï¸ Poder de corte del interruptor automÃ¡tico debe ser â‰¥ Icc mÃ¡ximo. Coordinar protecciones con ingenierÃ­a elÃ©ctrica matriculada."/>
            </ResBox>
          )}
        </div>
      )}

      {/* â•â• FACTOR DE POTENCIA â•â• */}
   {sub==='fp'&&(
       <div>
          <Tit t="Banco de capacitores â€” CorrecciÃ³n factor de potencia"/>
         <div style={g2}>
            <div><label style={lbl}>Potencia activa carga (kW)</label>
             <input value={fpP} onChange={e=>setFpp(e.target.value)} style={inp} type="number" min="1" step="10"/>
            </div>
          <div><label style={lbl}>Factor potencia actual (cos Ï†1)</label>
             <input value={fpFP1} onChange={e=>setFpfp1(e.target.value)} style={inp} type="number" min="0.1" max="0.99" step="0.01"/>
            </div>
            <div><label style={lbl}>Factor potencia deseado (cos Ï†2)</label>
              <input value={fpFP2} onChange={e=>setFpfp2(e.target.value)} style={inp} type="number" min="0.1" max="1" step="0.01"/>
            </div>
          <div><label style={lbl}>TensiÃ³n de red (V)</label>
           <select value={fpV} onChange={e=>setFpv(e.target.value)} style={inp}>
                {['220','380','400','440','660'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{v} V</option>)}
           </select>
          </div>
            <div><label style={lbl}>Frecuencia</label>
            <select value={fpF} onChange={e=>setFpf(e.target.value)} style={inp}>
               <option value="50" style={{background:'#0a0f1e'}}>50 Hz â€” Argentina, Europa, Ãfrica</option>
               <option value="60" style={{background:'#0a0f1e'}}>60 Hz â€” EE.UU., MÃ©xico, Colombia, PerÃº</option>
              </select>
            </div>
          </div>
          <Info t="Qc = P Ã— (tan Ï†1 âˆ’ tan Ï†2) kVAR | C = QcÃ—1000 / (2Ï€ Ã— f Ã— VÂ²) ÂµF por fase"/>
          <Btn onClick={calcFP} text="Calcular banco de capacitores"/>
          {resFP&&(
            <ResBox>
              <div style={{fontSize:12,color:COLOR,fontWeight:700,marginBottom:14}}>RESULTADO â€” BANCO DE CAPACITORES</div>
              <div style={g4}>
                <Card label="Potencia reactiva Qc" val={`${resFP.Qc} kVAR`}/>
                <Card label="Capacidad por fase" val={`${resFP.C} ÂµF`}/>
                <Card label="Corriente antes" val={`${resFP.I1} A`} color="#ef4444"/>
                <Card label="Corriente despuÃ©s" val={`${resFP.I2} A`} color={COLOR}/>
              </div>
              <Info t={`ReducciÃ³n de corriente: ${Math.round((1-resFP.I2/resFP.I1)*100)}% â€” Ahorro significativo en pÃ©rdidas y facturaciÃ³n elÃ©ctrica`}/>
            </ResBox>
          )}
        </div>
      )}

      {/* â•â• MOTOR â•â• */}
      {sub==='motor'&&(
        <div>
          <Tit t="Motor elÃ©ctrico trifÃ¡sico â€” NEC Art. 430 / IEC 60947 / NEMA MG1"/>
          <div style={g2}>
            <div><label style={lbl}>Potencia mecÃ¡nica en eje (kW)</label>
              <input value={mP} onChange={e=>setMp(e.target.value)} style={inp} type="number" min="0.1" step="0.5"/>
            </div>
            <div><label style={lbl}>TensiÃ³n de alimentaciÃ³n (V)</label>
              <select value={mV} onChange={e=>setMv(e.target.value)} style={inp}>
                {['220','380','400','440','660','2300','4160'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{v} V</option>)}
              </select>
            </div>
            <div><label style={lbl}>Factor de potencia motor (cos Ï†)</label>
              <input value={mFP} onChange={e=>setMfp(e.target.value)} style={inp} type="number" min="0.5" max="1" step="0.01"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>Motor industrial tÃ­pico: 0.82-0.90</div>
            </div>
            <div><label style={lbl}>Rendimiento motor (Î·)</label>
              <input value={mEta} onChange={e=>setMeta(e.target.value)} style={inp} type="number" min="0.5" max="1" step="0.01"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>IE2: 0.90-0.95 Â· IE3: 0.93-0.97</div>
            </div>
          </div>
          <Info t="I_nom = P_elec / (âˆš3 Ã— V Ã— FP) | I_arranque DOL â‰ˆ 6 Ã— I_nom | Cable: 1.25 Ã— I_nom (NEC 430.52)"/>
          <Btn onClick={calcMotor} text="Calcular motor y cable"/>
          {resMot&&(
            <ResBox>
              <div style={{fontSize:12,color:COLOR,fontWeight:700,marginBottom:14}}>RESULTADO â€” MOTOR ELÃ‰CTRICO TRIFÃSICO</div>
              <div style={g4}>
                <Card label="I nominal" val={`${resMot.Inom} A`}/>
                <Card label="I arranque DOL" val={`${resMot.Iarr} A`} color="#f59e0b" sub="â‰ˆ6 Ã— I_nom â€” NEC 430"/>
                <Card label="P elÃ©ctrica" val={`${resMot.Pelec} kW`} sub="Consumo real red"/>
                <Card label="Cable mÃ­nimo" val={resMot.calibre} sub="1.25 Ã— I_nom"/>
              </div>
              <Warn t="âš ï¸ En Zona 1/2 (IEC 60079) o DivisiÃ³n 1/2 (API RP 500): motor EX certificado obligatorio. VFD reduce Iarranque a â‰ˆ1.1 Ã— I_nom."/>
            </ResBox>
          )}
        </div>
      )}

      {/* â•â• ÃREA PELIGROSA â•â• */}
      {sub==='peligrosa'&&(
        <div>
          <Tit t="ClasificaciÃ³n de Ã¡reas peligrosas â€” IEC 60079-10-1 / API RP 500:2012 / NEC Art. 500-505"/>
          <div style={g3}>
            <div><label style={lbl}>Industria / AplicaciÃ³n</label>
              <select value={apInd} onChange={e=>setApind(e.target.value)} style={inp}>
                {['PetrÃ³leo / Gas','PerforaciÃ³n petrÃ³leo','MinerÃ­a carbÃ³n (grisÃº)','QuÃ­mica / PetroquÃ­mica','Represas (Hâ‚‚ baterÃ­as)','MMO â€” Pintura / Solventes','Gas natural licuado (GNL)'].map(i=><option key={i} value={i} style={{background:'#0a0f1e'}}>{i}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Gas / Polvo / Vapores presentes</label>
              <select value={apGas} onChange={e=>setApgas(e.target.value)} style={inp}>
                {['Metano (CHâ‚„) â€” Grupo IIA','Propano / Butano â€” Grupo IIA','Etileno â€” Grupo IIB','HidrÃ³geno (Hâ‚‚) â€” Grupo IIC','Acetileno â€” Grupo IIC','GrisÃº (minas carbÃ³n) â€” Grupo I','Polvo carbÃ³n â€” Zona 21','Gasolina / Nafta â€” Grupo IIA'].map(g=><option key={g} value={g} style={{background:'#0a0f1e'}}>{g}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Zona segÃºn frecuencia de exposiciÃ³n</label>
              <select value={apZona} onChange={e=>setApzona(e.target.value as 'zona0'|'zona1'|'zona2')} style={inp}>
                <option value="zona0" style={{background:'#0a0f1e'}}>Zona 0 / Div.1 â€” CONTINUA</option>
                <option value="zona1" style={{background:'#0a0f1e'}}>Zona 1 / Div.1 â€” OCASIONAL</option>
                <option value="zona2" style={{background:'#0a0f1e'}}>Zona 2 / Div.2 â€” INFRECUENTE</option>
              </select>
            </div>
          </div>

          <div style={{background:`${zd.color}15`,border:`1px solid ${zd.color}40`,borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{fontSize:16,fontWeight:900,color:zd.color,marginBottom:12}}>
              {zd.iec} â€” {zd.api} Â· {apInd}
            </div>
            <div style={g2}>
              <div style={{background:'#0a0f1e',borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:'#475569',textTransform:'uppercase' as const,marginBottom:4}}>DescripciÃ³n IEC 60079-10-1</div>
                <div style={{fontSize:12,color:'#f1f5f9'}}>{zd.desc}</div>
              </div>
              <div style={{background:'#0a0f1e',borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:'#475569',textTransform:'uppercase' as const,marginBottom:4}}>Equipo Ex requerido</div>
                <div style={{fontSize:12,color:zd.color,fontWeight:700}}>{zd.equipo}</div>
              </div>
            </div>
          </div>

          <div style={{background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:12,padding:16}}>
            <div style={{fontSize:11,color:COLOR,fontWeight:700,marginBottom:10}}>GRUPOS IEC 60079-0 â€” TEMPERATURA DE IGNICIÃ“N</div>
            {[
              {g:'Grupo I',    d:'GrisÃº â€” minas subterrÃ¡neas carbÃ³n',  T:'â€”',       ej:'MinerÃ­a subterrÃ¡nea'},
              {g:'Grupo IIA', d:'Propano, benceno, metano, butano',    T:'T1-T3',   ej:'PetrÃ³leo, petroquÃ­mica'},
              {g:'Grupo IIB', d:'Etileno, gas de ciudad',              T:'T1-T4',   ej:'Plantas de etileno'},
              {g:'Grupo IIC', d:'Hâ‚‚ (hidrÃ³geno), acetileno',          T:'T1-T6',   ej:'BaterÃ­as, GNL, Hâ‚‚'},
            ].map((r,i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'5px 0',borderBottom:'1px solid #0f172a'}}>
                <div style={{fontSize:11,fontWeight:700,color:COLOR,width:90,flexShrink:0}}>{r.g}</div>
                <div style={{fontSize:11,color:'#94a3b8',flex:1}}>{r.d}</div>
                <div style={{fontSize:11,color:'#64748b',width:80,flexShrink:0}}>{r.T}</div>
                <div style={{fontSize:10,color:'#334155',width:120,flexShrink:0}}>{r.ej}</div>
              </div>
            ))}
          </div>
          <Warn t="âš ï¸ La clasificaciÃ³n definitiva de Ã¡reas peligrosas requiere ingeniero matriculado y estudio de riesgo segÃºn API RP 500 / IEC 60079-10-1. Este mÃ³dulo es orientativo."/>
        </div>
      )}

      {/* â•â• ILUMINACIÃ“N â•â• */}
      {sub==='luz'&&(
        <div>
          <Tit t="DiseÃ±o de iluminaciÃ³n industrial â€” IES/IESNA Â· EN 12464-1 Â· API RP 54 Â· ISO 8995"/>
          <div style={g2}>
            <div><label style={lbl}>Tipo de recinto / AplicaciÃ³n</label>
              <select value={lApp} onChange={e=>setLapp(e.target.value)} style={inp}>
                {Object.entries(LUX_APP).map(([k,v])=><option key={k} value={k} style={{background:'#0a0f1e'}}>{v.sector} â€” ({v.lux} lux) Â· {v.norma}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Ãrea a iluminar (mÂ²)</label>
              <input value={lArea} onChange={e=>setLarea(e.target.value)} style={inp} type="number" min="1" step="1"/>
            </div>
            <div><label style={lbl}>Flujo luminoso por luminaria (lm)</label>
              <input value={lLm} onChange={e=>setLlm(e.target.value)} style={inp} type="number" min="100" step="100"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>LED 50Wâ‰ˆ5000lm Â· LED 100Wâ‰ˆ10000lm Â· HPS 250Wâ‰ˆ27000lm</div>
            </div>
            <div><label style={lbl}>Eficiencia luminaria (Î·)</label>
              <input value={lEta} onChange={e=>setLeta(e.target.value)} style={inp} type="number" min="0.3" max="1" step="0.05"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>LED moderno: 0.85 Â· Convencional: 0.65</div>
            </div>
            <div><label style={lbl}>Factor de mantenimiento (MF)</label>
              <input value={lMF} onChange={e=>setLmf(e.target.value)} style={inp} type="number" min="0.5" max="1" step="0.05"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>Limpio: 0.80 Â· Industrial: 0.65 Â· MinerÃ­a: 0.60</div>
            </div>
          </div>
          <Info t={`Iluminancia requerida: ${LUX_APP[lApp].lux} lux â€” ${LUX_APP[lApp].norma} | N = (E Ã— A) / (Î¦ Ã— Î· Ã— MF Ã— CU) | CU=0.60`}/>
          <Btn onClick={calcLuz} text="Calcular nÃºmero de luminarias"/>
          {resLuz&&(
            <ResBox ok={resLuz.ok}>
              <div style={{fontSize:12,color:resLuz.ok?COLOR:'#f87171',fontWeight:700,marginBottom:14}}>
                {resLuz.ok?'âœ… DISEÃ‘O CUMPLE NORMATIVA':'âŒ INSUFICIENTE â€” Agregar luminarias o aumentar potencia'}
              </div>
              <div style={g3}>
                <Card label="Luminarias necesarias" val={`${resLuz.N} unidades`}/>
                <Card label="Iluminancia real" val={`${resLuz.luxReal} lux`} color={resLuz.ok?COLOR:'#ef4444'}/>
                <Card label="Requerimiento normativo" val={`${LUX_APP[lApp].lux} lux mÃ­n.`} sub={LUX_APP[lApp].norma}/>
              </div>
            </ResBox>
          )}
        </div>
      )}

      {/* â•â• TRANSFORMADOR â•â• */}
      {sub==='trafo'&&(
        <div>
          <Tit t="Dimensionamiento de transformador â€” IEC 60076 / IEEE C57 / CIRSOC"/>
          <div style={g2}>
            <div><label style={lbl}>Potencia total de carga (kW)</label>
              <input value={trP} onChange={e=>setTrp(e.target.value)} style={inp} type="number" min="1" step="10"/>
            </div>
            <div><label style={lbl}>Factor de potencia de la carga</label>
              <input value={trFP} onChange={e=>setTrfp(e.target.value)} style={inp} type="number" min="0.5" max="1" step="0.01"/>
            </div>
            <div><label style={lbl}>Eficiencia transformador (Î·)</label>
              <input value={trEta} onChange={e=>setTreta(e.target.value)} style={inp} type="number" min="0.85" max="1" step="0.005"/>
              <div style={{fontSize:10,color:'#334155',marginTop:4}}>DistribuciÃ³n: 0.97-0.99 (IEC 60076)</div>
            </div>
            <div><label style={lbl}>TensiÃ³n primaria (kV)</label>
              <select value={trVp} onChange={e=>setTrvp(e.target.value)} style={inp}>
                {['2300','4160','6600','13200','22000','33000','66000','132000'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{(parseInt(v)/1000).toFixed(1)} kV</option>)}
              </select>
            </div>
            <div><label style={lbl}>TensiÃ³n secundaria (V)</label>
              <select value={trVs} onChange={e=>setTrvs(e.target.value)} style={inp}>
                {['220','380','400','440','660','1000'].map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{v} V</option>)}
              </select>
            </div>
          </div>
          <Info t="S = P / (FP Ã— Î·) kVA | I_p = S / (âˆš3 Ã— Vp) | I_s = S / (âˆš3 Ã— Vs) | I_inrush â‰ˆ 10 Ã— I_s (IEC 60076)"/>
          <Btn onClick={calcTrafo} text="Dimensionar transformador"/>
          {resTr&&(
            <ResBox>
              <div style={{fontSize:12,color:COLOR,fontWeight:700,marginBottom:14}}>RESULTADO â€” TRANSFORMADOR (IEC 60076 / IEEE C57)</div>
              <div style={g4}>
                <Card label="Potencia aparente S" val={`${resTr.S} kVA`} sub="Seleccionar comercial â‰¥ este valor"/>
                <Card label="Corriente primaria" val={`${resTr.Ip} A`} sub={`${(parseInt(trVp)/1000).toFixed(1)} kV`}/>
                <Card label="Corriente secundaria" val={`${resTr.Is} A`} sub={`${trVs} V nominal`}/>
                <Card label="Corriente inrush" val={`${resTr.Iarr} A`} color="#f59e0b" sub="â‰ˆ10 Ã— I_sec â€” IEC 60076"/>
              </div>
              <Warn t="âš ï¸ Seleccionar potencia comercial estÃ¡ndar inmediatamente superior. Proteger con interruptor termomagnÃ©tico y relÃ© diferencial. Verificar cortocircuito en secundario."/>
            </ResBox>
          )}
        </div>
      )}
    </div>
  );
}
