const fs=require('fs'),path=require('path'),http=require('http'),{fork,spawn}=require('child_process'),assert=require('assert');
const root=path.resolve(process.argv[2]),home=path.resolve(process.argv[3]);
fs.mkdirSync(home,{recursive:true});const env={...process.env};for(const k of Object.keys(env))if(/API.?KEY|TOKEN|SECRET|CODEX_HOME|OPENAI|DSH_HOME/i.test(k))delete env[k];
Object.assign(env,{DSH_HOME:home,CODEX_HOME:path.join(home,'codex'),CHONGMING_LOCAL_RELAY_TOKEN:'offline-local-test',CHONGMING_INSTANCE:'offline-protocol-test',CHONGMING_TEST_MODE:'1',NO_PROXY:'127.0.0.1,localhost',no_proxy:'127.0.0.1,localhost'});
let relay,codex,mock;const result={test:'Offline protocol checks; not a real model test',checks:[]};
async function main(){
 relay=fork(path.join(root,'relay.cjs'),[],{execPath:path.join(root,'dsh/node.exe'),env,windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
 const port=await new Promise((resolve,reject)=>{relay.once('message',m=>resolve(m.port));relay.once('exit',()=>reject(Error('Relay exited')));});
 const url=`http://127.0.0.1:${port}`,headers={'content-type':'application/json',authorization:'Bearer offline-local-test'};
 assert.equal((await fetch(url+'/v1/responses',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,401);result.checks.push('unauthorized local request rejected');
 fs.writeFileSync(path.join(home,'codex-relay.json'),JSON.stringify({baseUrl:'https://api.deepseek.com/v1',model:'deepseek-v4-pro',credentialRef:'DEEPSEEK_API_KEY'}));
 const missing=await fetch(url+'/v1/responses',{method:'POST',headers,body:'{}'});assert.equal(missing.status,401);assert((await missing.text()).includes('请先'));result.checks.push('missing employee key returns actionable error without upstream request');
 let upstreamCalls=0,holdNext=false;
 mock=http.createServer((req,res)=>{let text='';req.on('data',b=>text+=b);req.on('end',()=>{try{const body=JSON.parse(text);assert.equal(req.headers.authorization,'Bearer offline-fixture-not-a-real-key');assert.equal(body.model,'fixture-model');upstreamCalls++;
 if(holdNext){res.writeHead(200,{'content-type':'text/event-stream'});res.write(': waiting\n\n');return;}
 if(body.stream){res.writeHead(200,{'content-type':'text/event-stream'});for(const delta of [{role:'assistant',content:''},{content:'CHONGMING_OFFLINE_OK'}])res.write('data: '+JSON.stringify({id:'fixture',object:'chat.completion.chunk',created:1,model:'fixture-model',choices:[{index:0,delta,finish_reason:null}]})+'\n\n');res.write('data: '+JSON.stringify({id:'fixture',object:'chat.completion.chunk',created:1,model:'fixture-model',choices:[{index:0,delta:{},finish_reason:'stop'}],usage:{prompt_tokens:1,completion_tokens:1,total_tokens:2}})+'\n\n');res.end('data: [DONE]\n\n');}
 else{res.setHeader('content-type','application/json');res.end(JSON.stringify({id:'fixture',object:'chat.completion',created:1,model:'fixture-model',choices:[{index:0,message:{role:'assistant',content:'CHONGMING_OFFLINE_OK'},finish_reason:'stop'}],usage:{prompt_tokens:1,completion_tokens:1,total_tokens:2}}));}
 }catch{res.writeHead(500);res.end('fixture failure');}});});await new Promise(r=>mock.listen(0,'127.0.0.1',r));
 fs.writeFileSync(path.join(home,'.credentials.yaml'),'version: 1\nrefs:\n  DEEPSEEK_API_KEY: offline-fixture-not-a-real-key\n');fs.writeFileSync(path.join(home,'codex-relay.json'),JSON.stringify({baseUrl:`http://127.0.0.1:${mock.address().port}/v1`,model:'fixture-model',credentialRef:'DEEPSEEK_API_KEY'}));
 const response=await fetch(url+'/v1/responses',{method:'POST',headers,body:JSON.stringify({model:'gpt-5.2',input:'fixture',stream:false})});assert.equal(response.status,200);assert((await response.text()).includes('CHONGMING_OFFLINE_OK'));result.checks.push('employee credential reread and Responses-to-Chat translation against localhost fixture');
 fs.mkdirSync(env.CODEX_HOME,{recursive:true});fs.writeFileSync(path.join(env.CODEX_HOME,'config.toml'),`model = "gpt-5.2"\nmodel_provider = "relay"\n[model_providers.relay]\nname = "relay"\nbase_url = "${url}/v1"\nwire_api = "responses"\nenv_key = "CHONGMING_LOCAL_RELAY_TOKEN"\n`);
 codex=spawn(path.join(root,'dsh/node.exe'),[path.join(root,'dsh/node_modules/@openai/codex/bin/codex.js'),'app-server','--stdio'],{cwd:home,env,windowsHide:true,stdio:['pipe','pipe','pipe']});
 let seq=0,buffer='';const pending=new Map(),events=[];codex.stdout.on('data',b=>{buffer+=b;let idx;while((idx=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,idx);buffer=buffer.slice(idx+1);let msg;try{msg=JSON.parse(line);}catch{continue;}if(msg.id!==undefined&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(Error(JSON.stringify(msg.error))):p.resolve(msg.result);}else events.push(msg);}});codex.stderr.on('data',()=>{});
 function rpc(method,params){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>reject(Error('RPC timeout: '+method)),20000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});codex.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});}
 await rpc('initialize',{clientInfo:{name:'lanwei-offline-test',title:'Lanwei offline test',version:'1'},capabilities:{experimentalApi:false}});codex.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'initialized'})+'\n');result.checks.push('bundled Codex 0.147.0 app-server initialize');
 const thread=await rpc('thread/start',{cwd:home,ephemeral:true,approvalPolicy:'never',sandbox:'workspace-write'});assert.equal(thread.thread.ephemeral,true);result.checks.push('isolated ephemeral Codex thread created');
 await rpc('turn/start',{threadId:thread.thread.id,input:[{type:'text',text:'Reply with CHONGMING_OFFLINE_OK.',text_elements:[]}]});
 let completed;for(let i=0;i<100;i++){completed=events.find(e=>e.method==='turn/completed');if(completed)break;await new Promise(r=>setTimeout(r,200));}assert(completed,'turn did not complete');assert.equal(completed.params.turn.status,'completed');assert(JSON.stringify(events).includes('CHONGMING_OFFLINE_OK'));result.checks.push('Codex -> local relay -> localhost chat fixture -> completed turn');result.upstreamCalls=upstreamCalls;
 holdNext=true;events.length=0;const next=await rpc('turn/start',{threadId:thread.thread.id,input:[{type:'text',text:'Cancellation fixture.',text_elements:[]}]});
 for(let i=0;i<40&&upstreamCalls<3;i++)await new Promise(r=>setTimeout(r,50));
 result.cancelStartStatus=next.turn.status;result.cancelEvents=events.filter(e=>e.method==='turn/completed'||e.method==='error');
 await rpc('turn/interrupt',{threadId:thread.thread.id,turnId:next.turn.id});
 let canceled;for(let i=0;i<50;i++){canceled=events.find(e=>e.method==='turn/completed');if(canceled)break;await new Promise(r=>setTimeout(r,100));}assert.equal(canceled?.params.turn.status,'interrupted');result.checks.push('Codex turn cancellation acknowledged');result.status='PASS';
}
const watchdog=setTimeout(()=>{result.status='FAIL';result.error='global timeout';finish();},60000);
function finish(){clearTimeout(watchdog);codex?.kill();relay?.kill();mock?.close();fs.writeFileSync(path.resolve(process.argv[4]),JSON.stringify(result,null,2));console.log(JSON.stringify(result));setTimeout(()=>process.exit(result.status==='PASS'?0:1),500);}
main().then(finish).catch(e=>{result.status='FAIL';result.error=e.message;finish();});

