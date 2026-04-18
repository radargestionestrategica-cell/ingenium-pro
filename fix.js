const fs=require("fs");const c=`"use client";
import{useState}from"react";
function calcMAOP(OD,t,SMYS,F=0.72,E=1.0,T=20){
  if(OD<=0||t<=0||SMYS<=0||t>=OD/2)return null;
  const Tf=T<=120?1.0:T<=150?0.967:T<=175?0.933:T<=200?0.900:0.867;
  const r=t/OD,ro=OD/2,ri=ro-t;
  const Pb=(2*SMYS*t*F*E*Tf)/OD;
  const Pl=SMYS*F*E*Tf*(ro*ro-ri*ri)/(ro*ro+ri*ri);
  const P=r>0.15?Pl:r>0.10?Pb*(1-(r-0.10)/0.05)+Pl*(r-0.10)/0.05:Pb;
  return{P:+P.toFixed(3),bar:+(P*10).toFixed(2),psi:+(P*145).toFixed(0),reg:r>0.15?"PARED GRUESA Lame":r>0.10?"TRANSICION":"PARED DELGADA Barlow",ratio:+(r*100).toFixed(1)};
}
export default function ModuloPetroleo(){
  const[OD,setOD]=require("react").useState("");
  const[t,sett]=require("react").useState("");
  const[SMYS,setSMYS]=require("react").useState("");
  const[F,setF]=require("react").useState("0.72");
  const[res,setRes]=require("react").useState(null);
  const[err,setErr]=require("react").useState("");
  function calcular(){
    setErr("");setRes(null);
    const r=calcMAOP(+OD,+t,+SMYS,+F);
    if(!r){setErr("Datos invalidos. Verificar OD, t, SMYS mayores a 0 y t menor a OD/2");return;}
    setRes(r);
  }
  return null;
}`;fs.writeFileSync("components/ModuloPetroleo.tsx",c,"utf8");console.log("OK");
