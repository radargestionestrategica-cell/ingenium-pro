'use client';
import { useState } from 'react';

function calcMAOP(OD:number,t:number,SMYS:number,F=0.72,E=1.0,T=20){
  if(OD<=0||t<=0||SMYS<=0||t>=OD/2)return null;
  const Tf=T<=120?1.0:T<=150?0.967:T<=175?0.933:T<=200?0.900:0.867;
  const r=t/OD,ro=OD/2,ri=ro-t;
  const Pb=(2*SMYS*t*F*E*Tf)/OD;
  const Pl=SMYS*F*E*Tf*(ro**2-ri**2)/(ro**2+ri**2);
  const P=r>0.15?Pl:r>0.10?Pb*(1-(r-0.10)/0.05)+Pl*(r-0.10)/0.05:Pb;
  return{P:+P.toFixed(3),bar:+(P*10).toFixed(2),psi:+(P*145).toFixed(0),reg:r>0.15?'PARED GRUESA Lame':r>0.10?'TRANSICION':'PARED DELGADA Barlow',ratio:+(r*100).toFixed(1)};
}

export default function ModuloPetroleo(){
  const[OD,setOD]=useState('');
  const[t,sett]=useState('');
  const[SMYS,setSMYS]=useState('');
  const[F,setF]=useState('0.72');
  const[E,setE]=useState('1.0');
  const[T,setT]=useState('20');
  const[res,setRes]=useState<any>(null);
  const[err,setErr]=useState('');

  function calcular(){
    setErr('');setRes(null);
    const r=calcMAOP(+OD,+t,+SMYS,+F,+E,+T);
    if(!r){setErr('Datos invalidos. Verificar OD>0, t>0, SMYS>0, t<OD/2');return;}
    setRes(r);
  }

  return(
    <div style={{flex:1,overflowY:'auto',padding:24,color:'white'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',color:'#a78bfa',marginBottom:4}}>Petroleo y Gas</h2>
        <p style={{color:'#94a3b8',fontSize:13,marginBottom:20}}>ASME B31.8 | API 5L | API 579</p>
        <div style={{background:'#0f172a',borderRadius:12,padding:24,border:'1px solid #1e293b'}}>
          <h3 style={{fontSize:15,fontWeight:'bold',marginBottom:4,color:'#e2e8f0'}}>MAOP — Presion Maxima Operativa</h3>
          <p style={{color:'#64748b',fontSize:12,marginBottom:20}}>ASME B31.8 Sec. 841.11 — Barlow modificado y Lame pared gruesa</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            {([['OD (mm)',OD,setOD,'219.1'],['t (mm)',t,sett,'8.18'],['SMYS (MPa)',SMYS,setSMYS,'359'],['Factor F',F,setF,'0.72'],['Factor E junta',E,setE,'1.0'],['Temp (C)',T,setT,'20']] as [string,string,Function,string][]).map(([lb,vl,st,ph])=>(
              <div key={lb}>
                <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>{lb}</label>
                <input value={vl} onChange={e=>st(e.target.value)} placeholder={ph} style={{width:'100%',background:'#1e293b',border:'1px solid #334155',borderRadius:6,padding:'8px 10px',color:'white',fontSize:13,boxSizing:'border-box'}}/>
              </div>
            ))}
          </div>
          <button onClick={calcular} style={{width:'100%',padding:12,background:'linear-gradient(135deg,#7c3aed,#06b6d4)',borderRadius:8,border:'none',color:'white',fontWeight:'bold',fontSize:14,cursor:'pointer',marginBottom:16}}>Calcular MAOP</button>
          {err&&<div style={{background:'#450a0a',border:'1px solid #dc2626',borderRadius:8,padding:12,color:'#fca5a5',fontSize:13,marginBottom:12}}>{err}</div>}
          {res&&(
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:20}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
                {([['MPa',res.P,'#a78bfa'],['bar',res.bar,'#06b6d4'],['psi',res.psi,'#10b981']] as [string,any,string][]).map(([u,v,c])=>(
                  <div key={u} style={{background:'#0f172a',borderRadius:8,padding:12,textAlign:'center'}}>
                    <div style={{fontSize:22,fontWeight:'bold',color:c}}>{v}</div>
                    <div style={{fontSize:11,color:'#64748b'}}>{u}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                  <div style={{fontSize:11,color:'#64748b'}}>Regimen</div>
                  <div style={{fontSize:13,fontWeight:'bold'}}>{res.reg}</div>
                </div>
                <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                  <div style={{fontSize:11,color:'#64748b'}}>Relacion t/D</div>
                  <div style={{fontSize:13,fontWeight:'bold'}}>{res.ratio}%</div>
                </div>
              </div>
              <div style={{padding:10,background:'#1e293b',borderRadius:8,fontSize:11,color:'#94a3b8'}}>
                Normativa: ASME B31.8 Sec. 841.11 | F={F} | E={E} | T={T}C
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}