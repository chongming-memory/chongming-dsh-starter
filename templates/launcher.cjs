const fs=require('fs'),path=require('path'),net=require('net'),crypto=require('crypto');
const {spawn,fork}=require('child_process');
const root=__dirname;
const home=path.resolve(process.env.CHONGMING_DATA_HOME||path.join(root,'.dshcfg'));
const instance=crypto.randomUUID();
const node=path.join(root,'dsh/node.exe');
const port=Number(process.env.CHONGMING_PORT||43121);
const env={...process.env};
for(const k of Object.keys(env))if(/(?:API[_-]?KEY|ACCESS_TOKEN|AUTH_TOKEN|SECRET_KEY|DSH_HOME|CODEX_HOME|CODEXPROXY_HOME|OPENAI_BASE_URL|DSH_AGENTS_HOME)/i.test(k))delete env[k];
Object.assign(env,{DSH_HOME:home,CODEX_HOME:path.join(home,'codex'),DSH_AGENTS_HOME:path.join(home,'company-agents'),CHONGMING_LOCAL_RELAY_TOKEN:crypto.randomBytes(32).toString('hex'),CHONGMING_INSTANCE:instance,NO_PROXY:'127.0.0.1,localhost',no_proxy:'127.0.0.1,localhost'});
function seed(src,dest){fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.copyFileSync(path.join(root,'templates',src),dest);}
async function freePort(){await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(Error('端口已占用，请关闭此用户版实例或设置 CHONGMING_PORT。')));s.listen(port,'127.0.0.1',()=>s.close(resolve));});}
let relay,child,closing=false;
function stop(code=0){if(closing)return;closing=true;for(const p of [child,relay])if(p?.pid)spawn('taskkill',['/PID',String(p.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});try{const p=JSON.parse(fs.readFileSync(path.join(home,'launcher.pid.json')));if(p.instance===instance)fs.unlinkSync(path.join(home,'launcher.pid.json'));}catch{}setTimeout(()=>process.exit(code),600);}
async function main(){
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');await freePort();
 fs.mkdirSync(home,{recursive:true});
 seed('settings.yaml',path.join(home,'settings.yaml'));seed('relay.json',path.join(home,'codex-relay.json'));seed('hub.json',path.join(home,'hub/config.json'));
 seed('profile.json',path.join(home,'profiles/web/package.json'));seed('profile.patch.yml',path.join(home,'profiles/web/cordis.patch.yml'));
 for(const f of ['agent.cordis.yml','preset.yml'])seed('standard-codex/'+f,path.join(home,'.agent-presets/standard-codex',f));
 fs.mkdirSync(path.join(home,'codex'),{recursive:true});
 relay=fork(path.join(root,'relay.cjs'),[],{execPath:node,env,cwd:root,windowsHide:true,stdio:['ignore','ignore','pipe','ipc']});
 relay.stderr.on('data',()=>console.error('Codex 本地接入服务发生错误。'));
 const relayPort=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Relay startup timeout')),15000);relay.once('message',m=>{clearTimeout(t);resolve(m.port);});relay.once('exit',()=>{clearTimeout(t);reject(Error('Relay exited'));});});
 // This file is managed. Employee credentials stay in DSH's separate credential store.
 fs.writeFileSync(path.join(home,'codex/config.toml'),`# Managed by Chongming launcher; upstream is configured in ../codex-relay.json\nmodel = "gpt-5.2"\nmodel_provider = "chongming_relay"\nsandbox_mode = "workspace-write"\napproval_policy = "never"\n[model_providers.chongming_relay]\nname = "Chongming local relay"\nbase_url = "http://127.0.0.1:${relayPort}/v1"\nwire_api = "responses"\nenv_key = "CHONGMING_LOCAL_RELAY_TOKEN"\n`);
 child=spawn(node,[path.join(root,'dsh/node_modules/@deepseek-ai/dsh/lib/bin.js'),'web','--port',String(port),'--no-open'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 const redact=b=>b.toString().replace(/sk-[A-Za-z0-9_-]{8,}/g,'[REDACTED]');child.stdout.on('data',b=>process.stdout.write(redact(b)));child.stderr.on('data',b=>process.stderr.write(redact(b)));
 child.once('error',()=>stop(1));child.once('exit',code=>stop(code||0));relay.once('exit',()=>stop(1));
 relay.on('message',m=>{if(m.shutdown)stop();});
 fs.writeFileSync(path.join(home,'launcher.pid.json'),JSON.stringify({pid:process.pid,childPid:child.pid,relayPid:relay.pid,instance,port,relayPort,root,controlToken:env.CHONGMING_LOCAL_RELAY_TOKEN}));
 console.log(`Chongming DSH Starter： http://127.0.0.1:${port}\n首次使用请进入设置填写自己的 DeepSeek API Key；DSH 与 Codex 共用这份用户凭据。`);
 for(let i=0;i<90&&!closing;i++){try{const r=await fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(1000)});if(r.ok){if(process.env.CHONGMING_NO_OPEN!=='1')spawn('cmd',['/c','start','',`http://127.0.0.1:${port}`],{windowsHide:true,stdio:'ignore'}).unref();return;}}catch{}await new Promise(r=>setTimeout(r,500));}
 if(!closing)throw Error('DSH startup timeout');
}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
main().catch(e=>{console.error(e.message);stop(1);});
