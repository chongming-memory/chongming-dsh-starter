const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {createRequire}=require('module');
const crypto=require('crypto');
const root=__dirname, home=process.env.DSH_HOME;
const requireProxy=createRequire(path.join(root,'runtime/codexproxy/node_modules/@lininn/codex-proxy/package.json'));
const express=requireProxy('express');
const yaml=require(path.join(root,'dsh/node_modules/js-yaml'));
async function main(){
 const {handleResponses,setLogFn}=await import(pathToFileURL(path.join(root,'runtime/codexproxy/node_modules/@lininn/codex-proxy/dist/src/proxy.js')).href);
 setLogFn(()=>{}); // Never record prompts, file content, headers, or upstream error bodies.
 const app=express();app.use(express.json({limit:'10mb'}));
 app.get('/health',(_req,res)=>res.json({service:'chongming-relay',instance:process.env.CHONGMING_INSTANCE}));
 app.use((req,res,next)=>{const a=Buffer.from(req.headers.authorization||''),b=Buffer.from('Bearer '+process.env.CHONGMING_LOCAL_RELAY_TOKEN);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:'Local relay authorization required'});next();});
 app.post('/_stop',(_req,res)=>{res.json({stopping:true});process.send?.({shutdown:true});});
 app.post('/v1/responses',async(req,res)=>{try{
  const cfg=JSON.parse(fs.readFileSync(path.join(home,'codex-relay.json'),'utf8'));
  const creds=fs.existsSync(path.join(home,'.credentials.yaml'))?yaml.load(fs.readFileSync(path.join(home,'.credentials.yaml'),'utf8')):{};
  const key=creds?.refs?.[cfg.credentialRef];
  if(typeof key!=='string'||!key.trim())return res.status(401).json({error:'请先在 DSH 设置中配置 '+cfg.credentialRef+'，然后重试 Codex。'});
  const url=new URL(cfg.baseUrl);if(url.protocol!=='https:' && !(process.env.CHONGMING_TEST_MODE==='1'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('HTTPS upstream required');
  const config={defaultProvider:'employee',providers:[{name:'employee',providerType:'chat',apiKey:key,baseUrl:cfg.baseUrl,defaultModel:cfg.model}]};
  const abort=new AbortController();res.once('close',()=>abort.abort());
  await handleResponses(req,res,config,(url,options)=>fetch(url,{...options,signal:abort.signal}));
 }catch{if(!res.headersSent)res.status(500).json({error:'Codex 接入配置读取失败，请检查 codex-relay.json。'});else res.end();}});
 const server=app.listen(0,'127.0.0.1',()=>process.send?.({port:server.address().port}));
 process.on('disconnect',()=>server.close(()=>process.exit(0)));
}
main().catch(()=>{console.error('Relay startup failed');process.exit(1);});
