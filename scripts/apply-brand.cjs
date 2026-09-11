#!/usr/bin/env node
const fs=require('fs'),path=require('path'),cp=require('child_process');
function arg(n){const i=process.argv.indexOf('--'+n);if(i<0||!process.argv[i+1])throw Error('Missing --'+n);return path.resolve(process.argv[i+1]);}
const root=arg('release'),dir=arg('brand'),brand=JSON.parse(fs.readFileSync(path.join(dir,'brand.json'),'utf8'));
const svg=fs.readFileSync(path.join(dir,brand.logo||'logo.svg'),'utf8');
if(!/<svg\b/.test(svg)||/<script\b|<foreignObject\b|\son\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|javascript:)/i.test(svg))throw Error('Use a self-contained SVG without scripts or external resources');
const name=brand.name||'Chongming DSH Starter',word=brand.wordmark||'Chongming',headline=brand.headline||'配置自己的模型，开始工作';
const dist=path.join(root,'dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist');
const bundle=path.join(dist,'assets/index-ClqxG24t.js');let text=fs.readFileSync(bundle,'utf8');
// Skip the entire destructured parameter list before locating the function body.
function endBalanced(s,start,open,close){let depth=0,quote=null,escape=false;for(let i=start;i<s.length;i++){
 const c=s[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue;}
 if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c===open)depth++;if(c===close&&!--depth)return i;
}throw Error('Unbalanced pinned bundle function');}
function replaceFunction(n,body){const marker='function '+n+'(';const start=text.indexOf(marker);if(start<0||text.indexOf(marker,start+1)>=0)throw Error('Unsupported bundle: '+n);
 const pend=endBalanced(text,start+marker.length-1,'(',')');let brace=pend+1;while(/\s/.test(text[brace]))brace++;if(text[brace]!=='{')throw Error('Expected body');const end=endBalanced(text,brace,'{','}');text=text.slice(0,start)+body+text.slice(end+1);
}
const old=text.slice(text.indexOf('function lf('),text.indexOf('function lf(')+250);
const jsx=old.match(/([A-Za-z_$][\w$]*)\.(?:jsx|jsxs)\(/)?.[1];if(!jsx)throw Error('Cannot identify JSX runtime');
const data='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
replaceFunction('lf',`function lf({size:n=24,className:i}){return ${jsx}.jsx("svg",{width:n,height:n,viewBox:"0 0 128 128",className:i,children:${jsx}.jsx("image",{href:${JSON.stringify(data)},width:128,height:128})})}`);
replaceFunction('sf',`function sf({size:n=24,className:i,includeMark:l=!0}){return ${jsx}.jsx("svg",{width:n*5,height:n,viewBox:"0 0 240 48",className:i,children:${jsx}.jsx("text",{x:0,y:35,fill:"currentColor",fontSize:34,fontFamily:"Segoe UI,Microsoft YaHei,sans-serif",children:${JSON.stringify(word)}})})}`);
const check=path.join(root,'.brand-check.mjs');fs.writeFileSync(check,text);try{cp.execFileSync(path.join(root,'dsh/node.exe'),['--check',check]);}finally{fs.unlinkSync(check);}
fs.writeFileSync(bundle,text);
const primitives=path.join(root,'dsh/node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/index.js');
text=fs.readFileSync(primitives,'utf8');
replaceFunction('FishLogo',`function FishLogo({size=24,className}){return jsx("svg",{width:size,height:size,className,viewBox:"0 0 128 128",children:jsx("image",{href:${JSON.stringify(data)},width:128,height:128})})}`);
replaceFunction('BrandWordmark',`function BrandWordmark({size=24,className,includeMark=true}){return jsx("svg",{width:size*5,height:size,className,viewBox:"0 0 240 48",children:jsx("text",{x:0,y:35,fill:"currentColor",fontSize:34,children:${JSON.stringify(word)}})})}`);
fs.writeFileSync(primitives,text);
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');html=html.replace(/<title>.*?<\/title>/,()=>'<title>'+name.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</title>');fs.writeFileSync(path.join(dist,'index.html'),html);
fs.writeFileSync(path.join(dist,'favicon.svg'),svg);
const mp=path.join(dist,'manifest.webmanifest');const m=JSON.parse(fs.readFileSync(mp));m.name=name;m.short_name=word;fs.writeFileSync(mp,JSON.stringify(m,null,2));
const renderer=path.join(root,'dsh/node_modules/@deepseek-ai/dsh-client-ui-renderer/lib/client.js');let r=fs.readFileSync(renderer,'utf8');r=r.replace(/const productTitle = "[^"\n]*"/,()=>`const productTitle = ${JSON.stringify(name)}`);fs.writeFileSync(renderer,r);
const conv=path.join(root,'dsh/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js');let c=fs.readFileSync(conv,'utf8');c=c.replace(/"hero.headline":\s*"(?:\\.|[^"\\])*"/g,()=>`"hero.headline": ${JSON.stringify(headline)}`);fs.writeFileSync(conv,c);
console.log(JSON.stringify({status:'PASS',name,wordmark:word,bundleSyntax:'PASS'}));
