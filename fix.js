const fs=require('fs');
let c=fs.readFileSync('app/page.tsx','utf8');
c=c.replace(
  "const [moduloActivo, setModuloActivo] = useState('chat');",
  "const [moduloActivo, setModuloActivo] = useState('petróleo');"
);
fs.writeFileSync('app/page.tsx',c,'utf8');
console.log('OK');
